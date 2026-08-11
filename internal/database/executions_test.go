package database

import (
	"testing"
	"time"

	"crm-terceirizados/internal/config"
)

func TestPauseExecutionCapsStaleElapsedTimeAtExecutionLifetime(t *testing.T) {
	t.Chdir(t.TempDir())
	db, err := New(config.Config{Database: config.DatabaseConfig{URL: "host=127.0.0.1 port=1 user=test dbname=test sslmode=disable connect_timeout=1"}})
	if err != nil {
		t.Fatalf("New() error = %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })

	startedAt := time.Now().Add(-5 * time.Second)
	if _, _, err := db.StartExecution("PRO-01", "OPT-01", startedAt); err != nil {
		t.Fatalf("StartExecution() error = %v", err)
	}
	if _, err := db.conn.Exec("UPDATE provider_timer_state SET elapsed_seconds = 10800 WHERE professional_id = $1", "PRO-01"); err != nil {
		t.Fatalf("seed stale elapsed time error = %v", err)
	}

	timer, err := db.PauseExecution("PRO-01", startedAt.Add(5*time.Second))
	if err != nil {
		t.Fatalf("PauseExecution() error = %v", err)
	}
	if timer.ElapsedSeconds != 5 {
		t.Fatalf("PauseExecution() elapsed = %d, want 5", timer.ElapsedSeconds)
	}
}
