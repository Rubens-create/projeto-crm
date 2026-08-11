package database

import (
	"errors"

	"crm-terceirizados/internal/model"
)

var (
	ErrPropertyNotFound = errors.New("property not found")
	ErrPropertyInUse    = errors.New("property has related services or history")
)

func (d *DB) GetAllProperties(search string) ([]model.Property, error) {
	rows, err := d.conn.Query(`SELECT p.id, COALESCE(p.client_id, ''), COALESCE(c.name, ''), p.name,
		p.address, p.description, p.bedrooms, p.bathrooms, p.living_rooms, p.sqm,
		p.rooms, p.image, p.estimated_time, p.status, p.created_at, p.updated_at
		FROM properties p
		LEFT JOIN clients c ON c.id = p.client_id
		WHERE $1 = '' OR LOWER(p.name) LIKE '%' || LOWER($1) || '%'
			OR LOWER(p.address) LIKE '%' || LOWER($1) || '%'
			OR LOWER(COALESCE(c.name, '')) LIKE '%' || LOWER($1) || '%'
		ORDER BY p.name ASC`, search)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	properties := make([]model.Property, 0)
	byID := make(map[string]int)
	for rows.Next() {
		var property model.Property
		if err := rows.Scan(&property.ID, &property.ClientID, &property.ClientName, &property.Name,
			&property.Address, &property.Description, &property.Bedrooms, &property.Bathrooms,
			&property.LivingRooms, &property.Sqm, &property.Rooms, &property.Image,
			&property.EstimatedTime, &property.Status, &property.CreatedAt, &property.UpdatedAt); err != nil {
			return nil, err
		}
		property.Services = []model.PropertyService{}
		byID[property.ID] = len(properties)
		properties = append(properties, property)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	serviceRows, err := d.conn.Query(`SELECT property_id, id, description, rate, est_time, active
		FROM service_options WHERE property_id IS NOT NULL ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer serviceRows.Close()
	for serviceRows.Next() {
		var propertyID string
		var service model.PropertyService
		if err := serviceRows.Scan(&propertyID, &service.ID, &service.Description, &service.Rate, &service.EstTime, &service.Active); err != nil {
			return nil, err
		}
		if index, ok := byID[propertyID]; ok {
			properties[index].Services = append(properties[index].Services, service)
		}
	}
	if err := serviceRows.Err(); err != nil {
		return nil, err
	}
	return properties, nil
}

func (d *DB) GetProperty(id string) (model.Property, error) {
	properties, err := d.GetAllProperties("")
	if err != nil {
		return model.Property{}, err
	}
	for _, property := range properties {
		if property.ID == id {
			return property, nil
		}
	}
	return model.Property{}, ErrPropertyNotFound
}

func (d *DB) CreateProperty(property model.Property) error {
	if property.Status == "" {
		property.Status = model.PropertyActive
	}
	_, err := d.conn.Exec(`INSERT INTO properties
		(id, client_id, name, address, description, bedrooms, bathrooms, living_rooms, sqm, rooms, image, estimated_time, status)
		VALUES ($1, NULLIF($2, ''), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
		property.ID, property.ClientID, property.Name, property.Address, property.Description,
		property.Bedrooms, property.Bathrooms, property.LivingRooms, property.Sqm,
		property.Rooms, property.Image, property.EstimatedTime, property.Status)
	return err
}

func (d *DB) UpdateProperty(property model.Property) error {
	result, err := d.conn.Exec(`UPDATE properties SET client_id = NULLIF($1, ''), name = $2,
		address = $3, description = $4, bedrooms = $5, bathrooms = $6, living_rooms = $7,
		sqm = $8, rooms = $9, image = $10, estimated_time = $11, status = $12,
		updated_at = CURRENT_TIMESTAMP WHERE id = $13`,
		property.ClientID, property.Name, property.Address, property.Description, property.Bedrooms,
		property.Bathrooms, property.LivingRooms, property.Sqm, property.Rooms, property.Image,
		property.EstimatedTime, property.Status, property.ID)
	if err != nil {
		return err
	}
	count, err := result.RowsAffected()
	if err == nil && count == 0 {
		return ErrPropertyNotFound
	}
	return err
}

func (d *DB) ArchiveProperty(id string) error {
	result, err := d.conn.Exec("UPDATE properties SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", model.PropertyArchived, id)
	if err != nil {
		return err
	}
	count, err := result.RowsAffected()
	if err == nil && count == 0 {
		return ErrPropertyNotFound
	}
	return err
}

func (d *DB) DeleteProperty(id string) error {
	var related int
	if err := d.conn.QueryRow("SELECT COUNT(*) FROM service_options WHERE property_id = $1", id).Scan(&related); err != nil {
		return err
	}
	if related > 0 {
		return ErrPropertyInUse
	}
	result, err := d.conn.Exec("DELETE FROM properties WHERE id = $1", id)
	if err != nil {
		return err
	}
	count, err := result.RowsAffected()
	if err == nil && count == 0 {
		return ErrPropertyNotFound
	}
	return err
}
