package database

import "crm-terceirizados/internal/model"

func (d *DB) GetActiveOptions() ([]model.ServiceOption, error) {
	rows, err := d.conn.Query("SELECT id, name, description, rate, active, COALESCE(bedrooms, 1), COALESCE(bathrooms, 1), COALESCE(living_rooms, 1), COALESCE(sqm, 45), COALESCE(rooms, '3 cômodos'), COALESCE(image, ''), COALESCE(est_time, '2.5h') FROM service_options WHERE active = true ORDER BY id ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	options := make([]model.ServiceOption, 0)
	for rows.Next() {
		var opt model.ServiceOption
		if err := rows.Scan(&opt.ID, &opt.Name, &opt.Description, &opt.Rate, &opt.Active, &opt.Bedrooms, &opt.Bathrooms, &opt.LivingRooms, &opt.Sqm, &opt.Rooms, &opt.Image, &opt.EstTime); err != nil {
			continue
		}
		options = append(options, opt)
	}
	return options, nil
}

func (d *DB) GetAllOptions() ([]model.ServiceOption, error) {
	rows, err := d.conn.Query("SELECT id, name, description, rate, active, COALESCE(bedrooms, 1), COALESCE(bathrooms, 1), COALESCE(living_rooms, 1), COALESCE(sqm, 45), COALESCE(rooms, '3 cômodos'), COALESCE(image, ''), COALESCE(est_time, '2.5h') FROM service_options ORDER BY id ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	options := make([]model.ServiceOption, 0)
	for rows.Next() {
		var opt model.ServiceOption
		if err := rows.Scan(&opt.ID, &opt.Name, &opt.Description, &opt.Rate, &opt.Active, &opt.Bedrooms, &opt.Bathrooms, &opt.LivingRooms, &opt.Sqm, &opt.Rooms, &opt.Image, &opt.EstTime); err != nil {
			continue
		}
		options = append(options, opt)
	}
	return options, nil
}

func (d *DB) GetAllServices() ([]model.Service, error) {
	rows, err := d.conn.Query("SELECT id, client, professional, service, hours, rate, status, date_str FROM services ORDER BY created_at DESC, id DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	services := make([]model.Service, 0)
	for rows.Next() {
		var s model.Service
		if err := rows.Scan(&s.ID, &s.Client, &s.Professional, &s.Service, &s.Hours, &s.Rate, &s.Status, &s.Date); err != nil {
			continue
		}
		services = append(services, s)
	}
	return services, nil
}

func (d *DB) CreateOption(id, name, description string, rate float64, bedrooms, bathrooms, livingRooms, sqm int, rooms, image, estTime string) error {
	_, err := d.conn.Exec("INSERT INTO service_options (id, name, description, rate, active, bedrooms, bathrooms, living_rooms, sqm, rooms, image, est_time) VALUES ($1, $2, $3, $4, true, $5, $6, $7, $8, $9, $10, $11)",
		id, name, description, rate, bedrooms, bathrooms, livingRooms, sqm, rooms, image, estTime)
	return err
}

func (d *DB) UpdateOption(id, name, description string, rate float64, bedrooms, bathrooms, livingRooms, sqm int, rooms, image, estTime string) error {
	_, err := d.conn.Exec("UPDATE service_options SET name = $1, description = $2, rate = $3, bedrooms = $4, bathrooms = $5, living_rooms = $6, sqm = $7, rooms = $8, image = $9, est_time = $10 WHERE id = $11",
		name, description, rate, bedrooms, bathrooms, livingRooms, sqm, rooms, image, estTime, id)
	return err
}

func (d *DB) UpdateOptionRate(id string, rate float64) error {
	_, err := d.conn.Exec("UPDATE service_options SET rate = $1 WHERE id = $2", rate, id)
	return err
}

func (d *DB) ToggleOptionActive(id string) error {
	_, err := d.conn.Exec("UPDATE service_options SET active = NOT active WHERE id = $1", id)
	return err
}
