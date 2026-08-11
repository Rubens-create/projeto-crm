package handler

import (
	"encoding/json"
	"net/http"
	"time"
)

func (h *Handler) AdminServices(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		var payload struct {
			Action      string  `json:"action"`
			ID          string  `json:"id"`
			PropertyID  string  `json:"propertyId"`
			Description string  `json:"description"`
			Rate        float64 `json:"rate"`
			EstTime     string  `json:"estTime"`
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			h.jsonError(w, "invalid json", http.StatusBadRequest)
			return
		}

		switch payload.Action {
		case "toggle":
			if err := h.db.ToggleOptionActive(payload.ID); err != nil {
				h.jsonError(w, "database error", http.StatusInternalServerError)
				return
			}
		case "update":
			if payload.ID == "" || payload.PropertyID == "" || payload.Rate <= 0 {
				h.jsonError(w, "invalid service", http.StatusBadRequest)
				return
			}
			if err := h.db.UpdateOption(payload.ID, payload.PropertyID, payload.Description, payload.Rate, payload.EstTime); err != nil {
				h.jsonError(w, "database error", http.StatusInternalServerError)
				return
			}
		default:
			if payload.PropertyID == "" || payload.Rate <= 0 {
				h.jsonError(w, "invalid service", http.StatusBadRequest)
				return
			}
			if payload.EstTime == "" {
				payload.EstTime = "2.5h"
			}
			newID := "OPT-" + time.Now().Format("150405.000000")
			if err := h.db.CreateOption(newID, payload.PropertyID, payload.Description, payload.Rate, payload.EstTime); err != nil {
				h.jsonError(w, "database error", http.StatusInternalServerError)
				return
			}
		}
	} else if r.Method != http.MethodGet {
		h.jsonError(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	options, err := h.db.GetAllOptions()
	if err != nil {
		h.jsonError(w, "database error", http.StatusInternalServerError)
		return
	}
	h.jsonResponse(w, options)
}
