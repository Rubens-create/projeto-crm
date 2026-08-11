package handler

import (
	"encoding/json"
	"net/http"

	"crm-terceirizados/internal/model"
)

func (h *Handler) AdminConfig(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		var payload model.SystemSettings
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			h.jsonError(w, "invalid json", 400)
			return
		}
		if err := h.db.UpdateSettings(payload); err != nil {
			h.jsonError(w, "database error", 500)
			return
		}
	} else if r.Method != http.MethodGet {
		h.jsonError(w, "method not allowed", 405)
		return
	}

	cfg, err := h.db.GetSettings()
	if err != nil {
		h.jsonError(w, "database error", 500)
		return
	}
	h.jsonResponse(w, cfg)
}
