package model

import (
	"errors"
	"time"
)

const (
	RoleAdmin    = "ADMIN"
	RoleProvider = "PRESTADOR"

	ExecutionInProgress = "EM_ANDAMENTO"
	ExecutionCompleted  = "CONCLUIDO"
	ExecutionCanceled   = "CANCELADO"
)

const secondsPerHour int64 = 3600

func CalculateExecutionValueCents(hourlyRateCents, durationSeconds int64) (int64, error) {
	if hourlyRateCents <= 0 || durationSeconds < 0 {
		return 0, errors.New("invalid execution value inputs")
	}
	return (hourlyRateCents*durationSeconds + secondsPerHour/2) / secondsPerHour, nil
}

type AuthUser struct {
	ID             string `json:"id"`
	Email          string `json:"email"`
	Role           string `json:"role"`
	ProfessionalID string `json:"professionalId,omitempty"`
	PasswordHash   string `json:"-"`
}

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
	PropertyID  string  `json:"propertyId,omitempty"`
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
	Active         bool       `json:"active"`
	ServiceID      string     `json:"serviceId"`
	ExecutionID    string     `json:"executionId,omitempty"`
	StartedAt      time.Time  `json:"startedAt"`
	PausedAt       *time.Time `json:"pausedAt,omitempty"`
	ElapsedSeconds int64      `json:"elapsedSeconds"`
}

type ServiceExecution struct {
	ID               string     `json:"id"`
	ServiceID        string     `json:"serviceId"`
	ServiceName      string     `json:"serviceName"`
	ProfessionalID   string     `json:"professionalId"`
	ProfessionalName string     `json:"professionalName"`
	ClientID         string     `json:"clientId,omitempty"`
	ClientName       string     `json:"clientName,omitempty"`
	StartedAt        time.Time  `json:"startedAt"`
	FinishedAt       *time.Time `json:"finishedAt,omitempty"`
	DurationSeconds  int64      `json:"durationSeconds"`
	HourlyRateCents  int64      `json:"hourlyRateCents"`
	TotalValueCents  int64      `json:"totalValueCents"`
	Status           string     `json:"status"`
	Notes            string     `json:"notes"`
	PaymentID        string     `json:"paymentId,omitempty"`
}

type ExecutionSummary struct {
	TotalExecutions   int   `json:"totalExecutions"`
	TotalSeconds      int64 `json:"totalSeconds"`
	TotalValueCents   int64 `json:"totalValueCents"`
	PaidValueCents    int64 `json:"paidValueCents"`
	PendingValueCents int64 `json:"pendingValueCents"`
}

type ProviderView struct {
	ServerTime   time.Time          `json:"serverTime"`
	Options      []ServiceOption    `json:"options"`
	Timer        TimerState         `json:"timer"`
	Professional Professional       `json:"professional"`
	TotalHours   float64            `json:"totalHours"`
	TotalEarned  float64            `json:"totalEarned"`
	TodayEarned  float64            `json:"todayEarned"`
	Executions   []ServiceExecution `json:"executions"`
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
	ID            string            `json:"id"`
	Name          string            `json:"name"`
	Email         string            `json:"email"`
	Phone         string            `json:"phone"`
	Properties    int               `json:"properties"`
	PropertyItems []PropertySummary `json:"propertyItems,omitempty"`
	MonthlySpend  float64           `json:"monthlySpend"`
	Status        string            `json:"status"`
}

const (
	PropertyActive   = "ATIVO"
	PropertyArchived = "ARQUIVADO"
)

type PropertySummary struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type PropertyService struct {
	ID          string  `json:"id"`
	Description string  `json:"description"`
	Rate        float64 `json:"rate"`
	EstTime     string  `json:"estTime"`
	Active      bool    `json:"active"`
}

type Property struct {
	ID            string            `json:"id"`
	ClientID      string            `json:"clientId,omitempty"`
	ClientName    string            `json:"clientName,omitempty"`
	Name          string            `json:"name"`
	Address       string            `json:"address"`
	Description   string            `json:"description"`
	Bedrooms      int               `json:"bedrooms"`
	Bathrooms     int               `json:"bathrooms"`
	LivingRooms   int               `json:"livingRooms"`
	Sqm           int               `json:"sqm"`
	Rooms         string            `json:"rooms"`
	Image         string            `json:"image"`
	EstimatedTime string            `json:"estimatedTime"`
	Status        string            `json:"status"`
	CreatedAt     time.Time         `json:"createdAt"`
	UpdatedAt     time.Time         `json:"updatedAt"`
	Services      []PropertyService `json:"services"`
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
