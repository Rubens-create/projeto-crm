package database

import (
	"crm-terceirizados/internal/model"
)

func (d *DB) ListAchievements(activeOnly bool) ([]model.Achievement, error) {
	query := `SELECT id, title, description, metric, target, icon, color, active FROM achievements`
	if activeOnly {
		query += ` WHERE active = true`
	}
	query += ` ORDER BY created_at, id`

	rows, err := d.conn.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []model.Achievement{}
	for rows.Next() {
		var achievement model.Achievement
		if err := rows.Scan(&achievement.ID, &achievement.Title, &achievement.Description, &achievement.Metric, &achievement.Target, &achievement.Icon, &achievement.Color, &achievement.Active); err != nil {
			return nil, err
		}
		list = append(list, achievement)
	}
	return list, rows.Err()
}

func (d *DB) CreateAchievement(achievement model.Achievement) error {
	_, err := d.conn.Exec(`INSERT INTO achievements (id, title, description, metric, target, icon, color, active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		achievement.ID, achievement.Title, achievement.Description, achievement.Metric, achievement.Target, achievement.Icon, achievement.Color, achievement.Active)
	return err
}

func (d *DB) UpdateAchievement(achievement model.Achievement) error {
	_, err := d.conn.Exec(`UPDATE achievements SET title = $1, description = $2, metric = $3, target = $4, icon = $5, color = $6, active = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8`,
		achievement.Title, achievement.Description, achievement.Metric, achievement.Target, achievement.Icon, achievement.Color, achievement.Active, achievement.ID)
	return err
}

func (d *DB) DeleteAchievement(id string) error {
	_, err := d.conn.Exec(`DELETE FROM achievements WHERE id = $1`, id)
	return err
}
