"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const news_1 = __importDefault(require("./routes/news"));
const docs_1 = __importDefault(require("./routes/docs"));
const profile_1 = __importDefault(require("./routes/profile"));
const events_1 = __importDefault(require("./routes/events"));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/news', news_1.default);
app.use('/api/docs', docs_1.default);
app.use('/api/profile', profile_1.default);
app.use('/api/events', events_1.default);
app.get('/', (req, res) => {
    res.send('GenBI Jatim API Server');
});
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'api'
    });
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map