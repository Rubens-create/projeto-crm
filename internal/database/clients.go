package database

import "crm-terceirizados/internal/model"

func (d *DB) GetAllClients() ([]model.Client, error) {
	rows, err := d.conn.Query(`SELECT c.id, c.name, c.email, c.phone,
		(SELECT COUNT(*) FROM properties p WHERE p.client_id = c.id),
		c.monthly_spend, c.status
		FROM clients c ORDER BY c.name ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]model.Client, 0)
	byID := make(map[string]int)
	for rows.Next() {
		var client model.Client
		if err := rows.Scan(&client.ID, &client.Name, &client.Email, &client.Phone, &client.Properties, &client.MonthlySpend, &client.Status); err != nil {
			return nil, err
		}
		client.PropertyItems = []model.PropertySummary{}
		byID[client.ID] = len(list)
		list = append(list, client)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	propertyRows, err := d.conn.Query("SELECT client_id, id, name FROM properties WHERE client_id IS NOT NULL ORDER BY name")
	if err != nil {
		return nil, err
	}
	defer propertyRows.Close()
	for propertyRows.Next() {
		var clientID string
		var property model.PropertySummary
		if err := propertyRows.Scan(&clientID, &property.ID, &property.Name); err != nil {
			return nil, err
		}
		if index, ok := byID[clientID]; ok {
			list[index].PropertyItems = append(list[index].PropertyItems, property)
		}
	}
	if err := propertyRows.Err(); err != nil {
		return nil, err
	}
	return list, nil
}

func (d *DB) CreateClient(client model.Client) error {
	_, err := d.conn.Exec("INSERT INTO clients (id, name, email, phone, monthly_spend, status) VALUES ($1, $2, $3, $4, 0, 'Ativo')",
		client.ID, client.Name, client.Email, client.Phone)
	return err
}
