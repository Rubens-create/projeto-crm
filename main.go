package main

import (
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"path/filepath"
	"sync"
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

var dashboard = Dashboard{
	Services: []Service{
		{"SV-1048", "Clínica Aurora", "Marina Costa", "Recepção e suporte", 6.5, 48, "Em andamento", "Hoje, 08:30"},
		{"SV-1047", "Ateliê Horizonte", "Rafael Mendes", "Manutenção elétrica", 4, 72, "Aguardando", "Hoje, 07:45"},
		{"SV-1046", "Grupo Nativa", "Beatriz Lima", "Limpeza operacional", 8, 42, "Concluído", "Ontem, 17:20"},
		{"SV-1045", "Studio 22", "Lucas Rocha", "Assistência administrativa", 5.5, 55, "Concluído", "Ontem, 15:10"},
	}, Stats: map[string]any{"active": 28, "hours": 186.5, "pending": 12, "revenue": 12840.00},
}

var provider = struct {
	sync.Mutex
	Options []ServiceOption
	Timer   TimerState
}{Options: []ServiceOption{
	{"OPT-01", "Limpeza operacional", "Rotina de limpeza e organização de ambientes", 42, true},
	{"OPT-02", "Recepção e suporte", "Atendimento, recepção e suporte administrativo", 48, true},
	{"OPT-03", "Assistência administrativa", "Apoio em rotinas administrativas", 55, true},
	{"OPT-04", "Manutenção elétrica", "Manutenção preventiva e pequenos reparos", 72, true},
}}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/dashboard", dashboardHandler)
	mux.HandleFunc("/api/provider", providerHandler)
	mux.HandleFunc("/api/provider/timer", timerHandler)
	mux.HandleFunc("/api/admin/services", adminServicesHandler)
	mux.Handle("/static.css", http.FileServer(http.Dir("web")))
	mux.Handle("/app.js", http.FileServer(http.Dir("web")))
	mux.Handle("/provider.js", http.FileServer(http.Dir("web")))
	mux.Handle("/admin-services.js", http.FileServer(http.Dir("web")))
	mux.HandleFunc("/", pageHandler)
	server := &http.Server{Addr: ":8080", Handler: logging(mux), ReadHeaderTimeout: 5 * time.Second}
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
	jsonResponse(w, dashboard)
}

func providerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", 405)
		return
	}
	provider.Lock()
	defer provider.Unlock()
	elapsed := provider.Timer.ElapsedSeconds
	if provider.Timer.Active {
		elapsed += int64(time.Since(provider.Timer.StartedAt).Seconds())
	}
	var rate float64
	for _, option := range provider.Options {
		if option.ID == provider.Timer.ServiceID {
			rate = option.Rate
			break
		}
	}
	hours := 186.5 + float64(elapsed)/3600
	earned := 9842.50 + hours*rate
	jsonResponse(w, ProviderView{provider.Options, provider.Timer, hours, earned, earned - 9842.50})
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
	provider.Lock()
	defer provider.Unlock()
	switch input.Action {
	case "start":
		if provider.Timer.Active {
			http.Error(w, "timer already active", 409)
			return
		}
		found := false
		for _, option := range provider.Options {
			if option.ID == input.ServiceID && option.Active {
				found = true
			}
		}
		if !found {
			http.Error(w, "service not found", 404)
			return
		}
		provider.Timer = TimerState{Active: true, ServiceID: input.ServiceID, StartedAt: time.Now()}
	case "stop":
		if provider.Timer.Active {
			provider.Timer.ElapsedSeconds += int64(time.Since(provider.Timer.StartedAt).Seconds())
		}
		provider.Timer.Active = false
	default:
		http.Error(w, "invalid action", 400)
		return
	}
	jsonResponse(w, provider.Timer)
}

func adminServicesHandler(w http.ResponseWriter, r *http.Request) {
	provider.Lock()
	defer provider.Unlock()
	if r.Method == http.MethodPost {
		var option ServiceOption
		if json.NewDecoder(r.Body).Decode(&option) != nil || option.Name == "" || option.Rate <= 0 {
			http.Error(w, "invalid service", 400)
			return
		}
		option.ID = "OPT-" + time.Now().Format("150405")
		option.Active = true
		provider.Options = append(provider.Options, option)
	}
	if r.Method != http.MethodGet && r.Method != http.MethodPost {
		http.Error(w, "method not allowed", 405)
		return
	}
	jsonResponse(w, provider.Options)
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
