export const enTranslations = {
  "commons": {
    "yes": "Yes",
    "no": "No",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "save": "Save",
    "edit": "Edit",
    "delete": "Delete",
    "success": "Success",
    "warning": "Warning",
    "search": "Search",
    "filter": "Filter",
    "actions": "Actions",
    "button": {
      "add": "Add",
      "edit": "Edit",
      "delete": "Delete",
      "cancel": "Cancel",
      "save": "Save",
      "submit": "Submit",
      "loading": "Loading...",
      "sending": "Sending...",
      "create": "Create",
      "created": "Created"
    },
    "status": {
      "lowStock": "Low Stock",
      "inStock": "In Stock",
      "outOfStock": "Out of Stock"
    },
    "table": {
      "headers": {
        "name": "Name",
        "category": "Category",
        "quantity": "Quantity",
        "unit": "Unit",
        "minQuantity": "Min. Quantity",
        "price": "Price",
        "status": "Status",
        "actions": "Actions"
      },
      "pagination": {
        "rowsPerPage": "Rows per page",
        "of": "of",
        "first": "First",
        "last": "Last",
        "next": "Next",
        "previous": "Previous"
      },
      "noData": "No data available",
      "loading": "Loading data...",
      "emptyState": {
        "title": "No records",
        "description": "No records have been added yet"
      }
    },
    "error": {
      "generic": "An error occurred",
      "required": "This field is required",
      "invalid": "Invalid input",
      "configurationError": "Firebase configuration error. Please contact support",
      "serviceUnavailable": "Authentication service unavailable. Please try again later"
    },
    "loading": "Loading...",
    "noItemsFound": "No items found",
    "searchPlaceholder": "Search...",
    "confirmDelete": "Are you sure you want to delete this item? This action cannot be undone.",
    "currency": "{{value}}",
    "password": "Password",
    "emailRequired": "Email is required",
    "passwordRequired": "Password is required",
    "login": {
      "error": {
        "emailRequired": "Email is required",
        "passwordRequired": "Password is required",
        "invalidCredentials": "Invalid email or password",
        "tooManyAttempts": "Too many failed attempts. Please try again later."
      }
    }
  },

  // Rest of the translations remain the same as the Portuguese structure, 
  // but with English translations
  
  "login": {
    "title": "Login",
    "description": "Enter your credentials to access your account",
    "email": "Email",
    "password": "Password",
    "login": "Login",
    "forgotPassword": "Forgot Password?",
    "error": {
      "invalidCredentials": "Invalid email or password",
      "tooManyAttempts": "Too many login attempts. Please try again later.",
      "emailRequired": "Email is required",
      "passwordRequired": "Password is required",
      "serviceUnavailable": "Authentication service unavailable. Please try again later"
    }
  },

  "register": {
    "title": "Register",
    "description": "Create a new account to access the restaurant management system",
    "username": "Username",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "submit": "Register",
    "error": {
      "passwordsDoNotMatch": "Passwords do not match",
      "emailInUse": "This email is already in use",
      "weakPassword": "Password is too weak"
    }
  },

  "forgotPassword": {
    "title": "Recover Password",
    "description": "Enter your email to receive password reset instructions",
    "email": "Email",
    "sendInstructions": "Send Instructions",
    "error": {
      "emailRequired": "Email is required",
      "userNotFound": "No account found with this email address",
      "generic": "Failed to send reset email"
    },
    "success": {
      "emailSent": "Password reset instructions sent"
    }
  },

  "orders": {
    "title": "Orders",
    "newOrder": "New Order",
    "noOrdersFound": "No orders found",
    "search": {
      "placeholder": "Search orders by ID, table, or waiter",
      "filterByStatus": "Filter by status",
      "filterByWaiter": "Filter by waiter"
    },
    "filters": {
      "allStatuses": "All Statuses",
      "noOrdersFound": "No orders found"
    },
    "filter": {
      "allStatuses": "All Statuses"
    },
    "table": {
      "headers": {
        "id": "ID",
        "tableNumber": "Table Number",
        "waiter": "Waiter",
        "items": "Items",
        "status": "Status",
        "total": "Total",
        "actions": "Actions"
      },
      "placeholders": {
        "searchOrders": "Search orders by ID, table, or waiter",
        "selectStatus": "Select status",
        "selectWaiter": "Select waiter"
      }
    },
    "status": {
      "pending": "Pending",
      "preparing": "In Preparation",
      "ready": "Ready",
      "served": "Served",
      "cancelled": "Cancelled",
      "completed": "Completed",
      "delivered": "Delivered",
      "closed": "Closed",
      "finished": "Finished",
      "ordering": "Ordering"
    },
    "actions": {
      "view": "View",
      "edit": "Edit",
      "delete": "Delete",
      "cancel": "Cancel",
      "updateStatus": "Update Status",
      "createOrder": "Create Order"
    },
    "errors": {
      "fetchOrders": "Error loading orders",
      "createOrder": "Error creating order",
      "updateOrder": "Error updating order",
      "deleteOrder": "Error deleting order",
      "updateStatus": "Error updating order status"
    },
    "success": {
      "orderCreated": "Order created successfully",
      "orderUpdated": "Order updated successfully",
      "orderDeleted": "Order deleted successfully",
      "statusUpdated": "Order status updated successfully"
    },
    "action": {
      "updateStatus": "Update Status",
      "updatedTo": "Updated to",
      "updateStatusDescription": "Select the new status for order {{orderId}}",
      "selectStatus": "Select Status",
      "delete": "Delete",
      "deleted": "Deleted",
      "deleteConfirmation": "Are you sure you want to delete order {{orderId}}?"
    },
    "dialogs": {
      "updateStatus": {
        "title": "Update Order Status",
        "description": "Select the new status for order {{orderId}}",
        "selectStatus": "Select Status"
      },
      "deleteOrder": {
        "title": "Delete Order",
        "description": "Are you sure you want to delete order {{orderId}}? This action cannot be undone.",
        "confirmButton": "Delete Order",
        "cancelButton": "Cancel"
      }
    }
  },

  "users": {
    "pageTitle": "Users",
    "addUser": "Add User",
    "userList": "User List",
    "searchPlaceholder": "Search users...",
    "noUsers": "No users found",
    "username": "Username",
    "email": "Email",
    "role": "Role",
    "status": "Status",
    "actions": "Actions",
    "openMenu": "Open menu",
    "copyId": "Copy ID",
    "userStatus": {
      "active": "Active",
      "inactive": "Inactive",
      "suspended": "Suspended"
    },
    "roles": {
      "admin": "Administrator",
      "manager": "Manager",
      "staff": "Staff"
    },
    "errors": {
      "fetchUsers": "Error loading users",
      "createUser": "Error creating user",
      "updateUser": "Error updating user",
      "deleteUser": "Error deleting user"
    },
    "success": {
      "userCreated": "User created successfully",
      "userUpdated": "User updated successfully",
      "userDeleted": "User deleted successfully"
    },
    "form": {
      "createTitle": "Create New User",
      "editTitle": "Edit User",
      "labels": {
        "username": "Username",
        "email": "Email",
        "role": "Role",
        "status": "Status",
        "password": "Password",
        "confirmPassword": "Confirm Password"
      },
      "placeholders": {
        "username": "Enter username",
        "email": "Enter email",
        "role": "Select role",
        "status": "Select status",
        "password": "Enter password",
        "confirmPassword": "Confirm password"
      },
      "validation": {
        "usernameRequired": "Username is required",
        "emailRequired": "Email is required",
        "emailInvalid": "Invalid email",
        "roleRequired": "Role is required",
        "statusRequired": "Status is required",
        "passwordRequired": "Password is required",
        "passwordMinLength": "Password must be at least 8 characters",
        "passwordsMatch": "Passwords must match"
      }
    }
  },

  "tables": {
    "pageTitle": "Tables",
    "dialog": {
      "title": "Configure Table",
      "description": "Add or edit table details",
      "tableName": {
        "label": "Table Name",
        "placeholder": "E.g. Table 1, VIP Table"
      },
      "tableCapacity": {
        "label": "Table Capacity",
        "placeholder": "Number of people",
        "min": 1,
        "max": 20
      },
      "status": {
        "label": "Table Status",
        "options": {
          "available": "Available",
          "occupied": "Occupied",
          "reserved": "Reserved",
          "cleaning": "Cleaning"
        }
      },
      "location": {
        "label": "Location",
        "placeholder": "Restaurant area or section"
      },
      "buttons": {
        "save": "Save Table",
        "cancel": "Cancel",
        "edit": "Edit Table",
        "delete": "Delete Table"
      }
    },
    "tableMap": {
      "title": "Table Maps",
      "description": "Manage your restaurant's table layouts",
      "addNew": "Add New Map",
      "edit": "Edit Map",
      "delete": "Delete Map"
    },
    "errors": {
      "tableNameRequired": "Table name is required",
      "invalidCapacity": "Invalid capacity",
      "saveError": "Error saving table",
      "deleteError": "Error deleting table"
    },
    "success": {
      "tableSaved": "Table saved successfully",
      "tableDeleted": "Table deleted successfully"
    },
    "title": "Tables",
    "tableMaps": {
      "title": "Table Maps",
      "createMap": "Create Table Map",
      "noMapsFound": "No table maps found",
      "mapName": "Map Name",
      "mapDescription": "Map Description",
      "viewMap": "View Map",
      "addTable": "Add Table",
      "noDescription": "No description"
    },
    "actions": "Actions",
    "status": {
      "available": "Available",
      "occupied": "Occupied",
      "reserved": "Reserved"
    }
  },

  "dialog": {
    "confirm": {
      "title": "Confirm Action",
      "description": "Are you sure you want to perform this action?",
      "confirmButton": "Confirm",
      "cancelButton": "Cancel"
    },
    "delete": {
      "title": "Delete Record",
      "description": "Are you sure you want to delete this record? This action cannot be undone.",
      "confirmButton": "Delete",
      "cancelButton": "Cancel"
    }
  },

  "settings": {
    "title": "Settings",
    "profile": {
      "title": "Profile",
      "description": "Manage your personal information and account settings",
      "personalInfo": "Personal Information",
      "accountSettings": "Account Settings"
    },
    "notifications": {
      "title": "Notifications",
      "description": "Manage your notification preferences",
      "emailNotifications": "Email Notifications",
      "pushNotifications": "Push Notifications",
      "smsNotifications": "SMS Notifications"
    },
    "language": {
      "title": "Language",
      "description": "Select your preferred application language",
      "currentLanguage": "Current Language",
      "availableLanguages": {
        "portuguese": "Portuguese",
        "spanish": "Spanish",
        "english": "English"
      }
    },
    "appearance": {
      "title": "Appearance",
      "description": "Customize the application's appearance",
      "theme": {
        "light": "Light",
        "dark": "Dark",
        "system": "System"
      },
      "colorScheme": "Color Scheme"
    },
    "system": {
      "title": "System",
      "description": "Advanced system settings",
      "dataUsage": "Data Usage",
      "performanceSettings": "Performance Settings",
      "resetSettings": "Reset Settings"
    },
    "buttons": {
      "save": "Save Changes",
      "cancel": "Cancel",
      "reset": "Reset"
    },
    "success": {
      "settingsSaved": "Settings saved successfully",
      "settingsReset": "Settings reset successfully"
    },
    "errors": {
      "saveSettings": "Error saving settings",
      "resetSettings": "Error resetting settings"
    }
  },

  "dashboard": {
    "title": "Dashboard",
    "salesOverview": {
      "title": "Sales Overview",
      "description": "Total sales and performance",
      "totalSales": "Total Sales",
      "monthlyGrowth": "+{percentage}% from last month"
    },
    "topSellingItems": {
      "title": "Top Selling Items",
      "description": "Popular items",
      "orderCount": "{{count, number}} orders"
    },
    "stockLevel": {
      "title": "Stock Levels",
      "description": "Inventory status",
      "percentage": "{percentage}%",
      "lowStockItems": "{count} items low in stock",
      "totalItems": "Total Items",
      "inStock": "In Stock",
      "lowStock": "Low Stock",
      "status": {
        "critical": "Critical Stock",
        "warning": "Low Stock",
        "healthy": "Healthy Stock"
      }
    },
    "recentOrders": "Recent Orders",
    "categories": "Categories",
    "errors": {
      "fetchFailed": "Failed to load dashboard data. Please try again later."
    }
  },

  "sidebar": {
    "appName": "Comandero",
    "dashboard": "Dashboard",
    "orders": "Orders",
    "tables": "Tables",
    "inventory": "Inventory",
    "users": "Users",
    "settings": "Settings",
    "advancedReports": "Advanced Reports",
    "logout": "Logout",
    "language": "Language",
    "installApp": "Install App",
    "languages": {
      "english": "English",
      "spanish": "Spanish", 
      "portuguese": "Portuguese"
    }
  },

  // Add the rest of the translations following the Portuguese structure
  // ... (continue adding other sections like settings, orderForm, etc.)
};

export default enTranslations;