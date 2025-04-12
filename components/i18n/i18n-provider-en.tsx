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
    "tableNumber": "Table #",
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
      },
      "emptyStateOrders": {
        "title": "No Orders Found",
        "description": "There are currently no orders in the system. Start creating new orders to see them here."
      },
      "loadingOrders": "Loading orders..."
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
    "establishmentName": "Establishment Name",
    "submit": "Register",
    "error": {
      "passwordsDoNotMatch": "Passwords do not match",
      "emailInUse": "This email is already in use",
      "weakPassword": "Password is too weak",
      "establishmentNameRequired": "Establishment name is required",
      "establishmentNameMinLength": "Establishment name must be at least 3 characters long",
      "establishmentNameTaken": "This establishment name is already in use",
      "suggestedAlternatives": "Suggested alternative names:",
      "selectAlternative": "Please select an alternative name or modify the current one"
    },
    "suggestedNames": {
      "title": "Suggested Establishment Names",
      "description": "The name you entered is already in use. Please choose an alternative:",
      "selectButton": "Select",
      "modifyButton": "Modify Name"
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
    "createOrder": "Create Order",
    "noOrdersFound": "No orders found",
    "search": {
      "placeholder": "Search orders by ID, table, or waiter"
    },
    "filter": {
      "allStatuses": "All Statuses"
    },
    "actions": {
      "view": "View",
      "updateStatus": "Update Status",
      "delete": "Delete"
    },
    "action": {
      "updated": "updated",
      "deleted": "deleted"
    },
    "success": {
      "statusUpdated": "Status Updated",
      "orderDeleted": "Order Deleted"
    },
    "error": {
      "fetchFailed": "Failed to fetch orders",
      "updateStatusFailed": "Failed to update order status",
      "deleteOrderFailed": "Failed to delete order"
    },
    "orderType": "Order Type",
    "table": "Table",
    "tableNumber": "Table Number",
    "selectCategory": "Select Category",
    "selectItem": "Select Item",
    "noItemsInCategory": "No items in this category",
    "quantity": "Quantity",
    "itemNotes": "Item Notes",
    "itemNotesPlaceholder": "Any special instructions?",
    "itemDietaryRestrictions": "Dietary Restrictions",
    "addToOrder": "Add to Order",
    "orderSummary": "Order Summary",
    "showMenuQr": "Show Menu QR",
    "noItemsInOrder": "No items in order",
    "specialRequests": "Special Requests",
    "specialRequestsPlaceholder": "Any special requests for the kitchen?",
    "menuUrl": "Menu URL",
    "discount": "Discount",
    "percentage": "Percentage",
    "errors": {
      "noItemsInOrder": "Please add items to the order",
      "noTableSelected": "Please select a table",
      "headers": {
        "id": "Order ID",
        "tableNumber": "Table",
        "waiter": "Waiter", 
        "items": "Items",
        "total": "Total",
        "actions": "Actions"
      }
    },
    "paymentMethods": {
      "cash": "Cash",
      "credit": "Credit Card",
      "debit": "Debit Card",
      "transfer": "Bank Transfer",
      "other": "Other"
    },
    "confirmPayment": "Confirm Payment"
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
      "owner": "Owner",
      "admin": "Administrator",
      "manager": "Manager",
      "staff": "Staff",
      "waiter": "Waiter"
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
    "actions": "Actions",
    "pageTitle": "Restaurant Tables",
    "tableMaps": {
      "title": "Table Maps",
      "description": "Manage your restaurant's table layouts",
      "createMap": "Create Table Map",
      "editMap": "Edit Table Map",
      "mapName": "Map Name",
      "mapDescription": "Map Description",
      "mapDescriptionPlaceholder": "Describe the table map layout",
      "addNew": "Add New Map",
      "noMapsFound": "No Table Maps Found",
      "saveError": "Error saving table map",
      "createError": "Error creating table map",
      "updateError": "Error updating table map",
      "deleteError": "Error deleting table map",
      "addTable": "Add Table",
      "noDescription": "No Description",
      "viewMap": "View Map",
      "loadingTitle": "Loading Table Map",
      
    }
  },

  "tableDialog": {
    "title": "Add New Table",
    "description": "Create a new table for your restaurant",
    "labels": {
      "tableName": "Table Name",
      "tableCapacity": "Table Capacity"
    },
    "placeholders": {
      "tableName": "Enter table name",
      "tableCapacity": "Enter table capacity"
    },
    "actions": {
      "cancel": "Cancel",
      "create": "Create Table"
    },
    "errors": {
      "invalidCapacity": "Table capacity must be greater than 0",
      "create": "Error creating table"
    },
    "success": {
      "create": "Table created successfully"
    }
  },

  "common": {
    "cancel": "Cancel",
    "save": "Save",
    "create": "Create",
    "edit": "Edit",
    "delete": "Delete",
    "created": "created",
    "close": "Close"
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
    "system": {
      "title": "System",
      "description": "Manage advanced system settings and configurations"
    },
    "profile": {
      "title": "Profile",
      "description": "Manage your personal information and account settings",
      "actions": {
        "uploadPhoto": "Upload Photo",
        "submit": "Save Changes",
        "submitting": "Saving...",
        "profileUpdated": "Profile Updated",
        "profileUpdateSuccess": "Your profile has been successfully updated.",
        "profileUpdateFailed": "Profile Update Failed",
        "profileUpdateError": "An error occurred while updating your profile."
      },
      "fields": {
        "username": "Username",
        "email": {
          "label": "Email",
          "cannotBeChanged": "This email cannot be changed"
        },
        "phoneNumber": "Phone Number",
        "position": {
          "label": "Position",
          "placeholder": "Enter your position"
        },
        "role": {
          "label": "Role",
          "placeholder": "Select your role",
          "options": {
            "admin": "Admin",
            "manager": "Manager", 
            "chef": "Chef",
            "waiter": "Waiter"
          }
        }
      }
    },
    "appearance": {
      "title": "Appearance",
      "description": "Customize the application's look and feel",
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
        "save": "Save Changes",
        "saving": "Saving...",
        "saved": {
          "title": "Appearance Updated",
          "description": "Your appearance preferences have been successfully updated."
        },
        "failed": {
          "title": "Update Failed",
          "description": "An error occurred while updating your appearance preferences."
        }
      }
    },
    "language": {
      "title": "Language",
      "description": "Select your preferred application language",
      "languages": {
        "en": "English",
        "es": "Spanish",
        "pt": "Portuguese"
      },
      "actions": {
        "submit": "Save Changes",
        "saving": "Saving...",
        "profileUpdated": "Language Preference Updated",
        "profileUpdateSuccess": "Your language preference has been successfully updated.",
        "profileUpdateFailed": "Update Failed",
        "profileUpdateError": "An error occurred while updating your language preference."
      }
    },
    "notifications": {
      "title": "Notifications",
      "description": "Manage your notification preferences and delivery methods",
      "types": {
        "title": "Notification Types",
        "newOrders": {
          "label": "New Orders",
          "description": "Receive notifications for new incoming orders"
        },
        "orderUpdates": {
          "label": "Order Updates",
          "description": "Get updates on the status of existing orders"
        },
        "inventoryAlerts": {
          "label": "Inventory Alerts",
          "description": "Notifications about low stock or inventory changes"
        },
        "systemAnnouncements": {
          "label": "System Announcements",
          "description": "Important updates and announcements from the system"
        },
        "dailyReports": {
          "label": "Daily Reports",
          "description": "Receive daily summary reports"
        }
      },
      "deliveryMethods": {
        "title": "Delivery Methods",
        "emailNotifications": {
          "label": "Email Notifications",
          "description": "Receive notifications via email"
        },
        "pushNotifications": {
          "label": "Push Notifications",
          "description": "Get real-time alerts on your device"
        },
        "soundAlerts": {
          "label": "Sound Alerts",
          "description": "Play sound notifications when new events occur"
        }
      },
      "actions": {
        "submit": "Save Changes",
        "submitting": "Saving...",
        "profileUpdated": "Notification Preferences Updated",
        "profileUpdateSuccess": "Your notification preferences have been successfully updated.",
        "profileUpdateFailed": "Update Failed",
        "profileUpdateError": "An error occurred while updating your notification preferences."
      }
    },
    "userProfile": {
      "title": "User Profile",
      "username": "Username",
      "email": "Email",
      "role": "Role",
      "phoneNumber": "Phone Number",
      "position": "Position"
    }
  },

  "dashboard": {
    "title": "Dashboard",
    "goodMorning": "Good morning",
    "goodAfternoon": "Good afternoon",
    "goodEvening": "Good evening",
    "user": "User",
    "welcomeMessage": "Welcome to your dashboard, where you can manage your restaurant's operations and track performance.",
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

  "newOrderPage": {
    "title": "New Order",
    "errors": {
      "unauthorized": "You are not authorized to create this order",
      "menuItemNotFound": "Selected menu item not found",
      "invalidQuantity": "Please enter a valid quantity",
      "missingTableNumber": "Please select or enter a table number",
      "missingMenuItem": "Please select a menu item",
      "insufficientStock": "Insufficient stock for the selected item",
      "orderCreationFailed": "Could not create the order. Please try again.",
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
      "statusUpdated": "Order status updated successfully",
      "itemAdded": "Item added to order"
    }
  },

  "tableCard": {
    "label": {
      "available": "Available",
      "occupied": "Occupied",
      "reserved": "Reserved"
    },
    "status": {
      "noActiveOrder": "No active order",
      "ready": "Ready",
      "served": "Served",
      "pending": "Pending",
      "closed": "Closed",
      "serving": "Serving"
    },
    "actions": {
      "createOrder": "Create Order",
      "viewOrder": "View Order",
      "closeOrder": "Close Order"
    },
    "errors": {
      "sync": "Failed to synchronize table status",
      "closeOrder": "Failed to close order"
    }
  },

  "paymentMethods": {
    "cash": "Cash",
    "credit": "Credit Card",
    "debit": "Debit Card",
    "transfer": "Bank Transfer",
    "other": "Other"
  },
  "inventory": {
    "pageTitle": "Inventory",
    "searchPlaceholder": "Search in inventory...",
    "noItemsFound": "No items found",
    "categories": {
      "drinks": "Drinks",
      "food": "Food",
      "menu_item": "Menu Item"
    },
    "formLabels": {
      "name": "Name",
      "category": "Category", 
      "quantity": "Quantity",
      "unit": "Unit",
      "minQuantity": "Minimum Stock",
      "price": "Price",
      "actions": "Actions",
      "status": "Status"
    },
    "addItem": {
      "title": "Add Item",
      "description": "Add a new item to the inventory",
      "namePlaceholder": "Enter item name",
      "categoryPlaceholder": "Select item category",
      "quantityPlaceholder": "Enter quantity",
      "unitPlaceholder": "Enter unit (e.g. kg, pcs)",
      "minQuantityPlaceholder": "Enter minimum stock quantity",
      "pricePlaceholder": "Enter item price",
      "successToast": "{{itemName}} was added to inventory",
      "errorToast": "Failed to add inventory item",
      "cancel": "Cancel",
      "descriptionPlaceholder": "Enter item description"
    },
    "editItem": {
      "title": "Edit Item",
      "description": "Modify the details of an existing inventory item",
      "successToast": "{{itemName}} was updated",
      "errorToast": "Failed to update inventory item",
      "cancel": "Cancel"
    },
    "deleteItem": {
      "title": "Delete Item",
      "description": "Are you sure you want to delete {{itemName}}? This action cannot be undone.",
      "successToast": "Inventory item deleted",
      "errorToast": "Failed to delete inventory item"
    },
    "status": {
      "lowStock": "Low Stock",
      "inStock": "In Stock"
    },
    "buttons": {
      "addItem": "Add Item",
      "editItem": "Edit Item",
      "cancel": "Cancel"
    },
    "errors": {
      "fetchItems": "Failed to fetch inventory items",
      "addItem": "Failed to add inventory item",
      "deleteItem": "Failed to delete inventory item"
    },
    "noItems": "No items in inventory",
    "noMatchingItems": "No items found",
    "initialLoad": {
      "success": "Menu items loaded successfully",
      "description": "{{count}} items added to inventory",
      "error": "Failed to load initial items"
    }
  },

  // Add the rest of the translations following the Portuguese structure
  // ... (continue adding other sections like settings, orderForm, etc.)
};

export default enTranslations;