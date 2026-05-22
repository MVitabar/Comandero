/** Additional UI strings missing from main translation bundles */

export const supplementalEn = {
  commons: {
    copy: "Copy",
    unknown: "Unknown",
  },
  orders: {
    addItemsDialog: {
      title: "Add items to order",
      description: "Select items and quantity to add to the order.",
      selectCategory: "Select category",
      selectProduct: "Select product",
      quantity: "Quantity",
      add: "Add",
      success: "Item added to order",
      errors: {
        orderDocIdMissing: "Order document ID not found.",
        addFailed: "Failed to add item: {{message}}",
      },
    },
    status: {
      pending: "Pending",
      preparing: "In preparation",
      ready: "Ready",
      delivered: "Delivered",
      cancelled: "Cancelled",
      closed: "Closed",
      ordering: "Ordering",
      served: "Served",
      finished: "Finished",
      null: "Unknown",
    },
    error: {
      establishmentIdNotFound: "Establishment ID not found",
      selectStatus: "Please select a status",
      updateStatusFailed: "Failed to update order status",
      deleteOrderFailed: "Failed to delete order",
      cancelOrderFailed: "Failed to cancel order",
    },
    errors: {
      createFailed: "Failed to create order",
      userNotAuthenticated: "User not authenticated",
      dbOrUserNotFound: "Database or user not found",
      establishmentIdNotFound: "Establishment ID not found",
      subscriptionFailed: "Error subscribing to orders",
      noOrderCreatedCallback: "Order creation callback not configured",
      orderCreationFailed: "Failed to create order",
    },
    actions: {
      viewOrder: "View order",
      addItems: "Add items",
      changeStatus: "Change status",
      delete: "Delete",
    },
    types: {
      unknown: "Unknown",
    },
    genericUser: "User",
    unnamedItem: "Unnamed item",
    noCategory: "Uncategorized",
    counter: "Counter",
    tableNamePrefix: "Table ",
    success: {
      orderCreatedDescription: "Order created for {{total}}",
      statusUpdated: "Order {{orderId}} status updated",
      orderDeleted: "Order {{orderId}} deleted",
      orderCancelled: "Order {{orderId}} cancelled",
    },
    errorsOrder: {
      orderCreationFailedDescription: "Failed to create order: {{error}}",
    },
  },
  errors: {
    accessDenied: {
      title: "Unauthorized Access",
      message: "You do not have permission to view this page",
      backHome: "Back to Home",
    },
    firebase: {
      title: "Firebase Error",
      description: "There was a problem connecting to our services. This might be due to:",
      reasons: {
        network: "Network connectivity issues",
        disruption: "Temporary service disruption",
        configuration: "Configuration problems",
      },
      technicalDetails: "Technical details:",
      refresh: "Refresh Page",
    },
  },
  users: {
    invitation: {
      title: "Add Team Member",
      labels: { username: "Username", role: "Role" },
      actions: { generating: "Generating...", generate: "Generate Invitation" },
      invitationLinkLabel: "Invitation link:",
      invitationExpiry: "This link will expire in 24 hours",
      generatedEmailLabel: "Generated email:",
      errors: {
        usernameRequired: "Username is required",
        establishmentNotFound: "Associated establishment not found",
        mustBeLoggedIn: "You must be logged in to add a team member",
        invitationFailed: "Failed to generate invitation",
      },
      success: {
        invitationCreated: "Invitation generated successfully",
        emailCopied: "Email copied to clipboard",
        linkCopied: "Link copied to clipboard",
      },
    },
    management: {
      title: "User Management",
      columns: { name: "Name", email: "Email", role: "Role", actions: "Actions" },
      errors: {
        noDeletePermission: "You do not have permission to delete users.",
        deleteFailed: "Failed to delete user.",
      },
    },
  },
  profile: {
    title: "User Profile",
    labels: {
      username: "Username",
      email: "Email",
      phone: "Phone Number",
      role: "Role",
    },
    selectRole: "Select Role",
    saving: "Saving...",
    saveChanges: "Save Changes",
  },
  dashboard: {
    toast: {
      salesAlert: "Sales alert!",
      goalReached: "Goal reached!",
      excelDownloaded: "General report downloaded as Excel",
      pdfDownloaded: "General report downloaded as PDF",
    },
    export: {
      salesByDay: "Sales by day",
      topProducts: "Top products",
      inventory: "Inventory",
      date: "Date",
      sales: "Sales",
      product: "Product",
      quantity: "Quantity",
      stock: "Stock",
      generalReport: "General-Report",
    },
  },
  auth: {
    errors: {
      stateChange: "Error during authentication state change",
      emailRequired: "Email is required",
      passwordRequired: "Password is required",
      emailAlreadyRegistered: "Email is already registered",
      invalidEmail: "Invalid email address",
      weakPassword: "Password is too weak",
      unexpectedError: "An unexpected error occurred",
      profileNotFound: "Failed to create user profile",
      ownerAlreadyExists: "An owner already exists for this establishment",
      invalidEmailFormat: "Invalid email format",
      passwordEmpty: "Password cannot be empty",
      userNotFound: "No user found with this email",
      wrongPassword: "Incorrect password",
      tooManyRequests: "Too many login attempts. Please try again later.",
      userDisabled: "This account has been disabled",
      accountSuspended: "Your account has been suspended. Please contact support.",
      userProfileNotFound: "User profile not found. Please contact support.",
      logoutUnexpected: "An unexpected error occurred during logout",
    },
  },
  reports: {
    errors: {
      fetchOrdersFailed: "Failed to fetch order data",
      fetchSalesFailed: "Failed to fetch sales data",
    },
  },
  tables: {
    defaultTableName: "Table {{number}}",
  },
  roles: {
    chef: "Chef",
  },
  dev: {
    firebaseTest: {
      title: "Firebase Configuration Test",
      description: "Test your Firebase configuration to ensure everything is working correctly",
      initialized: "Firebase Initialized:",
      error: "Error",
      app: "Firebase App:",
      auth: "Firebase Auth:",
      firestore: "Firebase Firestore:",
      configLabel: "Firebase Config:",
      set: "Set",
      missing: "Missing",
      runTests: "Run Tests",
    },
  },
}

