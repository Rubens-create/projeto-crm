package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

func (h *Handler) AdminServices(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		var payload struct {
			Action      string  `json:"action"`
			ID          string  `json:"id"`
			Name        string  `json:"name"`
			Description string  `json:"description"`
			Rate        float64 `json:"rate"`
			Bedrooms    int     `json:"bedrooms"`
			Bathrooms   int     `json:"bathrooms"`
			LivingRooms int     `json:"livingRooms"`
			Sqm         int     `json:"sqm"`
			Rooms       string  `json:"rooms"`
			Image       string  `json:"image"`
			EstTime     string  `json:"estTime"`
			Active      bool    `json:"active"`
		}

		if json.NewDecoder(r.Body).Decode(&payload) != nil {
			h.jsonError(w, "invalid json", 400)
			return
		}

		if payload.Bedrooms <= 0 {
			payload.Bedrooms = 1
		}
		if payload.Bathrooms <= 0 {
			payload.Bathrooms = 1
		}
		if payload.Sqm <= 0 {
			payload.Sqm = 45
		}
		payload.Rooms = fmt.Sprintf("%d cômodos (%d Q, %d S, %d B) · %dm²",
			payload.Bedrooms+payload.Bathrooms+payload.LivingRooms, payload.Bedrooms, payload.LivingRooms, payload.Bathrooms, payload.Sqm)

		switch payload.Action {
		case "toggle":
			err := h.db.ToggleOptionActive(payload.ID)
			if err != nil {
				h.jsonError(w, "database error", 500)
				return
			}
		case "update":
			if payload.Rate <= 0 {
				h.jsonError(w, "invalid rate", 400)
				return
			}
			if payload.Name != "" {
				err := h.db.UpdateOption(payload.ID, payload.Name, payload.Description, payload.Rate, payload.Bedrooms, payload.Bathrooms, payload.LivingRooms, payload.Sqm, payload.Rooms, payload.Image, payload.EstTime)
				if err != nil {
					h.jsonError(w, "database error", 500)
					return
				}
			} else {
				err := h.db.UpdateOptionRate(payload.ID, payload.Rate)
				if err != nil {
					h.jsonError(w, "database error", 500)
					return
				}
			}
		default: // create new
			if payload.Name == "" || payload.Rate <= 0 {
				h.jsonError(w, "invalid service", 400)
				return
			}
			newID := "OPT-" + time.Now().Format("150405")
			if payload.Image == "" {
				payload.Image = ""
			}
			if payload.EstTime == "" {
				payload.EstTime = "2.5h"
			}
			err := h.db.CreateOption(newID, payload.Name, payload.Description, payload.Rate, payload.Bedrooms, payload.Bathrooms, payload.LivingRooms, payload.Sqm, payload.Rooms, payload.Image, payload.EstTime)
			if err != nil {
				h.jsonError(w, "database error", 500)
				return
			}
		}
	} else if r.Method != http.MethodGet {
		h.jsonError(w, "method not allowed", 405)
		return
	}

	options, err := h.db.GetAllOptions()
	if err != nil {
		h.jsonError(w, "database error", 500)
		return
	}

	h.jsonResponse(w, options)
}
