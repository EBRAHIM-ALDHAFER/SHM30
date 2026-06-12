import { SahmDatabaseService } from "./dbService";
import { SubscriptionPlan, PlanFeature, TenantSubscription, TenantFeatureOverride } from "../../types";

export class SubscriptionGuard {
  private static instance: SubscriptionGuard;
  private db: SahmDatabaseService;

  private constructor() {
    this.db = SahmDatabaseService.getInstance();
  }

  public static getInstance(): SubscriptionGuard {
    if (!SubscriptionGuard.instance) {
      SubscriptionGuard.instance = new SubscriptionGuard();
    }
    return SubscriptionGuard.instance;
  }

  /**
   * Resolves the plan ID from a plan name string (stored in CompanyProfile).
   */
  public resolvePlanIdFromName(planName: string): string {
    const name = planName || "";
    if (name.includes("مجانية") || name.toLowerCase().includes("free") || name.toLowerCase().includes("basic")) {
      return "plan_free";
    }
    if (name.includes("الاحترافية") || name.toLowerCase().includes("pro")) {
      return "plan_pro";
    }
    if (name.includes("الشركات") || name.toLowerCase().includes("corporate") || name.toLowerCase().includes("enterprise")) {
      return "plan_corporate";
    }
    return "plan_free"; // Default fallback
  }

  /**
   * Gets the current plan for a tenant.
   */
  public async getCurrentPlan(tenantId: string): Promise<{ planId: string; planName: string; status: string; isCustom: boolean }> {
    if (!tenantId || tenantId === "tenant-local") {
      return { planId: "plan_free", planName: "الباقة المجانية 👑", status: "active", isCustom: false };
    }

    try {
      // 1. Check tenant_subscriptions table
      const subs = await this.db.getTenantSubscriptions();
      const tenantSub = subs.find(s => s.tenant_id === tenantId);

      if (tenantSub) {
        // Find subscription plan info
        const plans = await this.db.getSubscriptionPlans();
        const plan = plans.find(p => p.id === tenantSub.plan_id);
        
        return {
          planId: tenantSub.plan_id || "plan_free",
          planName: plan ? plan.name_ar : "باقة مخصصة",
          status: tenantSub.status || "active",
          isCustom: tenantSub.plan_id === "plan_custom" || !plan
        };
      }

      // 2. Fallback: check companies table
      const isOnline = typeof navigator !== "undefined" && navigator.onLine;
      let companyName = "";
      let planNameStr = "الباقة المجانية 👑";
      let status = "active";

      if (this.db.isSupabaseConnected() && isOnline) {
        const { data: comp } = await this.db.getRawSupabaseClient()
          .from("companies")
          .select("name, subscription_plan, status")
          .eq("tenant_id", tenantId)
          .maybeSingle();
        if (comp) {
          planNameStr = comp.subscription_plan || "الباقة المجانية 👑";
          status = comp.status || "active";
        }
      } else {
        const saved = localStorage.getItem("sahm_web_companies");
        const list = saved ? JSON.parse(saved) : [];
        const comp = list.find((c: any) => c.tenant_id === tenantId);
        if (comp) {
          planNameStr = comp.subscriptionPlan || "الباقة المجانية 👑";
          status = comp.status || "active";
        }
      }

      const planId = this.resolvePlanIdFromName(planNameStr);
      return {
        planId,
        planName: planNameStr,
        status: status === "suspended" ? "suspended" : "active",
        isCustom: false
      };
    } catch (err) {
      console.error("[SubscriptionGuard] Error in getCurrentPlan:", err);
      return { planId: "plan_free", planName: "الباقة المجانية 👑", status: "active", isCustom: false };
    }
  }

