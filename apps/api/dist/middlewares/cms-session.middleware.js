"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCmsRole = exports.requireCmsSession = void 0;
const cms_session_service_1 = require("../services/cms-session.service");
const api_error_1 = require("../lib/api-error");
const requireCmsSession = async (req, _res, next) => {
    const token = req.cookies?.genbi_cms_session;
    if (!token)
        return next(new api_error_1.ApiError('UNAUTHENTICATED', 'Authentication is required.', 401));
    const session = await (0, cms_session_service_1.getCmsSession)(token);
    if (!session)
        return next(new api_error_1.ApiError('UNAUTHENTICATED', 'Session is invalid or expired.', 401));
    req.cmsSession = session;
    next();
};
exports.requireCmsSession = requireCmsSession;
const requireCmsRole = (...roles) => (req, _res, next) => {
    if (!req.cmsSession || !roles.includes(req.cmsSession.cmsAccount.role))
        return next(new api_error_1.ApiError('FORBIDDEN', 'You do not have permission for this operation.', 403));
    next();
};
exports.requireCmsRole = requireCmsRole;
