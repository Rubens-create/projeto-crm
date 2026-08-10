# Zygg CRM & App Limpeza Airbnb

Sistema de gestão de limpezas e repasses terceirizados para imóveis Airbnb, integrado a PostgreSQL 18 e aplicativo PWA/Capacitor móvel para Android e iOS.

## Funcionalidades principais

- **Landing Page**: Apresentação da plataforma e acesso direto à área do prestador e painel admin.
- **Painel Administrativo**: Páginas dedicadas para `/admin/servicos`, `/admin/profissionais`, `/admin/clientes`, `/admin/pagamentos`, `/admin/relatorios` e `/admin/configuracoes`.
- **App do Prestador**: Cronômetro de 30ms com milissegundos, gráfico SVG de ganhos ao vivo, cartões de imóveis e suporte offline via Service Worker (PWA).
- **Relatórios**: Submenu colapsável com visões consolidada, por prestador, por cliente, financeiro e por tipo de serviço.
- **PostgreSQL 18**: Persistência ativa sem sobrescrever edições de tarifas ou status dos usuários na reinicialização do servidor.

## Execução local

```powershell
$env:DB_PASSWORD="sua_senha_aqui"
go run .
```