  /**
   * Checks if a tenant can use a specific feature.
   */
  public async canUseFeature(tenantId: string, featureKey: string): Promise<boolean> {
    if (!tenantId || tenantId === "tenant-local") {
      return true; // No guard in local demo
    }

    try {
      // 1. Check active subscription status
      const current = await this.getCurrentPlan(tenantId);
      if (["suspended", "expired", "cancelled"].includes(current.status)) {
        return false; // Subscription is inactive
      }

      // 2. Check feature overrides for this tenant
      const overrides = await this.db.getTenantFeatureOverrides(tenantId);
      const featureOverride = overrides.find(o => o.feature_key === featureKey);
      if (featureOverride) {
        return featureOverride.enabled;
      }

      // If it is a custom plan, check if we stored custom features in overrides
      if (current.isCustom) {
        // Custom plan features are governed entirely by tenant_feature_overrides.
        // If no override exists, we assume false.
        return false;
      }

      // 3. Fallback to standard plan features
      const features = await this.db.getPlanFeatures(current.planId);
      const feat = features.find(f => f.feature_key === featureKey);
      return feat ? feat.enabled : false;
    } catch (err) {
      console.error("[SubscriptionGuard] Error checking feature:", err);
      return true; // Soft fail - allow access
    }
  }

  /**
   * Checks if a tenant has exceeded a resource limit.
   */
  public async checkLimit(
    tenantId: string,
    limitKey: string,
    currentUsage: number
  ): Promise<{ allowed: boolean; limit: number; isUnlimited: boolean; overrideUsed: boolean }> {
    if (!tenantId || tenantId === "tenant-local") {
      return { allowed: true, limit: 999999, isUnlimited: true, overrideUsed: false };
    }

    try {
      // 1. Check active subscription status
      const current = await this.getCurrentPlan(tenantId);
      if (["suspended", "expired", "cancelled"].includes(current.status)) {
        return { allowed: false, limit: 0, isUnlimited: false, overrideUsed: false };
      }

      // 2. Check overrides for limit
      const overrides = await this.db.getTenantFeatureOverrides(tenantId);
      const limitKeyWithPrefix = `limit_${limitKey}`;
      const limitOverride = overrides.find(o => o.feature_key === limitKeyWithPrefix);

      if (limitOverride) {
        if (limitOverride.is_unlimited) {
          return { allowed: true, limit: 999999, isUnlimited: true, overrideUsed: true };
        }
        return {
          allowed: currentUsage < limitOverride.limit_value,
          limit: limitOverride.limit_value,
          isUnlimited: false,
          overrideUsed: true
        };
      }

      // If custom plan, overrides govern limits. If not found, default to 0
      if (current.isCustom) {
        return { allowed: false, limit: 0, isUnlimited: false, overrideUsed: false };
      }

      // 3. Check plan standard limits
      const features = await this.db.getPlanFeatures(current.planId);
      const planLimit = features.find(f => f.feature_key === limitKeyWithPrefix);

      if (planLimit) {
        if (planLimit.is_unlimited) {
          return { allowed: true, limit: 999999, isUnlimited: true, overrideUsed: false };
        }
        return {
          allowed: currentUsage < planLimit.limit_value,
          limit: planLimit.limit_value,
          isUnlimited: false,
          overrideUsed: false
        };
      }

      // Default fallback limits if no db record matches
      let fallbackVal = 0;
      if (current.planId === "plan_pro") {
        if (limitKey === "invoices") fallbackVal = 10000;
        else if (limitKey === "products") fallbackVal = 5000;
        else if (limitKey === "users") fallbackVal = 5;
        else if (limitKey === "branches") fallbackVal = 3;
        else if (limitKey === "pos") fallbackVal = 3;
        else if (limitKey === "warehouses") fallbackVal = 3;
      } else if (current.planId === "plan_corporate") {
        return { allowed: true, limit: 999999, isUnlimited: true, overrideUsed: false };
      } else {
        // plan_free
        if (limitKey === "invoices") fallbackVal = 1000;
        else if (limitKey === "products") fallbackVal = 100;
        else if (limitKey === "users") fallbackVal = 1;
        else if (limitKey === "branches") fallbackVal = 1;
        else if (limitKey === "pos") fallbackVal = 1;
        else if (limitKey === "warehouses") fallbackVal = 1;
      }

      return {
        allowed: currentUsage < fallbackVal,
        limit: fallbackVal,
        isUnlimited: false,
        overrideUsed: false
      };
    } catch (err) {
      console.error("[SubscriptionGuard] Error checking limit:", err);
      return { allowed: true, limit: 999999, isUnlimited: true, overrideUsed: false };
    }
  }
}
