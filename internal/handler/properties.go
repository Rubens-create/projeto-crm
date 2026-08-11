package handler

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"crm-terceirizados/internal/database"
	"crm-terceirizados/internal/model"
)

func newPropertyID() string {
	buffer := make([]byte, 6)
	if _, err := rand.Read(buffer); err != nil {
		return "IMO-FALLBACK"
	}
	return "IMO-" + hex.EncodeToString(buffer)
}

func normalizeProperty(property *model.Property) {
	if property.Bedrooms < 0 {
		property.Bedrooms = 0
	}
	if property.Bathrooms < 0 {
		property.Bathrooms = 0
	}
	if property.LivingRooms < 0 {
		property.LivingRooms = 0
	}
	if property.Sqm < 0 {
		property.Sqm = 0
	}
	property.Rooms = fmt.Sprintf("%d cômodos (%d Q, %d S, %d B) · %dm²",
		property.Bedrooms+property.Bathrooms+property.LivingRooms,
		property.Bedrooms, property.LivingRooms, property.Bathrooms, property.Sqm)
	if property.Status == "" {
		property.Status = model.PropertyActive
	}
}

func (h *Handler) AdminProperties(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		var payload struct {
			Action string `json:"action"`
			model.Property
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			h.jsonError(w, "invalid json", http.StatusBadRequest)
			return
		}

		switch payload.Action {
		case "create":
			if payload.Name == "" {
				h.jsonError(w, "property name is required", http.StatusBadRequest)
				return
			}
			payload.ID = newPropertyID()
			normalizeProperty(&payload.Property)
			if err := h.db.CreateProperty(payload.Property); err != nil {
				h.jsonError(w, "database error", http.StatusInternalServerError)
				return
			}
		case "update":
			if payload.ID == "" || payload.Name == "" {
				h.jsonError(w, "property id and name are required", http.StatusBadRequest)
				return
			}
			normalizeProperty(&payload.Property)
			if err := h.db.UpdateProperty(payload.Property); err != nil {
				if errors.Is(err, database.ErrPropertyNotFound) {
					h.jsonError(w, "property not found", http.StatusNotFound)
					return
				}
				h.jsonError(w, "database error", http.StatusInternalServerError)
				return
			}
		case "archive":
			if err := h.db.ArchiveProperty(payload.ID); err != nil {
				if errors.Is(err, database.ErrPropertyNotFound) {
					h.jsonError(w, "property not found", http.StatusNotFound)
					return
				}
				h.jsonError(w, "database error", http.StatusInternalServerError)
				return
			}
		case "delete":
			if err := h.db.DeleteProperty(payload.ID); err != nil {
				switch {
				case errors.Is(err, database.ErrPropertyInUse):
					h.jsonError(w, "property has related services or history; archive it instead", http.StatusConflict)
				case errors.Is(err, database.ErrPropertyNotFound):
					h.jsonError(w, "property not found", http.StatusNotFound)
				default:
					h.jsonError(w, "database error", http.StatusInternalServerError)
				}
				return
			}
		default:
			h.jsonError(w, "invalid action", http.StatusBadRequest)
			return
		}
	} else if r.Method != http.MethodGet {
		h.jsonError(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	properties, err := h.db.GetAllProperties(r.URL.Query().Get("q"))
	if err != nil {
		h.jsonError(w, "database error", http.StatusInternalServerError)
		return
	}
	h.jsonResponse(w, properties)
}
