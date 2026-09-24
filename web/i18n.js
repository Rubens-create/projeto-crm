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
      'services.modalNewTitle': 'Add service',
      'services.modalNewSub': 'Select an existing property and define its service settings.',
      'services.modalEditTitle': 'Edit service',
      'services.modalEditSub': 'Update the linked property and service settings.',
      'services.fieldName': 'Property / Service Name',
      'services.fieldDesc': 'Cleaning Type / Description',
      'services.fieldRate': 'Hourly Rate (R$)',
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
      'config.defaultRate': 'Suggested Default Rate (R$/hour)',
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
    'Gerando arquivo PDF do Demonstrativo Financeiro...': 'Generating the financial statement PDF...',

    // Shared labels, navigation, loading states and accessibility.
    'Imóveis': 'Properties', 'Imóvel': 'Property', 'Cliente': 'Client', 'Prestador': 'Provider',
    'Prestadores': 'Providers', 'Profissional': 'Professional', 'Serviço': 'Service', 'Nome': 'Name',
    'Telefone': 'Phone', 'Telefone / WhatsApp': 'Phone / WhatsApp', 'Contato': 'Contact',
    'Especialidade': 'Specialty', 'Nome completo': 'Full name', 'Data': 'Date', 'Horas': 'Hours',
    'Valor': 'Amount', 'Descrição': 'Description', 'Observações': 'Notes', 'Endereço': 'Address',
    'Fechar': 'Close', 'Continuar': 'Continue', 'Atualizar': 'Refresh', 'Ativar': 'Enable',
    'Desativar': 'Disable', 'Inativo': 'Inactive', 'Arquivado': 'Archived', 'Arquivados': 'Archived',
    'Arquivar': 'Archive', 'Concluído': 'Completed', 'Concluídas': 'Completed', 'Cancelado': 'Canceled',
    'Em execução': 'In progress', 'Pendente': 'Pending', 'Pago': 'Paid', 'Hoje': 'Today',
    'Não informado': 'Not provided', 'Sem imóvel': 'No property', 'Sem cliente': 'No client',
    'Sem e-mail': 'No email', 'Sem telefone': 'No phone', 'Limpeza': 'Cleaning',
    'Serviço de limpeza': 'Cleaning service', 'Abrir menu': 'Open menu', 'Conteúdo administrativo': 'Admin content',
    'Abrir gestão de imóveis': 'Open property management', 'Carregando tela': 'Loading page',
    'Preparando informações da operação': 'Preparing operational data',
    'Falha ao carregar dados.': 'Failed to load data.', 'Não foi possível concluir a operação.': 'Unable to complete the operation.',
    'Erro ao comunicar com o servidor.': 'Error communicating with the server.',
    'Não foi possível conectar ao servidor.': 'Unable to connect to the server.',
    'Selecione um imóvel': 'Select a property', 'Selecione o imóvel': 'Select the property',
    'Selecione primeiro o imóvel': 'Select a property first', 'Selecione o prestador': 'Select a provider',
    'Carregando prestadores...': 'Loading providers...', 'Carregando imóveis...': 'Loading properties...',
    'Nenhum imóvel ativo disponível': 'No active properties available', 'Nenhum atendimento ativo disponível': 'No active services available',
    'Nenhum serviço ativo neste imóvel': 'No active services at this property',

    // Property directory, editor and details.
    'Zygg | Gestão de Imóveis': 'Zygg | Property Management', 'PATRIMÔNIO & OPERAÇÃO': 'PROPERTIES & OPERATIONS',
    'Cadastre propriedades e acompanhe clientes e serviços relacionados.': 'Register properties and track their clients and services.',
    'Novo imóvel': 'New property', 'Editar imóvel': 'Edit property', 'Total de imóveis': 'Total properties',
    'Unidades cadastradas': 'Registered units', 'Imóveis ativos': 'Active properties',
    'Disponíveis para operação': 'Available for operations', 'Com cliente': 'With a client',
    'Vínculos confirmados': 'Confirmed links', 'Aguardando vínculo': 'Awaiting a client',
    'O cadastro físico do imóvel é gerenciado exclusivamente nesta seção.': 'Property details are managed exclusively in this section.',
    'Pesquisar nome, endereço ou cliente': 'Search by name, address or client', 'Estrutura': 'Layout',
    'Dados físicos e vínculo com o cliente proprietário.': 'Property details and its owner or client.',
    'Nome do imóvel': 'Property name', 'Cliente vinculado': 'Linked client', 'Não vinculado': 'Not linked',
    'Endereço completo': 'Full address', 'Rua, número, bairro e cidade': 'Street, number, neighborhood and city',
    'Observações, acesso e informações do imóvel': 'Notes, access instructions and property information',
    'Quartos': 'Bedrooms', 'Banheiros': 'Bathrooms', 'Salas': 'Living rooms', 'Metragem (m²)': 'Area (m²)',
    'Tempo estimado padrão': 'Default estimated time', 'Foto do imóvel': 'Property photo',
    'Escolher uma foto': 'Choose a photo', 'JPG, PNG ou WEBP': 'JPG, PNG or WEBP',
    'Nenhuma imagem selecionada': 'No image selected', 'Imagem atual': 'Current image', 'Salvar imóvel': 'Save property',
    'Endereço não informado': 'Address not provided', 'Nenhum imóvel encontrado.': 'No properties found.',
    'Sem estimativa': 'No estimate', 'Tempo padrão': 'Default time', 'Sem descrição.': 'No description.',
    'Serviços relacionados': 'Related services', 'Nenhum serviço relacionado.': 'No related services.',
    'Imóvel arquivado sem apagar o histórico.': 'Property archived with its history preserved.',
    'Imóvel sem vínculos excluído.': 'Unlinked property deleted.', 'Imóvel atualizado com sucesso.': 'Property updated successfully.',
    'Imóvel criado com sucesso.': 'Property created successfully.', 'Não foi possível carregar os imóveis.': 'Unable to load properties.',
    'Ex.: Loft Jardins': 'e.g. Jardins Loft', 'Ex.: 2.5h': 'e.g. 2.5h',

    // Dashboard and execution history.
    'Zygg | Visão geral da operação': 'Zygg | Operations Overview', 'Administração': 'Administration',
    'Visão geral': 'Overview', 'CENTRO DE CONTROLE': 'CONTROL CENTER', 'Visão geral da operação': 'Operations overview',
    'Indicadores consolidados de serviços, equipe, clientes e repasses.': 'Consolidated metrics for services, staff, clients and payouts.',
    'Atualizando...': 'Updating...', 'Ver relatórios': 'View reports', 'Indicadores principais': 'Key metrics',
    'Em execução agora': 'In progress now', 'Operação em tempo real': 'Real-time operations',
    'Serviços concluídos': 'Completed services', 'Histórico total registrado': 'All recorded history',
    'Valor das execuções concluídas': 'Value of completed services', 'Repasses pendentes': 'Pending payouts',
    'Valor aguardando pagamento': 'Amount awaiting payment', 'Estrutura da operação': 'Operational resources',
    'serviços ativos': 'active services', 'imóveis em operação': 'active properties',
    'prestadores ativos': 'active providers', 'clientes ativos': 'active clients',
    'Operação recente': 'Recent activity', 'Últimas execuções registradas pelos prestadores.': 'Latest services recorded by providers.',
    'Ver histórico': 'View history', 'Carregando operação...': 'Loading operations...',
    'Resumo financeiro': 'Financial summary', 'Receita e repasses da operação.': 'Operational revenue and payouts.',
    'Resultado operacional': 'Operating result', 'Faturamento menos repasses pagos': 'Revenue minus paid payouts',
    'Calculando proporção...': 'Calculating share...', 'Faturamento': 'Revenue', 'A pagar': 'To pay',
    'Volume nos últimos 7 dias': 'Activity over the last 7 days', 'Execuções iniciadas por dia.': 'Services started each day.',
    'Gráfico de serviços nos últimos sete dias': 'Services chart for the last seven days',
    'Saúde da operação': 'Operational health', 'Disponibilidade dos principais recursos.': 'Availability of key resources.',
    'Equipe disponível': 'Available staff', 'Catálogo ativo': 'Active catalog', 'Repasses': 'Payouts',
    'Nenhuma execução registrada ainda.': 'No service executions recorded yet.', 'Nenhum valor pendente': 'No pending amount',
    'Operando': 'Operating', 'Atenção': 'Attention', 'Disponível': 'Available', 'Em dia': 'Up to date',
    'Não foi possível carregar os dados da operação.': 'Unable to load operational data.',
    'Falha na atualização': 'Update failed', 'Não foi possível carregar a visão geral da operação.': 'Unable to load the operations overview.',
    'Zygg | Execuções de serviços': 'Zygg | Service Executions', 'Execuções realizadas': 'Service history',
    'OPERAÇÃO REAL': 'LIVE OPERATIONS', 'Execuções de serviços': 'Service executions',
    'Histórico de atendimentos concluídos e pendentes de repasse.': 'History of completed services and pending payouts.',
    'Ver repasses': 'View payouts', 'Pendente de repasse': 'Pending payout', 'Repasse': 'Payout',
    'Gerar repasse': 'Create payout', 'Nenhuma execução encontrada.': 'No service executions found.',
    'CONCLUIDO': 'Completed', 'EM_ANDAMENTO': 'In progress', 'CANCELADO': 'Canceled',

    // Professionals and manual hours.
    'Novo profissional': 'New professional', 'Editar profissional': 'Edit professional',
    'Total de profissionais': 'Total professionals', 'Todos os cadastros': 'All records',
    'Profissionais ativos': 'Active professionals',
    'Acompanhe os dados de cada profissional, horas trabalhadas e seu status.': 'Track each professional’s details, hours worked and status.',
    'Cadastre um prestador de serviço para acesso à plataforma.': 'Register a service provider to access the platform.',
    'Atualize os dados de contato e especialidade do prestador.': 'Update the provider’s contact details and specialty.',
    'Adicionar horas': 'Add hours', 'Registre manualmente um serviço concluído pelo prestador.': 'Manually record a service completed by the provider.',
    'Prestador cadastrado': 'Registered provider', 'Serviço e tarifa': 'Service and rate', 'Data do serviço': 'Service date',
    'Horário de início': 'Start time', 'Tarifa do serviço': 'Service rate', 'Valor estimado': 'Estimated amount',
    'Ex.: Ana Souza': 'e.g. Ana Souza', 'Ex.: 2,5': 'e.g. 2.5',
    'Ex.: ajuste conferido com o cliente, material utilizado ou ocorrência': 'e.g. adjustment confirmed with the client, supplies used or incident',
    'Falha ao carregar profissionais.': 'Failed to load professionals.', 'Falha ao carregar imóveis.': 'Failed to load properties.',
    'Não foi possível carregar os imóveis para lançamento de horas.': 'Unable to load properties for manual hours.',
    'Não foi possível atualizar o profissional.': 'Unable to update the professional.',
    'Não foi possível cadastrar o profissional.': 'Unable to register the professional.',

    // Clients.
    'Novo cliente': 'New client', 'Editar cliente': 'Edit client', 'Contratos ativos': 'Active contracts',
    'Em atendimento regular': 'Receiving regular service', 'Faturamento acumulado': 'Accumulated revenue',
    'Clientes cadastrados': 'Registered clients', 'Cliente / Empresa': 'Client / Company',
    'Consulte os imóveis vinculados sem duplicar o cadastro imobiliário.': 'View linked properties without duplicating property records.',
    'Cadastre o cliente. Os imóveis são gerenciados na seção Imóveis.': 'Register the client. Properties are managed in the Properties section.',
    'Atualize os dados de contato. Os imóveis vinculados permanecem inalterados.': 'Update contact details. Linked properties remain unchanged.',
    'Cadastrar proprietário': 'Add owner', 'Ex.: Dra. Camila Rocha': 'e.g. Dr. Camila Rocha',
    'Nenhum imóvel vinculado': 'No linked properties', 'Nenhum cliente encontrado.': 'No clients found.',
    'Falha ao carregar clientes.': 'Failed to load clients.', 'Não foi possível carregar os clientes.': 'Unable to load clients.',
    'Não foi possível alterar o status do cliente.': 'Unable to change the client’s status.',
    'Não foi possível atualizar o cliente.': 'Unable to update the client.', 'Não foi possível cadastrar o cliente.': 'Unable to register the client.',

    // Payments and reports.
    'Zygg | Central de Pagamentos & Repasses': 'Zygg | Payments & Payouts',
    'Registrar repasse': 'Record payout', 'Registrar novo repasse': 'Record a new payout', 'Registrar Repasse': 'Record Payout',
    'Lance um pagamento para a equipe de prestadores.': 'Record a payment for the provider team.',
    'Nome do Prestador': 'Provider Name', 'Horas Trabalhadas': 'Hours Worked', 'Tarifa Horária (R$)': 'Hourly Rate (R$)',
    'Horas Gravadas': 'Recorded Hours', 'Valor Devido': 'Amount Due', 'Nenhum repasse encontrado.': 'No payouts found.',
    'Marcar como pendente': 'Mark as pending', 'Marcar como pago': 'Mark as paid',
    'Erro ao atualizar o status do repasse.': 'Unable to update the payout status.',
    'Repasse marcado como pendente novamente.': 'Payout marked as pending again.',
    'Repasse marcado como pago com sucesso!': 'Payout marked as paid successfully!',
    'Falha ao carregar prestadores e atendimentos.': 'Failed to load providers and services.',
    'Não foi possível carregar prestadores e atendimentos.': 'Unable to load providers and services.',
    'Imóvel selecionado': 'Selected property', 'Atendimento selecionado': 'Selected service',
    'Exportar CSV': 'Export CSV', 'Exportar PDF': 'Export PDF', 'Proprietários cadastrados': 'Registered owners',
    'Demonstrativo Operacional': 'Operational Statement',
    'Selecione o filtro ou subitem do menu lateral para alternar a visão do relatório.': 'Select a filter or sidebar item to switch report views.',
    'Categoria / Item': 'Category / Item', 'Detalhamento': 'Details', 'Atendimentos / Horas': 'Services / Hours',
    'Faturamento Bruto': 'Gross Revenue', 'Repasse Equipe': 'Team Payout', 'Margem Líquida': 'Net Margin',
    'Horas Mês': 'Monthly Hours', 'Ganhos Mês': 'Monthly Earnings', 'Propriedades': 'Properties',
    'Gasto Mensal': 'Monthly Spending', 'Período': 'Period', 'Valor Pago': 'Amount Paid',
    'Valor Base': 'Base Rate', 'Cômodos': 'Rooms', 'Tempo Est.': 'Est. Time',
    'Não foi possível salvar o serviço.': 'Unable to save the service.', 'Serviço excluído com sucesso.': 'Service deleted successfully.',
    'Serviço criado para o imóvel selecionado.': 'Service created for the selected property.',
    'Serviço atualizado com sucesso.': 'Service updated successfully.', 'Visibilidade do serviço atualizada.': 'Service visibility updated.',
    'Falha ao carregar serviços e imóveis.': 'Failed to load services and properties.',
    'Não foi possível carregar os serviços.': 'Unable to load services.',
    'Cadastre um imóvel ativo antes de criar um serviço.': 'Register an active property before creating a service.',

    // Settings.
    'Permite que o prestador veja o contador de segundos e centésimos em tempo real.': 'Shows providers seconds and hundredths of a second in real time.',
    'Exibe a curva de rendimento durante a realização do serviço no aplicativo.': 'Displays an earnings chart while a service is in progress.',
    'Permite salvar o aplicativo na tela inicial do celular com Service Worker offline.': 'Allows adding the app to the phone’s home screen with offline service worker support.',
    'PostgreSQL 18 (Banco Local)': 'PostgreSQL 18 (Local Database)',
    'Informações de conexão e persistência de dados do sistema.': 'System connection and data persistence information.',
    'Servidor / Host': 'Server / Host', 'Nome do Banco': 'Database Name', 'Usuário PostgreSQL': 'PostgreSQL User',
    'Status da Conexão': 'Connection Status', '🟢 Conectado e Persistente': '🟢 Connected and Persistent',
    'Configurações salvas com sucesso': 'Settings saved successfully', 'Erro ao salvar no banco de dados': 'Error saving to the database',

    // Provider app, timer, service details and achievements.
    'Zygg | Área do prestador': 'Zygg | Provider Area', 'ÁREA DO PRESTADOR': 'PROVIDER AREA',
    'Menu do perfil': 'Profile menu', 'Prestadora de serviços': 'Service provider', 'Conquistas': 'Achievements',
    'Sair da conta': 'Log out', 'Conta ativa': 'Active account', 'Ganhos neste período': 'Earnings this period',
    'Meus serviços': 'My services', 'Histórico das minhas execuções.': 'My service history.', 'Horas da semana': 'Weekly hours',
    'Horas trabalhadas por dia nos últimos 7 dias.': 'Hours worked each day over the last 7 days.', 'nesta semana': 'this week',
    'Como funciona': 'How it works', 'Seu pagamento é calculado por hora.': 'Your pay is calculated by the hour.',
    'Escolha um serviço': 'Choose a service', 'Veja as atividades disponíveis e o valor por hora.': 'View available services and hourly rates.',
    'Inicie o cronômetro': 'Start the timer', 'Registre exatamente o tempo trabalhado.': 'Record your exact working time.',
    'Finalize o serviço': 'Finish the service', 'Confirme o total calculado para receber o repasse.': 'Confirm the calculated total to receive your payout.',
    'Meu cronômetro': 'My timer', 'Inicie quando começar um serviço.': 'Start when you begin a service.',
    'Ganhos nesta sessão (ao vivo)': 'Session earnings (live)', 'Pausado': 'Paused', 'Pausar cronômetro': 'Pause timer',
    'Retomar cronômetro': 'Resume timer', '/ hora': '/ hour', 'Estrutura & Detalhes do Imóvel': 'Property Layout & Details',
    'Quarto(s)': 'Bedroom(s)', 'Banheiro(s)': 'Bathroom(s)', 'Sala(s)': 'Living room(s)',
    'Tipo de Atendimento': 'Service Type', 'Higienização Padrão Airbnb': 'Standard Airbnb Cleaning',
    'O que inclui no imóvel:': 'What’s included at the property:',
    'Troca e alinhamento de enxoval de cama e banho': 'Change and arrange bed linens and towels',
    'Higienização de banheiros e reposição de amenities': 'Clean bathrooms and replenish amenities',
    'Limpeza de superfícies, louça e micro-ondas': 'Clean surfaces, dishes and microwave',
    'Recolhimento de lixo e verificação de pertences esquecidos': 'Remove trash and check for forgotten belongings',
    'Selecionar e ir para o Cronômetro': 'Select and go to Timer', 'Minhas Conquistas': 'My Achievements',
    'Acompanhe suas metas e marcos na plataforma Zygg.': 'Track your goals and milestones on Zygg.',
    '1.000 horas trabalhadas': '1,000 hours worked', 'Acumule mil horas em atendimentos executados.': 'Accumulate one thousand hours of completed services.',
    'Meta: 1.000h': 'Goal: 1,000h', 'R$ 10.000 ganhos': 'R$ 10,000 earned',
    'Atinja dez mil reais em faturamento total com serviços.': 'Reach ten thousand reais in total service earnings.',
    'Meta: R$ 10.000,00': 'Goal: R$ 10,000.00', 'R$ 20.000 ganhos': 'R$ 20,000 earned',
    'Alcance vinte mil reais acumulados como prestador parceiro.': 'Reach twenty thousand reais earned as a partner provider.',
    'Meta: R$ 20.000,00': 'Goal: R$ 20,000.00', '5 dias seguidos trabalhando 8h': '5 consecutive days working 8h',
    'Mantenha uma sequência de 5 dias consecutivos com 8h ou mais de dedicação.': 'Maintain a streak of 5 consecutive days working at least 8 hours.',
    'Meta: 5 dias (8h/dia)': 'Goal: 5 days (8h/day)', 'Concluído 🏆': 'Completed 🏆',
    'A execução foi registrada com sucesso.': 'The service was recorded successfully.',

    // Login, provider registration and first-time setup.
    'Zygg | Criar conta de prestador': 'Zygg | Create a Provider Account', 'Voltar para o login': 'Back to sign in',
    'SEJA PARCEIRO ZYGG': 'BECOME A ZYGG PARTNER', 'Crie sua conta': 'Create your account',
    'Cadastre-se para receber serviços e acompanhar seus ganhos em um só lugar.': 'Sign up to receive services and track your earnings in one place.',
    'Como podemos chamar você?': 'What should we call you?', 'Ex.: Limpeza residencial': 'e.g. Residential cleaning',
    'Mínimo de 8 caracteres': 'At least 8 characters', 'Confirmar senha': 'Confirm password', 'Repita sua senha': 'Repeat your password',
    'Seus dados ficam protegidos e são usados apenas para o seu cadastro.': 'Your data is protected and used only for your registration.',
    'Criar minha conta': 'Create my account', 'Já tem uma conta?': 'Already have an account?',
    'Entrar como prestador': 'Sign in as a provider', 'As senhas não conferem.': 'Passwords do not match.',
    'Este e-mail já está cadastrado. Tente entrar.': 'This email is already registered. Try signing in.',
    'Confira os campos e use uma senha com pelo menos 8 caracteres.': 'Check the fields and use a password with at least 8 characters.',
    'Não foi possível criar sua conta. Tente novamente.': 'Unable to create your account. Please try again.',
    'Não foi possível conectar à Zygg. Tente novamente.': 'Unable to connect to Zygg. Please try again.',
    'Zygg | Configuração inicial': 'Zygg | Initial Setup', 'PRIMEIRO ACESSO': 'FIRST-TIME SETUP',
    'Crie o superusuário': 'Create the superuser', 'Essa conta terá acesso completo à administração do Zygg.': 'This account will have full access to Zygg administration.',
    'Criar superusuário': 'Create superuser', 'A configuração inicial já foi concluída.': 'Initial setup has already been completed.',
    'Não foi possível criar o superusuário.': 'Unable to create the superuser.',
    'Idioma': 'Language', 'Alterar senha': 'Change password', 'Senha atual': 'Current password',
    'Nova senha': 'New password', 'Confirmar nova senha': 'Confirm new password', 'Salvar nova senha': 'Save new password',
    'Use uma senha com pelo menos 8 caracteres.': 'Use a password with at least 8 characters.',
    'Senha alterada': 'Password changed', 'Sua senha foi atualizada com sucesso.': 'Your password was updated successfully.',
    'Não foi possível alterar a senha.': 'Unable to change the password.',
    'current password is incorrect': 'A senha atual está incorreta.',
    'invalid password data': 'Confira as senhas e use pelo menos 8 caracteres.',
    'could not change password': 'Não foi possível alterar a senha.',
    'ACESSO SEGURO': 'SECURE ACCESS', 'Use suas credenciais administrativas ou de prestador.': 'Use your administrator or provider credentials.',
    'Primeiro acesso?': 'First time here?', 'Ainda não tem uma conta?': 'Don’t have an account yet?',
    'Criar conta de prestador': 'Create a provider account', 'Conta criada com sucesso. Entre para continuar.': 'Account created successfully. Sign in to continue.',
    'Esta conta não possui acesso administrativo.': 'This account does not have administrator access.',
    'Esta conta não possui acesso à área do prestador.': 'This account does not have access to the provider area.',
    'Zygg | Execuções': 'Zygg | Service History', 'Total a repassar': 'Total pending payout',
    'Totalmente liquidados': 'Fully settled', 'Horas faturadas': 'Billed hours', 'Nesta semana': 'This week',
    'Sexta-feira': 'Friday', 'Em 2 dias': 'In 2 days', 'Pendentes': 'Pending', 'Pagos': 'Paid',
    'Extrato de Repasses de Limpeza': 'Cleaning Payout Statement',
    'Valores calculados em tempo real a partir das horas trabalhadas.': 'Amounts calculated in real time from hours worked.',
    'Relatórios Gerenciais': 'Management Reports',
    'Visão analítica dos atendimentos, horas gravadas e faturamento consolidado.': 'Analysis of services, recorded hours and consolidated revenue.',
    'Real Brasileiro (R$)': 'Brazilian Real (R$)', 'Não foi possível adicionar as horas.': 'Unable to add hours.',
    'Limpeza Pós Check-out + Enxoval': 'Post-checkout Cleaning + Linens',
    'Dom': 'Sun', 'Seg': 'Mon', 'Ter': 'Tue', 'Qua': 'Wed', 'Qui': 'Thu', 'Sex': 'Fri', 'Sáb': 'Sat',
    'dom': 'sun', 'seg': 'mon', 'ter': 'tue', 'qua': 'wed', 'qui': 'thu', 'sex': 'fri', 'sáb': 'sat',

    // Public product page and carousel.
    'Zygg | Gestão inteligente para operações de limpeza': 'Zygg | Smart Management for Cleaning Operations',
    'Zygg, início': 'Zygg, home', 'Fechar menu': 'Close menu', 'Navegação principal': 'Main navigation',
    'Produto': 'Product', 'Recursos': 'Features', 'Benefícios': 'Benefits', 'Começar': 'Get started',
    'Plataforma para operações de serviços': 'A platform for service operations',
    'Gestão inteligente': 'Smart management', 'para operações': 'for cleaning', 'de limpeza.': 'operations.',
    'Controle serviços, prestadores, clientes, tempo e repasses em um único lugar, com visão clara da sua operação todos os dias.': 'Manage services, providers, clients, time and payouts in one place, with a clear view of your operation every day.',
    'Conhecer o Zygg': 'Explore Zygg', 'Acessar sistema': 'Open the platform', 'Prévia do dashboard Zygg': 'Zygg dashboard preview',
    'zygg / visão geral': 'zygg / overview', 'zygg / serviços': 'zygg / services', 'zygg / repasses': 'zygg / payouts',
    'OPERAÇÃO · AGOSTO': 'OPERATIONS · AUGUST', 'CATÁLOGO · AGOSTO': 'CATALOG · AUGUST', 'FINANCEIRO · AGOSTO': 'FINANCE · AUGUST',
    'Atualizado agora': 'Just updated', 'Serviços hoje': 'Services today', 'ao vivo': 'live', 'este mês': 'this month',
    'Visão financeira': 'Financial overview', 'Últimos 7 dias': 'Last 7 days', '● AO VIVO': '● LIVE',
    'Serviços cadastrados': 'Registered services', 'Limpeza de troca': 'Turnover cleaning', 'Limpeza completa': 'Full cleaning',
    'Manutenção leve': 'Light maintenance', 'Repasses da operação': 'Operational payouts', 'Total do mês': 'Monthly total',
    'Controles da prévia': 'Preview controls', 'Tela anterior': 'Previous slide', 'Telas da prévia': 'Preview slides',
    'Ver visão geral': 'View overview', 'Ver serviços': 'View services', 'Próxima tela': 'Next slide',
    'Uma operação organizada não depende de planilhas soltas.': 'An organized operation does not rely on scattered spreadsheets.',
    'Uma operação, uma visão': 'One operation, one view', 'O que acontece no campo': 'What happens in the field',
    'chega ao seu': 'is under your', 'controle.': 'control.',
    'O Zygg reúne as partes críticas da sua operação em uma visão simples de entender e fácil de agir.': 'Zygg brings the key parts of your operation into a view that is easy to understand and act on.',
    '01 / Serviços': '01 / Services', '03 / Prestadores': '03 / Providers', '04 / Relatórios': '04 / Reports',
    '05 / Repasses': '05 / Payouts', '06 / Clientes': '06 / Clients',
    'Gestão centralizada de cada imóvel.': 'Centralized management of every property.',
    'Cadastre serviços, tarifas e informações operacionais sem perder contexto.': 'Register services, rates and operational details with all the context you need.',
    'Interior do Studio Pinheiros': 'Studio Pinheiros interior', 'O tempo trabalhado, sem adivinhação.': 'Working time, without guesswork.',
    'Tempo trabalhado em andamento': 'Current working time', 'EM ANDAMENTO': 'IN PROGRESS', '● EM ANDAMENTO': '● IN PROGRESS',
    'O prestador inicia, pausa e finaliza pelo celular. O registro vira histórico.': 'Providers start, pause and finish on their phones. Every record becomes part of the history.',
    'Equipe informada. Gestão mais leve.': 'Informed staff. Easier management.',
    'Disponibilidade, histórico e ganhos visíveis no momento certo.': 'Availability, history and earnings visible when you need them.',
    'Em serviço agora': 'Working now', 'Dados operacionais que viram decisão.': 'Operational data that informs decisions.',
    'Horas, serviços, faturamento e repasses em uma só leitura.': 'Hours, services, revenue and payouts at a glance.',
    'semana operacional': 'operational week', 'pagos': 'paid', 'pendentes': 'pending',
    'Todos os clientes e imóveis, no mesmo lugar.': 'All clients and properties in one place.',
    'Menos busca. Mais contexto para atender melhor.': 'Less searching. More context for better service.',
    'Você sabe exatamente': 'You know exactly', 'o que está': 'what is', 'acontecendo.': 'happening.',
    'Do início de uma limpeza ao valor do repasse, o Zygg acompanha a operação sem transformar sua rotina em mais trabalho.': 'From the start of a cleaning job to its payout, Zygg tracks your operation without adding more work to your day.',
    'Ver o sistema': 'View the platform', 'Prestador responsável': 'Assigned provider', 'TEMPO': 'TIME', 'VALOR': 'AMOUNT',
    'Atualizado em tempo real': 'Updated in real time', 'Processo claro': 'A clear process',
    'Organize. Execute.': 'Organize. Execute.', 'Controle.': 'Manage.',
    'Uma sequência simples para uma operação que funciona todos os dias.': 'A simple sequence for an operation that works every day.',
    'Cadastre': 'Register', 'Imóveis, clientes e tarifas.': 'Properties, clients and rates.', 'Organize': 'Organize',
    'Os serviços da sua operação.': 'Your operational services.', 'Execute': 'Execute', 'O prestador inicia no celular.': 'The provider starts on their phone.',
    'Controle': 'Manage', 'Tempo, valores e repasses.': 'Time, amounts and payouts.', 'Analise': 'Analyze',
    'Decisões baseadas na operação.': 'Decisions based on operational data.', 'GANHOS NESTA SESSÃO': 'SESSION EARNINGS',
    'Feito também para quem executa': 'Built for those doing the work too', 'O prestador tem': 'Every provider has',
    'seu próprio': 'their own', 'espaço.': 'space.',
    'Uma experiência mobile simples para selecionar o serviço, registrar tempo, concluir o trabalho e acompanhar seus ganhos.': 'A simple mobile experience to select a service, track time, finish the job and follow your earnings.',
    'Escolha o serviço': 'Choose a service', 'Inicie o timer': 'Start the timer', 'Realize o trabalho': 'Do the work',
    'Finalize e veja seus ganhos': 'Finish and view your earnings', 'Conhecer área do prestador': 'Explore the provider area',
    'Centro de comando': 'Command center', 'É aqui que você controla': 'This is where you manage', 'a operação': 'your entire', 'inteira.': 'operation.',
    'OPERAÇÃO': 'OPERATIONS', '08 de agosto, 2026': 'August 8, 2026', 'Volume de serviços': 'Service volume', 'Este mês': 'This month',
    'Serviços organizados': 'Organized services', 'Repasses claros': 'Clear payouts', 'Equipe conectada': 'Connected staff',
    'Ganhos para a operação': 'Benefits for your operation', 'Menos ruído.': 'Less noise.', 'Mais': 'More', 'clareza.': 'clarity.',
    'Mais controle': 'More control', 'Todas as operações centralizadas.': 'All operations centralized.',
    'Menos trabalho manual': 'Less manual work', 'Reduza planilhas e controles dispersos.': 'Reduce scattered spreadsheets and tracking tools.',
    'Mais transparência': 'More transparency', 'Saiba o que foi feito e o que deve ser pago.': 'Know what was done and what needs to be paid.',
    'Mais produtividade': 'More productivity', 'Equipe trabalhando com processos claros.': 'Staff working with clear processes.',
    'Dados reais': 'Real data', 'Escalabilidade': 'Scalability', 'Estrutura preparada para crescer.': 'Ready to grow with your operation.',
    'Pronto para organizar': 'Ready to get organized', 'Sua operação merece': 'Your operation deserves', 'mais': 'more',
    'Centralize serviços, prestadores e resultados em um só lugar.': 'Centralize services, providers and results in one place.',
    'Começar agora': 'Get started now', 'Gestão inteligente para operações de limpeza.': 'Smart management for cleaning operations.',
    'Serviços sob controle': 'Services under control', 'Serviços organizados.': 'Organized services.',
    'Execução sem': 'Execution without', 'ruído.': 'noise.',
    'Cadastre cada serviço, tarifa e imóvel em um catálogo claro para sua equipe executar com contexto e consistência.': 'Register every service, rate and property in a clear catalog so your staff can work with context and consistency.',
    'Financeiro sem surpresas': 'Finances without surprises', 'para uma operação': 'for a healthy', 'saudável.': 'operation.',
    'Acompanhe o que foi pago, o que está pendente e quanto cada prestador deve receber em uma leitura simples.': 'See what has been paid, what is pending and how much each provider is owed at a glance.'
  };
  const legacyPortuguese = Object.fromEntries(Object.entries(legacyEnglish).map(([pt, en]) => [en, pt]));
  // Whole UI phrases only: interpolate values without translating names or form data.
  const templates = {
    '{count} serviço(s)': '{count} service(s)', '{count} imóvel(is)': '{count} property/properties',
    '{amount}/mês': '{amount}/month', '{count} dias seguidos': '{count} consecutive days',
    '{count} dia(s) consecutivo(s)': '{count} consecutive day(s)', '{count}/5 dias': '{count}/5 days',
    'Olá, {name}': 'Hello, {name}', '{file} · pronto para salvar': '{file} · ready to save',
    'Bom dia, {name}': 'Good morning, {name}', '{count} ativos': '{count} active',
    '{percent}% concluído': '{percent}% completed', '{count} prestadores': '{count} providers',
    '{active} de {total} prestadores ativos': '{active} of {total} providers active',
    '{active} de {total} serviços disponíveis': '{active} of {total} services available',
    '{amount} aguardando liquidação': '{amount} awaiting settlement',
    '{percent}% dos repasses processados': '{percent}% of payouts processed',
    'Atualizado às {time}': 'Updated at {time}',
    'Arquivar o imóvel “{name}”? O histórico será preservado.': 'Archive property “{name}”? Its history will be preserved.',
    'Excluir permanentemente o imóvel “{name}”?': 'Permanently delete property “{name}”?',
    'Excluir o serviço "{name}"? Esta ação não pode ser desfeita.': 'Delete service "{name}"? This action cannot be undone.',
    '{error} Use a opção Arquivar para preservar os relacionamentos.': '{error} Use Archive to preserve related records.',
    'Status de {name} alterado.': 'Status of {name} updated.',
    'Profissional {name} cadastrado.': 'Professional {name} registered.',
    '{hours}h adicionadas para {name}. Valor: {amount}.': '{hours}h added for {name}. Amount: {amount}.',
    'Dados de {name} atualizados.': 'Details for {name} updated.',
    'Cliente {name} cadastrado. Vincule imóveis pela seção Imóveis.': 'Client {name} registered. Link properties in the Properties section.',
    '{name} foi desativado.': '{name} was disabled.', '{name} foi ativado.': '{name} was enabled.',
    'Repasse de {amount} para {name} salvo no banco!': 'Payout of {amount} to {name} saved!',
    '{bedrooms}Q · {bathrooms}B · {livingRooms}S': '{bedrooms} bedrooms · {bathrooms} bathrooms · {livingRooms} living rooms',
    '{bedrooms}Q · {bathrooms}B · {livingRooms}S · {sqm}m²': '{bedrooms} bedrooms · {bathrooms} bathrooms · {livingRooms} living rooms · {sqm}m²'
  };
  const interpolate = (phrase, values) => phrase.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
  const templateMatchers = Object.entries(templates).flatMap(([pt, en]) => ['pt', 'en'].map(language => {
    const source = language === 'pt' ? en : pt;
    const target = language === 'pt' ? pt : en;
    const names = [];
    const pattern = source.split(/(\{\w+\})/).map(part => {
      if (/^\{\w+\}$/.test(part)) { names.push(part.slice(1, -1)); return '(.+?)'; }
      return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('');
    return { language, target, names, regex: new RegExp(`^${pattern}$`) };
  }));

  function translateText(value, language = getCurrentLanguage()) {
    const trimmed = value.trim();
    const dictionary = language === 'en' ? legacyEnglish : legacyPortuguese;
    if (Object.hasOwn(dictionary, trimmed)) return value.replace(trimmed, () => dictionary[trimmed]);
    for (const matcher of templateMatchers) {
      if (matcher.language !== language) continue;
      const match = trimmed.match(matcher.regex);
      if (match) {
        const values = Object.fromEntries(matcher.names.map((name, index) => [name, match[index + 1]]));
        return value.replace(trimmed, () => interpolate(matcher.target, values));
      }
    }
    return value;
  }

  function text(phrase, values = {}) {
    const translated = getCurrentLanguage() === 'en' ? (templates[phrase] || legacyEnglish[phrase] || phrase) : phrase;
    return interpolate(translated, values);
  }

  // Remember original text per node so switching back restores exact casing and plural forms.
  const originals = new WeakMap();
  const attributes = new WeakMap();
  const excluded = 'script, style, noscript, textarea, [translate="no"], [data-i18n]';
  function translateNode(node) {
    if (!node.parentElement || node.parentElement.closest(excluded) || !node.nodeValue.trim()) return;
    const previous = originals.get(node);
    const source = previous && previous.rendered === node.nodeValue ? previous.source : translateText(node.nodeValue, 'pt');
    const rendered = getCurrentLanguage() === 'en' ? translateText(source, 'en') : source;
    originals.set(node, { source, rendered });
    if (node.nodeValue !== rendered) node.nodeValue = rendered;
  }

  function translateAttributes(element) {
    if (element.closest('script, style, [translate="no"]')) return;
    const saved = attributes.get(element) || {};
    for (const attribute of ['placeholder', 'aria-label', 'title', 'alt']) {
      if (!element.hasAttribute(attribute)) continue;
      const value = element.getAttribute(attribute);
      const previous = saved[attribute];
      const source = previous?.rendered === value ? previous.source : translateText(value, 'pt');
      const rendered = getCurrentLanguage() === 'en' ? translateText(source, 'en') : source;
      saved[attribute] = { source, rendered };
      if (value !== rendered) element.setAttribute(attribute, rendered);
    }
    attributes.set(element, saved);
  }

  function translateLegacyContent(root = document.body) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) return translateNode(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) translateNode(walker.currentNode);
    if (root.nodeType === Node.ELEMENT_NODE) translateAttributes(root);
    root.querySelectorAll?.('[placeholder], [aria-label], [title], [alt]').forEach(translateAttributes);
  }

  function getCurrentLanguage() {
    return localStorage.getItem('app_language') || 'pt';
  }

  function setLanguage(lang) {
    if (!translations[lang]) return;
    localStorage.setItem('app_language', lang);
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
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        // Keep icons, controls and their event listeners intact.
        const nodes = [...el.childNodes].filter(node => node.nodeType === Node.TEXT_NODE);
        if (nodes.length) {
          const label = nodes.find(node => node.nodeValue.trim()) || nodes[0];
          label.nodeValue = el.children.length ? ` ${dict[key]} ` : dict[key];
          nodes.filter(node => node !== label).forEach(node => { node.nodeValue = ''; });
        } else el.append(document.createTextNode(dict[key]));
      }
    });
    translateLegacyContent();
    translateLegacyContent(document.querySelector('title'));
    document.querySelectorAll('[data-i18n-value]').forEach(el => { el.value = text(el.dataset.i18nValue); });
    document.querySelectorAll('#systemLanguageSelect').forEach(el => { el.value = lang; });
  }

  window.i18n = {
    getCurrentLanguage,
    setLanguage,
    t,
    applyTranslations,
    text,
    translateText,
    locale: () => getCurrentLanguage() === 'en' ? 'en-US' : 'pt-BR'
  };

  document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    const observer = new MutationObserver(records => {
      const roots = new Set();
      records.forEach(record => {
        if (record.type === 'childList') record.addedNodes.forEach(node => roots.add(node));
        else roots.add(record.target);
      });
      roots.forEach(translateLegacyContent);
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'aria-label', 'title', 'alt'] });
  });
  // The admin shell and its iframe share the language preference.
  window.addEventListener('storage', event => {
    if (event.key === 'app_language' || event.key === null) applyTranslations();
  });
})();
