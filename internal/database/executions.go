package database

import (
	"database/sql"
	"errors"
	"math"
	"time"

	"crm-terceirizados/internal/model"
)

var (
	ErrExecutionNotFound = errors.New("execution not found")
	ErrExecutionActive   = errors.New("execution already active")
	ErrExecutionState    = errors.New("invalid execution state")
)

func (d *DB) StartExecution(professionalID, serviceID string, now time.Time) (model.TimerState, model.ServiceExecution, error) {
	tx, err := d.conn.Begin()
	if err != nil {
		return model.TimerState{}, model.ServiceExecution{}, err
	}
	defer func() { _ = tx.Rollback() }()

	var active bool
	var executionID string
	err = tx.QueryRow("SELECT active, COALESCE(execution_id, '') FROM provider_timer_state WHERE professional_id = $1", professionalID).Scan(&active, &executionID)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return model.TimerState{}, model.ServiceExecution{}, err
	}
	if active && executionID != "" {
		return model.TimerState{}, model.ServiceExecution{}, ErrExecutionActive
	}
	// An old per-provider timer may predate executions and has no execution_id.
	// It cannot be completed safely, so the new execution replaces that orphaned state.

	var serviceName string
	var rate float64
	if err := tx.QueryRow("SELECT name, rate FROM service_options WHERE id = $1 AND active = true", serviceID).Scan(&serviceName, &rate); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return model.TimerState{}, model.ServiceExecution{}, ErrExecutionNotFound
		}
		return model.TimerState{}, model.ServiceExecution{}, err
	}
	rateCents := int64(math.Round(rate * 100))
	if rateCents <= 0 {
		return model.TimerState{}, model.ServiceExecution{}, ErrExecutionState
	}

	execution := model.ServiceExecution{
		ID:              randomID(),
		ServiceID:       serviceID,
		ServiceName:     serviceName,
		ProfessionalID:  professionalID,
		StartedAt:       now,
		HourlyRateCents: rateCents,
		Status:          model.ExecutionInProgress,
	}
	if _, err := tx.Exec(`INSERT INTO service_executions
		(id, service_id, professional_id, started_at, hourly_rate_cents, status)
		VALUES ($1, $2, $3, $4, $5, $6)`, execution.ID, serviceID, professionalID, now, rateCents, execution.Status); err != nil {
		return model.TimerState{}, model.ServiceExecution{}, err
	}
	if _, err := tx.Exec(`INSERT INTO provider_timer_state (professional_id, active, service_id, execution_id, started_at, paused_at, elapsed_seconds)
		VALUES ($1, true, $2, $3, $4, NULL, 0)
		ON CONFLICT (professional_id) DO UPDATE SET active = true, service_id = EXCLUDED.service_id, execution_id = EXCLUDED.execution_id, started_at = EXCLUDED.started_at, paused_at = NULL, elapsed_seconds = 0`, professionalID, serviceID, execution.ID, now); err != nil {
		return model.TimerState{}, model.ServiceExecution{}, err
	}
	if err := tx.Commit(); err != nil {
		return model.TimerState{}, model.ServiceExecution{}, err
	}
	return model.TimerState{Active: true, ServiceID: serviceID, ExecutionID: execution.ID, StartedAt: now}, execution, nil
}

func (d *DB) capElapsedAtExecutionLifetime(executionID, professionalID string, elapsed int64, now time.Time) (int64, error) {
	var startedAt time.Time
	if err := d.conn.QueryRow("SELECT started_at FROM service_executions WHERE id = $1 AND professional_id = $2", executionID, professionalID).Scan(&startedAt); err != nil {
		return 0, ErrExecutionNotFound
	}
	maxElapsed := int64(now.Sub(startedAt).Seconds())
	if maxElapsed < 0 {
		return 0, ErrExecutionState
	}
	if elapsed > maxElapsed {
		return maxElapsed, nil
	}
	return elapsed, nil
}

func (d *DB) PauseExecution(professionalID string, now time.Time) (model.TimerState, error) {
	timer, err := d.GetTimerState(professionalID)
	if err != nil {
		return model.TimerState{}, err
	}
	if !timer.Active || timer.ExecutionID == "" {
		return model.TimerState{}, ErrExecutionState
	}
	elapsed := timer.ElapsedSeconds + int64(math.Round(now.Sub(timer.StartedAt).Seconds()))
	if elapsed < timer.ElapsedSeconds {
		return model.TimerState{}, ErrExecutionState
	}
	elapsed, err = d.capElapsedAtExecutionLifetime(timer.ExecutionID, professionalID, elapsed, now)
	if err != nil {
		return model.TimerState{}, err
	}
	if _, err := d.conn.Exec("UPDATE provider_timer_state SET active = false, paused_at = $1, elapsed_seconds = $2 WHERE professional_id = $3", now, elapsed, professionalID); err != nil {
		return model.TimerState{}, err
	}
	timer.Active = false
	timer.ElapsedSeconds = elapsed
	timer.PausedAt = &now
	return timer, nil
}

