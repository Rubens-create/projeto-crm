package handler

import (
	"net/http"
	"strings"

	"crm-terceirizados/internal/database"
	"crm-terceirizados/internal/middleware"
)

func (h *Handler) ProviderExecutions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		h.jsonError(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	user, ok := middleware.CurrentUser(r)
	if !ok || user.ProfessionalID == "" {
		h.jsonError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/api/provider/executions/")
	if id != "" && id != r.URL.Path {
		execution, err := h.db.GetExecutionForProfessional(id, user.ProfessionalID)
		if err != nil {
			h.executionError(w, err)
			return
		}
		h.jsonResponse(w, execution)
		return
	}
	list, err := h.db.ListExecutions(user.ProfessionalID, r.URL.Query().Get("status"))
	if err != nil {
		h.jsonError(w, "database error", http.StatusInternalServerError)
		return
	}
	h.jsonResponse(w, list)
}

func (h *Handler) AdminExecutions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		h.jsonError(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	id := strings.TrimPrefix(r.URL.Path, "/api/admin/executions/")
	if id != "" && id != r.URL.Path {
		execution, err := h.db.GetExecution(id)
		if err != nil {
			h.executionError(w, err)
			return
		}
		h.jsonResponse(w, execution)
		return
	}
	list, err := h.db.ListExecutions(r.URL.Query().Get("professionalId"), r.URL.Query().Get("status"))
	if err != nil {
		h.jsonError(w, "database error", http.StatusInternalServerError)
		return
	}
	summary, err := h.db.ExecutionSummary()
	if err != nil {
		h.jsonError(w, "database error", http.StatusInternalServerError)
		return
	}
	h.jsonResponse(w, map[string]any{"executions": list, "summary": summary})
}

var _ = database.ErrExecutionNotFound
