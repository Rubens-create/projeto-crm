package config

import "os"

type ServerConfig struct {
	Port string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
	URL      string
}

type AuthConfig struct {
	BootstrapAdminEmail    string
	BootstrapAdminPassword string
}

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Auth     AuthConfig
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

func Load() Config {
	return Config{
		Server: ServerConfig{
			Port: getEnv("PORT", "8080"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "35353535Rg..@123rg"),
			DBName:   getEnv("DB_NAME", "crm_db"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
			URL:      os.Getenv("DATABASE_URL"),
		},
		Auth: AuthConfig{
			BootstrapAdminEmail:    getEnv("ADMIN_EMAIL", "admin@zygg.com"),
			BootstrapAdminPassword: getEnv("ADMIN_PASSWORD", "admin123"),
		},
	}
}
