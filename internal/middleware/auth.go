package middleware

import (
	"context"
	"net/http"
	"net/url"
	"strings"

	"crm-terceirizados/internal/database"
	"crm-terceirizados/internal/model"
)

type authContextKey struct{}

func CurrentUser(r *http.Request) (model.AuthUser, bool) {
	user, ok := r.Context().Value(authContextKey{}).(model.AuthUser)
	return user, ok
}

func RequireRole(db *database.DB, roles ...string) func(http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			user, ok := authenticatedUser(db, r)
			if !ok {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}
			if !hasRole(user.Role, roles) {
				http.Error(w, "forbidden", http.StatusForbidden)
				return
			}
			if isUnsafeMethod(r.Method) && !sameOrigin(r) {
				http.Error(w, "csrf validation failed", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), authContextKey{}, user)))
		}
	}
}

func RequirePageRole(db *database.DB, redirectTo string, roles ...string) func(http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			user, ok := authenticatedUser(db, r)
			if !ok {
				http.Redirect(w, r, redirectTo, http.StatusSeeOther)
				return
			}
			if !hasRole(user.Role, roles) {
				http.Error(w, "forbidden", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), authContextKey{}, user)))
		}
	}
}

func authenticatedUser(db *database.DB, r *http.Request) (model.AuthUser, bool) {
	cookie, err := r.Cookie("zygg_session")
	if err != nil || cookie.Value == "" {
		return model.AuthUser{}, false
	}
	user, err := db.GetSessionUser(cookie.Value)
	return user, err == nil
}

func hasRole(role string, allowed []string) bool {
	for _, expected := range allowed {
		if strings.EqualFold(role, expected) {
			return true
		}
	}
	return false
}

func isUnsafeMethod(method string) bool {
	return method == http.MethodPost || method == http.MethodPut || method == http.MethodPatch || method == http.MethodDelete
}

func sameOrigin(r *http.Request) bool {
	origin := r.Header.Get("Origin")
	if origin == "" {
		return true
	}
	parsed, err := url.Parse(origin)
	return err == nil && parsed.Host == r.Host
}
