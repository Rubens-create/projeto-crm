package handler

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"crm-terceirizados/internal/model"
)

func (h *Handler) AdminAchievements(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/admin/achievements/")
	if id == r.URL.Path {
		id = ""
	}

	switch r.Method {
	case http.MethodGet:
		achievements, err := h.db.ListAchievements(false)
		if err != nil {
			h.jsonError(w, "database error", http.StatusInternalServerError)
			return
		}
		h.jsonResponse(w, achievements)
	case http.MethodPost:
		var achievement model.Achievement
		if err := json.NewDecoder(r.Body).Decode(&achievement); err != nil {
			h.jsonError(w, "invalid json", http.StatusBadRequest)
			return
		}
		if err := validateAchievement(&achievement); err != nil {
			h.jsonError(w, err.Error(), http.StatusBadRequest)
			return
		}
		idBytes := make([]byte, 12)
		if _, err := rand.Read(idBytes); err != nil {
			h.jsonError(w, "could not generate id", http.StatusInternalServerError)
			return
		}
		achievement.ID = "ACH-" + hex.EncodeToString(idBytes)
		if err := h.db.CreateAchievement(achievement); err != nil {
			h.jsonError(w, "database error", http.StatusInternalServerError)
			return
		}
		h.jsonResponseStatus(w, achievement, http.StatusCreated)
	case http.MethodPut:
		if id == "" {
			h.jsonError(w, "achievement id is required", http.StatusBadRequest)
			return
		}
		var achievement model.Achievement
		if err := json.NewDecoder(r.Body).Decode(&achievement); err != nil {
			h.jsonError(w, "invalid json", http.StatusBadRequest)
			return
		}
		achievement.ID = id
		if err := validateAchievement(&achievement); err != nil {
			h.jsonError(w, err.Error(), http.StatusBadRequest)
			return
		}
		if err := h.db.UpdateAchievement(achievement); err != nil {
			h.jsonError(w, "database error", http.StatusInternalServerError)
			return
		}
		h.jsonResponse(w, achievement)
	case http.MethodDelete:
		if id == "" {
			h.jsonError(w, "achievement id is required", http.StatusBadRequest)
			return
		}
		if err := h.db.DeleteAchievement(id); err != nil {
			h.jsonError(w, "database error", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	default:
		h.jsonError(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

func validateAchievement(a *model.Achievement) error {
	a.Title = strings.TrimSpace(a.Title)
	a.Description = strings.TrimSpace(a.Description)
	a.Metric = strings.ToUpper(strings.TrimSpace(a.Metric))
	a.Icon = strings.TrimSpace(a.Icon)
	a.Color = strings.TrimSpace(a.Color)
	if a.Title == "" || a.Description == "" || a.Target <= 0 {
		return errors.New("invalid achievement")
	}
	if a.Metric != "HORAS" && a.Metric != "GANHOS" {
		return errors.New("invalid achievement")
	}
	if a.Icon == "" {
		a.Icon = "trophy"
	}
	if a.Color == "" {
		a.Color = "pink"
	}
	return nil
}
