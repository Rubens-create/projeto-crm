package database

import (
	"database/sql"
	"path/filepath"
	"testing"

	_ "modernc.org/sqlite"
)

func TestMigrateExistingDatabaseMissingPropertyId(t *testing.T) {
	tmpDir := t.TempDir()
	dbPath := filepath.Join(tmpDir, "legacy.db")

	// Prepara um banco legado do SQLite onde service_options existia sem property_id
	rawDB, err := sql.Open("sqlite", dbPath)
	if err != nil {
		t.Fatalf("sql.Open error = %v", err)
	}
	legacySchema := []string{
		`CREATE TABLE IF NOT EXISTS service_options (
			id VARCHAR(50) PRIMARY KEY,
			description TEXT NOT NULL DEFAULT '',
			rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00
		);`,
		`INSERT INTO service_options (id, description, rate) VALUES ('OPT-LEGACY', 'Limpeza Legado', 100.00);`,
	}
	for _, q := range legacySchema {
		if _, err := rawDB.Exec(q); err != nil {
			t.Fatalf("setup legacy schema error = %v", err)
		}
	}
	_ = rawDB.Close()

	// Agora abre o banco usando a nossa struct DB e roda o Migrate()
	conn, err := sql.Open("sqlite", dbPath)
	if err != nil {
		t.Fatalf("sql.Open database error = %v", err)
	}
	defer conn.Close()

	d := &DB{conn: conn}
	if err := d.Migrate(); err != nil {
		t.Fatalf("Migrate() em banco legado falhou: %v", err)
	}

	// Verifica se a coluna property_id agora existe em service_options
	var count int
	if err := conn.QueryRow("SELECT COUNT(*) FROM service_options WHERE property_id IS NOT NULL").Scan(&count); err != nil {
		t.Fatalf("consulta a property_id em service_options falhou: %v", err)
	}
	if count != 1 {
		t.Fatalf("registros encontrados = %d, esperado 1", count)
	}
}
