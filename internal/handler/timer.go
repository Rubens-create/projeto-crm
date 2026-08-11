package handler

import (
	"encoding/json"
	"net/http"
	"time"
)

func (h *Handler) Timer(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		h.jsonError(w, "method not allowed", 405)
		return
	}

	var input struct {
		Action    string `json:"action"`
		ServiceID string `json:"serviceId"`
	}
	if json.NewDecoder(r.Body).Decode(&input) != nil {
		h.jsonError(w, "invalid json", 400)
		return
	}

	timer, err := h.db.GetTimerState()
	if err != nil {
		h.jsonError(w, "database error", 500)
		return
	}

	switch input.Action {
	case "start":
		if timer.Active {
			h.jsonError(w, "timer already active", 409)
			return
		}

		options, err := h.db.GetActiveOptions()
		if err != nil {
			h.jsonError(w, "database error", 500)
			return
		}

		found := false
		for _, opt := range options {
			if opt.ID == input.ServiceID {
				found = true
				break
			}
		}
		if !found {
			h.jsonError(w, "service not found", 404)
			return
		}

		now := time.Now()
		err = h.db.StartTimer(input.ServiceID, now)
		if err != nil {
			h.jsonError(w, "database error", 500)
			return
		}
		timer.Active = true
		timer.ServiceID = input.ServiceID
		timer.StartedAt = now

	case "stop":
		if timer.Active {
			additional := int64(time.Since(timer.StartedAt).Seconds())
			newElapsed := timer.ElapsedSeconds + additional
			err = h.db.StopTimer(newElapsed)
			if err != nil {
				h.jsonError(w, "database error", 500)
				return
			}
			timer.Active = false
			timer.ElapsedSeconds = newElapsed
		}
	default:
		h.jsonError(w, "invalid action", 400)
		return
	}

	h.jsonResponse(w, timer)
}
