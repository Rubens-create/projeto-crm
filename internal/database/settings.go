package database

import "crm-terceirizados/internal/model"

func (d *DB) GetSettings() (model.SystemSettings, error) {
	var s model.SystemSettings
	err := d.conn.QueryRow("SELECT company_name, cnpj, email, phone, currency, default_rate, language FROM settings WHERE id = 1").Scan(
		&s.CompanyName, &s.CNPJ, &s.Email, &s.Phone, &s.Currency, &s.DefaultRate, &s.Language,
	)
	if err != nil {
		s = model.SystemSettings{
			CompanyName: "Zygg Limpezas Airbnb & Terceirizados",
			CNPJ:        "12.345.678/0001-90",
			Email:       "ruben@zygg.com",
			Phone:       "(11) 99887-6655",
			Currency:    "BRL",
			DefaultRate: 120.00,
			Language:    "pt",
		}
	}
	return s, nil
}

func (d *DB) UpdateSettings(s model.SystemSettings) error {
	_, err := d.conn.Exec(`UPDATE settings SET company_name = $1, cnpj = $2, email = $3, phone = $4, currency = $5, default_rate = $6, language = $7 WHERE id = 1`,
		s.CompanyName, s.CNPJ, s.Email, s.Phone, s.Currency, s.DefaultRate, s.Language)
	return err
}
