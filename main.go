package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"path/filepath"
	"time"
)

type Service struct {
	ID           string  `json:"id"`
	Client       string  `json:"client"`
	Professional string  `json:"professional"`
	Service      string  `json:"service"`
	Hours        float64 `json:"hours"`
	Rate         float64 `json:"rate"`
	Status       string  `json:"status"`
	Date         string  `json:"date"`
}

type Dashboard struct {
	Services []Service      `json:"services"`
	Stats    map[string]any `json:"stats"`
}

type ServiceOption struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Rate        float64 `json:"rate"`
	Active      bool    `json:"active"`
	Bedrooms    int     `json:"bedrooms"`
	Bathrooms   int     `json:"bathrooms"`
	LivingRooms int     `json:"livingRooms"`
	Sqm         int     `json:"sqm"`
	Rooms       string  `json:"rooms"`
	Image       string  `json:"image"`
	EstTime     string  `json:"estTime"`
}

type TimerState struct {
	Active         bool      `json:"active"`
	ServiceID      string    `json:"serviceId"`
	StartedAt      time.Time `json:"startedAt"`
	ElapsedSeconds int64     `json:"elapsedSeconds"`
}

type ProviderView struct {
	Options     []ServiceOption `json:"options"`
	Timer       TimerState      `json:"timer"`
	TotalHours  float64         `json:"totalHours"`
	TotalEarned float64         `json:"totalEarned"`
	TodayEarned float64         `json:"todayEarned"`
}

func main() {
	initDB()

	mux := http.NewServeMux()
	mux.HandleFunc("/api/dashboard", dashboardHandler)
	mux.HandleFunc("/api/provider", providerHandler)
	mux.HandleFunc("/api/provider/timer", timerHandler)
	mux.HandleFunc("/api/admin/services", adminServicesHandler)

	mux.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("web"))))
	mux.Handle("/static.css", http.FileServer(http.Dir("web")))
	mux.Handle("/app.js", http.FileServer(http.Dir("web")))
	mux.Handle("/provider.js", http.FileServer(http.Dir("web")))
	mux.Handle("/admin-services.js", http.FileServer(http.Dir("web")))
	mux.Handle("/admin-professionals.js", http.FileServer(http.Dir("web")))
	mux.Handle("/admin-clients.js", http.FileServer(http.Dir("web")))
	mux.Handle("/admin-payments.js", http.FileServer(http.Dir("web")))
	mux.Handle("/admin-reports.js", http.FileServer(http.Dir("web")))
	mux.HandleFunc("/manifest.json", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/manifest+json")
		http.ServeFile(w, r, filepath.Join("web", "manifest.json"))
	})
	mux.HandleFunc("/sw.js", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/javascript")
		http.ServeFile(w, r, filepath.Join("web", "sw.js"))
	})
	mux.HandleFunc("/", pageHandler)

	server := &http.Server{
		Addr:              ":8080",
		Handler:           logging(mux),
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Println("CRM rodando em http://localhost:8080")
	log.Fatal(server.ListenAndServe())
}

