package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"crm-terceirizados/internal/database"
	"crm-terceirizados/internal/middleware"
)

func (h *Handler) Timer(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		h.jsonError(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		Action    string `json:"action"`
		ServiceID string `json:"serviceId"`
		Notes     string `json:"notes"`
	}
	if json.NewDecoder(r.Body).Decode(&input) != nil {
		h.jsonError(w, "invalid json", http.StatusBadRequest)
		return
	}

	user, ok := middleware.CurrentUser(r)
	if !ok || user.ProfessionalID == "" {
		h.jsonError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	now := time.Now()
	switch input.Action {
	case "start":
		timer, execution, err := h.db.StartExecution(user.ProfessionalID, input.ServiceID, now)
		if err != nil {
			h.executionError(w, err)
			return
		}
		h.jsonResponse(w, map[string]any{"timer": timer, "execution": execution, "serverTime": now})
	case "pause", "stop":
		timer, err := h.db.PauseExecution(user.ProfessionalID, now)
		if err != nil {
			h.executionError(w, err)
			return
		}
		h.jsonResponse(w, map[string]any{"timer": timer, "serverTime": now})
	case "resume":
		timer, err := h.db.ResumeExecution(user.ProfessionalID, now)
		if err != nil {
			h.executionError(w, err)
			return
		}
		h.jsonResponse(w, map[string]any{"timer": timer, "serverTime": now})
	case "finish":
		execution, err := h.db.FinishExecution(user.ProfessionalID, input.Notes, now)
		if err != nil {
			h.executionError(w, err)
			return
		}
		h.jsonResponse(w, map[string]any{"execution": execution, "timer": map[string]any{"active": false}, "serverTime": now})
	default:
		h.jsonError(w, "invalid action", http.StatusBadRequest)
	}
}

func (h *Handler) executionError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, database.ErrExecutionNotFound):
		h.jsonError(w, "execution or service not found", http.StatusNotFound)
	case errors.Is(err, database.ErrExecutionActive):
		h.jsonError(w, "execution already active", http.StatusConflict)
	case errors.Is(err, database.ErrExecutionState):
		h.jsonError(w, "invalid execution state", http.StatusConflict)
	default:
		h.jsonError(w, "database error", http.StatusInternalServerError)
	}
}
