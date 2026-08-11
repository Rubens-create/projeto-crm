package handler

import (
	"net/http"

	"crm-terceirizados/internal/model"
)

func (h *Handler) Dashboard(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		h.jsonError(w, "method not allowed", 405)
		return
	}

	servicesList, err := h.db.GetAllServices()
	if err != nil {
		h.jsonError(w, "database error", 500)
		return
	}

	var totalHours float64
	var totalRevenue float64
	var activeCount int
	var pendingCount int

	for _, s := range servicesList {
		totalHours += s.Hours
		totalRevenue += s.Hours * s.Rate
		if s.Status == "Em andamento" {
			activeCount++
		} else if s.Status == "Aguardando" {
			pendingCount++
		}
	}

	dash := model.Dashboard{
		Services: servicesList,
		Stats: map[string]any{
			"active":  activeCount,
			"hours":   totalHours,
			"pending": pendingCount,
			"revenue": totalRevenue,
		},
	}

	h.jsonResponse(w, dash)
}
