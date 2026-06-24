import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({ userId, userName, userRole, action, resource, resourceId, details, ipAddress, status = 'success' }) => {
  try {
    const log = new AuditLog({
      userId, userName, userRole, action, resource, resourceId, details, ipAddress, status, timestamp: new Date()
    });
    await log.save();
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
};

export const auditMiddleware = (action, resource) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = async function (body) {
      const status = res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'failure';
      await logAudit({
        userId: req.user?.userId || 'unknown',
        userName: req.user?.name || 'unknown',
        userRole: req.user?.role || 'unknown',
        action,
        resource,
        resourceId: req.params?.id || body?._id || body?.id || req.body?.id || 'N/A',
        details: { method: req.method, path: req.originalUrl, body: req.body, response: body },
        ipAddress: req.ip || req.connection?.remoteAddress,
        status
      });
      return originalJson(body);
    };
    next();
  };
};
