package database

import (
	"log"

	"crm-terceirizados/internal/model"
)

func (d *DB) Seed() error {
	var count int

	// Professionals are required by authentication and timer integration tests.
	_ = d.conn.QueryRow("SELECT COUNT(*) FROM professionals").Scan(&count)
	if count == 0 {
		professionals := []model.Professional{
			{ID: "PRO-01", Name: "Marina Costa", Email: "marina@zygg.com", Phone: "(11) 98765-4321", Specialty: "Limpeza Residencial & Airbnb", Rate: 120, Hours: 42.5, Earned: 5100, Active: true},
			{ID: "PRO-02", Name: "Rafael Mendes", Email: "rafael@zygg.com", Phone: "(11) 97654-3210", Specialty: "Higienização Profunda", Rate: 110, Hours: 38, Earned: 4180, Active: true},
			{ID: "PRO-03", Name: "Beatriz Lima", Email: "beatriz@zygg.com", Phone: "(11) 96543-2109", Specialty: "Turnover Rápido / Check-out", Rate: 115, Hours: 45, Earned: 5175, Active: true},
			{ID: "PRO-04", Name: "Lucas Rocha", Email: "lucas@zygg.com", Phone: "(11) 95432-1098", Specialty: "Pós-Obra & Coberturas", Rate: 130, Hours: 30, Earned: 3900, Active: true},
		}
		for _, professional := range professionals {
			if _, err := d.conn.Exec("INSERT INTO professionals (id, name, email, phone, specialty, rate, hours, earned, active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
				professional.ID, professional.Name, professional.Email, professional.Phone, professional.Specialty, professional.Rate, professional.Hours, professional.Earned, professional.Active); err != nil {
				return err
			}
		}
	}

	_ = d.conn.QueryRow("SELECT COUNT(*) FROM clients").Scan(&count)
	if count == 0 {
		clients := []model.Client{
			{ID: "CLI-01", Name: "Carlos Eduardo (Host Airbnb)", Email: "carlos@airbnbhosts.com", Phone: "(11) 91234-5678", MonthlySpend: 3450, Status: "Ativo"},
			{ID: "CLI-02", Name: "Fernanda Souza (Flat Jardins)", Email: "fernanda@flats.com", Phone: "(11) 92345-6789", MonthlySpend: 2100, Status: "Ativo"},
			{ID: "CLI-03", Name: "Empresa Paulista Stay Ltd", Email: "contato@paulistastay.com", Phone: "(11) 93456-7890", MonthlySpend: 6800, Status: "Ativo"},
		}
		for _, client := range clients {
			if _, err := d.conn.Exec("INSERT INTO clients (id, name, email, phone, monthly_spend, status) VALUES ($1, $2, $3, $4, $5, $6)",
				client.ID, client.Name, client.Email, client.Phone, client.MonthlySpend, client.Status); err != nil {
				return err
			}
		}
	}

	_ = d.conn.QueryRow("SELECT COUNT(*) FROM properties").Scan(&count)
	if count == 0 {
		properties := []model.Property{
			{ID: "IMO-01", ClientID: "CLI-01", Name: "Loft Jardins", Description: "Loft para hospedagens de curta duração.", Bedrooms: 1, Bathrooms: 1, LivingRooms: 1, Sqm: 55, Rooms: "3 cômodos (1 Q, 1 S, 1 B) · 55m²", Image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85", EstimatedTime: "2.5h", Status: model.PropertyActive},
			{ID: "IMO-02", ClientID: "CLI-01", Name: "Apt Copacabana", Description: "Apartamento compacto próximo à orla.", Bedrooms: 1, Bathrooms: 1, LivingRooms: 0, Sqm: 38, Rooms: "2 cômodos (1 Q, 1 B) · 38m²", Image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85", EstimatedTime: "1.5h", Status: model.PropertyActive},
			{ID: "IMO-03", ClientID: "CLI-02", Name: "Studio Pinheiros", Description: "Studio integrado para locação por temporada.", Bedrooms: 1, Bathrooms: 1, LivingRooms: 1, Sqm: 42, Rooms: "3 cômodos (1 Q, 1 S, 1 B) · 42m²", Image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85", EstimatedTime: "2.0h", Status: model.PropertyActive},
			{ID: "IMO-04", ClientID: "CLI-03", Name: "Penthouse Orla", Description: "Cobertura ampla com varanda.", Bedrooms: 2, Bathrooms: 2, LivingRooms: 1, Sqm: 120, Rooms: "5 cômodos (2 Q, 1 S, 2 B) · 120m²", Image: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=85", EstimatedTime: "4.0h", Status: model.PropertyActive},
		}
		for _, property := range properties {
			if err := d.CreateProperty(property); err != nil {
				return err
			}
		}
	}

	_ = d.conn.QueryRow("SELECT COUNT(*) FROM service_options").Scan(&count)
	if count == 0 {
		options := []struct {
			id, propertyID, description, estTime string
			rate                                 float64
		}{
			{"OPT-01", "IMO-01", "Limpeza Pós Check-out + Enxoval", "2.5h", 120},
			{"OPT-02", "IMO-02", "Turno Rápido Roupas & Banheiro", "1.5h", 85},
			{"OPT-03", "IMO-03", "Limpeza Geral Pós Hospedagem", "2.0h", 110},
			{"OPT-04", "IMO-04", "Limpeza Profunda Pós Checkout", "4.0h", 180},
		}
		for _, option := range options {
			if err := d.CreateOption(option.id, option.propertyID, option.description, option.rate, option.estTime); err != nil {
				return err
			}
		}
	}

	_ = d.conn.QueryRow("SELECT COUNT(*) FROM services").Scan(&count)
	if count == 0 {
		services := []model.Service{
			{ID: "SV-1048", Client: "Loft Jardins (Check-out)", Professional: "Marina Costa", Service: "Limpeza Pós Check-out + Enxoval", Hours: 6.5, Rate: 120, Status: "Em andamento", Date: "Hoje, 08:30"},
			{ID: "SV-1047", Client: "Apt Copacabana (Turno)", Professional: "Rafael Mendes", Service: "Turno Rápido Roupas & Banheiro", Hours: 4, Rate: 85, Status: "Aguardando", Date: "Hoje, 07:45"},
			{ID: "SV-1046", Client: "Studio Pinheiros (Geral)", Professional: "Beatriz Lima", Service: "Limpeza Geral Pós Hospedagem", Hours: 8, Rate: 110, Status: "Concluído", Date: "Ontem, 17:20"},
			{ID: "SV-1045", Client: "Penthouse Orla (Luxo)", Professional: "Lucas Rocha", Service: "Limpeza Profunda Pós Checkout", Hours: 5.5, Rate: 180, Status: "Concluído", Date: "Ontem, 15:10"},
		}
		for _, service := range services {
			if _, err := d.conn.Exec("INSERT INTO services (id, client, professional, service, hours, rate, status, date_str) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
				service.ID, service.Client, service.Professional, service.Service, service.Hours, service.Rate, service.Status, service.Date); err != nil {
				return err
			}
		}
	}

	_ = d.conn.QueryRow("SELECT COUNT(*) FROM timer_state").Scan(&count)
	if count == 0 {
		if _, err := d.conn.Exec("INSERT INTO timer_state (id, active, service_id, started_at, elapsed_seconds) VALUES (1, false, '', CURRENT_TIMESTAMP, 0)"); err != nil {
			log.Printf("Erro inicializando timer_state: %v", err)
		}
	}

	_ = d.conn.QueryRow("SELECT COUNT(*) FROM payments").Scan(&count)
	if count == 0 {
		payments := []model.Payment{
			{ID: "PAY-1001", Professional: "Marina Costa", Amount: 1250, Hours: 10.5, Period: "01/Ago - 07/Ago", Status: "Pago", Date: "08/08/2026"},
			{ID: "PAY-1002", Professional: "Rafael Mendes", Amount: 980, Hours: 8, Period: "01/Ago - 07/Ago", Status: "Pago", Date: "08/08/2026"},
			{ID: "PAY-1003", Professional: "Beatriz Lima", Amount: 1420, Hours: 12, Period: "01/Ago - 07/Ago", Status: "Pago", Date: "08/08/2026"},
		}
		for _, payment := range payments {
			if _, err := d.conn.Exec("INSERT INTO payments (id, professional, amount, hours, period, status, date_str) VALUES ($1, $2, $3, $4, $5, $6, $7)",
				payment.ID, payment.Professional, payment.Amount, payment.Hours, payment.Period, payment.Status, payment.Date); err != nil {
				return err
			}
		}
	}

	_ = d.conn.QueryRow("SELECT COUNT(*) FROM settings").Scan(&count)
	if count == 0 {
		_, _ = d.conn.Exec("INSERT INTO settings (id, company_name, cnpj, email, phone, currency, default_rate, language) VALUES (1, 'Zygg Limpezas Airbnb & Terceirizados', '12.345.678/0001-90', 'ruben@zygg.com', '(11) 99887-6655', 'BRL', 120.00, 'pt')")
	}
	return nil
}
