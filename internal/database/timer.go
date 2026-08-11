package database

import (
	"time"

	"crm-terceirizados/internal/model"
)

func (d *DB) GetTimerState() (model.TimerState, error) {
	var ts model.TimerState
	err := d.conn.QueryRow("SELECT active, service_id, started_at, elapsed_seconds FROM timer_state WHERE id = 1").
		Scan(&ts.Active, &ts.ServiceID, &ts.StartedAt, &ts.ElapsedSeconds)
	return ts, err
}

func (d *DB) StartTimer(serviceID string, startedAt time.Time) error {
	_, err := d.conn.Exec("UPDATE timer_state SET active = true, service_id = $1, started_at = $2 WHERE id = 1", serviceID, startedAt)
	return err
}

func (d *DB) StopTimer(elapsedSeconds int64) error {
	_, err := d.conn.Exec("UPDATE timer_state SET active = false, elapsed_seconds = $1 WHERE id = 1", elapsedSeconds)
	return err
}
