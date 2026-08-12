package server

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"crm-terceirizados/internal/config"
	"crm-terceirizados/internal/handler"
)

func TestHealthEndpoint(t *testing.T) {
	h := handler.New(nil)
	srv := New(config.Config{Server: config.ServerConfig{Port: "8080"}}, h)
	req := httptest.NewRequest("GET", "/api/health", nil)
	w := httptest.NewRecorder()

	srv.Handler.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status code = %d, want %d", w.Code, http.StatusOK)
	}
	if body := w.Body.String(); body != `{"status":"ok"}` {
		t.Fatalf("body = %q, want %q", body, `{"status":"ok"}`)
	}
}
