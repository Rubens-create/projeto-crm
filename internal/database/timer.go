package database

import (
	"database/sql"
	"time"

	"crm-terceirizados/internal/model"
)

func (d *DB) GetTimerState(professionalID string) (model.TimerState, error) {
	var ts model.TimerState
	err := d.conn.QueryRow("SELECT active, service_id, execution_id, started_at, paused_at, elapsed_seconds FROM provider_timer_state WHERE professional_id = $1", professionalID).
		Scan(&ts.Active, &ts.ServiceID, &ts.ExecutionID, &ts.StartedAt, &ts.PausedAt, &ts.ElapsedSeconds)
	if err == sql.ErrNoRows {
		return model.TimerState{}, nil
	}
	return ts, err
}

func (d *DB) StartTimer(professionalID, serviceID string, startedAt time.Time) error {
	_, err := d.conn.Exec(`INSERT INTO provider_timer_state (professional_id, active, service_id, started_at, paused_at, elapsed_seconds)
		VALUES ($1, true, $2, $3, NULL, 0)
		ON CONFLICT (professional_id) DO UPDATE SET active = true, service_id = EXCLUDED.service_id, started_at = EXCLUDED.started_at, paused_at = NULL`, professionalID, serviceID, startedAt)
	return err
}

func (d *DB) StopTimer(professionalID string, elapsedSeconds int64, pausedAt time.Time) error {
	_, err := d.conn.Exec("UPDATE provider_timer_state SET active = false, paused_at = $1, elapsed_seconds = $2 WHERE professional_id = $3", pausedAt, elapsedSeconds, professionalID)
	return err
}
