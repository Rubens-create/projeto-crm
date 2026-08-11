package server

import (
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"crm-terceirizados/internal/config"
	"crm-terceirizados/internal/handler"
	"crm-terceirizados/internal/middleware"
)

func New(cfg config.Config, h *handler.Handler) *http.Server {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/dashboard", h.Dashboard)
	mux.HandleFunc("/api/provider", h.Provider)
	mux.HandleFunc("/api/provider/timer", h.Timer)
	mux.HandleFunc("/api/admin/services", h.AdminServices)
	mux.HandleFunc("/api/admin/professionals", h.AdminProfessionals)
	mux.HandleFunc("/api/admin/clients", h.AdminClients)
	mux.HandleFunc("/api/admin/payments", h.AdminPayments)
	mux.HandleFunc("/api/admin/config", h.AdminConfig)
	mux.HandleFunc("/api/admin/reports", h.AdminReports)
	mux.HandleFunc("/api/upload", h.Upload)

	mux.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("web"))))
	mux.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir(filepath.Join("web", "uploads")))))
	
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, ".css") || strings.HasSuffix(r.URL.Path, ".js") {
			http.ServeFile(w, r, filepath.Join("web", filepath.Base(r.URL.Path)))
			return
		}
		h.Pages(w, r)
	})

	mux.HandleFunc("/manifest.json", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/manifest+json")
		http.ServeFile(w, r, filepath.Join("web", "manifest.json"))
	})

	mux.HandleFunc("/sw.js", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/javascript")
		http.ServeFile(w, r, filepath.Join("web", "sw.js"))
	})

	return &http.Server{
		Addr:              ":" + cfg.Server.Port,
		Handler:           middleware.Logging(mux),
		ReadHeaderTimeout: 5 * time.Second,
	}
}

func Run(srv *http.Server) {
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			panic(err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)
	<-quit
}
