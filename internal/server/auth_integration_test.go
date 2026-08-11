package server_test

import (
	"bytes"
	"crm-terceirizados/internal/config"
	"crm-terceirizados/internal/database"
	"crm-terceirizados/internal/handler"
	"crm-terceirizados/internal/model"
	"crm-terceirizados/internal/server"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"runtime"
	"testing"
	"time"
)

type testApp struct {
	server *httptest.Server
	db     *database.DB
}

func setupTestApp(t *testing.T) *testApp {
	t.Helper()
	t.Chdir(t.TempDir())

	db, err := database.New(config.Config{
		Server: config.ServerConfig{Port: "0"},
		Database: config.DatabaseConfig{
			URL: "host=127.0.0.1 port=1 user=test dbname=test sslmode=disable connect_timeout=1",
		},
	})
	if err != nil {
		t.Fatalf("database.New() error = %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })

	if err := db.CreateProfessional(model.Professional{ID: "PRO-TEST-01", Name: "Prestador Um", Email: "one@example.com", Specialty: "Limpeza", Rate: 100}); err != nil {
		t.Fatalf("CreateProfessional() error = %v", err)
	}
	if err := db.CreateProfessional(model.Professional{ID: "PRO-TEST-02", Name: "Prestador Dois", Email: "two@example.com", Specialty: "Limpeza", Rate: 100}); err != nil {
		t.Fatalf("CreateProfessional() error = %v", err)
	}
	for _, user := range []struct {
		email, password, role, professionalID string
	}{
		{"admin@example.com", "admin-secret", "ADMIN", ""},
		{"one@example.com", "provider-one-secret", "PRESTADOR", "PRO-TEST-01"},
		{"two@example.com", "provider-two-secret", "PRESTADOR", "PRO-TEST-02"},
	} {
		if err := db.CreateUser(user.email, user.password, user.role, user.professionalID); err != nil {
			t.Fatalf("CreateUser(%q) error = %v", user.email, err)
		}
	}

	ts := httptest.NewServer(server.New(config.Config{Server: config.ServerConfig{Port: "0"}}, handler.New(db)).Handler)
	t.Cleanup(ts.Close)
	return &testApp{server: ts, db: db}
}

func login(t *testing.T, app *testApp, email, password string) *http.Cookie {
	t.Helper()
	body, _ := json.Marshal(map[string]string{"email": email, "password": password})
	res, err := app.server.Client().Post(app.server.URL+"/api/auth/login", "application/json", bytes.NewReader(body))
	if err != nil {
		t.Fatalf("login request error = %v", err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		t.Fatalf("login status = %d", res.StatusCode)
	}
	cookies := res.Cookies()
	if len(cookies) != 1 {
		t.Fatalf("login cookies = %d, want 1", len(cookies))
	}
	return cookies[0]
}

func request(t *testing.T, app *testApp, method, path string, cookie *http.Cookie) *http.Response {
	t.Helper()
	req, err := http.NewRequest(method, app.server.URL+path, nil)
	if err != nil {
		t.Fatalf("NewRequest() error = %v", err)
	}
	if cookie != nil {
		req.AddCookie(cookie)
	}
	res, err := app.server.Client().Do(req)
	if err != nil {
		t.Fatalf("request %s error = %v", path, err)
	}
	return res
}

func TestLoginValidCreatesSecureSessionWithoutSensitiveFields(t *testing.T) {
	app := setupTestApp(t)
	cookie := login(t, app, "admin@example.com", "admin-secret")
	if !cookie.HttpOnly || cookie.SameSite != http.SameSiteLaxMode || cookie.Value == "" {
		t.Fatalf("session cookie security settings are invalid: %#v", cookie)
	}

	res := request(t, app, http.MethodGet, "/api/auth/session", cookie)
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		t.Fatalf("session status = %d", res.StatusCode)
	}
	var session map[string]any
	if err := json.NewDecoder(res.Body).Decode(&session); err != nil {
		t.Fatalf("decode session = %v", err)
	}
	if session["role"] != "ADMIN" || session["password"] != nil || session["passwordHash"] != nil {
		t.Fatalf("unexpected session response: %#v", session)
	}
}

func TestLoginRejectsInvalidPassword(t *testing.T) {
	app := setupTestApp(t)
	body := bytes.NewBufferString(`{"email":"admin@example.com","password":"wrong"}`)
	res, err := app.server.Client().Post(app.server.URL+"/api/auth/login", "application/json", body)
	if err != nil {
		t.Fatalf("login request error = %v", err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusUnauthorized {
		t.Fatalf("login status = %d, want %d", res.StatusCode, http.StatusUnauthorized)
	}
}

func TestAdminCanAccessAdminAPI(t *testing.T) {
	app := setupTestApp(t)
	res := request(t, app, http.MethodGet, "/api/admin/services", login(t, app, "admin@example.com", "admin-secret"))
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		t.Fatalf("admin API status = %d", res.StatusCode)
	}
}

func TestProviderCannotAccessAdminAPI(t *testing.T) {
	app := setupTestApp(t)
	res := request(t, app, http.MethodGet, "/api/admin/services", login(t, app, "one@example.com", "provider-one-secret"))
	defer res.Body.Close()
	if res.StatusCode != http.StatusForbidden {
		t.Fatalf("provider admin API status = %d, want %d", res.StatusCode, http.StatusForbidden)
	}
}

func TestInvalidSessionCannotAccessProtectedRoute(t *testing.T) {
	app := setupTestApp(t)
	req, err := http.NewRequest(http.MethodGet, app.server.URL+"/prestador", nil)
	if err != nil {
		t.Fatalf("NewRequest() error = %v", err)
	}
	req.AddCookie(&http.Cookie{Name: "zygg_session", Value: "expired-or-invalid"})
	client := *app.server.Client()
	client.CheckRedirect = func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }
	res, err := client.Do(req)
	if err != nil {
		t.Fatalf("protected route request error = %v", err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusSeeOther {
		t.Fatalf("invalid session page status = %d, want %d", res.StatusCode, http.StatusSeeOther)
	}
}

func TestExpiredSessionCannotAccessSessionAPI(t *testing.T) {
	app := setupTestApp(t)
	user, err := app.db.AuthenticateUser("admin@example.com", "admin-secret")
	if err != nil {
		t.Fatalf("AuthenticateUser() error = %v", err)
	}
	token, err := app.db.CreateSession(user.ID, time.Now().Add(-time.Hour))
	if err != nil {
		t.Fatalf("CreateSession() error = %v", err)
	}
	res := request(t, app, http.MethodGet, "/api/auth/session", &http.Cookie{Name: "zygg_session", Value: token})
	defer res.Body.Close()
	if res.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expired session status = %d, want %d", res.StatusCode, http.StatusUnauthorized)
	}
}

func TestLogoutRevokesSession(t *testing.T) {
	app := setupTestApp(t)
	cookie := login(t, app, "admin@example.com", "admin-secret")
	req, err := http.NewRequest(http.MethodPost, app.server.URL+"/api/auth/logout", nil)
	if err != nil {
		t.Fatalf("NewRequest() error = %v", err)
	}
	req.AddCookie(cookie)
	res, err := app.server.Client().Do(req)
	if err != nil {
		t.Fatalf("logout request error = %v", err)
	}
	res.Body.Close()
	if res.StatusCode != http.StatusNoContent {
		t.Fatalf("logout status = %d", res.StatusCode)
	}
	res = request(t, app, http.MethodGet, "/api/auth/session", cookie)
	defer res.Body.Close()
	if res.StatusCode != http.StatusUnauthorized {
		t.Fatalf("revoked session status = %d, want %d", res.StatusCode, http.StatusUnauthorized)
	}
}

func TestProviderOnlySeesOwnProfessionalData(t *testing.T) {
	app := setupTestApp(t)
	res := request(t, app, http.MethodGet, "/api/provider?professional_id=PRO-TEST-02", login(t, app, "one@example.com", "provider-one-secret"))
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		t.Fatalf("provider API status = %d", res.StatusCode)
	}
	var payload struct {
		Professional struct {
			ID string `json:"id"`
		} `json:"professional"`
	}
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		t.Fatalf("decode provider response = %v", err)
	}
	if payload.Professional.ID != "PRO-TEST-01" {
		t.Fatalf("provider data id = %q, want own professional id", payload.Professional.ID)
	}
}

func TestProviderTimersAreIsolated(t *testing.T) {
	app := setupTestApp(t)
	first := login(t, app, "one@example.com", "provider-one-secret")
	second := login(t, app, "two@example.com", "provider-two-secret")

	for _, start := range []struct {
		cookie    *http.Cookie
		serviceID string
	}{{first, "OPT-01"}, {second, "OPT-02"}} {
		body := bytes.NewBufferString(`{"action":"start","serviceId":"` + start.serviceID + `"}`)
		req, _ := http.NewRequest(http.MethodPost, app.server.URL+"/api/provider/timer", body)
		req.Header.Set("Content-Type", "application/json")
		req.AddCookie(start.cookie)
		res, err := app.server.Client().Do(req)
		if err != nil {
			t.Fatalf("start timer request error = %v", err)
		}
		res.Body.Close()
		if res.StatusCode != http.StatusOK {
			t.Fatalf("start timer status = %d", res.StatusCode)
		}
	}

	for _, expected := range []struct {
		cookie    *http.Cookie
		serviceID string
	}{{first, "OPT-01"}, {second, "OPT-02"}} {
		res := request(t, app, http.MethodGet, "/api/provider", expected.cookie)
		var payload struct {
			Timer struct {
				ServiceID string `json:"serviceId"`
			} `json:"timer"`
		}
		if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
			res.Body.Close()
			t.Fatalf("decode timer response = %v", err)
		}
		res.Body.Close()
		if payload.Timer.ServiceID != expected.serviceID {
			t.Fatalf("timer service id = %q, want %q", payload.Timer.ServiceID, expected.serviceID)
		}
	}
}

