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
		headers = []string{"ID", "Cliente", "Profissional", "Serviço", "Horas", "Valor Bruto", "Status", "Data"}
		dbRows, err := h.db.Query("SELECT id, client, professional, service, hours, rate * hours, status, date_str FROM services ORDER BY created_at DESC")
		if err == nil {
			defer dbRows.Close()
			for dbRows.Next() {
				var id, client, prof, serv, status, date string
				var hours, val float64
				if err := dbRows.Scan(&id, &client, &prof, &serv, &hours, &val, &status, &date); err == nil {
					rows = append(rows, []any{id, client, prof, serv, hours, val, status, date})
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

	h.jsonResponse(w, map[string]any{
		"headers": headers,
		"rows":    rows,
	})
}
