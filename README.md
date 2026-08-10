# Clara CRM

CRM para gestão de serviços terceirizados com cobrança por hora.

## Stack

- **Backend**: Go 1.23 (`net/http`, `html/template`, `database/sql`, `lib/pq`)
- **Banco de Dados**: PostgreSQL 18 (Local no Desenvolvimento / Docker em Produção)
- **Orquestração**: Docker e Docker Compose (para Produção)
- **Frontend**: HTML, CSS e JavaScript Vanilla para alta velocidade e baixa latência

## Execução Local (Desenvolvimento sem Docker)

Como você já possui o **PostgreSQL 18** instalado em seu computador:

1. Certifique-se de que o serviço do PostgreSQL está rodando em sua máquina.
2. (Opcional) Se a senha do seu usuário `postgres` no PostgreSQL for diferente de `postgres`, defina as variáveis de ambiente antes de executar:
   
   **PowerShell**:
   ```powershell
   $env:DB_USER="postgres"
   $env:DB_PASSWORD="SuaSenhaAqui"
   ```
   
   **CMD**:
   ```cmd
   set DB_USER=postgres
   set DB_PASSWORD=SuaSenhaAqui
   ```

3. Execute a aplicação Go:
   ```bash
   go run .
   ```

> 💡 **Nota**: O sistema irá verificar e criar automaticamente o banco de dados `crm_db` e as tabelas com os dados iniciais na primeira execução.

4. Acesse a aplicação no navegador em: `http://localhost:8080`

---

## Execução com Docker (Produção)

Para subir toda a infraestrutura (PostgreSQL 18 em container + aplicação Go):

```bash
docker compose up --build -d
```

Para parar os containers:
```bash
docker compose down
```

---

## Rotas e Endpoints

- `GET /` - Dashboard Principal
- `GET /prestador` - Painel do Prestador de Serviço (Timer e Ganhos)
- `GET /admin/servicos` - Gerenciamento de Serviços/Tabelas de Preço
- `GET /api/dashboard` - Métricas de resumo e serviços recentes
- `GET /api/provider` - Opções de serviço e estado do timer
- `POST /api/provider/timer` - Iniciar/Parar o timer do prestador
- `GET / POST /api/admin/services` - Listar e adicionar novas opções de serviços
