package handler

import (
	"encoding/json"
	"net/http"

	"crm-terceirizados/internal/database"
)

type Handler struct {
	db *database.DB
}

func New(db *database.DB) *Handler {
	return &Handler{db: db}
}

func (h *Handler) Database() *database.DB {
	return h.db
}

func (h *Handler) jsonResponse(w http.ResponseWriter, data any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(data)
}

func (h *Handler) jsonResponseStatus(w http.ResponseWriter, data any, status int) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

func (h *Handler) jsonError(w http.ResponseWriter, msg string, code int) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": msg})
}
