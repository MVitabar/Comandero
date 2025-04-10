export const enTranslations = {
  // Commons Translations
  "commons": {
    "button": {
      "add": "Add",
      "edit": "Edit",
      "delete": "Delete",
      "cancel": "Cancel",
      "save": "Save",
      "submit": "Submit"
    },
    "status": {
      "lowStock": "Low Stock",
      "inStock": "In Stock"
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
      }
    },
    "error": "Error",
    "loading": "Loading...",
    "noItemsFound": "No items found",
    "searchPlaceholder": "Search...",
    "confirmDelete": "Are you sure you want to delete this item? This action cannot be undone.",
    "currency": "{{value}}"
  },

  // Inventory Translations
  "inventory": {
    "pageTitle": "Inventory Management",
    "searchPlaceholder": "Search inventory...",
    "noItemsFound": "No inventory items found",
    "addItem": {
      "title": "Add Item",
      "description": "Add a new item to the inventory",
      "namePlaceholder": "Enter item name",
      "categoryPlaceholder": "Select item category",
      "quantityPlaceholder": "Enter quantity",
      "unitPlaceholder": "Enter unit (e.g., kg, pcs)",
      "minQuantityPlaceholder": "Enter minimum stock quantity",
      "pricePlaceholder": "Enter item price",
      "successToast": "{{itemName}} has been added to inventory",
      "errorToast": "Failed to add inventory item",
      "cancel": "Cancel",
    },
    "editItem": {
      "title": "Edit Item",
      "description": "Update inventory item details",
      "successToast": "{{itemName}} has been updated",
      "errorToast": "Failed to update inventory item",
      "cancel": "Cancel"
    },
    "deleteItem": {
      "title": "Delete Item",
      "description": "Are you sure you want to delete {{itemName}}? This action cannot be undone.",
      "successToast": "Item Deleted",
      "successDescription": "The inventory item was successfully removed.",
      "errorToast": "Delete Failed",
      "errorDescription": "There was an error deleting the inventory item."
    },
    "formLabels": {
      "name": "Name",
      "category": "Category",
      "quantity": "Quantity",
      "unit": "Unit",
      "minQuantity": "Minimum Quantity",
      "price": "Price",
      "status": "Status",
      "actions": "Actions"
    },
    "buttons": {
      "addItem": "Add Item",
      "editItem": "Edit Item",
      "updateItem": "Update Item",
      "cancel": "Cancel"
    },
    "errors": {
      "fetchItems": "Failed to fetch inventory items"
    },
    "status": {
      "lowStock": "Low Stock",
      "inStock": "In Stock"
    },
    "actions": {
      "edit": "Edit",
      "delete": "Delete"
    },
    "categories": {
      "drinks": "Drinks",
      "food": "Food",
      "menu_item": "Menu Item"
    },
    "noItems": "No items in inventory",
    "noMatchingItems": "No matching items found",
    "initialLoad": {
      "success": "Menu items loaded successfully",
      "description": "{{count}} items were added to the inventory",
      "error": "Error loading initial items"
    }
  },

  // Inventory Page Translations
  "inventoryPage": {
    "inventory": "Inventory",
    "addItem": "Add Item",
    "edit": "Edit",
    "delete": "Delete",
    "cancel": "Cancel"
  },

  // Inventory Table Headers
  "tableHeaders": {
    "name": "Name",
    "category": "Category",
    "quantity": "Quantity",
    "unit": "Unit",
    "minQuantity": "Min. Quantity",
    "price": "Price",
    "status": "Status",
    "actions": "Actions"
  },

  // Inventory Item Status
  "inventoryItemStatus": {
    "lowStock": {
      "title": "Low Stock",
      "description": "Item is running low and needs restocking",
      "actionRequired": "Restock soon"
    },
    "inStock": {
      "title": "In Stock",
      "description": "Sufficient quantity available",
      "status": "Good"
    },
    "outOfStock": {
      "title": "Out of Stock",
      "description": "Item is currently unavailable",
      "actionRequired": "Order immediately"
    }
  },

  // Inventory Search
  "inventorySearch": {
    "searchPlaceholder": "Search inventory...",
    "filters": {
      "category": "Filter by Category",
      "status": "Filter by Status",
      "lowStock": "Low Stock Items",
      "allItems": "All Items"
    },
    "sorting": {
      "name": "Sort by Name",
      "quantity": "Sort by Quantity",
      "price": "Sort by Price"
    }
  },

  // Inventory Dialogs
  "inventoryDialogs": {
    "addItem": {
      "title": "Add New Inventory Item",
      "description": "Enter details for the new inventory item",
      "successMessage": "Item successfully added to inventory",
      "errorMessage": "Failed to add item to inventory"
    },
    "editItem": {
      "title": "Edit Inventory Item",
      "description": "Update the details of the inventory item",
      "successMessage": "Item details updated successfully",
      "errorMessage": "Failed to update item details"
    },
    "deleteItem": {
      "title": "Delete Inventory Item",
      "description": "Are you sure you want to delete this item?",
      "confirmButton": "Yes, Delete",
      "cancelButton": "Cancel",
      "successMessage": "Item deleted successfully",
      "errorMessage": "Failed to delete item"
    }
  },

  // Inventory Validation Messages
  "inventoryValidation": {
    "name": {
      "required": "Item name is required",
      "minLength": "Item name must be at least 2 characters",
      "maxLength": "Item name cannot exceed 50 characters"
    },
    "category": {
      "required": "Category is required",
      "invalid": "Invalid category selected"
    },
    "quantity": {
      "required": "Quantity is required",
      "positive": "Quantity must be a positive number",
      "max": "Quantity cannot exceed 10000"
    },
    "unit": {
      "required": "Unit of measurement is required"
    },
    "minQuantity": {
      "required": "Minimum quantity is required",
      "positive": "Minimum quantity must be a positive number"
    },
    "price": {
      "required": "Price is required",
      "positive": "Price must be a positive number",
      "max": "Price cannot exceed 100000"
    }
  },

  // Inventory Reporting and Analytics
  "inventoryReporting": {
    "overview": {
      "title": "Inventory Overview",
      "totalItems": "Total Items",
      "totalValue": "Total Inventory Value",
      "lowStockItems": "Low Stock Items",
      "outOfStockItems": "Out of Stock Items"
    },
    "stockTrends": {
      "title": "Stock Trends",
      "lastUpdated": "Last Updated",
      "consumptionRate": "Consumption Rate",
      "restockFrequency": "Restock Frequency"
    },
    "costAnalysis": {
      "title": "Cost Analysis",
      "averageItemCost": "Average Item Cost",
      "highestValueItems": "Highest Value Items",
      "lowestValueItems": "Lowest Value Items"
    }
  },

  // Inventory Alerts and Notifications
  "inventoryAlerts": {
    "lowStock": {
      "title": "Low Stock Alert",
      "description": "One or more items are running low",
      "actionButton": "View Low Stock Items"
    },
    "outOfStock": {
      "title": "Out of Stock Alert",
      "description": "Critical items are currently unavailable",
      "actionButton": "Restock Immediately"
    },
    "expirationSoon": {
      "title": "Expiration Warning",
      "description": "Some items are approaching their expiration date",
      "actionButton": "Review Expiring Items"
    }
  },

  // Inventory Import/Export
  "inventoryImportExport": {
    "import": {
      "title": "Import Inventory",
      "description": "Upload a CSV or Excel file to update inventory",
      "supportedFormats": "Supported Formats: CSV, XLSX",
      "instructions": "Ensure your file matches the required template",
      "templateDownload": "Download Template",
      "successMessage": "Inventory successfully imported",
      "errorMessage": "Failed to import inventory"
    },
    "export": {
      "title": "Export Inventory",
      "description": "Download current inventory data",
      "formats": {
        "csv": "Export as CSV",
        "xlsx": "Export as Excel",
        "pdf": "Export as PDF"
      },
      "successMessage": "Inventory exported successfully",
      "errorMessage": "Failed to export inventory"
    }
  },

  // Inventory Bulk Actions
  "inventoryBulkActions": {
    "title": "Bulk Actions",
    "selectAction": "Select Bulk Action",
    "actions": {
      "updatePrice": "Update Prices",
      "updateQuantity": "Adjust Quantities",
      "changeCategory": "Change Category",
      "markDiscontinued": "Mark as Discontinued"
    },
    "confirmation": {
      "title": "Confirm Bulk Action",
      "description": "Are you sure you want to apply this action to selected items?",
      "successMessage": "Bulk action completed successfully",
      "errorMessage": "Failed to complete bulk action"
    }
  },

  // Settings
  "settings": {
    "title": "Settings",
    "description": "Manage your account settings and personal information",
    "profile": {
      "title": "Profile",
      "description": "Manage your personal information and account settings",
      "fields": {
        "username": "Username",
        "email": {
          "label": "Email",
          "cannotBeChanged": "Email address cannot be changed"
        },
        "phoneNumber": "Phone Number",
        "position": {
          "label": "Position",
          "placeholder": "Enter your job position"
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
      },
      "actions": {
        "uploadPhoto": "Upload Photo",
        "submit": "Save Changes",
        "submitting": "Saving...",
        "profileUpdated": "Profile Updated",
        "profileUpdateSuccess": "Your profile has been successfully updated.",
        "profileUpdateFailed": "Profile Update Failed",
        "profileUpdateError": "An error occurred while updating your profile."
      }
    },
    "notifications": {
      "title": "Notifications",
      "description": "Configure how you receive notifications",
      "types": {
        "title": "Notification Types",
        "newOrders": {
          "label": "New Orders",
          "description": "Get notified when new orders are placed"
        },
        "orderUpdates": {
          "label": "Order Updates", 
          "description": "Receive updates about order status changes"
        },
        "inventoryAlerts": {
          "label": "Inventory Alerts",
          "description": "Be informed about inventory or stock issues"
        },
        "systemAnnouncements": {
          "label": "System Announcements",
          "description": "Receive important system notifications"
        },
        "dailyReports": {
          "label": "Daily Reports",
          "description": "Get daily summary reports"
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
          "description": "Receive real-time notifications on your device"
        },
        "soundAlerts": {
          "label": "Sound Alerts",
          "description": "Play sound alerts for notifications"
        }
      },
      "frequency": {
        "immediate": "Immediate",
        "daily": "Daily",
        "weekly": "Weekly",
        "never": "Never"
      },
      "actions": {
        "save": "Save Preferences",
        "saving": "Saving...",
        "submit": "Submit",
        "saved": "Notification Preferences Updated",
        "saveSuccess": "Your notification preferences have been successfully updated.",
        "saveFailed": "Failed to Update Notification Preferences",
        "saveError": "An error occurred while updating your notification preferences."
      }
    },
    "language": {
      "title": "Language",
      "description": "Select your preferred language for the application",
      "languages": {
        "en": "English",
        "es": "Spanish",
        "pt": "Portuguese"
      },
      "actions": {
        "saveChanges": "Save Changes",
        "saving": "Saving...",
        "submit": "Submit",
        "saved": "Language Updated",
        "saveSuccess": "Your language preference has been successfully updated."
      }
    },
    "appearance": {
      "title": "Appearance",
      "description": "Customize the look and feel of the application",
      "modes": {
        "light": {
          "label": "Light Mode",
          "icon": "sun"
        },
        "dark": {
          "label": "Dark Mode",
          "icon": "moon"
        },
        "system": {
          "label": "System Mode",
          "icon": "monitor"
        }
      },
      "actions": {
        "save": "Save Changes",
        "saving": "Saving...",
        "saved": "Appearance Preferences Updated",
        "saveSuccess": "Your appearance preferences have been successfully updated.",
        "saveFailed": "Failed to Update Appearance Preferences",
        "saveError": "An error occurred while updating your appearance preferences."
      }
    },
    "tableMaps": {
      "title": "Table Maps",
      "description": "Create and manage restaurant table layouts",
      "addNew": "Add New Map",
      "edit": "Edit Map",
      "delete": "Delete Map",
      "name": "Table Map",
      "notFound": {
        "title": "Table Map Not Found",
        "description": "The table map you are looking for does not exist.",
        "backToSettings": "Back to Settings"
      }
    },
    "system": {
      "title": "System",
      "description": "Configure system-wide settings"
    }
  },

  // Profile
  "profile": {
    "username": "Username",
    "email": "Email",
    "phoneNumber": "Phone Number",
    "position": "Position",
    "positionPlaceholder": "e.g. Head Waiter, Bartender",
    "role": "Role",
    "selectRole": "Select a role",
    "uploadPhoto": "Upload Photo",
    "emailCannotBeChanged": "Email cannot be changed",
    "saveChanges": "Save Changes",
    "saving": "Saving...",
    "profileUpdated": "Profile Updated",
    "profileUpdateSuccess": "Your profile has been updated successfully",
    "profileUpdateFailed": "Profile Update Failed",
    "profileUpdateError": "There was an error updating your profile"
  },

  // Login Page Translations
  "loginPage": {
    "login": "Login",
    "emailRequired": "Email is required",
    "passwordRequired": "Password is required",
    "forgotPassword": "Forgot Password",
    "register": "Register"
  },

  // Registration Page Translations
  "registrationPage": {
    "createAccountDescription": "Create a new account to access the restaurant management system",
    "usernameRequired": "Username is required",
    "usernameMinLength": "Username must be at least 3 characters long",
    "confirmPassword": "Confirm Password",
    "passwordsDoNotMatch": "Passwords do not match",
    "passwordRequirements": "Password must include uppercase, lowercase, and number",
    "passwordMinLength": "Password must be at least 8 characters long",
    "acceptTerms": "I accept the Terms and Conditions",
    "acceptTermsRequired": "You must accept the terms and conditions",
    "registrationSuccessful": "Registration Successful",
    "accountCreated": "Your account has been created successfully",
    "registrationFailed": "Registration Failed",
    "emailAlreadyInUse": "Email is already in use",
    "passwordTooWeak": "Password is too weak"
  },

  // Forgot Password Page
  "forgotPasswordPage": {
    "pageTitle": "Forgot Password",
    "emailInstructions": {
      "initial": "Enter your email to receive password reset instructions",
      "sent": "Check your email for password reset instructions"
    },
    "emailSentMessage": {
      "main": "We've sent password reset instructions to {{email}}",
      "spam": "If you don't see the email, check your spam folder"
    },
    "buttons": {
      "sendInstructions": "Send Reset Instructions",
      "tryAnotherEmail": "Try another email",
      "sending": "Sending..."
    },
    "errors": {
      "emailRequired": "Email is required",
      "authServiceUnavailable": "Authentication service not available",
      "userNotFound": "No account found with this email address",
      "generic": "Failed to send password reset email"
    },
    "loginReminder": {
      "text": "Remember your password?",
      "link": "Login"
    }
  },

  // Dashboard Translations
  "dashboard": {
    "title": "Main Dashboard",
    "dashboard": "Dashboard",
    "salesOverview": {
      "title": "Sales Overview",
      "description": "Daily sales overview",
      "totalSales": "Total Sales: {{amount}}",
      "monthlyGrowth": "+{{percentage}}% since last month",
      "dailySalesTrend": "Day {{day}} Sales: {{amount}}",
      "dailySalesTrendFormat": "Day {{day}}: {{amount}}"
    },
    "topSellingItems": {
      "title": "Top Selling Items",
      "description": "Most popular items",
      "orderCount": "{{count, number}} orders"
    },
    "stockLevel": {
      "title": "Inventory Status",
      "description": "Current stock levels",
      "percentage": "{{percentage}}%",
      "lowStockItems": "{{count, number}} items with low stock"
    },
    "recentOrders": "Recent Orders",
    "salesTrend": "Sales Trend",
    "dailySalesOverview": "Daily sales overview",
    "mostPopularItems": "Most popular items",
    "inventoryStatus": "Inventory status",
    "tableNumber": "Table",
    "noRecentOrders": "No recent orders found",
    "comparedToLastMonth": "+{{percentage}}% from last month",
    "lowStockItems": "{{count}} items with low stock",
    "categoriesSales": "Sales by category",
    "salesDataPeriod": "Sales data for the current period",
    "categories": "Categories"
  },

  // Orders Page Translations
  "ordersPage": {
    "orders": "Orders",
    "newOrder": "New Order",
    "search": {
      "placeholder": "Search orders..."
    },
    "filter": {
      "allStatuses": "All Statuses"
    },
    "orderStatus": {
      "01": "Pending",
      "02": "In Preparation",
      "03": "Ready to Serve",
      "04": "Delivered",
      "05": "Cancelled",
      "06": "Paid",
      "07": "Sent",
      "08": "In Transit",
      "09": "Completed",
      "10": "Refunded",
      "11": "Waiting",
      "12": "Scheduled",
      "13": "Partially Paid",
      "14": "Payment Error",
      "15": "Rejected",
      "16": "Processing",
      "17": "Confirmed",
      "18": "Preparation Started",
      "19": "Almost Ready",
      "20": "Waiting for Customer",
      "21": "Table Service",
      "22": "Take Away",
      "23": "Delivery",
      "24": "Reservation",
      "25": "Urgent",
      "70": "Final Status"
    },
    "table": {
      "id": "ID",
      "table": "Table",
      "waiter": "Waiter",
      "items": "Items",
      "status": "Status",
      "total": "Total",
      "actions": "Actions"
    }, 
    "actions": {
      "updateStatus": "Update Status",
      "updateStatusDescription": "Update status for order {{orderId}}",
      "selectStatus": "Select new status",
      "delete": "Delete Order",
      "deleteOrder": "Delete Order",
      "view": "View Order",
      "deleteOrderConfirmation": "Are you sure you want to delete order {{orderId}}?"
    },
    "noOrdersFound": "No orders found",
    "error": {
      "fetchFailed": "Failed to fetch orders",
      "updateStatusFailed": "Failed to update order status",
      "deleteFailed": "Failed to delete order"
    },
    "success": {
      "statusUpdated": "Order status updated",
      "orderDeleted": "Order deleted"
    }
  },

  // Firebase Test page
  "firebaseTestPage": {
    "pageTitle": "Firebase Configuration Test",
    "pageDescription": "Test your Firebase configuration to ensure everything is working correctly",
    "firebaseInitialized": "Firebase Initialized",
    "firebaseApp": "Firebase App",
    "firebaseAuth": "Firebase Auth",
    "firebaseFirestore": "Firebase Firestore",
    "runTests": "Run Tests",
    "configStatus": "Firebase Config",
    "apiKey": "API Key",
    "authDomain": "Auth Domain",
    "projectId": "Project ID",
    "storageBucket": "Storage Bucket",
    "messagingSenderId": "Messaging Sender ID",
    "appId": "App ID",
    "set": "✓ Set",
    "missing": "✗ Missing"
  },

  "sidebar": {
    "appName": "Restaurant Management",
    "dashboard": "Dashboard",
    "orders": "Orders",
    "tables": "Tables",
    "inventory": "Inventory",
    "users": "Users",
    "settings": "Settings",
    "logout": "Logout"
  },

  // Tables Translations
  "tables": {
    "pageTitle": "Restaurant Tables",
    "addTable": "Add New Table",
    "tableName": "Table Name",
    "tableCapacity": "Capacity",
    "tableStatus": "Status",
    "actions": "Actions",
    "search": "Search tables",
    "sortBy": "Sort by",
    "tableNumber": "Table Number",
    "seats": "Seats",
    "noTablesMatchFilter": "No tables match the filter",
    "noTablesInMap": "No tables in the map",
    "status": {
      "available": "Available",
      "occupied": "Occupied", 
      "reserved": "Reserved",
      "ordering": "Ordering",
      "preparing": "Preparing",
      "ready": "Ready",
      "served": "Served"
    },
    "tableMaps": {
      "title": "Table Maps",
      "createMap": "Create Table Map",
      "editMap": "Edit Table Map",
      "mapName": "Map Name",
      "mapDescription": "Map Description",
      "noMapsFound": "No table maps found",
      "layout": "Map Layout",
      "addTable": "Add Table",
      "tablePosition": "Table Position",
      "tableCapacity": "Table Capacity",
      "viewMap": "View Table Map",
      "addMap": "Add Table Map",
      "deleteMap": "Delete Table Map"
    }
  },

  "tableMap": {
    "views": {
      "map": "Map View",
      "grid": "Grid View"
    },
    "actions": {
      "addTable": "Add Table",
      "editMap": "Edit Map",
      "deleteMap": "Delete Map",
      "changeView": "Change View",
      "viewMap": "View Map"
    },
    "statuses": {
      "available": "Available",
      "occupied": "Occupied",
      "reserved": "Reserved",
      "maintenance": "Maintenance",
      "ordering": "Ordering",
      "preparing": "Preparing",
      "ready": "Ready",
      "served": "Served"
    },
    "table": {
      "details": {
        "seats": "Seats",
        "status": "Status",
        "activeOrder": "Active Order"
      },
      "actions": {
        "view": "View Details",
        "edit": "Edit Table",
        "delete": "Delete Table",
        "changeStatus": "Change Status"
      }
    },
    "notFound": {
      "title": "Table Map Not Found",
      "description": "The table map you are looking for does not exist.",
      "backToSettings": "Back to Settings"
    }
  },

  "tableCard": {
    "label": "Table",
    "details": {
      "seats": "Seats",
      "shape": {
        "square": "Square",
        "rectangle": "Rectangular",
        "circle": "Circular"
      }
    },
    "status": {
      "available": "Available",
      "occupied": "Occupied",
      "reserved": "Reserved",
      "maintenance": "Maintenance",
      "ordering": "Ordering",
      "preparing": "Preparing",
      "ready": "Ready",
      "served": "Served"
    },
    "actions": {
      "viewOrder": "View Order",
      "createOrder": "Create Order",
      "editTable": "Edit Table",
      "deleteTable": "Delete Table",
      "markAsServed": "Mark as Served",
      "closeOrder": "Close Order",
      "changeStatus": "Change Status",
      "edit": "Edit",
      "delete": "Delete"
    },
    "menu": {
      "editTable": "Edit Table",
      "deleteTable": "Delete Table",
      "maintenance": "Maintenance"
    },
    "errors": {
      "updateStatus": "Could not update table status",
      "sync": "Could not sync table",
      "closeOrder": "Could not close the order",
      "markAsServed": "Could not mark the order as served"
    }
  },

  "userProfile": {
    "title": "Profile",
    "description": "Manage your profile settings and information",
    "actions": {
      "uploadPhoto": "Upload Photo",
      "saveChanges": "Save Changes",
      "saving": "Saving..."
    },
    "fields": {
      "username": "Username",
      "email": {
        "label": "Email",
        "cannotBeChanged": "Email cannot be changed"
      },
      "phoneNumber": "Phone Number",
      "position": {
        "label": "Position",
        "placeholder": "Enter your job position"
      },
      "role": {
        "label": "Role",
        "placeholder": "Select a role",
        "options": {
          "admin": "Admin",
          "manager": "Manager", 
          "chef": "Chef",
          "waiter": "Waiter"
        }
      }
    },
    "notifications": {
      "profileUpdated": "Profile Updated",
      "profileUpdateSuccess": "Your profile has been successfully updated.",
      "profileUpdateFailed": "Profile Update Failed",
      "profileUpdateError": "An error occurred while updating your profile."
    }
  },

  "tableMapSettings": {
    "title": "Table Maps",
    "description": "Manage and configure table maps for your restaurant",
    "actions": {
      "create": "Create",
      "cancel": "Cancel",
      "createTableMap": "Create Table Map",
      "viewTableMap": "View Table Map",
      "editTableMap": "Edit Table Map",
      "deleteTableMap": "Delete Table Map",
      "addTable": "Add Table",
      "editTable": "Edit Table",
      "deleteTable": "Delete Table"
    },
    "form": {
      "mapName": {
        "label": "Map Name",
        "placeholder": "Enter map name"
      },
      "mapDescription": {
        "label": "Map Description",
        "placeholder": "Enter map description"
      }
    },
    "empty": {
      "title": "No Table Maps Found",
      "description": "Create your first table map to get started"
    },
    "notifications": {
      "mapCreated": "Table Map Created",
      "mapUpdated": "Table Map Updated",
      "mapDeleted": "Table Map Deleted",
      "mapCreationFailed": "Failed to Create Table Map",
      "mapUpdateFailed": "Failed to Update Table Map",
      "mapDeletionFailed": "Failed to Delete Table Map"
    }
  },

  "tableDialog": {
    "title": "Add New Table",
    "description": "Create a new table for the selected table map",
    "labels": {
      "tableName": "Table Name",
      "tableCapacity": "Table Capacity"
    },
    "placeholders": {
      "tableName": "E.g. Table 1",
      "tableCapacity": "Number of seats"
    },
    "actions": {
      "create": "Create Table",
      "cancel": "Cancel",
      "save": "Save Table",
      "edit": "Edit Table"
    },
    "errors": {
      "generateName": "Could not generate table name",
      "create": "Could not create table",
      "update": "Could not update table",
      "invalidCapacity": "Capacity must be a number greater than 0"
    },
    "success": {
      "create": "Table created successfully",
      "update": "Table updated successfully"
    }
  },

  "newOrderPage": {
    "title": "Create New Order",
    "orderDetails": "Order Details",
    "currentOrder": "Current Order",
    "tableNumber": "Table Number",
    "tableNumberPlaceholder": "Enter table number",
    "selectItem": "Select Item",
    "selectItemPlaceholder": "Choose an item to add",
    "quantity": "Quantity",
    "notes": "Notes",
    "notesPlaceholder": "Special instructions",
    "addToOrder": "Add to Order",
    "noItemsInOrder": "No items have been added to the order yet",
    "total": "Total",
    "createOrder": "Submit Order",
    "table": {
      "item": "Item",
      "quantity": "Qty",
      "price": "Price",
      "total": "Total",
      "actions": "Actions"
    },
    "error": {
      "noItem": "Please select an item",
      "noTable": "Please enter a table number",
      "noItems": "Please add at least one item to the order",
      "orderCreationFailed": "Could not create the order"
    },
    "success": {
      "orderCreated": "Order Created",
      "orderCreatedDescription": "Order for Table {{tableNumber}} has been created successfully"
    }
  },

  "users": {
    "pageTitle": "Users",
    "userList": "User List",
    "addUser": "Add User",
    "searchPlaceholder": "Search users...",
    "noUsers": "No users found",
    "username": "Username",
    "email": "Email",
    "role": "Role",
    "createdAt": "Created At",
    "lastLogin": "Last Login",
    "status": "Status",
    "actions": "Actions",
    "openMenu": "Open menu",
    "copyId": "Copy ID",
    "roles": {
      "admin": "Administrator",
      "manager": "Manager",
      "chef": "Chef",
      "waiter": "Waiter"
    },
    "userStatus": {
      "active": "Active",
      "inactive": "Inactive"
    },
    "errors": {
      "fetchUsers": "Error fetching users"
    }
  },

  "orderForm": {
    "title": "Create Order",
    "selectTable": "Select Table",
    "selectCategory": "Select Category",
    "selectItem": "Select Item",
    "quantity": "Quantity",
    "notes": "Notes",
    "addItem": "Add Item",
    "orderItems": "Order Items",
    "noItemsAdded": "No items added",
    "dietaryRestrictions": {
      "title": "Dietary Restrictions",
      "vegetarian": "Vegetarian",
      "vegan": "Vegan",
      "glutenFree": "Gluten Free",
      "lactoseFree": "Lactose Free"
    },
    "specialInstructions": {
      "label": "Special Instructions",
      "hasInstructions": "Do you have special instructions?"
    }
  },

  "status": {
    "available": "Available",
    "occupied": "Occupied",
    "reserved": "Reserved",
    "maintenance": "Maintenance",
    "ordering": "Ordering",
    "preparing": "Preparing",
    "ready": "Ready",
    "served": "Served"
  },
  "actions": {
    "viewOrder": "View Order",
    "createOrder": "Create Order",
    "editTable": "Edit Table",
    "deleteTable": "Delete Table",
    "markAsServed": "Mark as Served",
    "closeOrder": "Close Order",
    "changeStatus": "Change Status",
    "edit": "Edit",
    "delete": "Delete"
  },
  "menu": {
    "editTable": "Edit Table",
    "deleteTable": "Delete Table",
    "maintenance": "Maintenance"
  },
  "errors": {
    "updateStatus": "Could not update table status",
    "sync": "Could not sync table",
    "closeOrder": "Could not close the order",
    "markAsServed": "Could not mark the order as served"
  }
}

export default enTranslations;