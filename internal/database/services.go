package database

import "crm-terceirizados/internal/model"

const optionSelect = `SELECT s.id, s.property_id, p.name, s.description,
	s.rate, s.active, p.bedrooms, p.bathrooms, p.living_rooms, p.sqm,
	p.rooms, p.image, s.est_time
	FROM service_options s
	JOIN properties p ON p.id = s.property_id`

func scanOptions(rows interface {
	Next() bool
	Scan(...any) error
	Err() error
	Close() error
}) ([]model.ServiceOption, error) {
	defer rows.Close()
	options := make([]model.ServiceOption, 0)
	for rows.Next() {
		var option model.ServiceOption
		if err := rows.Scan(&option.ID, &option.PropertyID, &option.Name, &option.Description,
			&option.Rate, &option.Active, &option.Bedrooms, &option.Bathrooms,
			&option.LivingRooms, &option.Sqm, &option.Rooms, &option.Image, &option.EstTime); err != nil {
			return nil, err
		}
		options = append(options, option)
	}
	return options, rows.Err()
}

func (d *DB) GetActiveOptions() ([]model.ServiceOption, error) {
	rows, err := d.conn.Query(optionSelect+" WHERE s.active = true AND p.status = $1 ORDER BY s.id", model.PropertyActive)
	if err != nil {
		return nil, err
	}
	return scanOptions(rows)
}

func (d *DB) GetAllOptions() ([]model.ServiceOption, error) {
	rows, err := d.conn.Query(optionSelect + " ORDER BY s.id")
	if err != nil {
		return nil, err
	}
	return scanOptions(rows)
}

func (d *DB) GetAllServices() ([]model.Service, error) {
	rows, err := d.conn.Query("SELECT id, client, professional, service, hours, rate, status, date_str FROM services ORDER BY created_at DESC, id DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	services := make([]model.Service, 0)
	for rows.Next() {
		var service model.Service
		if err := rows.Scan(&service.ID, &service.Client, &service.Professional, &service.Service, &service.Hours, &service.Rate, &service.Status, &service.Date); err != nil {
			return nil, err
		}
		services = append(services, service)
	}
	return services, rows.Err()
}

func (d *DB) CreateOption(id, propertyID, description string, rate float64, estTime string) error {
	result, err := d.conn.Exec(`INSERT INTO service_options (id, property_id, description, rate, active, est_time)
		SELECT $1, id, $3, $4, true, $5 FROM properties WHERE id = $2 AND status = $6`,
		id, propertyID, description, rate, estTime, model.PropertyActive)
	if err != nil {
		return err
	}
	count, err := result.RowsAffected()
	if err == nil && count == 0 {
		return ErrPropertyNotFound
	}
	return err
}

func (d *DB) UpdateOption(id, propertyID, description string, rate float64, estTime string) error {
	result, err := d.conn.Exec(`UPDATE service_options SET property_id = $1,
		description = $2, rate = $3, est_time = $4
		WHERE id = $5 AND EXISTS(SELECT 1 FROM properties WHERE id = $1 AND status = $6)`,
		propertyID, description, rate, estTime, id, model.PropertyActive)
	if err != nil {
		return err
	}
	count, err := result.RowsAffected()
	if err == nil && count == 0 {
		return ErrPropertyNotFound
	}
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
