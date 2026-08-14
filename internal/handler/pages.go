package handler

import (
	"html/template"
	"net/http"
	"path/filepath"
)

func (h *Handler) Pages(w http.ResponseWriter, r *http.Request) {
	file := "index.html"
	switch r.URL.Path {
	case "/login":
		file = "login.html"
	case "/cadastro-prestador":
		file = "provider-signup.html"
	case "/prestador":
		file = "provider.html"
	case "/admin/servicos":
		file = "admin-services.html"
	case "/admin/imoveis":
		file = "admin-properties.html"
	case "/admin/profissionais", "/profissionais":
		file = "admin-professionals.html"
	case "/admin/clientes":
		file = "admin-clients.html"
	case "/admin/pagamentos":
		file = "admin-payments.html"
	case "/admin/executions":
		file = "admin-executions.html"
	case "/admin/relatorios":
		file = "admin-reports.html"
	case "/admin/configuracoes":
		file = "admin-config.html"
	case "/":
	default:
		http.NotFound(w, r)
		return
	}
	tmpl, err := template.ParseFiles(filepath.Join("web", file))
	if err != nil {
		http.Error(w, "template error", 500)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_ = tmpl.Execute(w, nil)
}
