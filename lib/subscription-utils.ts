import { SubscriptionPlan, SUBSCRIPTION_PLANS, SubscriptionPlanLimits } from '@/types';

/**
 * Get the subscription plan limits for a given plan
 */
export function getPlanLimits(plan: SubscriptionPlan): SubscriptionPlanLimits {
  return SUBSCRIPTION_PLANS[plan];
}

/**
 * Check if a user can access a specific feature based on their subscription plan
 */
export function canAccessFeature(
  plan: SubscriptionPlan | undefined,
  feature: keyof SubscriptionPlanLimits['features']
): boolean {
  if (!plan) return false;
  const planLimits = getPlanLimits(plan);
  return planLimits.features[feature];
}

/**
 * Check if a user can add more users to their establishment
 */
export function canAddMoreUsers(
  plan: SubscriptionPlan | undefined,
  currentUsers: number
): boolean {
  if (!plan) return false;
  const planLimits = getPlanLimits(plan);
  if (planLimits.maxUsers === -1) return true; // Unlimited
  return currentUsers < planLimits.maxUsers;
}

/**
 * Check if a user can add more inventory items
 */
export function canAddMoreInventoryItems(
  plan: SubscriptionPlan | undefined,
  currentItems: number
): boolean {
  if (!plan) return false;
  const planLimits = getPlanLimits(plan);
  if (planLimits.maxInventoryItems === -1) return true; // Unlimited
  return currentItems < planLimits.maxInventoryItems;
}

/**
 * Get the maximum number of inventory items allowed for a plan
 */
export function getMaxInventoryItems(plan: SubscriptionPlan | undefined): number {
  if (!plan) return 0;
  const planLimits = getPlanLimits(plan);
  return planLimits.maxInventoryItems;
}

/**
 * Get the maximum number of users allowed for a plan
 */
export function getMaxUsers(plan: SubscriptionPlan | undefined): number {
  if (!plan) return 0;
  const planLimits = getPlanLimits(plan);
  return planLimits.maxUsers;
}

/**
 * Check if a user has access to advanced reports
 */
export function hasAdvancedReports(plan: SubscriptionPlan | undefined): boolean {
  return canAccessFeature(plan, 'advancedReports');
}

/**
 * Check if a user has access to inventory management
 */
export function hasInventoryManagement(plan: SubscriptionPlan | undefined): boolean {
  return canAccessFeature(plan, 'inventoryManagement');
}

/**
 * Check if a user has access to delivery integrations
 */
export function hasDeliveryIntegrations(plan: SubscriptionPlan | undefined): boolean {
  return canAccessFeature(plan, 'deliveryIntegrations');
}

/**
 * Check if a user has access to basic API
 */
export function hasBasicApi(plan: SubscriptionPlan | undefined): boolean {
  return canAccessFeature(plan, 'basicApi');
}

/**
 * Check if a user has access to advanced API
 */
export function hasAdvancedApi(plan: SubscriptionPlan | undefined): boolean {
  return canAccessFeature(plan, 'advancedApi');
}

/**
 * Check if a user has access to multiple locations
 */
export function hasMultipleLocations(plan: SubscriptionPlan | undefined): boolean {
  return canAccessFeature(plan, 'multipleLocations');
}

/**
 * Check if a user has priority support
 */
export function hasPrioritySupport(plan: SubscriptionPlan | undefined): boolean {
  return canAccessFeature(plan, 'prioritySupport');
}

/**
 * Check if a user has a dedicated account manager
 */
export function hasAccountManager(plan: SubscriptionPlan | undefined): boolean {
  return canAccessFeature(plan, 'accountManager');
}

/**
 * Check if a user has full customization
 */
export function hasFullCustomization(plan: SubscriptionPlan | undefined): boolean {
  return canAccessFeature(plan, 'fullCustomization');
}

/**
 * Get a user-friendly message when a feature is not available
 */
export function getFeatureNotAvailableMessage(feature: keyof SubscriptionPlanLimits['features']): string {
  const messages: Record<keyof SubscriptionPlanLimits['features'], string> = {
    orderManagement: 'Order management is not available in your plan',
    tableManagement: 'Table management is not available in your plan',
    basicReports: 'Basic reports are not available in your plan',
    advancedReports: 'Advanced reports require a Professional or Enterprise plan',
    inventoryManagement: 'Inventory management requires a Professional or Enterprise plan',
    deliveryIntegrations: 'Delivery integrations require a Professional or Enterprise plan',
    emailSupport: 'Email support is not available in your plan',
    chatSupport: 'Chat support requires a Professional or Enterprise plan',
    prioritySupport: 'Priority support requires an Enterprise plan',
    mobileApp: 'Mobile app is not available in your plan',
    basicApi: 'Basic API requires a Professional or Enterprise plan',
    advancedApi: 'Advanced API requires an Enterprise plan',
    multipleLocations: 'Multiple locations require an Enterprise plan',
    accountManager: 'Dedicated account manager requires an Enterprise plan',
    fullCustomization: 'Full customization requires an Enterprise plan',
  };
  return messages[feature];
}
