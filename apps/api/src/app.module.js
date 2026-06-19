"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.AppModule = void 0;
var common_1 = require("@nestjs/common");
var bullmq_1 = require("@nestjs/bullmq");
var nestjs_1 = require("@bull-board/nestjs");
var express_1 = require("@bull-board/express");
var cache_manager_1 = require("@nestjs/cache-manager");
var cache_manager_redis_store_1 = require("cache-manager-redis-store");
var config_module_1 = require("./config/config.module");
var prisma_module_1 = require("./prisma/prisma.module");
var redis_module_1 = require("./common/redis/redis.module");
var auth_module_1 = require("./modules/auth/auth.module");
var ideas_module_1 = require("./modules/ideas/ideas.module");
var reports_module_1 = require("./modules/reports/reports.module");
var ai_module_1 = require("./modules/ai/ai.module");
var payments_module_1 = require("./modules/payments/payments.module");
var users_module_1 = require("./modules/users/users.module");
var analytics_module_1 = require("./modules/analytics/analytics.module");
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    var _a;
    AppModule = __decorate([
        (0, common_1.Module)({
            imports: [
                config_module_1.AppConfigModule,
                // Redis for cache-manager
                cache_manager_1.CacheModule.registerAsync({
                    isGlobal: true,
                    useFactory: function () { return __awaiter(void 0, void 0, void 0, function () {
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = {};
                                    return [4 /*yield*/, (0, cache_manager_redis_store_1.redisStore)({ url: "redis://".concat(process.env.REDIS_HOST, ":").concat(process.env.REDIS_PORT) })];
                                case 1: return [2 /*return*/, (_a.store = _b.sent(),
                                        _a)];
                            }
                        });
                    }); },
                }),
                // BullMQ connection
                bullmq_1.BullModule.forRoot({
                    connection: {
                        host: process.env.REDIS_HOST,
                        port: parseInt((_a = process.env.REDIS_PORT) !== null && _a !== void 0 ? _a : '6379'),
                    },
                    defaultJobOptions: {
                        removeOnComplete: { count: 100 },
                        removeOnFail: false,
                    },
                }),
                // Bull Board admin UI at /admin/queues
                nestjs_1.BullBoardModule.forRoot({
                    route: '/admin/queues',
                    adapter: express_1.ExpressAdapter,
                }),
                prisma_module_1.PrismaModule,
                redis_module_1.RedisModule,
                auth_module_1.AuthModule,
                ideas_module_1.IdeasModule,
                reports_module_1.ReportsModule,
                ai_module_1.AiModule,
                payments_module_1.PaymentsModule,
                users_module_1.UsersModule,
                analytics_module_1.AnalyticsModule,
            ],
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
