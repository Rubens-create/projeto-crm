package main

import (
	"log"

	"crm-terceirizados/internal/config"
	"crm-terceirizados/internal/database"
	"crm-terceirizados/internal/handler"
	"crm-terceirizados/internal/server"
)

func main() {
	cfg := config.Load()

	db, err := database.New(cfg)
	if err != nil {
		log.Fatalf("Falha ao inicializar banco de dados: %v", err)
	}
	defer db.Close()
	if err := db.EnsureBootstrapAdmin(cfg.Auth.BootstrapAdminEmail, cfg.Auth.BootstrapAdminPassword); err != nil {
		log.Fatalf("Falha ao configurar administrador inicial: %v", err)
	}

	h := handler.New(db)
	srv := server.New(cfg, h)

	log.Printf("CRM rodando em http://localhost:%s", cfg.Server.Port)
	server.Run(srv)
	log.Println("Servidor encerrado.")
}
