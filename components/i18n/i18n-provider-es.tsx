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
    "close": "Cerrar",
    "tableNumber": "Mesa N°",
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
    "description": "Crea una nueva cuenta para acceder al sistema de gestión de restaurantes",
    "username": "Nombre de usuario",
    "email": "Correo electrónico",
    "password": "Contraseña",
    "confirmPassword": "Confirmar contraseña",
    "establishmentName": "Nombre del establecimiento",
    "submit": "Registrarse",
    "error": {
      "passwordsDoNotMatch": "Las contraseñas no coinciden",
      "emailInUse": "Este correo electrónico ya está en uso",
      "weakPassword": "La contraseña es demasiado débil",
      "establishmentNameRequired": "El nombre del establecimiento es obligatorio",
      "establishmentNameMinLength": "El nombre del establecimiento debe tener al menos 3 caracteres",
      "establishmentNameTaken": "Este nombre de establecimiento ya está en uso",
      "suggestedAlternatives": "Nombres de establecimiento sugeridos:",
      "selectAlternative": "Por favor, seleccione un nombre alternativo o modifique el actual"
    },
    "suggestedNames": {
      "title": "Nombres de Establecimiento Sugeridos",
      "description": "El nombre que ingresó ya está en uso. Por favor, elija una alternativa:",
      "selectButton": "Seleccionar",
      "modifyButton": "Modificar Nombre"
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
    "createOrder": "Crear Pedido",
    "noOrdersFound": "No se encontraron pedidos",
    "search": {
      "placeholder": "Buscar pedidos por ID, mesa o mesero"
    },
    "filter": {
      "allStatuses": "Todos los Estados"
    },
    "actions": {
      "view": "Ver",
      "updateStatus": "Actualizar Estado",
      "delete": "Eliminar"
    },
    "action": {
      "updated": "actualizado",
      "deleted": "eliminado"
    },
    "success": {
      "statusUpdated": "Estado Actualizado",
      "orderDeleted": "Pedido Eliminado"
    },
    "error": {
      "fetchFailed": "Error al obtener pedidos",
      "updateStatusFailed": "Error al actualizar el estado del pedido",
      "deleteOrderFailed": "Error al eliminar el pedido"
    },
    "orderType": "Tipo de Pedido",
    "tableNumber": "Número de Mesa",
    "selectCategory": "Seleccionar Categoría",
    "selectItem": "Seleccionar Artículo",
    "noItemsInCategory": "No hay artículos en esta categoría",
    "quantity": "Cantidad",
    "itemNotes": "Notas del Artículo",
    "itemNotesPlaceholder": "¿Alguna instrucción especial?",
    "itemDietaryRestrictions": "Restricciones Dietéticas",
    "addToOrder": "Agregar al Pedido",
    "orderSummary": "Resumen del Pedido",
    "showMenuQr": "Mostrar QR del Menú",
    "noItemsInOrder": "No hay artículos en el pedido",
    "specialRequests": "Solicitudes Especiales",
    "specialRequestsPlaceholder": "¿Alguna solicitud especial para la cocina?",
    "menuUrl": "URL del Menú",
    "discount": "Descuento",
    "percentage": "Porcentaje",
    "errors": {
      "noItemsInOrder": "Por favor, agregue artículos al pedido",
      "noTableSelected": "Por favor, seleccione una mesa",
      "headers": {
        "id": "ID de Pedido",
        "tableNumber": "Mesa",
        "waiter": "Mesero", 
        "items": "Artículos",
        "status": "Estado",
        "total": "Total",
        "actions": "Acciones"
      }
    },
    "paymentMethods": {
      "cash": "Efectivo",
      "credit": "Tarjeta de Crédito",
      "debit": "Tarjeta de Débito",
      "transfer": "Transferencia Bancaria",
      "other": "Otro"
    },
    "confirmPayment": "Confirmar Pago",
    "table": {
      "emptyState": {
        "title": "No se encontraron pedidos",
        "description": "Actualmente no hay pedidos en el sistema. Comience a crear nuevos pedidos para verlos aquí."
      },
      "loading": "Cargando pedidos..."
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
      "owner": "Propietario",
      "admin": "Administrador",
      "manager": "Gerente",
      "staff": "Personal",
      "waiter": "Mesero"
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
    "pageTitle": "Mesas del Restaurante",
    "tableMaps": {
      "title": "Mapas de Mesas",
      "description": "Administre los diseños de mesas de su restaurante",
      "createMap": "Crear Mapa de Mesas",
      "editMap": "Editar Mapa de Mesas",
      "mapName": "Nombre del Mapa",
      "mapDescription": "Descripción del Mapa",
      "mapDescriptionPlaceholder": "Describa el diseño del mapa de mesas",
      "addNew": "Agregar Nuevo Mapa",
      "noMapsFound": "No se encontraron mapas de mesas",
      "saveError": "Error al guardar el mapa de mesas",
      "createError": "Error al crear el mapa de mesas",
      "updateError": "Error al actualizar el mapa de mesas",
      "deleteError": "Error al eliminar el mapa de mesas",
      "addTable": "Agregar Mesa",
      "noDescription": "Sin descripción",
      "viewMap": "Ver Mapa",
      "loadingTitle": "Cargando Mapa de Mesas"
    },
    "dialog": {
      "title": "Agregar Nueva Mesa",
      "description": "Crear una nueva mesa para su restaurante",
      "labels": {
        "tableName": "Nombre de la Mesa",
        "tableCapacity": "Capacidad de la Mesa"
      },
      "placeholders": {
        "tableName": "Ingrese el nombre de la mesa",
        "tableCapacity": "Ingrese la capacidad de la mesa"
      },
      "actions": {
        "cancel": "Cancelar",
        "create": "Crear Mesa"
      },
      "errors": {
        "invalidCapacity": "La capacidad de la mesa debe ser mayor que 0",
        "create": "Error al crear la mesa"
      },
      "success": {
        "create": "Mesa creada exitosamente"
      }
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
    "system": {
      "title": "Sistema",
      "description": "Administrar configuraciones y ajustes avanzados del sistema"
    },
    "profile": {
      "title": "Perfil",
      "description": "Administre su información personal y configuraciones de cuenta",
      "actions": {
        "uploadPhoto": "Cargar Foto",
        "submit": "Guardar Cambios",
        "submitting": "Guardando...",
        "profileUpdated": "Perfil Actualizado",
        "profileUpdateSuccess": "Su perfil ha sido actualizado exitosamente.",
        "profileUpdateFailed": "Actualización de Perfil Fallida",
        "profileUpdateError": "Ocurrió un error al actualizar su perfil."
      },
      "fields": {
        "username": "Nombre de Usuario",
        "email": {
          "label": "Correo Electrónico",
          "cannotBeChanged": "Este correo electrónico no puede ser modificado"
        },
        "phoneNumber": "Número de Teléfono",
        "position": {
          "label": "Cargo",
          "placeholder": "Ingrese su cargo"
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
      }
    },
    "appearance": {
      "title": "Apariencia",
      "description": "Personalice el aspecto de la aplicación",
      "modes": {
        "light": {
          "label": "Modo Claro"
        },
        "dark": {
          "label": "Modo Oscuro"
        },
        "system": {
          "label": "Predeterminado del Sistema"
        }
      },
      "actions": {
        "save": "Guardar Cambios",
        "saving": "Guardando...",
        "saved": {
          "title": "Apariencia Actualizada",
          "description": "Sus preferencias de apariencia han sido actualizadas con éxito."
        },
        "failed": {
          "title": "Actualización Fallida",
          "description": "Ocurrió un error al actualizar sus preferencias de apariencia."
        }
      }
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
        "submit": "Guardar Cambios",
        "saving": "Guardando...",
        "profileUpdated": "Preferencia de Idioma Actualizada",
        "profileUpdateSuccess": "Su preferencia de idioma ha sido actualizada con éxito.",
        "profileUpdateFailed": "Actualización Fallida",
        "profileUpdateError": "Ocurrió un error al actualizar su preferencia de idioma."
      }
    },
    "notifications": {
      "title": "Notificaciones",
      "description": "Administre sus preferencias de notificación y métodos de entrega",
      "types": {
        "title": "Tipos de Notificaciones",
        "newOrders": {
          "label": "Nuevos Pedidos",
          "description": "Recibir notificaciones de nuevos pedidos entrantes"
        },
        "orderUpdates": {
          "label": "Actualizaciones de Pedidos",
          "description": "Obtener actualizaciones sobre el estado de los pedidos existentes"
        },
        "inventoryAlerts": {
          "label": "Alertas de Inventario",
          "description": "Notificaciones sobre stock bajo o cambios en el inventario"
        },
        "systemAnnouncements": {
          "label": "Anuncios del Sistema",
          "description": "Actualizaciones importantes y anuncios del sistema"
        },
        "dailyReports": {
          "label": "Informes Diarios",
          "description": "Recibir informes de resumen diarios"
        }
      },
      "deliveryMethods": {
        "title": "Métodos de Entrega",
        "emailNotifications": {
          "label": "Notificaciones por Correo",
          "description": "Recibir notificaciones por correo electrónico"
        },
        "pushNotifications": {
          "label": "Notificaciones Push",
          "description": "Recibir alertas en tiempo real en su dispositivo"
        },
        "soundAlerts": {
          "label": "Alertas de Sonido",
          "description": "Reproducir notificaciones de sonido cuando ocurren nuevos eventos"
        }
      },
      "actions": {
        "submit": "Guardar Cambios",
        "submitting": "Guardando...",
        "profileUpdated": "Preferencias de Notificación Actualizadas",
        "profileUpdateSuccess": "Sus preferencias de notificación han sido actualizadas con éxito.",
        "profileUpdateFailed": "Actualización Fallida",
        "profileUpdateError": "Ocurrió un error al actualizar sus preferencias de notificación."
      }
    },
    "userProfile": {
      "title": "Perfil de Usuario",
      "username": "Nombre de Usuario",
      "email": "Correo Electrónico",
      "role": "Rol",
      "phoneNumber": "Número de Teléfono",
      "position": "Posición"
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
          "credit": "Tarjeta de Crédito",
          "debit": "Tarjeta de Débito",
          "transfer": "Transferencia Bancaria",
          "other": "Otro"
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
    "goodMorning": "Buenos días",
    "goodAfternoon": "Buenas tardes",
    "goodEvening": "Buenas noches",
    "user": "Usuario",
    "welcomeMessage": "Bienvenido a su panel de control, donde puede gestionar las operaciones de su restaurante y seguir el rendimiento.",
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
  },

  "newOrderPage": {
    "title": "Nuevo Pedido",
    "errors": {
      "unauthorized": "No está autorizado para crear este pedido",
      "menuItemNotFound": "Artículo del menú seleccionado no encontrado",
      "invalidQuantity": "Ingrese una cantidad válida",
      "missingTableNumber": "Seleccione o ingrese el número de mesa",
      "missingMenuItem": "Seleccione un artículo del menú",
      "insufficientStock": "Stock insuficiente para el artículo seleccionado",
      "orderCreationFailed": "No se pudo crear el pedido. Intente nuevamente.",
      "fetchOrders": "Error al cargar pedidos",
      "createOrder": "Error al crear pedido",
      "updateOrder": "Error al actualizar pedido",
      "deleteOrder": "Error al eliminar pedido",
      "updateStatus": "Error al actualizar el estado del pedido"
    },
    "success": {
      "orderCreated": "Pedido creado exitosamente",
      "orderUpdated": "Pedido actualizado exitosamente",
      "orderDeleted": "Pedido eliminado exitosamente",
      "statusUpdated": "Estado del pedido actualizado exitosamente",
      "itemAdded": "Artículo agregado al pedido"
    }
  },

  "tableCard": {
    "label": {
      "available": "Disponible",
      "occupied": "Ocupada",
      "reserved": "Reservada"
    },
    "status": {
      "noActiveOrder": "Sin pedido activo"
    },
    "actions": {
      "createOrder": "Crear Pedido",
      "changeStatus": "Cambiar Estado",
      "viewOrder": "Ver Pedido",
      "closeOrder": "Cerrar Pedido"
    },
    "errors": {
      "sync": "Error al sincronizar el estado de la mesa",
      "closeOrder": "Error al cerrar el pedido"
    }
  },
  "inventory": {
    "pageTitle": "Inventario",
    "searchPlaceholder": "Buscar en inventario...",
    "noItemsFound": "No se encontraron items",
    "categories": {
      "drinks": "Bebidas",
      "food": "Comida",
      "menu_item": "Item del menú"
    },
    "formLabels": {
      "name": "Nombre",
      "category": "Categoría", 
      "quantity": "Cantidad",
      "unit": "Unidad",
      "minQuantity": "Stock Mínimo",
      "price": "Precio",
      "actions": "Acciones",
      "status": "Status"
    },
    "addItem": {
      "title": "Agregar Item",
      "description": "Agregar un nuevo item al inventario",
      "namePlaceholder": "Ingrese el nombre del item",
      "categoryPlaceholder": "Selecciona la categoría del item",
      "quantityPlaceholder": "Ingrese cantidad",
      "unitPlaceholder": "Ingrese unidad (e.g. kg, pcs)",
      "minQuantityPlaceholder": "Ingrese cantidad mínima de stock",
      "pricePlaceholder": "Ingrese precio del item",
      "successToast": "{{itemName}} agregado al inventario",
      "errorToast": "Error al agregar item al inventario",
      "cancel": "Cancelar",
      "descriptionPlaceholder": "Ingrese descripción del item"
    },
    "editItem": {
      "title": "Editar Item",
      "description": "Modificar los detalles de un item existente en el inventario",
      "successToast": "{{itemName}} actualizado",
      "errorToast": "Error al actualizar item del inventario",
      "cancel": "Cancelar"
    },
    "deleteItem": {
      "title": "Eliminar Item",
      "description": "¿Estás seguro de que quieres eliminar {{itemName}}? Esta acción no se puede deshacer.",
      "successToast": "Item del inventario eliminado",
      "errorToast": "Error al eliminar item del inventario"
    },
    "status": {
      "lowStock": "Bajo Stock",
      "inStock": "En Stock"
    },
    "buttons": {
      "addItem": "Agregar Item",
      "editItem": "Editar Item",
      "cancel": "Cancelar"
    },
    "errors": {
      "fetchItems": "Error al cargar items del inventario",
      "addItem": "Error al agregar item al inventario",
      "deleteItem": "Error al eliminar item del inventario"
    },
    "noItems": "No hay items en el inventario",
    "noMatchingItems": "No se encontraron items",
    "initialLoad": {
      "success": "Items del menú cargados exitosamente",
      "description": "{{count}} items agregados al inventario",
      "error": "Error al cargar items iniciales"
    }
  }
};

export default esTranslations;