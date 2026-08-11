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
	"crm-terceirizados/internal/model"
)

func New(cfg config.Config, h *handler.Handler) *http.Server {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/auth/login", h.Login)
	mux.HandleFunc("/api/auth/logout", middleware.RequireRole(h.Database(), model.RoleAdmin, model.RoleProvider)(h.Logout))
	mux.HandleFunc("/api/auth/session", middleware.RequireRole(h.Database(), model.RoleAdmin, model.RoleProvider)(h.Session))
	mux.HandleFunc("/api/dashboard", middleware.RequireRole(h.Database(), model.RoleAdmin)(h.Dashboard))
	mux.HandleFunc("/api/provider", middleware.RequireRole(h.Database(), model.RoleProvider)(h.Provider))
	mux.HandleFunc("/api/provider/executions", middleware.RequireRole(h.Database(), model.RoleProvider)(h.ProviderExecutions))
	mux.HandleFunc("/api/provider/executions/", middleware.RequireRole(h.Database(), model.RoleProvider)(h.ProviderExecutions))
	mux.HandleFunc("/api/admin/executions", middleware.RequireRole(h.Database(), model.RoleAdmin)(h.AdminExecutions))
	mux.HandleFunc("/api/admin/executions/", middleware.RequireRole(h.Database(), model.RoleAdmin)(h.AdminExecutions))
	mux.HandleFunc("/api/provider/timer", middleware.RequireRole(h.Database(), model.RoleProvider)(h.Timer))
	mux.HandleFunc("/api/admin/services", middleware.RequireRole(h.Database(), model.RoleAdmin)(h.AdminServices))
	mux.HandleFunc("/api/admin/properties", middleware.RequireRole(h.Database(), model.RoleAdmin)(h.AdminProperties))
	mux.HandleFunc("/api/admin/professionals", middleware.RequireRole(h.Database(), model.RoleAdmin)(h.AdminProfessionals))
	mux.HandleFunc("/api/admin/clients", middleware.RequireRole(h.Database(), model.RoleAdmin)(h.AdminClients))
	mux.HandleFunc("/api/admin/payments", middleware.RequireRole(h.Database(), model.RoleAdmin)(h.AdminPayments))
	mux.HandleFunc("/api/admin/config", middleware.RequireRole(h.Database(), model.RoleAdmin)(h.AdminConfig))
	mux.HandleFunc("/api/admin/reports", middleware.RequireRole(h.Database(), model.RoleAdmin)(h.AdminReports))
	mux.HandleFunc("/api/upload", middleware.RequireRole(h.Database(), model.RoleAdmin)(h.Upload))

	mux.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("web"))))
	mux.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir(filepath.Join("web", "uploads")))))

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, ".css") || strings.HasSuffix(r.URL.Path, ".js") {
			http.ServeFile(w, r, filepath.Join("web", filepath.Base(r.URL.Path)))
			return
		}
		if r.URL.Path == "/prestador" {
			middleware.RequirePageRole(h.Database(), "/login?role=provider", model.RoleProvider)(h.Pages)(w, r)
			return
		}
		if strings.HasPrefix(r.URL.Path, "/admin/") {
			middleware.RequirePageRole(h.Database(), "/login?role=admin", model.RoleAdmin)(h.Pages)(w, r)
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
