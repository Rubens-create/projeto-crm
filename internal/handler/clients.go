package handler

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"crm-terceirizados/internal/model"
)

func (h *Handler) AdminClients(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		var payload struct {
			Action string `json:"action"`
			ID     string `json:"id"`
			Name   string `json:"name"`
			Email  string `json:"email"`
			Phone  string `json:"phone"`
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			h.jsonError(w, "invalid json", 400)
			return
		}
		if payload.Action == "toggle" {
			if payload.ID == "" {
				h.jsonError(w, "invalid client", http.StatusBadRequest)
				return
			}
			if err := h.db.ToggleClientStatus(payload.ID); err != nil {
				h.jsonError(w, "database error", http.StatusInternalServerError)
				return
			}
		} else if payload.Action == "update" {
			payload.Name = strings.TrimSpace(payload.Name)
			payload.Email = strings.ToLower(strings.TrimSpace(payload.Email))
			payload.Phone = strings.TrimSpace(payload.Phone)
			if payload.ID == "" || payload.Name == "" || payload.Email == "" {
				h.jsonError(w, "invalid client", http.StatusBadRequest)
				return
			}
			if err := h.db.UpdateClient(model.Client{ID: payload.ID, Name: payload.Name, Email: payload.Email, Phone: payload.Phone}); err != nil {
				h.jsonError(w, "database error", http.StatusInternalServerError)
				return
			}
		} else if payload.Name != "" {
			newID := "CLI-" + time.Now().Format("150405")
			c := model.Client{
				ID:    newID,
				Name:  payload.Name,
				Email: payload.Email,
				Phone: payload.Phone,
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
