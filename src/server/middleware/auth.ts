import { MiddlewareHandler } from "hono";

export function requireAuth(): MiddlewareHandler {
  return async (c, next) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized: Otentikasi diperlukan" }, 401);
    }
    await next();
  };
}

export function requireRole(allowedRoles: ("admin" | "technician")[]): MiddlewareHandler {
  return async (c, next) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized: Otentikasi diperlukan" }, 401);
    }

    const userRole = (user as any).role || "technician";
    if (!allowedRoles.includes(userRole)) {
      return c.json(
        { 
          error: "Forbidden: Akses ditolak. Anda tidak memiliki izin untuk fitur ini.",
          requiredRoles: allowedRoles,
          currentRole: userRole
        }, 
        403
      );
    }

    await next();
  };
}
