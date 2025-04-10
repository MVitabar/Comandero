export const esTranslations = {
  // Commons Translations
  "commons": {
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
        "invalidCredentials": "Correo electrónico o contraseña inválidos",
        "tooManyAttempts": "Demasiados intentos fallidos. Inténtelo de nuevo más tarde.",
        "unknown": "Ocurrió un error desconocido"
      },
      "button": {
        "loggingIn": "Iniciando Sesión"
      }
    },
    "passwordVisibility": {
      "show": "Mostrar Contraseña",
      "hide": "Ocultar Contraseña"
    },
    "forgotPassword": "Recuperar Contraseña",
    "register": "Registrarse",
    "registerPrompt": "¿No tiene una cuenta? Regístrese",
    "auth": {
      "serviceUnavailable": "Servicio de autenticación no disponible"
    }
  },

  "tableMapSettings": {
    "title": "Mapas de Mesas",
    "description": "Administre y configure los mapas de mesas de su restaurante",
    "actions": {
      "create": "Crear",
      "cancel": "Cancelar",
      "createTableMap": "Crear Mapa de Mesas",
      "viewTableMap": "Ver Mapa de Mesas",
      "editTableMap": "Editar Mapa de Mesas",
      "deleteTableMap": "Eliminar Mapa de Mesas"
    },
    "form": {
      "mapName": {
        "label": "Nombre del Mapa",
        "placeholder": "Ingrese el nombre del mapa"
      },
      "mapDescription": {
        "label": "Descripción del Mapa",
        "placeholder": "Ingrese la descripción del mapa"
      }
    },
    "empty": {
      "title": "No se Encontraron Mapas de Mesas",
      "description": "Cree su primer mapa de mesas para comenzar"
    },
    "notifications": {
      "mapCreated": "Mapa de Mesas Creado",
      "mapUpdated": "Mapa de Mesas Actualizado",
      "mapDeleted": "Mapa de Mesas Eliminado",
      "mapCreationFailed": "Error al Crear el Mapa de Mesas",
      "mapUpdateFailed": "Error al Actualizar el Mapa de Mesas",
      "mapDeletionFailed": "Error al Eliminar el Mapa de Mesas"
    }
  },

  "tables": {
    "tableMaps": {
      "viewMap": "Ver Mapa de Mesas",
      "addMap": "Agregar Mapa de Mesas",
      "editMap": "Editar Mapa de Mesas",
      "deleteMap": "Eliminar Mapa de Mesas"
    }
  },

  

  "dashboard": {
    "title": "Panel de Control",
    "salesOverview": {
      "title": "Resumen de Ventas",
      "description": "Resumen de ventas diarias",
      "totalSales": "Ventas Totales: {{amount}}",
      "monthlyGrowth": "+{{percentage}}% desde el mes pasado",
      "dailySalesTrend": "Ventas del Día {{day}}: {{amount}}",
      "dailySalesTrendFormat": "Día {{day}}: {{amount}}"
    },
    "topSellingItems": {
      "title": "Artículos Más Vendidos",
      "description": "Artículos más populares",
      "orderCount": "{{count, number}} pedidos"
    },
    "stockLevel": {
      "title": "Estado del Inventario",
      "description": "Niveles de stock actuales",
      "percentage": "{{percentage}}%",
      "lowStockItems": "{{count, number}} artículos con stock bajo"
    },
    "recentOrders": "Pedidos Recientes",
    "salesTrend": "Tendencia de Ventas",
    "quickActions": {
      "title": "Acciones Rápidas",
      "newOrder": "Nuevo Pedido",
      "addInventoryItem": "Agregar Artículo",
      "createReport": "Crear Informe"
    },
    "recentActivity": {
      "title": "Actividad Reciente",
      "noActivity": "No hay actividad reciente",
      "viewAll": "Ver Todo"
    },
    "performanceMetrics": {
      "title": "Métricas de Rendimiento",
      "averageOrderValue": "Valor Promedio de Pedido",
      "topSellingItems": "Artículos Más Vendidos",
      "salesTrend": "Tendencia de Ventas"
    },
    "alerts": {
      "lowStock": "Artículos con Bajo Stock",
      "outOfStock": "Artículos Sin Stock"
    },
    "buttons": {
      "export": "Exportar",
      "import": "Importar"
    },
    "errors": {
      "fetchFailed": "Error al cargar datos",
      "noData": "No hay datos disponibles"
    }
  },

  "inventory": {
    "pageTitle": "Gestión de Inventario",
    "searchPlaceholder": "Buscar en inventario...",
    "noItemsFound": "No se encontraron artículos en el inventario",
    "noItems": "No hay artículos en el inventario",
    "noMatchingItems": "No se encontraron artículos",
    "formLabels": {
      "name": "Nombre",
      "category": "Categoría", 
      "quantity": "Cantidad",
      "unit": "Unidad",
      "minQuantity": "Cantidad Mínima",
      "price": "Precio",
      "status": "Estado",
      "actions": "Acciones"
    },
    "status": {
      "lowStock": "Bajo Stock",
      "inStock": "En Stock"
    },
    "actions": {
      "edit": "Editar",
      "delete": "Eliminar"
    },
    "categories": {
      "drinks": "Bebidas",
      "food": "Comida",
      "menu_item": "Item de Menú"
    },
    "addItem": {
      "title": "Agregar Artículo",
      "description": "Agregar un nuevo artículo al inventario",
      "namePlaceholder": "Ingrese el nombre del artículo",
      "categoryPlaceholder": "Seleccione la categoría del artículo",
      "quantityPlaceholder": "Ingrese la cantidad",
      "unitPlaceholder": "Ingrese la unidad (ej. kg, pzs)",
      "minQuantityPlaceholder": "Ingrese la cantidad mínima de stock",
      "pricePlaceholder": "Ingrese el precio del artículo",
      "cancel": "Cancelar",
    },
    "editItem": {
      "title": "Editar Artículo",
      "description": "Modificar los detalles de un artículo de inventario existente",
      "cancel": "Cancelar"
    },
    "deleteItem": {
      "description": "¿Está seguro de que desea eliminar {{itemName}}? Esta acción no se puede deshacer.",
      "successToast": "Artículo Eliminado",
      "successDescription": "El artículo de inventario se eliminó correctamente.",
      "errorToast": "Error al Eliminar",
      "errorDescription": "Hubo un error al eliminar el artículo de inventario."
    },
    "buttons": {
      "addItem": "Agregar Artículo",
      "editItem": "Editar Artículo",
      "cancel": "Cancelar",
      "export": "Exportar Inventario",
      "import": "Importar Inventario"
    },
    "errors": {
      "fetchItems": "Error al recuperar artículos de inventario",
      "addItem": "Error al agregar artículo de inventario",
      "deleteItem": "Error al eliminar artículo de inventario",
      "lowStock": "Algunos artículos tienen stock bajo",
      "outOfStock": "Algunos artículos están agotados"
    },
    "alerts": {
      "lowStock": "Artículos con stock bajo",
      "outOfStock": "Artículos agotados"
    },
    "initialLoad": {
      "success": "Artículos del menú cargados con éxito",
      "description": "{{count}} artículos fueron agregados al inventario",
      "error": "Error al cargar artículos iniciales"
    }
  },

  "settings": {
    "title": "Configuraciones",
    "description": "Administre su información personal y configuración de cuenta",
    "profile": {
      "title": "Perfil",
      "description": "Administre su información personal y configuración de cuenta",
      "fields": {
        "username": "Nombre de Usuario",
        "email": {
          "label": "Correo Electrónico",
          "cannotBeChanged": "La dirección de correo electrónico no puede ser modificada"
        },
        "phoneNumber": "Número de Teléfono",
        "position": {
          "label": "Posición",
          "placeholder": "Ingrese su puesto de trabajo"
        },
        "role": {
          "label": "Rol",
          "placeholder": "Seleccione su rol",
          "options": {
            "admin": "Administrador",
            "manager": "Gerente", 
            "chef": "Chef",
            "waiter": "Mesero"
          }
        }
      },
      "actions": {
        "uploadPhoto": "Subir Foto",
        "submit": "Guardar Cambios",
        "submitting": "Guardando...",
        "profileUpdated": "Perfil Actualizado",
        "profileUpdateSuccess": "Su perfil ha sido actualizado correctamente.",
        "profileUpdateFailed": "Error al Actualizar Perfil",
        "profileUpdateError": "Ocurrió un error al actualizar su perfil."
      }
    },
    "notifications": {
      "title": "Notificaciones",
      "description": "Configure cómo recibe notificaciones",
      "types": {
        "title": "Tipos de Notificación",
        "newOrders": {
          "label": "Nuevos Pedidos",
          "description": "Sea notificado cuando se realicen nuevos pedidos"
        },
        "orderUpdates": {
          "label": "Actualizaciones de Pedidos", 
          "description": "Reciba actualizaciones sobre cambios en el estado de los pedidos"
        },
        "inventoryAlerts": {
          "label": "Alertas de Inventario",
          "description": "Sea informado sobre problemas de stock o inventario"
        },
        "systemAnnouncements": {
          "label": "Anuncios del Sistema",
          "description": "Reciba notificaciones importantes del sistema"
        },
        "dailyReports": {
          "label": "Informes Diarios",
          "description": "Obtenga informes de resumen diarios"
        }
      },
      "deliveryMethods": {
        "title": "Métodos de Entrega",
        "emailNotifications": {
          "label": "Notificaciones por Correo Electrónico",
          "description": "Reciba notificaciones por correo electrónico"
        },
        "pushNotifications": {
          "label": "Notificaciones Push",
          "description": "Reciba notificaciones en tiempo real en su dispositivo"
        },
        "soundAlerts": {
          "label": "Alertas de Sonido",
          "description": "Reproducir alertas de sonido para notificaciones"
        }
      },
      "frequency": {
        "immediate": "Inmediato",
        "daily": "Diario",
        "weekly": "Semanal",
        "never": "Nunca"
      },
      "actions": {
        "save": "Guardar Preferencias",
        "saving": "Guardando...",
        "submit": "Enviar",
        "saved": "Preferencias de Notificación Actualizadas",
        "saveSuccess": "Sus preferencias de notificación han sido actualizadas correctamente.",
        "saveFailed": "Error al Actualizar Preferencias de Notificación",
        "saveError": "Ocurrió un error al actualizar sus preferencias de notificación."
      }
    },
    "system": {
      "title": "Sistema",
      "description": "Configurar ajustes del sistema"
    },
    "language": {
      "title": "Idioma",
      "description": "Seleccione su idioma preferido para la aplicación",
      "languages": {
        "en": "Inglés",
        "es": "Español",
        "pt": "Portugués"
      },
      "actions": {
        "saveChanges": "Guardar Cambios",
        "saving": "Guardando...",
        "submit": "Enviar",
        "saved": "Idioma Actualizado",
        "saveSuccess": "Su preferencia de idioma ha sido actualizada correctamente."
      }
    },
    "appearance": {
      "title": "Apariencia",
      "description": "Personalice el aspecto y la sensación de la aplicación",
      "modes": {
        "light": {
          "label": "Modo Claro",
          "icon": "sun"
        },
        "dark": {
          "label": "Modo Oscuro",
          "icon": "moon"
        },
        "system": {
          "label": "Modo Sistema",
          "icon": "monitor"
        }
      },
      "actions": {
        "save": "Guardar Cambios",
        "saving": "Guardando...",
        "saved": "Preferencias de Apariencia Actualizadas",
        "saveSuccess": "Sus preferencias de apariencia han sido actualizadas correctamente.",
        "saveFailed": "Error al Actualizar Preferencias de Apariencia",
        "saveError": "Ocurrió un error al actualizar sus preferencias de apariencia."
      }
    },
   
    "deliveryMethods": {
      "title": "Métodos de Entrega",
      "emailNotifications": {
        "label": "Notificaciones por E-mail",
        "description": "Receba notificações por e-mail"
      },
      "pushNotifications": {
        "label": "Notificaciones Push",
        "description": "Receba notificações em tempo real no seu dispositivo"
      },
      "soundAlerts": {
        "label": "Alertas de Som",
        "description": "Receba alertas sonoros para notificações"
      }
    },
  },

  "login": "Iniciar Sesión",
  "loginTitle": "Iniciar Sesión",
  "loginDescription": "Ingrese sus credenciales para acceder a su cuenta",
  
  "createAccountDescription": "Crear una nueva cuenta para acceder al sistema de gestión de restaurantes",
  
  "confirmPassword": "Confirmar Contraseña",
  
  "usernameRequired": "El nombre de usuario es obligatorio",
  "usernameMinLength": "El nombre de usuario debe tener al menos 3 caracteres",
  "emailInvalid": "El correo electrónico no es válido",
  "passwordMinLength": "La contraseña debe tener al menos 8 caracteres",
  "passwordRequirements": "La contraseña debe incluir mayúsculas, minúsculas y números",
  "passwordsDoNotMatch": "Las contraseñas no coinciden",
  
  "acceptTerms": "Acepto los Términos y Condiciones",
  "acceptTermsRequired": "Debe aceptar los términos y condiciones",
  
  "registrationSuccessful": "Registro Exitoso",
  "accountCreated": "Su cuenta ha sido creada con éxito",
  "registrationFailed": "Fallo en el Registro",
  
  "emailAlreadyInUse": "El correo electrónico ya está en uso",
  "passwordTooWeak": "La contraseña es demasiado débil",
  
  "unknownError": "Ocurrió un error desconocido",
  
  "authConfigurationError": "Error de configuración de Firebase. Por favor, contacte al soporte",

  "forgotPasswordTitle": "Recuperar Contraseña",
  "forgotPasswordDescriptionInitial": "Ingrese su correo electrónico para recibir instrucciones de restablecimiento de contraseña",
  "forgotPasswordDescriptionEmailSent": "Revise su correo electrónico para obtener instrucciones de restablecimiento de contraseña",
  
  "forgotPasswordButtonSendInstructions": "Enviar Instrucciones",
  "forgotPasswordButtonSending": "Enviando...",
  "forgotPasswordButtonTryAnotherEmail": "Probar con otro correo",
  
  "forgotPasswordErrorEmailRequired": "El correo electrónico es obligatorio",
  "forgotPasswordErrorAuthServiceUnavailable": "Servicio de autenticación no disponible",
  "forgotPasswordErrorUserNotFound": "No se encontró ninguna cuenta con esta dirección de correo electrónico",
  
  "forgotPasswordSuccessEmailSent": "Instrucciones de restablecimiento de contraseña enviadas",
  
  "forgotPasswordEmailSentCheckSpam": "Si no ve el correo electrónico, revise su carpeta de spam",
  
  "forgotPasswordLoginReminder": "¿Recordó su contraseña?",
  "forgotPasswordLoginLink": "Iniciar Sesión",

  "orders": "Pedidos",
  "newOrder": "Nuevo Pedido",
  "orderStatus": {
    "01": "Pendiente",
    "02": "En preparación",
    "03": "Listo para servir",
    "04": "Entregado",
    "05": "Cancelado",
    "06": "Pagado",
    "07": "Enviado",
    "08": "En camino",
    "09": "Completado",
    "10": "Reembolsado",
    "11": "En espera",
    "12": "Programado",
    "13": "Parcialmente pagado",
    "14": "Error de pago",
    "15": "Rechazado",
    "16": "Procesando",
    "17": "Confirmado",
    "18": "Preparación iniciada",
    "19": "Casi listo",
    "20": "Esperando cliente",
    "21": "Servicio en mesa",
    "22": "Para llevar",
    "23": "Delivery",
    "24": "Reserva",
    "25": "Urgente",
    "70": "Estado final"
  },
  
  "noOrdersFound": "No se encontraron pedidos",
  "table": {
    "singular": "Mesa",
    "plural": "Mesas",
    "number": "Número de Mesa",
    "headers": {
      "id": "ID",
      "table": "Mesa",
      "waiter": "Mesero",
      "items": "Artículos",
      "total": "Total",
      "actions": "Acciones"
    }
  },
  "action": {
    "updateStatus": "Actualizar Estado",
    "updateStatusDescription": "Actualizar estado del pedido {{orderId}}",
    "selectStatus": "Seleccionar nuevo estado",
    "delete": "Eliminar Pedido",
    "deleteOrder": "Eliminar Pedido",
    "deleteOrderConfirmation": "¿Está seguro de que desea eliminar el pedido {{orderId}}?"
  },
  "error": {
    "fetchFailed": "Error al cargar los pedidos",
    "updateStatusFailed": "Error al actualizar el estado del pedido",
    "deleteFailed": "Error al eliminar el pedido"
  },
  "success": {
    "statusUpdated": "Estado del pedido actualizado",
    "orderDeleted": "Pedido eliminado"
  },

  "firebaseTestPageTitle": "Prueba de Configuración de Firebase",
  "firebaseTestPageDescription": "Pruebe su configuración de Firebase para asegurarse de que todo funcione correctamente",
  "firebaseTestFirebaseInitialized": "Firebase Inicializado",
  "firebaseTestFirebaseApp": "Aplicación Firebase",
  "firebaseTestFirebaseAuth": "Autenticación Firebase",
  "firebaseTestFirebaseFirestore": "Firestore Firebase",
  "firebaseTestRunTests": "Ejecutar Pruebas",
  "firebaseTestConfigStatus": "Configuración de Firebase",
  "firebaseTestApiKey": "Clave API",
  "firebaseTestAuthDomain": "Dominio de Autenticación",
  "firebaseTestProjectId": "ID de Proyecto",
  "firebaseTestStorageBucket": "Bucket de Almacenamiento",
  "firebaseTestMessagingSenderId": "ID de Remitente de Mensajería",
  "firebaseTestAppId": "ID de Aplicación",
  "firebaseTestSet": "✓ Configurado",
  "firebaseTestMissing": "✗ Faltante",

  "save": "Guardar",
  "cancel": "Cancelar",
 
  "sidebar": {
    "appName": "Gestión de Restaurante",
    "dashboard": "Panel",
    "inventory": "Inventario",
    "users": "Usuarios",
    "settings": "Configuraciones",
    "logout": "Cerrar Sesión",
    "orders": "Pedidos",
    "tables": "Mesas"
  },
  
  "tableMap": {
  "name": "Mapa de Mesas",
  "notFound": {
    "title": "Mapa de Mesas No Encontrado",
    "description": "El mapa de mesas que está buscando no existe.",
    "backToSettings": "Volver a Configuraciones"
  },
  "views": {
    "map": "Vista de Mapa",
    "grid": "Vista de Cuadrícula",
    "changeView": "Cambiar Vista"
  },
  "statuses": {
    "available": "Disponible",
    "occupied": "Ocupado",
    "reserved": "Reservado",
    "maintenance": "Mantenimiento",
    "ordering": "Ordenando",
    "preparing": "Preparando",
    "ready": "Listo",
    "served": "Servido"
  },
  "actions": {
    "addTable": "Agregar Mesa",
    "editMap": "Editar Mapa",
    "deleteMap": "Eliminar Mapa",
    "viewMap": "Ver Mapa"
  },
  "table": {
    "label": "Mesa",
    "details": {
      "seats": "Asientos",
      "status": "Estado",
      "activeOrder": "Pedido Activo",
      "noActiveOrder": "Sin Pedido Activo",
      "waiter": "Mesero",
      "orderTime": "Hora del Pedido",
      "dietaryRestrictions": "Restricciones Dietéticas",
      "items": "Artículos",
      "total": "Total",
      "specialRequests": "Solicitudes Especiales"
    },
    "actions": {
      "view": "Ver Detalles",
      "edit": "Editar Mesa",
      "delete": "Eliminar Mesa",
      "close": "Cerrar",
      "editOrder": "Editar Pedido",
      "markAsServed": "Marcar como Servido",
      "closeOrder": "Cerrar Pedido",
      "createOrder": "Crear Pedido",
      "changeStatus": "Cambiar Estado"
    },
    "descriptions": {
      "available": "Esta mesa está actualmente disponible.",
      "occupied": "Esta mesa está actualmente ocupada.",
      "ordering": "Esta mesa está tomando un pedido.",
      "preparing": "El pedido de esta mesa está siendo preparado.",
      "ready": "El pedido de esta mesa está listo para ser servido.",
      "served": "El pedido de esta mesa ha sido servido."
    }
  }
},
  
  "tableCard": {
    "label": "Mesa",
    "details": {
      "seats": "Asientos",
      "shape": {
        "square": "Cuadrada",
        "rectangle": "Rectangular",
        "circle": "Circular"
      }
    },
    
    "status": {
      "available": "Disponible",
      "occupied": "Ocupada",
      "reserved": "Reservada",
      "maintenance": "Mantenimiento",
      "ordering": "Ordenando",
      "preparing": "Preparando",
      "ready": "Lista",
      "served": "Servida"
    },
    "actions": {
      "viewOrder": "Ver Pedido",
      "createOrder": "Crear Pedido",
      "editTable": "Editar Mesa",
      "deleteTable": "Eliminar Mesa",
      "markAsServed": "Marcar como Servida",
      "closeOrder": "Cerrar Pedido",
      "changeStatus": "Cambiar Estado"
    },
    "menu": {
      "editTable": "Editar Mesa",
      "deleteTable": "Eliminar Mesa",
      "maintenance": "Mantenimiento"
    },
    "errors": {
      "updateStatus": "No se pudo actualizar el estado de la mesa",
      "sync": "No se pudo sincronizar la mesa",
      "closeOrder": "No se pudo cerrar el pedido",
      "markAsServed": "No se pudo marcar el pedido como servido"
    }
  },

  "userProfile": {
    "title": "Perfil",
    "description": "Administre su configuración e información de perfil",
    "actions": {
      "uploadPhoto": "Subir Foto",
      "saveChanges": "Guardar Cambios",
      "saving": "Guardando...",
      "profileUpdated": "Perfil Actualizado",
      "profileUpdateSuccess": "Su perfil se ha actualizado correctamente.",
      "profileUpdateFailed": "Error al Actualizar el Perfil",
      "profileUpdateError": "Ocurrió un error al actualizar su perfil."
    },
    "fields": {
      "username": "Nombre de Usuario",
      "email": {
        "label": "Correo Electrónico",
        "cannotBeChanged": "El correo electrónico no puede ser modificado"
      },
      "phoneNumber": "Número de Teléfono",
      "position": {
        "label": "Cargo",
        "placeholder": "Ingrese su cargo"
      },
      "role": {
        "label": "Rol",
        "placeholder": "Seleccione un rol",
        "options": {
          "admin": "Administrador",
          "manager": "Gerente",
          "chef": "Chef",
          "waiter": "Mesero"
        }
      }
    }
  },

  "menu": {
    "items": {
      "pizzaMargherita": "Pizza Margherita",
      "pastaCarbonara": "Pasta Carbonara", 
      "tiramisu": "Tiramisu",
      "caesarSalad": "Ensalada César",
      "risotto": "Risotto"
    }
  },

  "ordersPage": {
    "orders": "Pedidos",
    "newOrder": "Nuevo Pedido",
    "search": {
      "placeholder": "Buscar pedidos..."
    },
    "filter": {
      "allStatuses": "Todos los estados"
    },
    "orderStatus": {
      "01": "Pendiente",
      "02": "En preparación",
      "03": "Listo para servir",
      "04": "Entregado",
      "05": "Cancelado",
      "06": "Pagado",
      "07": "Enviado",
      "08": "En camino", 
      "09": "Completado",
      "10": "Reembolsado",
      "11": "En espera",
      "12": "Programado",
      "13": "Parcialmente pagado",
      "14": "Error de pago",
      "15": "Rechazado",
      "16": "Procesando",
      "17": "Confirmado",
      "18": "Preparación iniciada",
      "19": "Casi listo",
      "20": "Esperando cliente",
      "21": "Servicio en mesa",
      "22": "Para llevar",
      "23": "Delivery",
      "24": "Reserva",
      "25": "Urgente",
      "70": "Estado final"
    },
    "actions": {
      "updateStatus": "Actualizar Estado",
      "updateStatusDescription": "Actualizar estado del pedido {{orderId}}",
      "selectStatus": "Seleccionar nuevo estado",
      "delete": "Eliminar Pedido",
      "view": "Ver Pedido",
      "deleteOrder": "Eliminar Pedido",
      "deleteOrderConfirmation": "¿Está seguro de que desea eliminar el pedido {{orderId}}?"
    },
    "noOrdersFound": "No se encontraron pedidos"
  },

  "newOrderPage": {
    "title": "Crear Nuevo Pedido",
    "orderDetails": "Detalles del Pedido",
    "currentOrder": "Pedido Actual",
    "tableNumber": "Número de Mesa",
    "tableNumberPlaceholder": "Ingrese el número de mesa",
    "selectItem": "Seleccionar Artículo",
    "selectItemPlaceholder": "Elija un artículo para agregar",
    "quantity": "Cantidad",
    "notes": "Notas",
    "notesPlaceholder": "Instrucciones especiales",
    "addToOrder": "Agregar al Pedido",
    "noItemsInOrder": "Aún no se han agregado artículos al pedido",
    "total": "Total",
    "createOrder": "Enviar Pedido",
    "table": {
      "item": "Artículo",
      "quantity": "Cant",
      "price": "Precio",
      "total": "Total",
      "actions": "Acciones"
    },
    "error": {
      "title": "Error",
      "noItem": "Por favor, seleccione un artículo",
      "noTable": "Por favor, ingrese un número de mesa",
      "noItems": "Por favor, agregue al menos un artículo al pedido",
      "orderCreationFailed": "No se pudo crear el pedido"
    },
    "success": {
      "orderCreated": "Pedido Creado",
      "orderCreatedDescription": "El pedido para la Mesa {{tableNumber}} se ha creado con éxito"
    }
  },

  "users": {
    "pageTitle": "Usuarios",
    "userList": "Lista de Usuarios",
    "addUser": "Agregar Usuario",
    "searchPlaceholder": "Buscar usuarios...",
    "noUsers": "No se encontraron usuarios",
    "username": "Nombre de Usuario",
    "email": "Correo Electrónico",
    "role": "Rol",
    "createdAt": "Creado en",
    "lastLogin": "Último inicio de sesión",
    "status": "Estado",
    "actions": "Acciones",
    "openMenu": "Abrir menú",
    "copyId": "Copiar ID",
    "roles": {
      "admin": "Administrador",
      "manager": "Gerente",
      "chef": "Chef",
      "waiter": "Mesero"
    },
    "userStatus": {
      "active": "Activo",
      "inactive": "Inactivo"
    },
    "errors": {
      "fetchUsers": "Error al buscar usuarios"
    }
  },

  "orderForm": {
    "title": "Crear Pedido",
    "selectTable": "Seleccione la Mesa",
    "selectCategory": "Seleccione la Categoría",
    "selectItem": "Seleccione el Artículo",
    "quantity": "Cantidad",
    "notes": "Observaciones",
    "addItem": "Agregar Artículo",
    "orderItems": "Artículos del Pedido",
    "noItemsAdded": "Ningún artículo agregado",
    "dietaryRestrictions": {
      "title": "Restricciones Dietéticas",
      "vegetarian": "Vegetariano",
      "vegan": "Vegano",
      "glutenFree": "Sin Gluten",
      "lactoseFree": "Sin Lactosa"
    },
    "specialInstructions": {
      "label": "Instrucciones Especiales",
      "hasInstructions": "¿Tiene instrucciones especiales?"
    }
  }
};

export default esTranslations;