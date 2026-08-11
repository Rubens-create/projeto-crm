package handler

import (
	"net/http"
)

func (h *Handler) AdminReports(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		h.jsonError(w, "method not allowed", 405)
		return
	}

	tipo := r.URL.Query().Get("tipo")
	if tipo == "" {
		tipo = "geral"
	}

	var headers []string
	var rows [][]any

	switch tipo {
	case "geral":
		headers = []string{"ID", "Cliente", "Profissional", "Serviço", "Duração", "Valor", "Status", "Data"}
		dbRows, err := h.db.Query("SELECT e.id, COALESCE(c.name, ''), p.name, s.name, e.duration_seconds, e.total_value_cents, e.status, e.started_at FROM service_executions e JOIN professionals p ON p.id=e.professional_id JOIN service_options s ON s.id=e.service_id LEFT JOIN clients c ON c.id=e.client_id ORDER BY e.started_at DESC")
		if err == nil {
			defer dbRows.Close()
			for dbRows.Next() {
				var id, client, prof, serv, status string
				var seconds, cents int64
				var started any
				if err := dbRows.Scan(&id, &client, &prof, &serv, &seconds, &cents, &status, &started); err == nil {
					rows = append(rows, []any{id, client, prof, serv, float64(seconds) / 3600, float64(cents) / 100, status, started})
				}
			}
		}
	case "prestador":
		headers = []string{"ID", "Nome", "Especialidade", "Horas Mês", "Ganhos Mês", "Status"}
		dbRows, err := h.db.Query("SELECT id, name, specialty, hours, earned, active FROM professionals ORDER BY name ASC")
		if err == nil {
			defer dbRows.Close()
			for dbRows.Next() {
				var id, name, spec string
				var hours, earned float64
				var active bool
				if err := dbRows.Scan(&id, &name, &spec, &hours, &earned, &active); err == nil {
					status := "Ativo"
					if !active {
						status = "Inativo"
					}
					rows = append(rows, []any{id, name, spec, hours, earned, status})
				}
			}
		}
	case "cliente":
		headers = []string{"ID", "Nome", "Email", "Telefone", "Propriedades", "Gasto Mensal", "Status"}
		dbRows, err := h.db.Query("SELECT id, name, email, phone, properties, monthly_spend, status FROM clients ORDER BY name ASC")
		if err == nil {
			defer dbRows.Close()
			for dbRows.Next() {
				var id, name, email, phone, status string
				var props int
				var spend float64
				if err := dbRows.Scan(&id, &name, &email, &phone, &props, &spend, &status); err == nil {
					rows = append(rows, []any{id, name, email, phone, props, spend, status})
				}
			}
		}
	case "financeiro":
		headers = []string{"ID", "Profissional", "Período", "Horas", "Valor Pago", "Status", "Data"}
		dbRows, err := h.db.Query("SELECT id, professional, period, hours, amount, status, date_str FROM payments ORDER BY id DESC")
		if err == nil {
			defer dbRows.Close()
			for dbRows.Next() {
				var id, prof, period, status, date string
				var hours, amount float64
				if err := dbRows.Scan(&id, &prof, &period, &hours, &amount, &status, &date); err == nil {
					rows = append(rows, []any{id, prof, period, hours, amount, status, date})
				}
			}
		}
	case "servico":
		headers = []string{"ID", "Nome do Serviço", "Valor Base", "Cômodos", "Tempo Est.", "Status"}
		dbRows, err := h.db.Query("SELECT id, name, rate, rooms, est_time, active FROM service_options ORDER BY id ASC")
		if err == nil {
			defer dbRows.Close()
			for dbRows.Next() {
				var id, name, rooms, est string
				var rate float64
				var active bool
				if err := dbRows.Scan(&id, &name, &rate, &rooms, &est, &active); err == nil {
					status := "Ativo"
					if !active {
						status = "Inativo"
					}
					rows = append(rows, []any{id, name, rate, rooms, est, status})
				}
			}
		}
	}

	summary, err := h.db.ExecutionSummary()
	if err != nil {
		h.jsonError(w, "database error", http.StatusInternalServerError)
		return
	}
	h.jsonResponse(w, map[string]any{
		"headers": headers,
		"rows":    rows,
		"stats": map[string]any{
			"totalServices": summary.TotalExecutions,
			"totalHours":    float64(summary.TotalSeconds) / 3600,
			"totalRevenue":  float64(summary.TotalValueCents) / 100,
			"totalPayouts":  float64(summary.PaidValueCents) / 100,
			"totalPending":  float64(summary.PendingValueCents) / 100,
		},
	})
}
