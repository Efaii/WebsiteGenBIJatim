"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const home_route_1 = __importDefault(require("./routes/home.route"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const faq_route_1 = __importDefault(require("./routes/faq.route"));
const testimonial_route_1 = __importDefault(require("./routes/testimonial.route"));
const dashboard_route_1 = __importDefault(require("./routes/dashboard.route"));
const news_route_1 = __importDefault(require("./routes/news.route"));
const commissariat_route_1 = __importDefault(require("./routes/commissariat.route"));
const contact_route_1 = __importDefault(require("./routes/contact.route"));
const awardee_route_1 = __importDefault(require("./routes/awardee.route"));
const profile_1 = __importDefault(require("./routes/profile"));
const error_middleware_1 = require("./middlewares/error.middleware");
const path_1 = __importDefault(require("path"));
const request_context_middleware_1 = require("./middlewares/request-context.middleware");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const v1_auth_route_1 = __importDefault(require("./routes/v1-auth.route"));
const v1_news_route_1 = __importDefault(require("./routes/v1-news.route"));
const membership_import_route_1 = __importDefault(require("./routes/membership-import.route"));
const readiness_route_1 = __importDefault(require("./routes/readiness.route"));
const membership_route_1 = __importDefault(require("./routes/membership.route"));
const runtime_config_1 = require("./lib/runtime-config");
const master_route_1 = __importDefault(require("./routes/master.route"));
const program_route_1 = __importDefault(require("./routes/program.route"));
const public_periods_route_1 = __importDefault(require("./routes/public-periods.route"));
const public_structure_route_1 = __importDefault(require("./routes/public-structure.route"));
const public_awardee_route_1 = __importDefault(require("./routes/public-awardee.route"));
dotenv_1.default.config();
if (['staging', 'production'].includes(process.env.NODE_ENV ?? ''))
    (0, runtime_config_1.assertRuntimeConfig)();
exports.app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
exports.app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
}));
exports.app.use(express_1.default.json());
exports.app.use((0, cookie_parser_1.default)());
exports.app.use(request_context_middleware_1.requestContext);
exports.app.use('/uploads', express_1.default.static(process.env.PUBLIC_STORAGE_ROOT ?? path_1.default.join(__dirname, '../public/uploads')));
// Health Check
exports.app.use(readiness_route_1.default);
// Feature Routes
exports.app.use('/api/home', home_route_1.default);
exports.app.use('/api/auth', auth_route_1.default);
exports.app.use('/api/faqs', faq_route_1.default);
exports.app.use('/api/testimonials', testimonial_route_1.default);
exports.app.use('/api/dashboard', dashboard_route_1.default);
exports.app.use('/api/news', news_route_1.default);
exports.app.use('/api/commissariats', commissariat_route_1.default);
exports.app.use('/api/contact', contact_route_1.default);
exports.app.use('/api/awardee', awardee_route_1.default);
exports.app.use('/api/profile', profile_1.default);
exports.app.use('/api/v1/auth', v1_auth_route_1.default);
exports.app.use('/api/v1/news', v1_news_route_1.default);
exports.app.use('/api/v1/membership-imports', membership_import_route_1.default);
exports.app.use('/api/v1/memberships', membership_route_1.default);
exports.app.use('/api/v1/masters', master_route_1.default);
exports.app.use('/api/v1/programs', program_route_1.default);
exports.app.use('/api/v1/periods', public_periods_route_1.default);
exports.app.use('/api/v1/commissariats', public_structure_route_1.default);
exports.app.use('/api/v1/awardees', public_awardee_route_1.default);
// Global Error Handler Middleware
exports.app.use(error_middleware_1.errorHandler);
// Server Init
if (require.main === module) {
    exports.app.listen(PORT, () => {
        console.log(`[server]: API running effortlessly at http://localhost:${PORT}`);
    });
}