export const supplementalEs = {
  commons: {
    copy: "Copiar",
    unknown: "Desconocido",
  },
  orders: {
    addItemsDialog: {
      title: "Agregar ítems al pedido",
      description: "Selecciona los ítems y la cantidad a agregar al pedido.",
      selectCategory: "Seleccionar categoría",
      selectProduct: "Seleccionar producto",
      quantity: "Cantidad",
      add: "Agregar",
      success: "Ítem agregado al pedido",
      errors: {
        orderDocIdMissing: "No se encontró el ID del documento del pedido.",
        addFailed: "Error al agregar ítem: {{message}}",
      },
    },
    status: {
      pending: "Pendiente",
      preparing: "En preparación",
      ready: "Listo",
      delivered: "Entregado",
      cancelled: "Cancelado",
      closed: "Cerrado",
      ordering: "Ordenando",
      served: "Servido",
      finished: "Finalizado",
      null: "Desconocido",
    },
    error: {
      establishmentIdNotFound: "ID de establecimiento no encontrado",
      selectStatus: "Seleccione un estado",
      updateStatusFailed: "Error al actualizar el estado del pedido",
      deleteOrderFailed: "Error al eliminar el pedido",
      cancelOrderFailed: "Error al cancelar el pedido",
    },
    errors: {
      createFailed: "Error al crear pedido",
      userNotAuthenticated: "Usuario no autenticado",
      dbOrUserNotFound: "Base de datos o usuario no encontrado",
      establishmentIdNotFound: "ID de establecimiento no encontrado",
      subscriptionFailed: "Error en la suscripción de pedidos",
      noOrderCreatedCallback: "Callback de creación de pedido no configurado",
      orderCreationFailed: "Error al crear el pedido",
    },
    actions: {
      viewOrder: "Ver pedido",
      addItems: "Agregar ítems",
      changeStatus: "Cambiar estado",
      delete: "Eliminar",
    },
    types: { unknown: "Desconocido" },
    genericUser: "Usuario",
    unnamedItem: "Ítem sin nombre",
    noCategory: "Sin categoría",
    counter: "Mostrador",
    tableNamePrefix: "Mesa ",
    success: {
      orderCreatedDescription: "Pedido creado por {{total}}",
      statusUpdated: "Estado del pedido {{orderId}} actualizado",
      orderDeleted: "Pedido {{orderId}} eliminado",
      orderCancelled: "Pedido {{orderId}} cancelado",
    },
    errorsOrder: {
      orderCreationFailedDescription: "Error al crear el pedido: {{error}}",
    },
  },
  errors: {
    accessDenied: {
      title: "Acceso No Autorizado",
      message: "No tienes permisos para ver esta página",
      backHome: "Volver al Inicio",
    },
    firebase: {
      title: "Error de Firebase",
      description: "Hubo un problema al conectar con nuestros servicios. Puede deberse a:",
      reasons: {
        network: "Problemas de conectividad de red",
        disruption: "Interrupción temporal del servicio",
        configuration: "Problemas de configuración",
      },
      technicalDetails: "Detalles técnicos:",
      refresh: "Actualizar página",
    },
  },
  users: {
    invitation: {
      title: "Agregar Miembro del Equipo",
      labels: { username: "Nombre de Usuario", role: "Rol" },
      actions: { generating: "Generando...", generate: "Generar Invitación" },
      invitationLinkLabel: "Enlace de invitación:",
      invitationExpiry: "Este enlace expirará en 24 horas",
      generatedEmailLabel: "Email generado:",
      errors: {
        usernameRequired: "El nombre de usuario es requerido",
        establishmentNotFound: "No se encontró el establecimiento asociado",
        mustBeLoggedIn: "Debes estar conectado para agregar un miembro al equipo",
        invitationFailed: "Error al generar la invitación",
      },
      success: {
        invitationCreated: "Invitación generada exitosamente",
        emailCopied: "Email copiado al portapapeles",
        linkCopied: "Enlace copiado al portapapeles",
      },
    },
    management: {
      title: "Gestión de Usuarios",
      columns: { name: "Nombre", email: "Correo", role: "Rol", actions: "Acciones" },
      errors: {
        noDeletePermission: "No tienes permisos para eliminar usuarios.",
        deleteFailed: "Error al eliminar el usuario.",
      },
    },
  },
  profile: {
    title: "Perfil de Usuario",
    labels: {
      username: "Nombre de Usuario",
      email: "Correo Electrónico",
      phone: "Número de Teléfono",
      role: "Rol",
    },
    selectRole: "Seleccionar rol",
    saving: "Guardando...",
    saveChanges: "Guardar cambios",
  },
  dashboard: {
    toast: {
      salesAlert: "¡Alerta de ventas!",
      goalReached: "¡Meta alcanzada!",
      excelDownloaded: "Informe general descargado en Excel",
      pdfDownloaded: "Informe general descargado en PDF",
    },
    export: {
      salesByDay: "Ventas por día",
      topProducts: "Productos destacados",
      inventory: "Inventario",
      date: "Fecha",
      sales: "Ventas",
      product: "Producto",
      quantity: "Cantidad",
      stock: "Stock",
      generalReport: "Informe-General",
    },
  },
  reports: {
    errors: {
      fetchOrdersFailed: "Error al obtener datos de pedidos",
      fetchSalesFailed: "Error al obtener datos de ventas",
    },
  },
  tables: {
    defaultTableName: "Mesa {{number}}",
  },
  auth: {
    errors: {
      stateChange: "Error durante el cambio de estado de autenticación",
      emailRequired: "El email es requerido",
      passwordRequired: "La contraseña es requerida",
      emailAlreadyRegistered: "El email ya está registrado",
      invalidEmail: "Dirección de email inválida",
      weakPassword: "La contraseña es demasiado débil",
      unexpectedError: "Ocurrió un error inesperado",
      profileNotFound: "Error al crear el perfil de usuario",
      ownerAlreadyExists: "Ya existe un propietario para este establecimiento",
      invalidEmailFormat: "Formato de email inválido",
      passwordEmpty: "La contraseña no puede estar vacía",
      userNotFound: "No se encontró usuario con este email",
      wrongPassword: "Contraseña incorrecta",
      tooManyRequests: "Demasiados intentos. Inténtelo más tarde.",
      userDisabled: "Esta cuenta ha sido deshabilitada",
      accountSuspended: "Su cuenta ha sido suspendida. Contacte soporte.",
      userProfileNotFound: "Perfil de usuario no encontrado. Contacte soporte.",
      logoutUnexpected: "Error inesperado al cerrar sesión",
    },
  },
  roles: {
    chef: "Chef",
  },
  dev: {
    firebaseTest: {
      title: "Prueba de configuración de Firebase",
      description: "Prueba tu configuración de Firebase para asegurarte de que todo funciona correctamente",
      initialized: "Firebase inicializado:",
      error: "Error",
      app: "App de Firebase:",
      auth: "Auth de Firebase:",
      firestore: "Firestore de Firebase:",
      configLabel: "Configuración de Firebase:",
      set: "Configurado",
      missing: "Falta",
      runTests: "Ejecutar pruebas",
    },
  },
}

