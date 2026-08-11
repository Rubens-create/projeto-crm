package handler

import (
	"net/http"
	"time"

	"crm-terceirizados/internal/model"
)

func (h *Handler) Provider(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		h.jsonError(w, "method not allowed", 405)
		return
	}

	options, err := h.db.GetActiveOptions()
	if err != nil {
		h.jsonError(w, "database error", 500)
		return
	}

	timer, err := h.db.GetTimerState()
	if err != nil {
		h.jsonError(w, "database error", 500)
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

	h.jsonResponse(w, model.ProviderView{
		Options:     options,
		Timer:       timer,
		TotalHours:  hours,
		TotalEarned: earned,
		TodayEarned: todayEarned,
	})
}
