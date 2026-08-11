package database

import (
	"database/sql"
	"fmt"
	"log"

	"crm-terceirizados/internal/config"

	_ "github.com/lib/pq"
	_ "modernc.org/sqlite"
)

type DB struct {
	conn *sql.DB
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

func New(cfg config.Config) (*DB, error) {
	connStr := cfg.Database.URL
	if connStr == "" {
		ensureDatabaseExists(cfg.Database.Host, cfg.Database.Port, cfg.Database.User, cfg.Database.Password, cfg.Database.DBName, cfg.Database.SSLMode)
		connStr = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
			cfg.Database.Host, cfg.Database.Port, cfg.Database.User, cfg.Database.Password, cfg.Database.DBName, cfg.Database.SSLMode)
	}

	log.Println("[1/1] Conectando ao PostgreSQL...")
	dbConn, err := sql.Open("postgres", connStr)
	if err == nil {
		err = dbConn.Ping()
	}

	if err == nil {
		log.Println("Conexão com PostgreSQL estabelecida com sucesso!")
	} else {
		log.Printf("Aviso: PostgreSQL não disponível (%v). Ativando banco de dados SQLite local (crm_db.db)...", err)
		dbConn, err = sql.Open("sqlite", "file:crm_db.db?_pragma=busy_timeout=5000&_pragma=journal_mode=WAL&_pragma=foreign_keys(1)")
		if err != nil {
			return nil, fmt.Errorf("falha crítica ao abrir banco SQLite: %w", err)
		}
		if _, err := dbConn.Exec("PRAGMA foreign_keys = ON"); err != nil {
			return nil, fmt.Errorf("falha ao habilitar foreign keys no SQLite: %w", err)
		}
		if err := dbConn.Ping(); err != nil {
			return nil, fmt.Errorf("falha crítica ao conectar no SQLite: %w", err)
		}
		log.Println("Conexão com banco SQLite estabelecida com sucesso!")
	}

	d := &DB{conn: dbConn}

	if err := d.Migrate(); err != nil {
		return nil, fmt.Errorf("falha nas migrações do banco: %w", err)
	}

	if err := d.Seed(); err != nil {
		log.Printf("Aviso no seed inicial: %v", err)
	}

	return d, nil
}

func (d *DB) Close() error {
	return d.conn.Close()
}

// Helper methods to allow handler to run raw queries if needed
func (d *DB) Query(query string, args ...any) (*sql.Rows, error) {
	return d.conn.Query(query, args...)
}

func (d *DB) QueryRow(query string, args ...any) *sql.Row {
	return d.conn.QueryRow(query, args...)
}