func pageHandler(w http.ResponseWriter, r *http.Request) {
	file := "index.html"
	switch r.URL.Path {
	case "/prestador":
		file = "provider.html"
	case "/admin/servicos":
		file = "admin-services.html"
	case "/admin/profissionais":
		file = "admin-professionals.html"
	case "/admin/clientes":
		file = "admin-clients.html"
	case "/admin/pagamentos":
		file = "admin-payments.html"
	case "/admin/relatorios":
		file = "admin-reports.html"
	case "/admin/configuracoes":
		file = "admin-config.html"
	case "/":
	default:
		http.NotFound(w, r)
		return
	}
	tmpl, err := template.ParseFiles(filepath.Join("web", file))
	if err != nil {
		http.Error(w, "template error", 500)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_ = tmpl.Execute(w, nil)
}

func dashboardHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", 405)
		return
	}

	rows, err := db.Query("SELECT id, client, professional, service, hours, rate, status, date_str FROM services ORDER BY created_at DESC, id DESC")
	if err != nil {
		http.Error(w, "database error", 500)
		return
	}
	defer rows.Close()

	services := make([]Service, 0)
	var totalHours float64
	var totalRevenue float64
	var activeCount int
	var pendingCount int

	for rows.Next() {
		var s Service
		if err := rows.Scan(&s.ID, &s.Client, &s.Professional, &s.Service, &s.Hours, &s.Rate, &s.Status, &s.Date); err != nil {
			continue
		}
		services = append(services, s)
		totalHours += s.Hours
		totalRevenue += s.Hours * s.Rate
		if s.Status == "Em andamento" {
			activeCount++
		} else if s.Status == "Aguardando" {
			pendingCount++
		}
	}

	dash := Dashboard{
		Services: services,
		Stats: map[string]any{
			"active":  activeCount,
			"hours":   totalHours,
			"pending": pendingCount,
			"revenue": totalRevenue,
		},
	}

	jsonResponse(w, dash)
}

func getOptions() ([]ServiceOption, error) {
	rows, err := db.Query("SELECT id, name, description, rate, active, COALESCE(bedrooms, 1), COALESCE(bathrooms, 1), COALESCE(living_rooms, 1), COALESCE(sqm, 45), COALESCE(rooms, '3 cômodos'), COALESCE(image, '/assets/loft.jpg'), COALESCE(est_time, '2.5h') FROM service_options WHERE active = true ORDER BY id ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	options := make([]ServiceOption, 0)
	for rows.Next() {
		var opt ServiceOption
		if err := rows.Scan(&opt.ID, &opt.Name, &opt.Description, &opt.Rate, &opt.Active, &opt.Bedrooms, &opt.Bathrooms, &opt.LivingRooms, &opt.Sqm, &opt.Rooms, &opt.Image, &opt.EstTime); err != nil {
			continue
		}
		options = append(options, opt)
	}
	return options, nil
}

func getAllOptions() ([]ServiceOption, error) {
	rows, err := db.Query("SELECT id, name, description, rate, active, COALESCE(bedrooms, 1), COALESCE(bathrooms, 1), COALESCE(living_rooms, 1), COALESCE(sqm, 45), COALESCE(rooms, '3 cômodos'), COALESCE(image, '/assets/loft.jpg'), COALESCE(est_time, '2.5h') FROM service_options ORDER BY id ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	options := make([]ServiceOption, 0)
	for rows.Next() {
		var opt ServiceOption
		if err := rows.Scan(&opt.ID, &opt.Name, &opt.Description, &opt.Rate, &opt.Active, &opt.Bedrooms, &opt.Bathrooms, &opt.LivingRooms, &opt.Sqm, &opt.Rooms, &opt.Image, &opt.EstTime); err != nil {
			continue
		}
		options = append(options, opt)
	}
	return options, nil
}

func getTimerState() (TimerState, error) {
	var ts TimerState
	err := db.QueryRow("SELECT active, service_id, started_at, elapsed_seconds FROM timer_state WHERE id = 1").
		Scan(&ts.Active, &ts.ServiceID, &ts.StartedAt, &ts.ElapsedSeconds)
	return ts, err
}

func providerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", 405)
		return
	}

	options, err := getOptions()
	if err != nil {
		http.Error(w, "database error", 500)
		return
	}

	timer, err := getTimerState()
	if err != nil {
		http.Error(w, "database error", 500)
		return
	}

	elapsed := timer.ElapsedSeconds
	if timer.Active {
		elapsed += int64(time.Since(timer.StartedAt).Seconds())
	}

	var rate float64
	for _, option := range options {
		if option.ID == timer.ServiceID {
			rate = option.Rate
			break
		}
	}

	hours := 186.5 + float64(elapsed)/3600
	earned := 9842.50 + hours*rate
	todayEarned := earned - 9842.50

	jsonResponse(w, ProviderView{
		Options:     options,
		Timer:       timer,
		TotalHours:  hours,
		TotalEarned: earned,
		TodayEarned: todayEarned,
	})
}

func timerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", 405)
		return
	}

	var input struct {
		Action    string `json:"action"`
		ServiceID string `json:"serviceId"`
	}
	if json.NewDecoder(r.Body).Decode(&input) != nil {
		http.Error(w, "invalid json", 400)
		return
	}

	timer, err := getTimerState()
	if err != nil {
		http.Error(w, "database error", 500)
		return
	}

	switch input.Action {
	case "start":
		if timer.Active {
			http.Error(w, "timer already active", 409)
			return
		}

		options, err := getOptions()
		if err != nil {
			http.Error(w, "database error", 500)
			return
		}

		found := false
		for _, opt := range options {
			if opt.ID == input.ServiceID && opt.Active {
				found = true
				break
			}
		}
		if !found {
			http.Error(w, "service not found", 404)
			return
		}

		now := time.Now()
		_, err = db.Exec("UPDATE timer_state SET active = true, service_id = $1, started_at = $2 WHERE id = 1", input.ServiceID, now)
		if err != nil {
			http.Error(w, "database error", 500)
			return
		}
		timer.Active = true
		timer.ServiceID = input.ServiceID
		timer.StartedAt = now

	case "stop":
		if timer.Active {
			additional := int64(time.Since(timer.StartedAt).Seconds())
			newElapsed := timer.ElapsedSeconds + additional
			_, err = db.Exec("UPDATE timer_state SET active = false, elapsed_seconds = $1 WHERE id = 1", newElapsed)
			if err != nil {
				http.Error(w, "database error", 500)
				return
			}
			timer.Active = false
			timer.ElapsedSeconds = newElapsed
		}
	default:
		http.Error(w, "invalid action", 400)
		return
	}

	jsonResponse(w, timer)
}

func adminServicesHandler(w http.ResponseWriter, r *http.Request) {
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
			http.Error(w, "invalid json", 400)
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
			_, err := db.Exec("UPDATE service_options SET active = NOT active WHERE id = $1", payload.ID)
			if err != nil {
				http.Error(w, "database error", 500)
				return
			}
		case "update":
			if payload.Rate <= 0 {
				http.Error(w, "invalid rate", 400)
				return
			}
			_, err := db.Exec("UPDATE service_options SET rate = $1 WHERE id = $2", payload.Rate, payload.ID)
			if err != nil {
				http.Error(w, "database error", 500)
				return
			}
		default: // create new
			if payload.Name == "" || payload.Rate <= 0 {
				http.Error(w, "invalid service", 400)
				return
			}
			newID := "OPT-" + time.Now().Format("150405")
			if payload.Image == "" {
				payload.Image = "/assets/loft.jpg"
			}
			if payload.EstTime == "" {
				payload.EstTime = "2.5h"
			}
			_, err := db.Exec("INSERT INTO service_options (id, name, description, rate, active, bedrooms, bathrooms, living_rooms, sqm, rooms, image, est_time) VALUES ($1, $2, $3, $4, true, $5, $6, $7, $8, $9, $10, $11)",
				newID, payload.Name, payload.Description, payload.Rate, payload.Bedrooms, payload.Bathrooms, payload.LivingRooms, payload.Sqm, payload.Rooms, payload.Image, payload.EstTime)
			if err != nil {
				http.Error(w, "database error", 500)
				return
			}
		}
	} else if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", 405)
		return
	}

	options, err := getAllOptions()
	if err != nil {
		http.Error(w, "database error", 500)
		return
	}

	jsonResponse(w, options)
}

func jsonResponse(w http.ResponseWriter, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(value)
}

func logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start))
	})
}
