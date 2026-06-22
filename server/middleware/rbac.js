export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}`,
        requiredRoles: roles,
        userRole: req.user.role
      });
    }
    next();
  };
};

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (req.user.role === 'super_admin') {
      return next();
    }
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({
        message: `Access denied. Required permission: ${permission}`,
        userPermissions: req.user.permissions || []
      });
    }
    next();
  };
};

export const requireModuleAccess = (moduleId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (req.user.role === 'super_admin') {
      return next();
    }
    if (!req.user.modules || !req.user.modules.includes(moduleId)) {
      return res.status(403).json({
        message: `Access denied. Required module access: ${moduleId}`,
        userModules: req.user.modules || []
      });
    }
    next();
  };
};

export const requireBranchAccess = (paramName = 'branchId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (req.user.role === 'super_admin') {
      return next();
    }
    const requestedBranch = req.params[paramName] || req.body[paramName] || req.query[paramName];
    const userBranch = req.user.branch || req.user.assignedBranch;
    if (requestedBranch && userBranch && requestedBranch !== userBranch) {
      return res.status(403).json({ message: 'Access denied. You can only access data within your assigned branch.' });
    }
    next();
  };
};

export const requireOwnData = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (req.user.role === 'super_admin' || req.user.role === 'sub_admin') {
      return next();
    }
    const targetUserId = req.params[userIdParam] || req.body[userIdParam] || req.query[userIdParam];
    if (targetUserId && targetUserId !== req.user.userId && targetUserId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only access your own data.' });
    }
    next();
  };
};
