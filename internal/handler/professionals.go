package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"crm-terceirizados/internal/model"
)

func (h *Handler) AdminProfessionals(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		var payload struct {
			Action    string  `json:"action"`
			ID        string  `json:"id"`
			Name      string  `json:"name"`
			Email     string  `json:"email"`
			Phone     string  `json:"phone"`
			Specialty string  `json:"specialty"`
			Rate      float64 `json:"rate"`
			Active    bool    `json:"active"`
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			h.jsonError(w, "invalid json", 400)
			return
		}
		if payload.Action == "toggle" {
			if err := h.db.ToggleProfessionalActive(payload.ID); err != nil {
				h.jsonError(w, "database error", 500)
				return
			}
		} else if payload.Action == "update_rate" {
			if err := h.db.UpdateProfessionalRate(payload.ID, payload.Rate); err != nil {
				h.jsonError(w, "database error", 500)
				return
			}
		} else if payload.Name != "" {
			newID := "PRO-" + time.Now().Format("150405")
			p := model.Professional{
				ID:        newID,
				Name:      payload.Name,
				Email:     payload.Email,
				Phone:     payload.Phone,
				Specialty: payload.Specialty,
				Rate:      payload.Rate,
			}
			if err := h.db.CreateProfessional(p); err != nil {
				h.jsonError(w, "database error", 500)
				return
			}
		}
	} else if r.Method != http.MethodGet {
		h.jsonError(w, "method not allowed", 405)
		return
	}

	list, err := h.db.GetAllProfessionals()
	if err != nil {
		h.jsonError(w, "database error", 500)
		return
	}
	h.jsonResponse(w, list)
}
