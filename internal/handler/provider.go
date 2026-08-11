package handler

import (
	"net/http"
	"time"

	"crm-terceirizados/internal/middleware"
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

	user, ok := middleware.CurrentUser(r)
	if !ok || user.ProfessionalID == "" {
		h.jsonError(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	professional, err := h.db.GetProfessionalByID(user.ProfessionalID)
	if err != nil {
		h.jsonError(w, "professional not found", http.StatusNotFound)
		return
	}

	timer, err := h.db.GetTimerState(user.ProfessionalID)
	if err != nil {
		h.jsonError(w, "database error", 500)
		return
	}
	executions, err := h.db.ListExecutions(user.ProfessionalID, "")
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

	var completedSeconds int64
	var completedCents int64
	for _, execution := range executions {
		if execution.Status == model.ExecutionCompleted {
			completedSeconds += execution.DurationSeconds
			completedCents += execution.TotalValueCents
		}
	}
	sessionHours := float64(elapsed) / 3600
	hours := float64(completedSeconds)/3600 + sessionHours
	earned := float64(completedCents)/100 + sessionHours*rate
	todayEarned := sessionHours * rate

	h.jsonResponse(w, model.ProviderView{
		Options:      options,
		Timer:        timer,
		Professional: professional,
		TotalHours:   hours,
		TotalEarned:  earned,
		TodayEarned:  todayEarned,
		Executions:   executions,
	})
}
