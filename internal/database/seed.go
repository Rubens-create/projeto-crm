package database

import (
	"log"

	"crm-terceirizados/internal/model"
)

func (d *DB) Seed() error {
	var count int
	err := d.conn.QueryRow("SELECT COUNT(*) FROM service_options").Scan(&count)
	if err != nil {
		return err
	}

	if count == 0 {
		options := []model.ServiceOption{
			{ID: "OPT-01", Name: "Loft Jardins", Description: "Limpeza Pós Check-out + Enxoval", Rate: 120.00, Active: true, Bedrooms: 1, Bathrooms: 1, LivingRooms: 1, Sqm: 55, Rooms: "3 cômodos (1 Q, 1 S, 1 B)", Image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85", EstTime: "2.5h"},
			{ID: "OPT-02", Name: "Apt Copacabana", Description: "Turno Rápido Roupas & Banheiro", Rate: 85.00, Active: true, Bedrooms: 1, Bathrooms: 1, LivingRooms: 0, Sqm: 38, Rooms: "2 cômodos (1 Q, 1 B)", Image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85", EstTime: "1.5h"},
			{ID: "OPT-03", Name: "Studio Pinheiros", Description: "Limpeza Geral Pós Hospedagem", Rate: 110.00, Active: true, Bedrooms: 1, Bathrooms: 1, LivingRooms: 1, Sqm: 42, Rooms: "2 cômodos (Studio)", Image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85", EstTime: "2.0h"},
			{ID: "OPT-04", Name: "Penthouse Orla", Description: "Limpeza Profunda Pós Checkout", Rate: 180.00, Active: true, Bedrooms: 2, Bathrooms: 2, LivingRooms: 1, Sqm: 120, Rooms: "5 cômodos (2 Q, 2 B, Varanda)", Image: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=85", EstTime: "4.0h"},
		}
		stmt, err := d.conn.Prepare("INSERT INTO service_options (id, name, description, rate, active, bedrooms, bathrooms, living_rooms, sqm, rooms, image, est_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)")
		if err != nil {
			return err
		}
		defer stmt.Close()

		for _, opt := range options {
			if _, err := stmt.Exec(opt.ID, opt.Name, opt.Description, opt.Rate, opt.Active, opt.Bedrooms, opt.Bathrooms, opt.LivingRooms, opt.Sqm, opt.Rooms, opt.Image, opt.EstTime); err != nil {
				log.Printf("Erro inserindo option %s: %v", opt.ID, err)
			}
		}
	}

	err = d.conn.QueryRow("SELECT COUNT(*) FROM services").Scan(&count)
	if err != nil {
		return err
	}

	if count == 0 {
		services := []model.Service{
			{ID: "SV-1048", Client: "Loft Jardins (Check-out)", Professional: "Marina Costa", Service: "Limpeza Pós Check-out + Enxoval", Hours: 6.5, Rate: 120.00, Status: "Em andamento", Date: "Hoje, 08:30"},
			{ID: "SV-1047", Client: "Apt Copacabana (Turno)", Professional: "Rafael Mendes", Service: "Turno Rápido Roupas & Banheiro", Hours: 4.0, Rate: 85.00, Status: "Aguardando", Date: "Hoje, 07:45"},
			{ID: "SV-1046", Client: "Studio Pinheiros (Geral)", Professional: "Beatriz Lima", Service: "Limpeza Geral Pós Hospedagem", Hours: 8.0, Rate: 110.00, Status: "Concluído", Date: "Ontem, 17:20"},
			{ID: "SV-1045", Client: "Penthouse Orla (Luxo)", Professional: "Lucas Rocha", Service: "Limpeza Profunda Pós Checkout", Hours: 5.5, Rate: 180.00, Status: "Concluído", Date: "Ontem, 15:10"},
		}

		stmt, err := d.conn.Prepare("INSERT INTO services (id, client, professional, service, hours, rate, status, date_str) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)")
		if err != nil {
			return err
		}
		defer stmt.Close()

		for _, s := range services {
			if _, err := stmt.Exec(s.ID, s.Client, s.Professional, s.Service, s.Hours, s.Rate, s.Status, s.Date); err != nil {
				log.Printf("Erro inserindo service %s: %v", s.ID, err)
			}
		}
	}

	err = d.conn.QueryRow("SELECT COUNT(*) FROM timer_state").Scan(&count)
	if err != nil {
		return err
	}

	if count == 0 {
		_, err = d.conn.Exec("INSERT INTO timer_state (id, active, service_id, started_at, elapsed_seconds) VALUES (1, false, '', CURRENT_TIMESTAMP, 0)")
		if err != nil {
			log.Printf("Erro inicializando timer_state: %v", err)
		}
	}

	// Seed Professionals
	_ = d.conn.QueryRow("SELECT COUNT(*) FROM professionals").Scan(&count)
	if count == 0 {
		pros := []model.Professional{
			{ID: "PRO-01", Name: "Marina Costa", Email: "marina@zygg.com", Phone: "(11) 98765-4321", Specialty: "Limpeza Residencial & Airbnb", Rate: 120.0, Hours: 42.5, Earned: 5100.0, Active: true},
			{ID: "PRO-02", Name: "Rafael Mendes", Email: "rafael@zygg.com", Phone: "(11) 97654-3210", Specialty: "Higienização Profunda", Rate: 110.0, Hours: 38.0, Earned: 4180.0, Active: true},
			{ID: "PRO-03", Name: "Beatriz Lima", Email: "beatriz@zygg.com", Phone: "(11) 96543-2109", Specialty: "Turnover Rápido / Check-out", Rate: 115.0, Hours: 45.0, Earned: 5175.0, Active: true},
			{ID: "PRO-04", Name: "Lucas Rocha", Email: "lucas@zygg.com", Phone: "(11) 95432-1098", Specialty: "Pós-Obra & Coberturas", Rate: 130.0, Hours: 30.0, Earned: 3900.0, Active: true},
		}
		for _, p := range pros {
			if _, err := d.conn.Exec("INSERT INTO professionals (id, name, email, phone, specialty, rate, hours, earned, active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
				p.ID, p.Name, p.Email, p.Phone, p.Specialty, p.Rate, p.Hours, p.Earned, p.Active); err != nil {
				log.Printf("Erro inserindo professional %s: %v", p.ID, err)
			}
		}
	}

	// Seed Clients
	_ = d.conn.QueryRow("SELECT COUNT(*) FROM clients").Scan(&count)
	if count == 0 {
		cls := []model.Client{
			{ID: "CLI-01", Name: "Carlos Eduardo (Host Airbnb)", Email: "carlos@airbnbhosts.com", Phone: "(11) 91234-5678", Properties: 3, MonthlySpend: 3450.0, Status: "Ativo"},
			{ID: "CLI-02", Name: "Fernanda Souza (Flat Jardins)", Email: "fernanda@flats.com", Phone: "(11) 92345-6789", Properties: 2, MonthlySpend: 2100.0, Status: "Ativo"},
			{ID: "CLI-03", Name: "Empresa Paulista Stay Ltd", Email: "contato@paulistastay.com", Phone: "(11) 93456-7890", Properties: 5, MonthlySpend: 6800.0, Status: "Ativo"},
		}
		for _, c := range cls {
			if _, err := d.conn.Exec("INSERT INTO clients (id, name, email, phone, properties, monthly_spend, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
				c.ID, c.Name, c.Email, c.Phone, c.Properties, c.MonthlySpend, c.Status); err != nil {
				log.Printf("Erro inserindo client %s: %v", c.ID, err)
			}
		}
	}

	// Seed Payments
	_ = d.conn.QueryRow("SELECT COUNT(*) FROM payments").Scan(&count)
	if count == 0 {
		pmts := []model.Payment{
			{ID: "PAY-1001", Professional: "Marina Costa", Amount: 1250.00, Hours: 10.5, Period: "01/Ago - 07/Ago", Status: "Pago", Date: "08/08/2026"},
			{ID: "PAY-1002", Professional: "Rafael Mendes", Amount: 980.00, Hours: 8.0, Period: "01/Ago - 07/Ago", Status: "Pago", Date: "08/08/2026"},
			{ID: "PAY-1003", Professional: "Beatriz Lima", Amount: 1420.00, Hours: 12.0, Period: "01/Ago - 07/Ago", Status: "Pago", Date: "08/08/2026"},
		}
		for _, p := range pmts {
			if _, err := d.conn.Exec("INSERT INTO payments (id, professional, amount, hours, period, status, date_str) VALUES ($1, $2, $3, $4, $5, $6, $7)",
				p.ID, p.Professional, p.Amount, p.Hours, p.Period, p.Status, p.Date); err != nil {
				log.Printf("Erro inserindo payment %s: %v", p.ID, err)
			}
		}
	}

	// Seed Settings
	_ = d.conn.QueryRow("SELECT COUNT(*) FROM settings").Scan(&count)
	if count == 0 {
		_, _ = d.conn.Exec("INSERT INTO settings (id, company_name, cnpj, email, phone, currency, default_rate, language) VALUES (1, 'Zygg Limpezas Airbnb & Terceirizados', '12.345.678/0001-90', 'ruben@zygg.com', '(11) 99887-6655', 'BRL', 120.00, 'pt')")
	}

	imageURLs := map[string]string{
		"OPT-01": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
		"OPT-02": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85",
		"OPT-03": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85",
		"OPT-04": "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=85",
	}
	for id, imageURL := range imageURLs {
		if _, err := d.conn.Exec("UPDATE service_options SET image = $1 WHERE id = $2", imageURL, id); err != nil {
			log.Printf("Erro atualizando imagem do serviço %s: %v", id, err)
		}
	}

	return nil
}
