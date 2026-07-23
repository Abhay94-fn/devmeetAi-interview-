/**
 * RBAC middleware factory.
 * Usage: requireRole("candidate", "admin") — allows only those roles.
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied — requires one of: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};
