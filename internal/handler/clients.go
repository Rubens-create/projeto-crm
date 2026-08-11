package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"crm-terceirizados/internal/model"
)

func (h *Handler) AdminClients(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		var payload struct {
			ID         string `json:"id"`
			Name       string `json:"name"`
			Email      string `json:"email"`
			Phone      string `json:"phone"`
			Properties int    `json:"properties"`
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			h.jsonError(w, "invalid json", 400)
			return
		}
		if payload.Name != "" {
			newID := "CLI-" + time.Now().Format("150405")
			if payload.Properties <= 0 {
				payload.Properties = 1
			}
			c := model.Client{
				ID:         newID,
				Name:       payload.Name,
				Email:      payload.Email,
				Phone:      payload.Phone,
				Properties: payload.Properties,
			}
			if err := h.db.CreateClient(c); err != nil {
				h.jsonError(w, "database error", 500)
				return
			}
		}
	} else if r.Method != http.MethodGet {
		h.jsonError(w, "method not allowed", 405)
		return
	}

	list, err := h.db.GetAllClients()
	if err != nil {
		h.jsonError(w, "database error", 500)
		return
	}
	h.jsonResponse(w, list)
}
