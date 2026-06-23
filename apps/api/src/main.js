"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@nestjs/core");
var app_module_1 = require("./app.module");
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var helmet_1 = require("helmet");
var global_exception_filter_1 = require("./common/filters/global-exception.filter");
var logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
function bootstrap() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var logger, app, swaggerConfig, document, port;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    logger = new common_1.Logger('Bootstrap');
                    return [4 /*yield*/, core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true })];
                case 1:
                    app = _c.sent();
                    // ── Security ───────────────────────────────────────────────────────────
                    app.use((0, helmet_1.default)({
                        contentSecurityPolicy: {
                            directives: {
                                defaultSrc: ["'self'"],
                                scriptSrc: ["'self'", "'unsafe-inline'"], // Required for Bull Board UI
                                styleSrc: ["'self'", "'unsafe-inline'"],
                                imgSrc: ["'self'", 'data:', 'https:'],
                            },
                        },
                    }));
                    app.enableCors({
                        origin: (_a = process.env.FRONTEND_URL) !== null && _a !== void 0 ? _a : 'http://localhost:3000',
                        credentials: true,
                        methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
                        allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature'],
                    });
                    // ── Global Pipes, Filters, Interceptors ────────────────────────────────
                    app.useGlobalPipes(new common_1.ValidationPipe({
                        transform: true,
                        whitelist: true, // Strip unknown properties
                        forbidNonWhitelisted: true,
                        stopAtFirstError: false,
                    }));
                    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
                    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
                    swaggerConfig = new swagger_1.DocumentBuilder()
                        .setTitle('StartupIQ AI — Backend API')
                        .setDescription('Multi-agent AI startup validator for Indian founders. ' +
                        'Authenticate with a Clerk JWT Bearer token.')
                        .setVersion('1.0')
                        .addServer('/api/v1', 'V1 Endpoints')
                        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
                        .addTag('Reports', 'AI-powered startup validation reports')
                        .addTag('Ideas', 'Startup idea management')
                        .addTag('Users', 'User profile and plan management')
                        .addTag('Payments', 'Razorpay payments and webhooks')
                        .addTag('Analytics', 'Usage metrics')
                        .build();
                    document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
                    swagger_1.SwaggerModule.setup('api/docs', app, document, {
                        swaggerOptions: { persistAuthorization: true },
                    });
                    // ── Graceful Shutdown ─────────────────────────────────────────────────
                    app.enableShutdownHooks();
                    port = parseInt((_b = process.env.PORT) !== null && _b !== void 0 ? _b : '3001');
                    return [4 /*yield*/, app.listen(port, '0.0.0.0')];
                case 2:
                    _c.sent();
                    logger.log("\uD83D\uDE80 API running on http://localhost:".concat(port));
                    logger.log("\uD83D\uDCD6 Swagger docs at http://localhost:".concat(port, "/api/docs"));
                    logger.log("\uD83D\uDC02 Bull Board at http://localhost:".concat(port, "/admin/queues"));
                    return [2 /*return*/];
            }
        });
    });
}
bootstrap();
