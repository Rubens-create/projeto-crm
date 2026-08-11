(function () {
  const translations = {
    pt: {
      // Sidebar Navigation
      'nav.home': 'Início (Landing)',
      'nav.services': 'Serviços',
      'nav.professionals': 'Profissionais',
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
      'services.title': 'Tabela de Serviços & Imóveis',
      'services.subtitle': 'Gerencie propriedades, altere tarifas/hora e controle a exibição no app do prestador.',
      'services.newBtn': 'Novo serviço',
      'services.panelTitle': 'Catálogo de Imóveis & Tarifas',
      'services.panelSub': 'Altere os valores por hora e ative ou desative a exibição no aplicativo móvel.',
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
      'services.modalNewTitle': 'Cadastrar novo imóvel / serviço',
      'services.modalNewSub': 'Os serviços ativos serão disponibilizados imediatamente no app do prestador.',
      'services.modalEditTitle': 'Editar imóvel / serviço',
      'services.modalEditSub': 'Altere os dados do imóvel, tipo de limpeza, cômodos e precificação.',
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
      'config.langTitle': 'Idioma & Região',
      'config.langSubtitle': 'Alterne o idioma de exibição em todo o sistema (CRM & App).',
      'config.systemLanguage': 'Idioma do Sistema (Language)',
      'config.toastSave': 'Configurações e idioma salvos com sucesso!'
    },
    en: {
      // Sidebar Navigation
      'nav.home': 'Home (Landing)',
      'nav.services': 'Services',
      'nav.professionals': 'Professionals',
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
      'services.title': 'Services & Properties Table',
      'services.subtitle': 'Manage properties, update hourly rates and control visibility on provider app.',
      'services.newBtn': 'New service',
      'services.panelTitle': 'Properties Catalog & Rates',
      'services.panelSub': 'Change hourly rates and toggle visibility in mobile app.',
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
      'config.langTitle': 'Language & Region',
      'config.langSubtitle': 'Switch system-wide display language (CRM & App).',
      'config.systemLanguage': 'System Language',
      'config.toastSave': 'Settings and language saved successfully!'
    }
  };

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
  }

  window.i18n = {
    getCurrentLanguage,
    setLanguage,
    t,
    applyTranslations
  };

  document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
  });
})();