func (d *DB) ResumeExecution(professionalID string, now time.Time) (model.TimerState, error) {
	timer, err := d.GetTimerState(professionalID)
	if err != nil {
		return model.TimerState{}, err
	}
	if timer.Active || timer.ExecutionID == "" {
		return model.TimerState{}, ErrExecutionState
	}
	var startedAt time.Time
	var status string
	if err := d.conn.QueryRow("SELECT started_at, status FROM service_executions WHERE id = $1 AND professional_id = $2", timer.ExecutionID, professionalID).Scan(&startedAt, &status); err != nil {
		return model.TimerState{}, ErrExecutionNotFound
	}
	if status != model.ExecutionInProgress {
		return model.TimerState{}, ErrExecutionState
	}
	maxElapsed := int64(now.Sub(startedAt).Seconds())
	if maxElapsed < 0 {
		return model.TimerState{}, ErrExecutionState
	}
	if timer.ElapsedSeconds > maxElapsed {
		timer.ElapsedSeconds = maxElapsed
	}
	if _, err := d.conn.Exec("UPDATE provider_timer_state SET active = true, started_at = $1, paused_at = NULL, elapsed_seconds = $2 WHERE professional_id = $3", now, timer.ElapsedSeconds, professionalID); err != nil {
		return model.TimerState{}, err
	}
	timer.Active = true
	timer.StartedAt = now
	timer.PausedAt = nil
	return timer, nil
}

func (d *DB) FinishExecution(professionalID, notes string, now time.Time) (model.ServiceExecution, error) {
	tx, err := d.conn.Begin()
	if err != nil {
		return model.ServiceExecution{}, err
	}
	defer func() { _ = tx.Rollback() }()

	var timer model.TimerState
	err = tx.QueryRow("SELECT active, service_id, execution_id, started_at, paused_at, elapsed_seconds FROM provider_timer_state WHERE professional_id = $1", professionalID).
		Scan(&timer.Active, &timer.ServiceID, &timer.ExecutionID, &timer.StartedAt, &timer.PausedAt, &timer.ElapsedSeconds)
	if errors.Is(err, sql.ErrNoRows) || timer.ExecutionID == "" {
		return model.ServiceExecution{}, ErrExecutionNotFound
	}
	if err != nil {
		return model.ServiceExecution{}, err
	}
	elapsed := timer.ElapsedSeconds
	if timer.Active {
		elapsed += int64(now.Sub(timer.StartedAt).Seconds())
	}
	if elapsed < 0 {
		return model.ServiceExecution{}, ErrExecutionState
	}

	var executionStartedAt time.Time
	var rateCents int64
	var status string
	if err := tx.QueryRow("SELECT started_at, hourly_rate_cents, status FROM service_executions WHERE id = $1 AND professional_id = $2", timer.ExecutionID, professionalID).Scan(&executionStartedAt, &rateCents, &status); err != nil {
		return model.ServiceExecution{}, ErrExecutionNotFound
	}
	if status != model.ExecutionInProgress {
		return model.ServiceExecution{}, ErrExecutionState
	}
	// A timer can never legitimately exceed the wall-clock lifetime of its execution.
	// Clamp legacy/stale elapsed state so it cannot inflate a new execution's value.
	maxElapsed := int64(now.Sub(executionStartedAt).Seconds())
	if maxElapsed < 0 {
		return model.ServiceExecution{}, ErrExecutionState
	}
	if elapsed > maxElapsed {
		elapsed = maxElapsed
	}
	totalCents, err := model.CalculateExecutionValueCents(rateCents, elapsed)
	if err != nil {
		return model.ServiceExecution{}, err
	}
	if _, err := tx.Exec(`UPDATE service_executions SET finished_at = $1, duration_seconds = $2, total_value_cents = $3, status = $4, notes = $5 WHERE id = $6`, now, elapsed, totalCents, model.ExecutionCompleted, notes, timer.ExecutionID); err != nil {
		return model.ServiceExecution{}, err
	}
	if _, err := tx.Exec("UPDATE provider_timer_state SET active = false, service_id = '', execution_id = '', paused_at = $1, elapsed_seconds = 0 WHERE professional_id = $2", now, professionalID); err != nil {
		return model.ServiceExecution{}, err
	}
	if err := tx.Commit(); err != nil {
		return model.ServiceExecution{}, err
	}
	return d.GetExecutionForProfessional(timer.ExecutionID, professionalID)
}

func (d *DB) GetExecutionForProfessional(id, professionalID string) (model.ServiceExecution, error) {
	return d.getExecution(`WHERE e.id = $1 AND e.professional_id = $2`, id, professionalID)
}

func (d *DB) GetExecution(id string) (model.ServiceExecution, error) {
	return d.getExecution("WHERE e.id = $1", id)
}