func TestProviderMutationRejectsCrossSiteOrigin(t *testing.T) {
	app := setupTestApp(t)
	req, err := http.NewRequest(http.MethodPost, app.server.URL+"/api/provider/timer", bytes.NewBufferString(`{"action":"start","serviceId":"OPT-01"}`))
	if err != nil {
		t.Fatalf("NewRequest() error = %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Origin", "https://attacker.example")
	req.AddCookie(login(t, app, "one@example.com", "provider-one-secret"))
	res, err := app.server.Client().Do(req)
	if err != nil {
		t.Fatalf("cross-site mutation request error = %v", err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusForbidden {
		t.Fatalf("cross-site mutation status = %d, want %d", res.StatusCode, http.StatusForbidden)
	}
}

func TestUntrustedForwardedProtoDoesNotSetSecureCookie(t *testing.T) {
	app := setupTestApp(t)
	req, err := http.NewRequest(http.MethodPost, app.server.URL+"/api/auth/login", bytes.NewBufferString(`{"email":"admin@example.com","password":"admin-secret"}`))
	if err != nil {
		t.Fatalf("NewRequest() error = %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Forwarded-Proto", "https")
	res, err := app.server.Client().Do(req)
	if err != nil {
		t.Fatalf("login request error = %v", err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK || len(res.Cookies()) != 1 {
		t.Fatalf("login status/cookie count = %d/%d", res.StatusCode, len(res.Cookies()))
	}
	if res.Cookies()[0].Secure {
		t.Fatal("untrusted X-Forwarded-Proto must not control cookie Secure")
	}
}

func TestProviderRecoversLegacyTimerWithoutExecution(t *testing.T) {
	app := setupTestApp(t)
	if err := app.db.StartTimer("PRO-TEST-01", "OPT-01", time.Now()); err != nil {
		t.Fatalf("StartTimer() error = %v", err)
	}
	body := bytes.NewBufferString(`{"action":"start","serviceId":"OPT-02"}`)
	req, err := http.NewRequest(http.MethodPost, app.server.URL+"/api/provider/timer", body)
	if err != nil {
		t.Fatalf("NewRequest() error = %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(login(t, app, "one@example.com", "provider-one-secret"))
	res, err := app.server.Client().Do(req)
	if err != nil {
		t.Fatalf("start request error = %v", err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		t.Fatalf("legacy timer recovery status = %d, want %d", res.StatusCode, http.StatusOK)
	}
}

func TestProviderExecutionLifecycleAndIsolation(t *testing.T) {
	app := setupTestApp(t)
	first := login(t, app, "one@example.com", "provider-one-secret")
	second := login(t, app, "two@example.com", "provider-two-secret")

	callTimer := func(cookie *http.Cookie, action, serviceID string) *http.Response {
		body, _ := json.Marshal(map[string]string{"action": action, "serviceId": serviceID, "professionalId": "PRO-TEST-02", "totalValue": "1"})
		req, err := http.NewRequest(http.MethodPost, app.server.URL+"/api/provider/timer", bytes.NewReader(body))
		if err != nil {
			t.Fatalf("NewRequest() error = %v", err)
		}
		req.Header.Set("Content-Type", "application/json")
		req.AddCookie(cookie)
		res, err := app.server.Client().Do(req)
		if err != nil {
			t.Fatalf("timer request error = %v", err)
		}
		return res
	}

	res := callTimer(first, "start", "OPT-01")
	if res.StatusCode != http.StatusOK {
		res.Body.Close()
		t.Fatalf("start status = %d", res.StatusCode)
	}
	var started struct {
		Execution struct {
			ID             string `json:"id"`
			ProfessionalID string `json:"professionalId"`
			Status         string `json:"status"`
		} `json:"execution"`
	}
	if err := json.NewDecoder(res.Body).Decode(&started); err != nil {
		res.Body.Close()
		t.Fatalf("decode start = %v", err)
	}
	res.Body.Close()
	if started.Execution.ID == "" || started.Execution.ProfessionalID != "PRO-TEST-01" || started.Execution.Status != "EM_ANDAMENTO" {
		t.Fatalf("unexpected execution start: %#v", started.Execution)
	}

	res = callTimer(first, "start", "OPT-02")
	res.Body.Close()
	if res.StatusCode != http.StatusConflict {
		t.Fatalf("duplicate active execution status = %d", res.StatusCode)
	}
	for _, action := range []string{"pause", "resume", "finish"} {
		res = callTimer(first, action, "")
		res.Body.Close()
		if res.StatusCode != http.StatusOK {
			t.Fatalf("%s status = %d", action, res.StatusCode)
		}
	}

	res = request(t, app, http.MethodGet, "/api/provider/executions/"+started.Execution.ID, second)
	res.Body.Close()
	if res.StatusCode != http.StatusNotFound {
		t.Fatalf("other provider execution status = %d, want %d", res.StatusCode, http.StatusNotFound)
	}
	res = request(t, app, http.MethodGet, "/api/provider/executions/"+started.Execution.ID, first)
	res.Body.Close()
	if res.StatusCode != http.StatusOK {
		t.Fatalf("own provider execution status = %d", res.StatusCode)
	}
	res = request(t, app, http.MethodGet, "/api/admin/executions", login(t, app, "admin@example.com", "admin-secret"))
	res.Body.Close()
	if res.StatusCode != http.StatusOK {
		t.Fatalf("admin executions status = %d", res.StatusCode)
	}
}

func TestAdminPropertyLifecycleAndDeleteConflict(t *testing.T) {
	app := setupTestApp(t)
	cookie := login(t, app, "admin@example.com", "admin-secret")

	post := func(payload map[string]any) *http.Response {
		body, _ := json.Marshal(payload)
		req, err := http.NewRequest(http.MethodPost, app.server.URL+"/api/admin/properties", bytes.NewReader(body))
		if err != nil {
			t.Fatalf("NewRequest() error = %v", err)
		}
		req.Header.Set("Content-Type", "application/json")
		req.AddCookie(cookie)
		res, err := app.server.Client().Do(req)
		if err != nil {
			t.Fatalf("property request error = %v", err)
		}
		return res
	}

	res := post(map[string]any{
		"action": "create", "name": "Casa API", "clientId": "CLI-01", "address": "Rua API, 10",
		"bedrooms": 2, "bathrooms": 1, "livingRooms": 1, "sqm": 80, "estimatedTime": "3h",
	})
	if res.StatusCode != http.StatusOK {
		res.Body.Close()
		t.Fatalf("create property status = %d", res.StatusCode)
	}
	var properties []model.Property
	if err := json.NewDecoder(res.Body).Decode(&properties); err != nil {
		res.Body.Close()
		t.Fatalf("decode properties = %v", err)
	}
	res.Body.Close()
	var created model.Property
	for _, property := range properties {
		if property.Name == "Casa API" {
			created = property
			break
		}
	}
	if created.ID == "" || created.ClientID != "CLI-01" {
		t.Fatalf("created property not returned: %#v", created)
	}

	res = post(map[string]any{
		"action": "update", "id": created.ID, "name": "Casa API Editada", "clientId": "CLI-02",
		"address": "Rua Editada, 20", "bedrooms": 3, "bathrooms": 2, "sqm": 95,
		"estimatedTime": "4h", "status": model.PropertyActive,
	})
	if res.StatusCode != http.StatusOK {
		res.Body.Close()
		t.Fatalf("update property status = %d", res.StatusCode)
	}
	properties = nil
	if err := json.NewDecoder(res.Body).Decode(&properties); err != nil {
		res.Body.Close()
		t.Fatalf("decode updated properties = %v", err)
	}
	res.Body.Close()
	for _, property := range properties {
		if property.ID == created.ID {
			created = property
			break
		}
	}
	if created.Name != "Casa API Editada" || created.ClientID != "CLI-02" || created.Sqm != 95 {
		t.Fatalf("updated property not returned: %#v", created)
	}

	res = post(map[string]any{"action": "archive", "id": created.ID})
	if res.StatusCode != http.StatusOK {
		res.Body.Close()
		t.Fatalf("archive property status = %d", res.StatusCode)
	}
	res.Body.Close()

	res = post(map[string]any{"action": "delete", "id": "IMO-01"})
	res.Body.Close()
	if res.StatusCode != http.StatusConflict {
		t.Fatalf("delete linked property status = %d, want %d", res.StatusCode, http.StatusConflict)
	}

	res = post(map[string]any{"action": "delete", "id": created.ID})
	res.Body.Close()
	if res.StatusCode != http.StatusOK {
		t.Fatalf("delete unlinked property status = %d", res.StatusCode)
	}
}

func TestAdminCanAssociateServiceToProperty(t *testing.T) {
	app := setupTestApp(t)
	property := model.Property{ID: "IMO-SERVICE-API", Name: "Imóvel da API", Status: model.PropertyActive}
	if err := app.db.CreateProperty(property); err != nil {
		t.Fatalf("CreateProperty() error = %v", err)
	}
	payload, _ := json.Marshal(map[string]any{
		"action": "create", "propertyId": property.ID, "description": "Limpeza pela API",
		"rate": 145, "estTime": "2h",
	})
	req, err := http.NewRequest(http.MethodPost, app.server.URL+"/api/admin/services", bytes.NewReader(payload))
	if err != nil {
		t.Fatalf("NewRequest() error = %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(login(t, app, "admin@example.com", "admin-secret"))
	res, err := app.server.Client().Do(req)
	if err != nil {
		t.Fatalf("service request error = %v", err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		t.Fatalf("create service status = %d", res.StatusCode)
	}
	var options []model.ServiceOption
	if err := json.NewDecoder(res.Body).Decode(&options); err != nil {
		t.Fatalf("decode services = %v", err)
	}
	for _, option := range options {
		if option.PropertyID == property.ID && option.Description == "Limpeza pela API" {
			return
		}
	}
	t.Fatal("created service/property relationship not returned")
}

func TestAdminPropertiesPageIsRegistered(t *testing.T) {
	app := setupTestApp(t)
	_, currentFile, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("runtime.Caller failed")
	}
	t.Chdir(filepath.Join(filepath.Dir(currentFile), "..", ".."))
	res := request(t, app, http.MethodGet, "/admin/imoveis", login(t, app, "admin@example.com", "admin-secret"))
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		t.Fatalf("properties page status = %d, want %d", res.StatusCode, http.StatusOK)
	}
}
