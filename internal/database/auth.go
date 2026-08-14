package database

import (
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"errors"
	"strings"
	"time"

	"crm-terceirizados/internal/model"

	"golang.org/x/crypto/bcrypt"
)

var ErrInvalidCredentials = errors.New("invalid credentials")

func (d *DB) CreateProviderAccount(name, email, phone, specialty, password string) (model.AuthUser, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return model.AuthUser{}, err
	}
	tx, err := d.conn.Begin()
	if err != nil {
		return model.AuthUser{}, err
	}
	defer tx.Rollback()

	professionalID := "PRO-" + randomID()[:16]
	if _, err := tx.Exec(`INSERT INTO professionals (id, name, email, phone, specialty, rate, hours, earned, active)
		VALUES ($1, $2, $3, $4, $5, 100.00, 0, 0, true)`, professionalID, strings.TrimSpace(name), email, strings.TrimSpace(phone), strings.TrimSpace(specialty)); err != nil {
		return model.AuthUser{}, err
	}
	userID := randomID()
	if _, err := tx.Exec(`INSERT INTO users (id, email, password_hash, role, professional_id)
		VALUES ($1, $2, $3, $4, $5)`, userID, email, string(hash), model.RoleProvider, professionalID); err != nil {
		return model.AuthUser{}, err
	}
	if err := tx.Commit(); err != nil {
		return model.AuthUser{}, err
	}
	return model.AuthUser{ID: userID, Email: email, Role: model.RoleProvider, ProfessionalID: professionalID}, nil
}

func (d *DB) EnsureBootstrapAdmin(email, password string) error {
	var count int
	if err := d.conn.QueryRow("SELECT COUNT(*) FROM users").Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	if strings.TrimSpace(email) == "" || password == "" {
		return errors.New("ADMIN_EMAIL and ADMIN_PASSWORD are required when no users exist")
	}
	return d.CreateUser(email, password, model.RoleAdmin, "")
}

func (d *DB) CreateUser(email, password, role, professionalID string) error {
	if role != model.RoleAdmin && role != model.RoleProvider {
		return errors.New("invalid role")
	}
	if role == model.RoleProvider && professionalID == "" {
		return errors.New("professional id is required for providers")
	}
	if role == model.RoleAdmin && professionalID != "" {
		return errors.New("admins cannot have a professional id")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	_, err = d.conn.Exec(`INSERT INTO users (id, email, password_hash, role, professional_id)
		VALUES ($1, $2, $3, $4, NULLIF($5, ''))`, randomID(), strings.ToLower(strings.TrimSpace(email)), string(hash), role, professionalID)
	return err
}

func (d *DB) AuthenticateUser(email, password string) (model.AuthUser, error) {
	var user model.AuthUser
	err := d.conn.QueryRow(`SELECT id, email, password_hash, role, COALESCE(professional_id, '')
		FROM users WHERE email = $1`, strings.ToLower(strings.TrimSpace(email))).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.Role, &user.ProfessionalID,
	)
	if err != nil || bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)) != nil {
		return model.AuthUser{}, ErrInvalidCredentials
	}
	user.PasswordHash = ""
	return user, nil
}

func (d *DB) CreateSession(userID string, expiresAt time.Time) (string, error) {
	token := randomID()
	_, err := d.conn.Exec(`INSERT INTO user_sessions (id, user_id, expires_at) VALUES ($1, $2, $3)`, hashToken(token), userID, expiresAt)
	return token, err
}

func (d *DB) GetSessionUser(token string) (model.AuthUser, error) {
	var user model.AuthUser
	err := d.conn.QueryRow(`SELECT u.id, u.email, u.role, COALESCE(u.professional_id, '')
		FROM user_sessions s JOIN users u ON u.id = s.user_id
		WHERE s.id = $1 AND s.expires_at > CURRENT_TIMESTAMP`, hashToken(token)).Scan(
		&user.ID, &user.Email, &user.Role, &user.ProfessionalID,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return model.AuthUser{}, ErrInvalidCredentials
	}
	return user, err
}

func (d *DB) DeleteSession(token string) error {
	_, err := d.conn.Exec("DELETE FROM user_sessions WHERE id = $1", hashToken(token))
	return err
}

func randomID() string {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		panic("cannot generate secure random identifier")
	}
	return hex.EncodeToString(buf)
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}
