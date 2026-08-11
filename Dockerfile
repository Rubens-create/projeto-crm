# Multi-stage build para aplicação Go
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copia dependências
COPY go.mod go.sum ./
RUN go mod download

# Copia código fonte
COPY *.go ./
COPY internal/ ./internal/

# Compila o binário estático
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o crm-server .

# Imagem final de execução
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Copia o binário compilado e os arquivos web estáticos/templates
COPY --from=builder /app/crm-server .
COPY web ./web

EXPOSE 8080

CMD ["./crm-server"]
