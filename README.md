# Clara CRM

CRM para gestão de serviços terceirizados com cobrança por hora.

## Stack

- Go 1.23 com `net/http`, `html/template` e `encoding/json`
- HTML, CSS e JavaScript sem framework para manter o carregamento rápido
- Layout branco e rosa bebê, cards arredondados e interface responsiva

## Executar

Neste ambiente, o Go foi instalado localmente dentro do projeto para não depender de permissão de administrador:

```bash
.tools/go/bin/go.exe run .
```

Se o Go estiver instalado globalmente no seu computador, também funciona:

```bash
go run .
```

Depois, acesse `http://localhost:8080`.

## Rotas iniciais

- `GET /` - dashboard
- `GET /api/dashboard` - dados de resumo e serviços recentes

O dashboard inicial já contempla serviços, profissionais, clientes, pagamentos, relatórios, ações rápidas e resumo de horas trabalhadas. A persistência e autenticação ficam como próxima camada, mantendo este primeiro corte leve e rápido.