func (d *DB) getExecution(where string, args ...any) (model.ServiceExecution, error) {
	var execution model.ServiceExecution
	query := `SELECT e.id, e.service_id, s.name, e.professional_id, p.name, COALESCE(e.client_id, ''), COALESCE(c.name, ''), e.started_at, e.finished_at, e.duration_seconds, e.hourly_rate_cents, e.total_value_cents, e.status, e.notes, COALESCE(e.payment_id, '')
		FROM service_executions e
		JOIN service_options s ON s.id = e.service_id
		JOIN professionals p ON p.id = e.professional_id
		LEFT JOIN clients c ON c.id = e.client_id ` + where
	err := d.conn.QueryRow(query, args...).Scan(&execution.ID, &execution.ServiceID, &execution.ServiceName, &execution.ProfessionalID, &execution.ProfessionalName, &execution.ClientID, &execution.ClientName, &execution.StartedAt, &execution.FinishedAt, &execution.DurationSeconds, &execution.HourlyRateCents, &execution.TotalValueCents, &execution.Status, &execution.Notes, &execution.PaymentID)
	if errors.Is(err, sql.ErrNoRows) {
		return model.ServiceExecution{}, ErrExecutionNotFound
	}
	return execution, err
}

func (d *DB) ListExecutions(professionalID, status string) ([]model.ServiceExecution, error) {
	query := `SELECT e.id, e.service_id, s.name, e.professional_id, p.name, COALESCE(e.client_id, ''), COALESCE(c.name, ''), e.started_at, e.finished_at, e.duration_seconds, e.hourly_rate_cents, e.total_value_cents, e.status, e.notes, COALESCE(e.payment_id, '')
		FROM service_executions e
		JOIN service_options s ON s.id = e.service_id
		JOIN professionals p ON p.id = e.professional_id
		LEFT JOIN clients c ON c.id = e.client_id
		WHERE ($1 = '' OR e.professional_id = $1) AND ($2 = '' OR e.status = $2)
		ORDER BY e.started_at DESC`
	rows, err := d.conn.Query(query, professionalID, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	list := make([]model.ServiceExecution, 0)
	for rows.Next() {
		var execution model.ServiceExecution
		if err := rows.Scan(&execution.ID, &execution.ServiceID, &execution.ServiceName, &execution.ProfessionalID, &execution.ProfessionalName, &execution.ClientID, &execution.ClientName, &execution.StartedAt, &execution.FinishedAt, &execution.DurationSeconds, &execution.HourlyRateCents, &execution.TotalValueCents, &execution.Status, &execution.Notes, &execution.PaymentID); err != nil {
			return nil, err
		}
		list = append(list, execution)
	}
	return list, rows.Err()
}

func (d *DB) ExecutionSummary() (model.ExecutionSummary, error) {
	var summary model.ExecutionSummary
	err := d.conn.QueryRow(`SELECT COUNT(*), COALESCE(SUM(duration_seconds), 0), COALESCE(SUM(total_value_cents), 0), COALESCE(SUM(CASE WHEN payment_id IS NOT NULL AND payment_id <> '' THEN total_value_cents ELSE 0 END), 0), COALESCE(SUM(CASE WHEN status = 'CONCLUIDO' AND (payment_id IS NULL OR payment_id = '') THEN total_value_cents ELSE 0 END), 0) FROM service_executions WHERE status = 'CONCLUIDO'`).Scan(&summary.TotalExecutions, &summary.TotalSeconds, &summary.TotalValueCents, &summary.PaidValueCents, &summary.PendingValueCents)
	return summary, err
}

func (d *DB) CreatePaymentForExecution(executionID string, now time.Time) error {
	tx, err := d.conn.Begin()
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()
	var professional string
	var duration int64
	var cents int64
	var paymentID string
	err = tx.QueryRow(`SELECT p.name, e.duration_seconds, e.total_value_cents, COALESCE(e.payment_id, '') FROM service_executions e JOIN professionals p ON p.id=e.professional_id WHERE e.id=$1 AND e.status=$2`, executionID, model.ExecutionCompleted).Scan(&professional, &duration, &cents, &paymentID)
	if errors.Is(err, sql.ErrNoRows) {
		return ErrExecutionNotFound
	}
	if err != nil {
		return err
	}
	if paymentID != "" {
		return ErrExecutionState
	}
	paymentID = "PAY-" + randomID()[:12]
	if _, err = tx.Exec("INSERT INTO payments (id, professional, amount, hours, period, status, date_str) VALUES ($1, $2, $3, $4, $5, 'Pendente', $6)", paymentID, professional, float64(cents)/100, float64(duration)/3600, "Execução concluída", now.Format("02/01/2006")); err != nil {
		return err
	}
	if _, err = tx.Exec("UPDATE service_executions SET payment_id=$1 WHERE id=$2 AND (payment_id IS NULL OR payment_id='')", paymentID, executionID); err != nil {
		return err
	}
	return tx.Commit()
}
