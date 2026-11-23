import { MiddlewareHandler } from "hono";

export type UserRole = "admin" | "technician";

export function requireAuth(): MiddlewareHandler {
  return async (c, next) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized: Otentikasi diperlukan" }, 401);
    }
    await next();
  };
}

export function requireRole(allowedRoles: UserRole[]): MiddlewareHandler {
  return async (c, next) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized: Otentikasi diperlukan" }, 401);
    }

    const userRole = (user as { role?: string }).role as UserRole | undefined;
    // Strict fail-closed check: if role is missing or not permitted, reject immediately
    if (!userRole || !allowedRoles.includes(userRole)) {
      return c.json(
        { 
          error: "Forbidden: Akses ditolak. Anda tidak memiliki izin untuk fitur ini.",
          requiredRoles: allowedRoles,
          currentRole: userRole || null
        }, 
        403
      );
    }

    await next();
  };
}
