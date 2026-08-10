# Diretrizes de Desenvolvimento do Projeto Zygg CRM

Este documento registra regras de arquitetura, design e diretrizes técnicas para orientar o desenvolvimento contínuo do **Zygg CRM**.

## 1. Diretriz Mobile-First para Prestadores
- A rota `/prestador` é acessada majoritariamente (99%) por dispositivos móveis.
- Deve seguir rigorosamente os princípios de UI/UX Mobile-First: layout de coluna única em telas pequenas, navegação inferior (bottom bar) fixa no rodapé, botões de ação com área de toque mínima confortável (48px+), modais estilo *bottom-sheet* em vez de popups centralizados e otimização para uso com uma mão.

## 2. Persistência de Dados
- O banco de dados relacional oficial do projeto é o **PostgreSQL 18** (local ou em nuvem).
- Nenhuma rotina de reinicialização (`seedDB`) deve executar rotinas unconditionally que sobrescrevam edições de tarifas ou cadastros modificados via painel administrativo.
