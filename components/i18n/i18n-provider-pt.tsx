import { landingPt } from "./landing-translations"
import { supplementalPt, mergeTranslations } from "./supplemental-translations"

const ptTranslationsBase = {
  
  "commons": {
    "yes": "Sim",
    "no": "Não",
    "cancel": "Cancelar",
    "confirm": "Confirmar",
    "save": "Salvar",
    "edit": "Editar",
    "delete": "Eliminar",
    "loading": "Carregando...",
    "success": "Sucesso",
    "warning": "Aviso",
    "search": "Procurar",
    "filter": "Filtrar",
    "actions": "Ações",
    "tableNumber": "Número da Mesa",
    "close": "Fechar",
    "button": {
      "add": "Adicionar",
      "edit": "Editar",
      "delete": "Eliminar",
      "cancel": "Cancelar",
      "save": "Salvar",
      "submit": "Enviar",
      "sending": "Enviando...",
      "create": "Criar",
      "created": "Criado",
      "loading": "Carregando..."
    },
    "status": {
      "lowStock": "Baixo Estoque",
      "inStock": "Em Estoque",
      "outOfStock": "Fora de Estoque"
    },
    "table": {
      "headers": {
        "name": "Nome",
        "category": "Categoria",
        "quantity": "Quantidade",
        "unit": "Unidade",
        "minQuantity": "Quantidade Mínima",
        "price": "Preço",
        "status": "Status",
        "actions": "Ações"
      }
    },
    "error": {
      "generic": "Ocorreu um erro",
      "required": "Este campo é obrigatório",
      "invalid": "Entrada inválida",
      "configurationError": "Erro de configuração do Firebase. Por favor, entre em contato com o suporte",
      "serviceUnavailable": "Serviço de autenticação indisponível. Tente novamente mais tarde"
    },
    "noItemsFound": "Nenhum item encontrado",
    "searchPlaceholder": "Procurar...",
    "confirmDelete": "Tem certeza de que deseja excluir este item? Esta ação não pode ser desfeita.",
    "currency": "{{value}}",
    "password": "Senha",
    "emailRequired": "Email é obrigatório",
    "passwordRequired": "Senha é obrigatória",
    "login": {
      "error": {
        "emailRequired": "Email é obrigatório",
        "passwordRequired": "Senha é obrigatória",
        
        "invalidCredentials": "Email ou senha inválidos",
        "tooManyAttempts": "Muitas tentativas falhas. Tente novamente mais tarde."
      }
    },
    "deleted": "Excluído",
    "nextSlide": "Próximo slide",
    "previousSlide": "Slide anterior",
   
    "noResults": "Nenhum resultado encontrado",
    "next": "Próximo",
    "previous": "Anterior",
    "accept": "Aceitar",
    "retry": "Tentar novamente"
  },

  "tableMaps": {
    "title": "Mapas de Mesas",
    "description": "Gerencie os layouts das mesas em seu restaurante",
    "createMap": "Criar Mapa de Mesa",
    "editMap": "Editar Mapa de Mesa",
    "mapName": "Nome do Mapa",
    "mapDescription": "Descrição do Mapa",
    "mapDescriptionPlaceholder": "Descrição do Mapa",
    "addNew": "Adicionar Novo Mapa",
    "noMapsFound": "Nenhum mapa de mesa encontrado",
    "saveError": "Erro ao salvar mapa de mesa",
    "createError": "Erro ao criar mapa de mesa",
    "updateError": "Erro ao atualizar mapa de mesa",
    "deleteError": "Erro ao excluir mapa de mesa",
    "loadingTitle": "Carregando Mapa de Mesa",
    "delete": {
      "confirmTitle": "Excluir Mapa de Mesa",
      "confirmDescription": "Tem certeza de que deseja excluir o mapa de mesa '{{name}}'?",
      "success": "Mapa de Mesa Excluído",
      "error": "Erro ao excluir mapa de mesa"
    }
  },
  "dialog":{
    "delete":{
      "title": "Excluir Pedido",
      "description": "Tem certeza de que deseja excluir o pedido?",
      "confirmTitle": "Excluir Pedido",
      "confirmDescription": "Tem certeza de que deseja excluir o pedido?",
      "success": "Pedido Excluído",
      "error": "Erro ao excluir pedido",
      "confirmButton": "Excluir",
      "cancelButton": "Cancel"
    }
  },

  "tableDialog": {
    "title": "Adicionar Nova Mesa",
    "description": "Crie uma nova mesa para seu restaurante",
    "labels": {
      "tableName": "Nome da Mesa",
      "tableCapacity": "Capacidade da Mesa"
    },
    "placeholders": {
      "tableName": "Digite o nome da mesa",
      "tableCapacity": "Digite a capacidade da mesa"
    },
    "actions": {
      "cancel": "Cancelar",
      "create": "Criar Mesa"
    },
    "errors": {
      "invalidCapacity": "Capacidade da mesa deve ser maior que 0",
      "create": "Erro ao criar mesa"
    },
    "success": {
      "create": "Mesa criada com sucesso"
    }
  },

  "common": {
    "cancel": "Cancelar",
    "save": "Salvar",
    "create": "Criar",
    "edit": "Editar",
    "delete": "Excluir",
    "created": "criado",
    "close": "Fechar",
    "error": "Erro",
    "deleted": "Excluído",
    "update": "Atualizar"
  },

  "tables": {
    "pageTitle": "Mesas no Restaurante",
    "addTable": "Adicionar Nova Mesa",
    "tableName": "Nome da Mesa",
    "tableCapacity": "Capacidade da Mesa",
    "tableStatus": "Status",
    "search": "Procurar Mesas",
    "sortBy": "Ordenar por",
    "tableNumber": "Número da Mesa",
    "seats": "Assentos",
    "noTablesMatchFilter": "Nenhuma mesa corresponde ao filtro",
    "noTablesInMap": "Nenhuma mesa no mapa",
    "actions": "Ações",
    "tableMaps": {
      "title": "Mapas de Mesas",
      "createMap": "Criar Mapa de Mesa",
      "editMap": "Editar Mapa de Mesa",
      "editMapDescription": "Editar Mapa de Mesa",
      "mapName": "Nome do Mapa",
      "mapDescription": "Descrição do Mapa",
      "noMapsFound": "Nenhum Mapa de Mesa Encontrado",
      "createMapDescription": "Crie um novo mapa de mesa para seu restaurante",
      "mapNamePlaceholder": "Digite o nome do mapa",
      "mapDescriptionPlaceholder": "Digite a descrição do mapa",
      "layout": "Layout",
      "addTable": "Adicionar Mesa",
      "tablePosition": "Posição da Mesa",
      "tableCapacity": "Capacidade da Mesa",
      "viewMap": "Ver Mapa de Mesa",
      "addMap": "Adicionar Mapa",
      "deleteMap": "Excluir Mapa",
      "mapCreationFailed": "Erro ao criar mapa de mesa",
      "mapUpdateFailed": "Erro ao atualizar mapa de mesa",
      "mapDeletionFailed": "Erro ao excluir mapa de mesa",
      "mapCreated": "Mapa de mesa criado",
      "mapUpdated": "Mapa de mesa atualizado",
      "mapDeleted": "Mapa de mesa excluído",
      "delete": {
        "confirmTitle": "Excluir Mapa de Mesa",
        "confirmDescription": "Tem certeza de que deseja excluir o mapa de mesa '{{name}}'?",
        "success": "Mapa de mesa excluído",
        "error": "Erro ao excluir mapa de mesa"
      },
      "fetchError": "Erro ao buscar mapas de mesa"
    },
    "allStatuses": "Todos os status",
    "statuses": {
      "available": "Disponível"
    }
  },
  

  "sidebar": {
    "appName": "Comandero",
    "role": "Role",
    "dashboard": "Dashboard",
    "orders": "Pedidos",
    "tables": "Mesas",
    "inventory": "Inventário",
    "purchases": "Compras",
    "users": "Usuários",
    "settings": "Configurações",
    "advancedReports": "Relatórios Avançados",
    "logout": "Logout",
    "logoutSuccess": "Logout realizado com sucesso",
    "logoutCancelled": "Logout cancelado",
    "logoutError": "Erro ao fazer logout",
    "language": "Idioma",
    "installApp": "Instalar App",
    "installSuccess": "App instalada com sucesso",
    "installError": "Erro ao instalar app",
    "languages": {
      "english": "Inglês",
      "spanish": "Espanhol", 
      "portuguese": "Português"
    }
  },

  "dashboard": {
    "title": "Dashboard",
    "goodMorning": "Bom dia",
    "goodAfternoon": "Boa tarde",
    "goodEvening": "Boa noite",
    "user": "Usuário",
    "welcomeMessage": "Bem-vindo ao seu dashboard, onde você pode gerenciar as operações do seu restaurante e rastrear desempenho.",
    "trial": {
      "title": "Período de teste ativo",
      "message": "Você tem {{daysLeft}} dias restantes no seu teste. Seu plano: {{plan}}"
    },
    
    "totalSales": {
      "title": "Total de Vendas",
      "performance": "Performance este mês",
      "trend": "Tendência de Vendas",
      "comparedToLastMonth": "comparado ao mês anterior"
    },
    
    "dailySales": {
      "title": "Vendas Diárias"
    },
    
    "salesByCategory": {
      "title": "Vendas por Categoria",
      "description": "Desdobramento do desempenho das vendas por categoria de produto",
      "noSalesData": "Nenhuma dados de vendas disponíveis",
      "categories": {
        "main_courses": "Pratos Principais",
        "drinks": "Bebidas", 
        "desserts": "Doces",
        "appetizers": "Aperitivos",
        "salads": "Saladas",
        "sides": "Guarnições",
        "uncategorized": "Não categorizado"
      }
    },
    
    "topSellingItems": {
      "title": "Top Vendas",
      "subtitle": "Produtos mais populares",
      "description": "Produtos mais vendidos",
      "orderCount": "{{count, number}} pedidos",
      "quantity": "Quantidade: {{value}}"
    },
    
    "recentOrders": {
      "title": "Pedidos Recentes",
      "orderNumber": "Pedido #{{number}}",
      "table": "Mesa"
    },
    
    "additionalInsights": {
      "title": "Insights Adicionais",
      "placeholder": "Nenhum insight adicional disponível"
    },
    
    "inventory": {
      "title": "Visão Geral do Inventário",
      "totals": "Totais",
      "byCategory": "Por Categoria",
      "byItem": "Por Item",
      "total": "Total de Itens",
      "inStock": "Em Estoque",
      "lowStock": "Estoque Baixo",
      "noItems": "Nenhum item encontrado",
      "itemName": "Nome do Item",
      "category": "Categoria",
      "status": {
        "label": "Status",
        "critical": "Estoque Crítico",
        "warning": "Estoque Baixo",
        "healthy": "Estoque Saudável"
      }
    },
    "report": {
      "title": "Relatório",
      "description": "Download um relatório completo de todas as métricas do negócio em Excel ou PDF.",
      "excel": "Excel",
      "pdf": "PDF",
      "fileDescription": "O arquivo incluirá vendas por dia, produtos mais vendidos, inventário e muito mais, de acordo com os dados atualmente visíveis no dashboard.",
    },
    "reports": {
      "title": "Baixar Relatórios",
      "description": "Baixar relatórios detalhados de inventário, vendas, atividade de usuários e mais.",
      "inventory": "Relatório de Inventário",
      "inventoryDescription": "Baixar relatório completo de inventário com todas as categorias e itens, incluindo quantidades, níveis de estoque mínimo e preços.",
      "sales": "Relatório de Vendas",
      "salesDescription": "Baixar relatório completo de vendas com todos os pedidos, incluindo detalhes do pedido, métodos de pagamento, status e itens vendidos.",
      "userActivity": "Relatório de Atividade de Usuários",
      "userActivityDescription": "Baixar relatório de atividade de usuários com todas as sessões, incluindo tempos de login/logout, dispositivos, sistemas operacionais e funções de usuário.",
      "general": "Relatório Geral",
      "generalDescription": "Baixar relatório geral completo incluindo vendas por dia, produtos principais, visão geral do inventário, inventário completo, todas as vendas e atividade de usuários."
    }
  },

  "purchases": {
    "title": "Compras",
    "suppliers": {
      "title": "Fornecedores",
      "add": "Adicionar Fornecedor",
      "edit": "Editar Fornecedor",
      "delete": "Excluir Fornecedor",
      "deleteConfirm": "Tem certeza de que deseja excluir este fornecedor?",
      "loading": "Carregando fornecedores...",
      "noSuppliers": "Nenhum fornecedor ainda. Adicione seu primeiro fornecedor.",
      "searchPlaceholder": "Buscar fornecedores...",
      "name": "Nome",
      "contactPerson": "Pessoa de Contato",
      "email": "Email",
      "phone": "Telefone",
      "address": "Endereço",
      "city": "Cidade",
      "state": "Estado",
      "country": "País",
      "zipCode": "CEP",
      "taxId": "ID Fiscal",
      "notes": "Notas",
      "paymentTerms": "Condições de Pagamento",
      "deliveryTime": "Tempo de Entrega",
      "paymentTermsPlaceholder": "ex., Net 30, Net 60",
      "deliveryTimePlaceholder": "ex., 2-3 dias",
      "active": "Ativo",
      "inactive": "Inativo",
      "contact": "Contato",
      "payment": "Pagamento",
      "delivery": "Entrega",
      "success": {
        "added": "Fornecedor adicionado com sucesso",
        "updated": "Fornecedor atualizado com sucesso",
        "deleted": "Fornecedor excluído com sucesso"
      },
      "error": {
        "loading": "Erro ao carregar fornecedores",
        "saving": "Erro ao salvar fornecedor",
        "deleting": "Erro ao excluir fornecedor"
      }
    },
    "purchases": {
      "title": "Compras",
      "add": "Adicionar Compra",
      "edit": "Editar Compra",
      "delete": "Excluir Compra",
      "deleteConfirm": "Tem certeza de que deseja excluir esta compra?",
      "loading": "Carregando compras...",
      "noPurchases": "Nenhuma compra ainda. Adicione sua primeira compra.",
      "searchPlaceholder": "Buscar compras...",
      "purchaseNumber": "Número da Compra",
      "supplier": "Fornecedor",
      "orderDate": "Data do Pedido",
      "expectedDeliveryDate": "Data de Entrega Esperada",
      "status": "Status",
      "paymentMethod": "Método de Pagamento",
      "paymentStatus": "Status do Pagamento",
      "payment": "Pagamento",
      "notes": "Notas",
      "items": "Itens",
      "total": "Total",
      "addItem": "Adicionar Item",
      "itemName": "Nome do Item",
      "quantity": "Quantidade",
      "unit": "Unidade",
      "purchasePrice": "Preço de Compra",
      "salesPrice": "Preço de Venda",
      "itemNotes": "Notas",
      "category": "Categoria",
      "selectCategory": "Selecionar Categoria",
      "minQuantity": "Quantidade Mínima",
      "lowStockThreshold": "Limite de Estoque Baixo",
      "unitPlaceholder": "ex., kg, unidades, litros",
      "paymentMethodPlaceholder": "ex., Transferência Bancária, Dinheiro, Crédito",
      "autoGenerated": "Gerado automaticamente se vazio",
      "atLeastOneItem": "Por favor adicione pelo menos um item",
      "fillAllItemFields": "Por favor preencha todos os campos do item",
      "statuses": {
        "pending": "Pendente",
        "ordered": "Pedido",
        "received": "Recebido",
        "cancelled": "Cancelado",
        "partial": "Parcial"
      },
      "paymentStatuses": {
        "pending": "Pendente",
        "paid": "Pago",
        "partial": "Parcial",
        "overdue": "Atrasado"
      },
      "success": {
        "added": "Compra adicionada com sucesso",
        "updated": "Compra atualizada com sucesso",
        "deleted": "Compra excluída com sucesso"
      },
      "error": {
        "loading": "Erro ao carregar compras",
        "saving": "Erro ao salvar compra",
        "deleting": "Erro ao excluir compra"
      }
    },
    "reports": {
      "title": "Relatórios",
      "totalPurchases": "Compras Totais",
      "totalCost": "Custo Total",
      "profitMargin": "Margem de Lucro",
      "totalItems": "Itens Totais",
      "purchases": "compras",
      "purchaseCost": "custo de compra",
      "averageMargin": "margem média",
      "itemsPurchased": "itens comprados",
      "costByCategory": "Custo por Categoria",
      "monthlyCost": "Custo Mensal",
      "recentPurchases": "Compras Recentes"
    }
  },

  "toast": {
    "salesAlert": "As vendas diminuíram em comparação com o mês anterior",
    "goalReached": "Meta de vendas alcançada!",
    "excelDownloaded": "Relatório Excel baixado com sucesso",
    "pdfDownloaded": "Relatório PDF baixado com sucesso",
    "inventoryDownloaded": "Relatório de inventário baixado com sucesso",
    "salesDownloaded": "Relatório de vendas baixado com sucesso",
    "userActivityDownloaded": "Relatório de atividade de usuários baixado com sucesso",
    "exportError": "Erro ao exportar relatório",
    "noInventoryData": "Não há dados de inventário disponíveis para exportar"
  },

  "errors": {
    "fetchFailed": "Erro ao carregar dados do dashboard. Por favor, tente novamente mais tarde."
  },

  "salesList": {
    "title": "Histórico de Vendas",
    "noSales": "Nenhuma venda registrada",
    "columns": {
      "date": "Data",
      "orderId": "ID do Pedido",
      "total": "Total",
      "paymentMethod": "Método de Pagamento"
    },
    "paymentMethods": {
      "cash": "Dinheiro",
      "credit": "Cartão de Crédito",
      "debit": "Cartão de Débito",
      "transfer": "Transferência Bancária",
      "other": "Outro"
    }
  },

  "orders": {
    "categories": {
      "main_courses": "Pratos Principais",
      "drinks": "Bebidas", 
      "desserts": "Doces",
      "appetizers": "Aperitivos",
      "salads": "Saladas",
      "sides": "Guarnições",
      "uncategorized": "Não categorizado"
    },
    "title": "Pedidos",
    "newOrder": "Novo Pedido",
    "createOrder": "Criar Pedido",
    "tableNumberPlaceholder": "Digite o número da mesa",
    "noOrdersFound": "Nenhum pedido encontrado",
    "subtotal": "Subtotal",
    "total": "Total",
    "table": "Mesa",
    "counter": "Balcão",
    "waiter": "Garçom",
    "takeaway": "Delivery",
    "details": {
      "title": "Detalhes do Pedido",
      "description": "Detalhes do Pedido",
      "id": "ID do Pedido",
      "tableNumber": "Número da Mesa",
      "waiter": "Garçom",
      "counter": "Balcão",
      "items": "Itens",
      "total": "Total",
      "status": "Status",
      "actions": "Ações"
    },
    "search": {
      "placeholder": "Procurar pedidos por ID, mesa ou garçom"
    },
    "filter": {
      "allStatuses": "Todos os Status"
    },

    "actions": {
      "view": "Ver",
      "updateStatus": "Atualizar Status",
      "delete": "Excluir"
    },
    "action": {
      "updated": "Atualizado",
      "deleted": "Excluído"
    },
    "success": {
      "statusUpdated": "Status Atualizado",
      "orderDeleted": "Pedido Excluído"
    },
    "error": {
      "fetchFailed": "Erro ao buscar pedidos",
      "updateStatusFailed": "Erro ao atualizar status do pedido",
      "deleteOrderFailed": "Erro ao excluir pedido"
    },
    "orderType": "Tipo de Pedido",
    "tableNumber": "Número da Mesa",
    "selectCategory": "Selecione a Categoria",
    "selectItem": "Selecione o Item",
    "noItemsInCategory": "Nenhum item nesta categoria",
    "quantity": "Quantidade",
    "itemNotes": "Notas do Item",
    "itemNotesPlaceholder": "Qualquer instrução especial?",
    "itemDietaryRestrictions": "Restrições Alimentares",
    "addToOrder": "Adicionar ao Pedido",
    "orderSummary": "Resumo do Pedido",
    "showMenuQr": "Mostrar QR do Menu",
    "noItemsInOrder": "Nenhum item no pedido",
    "specialRequests": "Requisitos Especiais",
    "specialRequestsPlaceholder": "Qualquer requisito especial para a cozinha?",
    "menuUrl": "URL do Menu",
    "discount": "Desconto",
    "percentage": "Porcentagem",
    "errors": {
      "noItemsInOrder": "Por favor, adicione itens ao pedido",
      "noTableSelected": "Por favor, selecione uma mesa",
      "headers": {
        "id": "ID do Pedido",
        "tableNumber": "Número da Mesa",
        "waiter": "Garçom", 
        "items": "Itens",
        "status": "Status",
        "total": "Total",
        "actions": "Ações"
      }
    },
    "confirmPayment": "Confirmar Pagamento",
    "selectPaymentMethod": "Selecionar método de pagamento",
    "paymentMethodDescription": "Escolha o método de pagamento para este pedido",
    "paymentMethods": {
      "cash": "Dinheiro",
      "credit": "Cartão de Crédito",
      "debit": "Cartão de Débito",
      "transfer": "Transferência Bancária",
      "other": "Outro"
    },
    "itemUnavailable": "(Indisponível)",
    "stockAvailable": "- R$ {{price}} ({{stock}} disponível)",
    "changeStatusTitle": "Mudar Status",
    "changeStatusDescription": "Mudar status do pedido",
    "changeStatusButton": "Mudar Status",
    "types": {
      "table": "Mesa",
      "delivery": "Delivery",
      "counter": "Balcão",
      "takeaway": "Para Levar",
      "food": "Comida",
      "drinks": "Bebidas"
    },
    "emptyState": {
      "noFood": "Nenhum item de comida nesta ordem",
      "noDrinks": "Nenhum item de bebida nesta ordem"
    },
    "transfer": {
      "title": "Transferir Itens",
      "description": "Selecione itens para transferir para outra mesa/pedido",
      "selectItems": "Selecionar Itens",
      "selectAll": "Selecionar Tudo",
      "deselectAll": "Deselecionar Tudo",
      "destination": "Mesa de Destino",
      "selectMap": "Selecionar mapa de mesas",
      "selectDestinationTable": "Selecionar mesa de destino",
      "createNewOrder": "Criar novo pedido",
      "existingOrder": "Pedido existente",
      "itemsToTransfer": "Itens a transferir",
      "transferTotal": "Total da transferência",
      "transfer": "Transferir",
      "transferring": "Transferindo...",
      "cancel": "Cancelar",
      "noItemsSelected": "Por favor selecione pelo menos um item",
      "noDestinationSelected": "Por favor selecione uma mesa de destino",
      "success": "Itens transferidos com sucesso",
      "error": "Erro ao transferir itens",
      "errorFetchingData": "Erro ao buscar mesas e pedidos"
    },
    "partialPayment": {
      "title": "Pagamento Parcial",
      "description": "Selecione itens e quantidades a pagar",
      "selectItems": "Selecionar Itens",
      "unpaid": "Não pago",
      "itemsSelected": "Itens selecionados",
      "paymentAmount": "Valor do pagamento",
      "pay": "Pagar",
      "processing": "Processando...",
      "noItemsSelected": "Por favor selecione pelo menos um item",
      "noPaymentMethod": "Por favor selecione um método de pagamento",
      "partialPaymentSuccess": "Pagamento parcial bem-sucedido",
      "orderFullyPaid": "Pedido pago completamente e fechado",
      "error": "Erro ao processar pagamento"
    },
    "partialPrice": "Preço"
  },

  "ordersPage": {
    "pageTitle": "Pedidos",
    "newOrder": "Novo Pedido",
    "searchPlaceholder": "Procurar pedidos...",
    "noOrdersFound": "Nenhum pedido encontrado",
    "orderStatus": {
      "01": "Pendente",
      "02": "Em Preparação",
      "03": "Pronto para Servir",
      "04": "Entregue",
      "05": "Cancelado",
      "06": "Pago",
      "07": "Enviado",
      "08": "Em Trânsito",
      "09": "Completado",
      "10": "Reembolsado",
      "11": "Pendente",
      "12": "Agendado",
      "13": "Parcialmente Pago",
      "14": "Erro de Pagamento",
      "15": "Rejeitado",
      "16": "Processando",
      "17": "Confirmado",
      "18": "Preparação Iniciada",
      "19": "Quase Pronto",
      "20": "Esperando Cliente",
      "21": "Serviço à Mesa",
      "22": "Para Viagem",
      "23": "Delivery",
      "24": "Reserva",
      "25": "Urgente",
      "70": "Final Status"
    },
    "table": {
      "id": "ID", 
      "table": "Mesa",
      "waiter": "Garçom",
      "items": "Itens",
      "status": "Status",
      "total": "Total",
      "actions": "Ações"
    },
    "actions": {
      "updateStatus": "Atualizar Status",
      "updateStatusDescription": "Atualizar status do pedido {{orderId}}",
      "selectStatus": "Selecionar novo status",
      "delete": "Excluir Pedido",
      "view": "Ver Pedido",
      "deleteOrderConfirmation": "Tem certeza de que deseja excluir o pedido {{orderId}}?"
    },
    "error": {
      "fetchFailed": "Erro ao carregar pedidos",
      "updateStatusFailed": "Erro ao atualizar status do pedido",
      "deleteFailed": "Erro ao excluir pedido"
    },
    "success": {
      "statusUpdated": "Status do pedido atualizado",
      "orderDeleted": "Pedido excluído"
    },
  },

  "newOrder": {
    "title": "Novo Pedido",
    "orderDetails": "Detalhes do Pedido",
    "currentOrder": "Pedido Atual",
    "tableNumber": "Número da Mesa",
    "tableNumberPlaceholder": "Digite o número da mesa",
    "selectItem": "Selecione Item",
    "selectItemPlaceholder": "Escolha um item para adicionar",
    "quantity": "Quantidade",
    "notes": "Notas",
    "notesPlaceholder": "Instruções Especiais",
    "addToOrder": "Adicionar ao Pedido",
    "noItemsInOrder": "Nenhum item adicionado ao pedido ainda",
    "total": "Total",
    "createOrder": "Criar Pedido",
    "table": {
      "item": "Item",
      "quantity": "Quantidade",
      "price": "Preço",
      "total": "Total",
      "actions": "Ações"
    },
    "error": {
      "title": "Erro",
      "noItem": "Por favor, selecione um item",
      "noTable": "Por favor, insira o número da mesa",
      "noItems": "Por favor, adicione pelo menos um item ao pedido",
      "orderCreationFailed": "Erro ao criar pedido"
    },
    "success": {
      "orderCreated": "Pedido Criado",
      "orderCreatedDescription": "O pedido para a Mesa {{tableNumber}} foi criado com sucesso"
    }
  },

  "newOrderPage": {
    "title": "Novo Pedido",
    "errors": {
      "unauthorized": "Você não tem autorização para criar este pedido",
      "menuItemNotFound": "Item do menu selecionado não encontrado",
      "invalidQuantity": "Insira uma quantidade válida",
      "missingTableNumber": "Selecione ou insira o número da mesa",
      "missingMenuItem": "Selecione um item do menu",
      "insufficientStock": "Estoque insuficiente para o item selecionado",
      "orderCreationFailed": "Erro ao criar pedido. Tente novamente.",
      "fetchOrders": "Erro ao carregar pedidos",
      "createOrder": "Erro ao criar pedido",
      "updateOrder": "Erro ao atualizar pedido",
      "deleteOrder": "Erro ao excluir pedido",
      "updateStatus": "Erro ao atualizar status do pedido"
    },
    "success": {
      "orderCreated": "Pedido criado com sucesso",
      "orderUpdated": "Pedido atualizado com sucesso",
      "orderDeleted": "Pedido excluído com sucesso",
      "statusUpdated": "Status do pedido atualizado com sucesso",
      "itemAdded": "Item adicionado ao pedido"
    },
  },

  "inventory": {
    "title": "Visão Geral do Estoque",
    "subtitle": "Gerencie o estoque do seu restaurante",
    "searchPlaceholder": "Procurar no estoque...",
    "noItemsFound": "Nenhum item encontrado",
    "name": "Nome",
    "category": "Categoria", 
    "quantity": "Quantidade",
    "unit": "Unidade",
    "minQuantity": "Estoque Mínimo",
    "price": "Preço",
    "purchasePrice": "Preço de Compra",
    "actions": "Ações",
    "status": {
      "label": "Status",
      "lowStock": "Estoque Baixo",
      "inStock": "Em Estoque"
    },
    "addItem": "Adicionar Item",
    "addItemTitle": "Adicionar Item",
    "addItemDescription": "Adicionar um novo item ao estoque",
    "description": "Descrição",
    "supplier": "Fornecedor",
    "selectCategory": "Selecione uma categoria",
    "add": "Adicionar",
    "cancel": "Cancelar",
    "update": "Atualizar",
    "save": "Salvar",
    "editItemTitle": "Editar Item",
    "editItemDescription": "Editar detalhes do item",
    "addItemDetails": {
      "title": "Adicionar Item",
      "description": "Adicionar um novo item ao estoque",
      "namePlaceholder": "Digite o nome do item",
      "categoryPlaceholder": "Selecione a categoria do item",
      "quantityPlaceholder": "Digite a quantidade",
      "unitPlaceholder": "Digite a unidade (ex. kg, pç)",
      "minQuantityPlaceholder": "Digite a quantidade mínima de estoque",
      "pricePlaceholder": "Digite o preço do item",
      "successToast": "{{itemName}} foi adicionado ao estoque",
      "errorToast": "Erro ao adicionar item ao estoque"
    },
    "editItemDetails": {
      "title": "Editar Item",
      "description": "Editar detalhes do item",
      "successToast": "{{itemName}} foi atualizado",
      "errorToast": "Erro ao atualizar detalhes do item"
    },
    "deleteItemDetails": {
      "title": "Excluir Item",
      "description": "Tem certeza de que deseja excluir {{itemName}}? Esta ação não pode ser desfeita.",
      "successToast": "Item excluído do estoque",
      "errorToast": "Erro ao excluir item do estoque"
    },
    "stockStatus": {
      "lowStock": "Estoque Baixo",
      "inStock": "Em Estoque"
    },
    "buttons": {
      "add": "Adicionar",
      "edit": "Editar",
      "cancel": "Cancelar",
      "delete": "Excluir"
    },
    "categories": {
      "main_courses": "Pratos Principais",
      "drinks": "Bebidas", 
      "desserts": "Doces",
      "appetizers": "Aperitivos",
      "salads": "Saladas",
      "sides": "Lanches",
      "uncategorized": "Não Categorizado"
    },
    "lowStockAlert": "Alerta de Estoque Baixo",
    "lowStockAlertDescription": "Receba um alerta quando o estoque de um item estiver baixo",
    "lowStockAlertSuccess": "Alerta de estoque baixo ativado para {{itemName}}",
    "lowStockAlertError": "Falha ao ativar alerta de estoque baixo para {{itemName}}",
    "lowStockAlertDisabled": "Alerta de estoque baixo desativado para {{itemName}}",
    "lowStockAlertDisabledDescription": "Receba um alerta quando o estoque de um item estiver baixo",
    "lowStockAlertDisabledSuccess": "Alerta de estoque baixo desativado para {{itemName}}",
    "lowStockAlertDisabledError": "Falha ao desativar alerta de estoque baixo para {{itemName}}",
    "lowStockAlertDisabledToast": "Alerta de estoque baixo desativado para {{itemName}}",
    "lowStockAlertDisabledToastError": "Falha ao desativar alerta de estoque baixo para {{itemName}}",
    "manageCategories": "Gerenciar Categorias",
    "manageCategoriesDesc": "Crie, edite ou exclua categorias para organizar seu inventário.",
    "existingCategories": "Categorias Existentes",
    "addNewCategory": "Nova Categoria",
    "editCategory": "Editar Categoria",
    "createCategory": "Criar",
    "updateCategory": "Atualizar",
    "categoryName": "Nome da Categoria",
    "categoryNamePlaceholder": "Ex. Bebidas, Carnes",
    "categoryDescription": "Descrição da Categoria",
    "categoryDescPlaceholder": "Descrição da categoria",
    "categoryColor": "Cor",
    "categoryType": "Tipo de Categoria",
    "selectType": "Selecionar tipo",
    "categoryTypes": {
      "food": "Comida",
      "drink": "Bebida"
    },
    "lowStockThreshold": "Limite de Estoque Baixo",
    "noEstablishmentError": "ID de estabelecimento não encontrado",
    "noEstablishmentErrorMsg": "ID de estabelecimento não encontrado",
    "fetchError": "Erro ao buscar inventário",
    "fillRequiredFieldsMsg": "Por favor, preencha os campos obrigatórios",
    "categoryAlreadyExists": "Categoria já existe",
    "saveSuccess": "Salvo com sucesso",
    "saveError": "Erro ao salvar",
    "deleteSuccess": "Excluído com sucesso",
    "deleteError": "Erro ao excluir",
    "categoryNotEmpty": "Não é possível excluir a categoria porque contém itens.",
    "noCategoryError": "Nenhuma categoria selecionada",
    "itemSaved": "Item salvo com sucesso",
    "itemDeleted": "Item excluído com sucesso",
    "itemUpdatedMsg": "Item atualizado com sucesso",
    "categoryRequiredMsg": "Categoria é obrigatória",
    "itemAddedMsg": "Item adicionado com sucesso",
    "errorSavingItemMsg": "Erro ao salvar item",
    "errorNoItemSelectedToAddStock": "Nenhum item selecionado para adicionar estoque",
    "errorQuantityToAddPositive": "A quantidade a adicionar deve ser positiva",
    "stockAddedSuccessfullyMsg": "Estoque adicionado com sucesso",
    "errorAddingStockMsg": "Erro ao adicionar estoque",
    "editBtn": "Editar",
    "addStockBtn": "Adicionar Estoque",
    "addStockTo": "Adicionar estoque a",
    "currentQuantity": "Quantidade atual",
    "quantityToAddLabel": "Quantidade a adicionar",
    "enterQuantityPlaceholder": "Digite a quantidade",
    "addStockConfirmBtn": "Adicionar Estoque",
    "noCategoriesYet": "Nenhuma categoria criada ainda."
  },

  "users": {
    "pageTitle": "Usuarios",
    "actions": "Ações",
    "addUser": "Adicionar Usuario",
    "searchPlaceholder": "Procurar usuarios...",
    "userList": "Lista de Usuarios",
    "username": "Nome de Usuario",
    "email": "Email",
    "role": "Rol",
    "status": "Status",
    "deleteSuccess": "Usuario excluído",
    "hasBeenDeleted": "Usuario excluído",
    "noUsers": "Nenhum usuario encontrado",
    "roles": {
      "owner": "Proprietario",
      "admin": "Admin",
      "manager": "Gerente",
      "staff": "Staff",
      "chef": "Cozinheiro",
      "waiter": "Garçom",
      "barman": "Barmen",
      "default": "Usuario"
    },
    "userStatus": {
      "active": "Ativo",
      "inactive": "Inativo",
      "suspended": "Suspensao"
    },
    "openMenu": "Abrir menu",
    "copyId": "Copiar ID",
    "editUser": "Editar Usuario",
    "editSuccess": "Usuario atualizado com sucesso",
    "userNotFound": "Usuario não encontrado",
    "delete": "Excluir",
    "confirmDelete": "Confirmar Exclusao",
    "confirmDeleteDescription": "Tem certeza de que deseja excluir o usuario '{{username}}'?",
    "deleteUser": "Excluir Usuario",
    "deleted": "Usuario excluído",
    "errors": {
      "deleteUser": "Falha ao excluir usuario",
      "updateUser": "Falha ao atualizar usuario"
    }
  },

  "login": {
    "title": "Login",
    "subtitle": "Insira suas credenciais para acessar sua conta",
    "emailLabel": "Email",
    "emailPlaceholder": "Insira seu email",
    "passwordLabel": "Senha",
    "passwordPlaceholder": "Insira sua senha",
    "login": "Login",
    "forgotPassword": "Esqueceu sua senha?",
    "sendPasswordReset": "Enviar Reset de Senha",
    "passwordResetSuccess": "Email de reset de senha enviado com sucesso",
    "passwordResetError": "Falha ao enviar email de reset de senha",
    "passwordResetTitle": "Reset de Senha",
    "passwordResetDescription": "Insira seu email para receber instruções de reset de senha",
    "registerLink": "Não tem uma conta? Registre-se aqui",
    "submit": "Enviar",
    "send": "Enviar",
    "loading": "Carregando...",
    "orContinueWith": "ou continue com",
    "signInWithGoogle": "Entrar com Google",
    "success": "Login realizado com sucesso",
    "unexpectedError": "Ocorreu um erro inesperado",
    "error": {
      "invalidCredentials": "Email ou senha invalidos",
      "tooManyAttempts": "Muitos tentativas de login. Tente novamente mais tarde.",
      "emailRequired": "Email obrigatorio",
      "passwordRequired": "Senha obrigatória",
      "serviceUnavailable": "Servico de autenticacao indisponivel. Tente novamente mais tarde",
      "popupClosed": "Popup foi fechado pelo usuário",
      "popupBlocked": "Popup foi bloqueado pelo navegador",
      "accountExistsWithDifferentCredential": "Conta já existe com credenciais diferentes",
      "profileNotFound": "Perfil não encontrado"
    }
  },

  "setup": {
    "title": "Criar seu Estabelecimento",
    "description": "Bem-vindo! Vamos configurar seu estabelecimento de restaurante",
    "establishmentNameLabel": "Nome do Estabelecimento",
    "establishmentNamePlaceholder": "Digite o nome do seu restaurante",
    "establishmentNameRequired": "O nome do estabelecimento é obrigatório",
    "createEstablishment": "Criar Estabelecimento",
    "creating": "Criando...",
    "success": "Estabelecimento criado com sucesso",
    "error": "Erro ao criar estabelecimento",
    "sessionExpired": "Sessão expirada, faça login novamente"
  },

  "register": {
    "title": "Registro",
    "subtitle": "Crie uma nova conta para acessar o sistema de gerenciamento de restaurantes",
    "username": "Nome de Usuario",
    "usernameLabel": "Nome de Usuario",
    "usernamePlaceholder": "Insira seu nome de usuario",
    "email": "Email",
    "emailLabel": "Email",
    "emailPlaceholder": "Insira seu email",
    "password": "Senha",
    "passwordLabel": "Senha",
    "passwordPlaceholder": "Insira sua senha",
    "confirmPassword": "Confirmar Senha",
    "confirmPasswordLabel": "Confirmar Senha",
    "confirmPasswordPlaceholder": "Confirmar sua senha",
    "establishmentName": "Nome do Estabelecimento",
    "establishmentNameLabel": "Nome do Estabelecimento",
    "establishmentNamePlaceholder": "Insira o nome do seu estabelecimento",
    "subscriptionPlanLabel": "Plano de assinatura",
    "selectPlan": "Selecione um plano",
    "trialInfo": "Comece com uma avaliação gratuita de 14 dias em qualquer plano",
    "submit": "Enviar",
    "acceptTerms": "Aceitar Termos",
    "termsLink": "Termos de Uso",
    "loginLink": "Já tem uma conta? Login aqui",
    "error": {
      "passwordsDoNotMatch": "Senhas não correspondem",
      "emailInUse": "Este email ja esta em uso",
      "weakPassword": "Senha muito fraca",
      "establishmentNameRequired": "Nome do estabelecimento obrigatorio",
      "establishmentNameMinLength": "Nome do estabelecimento deve ter pelo menos 3 caracteres",
      "establishmentNameTaken": "Este nome do estabelecimento ja esta em uso",
      "suggestedAlternatives": "Sugestões de nomes de estabelecimento:",
      "selectAlternative": "Por favor, selecione um nome alternativo ou modifique o nome atual"
    },
    "suggestedNames": {
      "title": "Sugestões de nomes de estabelecimento",
      "description": "O nome que você inseriu ja esta em uso. Por favor, selecione um nome alternativo:",
      "selectButton": "Selecionar",
      "modifyButton": "Modificar Nome"
    }
  },

  "forgotPassword": {
    "title": "Esqueceu sua senha?",
    "description": {
      "initial": "Insira seu email para receber instruções de reset de senha",
      "emailSent": "Instruções de reset de senha enviadas para seu email"
    },
    "email": "Email",
    "button": {
      "sendInstructions": "Enviar Instruções",
      "sending": "Enviando...",
      "tryAnotherEmail": "Tentar Outro Email"
    },
    "emailSent": {
      "checkSpam": "Verifique sua pasta de spam se não vir o email"
    },
    "error": {
      "emailRequired": "Email obrigatorio",
      "authNotInitialized": "Autenticação não inicializada",
      "invalidEmail": "Endereço de email inválido",
      "userNotFound": "Nenhuma conta encontrada com este endereço de email",
      "genericError": "Falha ao enviar email de reset de senha"
    },
    "success": {
      "emailSent": "Instruções de reset de senha enviadas"
    },
    "loginReminder": "Lembra sua senha?",
    "loginLink": "Login"
  },

  "settings": {
    "title": "Configurações",
    "selectTab": "Selecione uma aba",
    "system": {
      "title": "Sistema",
      "description": "Gerencie as configurações do sistema e ajustes avançados do sistema"
    },
    "installBanner": {
      "title": "Instale nosso aplicativo",
      "description": "Obtenha a experiência completa com nosso aplicativo",
      "install": "Instalar"
    },
    "profile": {
      "title": "Perfil",
      "description": "Gerencie suas informações pessoais e configurações de conta",
      "actions": {
        "uploadPhoto": "Carregar Foto",
        "submit": "Salvar Alterações",
        "submitting": "Salvando...",
        "profileUpdated": "Perfil Atualizado",
        "profileUpdateSuccess": "Seu perfil foi atualizado com sucesso.",
        "profileUpdateFailed": "Falha ao atualizar perfil",
        "profileUpdateError": "An error occurred while updating your profile."
      },
      "fields": {
        "username": "Nome de Usuario",
        "email": {
          "label": "Email",
          "cannotBeChanged": "Este email nao pode ser alterado"
        },
        "phoneNumber": "Numero de Telefone",
        "position": {
          "label": "Posição",
          "placeholder": "Insira sua posição"
        },
        "role": {
          "label": "Função",
          "placeholder": "Selecione sua função",
          "options": {
            "owner": "Proprietário",
            "admin": "Admin",
            "manager": "Manager", 
            "chef": "Chef",
            "waiter": "Waiter",
            "barman": "Bartender"
          }
        }
      },
      "selectRole": "Selecione sua função",
      "saving": "Salvando...",
      "saveChanges": "Salvar Alterações"
    },
    "appearance": {
      "title": "Aparência",
      "description": "Personalize a aparência da aplicação",
      "modes": {
        "light": {
          "label": "Modo Claro"
        },
        "dark": {
          "label": "Modo Escuro"
        },
        "system": {
          "label": "Modo do Sistema"
        }
      },
      "actions": {
        "save": "Salvar Alterações",
        "saving": "Salvando...",
        "saved": {
          "title": "Aparência Atualizada",
          "description": "Suas preferências de aparência foram atualizadas com sucesso."
        },
        "failed": {
          "title": "Update Failed",
          "description": "An error occurred while updating your appearance preferences."
        }
      }
    },
    "language": {
      "title": "Idioma",
      "description": "Selecione seu idioma preferido para a aplicação",
      "languages": {
        "en": "English",
        "es": "Spanish",
        "pt": "Portuguese"
      },
      "actions": {
        "submit": "Salvar Alterações",
        "saving": "Salvando...",
        "profileUpdated": "Preferências de idioma atualizadas",
        "profileUpdateSuccess": "Suas preferências de idioma foram atualizadas com sucesso.",
        "profileUpdateFailed": "Falha ao atualizar preferências de idioma",
        "profileUpdateError": "Ocorreu um erro ao atualizar sua preferência de idioma."
      }
    },
    "notifications": {
      "title": "Notificações",
      "description": "Gerencie suas preferências de notificação e métodos de entrega",
      "types": {
        "title": "Tipos de Notificação",
        "newOrders": {
          "label": "Novos Pedidos",
          "description": "Receba notificações para novos pedidos recebidos"
        },
        "orderUpdates": {
          "label": "Atualizações de Pedido",
          "description": "Obtenha atualizações sobre o status de pedidos existentes"
        },
        "inventoryAlerts": {
          "label": "Alertas de Estoque",
          "description": "Notificações sobre estoque baixo ou alterações no estoque"
        },
        "systemAnnouncements": {
          "label": "Anúncios do Sistema",
          "description": "Atualizações importantes e anúncios do sistema"
        },
        "dailyReports": {
          "label": "Relatórios Diários",
          "description": "Receba relatórios diários"
        }
      },
      "deliveryMethods": {
        "title": "Métodos de Entrega",
        "emailNotifications": {
          "label": "Notificações por Email",
          "description": "Receba notificações via email"
        },
        "pushNotifications": {
          "label": "Notificações por Push",
          "description": "Receba alertas em tempo real no seu dispositivo"
        },
        "soundAlerts": {
          "label": "Alertas por Som",
          "description": "Reproduza notificações sonoras quando novos eventos ocorrerem"
        }
      },
      "actions": {
        "submit": "Salvar Alterações",
        "submitting": "Salvando...",
        "profileUpdated": "Preferências de notificação atualizadas",
        "profileUpdateSuccess": "Suas preferências de notificação foram atualizadas com sucesso.",
        "profileUpdateFailed": "Falha ao atualizar preferências de notificação",
        "profileUpdateError": "Ocorreu um erro ao atualizar suas preferências de notificação."
      }
    },
    "userProfile": {
      "title": "Perfil do Usuário",
      "username": "Nome de Usuario",
      "email": "Email",
      "role": "Função",
      "phoneNumber": "Numero de Telefone",
      "position": "Posição"
    },
    "establishment": {
      "title": "Estabelecimento",
      "description": "Gerencie as configurações e informações do seu estabelecimento",
      "name": "Nome do Estabelecimento",
      "address": "Endereço",
      "phone": "Numero de Telefone",
      "email": "Email",
      "logo": "Logo",
      "favicon": "Favicon",
      "timezone": "Fuso Horário",
      "currency": "Moeda",
      "language": "Idioma",
      "businessInfo": "Informações do Estabelecimento",
      "fields": {
        "name": "Nome do Restaurante",
        "address": "Endereço",
        "phone": "Numero de Telefone",
        "email": "Email",
        "openingHours": "Horário de Funcionamento",
        "taxId": "ID Fiscal / CNPJ"
      },
      "actions": {
        "submit": "Salvar Alterações",
        "submitting": "Salvando...",
        "save": "Salvar Alterações",
        "saving": "Salvando...",
        "saved": "Informações do estabelecimento salvas com sucesso",
        "error": "Erro ao salvar informações do estabelecimento",
        "establishmentUpdated": "Configurações do Estabelecimento Atualizadas",
        "establishmentUpdateSuccess": "Suas configurações do estabelecimento foram atualizadas com sucesso.",
        "establishmentUpdateFailed": "Falha ao atualizar configurações do estabelecimento",
        "establishmentUpdateError": "Ocorreu um erro ao atualizar suas configurações do estabelecimento."
      }
    },
    "security": {
      "title": "Segurança",
      "description": "Gerencie suas configurações de segurança e preferências",
      "password": "Senha",
      "changePassword": "Alterar Senha",
      "currentPassword": "Senha Atual",
      "newPassword": "Nova Senha",
      "confirmPassword": "Confirmar Senha",
      "updatePassword": "Atualizar Senha",
      "updating": "Atualizando...",
      "cancel": "Cancelar",
      "passwordMismatch": "As senhas não coincidem",
      "passwordTooShort": "A senha deve ter pelo menos 6 caracteres",
      "passwordUpdated": "Senha atualizada com sucesso",
      "passwordUpdateError": "Erro ao atualizar senha",
      "twoFactor": "Autenticação em Duas Fases",
      "twoFactorDescription": "Adicione uma camada extra de segurança à sua conta",
      "enableTwoFactor": "Habilitar Autenticação em Duas Fases",
      "twoFactorInfo": "Requer um código ao fazer login de um novo dispositivo",
      "twoFactorComingSoon": "Autenticação em Duas Fases em breve",
      "loginHistory": "Histórico de Login",
      "loginHistoryComingSoon": "Histórico de Login em breve",
      "deleteAccount": "Excluir Conta",
      "deleteAccountWarning": "Esta ação é irreversível. Todos os seus dados serão excluídos permanentemente.",
      "deleteAccountButton": "Excluir Conta",
      "confirmDelete": "Confirmar Exclusão",
      "deleting": "Excluindo...",
      "accountDeleted": "Conta excluída com sucesso",
      "deleteAccountError": "Erro ao excluir conta",
      "passwordRequired": "Senha é obrigatória",
      "enterPassword": "Digite sua senha para confirmar",
      "actions": {
        "submit": "Salvar Alterações",
        "submitting": "Salvando...",
        "securityUpdated": "Configurações de Segurança Atualizadas",
        "securityUpdateSuccess": "Suas configurações de segurança foram atualizadas com sucesso.",
        "securityUpdateFailed": "Falha ao atualizar configurações de segurança",
        "securityUpdateError": "Ocorreu um erro ao atualizar suas configurações de segurança."
      }
    },
    "sessionHistory": {
      "title": "Histórico de Sessões",
      "description": "Ver histórico de login/logout e horas trabalhadas da equipe",
      "noPermission": "Você não tem permissão para ver o histórico de sessões",
      "filters": "Filtros",
      "filterByUser": "Filtrar por usuário",
      "filterByStatus": "Filtrar por status",
      "startDate": "Data de início",
      "endDate": "Data de fim",
      "allUsers": "Todos os usuários",
      "allStatuses": "Todos os status",
      "clearFilters": "Limpar filtros",
      "refresh": "Atualizar",
      "noSessions": "Nenhuma sessão encontrada",
      "active": "Ativo",
      "completed": "Concluído",
      "login": "Login",
      "logout": "Logout",
      "duration": "Duração",
      "role": "Função",
      "device": "Dispositivo"
    },
    "billing": {
      "title": "Pagamento",
      "description": "Gerencie suas configurações de pagamento e preferências",
      "businessInfo": "Informações do Estabelecimento",
      "paymentMethod": "Método de Pagamento",
      "billingHistory": "Historico de Pagamentos",
      "cardNumber": "Número do Cartão",
      "expirationDate": "Data de Expiração",
      "cvv": "CVV",
      "actions": {
        "submit": "Salvar Alterações",
        "submitting": "Salvando...",
        "billingUpdated": "Configurações de Pagamento Atualizadas",
        "billingUpdateSuccess": "Suas configurações de pagamento foram atualizadas com sucesso.",
        "billingUpdateFailed": "Falha ao atualizar configurações de pagamento",
        "billingUpdateError": "Ocorreu um erro ao atualizar suas configurações de pagamento."
      }
    }
  },

  "orderForm": {
    "title": "Criar Pedido",
    "selectTable": "Selecionar Mesa",
    "noTableSelected": "Nenhuma mesa selecionada",
    "menuCategories": {
      "title": "Categorias do Menu"
    },
    "menuItems": {
      "search": "Procurar itens",
      "noResults": "Nenhum item encontrado"
    },
    "orderDetails": {
      "title": "Detalhes do Pedido",
      "items": "Itens do Pedido",
      "total": "Total",
      "subtotal": "Subtotal",
      "discount": "Desconto",
      "tax": "Taxa",
      "noItems": "Nenhum item adicionado"
    },
    "selectCategory": "Selecionar Categoria",
    "selectItem": "Selecionar Item",
    "quantity": "Quantidade",
    "notes": "Observações",
    "addItem": "Adicionar Item",
    "orderItems": "Itens do Pedido",
    "noItemsAdded": "Nenhum item adicionado",
    "dietaryRestrictions": {
      "title": "Restrições Dietéticas",
      "vegetarian": "Vegetariano",
      "vegan": "Vegano",
      "glutenFree": "Sem Glúten",
      "lactoseFree": "Sem Lactose"
    },
    "specialInstructions": {
      "label": "Instruções Especiais",
      "hasInstructions": "Tem instruções especiais?"
    }
  },

  "tableCard": {
    "label": {
      "available": "Disponivel",
      "occupied": "Ocupada",
      "reserved": "Reservada"
    },
    "status": {
      "noActiveOrder": "Nenhum pedido ativo"
    },
    "actions": {
      "createOrder": "Criar Pedido",
      "changeStatus": "Mudar Status",
      "viewOrder": "Ver Pedido",
      "closeOrder": "Fechar Pedido",
      "addItems": "Adicionar Itens"
    },
    "errors": {
      "sync": "Falha ao sincronizar status da mesa",
      "closeOrder": "Falha ao fechar pedido"
    }
  },

  "paymentMethods": {
    "cash": "Dinheiro",
    "credit": "Cartão de Crédito",
    "debit": "Cartão de Débito",
    "transfer": "Transferência Bancária",
    "other": "Outro"
  },
  "table": {
    "emptyState": {
      "title": "Nenhum pedido encontrado",
      "description": "Atualmente nenhum pedido no sistema. Inicie criando novos pedidos para ver aqui."
    },
    "loading": "Carregando pedidos..."
  },
  "categories": {
    "appetizers": "Aperitivos",
    "desserts": "Doces",
    "drinks": "Bebidas",
    "main_courses": "Pratos Principais",
    "salads": "Saladas",
    "sides": "Lanches"
  },
  "roles": {
    "owner": "Proprietário",
    "admin": "Administrador", 
    "manager": "Gerente",
    "staff": "Staff",
    "waiter": "Garçom",
    "barman": "Barman",
    "default": "Usuário"
  },
  "invitation": {
    "invalid": "Convite inválido",
    "expired": "O convite expirou",
    "error": "Erro ao buscar convite",
    "register": {
      "title": "Registrar",
      "description": "Você foi convidado a se juntar a {{establishmentName}}"
    }
  },

  landing: landingPt,
};

export const ptTranslations = mergeTranslations(ptTranslationsBase, supplementalPt)

export default ptTranslations;