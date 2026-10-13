// Role Based Access Control (RBAC) permission definitions and registry.
// Every route handler, server action, and API endpoint must check against this registry.
// Default deny: any action not explicitly granted is rejected.

export type Role = "owner" | "manager" | "staff" | "support" | "customer";

export type Permission =
  | "catalog:read"
  | "catalog:write"
  | "catalog:publish"
  | "inventory:read"
  | "inventory:write"
  | "inventory:adjust"
  | "inventory:recall"
  | "orders:read"
  | "orders:process"
  | "orders:cancel"
  | "shipments:read"
  | "shipments:write"
  | "returns:read"
  | "returns:review"
  | "returns:override"
  | "refunds:create"
  | "refunds:create_unlimited"
  | "cod:settle"
  | "settings:read"
  | "settings:write"
  | "staff:manage"
  | "audit:read"
  | "reports:read";

// Defined role permission map directly conforming to docs/routes-and-permissions.md
const rolePermissions: Record<Role, readonly Permission[]> = {
  owner: [
    "catalog:read",
    "catalog:write",
    "catalog:publish",
    "inventory:read",
    "inventory:write",
    "inventory:adjust",
    "inventory:recall",
    "orders:read",
    "orders:process",
    "orders:cancel",
    "shipments:read",
    "shipments:write",
    "returns:read",
    "returns:review",
    "returns:override",
    "refunds:create",
    "refunds:create_unlimited",
    "cod:settle",
    "settings:read",
    "settings:write",
    "staff:manage",
    "audit:read",
    "reports:read",
  ],
  manager: [
    "catalog:read",
    "catalog:write",
    "catalog:publish",
    "inventory:read",
    "inventory:write",
    "inventory:adjust",
    "inventory:recall",
    "orders:read",
    "orders:process",
    "orders:cancel",
    "shipments:read",
    "shipments:write",
    "returns:read",
    "returns:review",
    "returns:override",
    "refunds:create",
    "cod:settle",
    "settings:read",
    "settings:write",
    "audit:read",
    "reports:read",
  ],
  staff: [
    "catalog:read",
    "catalog:write",
    "inventory:read",
    "inventory:write",
    "orders:read",
    "orders:process",
    "orders:cancel",
    "shipments:read",
    "shipments:write",
    "returns:read",
    "returns:review",
  ],
  support: [
    "catalog:read",
    "inventory:read",
    "orders:read",
    "orders:cancel",
    "shipments:read",
    "returns:read",
  ],
  customer: [],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  const allowed = rolePermissions[role];
  if (!allowed) {
    return false;
  }
  return allowed.includes(permission);
}

export function assertPermission(role: Role, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(
      `Forbidden: Role "${role}" lacks required permission "${permission}".`,
    );
  }
}
