package database

import "crm-terceirizados/internal/model"

func (d *DB) GetAllClients() ([]model.Client, error) {
	rows, err := d.conn.Query("SELECT id, name, email, phone, properties, monthly_spend, status FROM clients ORDER BY name ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.Client
	for rows.Next() {
		var c model.Client
		if err := rows.Scan(&c.ID, &c.Name, &c.Email, &c.Phone, &c.Properties, &c.MonthlySpend, &c.Status); err == nil {
			list = append(list, c)
		}
	}
	if list == nil {
		list = []model.Client{}
	}
	return list, nil
}

func (d *DB) CreateClient(c model.Client) error {
	_, err := d.conn.Exec("INSERT INTO clients (id, name, email, phone, properties, monthly_spend, status) VALUES ($1, $2, $3, $4, $5, 0, 'Ativo')",
		c.ID, c.Name, c.Email, c.Phone, c.Properties)
	return err
}
