export const esTranslations = {
  "commons": {
    "yes": "Sí",
    "no": "No",
    "cancel": "Cancelar",
    "confirm": "Confirmar",
    "save": "Guardar",
    "edit": "Editar",
    "delete": "Eliminar",
    "success": "Éxito",
    "warning": "Advertencia",
    "search": "Buscar",
    "filter": "Filtrar",
    "actions": "Acciones",
    "button": {
      "add": "Agregar",
      "edit": "Editar",
      "delete": "Eliminar",
      "cancel": "Cancelar",
      "save": "Guardar",
      "submit": "Enviar",
      "loading": "Cargando...",
      "sending": "Enviando...",
      "create": "Crear",
      "created": "Creado"
    },
    "status": {
      "lowStock": "Bajo Stock",
      "inStock": "En Stock",
      "outOfStock": "Sin Stock"
    },
    "table": {
      "headers": {
        "name": "Nombre",
        "category": "Categoría",
        "quantity": "Cantidad",
        "unit": "Unidad",
        "minQuantity": "Cant. Mínima",
        "price": "Precio",
        "status": "Estado",
        "actions": "Acciones"
      },
      "pagination": {
        "rowsPerPage": "Filas por página",
        "of": "de",
        "first": "Primera",
        "last": "Última",
        "next": "Siguiente",
        "previous": "Anterior"
      },
      "noData": "No hay datos disponibles",
      "loading": "Cargando datos...",
      "emptyState": {
        "title": "No hay registros",
        "description": "Aún no se han agregado registros"
      }
    },
    "error": {
      "generic": "Ha ocurrido un error",
      "required": "Este campo es obligatorio",
      "invalid": "Entrada inválida",
      "configurationError": "Error de configuración de Firebase. Por favor, contacte al soporte",
      "serviceUnavailable": "Servicio de autenticación no disponible. Inténtelo de nuevo más tarde"
    },
    "loading": "Cargando...",
    "noItemsFound": "No se encontraron elementos",
    "searchPlaceholder": "Buscar...",
    "confirmDelete": "¿Está seguro que desea eliminar este elemento? Esta acción no se puede deshacer.",
    "currency": "{{value}}",
    "password": "Contraseña",
    "emailRequired": "El correo electrónico es obligatorio",
    "passwordRequired": "La contraseña es obligatoria",
    "login": {
      "error": {
        "emailRequired": "El correo electrónico es obligatorio",
        "passwordRequired": "La contraseña es obligatoria",
        "invalidCredentials": "Correo electrónico o contraseña inválidos",
        "tooManyAttempts": "Demasiados intentos fallidos. Inténtelo de nuevo más tarde."
      }
    }
  },

  "login": {
    "title": "Iniciar Sesión",
    "description": "Ingrese sus credenciales para acceder a su cuenta",
    "email": "Correo Electrónico",
    "password": "Contraseña",
    "login": "Iniciar Sesión",
    "forgotPassword": "¿Olvidó su contraseña?",
    "error": {
      "invalidCredentials": "Correo electrónico o contraseña inválidos",
      "tooManyAttempts": "Demasiados intentos de inicio de sesión. Inténtelo de nuevo más tarde.",
      "emailRequired": "El correo electrónico es obligatorio",
      "passwordRequired": "La contraseña es obligatoria",
      "serviceUnavailable": "Servicio de autenticación no disponible. Inténtelo de nuevo más tarde"
    }
  },

  "register": {
    "title": "Registrarse",
    "description": "Crear una nueva cuenta para acceder al sistema de gestión de restaurantes",
    "username": "Nombre de Usuario",
    "email": "Correo Electrónico",
    "password": "Contraseña",
    "confirmPassword": "Confirmar Contraseña",
    "submit": "Registrarse",
    "error": {
      "passwordsDoNotMatch": "Las contraseñas no coinciden",
      "emailInUse": "Este correo electrónico ya está en uso",
      "weakPassword": "La contraseña es muy débil"
    }
  },

  "forgotPassword": {
    "title": "Recuperar Contraseña",
    "description": "Ingrese su correo electrónico para recibir instrucciones de restablecimiento de contraseña",
    "email": "Correo Electrónico",
    "sendInstructions": "Enviar Instrucciones",
    "error": {
      "emailRequired": "El correo electrónico es obligatorio",
      "userNotFound": "No se encontró ninguna cuenta con esta dirección de correo electrónico",
      "generic": "Error al enviar correo de restablecimiento"
    },
    "success": {
      "emailSent": "Instrucciones de restablecimiento de contraseña enviadas"
    }
  },

  "orders": {
    "title": "Pedidos",
    "newOrder": "Nuevo Pedido",
    "noOrdersFound": "No se encontraron pedidos",
    "search": {
      "placeholder": "Buscar pedidos por ID, mesa o mesero",
      "filterByStatus": "Filtrar por estado",
      "filterByWaiter": "Filtrar por mesero"
    },
    "filters": {
      "allStatuses": "Todos los estados",
      "noOrdersFound": "No se encontraron pedidos"
    },
    "table": {
      "headers": {
        "id": "ID",
        "tableNumber": "Número de Mesa",
        "waiter": "Mesero",
        "items": "Artículos",
        "status": "Estado",
        "total": "Total",
        "actions": "Acciones"
      },
      "placeholders": {
        "searchOrders": "Buscar pedidos por ID, mesa o mesero",
        "selectStatus": "Seleccionar estado",
        "selectWaiter": "Seleccionar mesero"
      }
    },
    "status": {
      "pending": "Pendiente",
      "preparing": "En preparación",
      "ready": "Listo",
      "served": "Servido",
      "cancelled": "Cancelado",
      "completed": "Completado",
      "delivered": "Entregado",
      "closed": "Cerrado",
      "finished": "Finalizado",
      "ordering": "En Pedido"
    },
    "actions": {
      "view": "Ver",
      "edit": "Editar",
      "delete": "Eliminar",
      "cancel": "Cancelar",
      "updateStatus": "Actualizar Estado",
      "createOrder": "Crear Pedido"
    },
    "action": {
      "updateStatus": "Actualizar Estado",
      "updatedTo": "Actualizado a",
      "updateStatusDescription": "Seleccione el nuevo estado para el pedido {{orderId}}",
      "selectStatus": "Seleccionar Estado",
      "delete": "Eliminar",
      "deleted": "Eliminado",
      "deleteConfirmation": "¿Está seguro de que desea eliminar el pedido {{orderId}}?"
    },
    "errors": {
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
      "statusUpdated": "Estado del pedido actualizado exitosamente"
    },
    "dialogs": {
      "updateStatus": {
        "title": "Actualizar Estado del Pedido",
        "description": "Seleccione el nuevo estado para el pedido {{orderId}}",
        "selectStatus": "Seleccionar Estado"
      },
      "deleteOrder": {
        "title": "Eliminar Pedido",
        "description": "¿Está seguro de que desea eliminar el pedido {{orderId}}? Esta acción no se puede deshacer.",
        "confirmButton": "Eliminar Pedido",
        "cancelButton": "Cancelar"
      }
    }
  },

  "users": {
    "pageTitle": "Usuarios",
    "addUser": "Agregar Usuario",
    "userList": "Lista de Usuarios",
    "searchPlaceholder": "Buscar usuarios...",
    "noUsers": "No se encontraron usuarios",
    "username": "Nombre de Usuario",
    "email": "Correo Electrónico",
    "role": "Rol",
    "status": "Estado",
    "actions": "Acciones",
    "openMenu": "Abrir menú",
    "copyId": "Copiar ID",
    "userStatus": {
      "active": "Activo",
      "inactive": "Inactivo",
      "suspended": "Suspendido"
    },
    "roles": {
      "admin": "Administrador",
      "manager": "Gerente",
      "staff": "Personal"
    },
    "errors": {
      "fetchUsers": "Error al cargar usuarios",
      "createUser": "Error al crear usuario",
      "updateUser": "Error al actualizar usuario",
      "deleteUser": "Error al eliminar usuario"
    },
    "success": {
      "userCreated": "Usuario creado con éxito",
      "userUpdated": "Usuario actualizado con éxito",
      "userDeleted": "Usuario eliminado con éxito"
    },
    "form": {
      "createTitle": "Crear Nuevo Usuario",
      "editTitle": "Editar Usuario",
      "labels": {
        "username": "Nombre de Usuario",
        "email": "Correo Electrónico",
        "role": "Rol",
        "status": "Estado",
        "password": "Contraseña",
        "confirmPassword": "Confirmar Contraseña"
      },
      "placeholders": {
        "username": "Ingrese el nombre de usuario",
        "email": "Ingrese el correo electrónico",
        "role": "Seleccione el rol",
        "status": "Seleccione el estado",
        "password": "Ingrese la contraseña",
        "confirmPassword": "Confirme la contraseña"
      },
      "validation": {
        "usernameRequired": "El nombre de usuario es obligatorio",
        "emailRequired": "El correo electrónico es obligatorio",
        "emailInvalid": "Correo electrónico inválido",
        "roleRequired": "El rol es obligatorio",
        "statusRequired": "El estado es obligatorio",
        "passwordRequired": "La contraseña es obligatoria",
        "passwordMinLength": "La contraseña debe tener al menos 8 caracteres",
        "passwordsMatch": "Las contraseñas deben coincidir"
      }
    }
  },

  "tables": {
    "pageTitle": "Mesas",
    "dialog": {
      "title": "Configurar Mesa",
      "description": "Agregar o editar detalles de la mesa",
      "tableName": {
        "label": "Nombre de la Mesa",
        "placeholder": "Ej: Mesa 1, Mesa VIP"
      },
      "tableCapacity": {
        "label": "Capacidad de la Mesa",
        "placeholder": "Número de personas",
        "min": 1,
        "max": 20
      },
      "status": {
        "label": "Estado de la Mesa",
        "options": {
          "available": "Disponible",
          "occupied": "Ocupada",
          "reserved": "Reservada",
          "cleaning": "Limpiando"
        }
      },
      "location": {
        "label": "Ubicación",
        "placeholder": "Área o sección del restaurante"
      },
      "buttons": {
        "save": "Guardar Mesa",
        "cancel": "Cancelar",
        "edit": "Editar Mesa",
        "delete": "Eliminar Mesa"
      }
    },
    "tableMap": {
      "title": "Mapas de Mesas",
      "description": "Administre los diseños de mesas de su restaurante",
      "addNew": "Agregar Nuevo Mapa",
      "edit": "Editar Mapa",
      "delete": "Eliminar Mapa"
    },
    "errors": {
      "tableNameRequired": "El nombre de la mesa es obligatorio",
      "invalidCapacity": "Capacidad inválida",
      "saveError": "Error al guardar la mesa",
      "deleteError": "Error al eliminar la mesa"
    },
    "success": {
      "tableSaved": "Mesa guardada con éxito",
      "tableDeleted": "Mesa eliminada con éxito"
    },
    "title": "Mesas",
    "tableMaps": {
      "title": "Mapas de Mesas",
      "createMap": "Crear Mapa de Mesas",
      "noMapsFound": "No se encontraron mapas de mesas",
      "mapName": "Nombre del Mapa",
      "mapDescription": "Descripción del Mapa",
      "viewMap": "Ver Mapa",
      "addTable": "Agregar Mesa",
      "noDescription": "Sin descripción"
    },
    "actions": "Acciones",
    "status": {
      "available": "Disponible",
      "occupied": "Ocupada",
      "reserved": "Reservada"
    }
  },

  "dialog": {
    "confirm": {
      "title": "Confirmar Acción",
      "description": "¿Está seguro de que desea realizar esta acción?",
      "confirmButton": "Confirmar",
      "cancelButton": "Cancelar"
    },
    "delete": {
      "title": "Eliminar Registro",
      "description": "¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer.",
      "confirmButton": "Eliminar",
      "cancelButton": "Cancelar"
    }
  },

  "settings": {
    "title": "Configuraciones",
    "profile": {
      "title": "Perfil",
      "description": "Administre su información personal y configuraciones de cuenta",
      "personalInfo": "Información Personal",
      "accountSettings": "Configuraciones de Cuenta"
    },
    "notifications": {
      "title": "Notificaciones",
      "description": "Administre sus preferencias de notificación",
      "emailNotifications": "Notificaciones por Correo Electrónico",
      "pushNotifications": "Notificaciones Push",
      "smsNotifications": "Notificaciones por SMS"
    },
    "language": {
      "title": "Idioma",
      "description": "Seleccione su idioma preferido para la aplicación",
      "currentLanguage": "Idioma Actual",
      "availableLanguages": {
        "portuguese": "Portugués",
        "spanish": "Español", 
        "english": "Inglés"
      }
    },
    "appearance": {
      "title": "Apariencia",
      "description": "Personalice la apariencia de la aplicación",
      "theme": {
        "light": "Claro",
        "dark": "Oscuro",
        "system": "Sistema"
      },
      "colorScheme": "Esquema de Colores"
    },
    "system": {
      "title": "Sistema",
      "description": "Configuraciones avanzadas del sistema",
      "dataUsage": "Uso de Datos",
      "performanceSettings": "Configuraciones de Rendimiento",
      "resetSettings": "Restablecer Configuraciones"
    },
    "buttons": {
      "save": "Guardar Cambios",
      "cancel": "Cancelar",
      "reset": "Restablecer"
    },
    "success": {
      "settingsSaved": "Configuraciones guardadas con éxito",
      "settingsReset": "Configuraciones restablecidas con éxito"
    },
    "errors": {
      "saveSettings": "Error al guardar configuraciones",
      "resetSettings": "Error al restablecer configuraciones"
    }
  },

  "orderForm": {
    "title": "Crear Pedido",
    "selectTable": "Seleccione una Mesa",
    "noTableSelected": "Ninguna mesa seleccionada",
    "menuCategories": {
      "title": "Categorías del Menú"
    },
    "menuItems": {
      "search": "Buscar artículos",
      "noResults": "No se encontraron artículos"
    },
    "orderDetails": {
      "title": "Detalles del Pedido",
      "items": "Artículos del Pedido",
      "total": "Total",
      "subtotal": "Subtotal",
      "discount": "Descuento",
      "tax": "Impuesto",
      "noItems": "Ningún artículo agregado"
    },
    "customerInfo": {
      "title": "Información del Cliente",
      "name": {
        "label": "Nombre del Cliente",
        "placeholder": "Ingrese el nombre del cliente"
      },
      "contact": {
        "label": "Contacto",
        "placeholder": "Teléfono o correo electrónico"
      }
    },
    "paymentInfo": {
      "title": "Información de Pago",
      "method": {
        "label": "Método de Pago",
        "options": {
          "cash": "Efectivo",
          "creditCard": "Tarjeta de Crédito",
          "debitCard": "Tarjeta de Débito",
          "pix": "PIX"
        }
      },
      "splitBill": {
        "label": "Dividir Cuenta",
        "description": "Dividir el total entre varios pagos"
      }
    },
    "orderStatus": {
      "title": "Estado del Pedido",
      "options": {
        "pending": "Pendiente",
        "preparing": "En Preparación",
        "ready": "Listo",
        "delivered": "Entregado",
        "cancelled": "Cancelado"
      }
    },
    "actions": {
      "addItem": "Agregar Artículo",
      "removeItem": "Eliminar Artículo",
      "createOrder": "Crear Pedido",
      "updateOrder": "Actualizar Pedido",
      "cancelOrder": "Cancelar Pedido",
      "printOrder": "Imprimir Pedido",
      "generateQR": "Generar Código QR"
    },
    "errors": {
      "tableRequired": "Seleccione una mesa",
      "itemsRequired": "Agregue al menos un artículo al pedido",
      "invalidTotal": "Total del pedido inválido",
      "createOrderFailed": "Error al crear pedido",
      "updateOrderFailed": "Error al actualizar pedido"
    },
    "success": {
      "orderCreated": "Pedido creado con éxito",
      "orderUpdated": "Pedido actualizado con éxito",
      "orderCancelled": "Pedido cancelado con éxito"
    }
  },

  "dashboard": {
    "title": "Panel de Control",
    "salesOverview": {
      "title": "Resumen de Ventas",
      "description": "Ventas totales y rendimiento",
      "totalSales": "Ventas Totales",
      "monthlyGrowth": "+{percentage}% desde el mes pasado"
    },
    "topSellingItems": {
      "title": "Artículos Más Vendidos",
      "description": "Artículos más populares",
      "orderCount": "{{count, number}} pedidos"
    },
    "stockLevel": {
      "title": "Niveles de Inventario",
      "description": "Estado del inventario",
      "percentage": "{percentage}%",
      "lowStockItems": "{count} artículos con stock bajo",
      "totalItems": "Total de Artículos",
      "inStock": "En Stock",
      "lowStock": "Bajo Stock",
      "status": {
        "critical": "Stock Crítico",
        "warning": "Stock Bajo",
        "healthy": "Stock Saludable"
      }
    },
    "recentOrders": "Pedidos Recientes",
    "categories": "Categorías",
    "errors": {
      "fetchFailed": "No se pudieron cargar los datos del panel. Inténtelo de nuevo más tarde."
    }
  },

  "sidebar": {
    "appName": "Comandero",
    "dashboard": "Panel de Control",
    "orders": "Pedidos",
    "tables": "Mesas",
    "inventory": "Inventario",
    "users": "Usuarios",
    "settings": "Configuraciones",
    "advancedReports": "Informes Avanzados",
    "logout": "Cerrar Sesión",
    "language": "Idioma",
    "installApp": "Instalar Aplicación",
    "languages": {
      "english": "Inglés",
      "spanish": "Español", 
      "portuguese": "Portugués"
    }
  }
};

export default esTranslations;