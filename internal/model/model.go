package model

import "time"

type Service struct {
	ID           string  `json:"id"`
	Client       string  `json:"client"`
	Professional string  `json:"professional"`
	Service      string  `json:"service"`
	Hours        float64 `json:"hours"`
	Rate         float64 `json:"rate"`
	Status       string  `json:"status"`
	Date         string  `json:"date"`
}

type Dashboard struct {
	Services []Service      `json:"services"`
	Stats    map[string]any `json:"stats"`
}

type ServiceOption struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Rate        float64 `json:"rate"`
	Active      bool    `json:"active"`
	Bedrooms    int     `json:"bedrooms"`
	Bathrooms   int     `json:"bathrooms"`
	LivingRooms int     `json:"livingRooms"`
	Sqm         int     `json:"sqm"`
	Rooms       string  `json:"rooms"`
	Image       string  `json:"image"`
	EstTime     string  `json:"estTime"`
}

type TimerState struct {
	Active         bool      `json:"active"`
	ServiceID      string    `json:"serviceId"`
	StartedAt      time.Time `json:"startedAt"`
	ElapsedSeconds int64     `json:"elapsedSeconds"`
}

type ProviderView struct {
	Options     []ServiceOption `json:"options"`
	Timer       TimerState      `json:"timer"`
	TotalHours  float64         `json:"totalHours"`
	TotalEarned float64         `json:"totalEarned"`
	TodayEarned float64         `json:"todayEarned"`
}

type Professional struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Email     string  `json:"email"`
	Phone     string  `json:"phone"`
	Specialty string  `json:"specialty"`
	Rate      float64 `json:"rate"`
	Hours     float64 `json:"hours"`
	Earned    float64 `json:"earned"`
	Active    bool    `json:"active"`
}

type Client struct {
	ID           string  `json:"id"`
	Name         string  `json:"name"`
	Email        string  `json:"email"`
	Phone        string  `json:"phone"`
	Properties   int     `json:"properties"`
	MonthlySpend float64 `json:"monthlySpend"`
	Status       string  `json:"status"`
}

type Payment struct {
	ID           string  `json:"id"`
	Professional string  `json:"professional"`
	Amount       float64 `json:"amount"`
	Hours        float64 `json:"hours"`
	Period       string  `json:"period"`
	Status       string  `json:"status"`
	Date         string  `json:"date"`
}

type SystemSettings struct {
	CompanyName string  `json:"companyName"`
	CNPJ        string  `json:"cnpj"`
	Email       string  `json:"email"`
	Phone       string  `json:"phone"`
	Currency    string  `json:"currency"`
	DefaultRate float64 `json:"defaultRate"`
	Language    string  `json:"language"`
}
