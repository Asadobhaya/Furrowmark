import { describe, it, expect } from "vitest";
import { hasPermission, assertPermission } from "./permissions";

describe("RBAC Permissions Matrix Verification", () => {
  it("Owner has all required permissions", () => {
    expect(hasPermission("owner", "catalog:publish")).toBe(true);
    expect(hasPermission("owner", "inventory:recall")).toBe(true);
    expect(hasPermission("owner", "refunds:create_unlimited")).toBe(true);
    expect(hasPermission("owner", "staff:manage")).toBe(true);
    expect(hasPermission("owner", "reports:read")).toBe(true);
  });

  it("Manager has operational authority but cannot execute unlimited refunds or manage staff accounts", () => {
    expect(hasPermission("manager", "catalog:publish")).toBe(true);
    expect(hasPermission("manager", "inventory:recall")).toBe(true);
    expect(hasPermission("manager", "refunds:create")).toBe(true);
    expect(hasPermission("manager", "refunds:create_unlimited")).toBe(false);
    expect(hasPermission("manager", "staff:manage")).toBe(false);
  });

  it("Staff cannot publish products or start recalls", () => {
    expect(hasPermission("staff", "catalog:write")).toBe(true);
    expect(hasPermission("staff", "catalog:publish")).toBe(false);
    expect(hasPermission("staff", "inventory:recall")).toBe(false);
    expect(hasPermission("staff", "refunds:create")).toBe(false);
    expect(hasPermission("staff", "reports:read")).toBe(false);
  });

  it("Support has read-only access plus order cancellation", () => {
    expect(hasPermission("support", "catalog:read")).toBe(true);
    expect(hasPermission("support", "catalog:write")).toBe(false);
    expect(hasPermission("support", "orders:cancel")).toBe(true);
    expect(hasPermission("support", "orders:process")).toBe(false);
    expect(hasPermission("support", "inventory:write")).toBe(false);
  });

  it("Customer has zero administrative permissions (deny by default)", () => {
    expect(hasPermission("customer", "catalog:write")).toBe(false);
    expect(hasPermission("customer", "orders:read")).toBe(false);
    expect(hasPermission("customer", "reports:read")).toBe(false);
  });

  it("assertPermission throws Error on forbidden access", () => {
    expect(() => assertPermission("staff", "catalog:publish")).toThrowError(
      /Forbidden/,
    );
    expect(() => assertPermission("owner", "catalog:publish")).not.toThrow();
  });
});
