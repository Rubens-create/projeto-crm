package handler

import (
	"encoding/json"
	"math"
	"net/http"
	"strings"
	"time"

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
	if r.Method == http.MethodPost {
		var input struct {
			ProfessionalID string  `json:"professionalId"`
			ServiceID      string  `json:"serviceId"`
			Date           string  `json:"date"`
			StartTime      string  `json:"startTime"`
			Hours          float64 `json:"hours"`
			Notes          string  `json:"notes"`
		}
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			h.jsonError(w, "invalid json", http.StatusBadRequest)
			return
		}
		if input.ProfessionalID == "" || input.ServiceID == "" || input.Date == "" || input.Hours <= 0 || input.Hours > 24 {
			h.jsonError(w, "invalid manual execution", http.StatusBadRequest)
			return
		}
		if input.StartTime == "" {
			input.StartTime = "09:00"
		}
		startedAt, err := time.ParseInLocation("2006-01-02 15:04", input.Date+" "+input.StartTime, time.Local)
		if err != nil {
			h.jsonError(w, "invalid execution date", http.StatusBadRequest)
			return
		}
		durationSeconds := int64(math.Round(input.Hours * 3600))
		if strings.TrimSpace(input.Notes) == "" {
			input.Notes = "Lançamento manual pelo administrador"
		}
		execution, err := h.db.CreateManualExecution(input.ProfessionalID, input.ServiceID, startedAt, durationSeconds, strings.TrimSpace(input.Notes))
		if err != nil {
			h.executionError(w, err)
			return
		}
		h.jsonResponseStatus(w, execution, http.StatusCreated)
		return
	}
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
