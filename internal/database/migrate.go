package database

import "log"

func (d *DB) Migrate() error {
	createQueries := []string{
		`CREATE TABLE IF NOT EXISTS service_options (
			id VARCHAR(50) PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
			active BOOLEAN NOT NULL DEFAULT TRUE,
			bedrooms INT NOT NULL DEFAULT 1,
			bathrooms INT NOT NULL DEFAULT 1,
			living_rooms INT NOT NULL DEFAULT 1,
			sqm INT NOT NULL DEFAULT 45,
			rooms VARCHAR(100) DEFAULT '3 cômodos',
			image VARCHAR(255) DEFAULT '/assets/loft.jpg',
			est_time VARCHAR(50) DEFAULT '2.5h'
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
			properties INT NOT NULL DEFAULT 1,
			monthly_spend NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
			status VARCHAR(50) NOT NULL DEFAULT 'Ativo'
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
	}

	for _, q := range createQueries {
		if _, err := d.conn.Exec(q); err != nil {
			log.Printf("Aviso migração: %v", err)
		}
	}

	authQueries := []string{
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
			client_id VARCHAR(50) NULL,
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
			FOREIGN KEY (professional_id) REFERENCES professionals(id),
			FOREIGN KEY (client_id) REFERENCES clients(id)
		);`,
	}
	for _, q := range authQueries {
		if _, err := d.conn.Exec(q); err != nil {
			return err
		}
	}
	// Existing installations already have provider_timer_state without execution_id.
	_, _ = d.conn.Exec("ALTER TABLE provider_timer_state ADD COLUMN execution_id VARCHAR(64) NOT NULL DEFAULT ''")

	return nil
}
