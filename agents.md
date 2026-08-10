# Instruções e Diretrizes do Projeto para Agentes (agents.md)

Este documento registra regras de arquitetura, design e diretrizes técnicas para orientar o desenvolvimento continuo do **Clara CRM**.

---

## 📱 Diretriz Mobile-First: Página do Prestador (`/prestador`)

- **Público-alvo**: 99% dos acessos à rota `/prestador` são feitos via dispositivos móveis (smartphones).
- **Abordagem de Design**: **Mobile-First**.
- **Regras de Implementação**:
  1. A interface da página `/prestador` (`web/provider.html`, `web/provider.js` e estilos relacionados) deve ser projetada primariamente para telas pequenas.
  2. Elementos interativos (botões de timer, seleção de serviços, cartões de ganhos) devem possuir área de toque ampla (*touch target* mínimo de 48px), ideal para uso com o polegar.
  3. Evitar tabelas densas ou layouts de múltiplas colunas na visualização do prestador. Preferir cards verticais e componentes focados em usabilidade móvel.
  4. Manter tempos de carregamento e execução JS o mais leves e rápidos possíveis.

---

## 🛠️ Stack Técnica
- **Backend**: Go (`net/http`, `database/sql`, `github.com/lib/pq`)
- **Banco de Dados**: PostgreSQL 18
- **Frontend**: HTML5, Vanilla CSS, Vanilla JavaScript (Sem frameworks pesados)
- **Containerização**: Docker / Docker Compose (`postgres:18-alpine` + container Go)
