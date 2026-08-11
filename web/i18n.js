(function () {
  const translations = {
    pt: {
      // Sidebar Navigation
      'nav.home': 'Dashboard',
      'nav.services': 'Serviços',
      'nav.properties': 'Imóveis',
      'nav.professionals': 'Prestadores',
      'nav.clients': 'Clientes',
      'nav.payments': 'Pagamentos',
      'nav.reports': 'Relatórios',
      'nav.settings': 'Configurações',
      'nav.providerApp': 'App Prestador',

      // Submenu Reports
      'reports.overview': 'Visão Geral',
      'reports.byProvider': 'Por Prestador',
      'reports.byClient': 'Por Cliente',
      'reports.financial': 'Financeiro',
      'reports.byService': 'Por Serviço',

      // Header & Breadcrumb
      'topbar.home': 'Início',
      'topbar.catalog': 'Catálogo de Serviços',
      'topbar.professionals': 'Gestão de Profissionais',
      'topbar.clients': 'Gestão de Clientes',
      'topbar.payments': 'Controle de Pagamentos',
      'topbar.reports': 'Relatórios & Métricas',
      'topbar.settings': 'Configurações do Sistema',
      'topbar.adminRole': 'Administrador',

      // Services Page
      'services.eyebrow': 'CATÁLOGO & PRECIFICAÇÃO',
      'services.title': 'Configuração de Serviços',
      'services.subtitle': 'Configure tarifas, tempo estimado e disponibilidade para imóveis já cadastrados.',
      'services.newBtn': 'Novo serviço',
      'services.panelTitle': 'Serviços por imóvel',
      'services.panelSub': 'Cada configuração operacional deve estar vinculada a um imóvel existente.',
      'services.filterAll': 'Todos',
      'services.filterActive': 'Ativos',
      'services.filterInactive': 'Desativados',
      'services.thProperty': 'Imóvel / Serviço',
      'services.thType': 'Tipo de Higienização',
      'services.thRooms': 'Cômodos / m²',
      'services.thTime': 'Tempo Estimado',
      'services.thRate': 'Tarifa Horária',
      'services.thVisibility': 'Visibilidade no App',
      'services.thActions': 'Ações',
      'services.save': 'Salvar',
      'services.active': 'Ativo',
      'services.disabled': 'Desativado',
      'services.editInfo': 'Editar informações',
      'services.toggleOff': 'Desativar (Ocultar)',
      'services.toggleOn': 'Ativar (Exibir)',
      'services.empty': 'Nenhum serviço encontrado.',
      'services.modalNewTitle': 'Cadastrar serviço',
      'services.modalNewSub': 'Selecione um imóvel existente e defina sua configuração operacional.',
      'services.modalEditTitle': 'Editar serviço',
      'services.modalEditSub': 'Altere apenas o vínculo e as configurações operacionais do serviço.',
      'services.fieldName': 'Nome do Imóvel / Serviço',
      'services.fieldDesc': 'Tipo / Descrição da Limpeza',
      'services.fieldRate': 'Valor por hora (R$)',
      'services.fieldEstTime': 'Tempo Estimado',
      'services.fieldBedrooms': 'Qtd. Quartos',
      'services.fieldBathrooms': 'Qtd. Banheiros',
      'services.fieldLivingRooms': 'Qtd. Salas',
      'services.fieldSqm': 'Metragem (m²)',
      'services.fieldPhoto': 'Foto do Imóvel',
      'services.uploadBtn': 'Escolher e Enviar Foto do Imóvel...',
      'services.editUploadBtn': 'Escolher e Alterar Foto...',
      'services.submitCreate': 'Cadastrar e Publicar Serviço',
      'services.submitSave': 'Salvar Alterações',
      'services.toastCreate': 'Novo imóvel cadastrado e publicado com sucesso!',
      'services.toastUpdate': 'Informações do serviço atualizadas com sucesso!',
      'services.toastRate': 'Tarifa por hora atualizada!',
      'services.toastToggle': 'Visibilidade do imóvel alterada!',

      // Professionals Page
      'prof.eyebrow': 'EQUIPE & REPASSES',
      'prof.title': 'Profissionais Terceirizados',
      'prof.subtitle': 'Acompanhe diárias executadas, avaliações dos clientes e repasses bancários.',

      // Clients Page
      'clients.eyebrow': 'CARTEIRA & IMÓVEIS',
      'clients.title': 'Clientes & Propriedades',
      'clients.subtitle': 'Gestão de proprietários Airbnb e empresas parceiras contratantes.',

      // Payments Page
      'payments.eyebrow': 'FINANCEIRO & TRANSAÇÕES',
      'payments.title': 'Gestão de Pagamentos & Repasses',
      'payments.subtitle': 'Histórico de pagamentos efetuados e recebíveis pendentes.',

      // Reports Page
      'reports.eyebrow': 'BUSINESS INTELLIGENCE',
      'reports.title': 'Relatórios & Indicadores',
      'reports.subtitle': 'Análise de rentabilidade por imóvel, prestador e desempenho operacional.',

      // Settings Page
      'config.eyebrow': 'PARÂMETROS & OPERAÇÃO',
      'config.title': 'Configurações do CRM',
      'config.subtitle': 'Ajuste os dados da empresa, preferências de relatórios e comportamento do aplicativo.',
      'config.saveBtn': 'Salvar alterações',
      'config.tabGeneral': 'Geral & Empresa',
      'config.tabApp': 'App do Prestador',
      'config.tabDb': 'Banco de Dados',
      'config.companyTitle': 'Dados da Empresa',
      'config.companySub': 'Informações exibidas em relatórios e comprovantes de repasse.',
      'config.companyName': 'Nome Comercial',
      'config.cnpj': 'CNPJ / Registro Fiscal',
      'config.email': 'E-mail Administrativo',
      'config.phone': 'WhatsApp Comercial',
      'config.financeTitle': 'Parâmetros Financeiros',
      'config.financeSub': 'Definições de cobrança e moeda padrão para cálculo de repasses.',
      'config.currency': 'Moeda Padrão',
      'config.defaultRate': 'Tarifa Padrão Sugerida (R$/hora)',
      'config.langTitle': 'Idioma',
      'config.langSubtitle': 'Alterne o idioma de exibição em todo o sistema (CRM & App).',
      'config.systemLanguage': 'Idioma do Sistema (Language)',
      'config.toastSave': 'Configurações e idioma salvos com sucesso!'
    },
    en: {
      // Sidebar Navigation
      'nav.home': 'Dashboard',
      'nav.services': 'Services',
      'nav.properties': 'Properties',
      'nav.professionals': 'Providers',
      'nav.clients': 'Clients',
      'nav.payments': 'Payments',
      'nav.reports': 'Reports',
      'nav.settings': 'Settings',
      'nav.providerApp': 'Provider App',

      // Submenu Reports
      'reports.overview': 'Overview',
      'reports.byProvider': 'By Provider',
      'reports.byClient': 'By Client',
      'reports.financial': 'Financial',
      'reports.byService': 'By Service',

      // Header & Breadcrumb
      'topbar.home': 'Home',
      'topbar.catalog': 'Service Catalog',
      'topbar.professionals': 'Professional Management',
      'topbar.clients': 'Client Management',
      'topbar.payments': 'Payment Control',
      'topbar.reports': 'Reports & Metrics',
      'topbar.settings': 'System Settings',
      'topbar.adminRole': 'Administrator',

      // Services Page
      'services.eyebrow': 'CATALOG & PRICING',
      'services.title': 'Service Configuration',
      'services.subtitle': 'Configure rates, estimated time, and availability for registered properties.',
      'services.newBtn': 'New service',
      'services.panelTitle': 'Services by Property',
      'services.panelSub': 'Each operational configuration must be linked to an existing property.',
      'services.filterAll': 'All',
      'services.filterActive': 'Active',
      'services.filterInactive': 'Disabled',
      'services.thProperty': 'Property / Service',
      'services.thType': 'Cleaning Type',
      'services.thRooms': 'Rooms / sqm',
      'services.thTime': 'Est. Time',
      'services.thRate': 'Hourly Rate',
      'services.thVisibility': 'App Visibility',
      'services.thActions': 'Actions',
      'services.save': 'Save',
      'services.active': 'Active',
      'services.disabled': 'Disabled',
      'services.editInfo': 'Edit details',
      'services.toggleOff': 'Disable (Hide)',
      'services.toggleOn': 'Enable (Show)',
      'services.empty': 'No services found.',
      'services.modalNewTitle': 'Add new property / service',
      'services.modalNewSub': 'Active services will be immediately available on the provider app.',
      'services.modalEditTitle': 'Edit property / service',
      'services.modalEditSub': 'Update property details, cleaning type, rooms, and pricing.',
      'services.fieldName': 'Property / Service Name',
      'services.fieldDesc': 'Cleaning Type / Description',
      'services.fieldRate': 'Hourly Rate ($)',
      'services.fieldEstTime': 'Estimated Time',
      'services.fieldBedrooms': 'Bedrooms',
      'services.fieldBathrooms': 'Bathrooms',
      'services.fieldLivingRooms': 'Living Rooms',
      'services.fieldSqm': 'Size (sqm)',
      'services.fieldPhoto': 'Property Photo',
      'services.uploadBtn': 'Choose & Upload Property Photo...',
      'services.editUploadBtn': 'Choose & Change Photo...',
      'services.submitCreate': 'Register & Publish Service',
      'services.submitSave': 'Save Changes',
      'services.toastCreate': 'New property registered and published successfully!',
      'services.toastUpdate': 'Service details updated successfully!',
      'services.toastRate': 'Hourly rate updated!',
      'services.toastToggle': 'Property visibility updated!',

      // Professionals Page
      'prof.eyebrow': 'TEAM & PAYOUTS',
      'prof.title': 'Contracted Professionals',
      'prof.subtitle': 'Track performed jobs, client ratings, and bank payouts.',

      // Clients Page
      'clients.eyebrow': 'PORTFOLIO & PROPERTIES',
      'clients.title': 'Clients & Properties',
      'clients.subtitle': 'Management of Airbnb hosts and partner companies.',

      // Payments Page
      'payments.eyebrow': 'FINANCIAL & TRANSACTIONS',
      'payments.title': 'Payments & Payouts Management',
      'payments.subtitle': 'History of completed payouts and pending receivables.',

      // Reports Page
      'reports.eyebrow': 'BUSINESS INTELLIGENCE',
      'reports.title': 'Reports & Analytics',
      'reports.subtitle': 'Profitability analysis by property, provider, and operational performance.',

      // Settings Page
      'config.eyebrow': 'PARAMETERS & OPERATIONS',
      'config.title': 'CRM Settings',
      'config.subtitle': 'Adjust company details, report preferences, and app behavior.',
      'config.saveBtn': 'Save changes',
      'config.tabGeneral': 'General & Company',
      'config.tabApp': 'Provider App',
      'config.tabDb': 'Database',
      'config.companyTitle': 'Company Information',
      'config.companySub': 'Details displayed on reports and payout receipts.',
      'config.companyName': 'Business Name',
      'config.cnpj': 'Tax Registration / ID',
      'config.email': 'Administrative Email',
      'config.phone': 'Business WhatsApp',
      'config.financeTitle': 'Financial Parameters',
      'config.financeSub': 'Billing definitions and default currency for payouts.',
      'config.currency': 'Default Currency',
      'config.defaultRate': 'Suggested Default Rate ($/hour)',
      'config.langTitle': 'Language',
      'config.langSubtitle': 'Switch system-wide display language (CRM & App).',
      'config.systemLanguage': 'System Language',
      'config.toastSave': 'Settings and language saved successfully!'
    }
  };

  // Translate legacy plain-text labels that have not been migrated to data-i18n yet.
  // This also covers labels injected later by page JavaScript.
  const legacyEnglish = {
    'Início (Landing)': 'Home (Landing)', 'Serviços': 'Services', 'Profissionais': 'Professionals',
    'Clientes': 'Clients', 'Pagamentos': 'Payments', 'Relatórios': 'Reports', 'Configurações': 'Settings',
    'App Prestador': 'Provider App', 'Visão Geral': 'Overview', 'Por Prestador': 'By Provider',
    'Por Cliente': 'By Client', 'Financeiro': 'Financial', 'Por Serviço': 'By Service', 'Início': 'Home',
    'Administrador': 'Administrator', 'Sair': 'Log out', 'Entrar': 'Sign in', 'gestão de serviços': 'service management', 'Todos': 'All',
    'Zygg | Entrar': 'Zygg | Sign in', 'Voltar para a Zygg': 'Back to Zygg',
    'Zygg | Gestão de Serviços (Admin)': 'Zygg | Service Management (Admin)',
    'Zygg | Gestão de Profissionais': 'Zygg | Professional Management',
    'Zygg | Gestão de Clientes & Proprietários': 'Zygg | Client & Owner Management',
    'Zygg | Relatórios Gerenciais': 'Zygg | Management Reports', 'Zygg | Configurações do Sistema': 'Zygg | System Settings',
    'Ativos': 'Active', 'Desativados': 'Disabled', 'Ativo': 'Active', 'Desativado': 'Disabled',
    'Ações': 'Actions', 'Salvar': 'Save', 'Salvar alterações': 'Save changes', 'Salvar Alterações': 'Save Changes',
    'Cancelar': 'Cancel', 'Editar': 'Edit', 'Excluir': 'Delete', 'Ver detalhes': 'View details',
    'Mais opções': 'More options', 'Nenhum profissional encontrado.': 'No professionals found.',
    'Nenhum serviço encontrado.': 'No services found.', 'Nenhum dado encontrado.': 'No data found.',
    'Operação realizada com sucesso': 'Operation completed successfully', 'Carregando...': 'Loading...',
    'Erro ao carregar dados.': 'Error loading data.', 'Erro ao carregar relatório': 'Error loading report',
    'Preferências do Sistema': 'System Preferences',
    'Configure os parâmetros operacionais da sua empresa de limpeza.': 'Configure your cleaning company operational settings.',
    'Opções do Aplicativo Móvel': 'Mobile App Options',
    'Controle recursos e notificações enviadas ao prestador de serviço.': 'Control features and notifications sent to providers.',
    'Cronômetro em Tempo Real (30ms)': 'Real-Time Timer (30ms)', 'Gráfico SVG Dinâmico de Ganhos': 'Dynamic SVG Earnings Chart',
    'Suporte a Instalação PWA (Android / iPhone)': 'PWA Installation Support (Android / iPhone)',
    'Salvar preferências': 'Save preferences', 'Telefone não informado': 'Phone not provided',
    'Entrar na Zygg': 'Sign in to Zygg', 'E-mail': 'Email', 'Senha': 'Password',
    'Entre com sua conta administrativa.': 'Sign in with your administrator account.',
    'Entre com sua conta de prestador.': 'Sign in with your provider account.', 'Sua senha': 'Your password',
    'Não foi possível entrar. Tente novamente.': 'Unable to sign in. Try again.',
    'E-mail ou senha inválidos.': 'Invalid email or password.',
    'Português (Brasil) 🇧🇷': 'Portuguese (Brazil) 🇧🇷', 'Dólar Americano ($)': 'US Dollar ($)',
    'Ex.: Loft Vila Madalena': 'e.g. Vila Madalena Loft', 'Ex.: Limpeza Pós Check-out + Enxoval': 'e.g. Post-checkout cleaning + linens',
    'Ex.: Limpeza Pós Check-out & Enxoval': 'e.g. Post-checkout cleaning & linens', '(11) 99999-9999': '(11) 99999-9999',
    'Período Atual': 'Current Period', 'Repasse Concluído': 'Payout Completed', 'Incluído em repasse': 'Included in payout',
    'Pendentes de liberação': 'Pending release', 'Repasses concluídos': 'Completed payouts', 'Próximo fechamento': 'Next closing',
    'Serviço / Imóvel': 'Service / Property', 'Tarifa Horária': 'Hourly Rate', 'Imóvel / Atendimento': 'Property / Service',
    'Foto do Imóvel': 'Property Photo', 'Pré-visualização': 'Preview', 'Foto atual do imóvel': 'Current property photo',
    'Escolher e Enviar Foto do Imóvel...': 'Choose & Upload Property Photo...', 'Escolher e Alterar Foto...': 'Choose & Change Photo...',
    'Cadastrar e Publicar Serviço': 'Register & Publish Service', 'Cadastrar profissional': 'Add professional',
    'Cadastrar Proprietário': 'Add owner', 'Novo cliente / proprietário': 'New client / owner',
    'Cadastre um novo contrato e imóvel Airbnb.': 'Register a new contract and Airbnb property.',
    'Nome do Proprietário / Empresa': 'Owner / Company Name', 'Nome do Imóvel': 'Property Name', 'Endereço Completo': 'Full Address',
    'O tempo e os ganhos são registrados em tempo real.': 'Time and earnings are recorded in real time.',
    'Finalizar serviço': 'Finish service', 'Serviços disponíveis': 'Available services', 'Escolha uma atividade para começar.': 'Choose an activity to get started.',
    'Cronômetro': 'Timer', 'Ganhos': 'Earnings', 'Serviço concluído': 'Service completed', 'Duração': 'Duration', 'Tarifa': 'Rate',
    'Selecione um serviço': 'Select a service', 'Selecione um serviço na aba Serviços': 'Select a service in the Services tab',
    'Nenhum serviço executado ainda.': 'No service executions yet.', 'Parar cronômetro': 'Stop timer', 'Iniciar cronômetro': 'Start timer',
    'Em andamento': 'In progress', 'Parado': 'Stopped', 'hora': 'hour', 'Horas neste período': 'Hours this period',
    'Total ganho': 'Total earned', 'Disponíveis no aplicativo': 'Available in the app', 'Proprietários parceiros': 'Partner owners',
    'Imóveis vinculados': 'Linked properties', 'Receita este mês': 'Revenue this month',
    'Acompanhe os contratos de higienização de cada propriedade.': 'Track cleaning contracts for each property.',
    'Prestadores cadastrados': 'Registered professionals', 'Horas trabalhadas': 'Hours worked',
    'Total de prestadores': 'Total professionals', 'Prestadores ativos': 'Active professionals',
    'Cadastros encontrados': 'Records found', 'Horas registradas': 'Recorded hours', 'Ganhos acumulados': 'Accumulated earnings',
    'Total de clientes': 'Total clients', 'Imóveis cadastrados': 'Registered properties', 'Imóveis sob gestão': 'Properties under management',
    'Gasto mensal': 'Monthly spending', 'Soma dos clientes': 'Sum of client spending', 'Clientes ativos': 'Active clients',
    'Cadastros em operação': 'Active records', 'Total de pagamentos': 'Total payments', 'Lançamentos financeiros': 'Financial entries',
    'Horas pagas': 'Paid hours', 'Horas incluídas nos pagamentos': 'Hours included in payments', 'Total pago': 'Total paid',
    'Repasses registrados': 'Recorded payouts', 'Pendências': 'Pending amounts', 'Valores ainda não pagos': 'Unpaid amounts',
    'Total de serviços': 'Total services', 'Imóveis e serviços cadastrados': 'Registered properties and services',
    'Serviços ativos': 'Active services', 'Tarifa média': 'Average rate', 'Média dos valores por hora': 'Average hourly value',
    'Tempo médio': 'Average time', 'Estimativa dos serviços': 'Service estimate', 'Total de limpezas': 'Total cleanings',
    'Concluídos no período': 'Completed in period', 'Horas gravadas': 'Recorded hours', 'Tempo em operação': 'Time in operation',
    'Faturamento bruto': 'Gross revenue', 'Receita de proprietários': 'Owner revenue', 'Repasses liquidados': 'Settled payouts',
    'Pago à equipe': 'Paid to team', 'Relatório Geral Consolidado': 'Consolidated General Report',
    'Visão completa da operação, atendimentos e repasses.': 'Complete view of operations, jobs, and payouts.',
    'Atendimentos por Categoria': 'Jobs by Category', 'Relatório por Prestador': 'Report by Provider',
    'Desempenho e produtividade individual de cada prestador.': 'Individual provider performance and productivity.',
    'Produção da Equipe de Limpeza': 'Cleaning Team Output', 'Relatório por Cliente & Imóvel': 'Report by Client & Property',
    'Faturamento acumulado por proprietário e imóveis parceiros.': 'Accumulated revenue by owner and partner property.',
    'Faturamento por Cliente': 'Revenue by Client', 'Relatório Financeiro & Margens': 'Financial & Margin Report',
    'Demonstrativo semanal de receita, repasses e margem líquida.': 'Weekly statement of revenue, payouts, and net margin.',
    'Extrato Financeiro Semanal': 'Weekly Financial Statement', 'Relatório por Tipo de Serviço': 'Report by Service Type',
    'Análise por imóvel cadastrado e tipo de higienização.': 'Analysis by registered property and cleaning type.',
    'Rentabilidade por Imóvel': 'Profitability by Property',
    'Relatório baixado com sucesso': 'Report downloaded successfully', 'Sem dados para exportar': 'No data to export',
    'Download do Relatório CSV iniciado com sucesso!': 'CSV report download started successfully!',
    'Gerando arquivo PDF do Demonstrativo Financeiro...': 'Generating the financial statement PDF...'
  };
  const legacyPortuguese = Object.fromEntries(Object.entries(legacyEnglish).map(([pt, en]) => [en, pt]));

  function translateLegacyContent() {
    const dictionary = getCurrentLanguage() === 'en' ? legacyEnglish : legacyPortuguese;
    const translate = (value) => {
      const trimmed = value.trim();
      return dictionary[trimmed] ? value.replace(trimmed, dictionary[trimmed]) : value;
    };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement && !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentElement.tagName)) {
        const translated = translate(node.nodeValue);
        if (translated !== node.nodeValue) node.nodeValue = translated;
      }
    }
    document.querySelectorAll('[placeholder], [aria-label], [title]').forEach((el) => {
      ['placeholder', 'aria-label', 'title'].forEach((attr) => { if (el.hasAttribute(attr)) el.setAttribute(attr, translate(el.getAttribute(attr))); });
    });
    document.title = translate(document.title);
  }

  function getCurrentLanguage() {
    return localStorage.getItem('app_language') || 'pt';
  }

  function setLanguage(lang) {
    if (!translations[lang]) return;
    localStorage.setItem('app_language', lang);
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
    applyTranslations();
  }

  function t(key) {
    const lang = getCurrentLanguage();
    const dict = translations[lang] || translations.pt;
    return dict[key] || translations.pt[key] || key;
  }

  function applyTranslations() {
    const lang = getCurrentLanguage();
    const dict = translations[lang] || translations.pt;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        // If element contains an icon <i data-lucide="..."></i> or <svg>, preserve the icon!
        const icon = el.querySelector('i[data-lucide], svg');
        if (icon) {
          const iconHTML = icon.outerHTML;
          el.innerHTML = iconHTML + ' ' + dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });
    translateLegacyContent();
  }

  window.i18n = {
    getCurrentLanguage,
    setLanguage,
    t,
    applyTranslations
  };

  document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    const observer = new MutationObserver(() => translateLegacyContent());
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  });
})();
