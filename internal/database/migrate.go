package database

import "fmt"

func (d *DB) Migrate() error {
	createTables := []string{
		`CREATE TABLE IF NOT EXISTS professionals (
			id VARCHAR(50) PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) NOT NULL,
			phone VARCHAR(100) NOT NULL,
			specialty VARCHAR(255) NOT NULL,
			rate NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
			hours NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
			earned NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
			active BOOLEAN NOT NULL DEFAULT TRUE
		);`,
		`CREATE TABLE IF NOT EXISTS clients (
			id VARCHAR(50) PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) NOT NULL,
			phone VARCHAR(100) NOT NULL,
			monthly_spend NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
			status VARCHAR(50) NOT NULL DEFAULT 'Ativo'
		);`,
		`CREATE TABLE IF NOT EXISTS properties (
			id VARCHAR(50) PRIMARY KEY,
			client_id VARCHAR(50) NULL,
			name VARCHAR(255) NOT NULL,
			address TEXT NOT NULL DEFAULT '',
			description TEXT NOT NULL DEFAULT '',
			bedrooms INT NOT NULL DEFAULT 1,
			bathrooms INT NOT NULL DEFAULT 1,
			living_rooms INT NOT NULL DEFAULT 0,
			sqm INT NOT NULL DEFAULT 0,
			rooms TEXT NOT NULL DEFAULT '',
			image TEXT NOT NULL DEFAULT '',
			estimated_time VARCHAR(50) NOT NULL DEFAULT '',
			status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
		);`,
		`CREATE TABLE IF NOT EXISTS service_options (
			id VARCHAR(50) PRIMARY KEY,
			property_id VARCHAR(50) NOT NULL DEFAULT '',
			description TEXT NOT NULL DEFAULT '',
			rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
			active BOOLEAN NOT NULL DEFAULT TRUE,
			est_time VARCHAR(50) NOT NULL DEFAULT '2.5h',
			FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT
		);`,
		`CREATE TABLE IF NOT EXISTS services (
			id VARCHAR(50) PRIMARY KEY,
			client VARCHAR(255) NOT NULL,
			professional VARCHAR(255) NOT NULL,
			service VARCHAR(255) NOT NULL,
			hours NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
			rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
			status VARCHAR(50) NOT NULL DEFAULT 'Em andamento',
			date_str VARCHAR(100) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS timer_state (
			id INT PRIMARY KEY DEFAULT 1,
			active BOOLEAN NOT NULL DEFAULT FALSE,
			service_id VARCHAR(50) NOT NULL DEFAULT '',
			started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			elapsed_seconds BIGINT NOT NULL DEFAULT 0
		);`,
		`CREATE TABLE IF NOT EXISTS payments (
			id VARCHAR(50) PRIMARY KEY,
			professional VARCHAR(255) NOT NULL,
			amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
			hours NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
			period VARCHAR(100) NOT NULL,
			status VARCHAR(50) NOT NULL DEFAULT 'Pago',
			date_str VARCHAR(100) NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS settings (
			id INT PRIMARY KEY DEFAULT 1,
			company_name VARCHAR(255) NOT NULL DEFAULT 'Zygg Limpezas Airbnb & Terceirizados',
			cnpj VARCHAR(100) NOT NULL DEFAULT '12.345.678/0001-90',
			email VARCHAR(255) NOT NULL DEFAULT 'ruben@zygg.com',
			phone VARCHAR(100) NOT NULL DEFAULT '(11) 99887-6655',
			currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
			default_rate NUMERIC(10, 2) NOT NULL DEFAULT 120.00,
			language VARCHAR(10) NOT NULL DEFAULT 'pt'
		);`,
		`CREATE TABLE IF NOT EXISTS users (
			id VARCHAR(64) PRIMARY KEY,
			email VARCHAR(255) NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			role VARCHAR(20) NOT NULL,
			professional_id VARCHAR(50) UNIQUE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (professional_id) REFERENCES professionals(id)
		);`,
		`CREATE TABLE IF NOT EXISTS user_sessions (
			id VARCHAR(64) PRIMARY KEY,
			user_id VARCHAR(64) NOT NULL,
			expires_at TIMESTAMP NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id)
		);`,
		`CREATE TABLE IF NOT EXISTS provider_timer_state (
			professional_id VARCHAR(50) PRIMARY KEY,
			active BOOLEAN NOT NULL DEFAULT FALSE,
			service_id VARCHAR(50) NOT NULL DEFAULT '',
			execution_id VARCHAR(64) NOT NULL DEFAULT '',
			started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			paused_at TIMESTAMP NULL,
			elapsed_seconds BIGINT NOT NULL DEFAULT 0,
			FOREIGN KEY (professional_id) REFERENCES professionals(id)
		);`,
		`CREATE TABLE IF NOT EXISTS service_executions (
			id VARCHAR(64) PRIMARY KEY,
			service_id VARCHAR(50) NOT NULL,
			professional_id VARCHAR(50) NOT NULL,
			started_at TIMESTAMP NOT NULL,
			finished_at TIMESTAMP NULL,
			duration_seconds BIGINT NOT NULL DEFAULT 0,
			hourly_rate_cents BIGINT NOT NULL,
			total_value_cents BIGINT NOT NULL DEFAULT 0,
			status VARCHAR(20) NOT NULL,
			notes TEXT NOT NULL DEFAULT '',
			payment_id VARCHAR(50) NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (service_id) REFERENCES service_options(id),
			FOREIGN KEY (professional_id) REFERENCES professionals(id)
		);`,
	}

	for _, query := range createTables {
		if _, err := d.conn.Exec(query); err != nil {
			return fmt.Errorf("create schema: %w", err)
		}
	}

	// Garante que colunas adicionadas em atualizações do sistema existam em bancos preexistentes
	columnsToAdd := []struct {
		table, column, colDef string
	}{
		{"service_options", "property_id", "VARCHAR(50) NOT NULL DEFAULT ''"},
		{"service_options", "est_time", "VARCHAR(50) NOT NULL DEFAULT '2.5h'"},
		{"service_options", "active", "BOOLEAN NOT NULL DEFAULT TRUE"},
		{"service_options", "rate", "NUMERIC(10, 2) NOT NULL DEFAULT 0.00"},
		{"service_options", "description", "TEXT NOT NULL DEFAULT ''"},
		{"properties", "client_id", "VARCHAR(50) NULL"},
		{"properties", "bedrooms", "INT NOT NULL DEFAULT 1"},
		{"properties", "bathrooms", "INT NOT NULL DEFAULT 1"},
		{"properties", "living_rooms", "INT NOT NULL DEFAULT 0"},
		{"properties", "sqm", "INT NOT NULL DEFAULT 0"},
		{"properties", "rooms", "TEXT NOT NULL DEFAULT ''"},
		{"properties", "image", "TEXT NOT NULL DEFAULT ''"},
		{"properties", "estimated_time", "VARCHAR(50) NOT NULL DEFAULT ''"},
		{"properties", "status", "VARCHAR(20) NOT NULL DEFAULT 'ATIVO'"},
		{"professionals", "active", "BOOLEAN NOT NULL DEFAULT TRUE"},
		{"professionals", "hours", "NUMERIC(10, 2) NOT NULL DEFAULT 0.00"},
		{"professionals", "earned", "NUMERIC(10, 2) NOT NULL DEFAULT 0.00"},
		{"clients", "monthly_spend", "NUMERIC(10, 2) NOT NULL DEFAULT 0.00"},
		{"clients", "status", "VARCHAR(50) NOT NULL DEFAULT 'Ativo'"},
	}

	for _, col := range columnsToAdd {
		d.addColumnIfNotExists(col.table, col.column, col.colDef)
	}

	indexQueries := []string{
		`CREATE INDEX IF NOT EXISTS idx_properties_client_id ON properties(client_id);`,
		`CREATE INDEX IF NOT EXISTS idx_service_options_property_id ON service_options(property_id);`,
		`CREATE INDEX IF NOT EXISTS idx_service_executions_service_id ON service_executions(service_id);`,
		`CREATE INDEX IF NOT EXISTS idx_service_executions_professional_id ON service_executions(professional_id);`,
	}

	for _, query := range indexQueries {
		if _, err := d.conn.Exec(query); err != nil {
			return fmt.Errorf("create schema index: %w", err)
		}
	}

	return nil
}

func (d *DB) addColumnIfNotExists(table, column, colDef string) {
	checkQuery := fmt.Sprintf("SELECT %s FROM %s LIMIT 0", column, table)
	rows, err := d.conn.Query(checkQuery)
	if err == nil {
		rows.Close()
		return
	}
	alterQuery := fmt.Sprintf("ALTER TABLE %s ADD COLUMN %s %s", table, column, colDef)
	_, _ = d.conn.Exec(alterQuery)
}
