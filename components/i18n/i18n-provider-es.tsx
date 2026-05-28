import { landingEs } from "./landing-translations"
import { supplementalEs, mergeTranslations } from "./supplemental-translations"

const esTranslationsBase = {
  
  "commons": {
    "yes": "Sí",
    "no": "No",
    "cancel": "Cancelar",
    "confirm": "Confirmar",
    "save": "Guardar",
    "edit": "Editar",
    "delete": "Eliminar",
    "loading": "Cargando...",
    "success": "Éxito",
    "warning": "Advertencia",
    "search": "Buscar",
    "filter": "Filtrar",
    "actions": "Acciones",
    "tableNumber": "Número de mesa",
    "close": "Cerrar",
    "button": {
      "add": "Agregar",
      "edit": "Editar",
      "delete": "Eliminar",
      "cancel": "Cancelar",
      "save": "Guardar",
      "submit": "Enviar",
      "sending": "Enviando...",
      "create": "Crear",
      "created": "Creado",
      "loading": "Cargando..."
    },
    "status": {
      "lowStock": "Bajo stock",
      "inStock": "En stock",
      "outOfStock": "Agotado"
    },
    "table": {
      "headers": {
        "name": "Nombre",
        "category": "Categoría",
        "quantity": "Cantidad",
        "unit": "Unidad",
        "minQuantity": "Cantidad Mínima",
        "price": "Precio",
        "status": "Estado",
        "actions": "Acciones"
      }
    },
    "error": {
      "generic": "Error al cargar",
      "required": "Este campo es requerido",
      "invalid": "Entrada inválida",
      "configurationError": "Error de configuración de Firebase. Por favor, contacte al soporte",
      "serviceUnavailable": "Servicio de autenticación no disponible. Intente de nuevo más tarde"
    },
    "noItemsFound": "No se encontraron elementos",
    "searchPlaceholder": "Buscar...",
    "confirmDelete": "¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.",
    "currency": "{{value}}",
    "password": "Contraseña",
    "emailRequired": "Email es requerido",
    "passwordRequired": "Contraseña es requerida",
    "login": {
      "error": {
        "emailRequired": "Email es requerido",
        "passwordRequired": "Contraseña es requerida",
        
        "invalidCredentials": "Credenciales inválidas",
        "tooManyAttempts": "Demasiados intentos fallidos. Intente de nuevo más tarde."
      }
    },
    "deleted": "Eliminado",
    "nextSlide": "Próximo slide",
    "previousSlide": "Slide anterior",
   
    "noResults": "No se encontraron resultados",
    "next": "Próximo",
    "previous": "Anterior",
    "accept": "Aceptar",
    "retry": "Reintentar"
  },

  "tableMaps": {
    "title": "Mapas de mesas",
    "description": "Gestionar los layouts de las mesas en tu restaurante",
    "createMap": "Crear mapa de mesas",
    "editMap": "Editar mapa de mesas",
    "mapName": "Nombre del mapa",
    "mapDescription": "Descripción del mapa",
    "mapDescriptionPlaceholder": "Describe el layout del mapa",
    "addNew": "Agregar nuevo mapa",
    "noMapsFound": "No se encontraron mapas",
    "saveError": "Error guardando el mapa",
    "createError": "Error creando el mapa",
    "updateError": "Error actualizando el mapa",
    "deleteError": "Error eliminando el mapa",
    "loadingTitle": "Cargando mapa",
    "delete": {
      "confirmTitle": "Eliminar mapa",
      "confirmDescription": "¿Estás seguro de que quieres eliminar el mapa '{{name}}'?",
      "success": "Mapa eliminado",
      "error": "Error eliminando el mapa"
    }
  },
  "dialog":{
    "delete":{
      "title": "Eliminar Orden",
      "description": "¿Estás seguro de que quieres eliminar la orden?",
      "confirmTitle": "Eliminar Orden",
      "confirmDescription": "¿Estás seguro de que quieres eliminar la orden?",
      "success": "Orden eliminada",
      "error": "Error eliminando la orden",
      "confirmButton": "Eliminar",
      "cancelButton": "Cancelar"
    }
  },

  "tableDialog": {
    "title": "Agregar nueva mesa",
    "description": "Crear una nueva mesa para tu restaurante",
    "labels": {
      "tableName": "Nombre de la mesa",
      "tableCapacity": "Capacidad de la mesa"
    },
    "placeholders": {
      "tableName": "Introduce el nombre de la mesa",
      "tableCapacity": "Introduce la capacidad de la mesa"
    },
    "actions": {
      "cancel": "Cancelar",
      "create": "Crear mesa"
    },
    "errors": {
      "invalidCapacity": "La capacidad de la mesa debe ser mayor a 0",
      "create": "Error creando la mesa"
    },
    "success": {
      "create": "Mesa creada exitosamente"
    }
  },

  "common": {
    "cancel": "Cancelar",
    "save": "Guardar",
    "create": "Crear",
    "edit": "Editar",
    "delete": "Eliminar",
    "created": "Creado",
    "close": "Cerrar",
    "error": "Error",
    "deleted": "Eliminado",
    "update": "Actualizar"
  },

  "tables": {
    "pageTitle": "Mesas en el restaurante",
    "addTable": "Agregar nueva mesa",
    "tableName": "Nombre de la mesa",
    "tableCapacity": "Capacidad de la mesa",
    "tableStatus": "Estado",
    "search": "Buscar mesas",
    "sortBy": "Ordenar por",
    "tableNumber": "Número de la mesa",
    "seats": "Asientos",
    "noTablesMatchFilter": "No se encontraron mesas",
    "noTablesInMap": "No se encontraron mesas en el mapa",
    "actions": "Acciones",
    "tableMaps": {
      "title": "Mapas de mesas",
      "createMap": "Crear mapa de mesas",
      "editMap": "Editar mapa de mesas",
      "editMapDescription": "Editar mapa de mesas",
      "mapName": "Nombre del mapa",
      "mapDescription": "Descripción del mapa",
      "noMapsFound": "No se encontraron mapas",
      "createMapDescription": "Crear un nuevo mapa de mesas para tu restaurante",
      "mapNamePlaceholder": "Introduce el nombre del mapa",
      "mapDescriptionPlaceholder": "Introduce la descripción del mapa",
      "layout": "Layout",
      "addTable": "Agregar mesa",
      "tablePosition": "Posición de la mesa",
      "tableCapacity": "Capacidad de la mesa",
      "viewMap": "Ver mapa de mesas",
      "addMap": "Agregar mapa",
      "deleteMap": "Eliminar mapa",
      "mapCreationFailed": "Error creando el mapa",
      "mapUpdateFailed": "Error actualizando el mapa",
      "mapDeletionFailed": "Error eliminando el mapa",
      "mapCreated": "Mapa creado",
      "mapUpdated": "Mapa actualizado",
      "mapDeleted": "Mapa eliminado",
      "delete": {
        "confirmTitle": "Eliminar mapa",
        "confirmDescription": "¿Estás seguro de que quieres eliminar el mapa '{{name}}'?",
        "success": "Mapa eliminado",
        "error": "Error eliminando el mapa"
      },
      "fetchError": "Error obteniendo los mapas"
    },
    "allStatuses": "Todos los estados",
    "statuses": {
      "available": "Disponible"
    }
  },
  

  "sidebar": {
    "appName": "Comandero",
    "role": "Rol",
    "dashboard": "Dashboard",
    "orders": "Pedidos",
    "tables": "Mesas",
    "cashRegister": "Caja",
    "inventory": "Inventario",
    "purchases": "Compras",
    "users": "Usuarios",
    "settings": "Configuración",
    "advancedReports": "Informes avanzados",
    "logout": "Cerrar sesión",
    "logoutSuccess": "Sesión cerrada correctamente",
    "logoutCancelled": "Cierre de sesión cancelado",
    "logoutError": "Error al cerrar sesión",
    "language": "Idioma",
    "installApp": "Descargar App",
    "installSuccess": "App instalada correctamente",
    "installError": "Error al instalar la app",
    "languages": {
      "english": "Inglés",
      "spanish": "Español", 
      "portuguese": "Portugues"
    }
  },

  "dashboard": {
    "title": "Dashboard",
    "goodMorning": "Buenos días",
    "goodAfternoon": "Buenas tardes",
    "goodEvening": "Buenas noches",
    "user": "Usuario",
    "welcomeMessage": "Bienvenido a tu dashboard, donde puedes gestionar las operaciones de tu restaurante y rastrear el desempeño.",
    "trial": {
      "title": "Período de prueba activo",
      "message": "Tienes {{daysLeft}} días restantes en tu prueba. Tu plan: {{plan}}"
    },
    
    "totalSales": {
      "title": "Ventas totales",
      "performance": "Desempeño este mes",
      "trend": "Tendencia de ventas",
      "comparedToLastMonth": "comparado con el mes anterior"
    },
    
    "dailySales": {
      "title": "Ventas diarias"
    },
    
    "salesByCategory": {
      "title": "Ventas por categoría",
      "description": "Desglose del desempeño de ventas por categoría de producto",
      "noSalesData": "No hay datos de ventas disponibles",
      "categories": {
        "main_courses": "Platos principales",
        "drinks": "Bebidas", 
        "desserts": "Postres",
        "appetizers": "Entradas",
        "salads": "Ensaladas",
        "sides": "Acompañamientos",
        "uncategorized": "Sin categoría"
      }
    },
    
    "topSellingItems": {
      "title": "Top Productos",
      "subtitle": "Productos más populares",
      "description": "Productos más vendidos",
      "orderCount": "{{count, number}} pedidos",
      "quantity": "Cantidad: {{value}}"
    },
    
    "recentOrders": {
      "title": "Pedidos recientes",
      "orderNumber": "Pedido #{{number}}",
      "table": "Mesa"
    },
    
    "additionalInsights": {
      "title": "Insights adicionales",
      "placeholder": "No hay insights adicionales disponibles"
    },
    
    "inventory": {
      "title": "Resumen de inventario",
      "totals": "Totales",
      "byCategory": "Por categoría",
      "byItem": "Por item",
      "total": "Total de items",
      "inStock": "En stock",
      "lowStock": "Bajo stock",
      "noItems": "No se encontraron items",
      "itemName": "Nombre del item",
      "category": "Categoría",
      "status": {
        "label": "Estado",
        "critical": "Stock crítico",
        "warning": "Bajo stock",
        "healthy": "Stock saludable"
      }
    },
    "report": {
      "title": "Reporte",
      "description": "Descargar un informe completo de todas las métricas de la empresa en Excel o PDF.",
      "excel": "Excel",
      "pdf": "PDF",
      "fileDescription": "El archivo incluirá ventas por día, productos más vendidos, inventario y más, según los datos actualmente visibles en el dashboard.",
    },
    "reports": {
      "title": "Descargar Reportes",
      "description": "Descargar reportes detallados de inventario, ventas, actividad de usuarios y más.",
      "inventory": "Reporte de Inventario",
      "inventoryDescription": "Descargar reporte completo de inventario con todas las categorías y items, incluyendo cantidades, niveles de stock mínimo y precios.",
      "sales": "Reporte de Ventas",
      "salesDescription": "Descargar reporte completo de ventas con todas las órdenes, incluyendo detalles de orden, métodos de pago, estado e items vendidos.",
      "userActivity": "Reporte de Actividad de Usuarios",
      "userActivityDescription": "Descargar reporte de actividad de usuarios con todas las sesiones, incluyendo tiempos de login/logout, dispositivos, sistemas operativos y roles de usuario.",
      "general": "Reporte General",
      "generalDescription": "Descargar reporte general completo incluyendo ventas por día, productos principales, resumen de inventario, inventario completo, todas las ventas y actividad de usuarios."
    }
  },

  "purchases": {
    "title": "Compras",
    "suppliers": {
      "title": "Proveedores",
      "add": "Agregar Proveedor",
      "edit": "Editar Proveedor",
      "delete": "Eliminar Proveedor",
      "deleteConfirm": "¿Estás seguro de que quieres eliminar este proveedor?",
      "loading": "Cargando proveedores...",
      "noSuppliers": "No hay proveedores aún. Agrega tu primer proveedor.",
      "searchPlaceholder": "Buscar proveedores...",
      "name": "Nombre",
      "contactPerson": "Persona de Contacto",
      "email": "Email",
      "phone": "Teléfono",
      "address": "Dirección",
      "city": "Ciudad",
      "state": "Estado",
      "country": "País",
      "zipCode": "Código Postal",
      "taxId": "ID Fiscal",
      "notes": "Notas",
      "paymentTerms": "Términos de Pago",
      "deliveryTime": "Tiempo de Entrega",
      "paymentTermsPlaceholder": "ej., Net 30, Net 60",
      "deliveryTimePlaceholder": "ej., 2-3 días",
      "active": "Activo",
      "inactive": "Inactivo",
      "contact": "Contacto",
      "payment": "Pago",
      "delivery": "Entrega",
      "success": {
        "added": "Proveedor agregado exitosamente",
        "updated": "Proveedor actualizado exitosamente",
        "deleted": "Proveedor eliminado exitosamente"
      },
      "error": {
        "loading": "Error al cargar proveedores",
        "saving": "Error al guardar proveedor",
        "deleting": "Error al eliminar proveedor"
      }
    },
    "purchases": {
      "title": "Compras",
      "add": "Agregar Compra",
      "edit": "Editar Compra",
      "delete": "Eliminar Compra",
      "deleteConfirm": "¿Estás seguro de que quieres eliminar esta compra?",
      "loading": "Cargando compras...",
      "noPurchases": "No hay compras aún. Agrega tu primera compra.",
      "searchPlaceholder": "Buscar compras...",
      "purchaseNumber": "Número de Compra",
      "supplier": "Proveedor",
      "orderDate": "Fecha de Orden",
      "expectedDeliveryDate": "Fecha de Entrega Esperada",
      "status": "Estado",
      "paymentMethod": "Método de Pago",
      "paymentStatus": "Estado de Pago",
      "payment": "Pago",
      "notes": "Notas",
      "items": "Items",
      "total": "Total",
      "addItem": "Agregar Item",
      "itemName": "Nombre del Item",
      "quantity": "Cantidad",
      "unit": "Unidad",
      "purchasePrice": "Precio de Compra",
      "salesPrice": "Precio de Venta",
      "itemNotes": "Notas",
      "category": "Categoría",
      "selectCategory": "Seleccionar Categoría",
      "minQuantity": "Cantidad Mínima",
      "lowStockThreshold": "Umbral de Stock Bajo",
      "unitPlaceholder": "ej., kg, unidades, litros",
      "paymentMethodPlaceholder": "ej., Transferencia Bancaria, Efectivo, Crédito",
      "autoGenerated": "Autogenerado si está vacío",
      "atLeastOneItem": "Por favor agrega al menos un item",
      "fillAllItemFields": "Por favor completa todos los campos del item",
      "statuses": {
        "pending": "Pendiente",
        "ordered": "Ordenado",
        "received": "Recibido",
        "cancelled": "Cancelado",
        "partial": "Parcial"
      },
      "paymentStatuses": {
        "pending": "Pendiente",
        "paid": "Pagado",
        "partial": "Parcial",
        "overdue": "Atrasado"
      },
      "success": {
        "added": "Compra agregada exitosamente",
        "updated": "Compra actualizada exitosamente",
        "deleted": "Compra eliminada exitosamente"
      },
      "error": {
        "loading": "Error al cargar compras",
        "saving": "Error al guardar compra",
        "deleting": "Error al eliminar compra"
      }
    },
    "reports": {
      "title": "Informes",
      "totalPurchases": "Compras Totales",
      "totalCost": "Costo Total",
      "profitMargin": "Margen de Ganancia",
      "totalItems": "Items Totales",
      "purchases": "compras",
      "purchaseCost": "costo de compra",
      "averageMargin": "margen promedio",
      "itemsPurchased": "items comprados",
      "costByCategory": "Costo por Categoría",
      "monthlyCost": "Costo Mensual",
      "recentPurchases": "Compras Recientes"
    }
  },

  "toast": {
    "salesAlert": "Las ventas disminuyeron en comparación con el mes anterior",
    "goalReached": "¡Meta de ventas alcanzada!",
    "excelDownloaded": "Reporte de Excel descargado exitosamente",
    "pdfDownloaded": "Reporte PDF descargado exitosamente",
    "inventoryDownloaded": "Reporte de inventario descargado exitosamente",
    "salesDownloaded": "Reporte de ventas descargado exitosamente",
    "userActivityDownloaded": "Reporte de actividad de usuarios descargado exitosamente",
    "exportError": "Error al exportar reporte",
    "noInventoryData": "No hay datos de inventario disponibles para exportar"
  },

  "errors": {
    "fetchFailed": "Error al cargar los datos del dashboard. Por favor, intenta de nuevo más tarde."
  },

  "salesList": {
    "title": "Historial de ventas",
    "noSales": "No se han registrado ventas",
    "columns": {
      "date": "Fecha",
      "orderId": "ID de la orden",
      "total": "Total",
      "paymentMethod": "Método de pago"
    },
    "paymentMethods": {
      "cash": "Efectivo",
      "credit": "Tarjeta de crédito",
      "debit": "Tarjeta de débito",
      "transfer": "Transferencia bancaria",
      "other": "Otro"
    }
  },

  "orders": {
    "categories": {
      "main_courses": "Platos principales",
      "drinks": "Bebidas", 
      "desserts": "Postres",
      "appetizers": "Entradas",
      "salads": "Ensaladas",
      "sides": "Acompañamientos",
      "uncategorized": "Sin categoría"
    },
    "title": "Pedidos",
    "newOrder": "Nuevo pedido",
    "createOrder": "Crear pedido",
    "tableNumberPlaceholder": "Introduce el número de la mesa",
    "noOrdersFound": "No se encontraron pedidos",
    "subtotal": "Subtotal",
    "total": "Total",
    "table": "Mesa",
    "counter": "Contador",
    "waiter": "Mesero",
    "takeaway": "Delivery",
    "details": {
      "title": "Detalles del pedido",
      "description": "Detalles del pedido",
      "id": "ID de la orden",
      "tableNumber": "Número de la mesa",
      "waiter": "Mesero",
      "counter": "Contador",
      "items": "Items",
      "total": "Total",
      "status": "Estado",
      "actions": "Acciones"
    },
    "search": {
      "placeholder": "Buscar pedidos por ID, mesa o mesero"
    },
    "filter": {
      "allStatuses": "Todos los estados"
    },

    "actions": {
      "view": "Ver",
      "updateStatus": "Actualizar estado",
      "delete": "Eliminar"
    },
    "action": {
      "updated": "Actualizado",
      "deleted": "Eliminado"
    },
    "success": {
      "statusUpdated": "Estado actualizado",
      "orderDeleted": "Pedido eliminado",
      "itemAdded": "Item agregado",
      "itemUpdated": "Item actualizado",
      "itemDeleted": "Item eliminado"
    },
    "error": {
      "fetchFailed": "Error al cargar los pedidos",
      "updateStatusFailed": "Error al actualizar el estado del pedido",
      "deleteOrderFailed": "Error al eliminar el pedido"
    },
    "orderType": "Tipo de pedido",
    "tableNumber": "Número de la mesa",
    "selectCategory": "Seleccionar categoría",
    "selectItem": "Seleccionar item",
    "noItemsInCategory": "No hay items en esta categoría",
    "quantity": "Cantidad",
    "itemNotes": "Notas del item",
    "itemNotesPlaceholder": "¿Alguna nota especial?",
    "itemDietaryRestrictions": "Restricciones dietéticas",
    "addToOrder": "Agregar al pedido",
    "orderSummary": "Resumen del pedido",
    "showMenuQr": "Mostrar QR del menú",
    "noItemsInOrder": "No hay items en el pedido",
    "specialRequests": "Solicitudes especiales",
    "specialRequestsPlaceholder": "¿Alguna solicitud especial para la cocina?",
    "menuUrl": "URL del menú",
    "discount": "Descuento",
    "percentage": "Porcentaje",
    "errors": {
      "noItemsInOrder": "Por favor, agrega items al pedido",
      "noTableSelected": "Por favor, selecciona una mesa",
      "noActiveCashRegister": "No se encontró un caja activo",
      "headers": {
        "id": "ID de la orden",
        "tableNumber": "Número de la mesa",
        "waiter": "Mesero", 
        "items": "Items",
        "status": "Estado",
        "total": "Total",
        "actions": "Acciones"
      }
    },
    "confirmPayment": "Confirmar pago",
    "selectPaymentMethod": "Seleccionar método de pago",
    "paymentMethodDescription": "Elige el método de pago para este pedido",
    "paymentMethods": {
      "cash": "Efectivo",
      "credit": "Tarjeta de crédito",
      "debit": "Tarjeta de débito",
      "transfer": "Transferencia bancaria",
      "other": "Otro"
    },
    "itemUnavailable": "(Indisponible)",
    "stockAvailable": "- R$ {{price}} ({{stock}} disponible)",
    "changeStatusTitle": "Cambiar estado",
    "changeStatusDescription": "Cambiar estado del pedido",
    "changeStatusButton": "Cambiar estado",
    "types": {
      "table": "Mesa",
      "delivery": "Entrega",
      "counter": "Mostrador",
      "takeaway": "Para llevar",
      "food": "Comida",
      "drinks": "Bebidas"
    },
    "emptyState": {
      "noFood": "No hay items de comida en este pedido",
      "noDrinks": "No hay items de bebidas en este pedido"
    },
    "transfer": {
      "title": "Transferir Artículos",
      "description": "Seleccione artículos para transferir a otra mesa/pedido",
      "selectItems": "Seleccionar Artículos",
      "selectAll": "Seleccionar Todo",
      "deselectAll": "Deseleccionar Todo",
      "destination": "Mesa de Destino",
      "selectMap": "Seleccionar mapa de mesas",
      "selectDestinationTable": "Seleccionar mesa de destino",
      "createNewOrder": "Crear nuevo pedido",
      "existingOrder": "Pedido existente",
      "itemsToTransfer": "Artículos a transferir",
      "transferTotal": "Total de transferencia",
      "transfer": "Transferir",
      "transferring": "Transfiriendo...",
      "cancel": "Cancelar",
      "noItemsSelected": "Por favor seleccione al menos un artículo",
      "noDestinationSelected": "Por favor seleccione una mesa de destino",
      "success": "Artículos transferidos exitosamente",
      "error": "Error al transferir artículos",
      "errorFetchingData": "Error al obtener mesas y pedidos"
    },
    "partialPayment": {
      "title": "Pago Parcial",
      "description": "Seleccione artículos y cantidades a pagar",
      "selectItems": "Seleccionar Artículos",
      "unpaid": "Sin pagar",
      "itemsSelected": "Artículos seleccionados",
      "paymentAmount": "Monto del pago",
      "pay": "Pagar",
      "processing": "Procesando...",
      "noItemsSelected": "Por favor seleccione al menos un artículo",
      "noPaymentMethod": "Por favor seleccione un método de pago",
      "partialPaymentSuccess": "Pago parcial exitoso",
      "orderFullyPaid": "Pedido pagado completamente y cerrado",
      "error": "Error al procesar el pago"
    },
    "partialPrice": "Precio",
    "paymentMethod": "Método de Pago"
  },

  "ordersPage": {
    "pageTitle": "Pedidos",
    "newOrder": "Nuevo pedido",
    "searchPlaceholder": "Buscar pedidos...",
    "noOrdersFound": "No se encontraron pedidos",
    "orderStatus": {
      "01": "Pendiente",
      "02": "En preparación",
      "03": "Listo para servir",
      "04": "Entregado",
      "05": "Cancelado",
      "06": "Pagado",
      "07": "Enviado",
      "08": "En tránsito",
      "09": "Completado",
      "10": "Reembolsado",
      "11": "Pendiente",
      "12": "Programado",
      "13": "Pagado parcialmente",
      "14": "Error de pago",
      "15": "Rechazado",
      "16": "Procesando",
      "17": "Confirmado",
      "18": "Preparación iniciada",
      "19": "Casi listo",
      "20": "Esperando a cliente",
      "21": "Servicio de mesa",
      "22": "Para viaje",
      "23": "Entrega",
      "24": "Reserva",
      "25": "Urgente",
      "70": "Estado final"
    },
    "table": {
      "id": "ID", 
      "table": "Mesa",
      "waiter": "Mesero",
      "items": "Items",
      "status": "Estado",
      "total": "Total",
      "actions": "Acciones"
    },
    "actions": {
      "updateStatus": "Actualizar estado",
      "updateStatusDescription": "Actualizar estado del pedido {{orderId}}",
      "selectStatus": "Seleccionar nuevo estado",
      "delete": "Eliminar pedido",
      "view": "Ver pedido",
      "deleteOrderConfirmation": "¿Estás seguro de que quieres eliminar el pedido {{orderId}}?"
    },
    "error": {
      "fetchFailed": "Error al cargar los pedidos",
      "updateStatusFailed": "Error al actualizar el estado del pedido",
      "deleteFailed": "Error al eliminar el pedido",
      "deleteItemFailed": "Error al eliminar el item",
      "noActiveCashRegister": "No hay una caja abierta. Debe abrir la caja antes de realizar ventas."
    },
    "success": {
      "statusUpdated": "Estado del pedido actualizado",
      "orderDeleted": "Pedido eliminado",
      "itemDeleted": "Item eliminado exitosamente"
    },
  },

  "newOrder": {
    "title": "Nuevo pedido",
    "orderDetails": "Detalles del pedido",
    "currentOrder": "Pedido actual",
    "tableNumber": "Número de la mesa",
    "tableNumberPlaceholder": "Introduce el número de la mesa",
    "selectItem": "Seleccionar item",
    "selectItemPlaceholder": "Selecciona un item para agregar",
    "quantity": "Cantidad",
    "notes": "Notas",
    "notesPlaceholder": "Instrucciones especiales",
    "addToOrder": "Agregar al pedido",
    "noItemsInOrder": "No se han agregado items al pedido",
    "total": "Total",
    "createOrder": "Crear pedido",
    "table": {
      "item": "Item",
      "quantity": "Cantidad",
      "price": "Precio",
      "total": "Total",
      "actions": "Acciones"
    },
    "error": {
      "title": "Error",
      "noItem": "Por favor, selecciona un item",
      "noTable": "Por favor, introduce el número de la mesa",
      "noItems": "Por favor, agrega al menos un item al pedido",
      "orderCreationFailed": "Error al crear el pedido"
    },
    "success": {
      "orderCreated": "Pedido creado",
      "orderCreatedDescription": "El pedido para la mesa {{tableNumber}} se creó exitosamente"
    }
  },

  "newOrderPage": {
    "title": "Nuevo pedido",
    "errors": {
      "unauthorized": "No tienes autorización para crear este pedido",
      "menuItemNotFound": "El item del menú seleccionado no se encontró",
      "invalidQuantity": "Introduce una cantidad válida",
      "missingTableNumber": "Selecciona o introduce el número de la mesa",
      "missingMenuItem": "Selecciona un item del menú",
      "insufficientStock": "Stock insuficiente para el item seleccionado",
      "orderCreationFailed": "Error al crear el pedido. Por favor, intenta de nuevo.",
      "fetchOrders": "Error al cargar los pedidos",
      "createOrder": "Error al crear el pedido",
      "updateOrder": "Error al actualizar el pedido",
      "deleteOrder": "Error al eliminar el pedido",
      "updateStatus": "Error al actualizar el estado del pedido"
    },
    "success": {
      "orderCreated": "Pedido creado exitosamente",
      "orderUpdated": "Pedido actualizado exitosamente",
      "orderDeleted": "Pedido eliminado exitosamente",
      "statusUpdated": "Estado del pedido actualizado exitosamente",
      "itemAdded": "Item agregado al pedido"
    },
  },

  "inventory": {
    "title": "Overview de inventario",
    "subtitle": "Gestiona el inventario de tu restaurante",
    "searchPlaceholder": "Buscar en inventario...",
    "noItemsFound": "No se encontraron items",
    "name": "Nombre",
    "category": "Categoría", 
    "quantity": "Cantidad",
    "unit": "Unidad",
    "minQuantity": "Stock mínimo",
    "price": "Precio",
    "purchasePrice": "Precio de compra",
    "actions": "Acciones",
    "status": {
      "label": "Estado",
      "lowStock": "Stock bajo",
      "inStock": "En stock"
    },
    "addItem": "Agregar item",
    "addItemTitle": "Agregar item",
    "addItemDescription": "Agregar un nuevo item al inventario",
    "description": "Descripción del item",
    "supplier": "Proveedor",
    "selectCategory": "Seleccionar categoría",
    "add": "Agregar",
    "cancel": "Cancelar",
    "update": "Actualizar",
    "save": "Guardar",
    "editItemTitle": "Editar item",
    "editItemDescription": "Editar detalles del item",
    "addItemDetails": {
      "title": "Agregar item",
      "description": "Agregar un nuevo item al inventario",
      "namePlaceholder": "Introduce el nombre del item",
      "categoryPlaceholder": "Selecciona la categoría del item",
      "quantityPlaceholder": "Introduce la cantidad",
      "unitPlaceholder": "Introduce la unidad (ex. kg, piezas)",
      "minQuantityPlaceholder": "Introduce la cantidad mínima de stock",
      "pricePlaceholder": "Introduce el precio del item",
      "successToast": "{{itemName}} fue agregado al inventario",
      "errorToast": "Error al agregar el item al inventario"
    },
    "editItemDetails": {
      "title": "Editar item",
      "description": "Editar detalles del item",
      "successToast": "{{itemName}} fue actualizado",
      "errorToast": "Error al actualizar el item"
    },
    "deleteItemDetails": {
      "title": "Eliminar item",
      "description": "¿Estás seguro de que quieres eliminar {{itemName}}? Esta acción no se puede deshacer.",
      "successToast": "Item eliminado del inventario",
      "errorToast": "Error al eliminar el item del inventario"
    },
    "stockStatus": {
      "lowStock": "Stock bajo",
      "inStock": "En stock"
    },
    "buttons": {
      "add": "Agregar item",
      "edit": "Editar item",
      "cancel": "Cancelar",
      "delete": "Eliminar item"
    },
    "categories": {
      "main_courses": "Platos principales",
      "drinks": "Bebidas", 
      "desserts": "Postres",
      "appetizers": "Entradas",
      "salads": "Ensaladas",
      "sides": "Acompañamientos",
      "uncategorized": "Sin categoría"
    },
    "lowStockAlert": "Alerta de stock bajo",
    "lowStockAlertDescription": "Recibe una alerta cuando el stock de un item es bajo",
    "lowStockAlertSuccess": "Alerta de stock bajo habilitada para {{itemName}}",
    "lowStockAlertError": "Error al habilitar la alerta de stock bajo para {{itemName}}",
    "lowStockAlertDisabled": "Alerta de stock bajo deshabilitada para {{itemName}}",
    "lowStockAlertDisabledDescription": "Recibe una alerta cuando el stock de un item es bajo",
    "lowStockAlertDisabledSuccess": "Alerta de stock bajo deshabilitada para {{itemName}}",
    "lowStockAlertDisabledError": "Error al deshabilitar la alerta de stock bajo para {{itemName}}",
    "lowStockAlertDisabledToast": "Alerta de stock bajo deshabilitada para {{itemName}}",
    "lowStockAlertDisabledToastError": "Error al deshabilitar la alerta de stock bajo para {{itemName}}",
    "manageCategories": "Gestionar Categorías",
    "manageCategoriesDesc": "Crea, edita o elimina las categorías para organizar tu inventario.",
    "existingCategories": "Categorías Existentes",
    "addNewCategory": "Nueva Categoría",
    "editCategory": "Editar Categoría",
    "createCategory": "Crear",
    "updateCategory": "Actualizar",
    "categoryName": "Nombre de Categoría",
    "categoryNamePlaceholder": "Ej. Bebidas, Carnes",
    "categoryDescription": "Descripción de Categoría",
    "categoryDescPlaceholder": "Descripción de la categoría",
    "categoryColor": "Color",
    "categoryType": "Tipo de Categoría",
    "selectType": "Seleccionar tipo",
    "categoryTypes": {
      "food": "Comida",
      "drink": "Bebida"
    },
    "lowStockThreshold": "Umbral de Stock Bajo",
    "noEstablishmentError": "No se encontró ID de establecimiento",
    "noEstablishmentErrorMsg": "No se encontró ID de establecimiento",
    "fetchError": "Error al obtener inventario",
    "fillRequiredFieldsMsg": "Por favor, completa los campos requeridos",
    "categoryAlreadyExists": "La categoría ya existe",
    "saveSuccess": "Guardado exitosamente",
    "saveError": "Error al guardar",
    "deleteSuccess": "Eliminado exitosamente",
    "deleteError": "Error al eliminar",
    "categoryNotEmpty": "No se puede eliminar la categoría porque contiene productos.",
    "noCategoryError": "No se ha seleccionado categoría",
    "itemSaved": "Item guardado exitosamente",
    "itemDeleted": "Item eliminado exitosamente",
    "itemUpdatedMsg": "Item actualizado exitosamente",
    "categoryRequiredMsg": "Categoría es requerida",
    "itemAddedMsg": "Item agregado exitosamente",
    "errorSavingItemMsg": "Error al guardar item",
    "errorNoItemSelectedToAddStock": "No hay item seleccionado para agregar stock",
    "errorQuantityToAddPositive": "La cantidad a agregar debe ser positiva",
    "stockAddedSuccessfullyMsg": "Stock agregado exitosamente",
    "errorAddingStockMsg": "Error al agregar stock",
    "editBtn": "Editar",
    "addStockBtn": "Agregar Stock",
    "addStockTo": "Agregar stock a",
    "currentQuantity": "Cantidad actual",
    "quantityToAddLabel": "Cantidad a agregar",
    "enterQuantityPlaceholder": "Introduce cantidad",
    "addStockConfirmBtn": "Agregar Stock",
    "noCategoriesYet": "No hay categorías creadas aún."
  },

  "users": {
    "pageTitle": "Usuarios",
    "actions": "Acciones",
    "addUser": "Agregar usuario",
    "searchPlaceholder": "Buscar usuarios...",
    "userList": "Lista de usuarios",
    "username": "Nombre de usuario",
    "email": "Email",
    "role": "Rol",
    "status": "Estado",
    "deleteSuccess": "Usuario eliminado",
    "hasBeenDeleted": "ha sido eliminado",
    "noUsers": "No se encontraron usuarios",
    "roles": {
      "owner": "Propietario",
      "admin": "Admin",
      "manager": "Gerente",
      "staff": "Personal",
      "waiter": "Mesero",
      "chef": "Cocinero",
      "barman": "Barmán",
      "default": "Usuario"
    },
    "userStatus": {
      "active": "Activo",
      "inactive": "Inactivo",
      "suspended": "Suspendido"
    },
    "openMenu": "Abrir menú",
    "copyId": "Copiar ID",
    "editUser": "Editar usuario",
    "editSuccess": "Usuario actualizado exitosamente",
    "userNotFound": "Usuario no encontrado",
    "delete": "Eliminar",
    "confirmDelete": "Confirmar eliminación",
    "confirmDeleteDescription": "¿Estás seguro de que quieres eliminar el usuario '{{username}}'?",
    "deleteUser": "Eliminar usuario",
    "deleted": "Usuario eliminado",
    "errors": {
      "deleteUser": "Error al eliminar usuario",
      "updateUser": "Error al actualizar usuario"
    }
  },

  "login": {
    "title": "Inicio de sesión",
    "subtitle": "Introduce tus credenciales para acceder a tu cuenta",
    "emailLabel": "Email",
    "emailPlaceholder": "Introduce tu email",
    "passwordLabel": "Contraseña",
    "passwordPlaceholder": "Introduce tu contraseña",
    "login": "Iniciar sesión",
    "forgotPassword": "¿Olvidaste tu contraseña?",
    "sendPasswordReset": "Enviar restablecimiento de contraseña",
    "passwordResetSuccess": "Correo electrónico de restablecimiento de contraseña enviado correctamente",
    "passwordResetError": "Error al enviar correo electrónico de restablecimiento de contraseña",
    "passwordResetTitle": "Restablecimiento de contraseña",
    "passwordResetDescription": "Introduce tu email para recibir instrucciones de restablecimiento de contraseña",
    "registerLink": "¿No tienes una cuenta? Regístrate aquí",
    "submit": "Enviar",
    "send": "Enviar",
    "loading": "Cargando...",
    "orContinueWith": "o continúa con",
    "signInWithGoogle": "Iniciar sesión con Google",
    "success": "Inicio de sesión exitoso",
    "unexpectedError": "Ocurrió un error inesperado",
    "error": {
      "invalidCredentials": "Email o contraseña inválidos",
      "tooManyAttempts": "Demasiados intentos de inicio de sesión. Inténtalo de nuevo más tarde.",
      "emailRequired": "Email es requerido",
      "passwordRequired": "Contraseña es requerida",
      "serviceUnavailable": "Servicio de autenticación no disponible. Inténtalo de nuevo más tarde",
      "popupClosed": "La ventana emergente fue cerrada por el usuario",
      "popupBlocked": "La ventana emergente fue bloqueada por el navegador",
      "accountExistsWithDifferentCredential": "La cuenta ya existe con diferentes credenciales",
      "profileNotFound": "Perfil no encontrado"
    }
  },

  "setup": {
    "title": "Crear tu Establecimiento",
    "description": "¡Bienvenido! Configuremos tu establecimiento de restaurante",
    "establishmentNameLabel": "Nombre del Establecimiento",
    "establishmentNamePlaceholder": "Ingresa el nombre de tu restaurante",
    "establishmentNameRequired": "El nombre del establecimiento es requerido",
    "createEstablishment": "Crear Establecimiento",
    "creating": "Creando...",
    "success": "Establecimiento creado exitosamente",
    "error": "Error al crear el establecimiento",
    "sessionExpired": "Sesión expirada, por favor inicia sesión nuevamente"
  },

  "register": {
    "title": "Registro",
    "subtitle": "Crea una nueva cuenta para acceder al sistema de gestión de restaurantes",
    "username": "Nombre de usuario",
    "usernameLabel": "Nombre de usuario",
    "usernamePlaceholder": "Introduce tu nombre de usuario",
    "email": "Email",
    "emailLabel": "Email",
    "emailPlaceholder": "Introduce tu email",
    "password": "Contraseña",
    "passwordLabel": "Contraseña",
    "passwordPlaceholder": "Introduce tu contraseña",
    "confirmPassword": "Confirmar contraseña",
    "confirmPasswordLabel": "Confirmar contraseña",
    "confirmPasswordPlaceholder": "Confirma tu contraseña",
    "establishmentName": "Nombre del establecimiento",
    "establishmentNameLabel": "Nombre del establecimiento",
    "establishmentNamePlaceholder": "Introduce el nombre del establecimiento",
    "subscriptionPlanLabel": "Plan de suscripción",
    "selectPlan": "Seleccionar un plan",
    "trialInfo": "Comienza con una prueba gratuita de 14 días en cualquier plan",
    "submit": "Registrar",
    "acceptTerms": "Aceptar términos",
    "termsLink": "Términos de Uso",
    "loginLink": "¿Ya tienes una cuenta? Inicia sesión aquí",
    "error": {
      "passwordsDoNotMatch": "Las contraseñas no coinciden",
      "emailInUse": "Este email ya está en uso",
      "weakPassword": "Contraseña es demasiado débil",
      "establishmentNameRequired": "Nombre del establecimiento es requerido",
      "establishmentNameMinLength": "Nombre del establecimiento debe tener al menos 3 caracteres",
      "establishmentNameTaken": "Este nombre del establecimiento ya está en uso",
      "suggestedAlternatives": "Nombre del establecimiento sugerido:",
      "selectAlternative": "Por favor, selecciona un nombre alternativo o modifica el actual"
    },
    "suggestedNames": {
      "title": "Nombre del establecimiento sugerido",
      "description": "El nombre que introdujiste ya está en uso. Por favor, selecciona un nombre alternativo:",
      "selectButton": "Seleccionar",
      "modifyButton": "Modificar nombre"
    }
  },

  "forgotPassword": {
    "title": "Olvidaste tu contraseña",
    "description": {
      "initial": "Introduce tu email para recibir instrucciones de restablecimiento de contraseña",
      "emailSent": "Instrucciones de restablecimiento enviadas a tu email"
    },
    "email": "Email",
    "button": {
      "sendInstructions": "Enviar instrucciones",
      "sending": "Enviando...",
      "tryAnotherEmail": "Probar otro email"
    },
    "emailSent": {
      "checkSpam": "Revisa tu carpeta de spam si no ves el email"
    },
    "error": {
      "emailRequired": "Email es requerido",
      "authNotInitialized": "Autenticación no inicializada",
      "invalidEmail": "Dirección de email inválida",
      "userNotFound": "No se encontró cuenta con este email",
      "genericError": "Error al enviar email de restablecimiento"
    },
    "success": {
      "emailSent": "Instrucciones de restablecimiento enviadas"
    },
    "loginReminder": "¿Recuerdas tu contraseña?",
    "loginLink": "Iniciar sesión"
  },

  "settings": {
    "title": "Configuración",
    "selectTab": "Selecciona una pestaña",
    "system": {
      "title": "Sistema",
      "description": "Gestiona los ajustes del sistema y las configuraciones avanzadas del sistema"
    },
    "installBanner": {
      "title": "Instala nuestra app",
      "description": "Obtén la experiencia completa con nuestra app",
      "install": "Instalar"
    },
    "profile": {
      "title": "Perfil",
      "description": "Gestiona tu información personal y configuraciones de la cuenta",
      "actions": {
        "uploadPhoto": "Subir foto",
        "submit": "Guardar cambios",
        "submitting": "Guardando...",
        "profileUpdated": "Perfil actualizado",
        "profileUpdateSuccess": "Tu perfil se actualizó correctamente.",
        "profileUpdateFailed": "Error al actualizar perfil",
        "profileUpdateError": "An error occurred while updating your profile."
      },
      "fields": {
        "username": "Nombre de usuario",
        "email": {
          "label": "Email",
          "cannotBeChanged": "This email cannot be changed"
        },
        "phoneNumber": "Número de teléfono",
        "position": {
          "label": "Posición",
          "placeholder": "Introduce tu posición"
        },
        "role": {
          "label": "Rol",
          "placeholder": "Selecciona tu rol",
          "options": {
            "owner": "Propietario",
            "admin": "Admin",
            "manager": "Manager", 
            "chef": "Chef",
            "waiter": "Waiter",
            "barman": "Bartender"
          }
        }
      },
      "selectRole": "Select Role",
      "saving": "Guardando...",
      "saveChanges": "Guardar cambios"
    },
    "appearance": {
      "title": "Apariencia",
      "description": "Personaliza la apariencia de la app",
      "modes": {
        "light": {
          "label": "Light Mode"
        },
        "dark": {
          "label": "Dark Mode"
        },
        "system": {
          "label": "System Default"
        }
      },
      "actions": {
        "save": "Guardar cambios",
        "saving": "Guardando...",
        "saved": {
          "title": "Apariencia actualizada",
          "description": "Tu preferencia de apariencia se actualizó correctamente."
        },
        "failed": {
          "title": "Actualización fallida",
          "description": "Error al actualizar la apariencia"
        }
      }
    },
    "language": {
      "title": "Idioma",
      "description": "Selecciona tu idioma preferido para la app",
      "languages": {
        "en": "Inglés",
        "es": "Español",
        "pt": "Portugués"
      },
      "actions": {
        "submit": "Guardar cambios",
        "saving": "Guardando...",
        "profileUpdated": "Preferencia de idioma actualizada",
        "profileUpdateSuccess": "Tu preferencia de idioma se actualizó correctamente.",
        "profileUpdateFailed": "Actualización fallida",
        "profileUpdateError": "Error al actualizar tu preferencia de idioma."
      }
    },
    "notifications": {
      "title": "Notificaciones",
      "description": "Gestiona tus preferencias de notificaciones y métodos de entrega",
      "types": {
        "title": "Tipos de notificaciones",
        "newOrders": {
          "label": "Nuevos pedidos",
          "description": "Recibe notificaciones por los nuevos pedidos"
        },
        "orderUpdates": {
          "label": "Actualizaciones de pedidos",
          "description": "Obtén actualizaciones sobre el estado de los pedidos existentes"
        },
        "inventoryAlerts": {
          "label": "Alertas de inventario",
          "description": "Notificaciones sobre el stock bajo o cambios en el inventario"
        },
        "systemAnnouncements": {
          "label": "Anuncios del sistema",
          "description": "Actualizaciones importantes y anuncios del sistema"
        },
        "dailyReports": {
          "label": "Informes diarios",
          "description": "Recibe informes diarios"
        }
      },
      "deliveryMethods": {
        "title": "Métodos de entrega",
        "emailNotifications": {
          "label": "Notificaciones por email",
          "description": "Recibe notificaciones por email"
        },
        "pushNotifications": {
          "label": "Notificaciones push",
          "description": "Recibe alertas en tiempo real en tu dispositivo"
        },
        "soundAlerts": {
          "label": "Alertas de sonido",
          "description": "Reproduce sonidos de notificación cuando ocurren nuevos eventos"
        }
      },
      "actions": {
        "submit": "Guardar cambios",
        "submitting": "Guardando...",
        "profileUpdated": "Preferencia de notificaciones actualizada",
        "profileUpdateSuccess": "Tu preferencia de notificaciones se actualizó correctamente.",
        "profileUpdateFailed": "Actualización fallida",
        "profileUpdateError": "Error al actualizar tu preferencia de notificaciones."
      }
    },
    "userProfile": {
      "title": "Perfil de usuario",
      "username": "Nombre de usuario",
      "email": "Email",
      "role": "Rol",
      "phoneNumber": "Número de teléfono",
      "position": "Posición"
    },
    "establishment": {
      "title": "Establecimiento",
      "description": "Gestiona tus configuraciones y información del establecimiento",
      "name": "Nombre del establecimiento",
      "address": "Dirección",
      "phone": "Número de teléfono",
      "email": "Email",
      "logo": "Logo",
      "favicon": "Favicon",
      "timezone": "Zona horaria",
      "currency": "Moneda",
      "language": "Idioma",
      "businessInfo": "Información del negocio",
      "fields": {
        "name": "Nombre del restaurante",
        "address": "Dirección",
        "phone": "Número de teléfono",
        "email": "Email",
        "openingHours": "Horario de apertura",
        "taxId": "ID Fiscal / CNPJ"
      },
      "actions": {
        "submit": "Guardar cambios",
        "submitting": "Guardando...",
        "save": "Guardar cambios",
        "saving": "Guardando...",
        "saved": "Información del establecimiento guardada exitosamente",
        "error": "Error al guardar la información del establecimiento",
        "establishmentUpdated": "Configuración del establecimiento actualizada",
        "establishmentUpdateSuccess": "Tus configuraciones del establecimiento se actualizaron correctamente.",
        "establishmentUpdateFailed": "Actualización fallida",
        "establishmentUpdateError": "Error al actualizar tus configuraciones del establecimiento."
      }
    },
    "security": {
      "title": "Seguridad",
      "description": "Gestiona tus configuraciones y preferencias de seguridad",
      "password": "Contraseña",
      "changePassword": "Cambiar contraseña",
      "currentPassword": "Contraseña actual",
      "newPassword": "Nueva contraseña",
      "confirmPassword": "Confirmar contraseña",
      "updatePassword": "Actualizar contraseña",
      "updating": "Actualizando...",
      "cancel": "Cancelar",
      "passwordMismatch": "Las contraseñas no coinciden",
      "passwordTooShort": "La contraseña debe tener al menos 6 caracteres",
      "passwordUpdated": "Contraseña actualizada exitosamente",
      "passwordUpdateError": "Error al actualizar contraseña",
      "twoFactor": "Autenticación de dos factores",
      "twoFactorDescription": "Añade una capa extra de seguridad a tu cuenta",
      "enableTwoFactor": "Habilitar autenticación de dos factores",
      "twoFactorInfo": "Requiere un código al iniciar sesión desde un nuevo dispositivo",
      "twoFactorComingSoon": "Autenticación de dos factores próximamente",
      "loginHistory": "Historial de inicio de sesión",
      "loginHistoryComingSoon": "Historial de inicio de sesión próximamente",
      "deleteAccount": "Eliminar cuenta",
      "deleteAccountWarning": "Esta acción es irreversible. Todos tus datos serán eliminados permanentemente.",
      "deleteAccountButton": "Eliminar cuenta",
      "confirmDelete": "Confirmar eliminación",
      "deleting": "Eliminando...",
      "accountDeleted": "Cuenta eliminada exitosamente",
      "deleteAccountError": "Error al eliminar cuenta",
      "passwordRequired": "Se requiere contraseña",
      "enterPassword": "Ingresa tu contraseña para confirmar",
      "actions": {
        "submit": "Guardar cambios",
        "submitting": "Guardando...",
        "securityUpdated": "Configuración de seguridad actualizada",
        "securityUpdateSuccess": "Tus configuraciones de seguridad se actualizaron correctamente.",
        "securityUpdateFailed": "Actualización fallida",
        "securityUpdateError": "Error al actualizar tus configuraciones de seguridad."
      }
    },
    "sessionHistory": {
      "title": "Historial de Sesiones",
      "description": "Ver historial de inicio/cierre de sesión y horas trabajadas del equipo",
      "noPermission": "No tienes permiso para ver el historial de sesiones",
      "filters": "Filtros",
      "filterByUser": "Filtrar por usuario",
      "filterByStatus": "Filtrar por estado",
      "startDate": "Fecha de inicio",
      "endDate": "Fecha de fin",
      "allUsers": "Todos los usuarios",
      "allStatuses": "Todos los estados",
      "clearFilters": "Limpiar filtros",
      "refresh": "Actualizar",
      "noSessions": "No se encontraron sesiones",
      "active": "Activo",
      "completed": "Completado",
      "login": "Inicio",
      "logout": "Cierre",
      "duration": "Duración",
      "role": "Rol",
      "device": "Dispositivo"
    },
    "billing": {
      "title": "Facturación",

      "description": "Gestiona tus configuraciones y preferencias de facturación",
      "businessInfo": "Información del negocio",
      "paymentMethod": "Método de pago",
      "billingHistory": "Historial de facturación",
      "cardNumber": "Número de tarjeta",
      "expirationDate": "Fecha de expiración",
      "cvv": "CVV",
      "actions": {
        "submit": "Guardar cambios",
        "submitting": "Guardando...",
        "billingUpdated": "Configuración de facturación actualizada",
        "billingUpdateSuccess": "Tus configuraciones de facturación se actualizaron correctamente.",
        "billingUpdateFailed": "Actualización fallida",
        "billingUpdateError": "Error al actualizar tus configuraciones de facturación."
      }
    }
  },

  "orderForm": {
    "title": "Crear Pedido",
    "selectTable": "Seleccionar Mesa",
    "noTableSelected": "No mesa seleccionada",
    "menuCategories": {
      "title": "Categorias del Menu"
    },
    "menuItems": {
      "search": "Buscar items",
      "noResults": "No items encontrados"
    },
    "orderDetails": {
      "title": "Detalles del Pedido",
      "items": "Items del Pedido",
      "total": "Total",
      "subtotal": "Subtotal",
      "discount": "Descuento",
      "tax": "Impuesto",
      "noItems": "No items agregados"
    },
    "selectCategory": "Seleccionar Categoria",
    "selectItem": "Seleccionar Item",
    "quantity": "Cantidad",
    "notes": "Notas",
    "addItem": "Agregar Item",
    "orderItems": "Items del Pedido",
    "noItemsAdded": "No items agregados",
    "dietaryRestrictions": {
      "title": "Restricciones Dietéticas",
      "vegetarian": "Vegetariano",
      "vegan": "Vegano",
      "glutenFree": "Sin gluten",
      "lactoseFree": "Sin lactosa"
    },
    "specialInstructions": {
      "label": "Instrucciones Especiales",
      "hasInstructions": "Tiene instrucciones especiales?"
    }
  },

  "tableCard": {
    "label": {
      "available": "Disponible",
      "occupied": "Ocupada",
      "reserved": "Reservada"
    },
    "status": {
      "noActiveOrder": "No hay pedido activo"
    },
    "actions": {
      "createOrder": "Crear Pedido",
      "changeStatus": "Cambiar Estado",
      "viewOrder": "Ver Pedido",
      "closeOrder": "Cerrar Pedido",
      "addItems": "Agregar Items"
    },
    "errors": {
      "sync": "Error al sincronizar el estado de la mesa",
      "closeOrder": "Error al cerrar el pedido"
    }
  },

  "paymentMethods": {
    "cash": "Efectivo",
    "credit": "Tarjeta de Credito",
    "debit": "Tarjeta de Debito",
    "transfer": "Transferencia Bancaria",
    "other": "Otros"
  },
  "table": {
    "emptyState": {
      "title": "No hay pedidos",
      "description": "Actualmente no hay pedidos en el sistema. Comienza creando nuevos pedidos para verlos aqui."
    },
    "loading": "Cargando pedidos..."
  },
  "categories": {
    "appetizers": "Entradas",
    "desserts": "Postres",
    "drinks": "Bebidas",
    "main_courses": "Platos principales",
    "salads": "Ensaladas",
    "sides": "Guarniciones"
  },
  "roles": {
    "owner": "Dueño",
    "admin": "Admin", 
    "manager": "Gerente",
    "staff": "Personal",
    "waiter": "Mesero",
    "barman": "Bartender",
    "default": "Usuario"
  },
  "invitation": {
    "invalid": "Invitación inválida",
    "expired": "La invitación ha expirado",
    "error": "Error al obtener la invitación",
    "register": {
      "title": "Registrarse",
      "description": "Has sido invitado a unirte a {{establishmentName}}"
    }
  },
  "cashRegister": {
    "title": "Caja",
    "description": "Gestionar la apertura y cierre de caja de tu establecimiento",
    "noPermission": "No tienes permiso para gestionar la caja",
    "registerOpen": "Caja abierta",
    "registerClosed": "Caja cerrada",
    "registerClosedDescription": "No hay una caja abierta actualmente",
    "openRegister": "Abrir caja",
    "closeRegister": "Cerrar caja",
    "openingAmount": "Monto de apertura",
    "totalSales": "Ventas totales",
    "expectedTotal": "Total esperado",
    "closingAmount": "Monto de cierre",
    "difference": "Diferencia",
    "paymentBreakdown": "Desglose por tipo de pago",
    "expectedTotals": "Totales esperados",
    "actualAmounts": "Montos reales",
    "differences": "Diferencias",
    "cash": "Efectivo",
    "credit": "Crédito",
    "debit": "Débito",
    "transfer": "Transferencia",
    "notes": "Notas",
    "notesPlaceholder": "Agrega notas o observaciones...",
    "closingNotes": "Notas de cierre",
    "closingNotesPlaceholder": "Agrega notas sobre el cierre de caja...",
    "openedBy": "Abierta por",
    "closedBy": "Cerrada por",
    "open": "Abierta",
    "closed": "Cerrada",
    "history": "Historial de cajas",
    "noHistory": "No hay historial de cajas",
    "cancel": "Cancelar",
    "confirm": "Confirmar"
  },

  landing: landingEs,
};

export const esTranslations = mergeTranslations(esTranslationsBase, supplementalEs)

export default esTranslations;