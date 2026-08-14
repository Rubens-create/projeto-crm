package handler

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"crm-terceirizados/internal/middleware"
)

const sessionLifetime = 24 * time.Hour

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		h.jsonError(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil || strings.TrimSpace(input.Email) == "" || input.Password == "" {
		h.jsonError(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	user, err := h.db.AuthenticateUser(input.Email, input.Password)
	if err != nil {
		h.jsonError(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	expiresAt := time.Now().Add(sessionLifetime)
	token, err := h.db.CreateSession(user.ID, expiresAt)
	if err != nil {
		h.jsonError(w, "session error", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "zygg_session",
		Value:    token,
		Path:     "/",
		Expires:  expiresAt,
		MaxAge:   int(sessionLifetime.Seconds()),
		HttpOnly: true,
		Secure:   requestIsHTTPS(r),
		SameSite: http.SameSiteLaxMode,
	})
	h.jsonResponse(w, user)
}

func (h *Handler) ProviderSignup(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		h.jsonError(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var input struct {
		Name                 string `json:"name"`
		Email                string `json:"email"`
		Phone                string `json:"phone"`
		Specialty            string `json:"specialty"`
		Password             string `json:"password"`
		PasswordConfirmation string `json:"passwordConfirmation"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil || strings.TrimSpace(input.Name) == "" || strings.TrimSpace(input.Email) == "" || strings.TrimSpace(input.Phone) == "" || strings.TrimSpace(input.Specialty) == "" || len(input.Password) < 8 || input.Password != input.PasswordConfirmation {
		h.jsonError(w, "invalid signup data", http.StatusBadRequest)
		return
	}
	user, err := h.db.CreateProviderAccount(input.Name, input.Email, input.Phone, input.Specialty, input.Password)
	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "unique") {
			h.jsonError(w, "email already registered", http.StatusConflict)
			return
		}
		h.jsonError(w, "could not create account", http.StatusInternalServerError)
		return
	}
	h.jsonResponseStatus(w, user, http.StatusCreated)
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		h.jsonError(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if cookie, err := r.Cookie("zygg_session"); err == nil {
		_ = h.db.DeleteSession(cookie.Value)
	}
	http.SetCookie(w, &http.Cookie{Name: "zygg_session", Value: "", Path: "/", MaxAge: -1, HttpOnly: true, Secure: requestIsHTTPS(r), SameSite: http.SameSiteLaxMode})
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) Session(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		h.jsonError(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	user, ok := middleware.CurrentUser(r)
	if !ok {
		h.jsonError(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	h.jsonResponse(w, user)
}

func requestIsHTTPS(r *http.Request) bool {
	return r.TLS != nil
}
