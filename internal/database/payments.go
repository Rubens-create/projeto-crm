package database

import "crm-terceirizados/internal/model"

func (d *DB) GetAllPayments() ([]model.Payment, error) {
	rows, err := d.conn.Query("SELECT id, professional, amount, hours, period, status, date_str FROM payments ORDER BY id DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.Payment
	for rows.Next() {
		var p model.Payment
		if err := rows.Scan(&p.ID, &p.Professional, &p.Amount, &p.Hours, &p.Period, &p.Status, &p.Date); err == nil {
			list = append(list, p)
		}
	}
	if list == nil {
		list = []model.Payment{}
	}
	return list, nil
}

func (d *DB) CreatePayment(p model.Payment) error {
	_, err := d.conn.Exec("INSERT INTO payments (id, professional, amount, hours, period, status, date_str) VALUES ($1, $2, $3, $4, $5, 'Pago', $6)",
		p.ID, p.Professional, p.Amount, p.Hours, p.Period, p.Date)
	return err
}

func (d *DB) UpdatePaymentStatus(id, status string) error {
	_, err := d.conn.Exec("UPDATE payments SET status = $1 WHERE id = $2", status, id)
	return err
}
