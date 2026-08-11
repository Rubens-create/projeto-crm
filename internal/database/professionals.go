package database

import "crm-terceirizados/internal/model"

func (d *DB) GetAllProfessionals() ([]model.Professional, error) {
	rows, err := d.conn.Query("SELECT id, name, email, phone, specialty, rate, hours, earned, active FROM professionals ORDER BY name ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.Professional
	for rows.Next() {
		var p model.Professional
		if err := rows.Scan(&p.ID, &p.Name, &p.Email, &p.Phone, &p.Specialty, &p.Rate, &p.Hours, &p.Earned, &p.Active); err == nil {
			list = append(list, p)
		}
	}
	if list == nil {
		list = []model.Professional{}
	}
	return list, nil
}

func (d *DB) CreateProfessional(p model.Professional) error {
	_, err := d.conn.Exec("INSERT INTO professionals (id, name, email, phone, specialty, rate, hours, earned, active) VALUES ($1, $2, $3, $4, $5, $6, 0, 0, true)",
		p.ID, p.Name, p.Email, p.Phone, p.Specialty, p.Rate)
	return err
}

func (d *DB) ToggleProfessionalActive(id string) error {
	_, err := d.conn.Exec("UPDATE professionals SET active = NOT active WHERE id = $1", id)
	return err
}

func (d *DB) UpdateProfessionalRate(id string, rate float64) error {
	_, err := d.conn.Exec("UPDATE professionals SET rate = $1 WHERE id = $2", rate, id)
	return err
}
