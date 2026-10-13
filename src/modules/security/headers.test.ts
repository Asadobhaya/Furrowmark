import { describe, it, expect } from "vitest";
import { getSecurityHeaders } from "./headers";

describe("Security Headers Verification", () => {
  it("Includes strict CSP with nonce and blocks unsafe-inline/eval", () => {
    const nonce = "random-test-nonce-12345";
    const headers = getSecurityHeaders(nonce);

    expect(headers["Content-Security-Policy"]).toBeDefined();
    const csp = headers["Content-Security-Policy"]!;

    expect(csp).toContain(`'nonce-${nonce}'`);
    expect(csp).not.toContain("'unsafe-inline'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });

  it("Enforces HSTS with 2 years max-age, includeSubDomains, and preload", () => {
    const headers = getSecurityHeaders("nonce");
    expect(headers["Strict-Transport-Security"]).toBe(
      "max-age=63072000; includeSubDomains; preload",
    );
  });

  it("Denies clickjacking via X-Frame-Options: DENY", () => {
    const headers = getSecurityHeaders("nonce");
    expect(headers["X-Frame-Options"]).toBe("DENY");
  });

  it("Prevents MIME sniffing via X-Content-Type-Options: nosniff", () => {
    const headers = getSecurityHeaders("nonce");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
  });

  it("Sets restrictive Permissions-Policy denying unused hardware/APIs", () => {
    const headers = getSecurityHeaders("nonce");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
    expect(headers["Permissions-Policy"]).toContain("microphone=()");
    expect(headers["Permissions-Policy"]).toContain("geolocation=()");
  });
});