export const supplementalPt = {
  commons: {
    copy: "Copiar",
    unknown: "Desconhecido",
  },
  orders: {
    addItemsDialog: {
      title: "Adicionar itens ao pedido",
      description: "Selecione os itens e a quantidade a adicionar ao pedido.",
      selectCategory: "Selecionar categoria",
      selectProduct: "Selecionar produto",
      quantity: "Quantidade",
      add: "Adicionar",
      success: "Item adicionado ao pedido",
      errors: {
        orderDocIdMissing: "ID do documento do pedido não encontrado.",
        addFailed: "Erro ao adicionar item: {{message}}",
      },
    },
    status: {
      pending: "Pendente",
      preparing: "Em preparação",
      ready: "Pronto",
      delivered: "Entregue",
      cancelled: "Cancelado",
      closed: "Fechado",
      ordering: "Ordenando",
      served: "Servido",
      finished: "Finalizado",
      null: "Desconhecido",
    },
    error: {
      establishmentIdNotFound: "ID do estabelecimento não encontrado",
      selectStatus: "Selecione um status",
      updateStatusFailed: "Erro ao atualizar status do pedido",
      deleteOrderFailed: "Erro ao excluir pedido",
      cancelOrderFailed: "Erro ao cancelar pedido",
    },
    errors: {
      createFailed: "Erro ao criar pedido",
      userNotAuthenticated: "Usuário não autenticado",
      dbOrUserNotFound: "Banco de dados ou usuário não encontrado",
      establishmentIdNotFound: "ID do estabelecimento não encontrado",
      subscriptionFailed: "Erro na assinatura de pedidos",
      noOrderCreatedCallback: "Callback de criação de pedido não configurado",
      orderCreationFailed: "Erro ao criar pedido",
    },
    actions: {
      viewOrder: "Ver pedido",
      addItems: "Adicionar itens",
      changeStatus: "Alterar status",
      delete: "Excluir",
    },
    types: { unknown: "Desconhecido" },
    genericUser: "Usuário",
    unnamedItem: "Item sem nome",
    noCategory: "Sem categoria",
    counter: "Balcão",
    tableNamePrefix: "Mesa ",
    success: {
      orderCreatedDescription: "Pedido criado por {{total}}",
      statusUpdated: "Status do pedido {{orderId}} atualizado",
      orderDeleted: "Pedido {{orderId}} excluído",
      orderCancelled: "Pedido {{orderId}} cancelado",
    },
    errorsOrder: {
      orderCreationFailedDescription: "Erro ao criar pedido: {{error}}",
    },
  },
  errors: {
    accessDenied: {
      title: "Acesso Não Autorizado",
      message: "Você não tem permissão para ver esta página",
      backHome: "Voltar ao Início",
    },
    firebase: {
      title: "Erro do Firebase",
      description: "Houve um problema ao conectar aos nossos serviços. Isso pode ser devido a:",
      reasons: {
        network: "Problemas de conectividade de rede",
        disruption: "Interrupção temporária do serviço",
        configuration: "Problemas de configuração",
      },
      technicalDetails: "Detalhes técnicos:",
      refresh: "Atualizar página",
    },
  },
  users: {
    invitation: {
      title: "Adicionar Membro da Equipe",
      labels: { username: "Nome de Usuário", role: "Função" },
      actions: { generating: "Gerando...", generate: "Gerar Convite" },
      invitationLinkLabel: "Link de convite:",
      invitationExpiry: "Este link expirará em 24 horas",
      generatedEmailLabel: "Email gerado:",
      errors: {
        usernameRequired: "O nome de usuário é obrigatório",
        establishmentNotFound: "Estabelecimento associado não encontrado",
        mustBeLoggedIn: "Você deve estar conectado para adicionar um membro à equipe",
        invitationFailed: "Erro ao gerar convite",
      },
      success: {
        invitationCreated: "Convite gerado com sucesso",
        emailCopied: "Email copiado para a área de transferência",
        linkCopied: "Link copiado para a área de transferência",
      },
    },
    management: {
      title: "Gestão de Usuários",
      columns: { name: "Nome", email: "Email", role: "Função", actions: "Ações" },
      errors: {
        noDeletePermission: "Você não tem permissão para excluir usuários.",
        deleteFailed: "Erro ao excluir usuário.",
      },
    },
  },
  profile: {
    title: "Perfil do Usuário",
    labels: {
      username: "Nome de Usuário",
      email: "Email",
      phone: "Número de Telefone",
      role: "Função",
    },
    selectRole: "Selecionar função",
    saving: "Salvando...",
    saveChanges: "Salvar alterações",
  },
  dashboard: {
    toast: {
      salesAlert: "Alerta de vendas!",
      goalReached: "Meta alcançada!",
      excelDownloaded: "Relatório geral baixado em Excel",
      pdfDownloaded: "Relatório geral baixado em PDF",
    },
    export: {
      salesByDay: "Vendas por dia",
      topProducts: "Produtos em destaque",
      inventory: "Estoque",
      date: "Data",
      sales: "Vendas",
      product: "Produto",
      quantity: "Quantidade",
      stock: "Estoque",
      generalReport: "Relatorio-Geral",
    },
  },
  reports: {
    errors: {
      fetchOrdersFailed: "Falha ao buscar dados de pedidos",
      fetchSalesFailed: "Falha ao buscar dados de vendas",
    },
  },
  tables: {
    defaultTableName: "Mesa {{number}}",
  },
  auth: {
    errors: {
      stateChange: "Erro durante a mudança de estado de autenticação",
      emailRequired: "Email é obrigatório",
      passwordRequired: "Senha é obrigatória",
      emailAlreadyRegistered: "Email já está registrado",
      invalidEmail: "Endereço de email inválido",
      weakPassword: "Senha muito fraca",
      unexpectedError: "Ocorreu um erro inesperado",
      profileNotFound: "Falha ao criar perfil de usuário",
      ownerAlreadyExists: "Já existe um proprietário para este estabelecimento",
      invalidEmailFormat: "Formato de email inválido",
      passwordEmpty: "A senha não pode estar vazia",
      userNotFound: "Nenhum usuário encontrado com este email",
      wrongPassword: "Senha incorreta",
      tooManyRequests: "Muitas tentativas. Tente novamente mais tarde.",
      userDisabled: "Esta conta foi desabilitada",
      accountSuspended: "Sua conta foi suspensa. Entre em contato com o suporte.",
      userProfileNotFound: "Perfil de usuário não encontrado. Entre em contato com o suporte.",
      logoutUnexpected: "Erro inesperado ao sair",
    },
  },
  roles: {
    chef: "Chef",
  },
  dev: {
    firebaseTest: {
      title: "Teste de configuração do Firebase",
      description: "Teste sua configuração do Firebase para garantir que tudo está funcionando",
      initialized: "Firebase inicializado:",
      error: "Erro",
      app: "App do Firebase:",
      auth: "Auth do Firebase:",
      firestore: "Firestore do Firebase:",
      configLabel: "Configuração do Firebase:",
      set: "Definido",
      missing: "Ausente",
      runTests: "Executar testes",
    },
  },
}

/** Deep-merge supplemental keys into a translation object */
export function mergeTranslations<T extends Record<string, unknown>>(
  base: T,
  supplemental: Record<string, unknown>
): T {
  const result = { ...base } as Record<string, unknown>
  for (const key of Object.keys(supplemental)) {
    const baseVal = result[key]
    const supVal = supplemental[key]
    if (
      baseVal &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal) &&
      supVal &&
      typeof supVal === "object" &&
      !Array.isArray(supVal)
    ) {
      result[key] = mergeTranslations(
        baseVal as Record<string, unknown>,
        supVal as Record<string, unknown>
      )
    } else {
      result[key] = supVal
    }
  }
  return result as T
}
