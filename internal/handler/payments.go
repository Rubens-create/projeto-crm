package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"crm-terceirizados/internal/model"
)

func (h *Handler) AdminPayments(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		var payload struct {
			Action       string  `json:"action"`
			ID           string  `json:"id"`
			Professional string  `json:"professional"`
			Amount       float64 `json:"amount"`
			Hours        float64 `json:"hours"`
			Period       string  `json:"period"`
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			h.jsonError(w, "invalid json", 400)
			return
		}

		if payload.Action == "mark_paid" && payload.ID != "" {
			if err := h.db.UpdatePaymentStatus(payload.ID, "Pago"); err != nil {
				h.jsonError(w, "database error", 500)
				return
			}
		} else if payload.Professional != "" {
			newID := "PAY-" + time.Now().Format("150405")
			dateStr := time.Now().Format("02/01/2006")
			if payload.Period == "" {
				payload.Period = "Semana Atual"
			}
			p := model.Payment{
				ID:           newID,
				Professional: payload.Professional,
				Amount:       payload.Amount,
				Hours:        payload.Hours,
				Period:       payload.Period,
				Date:         dateStr,
			}
			if err := h.db.CreatePayment(p); err != nil {
				h.jsonError(w, "database error", 500)
				return
			}
		}
	} else if r.Method != http.MethodGet {
		h.jsonError(w, "method not allowed", 405)
		return
	}

	list, err := h.db.GetAllPayments()
	if err != nil {
		h.jsonError(w, "database error", 500)
		return
	}
	h.jsonResponse(w, list)
}
