package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

var db *sql.DB

func initDB() {
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		host := getEnv("DB_HOST", "localhost")
		port := getEnv("DB_PORT", "5432")
		user := getEnv("DB_USER", "postgres")
		pass := getEnv("DB_PASSWORD", "postgres")
		dbname := getEnv("DB_NAME", "crm_db")
		sslmode := getEnv("DB_SSLMODE", "disable")

		ensureDatabaseExists(host, port, user, pass, dbname, sslmode)

		connStr = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
			host, port, user, pass, dbname, sslmode)
	}

	var err error
	for i := 1; i <= 5; i++ {
		log.Printf("[%d/5] Conectando ao PostgreSQL...", i)
		db, err = sql.Open("postgres", connStr)
		if err == nil {
			err = db.Ping()
			if err == nil {
				log.Println("Conexão com PostgreSQL estabelecida com sucesso!")
				break
			}
		}
		log.Printf("Aguardando banco de dados ficar pronto... (erro: %v)", err)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Fatalf("Falha crítica ao conectar no PostgreSQL: %v", err)
	}

	if err := migrateDB(); err != nil {
		log.Fatalf("Falha nas migrações do banco: %v", err)
	}

	if err := seedDB(); err != nil {
		log.Printf("Aviso no seed inicial: %v", err)
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

func migrateDB() error {
	queries := []string{
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
		`ALTER TABLE service_options ADD COLUMN IF NOT EXISTS bedrooms INT NOT NULL DEFAULT 1;`,
		`ALTER TABLE service_options ADD COLUMN IF NOT EXISTS bathrooms INT NOT NULL DEFAULT 1;`,
		`ALTER TABLE service_options ADD COLUMN IF NOT EXISTS living_rooms INT NOT NULL DEFAULT 1;`,
		`ALTER TABLE service_options ADD COLUMN IF NOT EXISTS sqm INT NOT NULL DEFAULT 45;`,
		`ALTER TABLE service_options ADD COLUMN IF NOT EXISTS rooms VARCHAR(100) DEFAULT '3 cômodos';`,
		`ALTER TABLE service_options ADD COLUMN IF NOT EXISTS image VARCHAR(255) DEFAULT '/assets/loft.jpg';`,
		`ALTER TABLE service_options ADD COLUMN IF NOT EXISTS est_time VARCHAR(50) DEFAULT '2.5h';`,
		`CREATE TABLE IF NOT EXISTS services (
			id VARCHAR(50) PRIMARY KEY,
			client VARCHAR(255) NOT NULL,
			professional VARCHAR(255) NOT NULL,
			service VARCHAR(255) NOT NULL,
			hours NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
			rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
			status VARCHAR(50) NOT NULL DEFAULT 'Em andamento',
			date_str VARCHAR(100) NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS timer_state (
			id INT PRIMARY KEY DEFAULT 1,
			active BOOLEAN NOT NULL DEFAULT FALSE,
			service_id VARCHAR(50) NOT NULL DEFAULT '',
			started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			elapsed_seconds BIGINT NOT NULL DEFAULT 0,
			CONSTRAINT single_row CHECK (id = 1)
		);`,
	}

	for _, q := range queries {
		if _, err := db.Exec(q); err != nil {
			return err
		}
	}
	return nil
}

func seedDB() error {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM service_options").Scan(&count)
	if err != nil {
		return err
	}

	if count == 0 {
		options := []ServiceOption{
			{"OPT-01", "Loft Jardins", "Limpeza Pós Check-out + Enxoval", 120.00, true, 1, 1, 1, 55, "3 cômodos (1 Q, 1 S, 1 B)", "/assets/loft.jpg", "2.5h"},
			{"OPT-02", "Apt Copacabana", "Turno Rápido Roupas & Banheiro", 85.00, true, 1, 1, 0, 38, "2 cômodos (1 Q, 1 B)", "/assets/bedroom.jpg", "1.5h"},
			{"OPT-03", "Studio Pinheiros", "Limpeza Geral Pós Hospedagem", 110.00, true, 1, 1, 1, 42, "2 cômodos (Studio)", "/assets/studio.jpg", "2.0h"},
			{"OPT-04", "Penthouse Orla", "Limpeza Profunda Pós Checkout", 180.00, true, 2, 2, 1, 120, "5 cômodos (2 Q, 2 B, Varanda)", "/assets/penthouse.jpg", "4.0h"},
		}
		stmt, err := db.Prepare("INSERT INTO service_options (id, name, description, rate, active, bedrooms, bathrooms, living_rooms, sqm, rooms, image, est_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)")
		if err != nil {
			return err
		}
		defer stmt.Close()

		for _, opt := range options {
			if _, err := stmt.Exec(opt.ID, opt.Name, opt.Description, opt.Rate, opt.Active, opt.Bedrooms, opt.Bathrooms, opt.LivingRooms, opt.Sqm, opt.Rooms, opt.Image, opt.EstTime); err != nil {
				log.Printf("Erro inserindo option %s: %v", opt.ID, err)
			}
		}
	}

	err = db.QueryRow("SELECT COUNT(*) FROM services").Scan(&count)
	if err != nil {
		return err
	}

	if count == 0 {
		services := []Service{
			{"SV-1048", "Loft Jardins (Check-out)", "Marina Costa", "Limpeza Pós Check-out + Enxoval", 6.5, 120.00, "Em andamento", "Hoje, 08:30"},
			{"SV-1047", "Apt Copacabana (Turno)", "Rafael Mendes", "Turno Rápido Roupas & Banheiro", 4.0, 85.00, "Aguardando", "Hoje, 07:45"},
			{"SV-1046", "Studio Pinheiros (Geral)", "Beatriz Lima", "Limpeza Geral Pós Hospedagem", 8.0, 110.00, "Concluído", "Ontem, 17:20"},
			{"SV-1045", "Penthouse Orla (Luxo)", "Lucas Rocha", "Limpeza Profunda Pós Checkout", 5.5, 180.00, "Concluído", "Ontem, 15:10"},
		}

		stmt, err := db.Prepare("INSERT INTO services (id, client, professional, service, hours, rate, status, date_str) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)")
		if err != nil {
			return err
		}
		defer stmt.Close()

		for _, s := range services {
			if _, err := stmt.Exec(s.ID, s.Client, s.Professional, s.Service, s.Hours, s.Rate, s.Status, s.Date); err != nil {
				log.Printf("Erro inserindo service %s: %v", s.ID, err)
			}
		}
	} else {
		// Atualiza dados existentes para Airbnb
		_, _ = db.Exec(`UPDATE services SET client = 'Loft Jardins (Check-out)', service = 'Limpeza Pós Check-out + Enxoval', rate = 120.00 WHERE id = 'SV-1048'`)
		_, _ = db.Exec(`UPDATE services SET client = 'Apt Copacabana (Turno)', service = 'Turno Rápido Roupas & Banheiro', rate = 85.00 WHERE id = 'SV-1047'`)
		_, _ = db.Exec(`UPDATE services SET client = 'Studio Pinheiros (Geral)', service = 'Limpeza Geral Pós Hospedagem', rate = 110.00 WHERE id = 'SV-1046'`)
		_, _ = db.Exec(`UPDATE services SET client = 'Penthouse Orla (Luxo)', service = 'Limpeza Profunda Pós Checkout', rate = 180.00 WHERE id = 'SV-1045'`)
	}

	err = db.QueryRow("SELECT COUNT(*) FROM timer_state").Scan(&count)
	if err != nil {
		return err
	}

	if count == 0 {
		_, err = db.Exec("INSERT INTO timer_state (id, active, service_id, started_at, elapsed_seconds) VALUES (1, false, '', NOW(), 0)")
		if err != nil {
			log.Printf("Erro inicializando timer_state: %v", err)
		}
	}

	return nil
}

func ensureDatabaseExists(host, port, user, pass, dbname, sslmode string) {
	defaultConnStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=postgres sslmode=%s",
		host, port, user, pass, sslmode)

	tempDB, err := sql.Open("postgres", defaultConnStr)
	if err != nil {
		return
	}
	defer tempDB.Close()

	if err := tempDB.Ping(); err != nil {
		return
	}

	var exists bool
	err = tempDB.QueryRow("SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1)", dbname).Scan(&exists)
	if err == nil && !exists {
		log.Printf("Criando banco de dados '%s' automaticamente no PostgreSQL...", dbname)
		_, _ = tempDB.Exec(fmt.Sprintf("CREATE DATABASE %s", dbname))
	}
}
