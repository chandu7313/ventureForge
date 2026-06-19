"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
exports.CacheTTL = exports.CacheKeys = exports.RedisService = void 0;
var common_1 = require("@nestjs/common");
var redis_1 = require("redis");
var config_1 = require("@nestjs/config");
var RedisService = /** @class */ (function () {
    function RedisService(config) {
        var _this = this;
        this.config = config;
        this.logger = new common_1.Logger(RedisService_1.name);
        this.client = (0, redis_1.createClient)({
            url: "redis://".concat(this.config.get('REDIS_HOST'), ":").concat(this.config.get('REDIS_PORT')),
            socket: { reconnectStrategy: function (retries) { return Math.min(retries * 50, 2000); } },
        });
        this.client.on('error', function (err) { return _this.logger.error('Redis error', err); });
        this.client.connect().then(function () { return _this.logger.log('✅ Redis connected'); });
    }
    RedisService_1 = RedisService;
    /** Get and JSON-parse a cached value. Falls back gracefully on error. */
    RedisService.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var raw, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.get(key)];
                    case 1:
                        raw = _a.sent();
                        return [2 /*return*/, raw ? JSON.parse(raw) : null];
                    case 2:
                        err_1 = _a.sent();
                        this.logger.warn("Redis GET failed for key \"".concat(key, "\": ").concat(err_1.message));
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /** JSON-stringify and set with optional TTL in seconds. */
    RedisService.prototype.set = function (key, value, ttlSeconds) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        payload = JSON.stringify(value);
                        if (!ttlSeconds) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.client.setEx(key, ttlSeconds, payload)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.client.set(key, payload)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        err_2 = _a.sent();
                        this.logger.warn("Redis SET failed for key \"".concat(key, "\": ").concat(err_2.message));
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /** Delete one or more keys. */
    RedisService.prototype.del = function () {
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.del(keys)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_3 = _a.sent();
                        this.logger.warn("Redis DEL failed: ".concat(err_3.message));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /** Atomically increment a counter. Returns the new value. */
    RedisService.prototype.incr = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.incr(key)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        err_4 = _a.sent();
                        this.logger.warn("Redis INCR failed for key \"".concat(key, "\": ").concat(err_4.message));
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /** Set key TTL (expiry) in seconds. */
    RedisService.prototype.expire = function (key, seconds) {
        return __awaiter(this, void 0, void 0, function () {
            var err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.expire(key, seconds)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_5 = _a.sent();
                        this.logger.warn("Redis EXPIRE failed for key \"".concat(key, "\": ").concat(err_5.message));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /** Helper: returns seconds remaining until end of current UTC month. */
    RedisService.ttlUntilEndOfMonth = function () {
        var now = new Date();
        var endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
        return Math.floor((endOfMonth.getTime() - now.getTime()) / 1000);
    };
    var RedisService_1;
    RedisService = RedisService_1 = __decorate([
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [config_1.ConfigService])
    ], RedisService);
    return RedisService;
}());
exports.RedisService = RedisService;
/** Canonical cache key builders — single source of truth */
exports.CacheKeys = {
    report: function (reportId) { return "report:".concat(reportId); },
    userReportCount: function (userId) { return "user:".concat(userId, ":report-count"); },
    ideaDedup: function (hash) { return "idea:".concat(hash, ":report"); },
    userPlan: function (userId) { return "user:".concat(userId, ":plan"); },
};
/** Cache TTLs in seconds */
exports.CacheTTL = {
    REPORT: 60 * 60 * 24, // 24 hours
    IDEA_DEDUP: 60 * 60 * 24 * 7, // 7 days
    USER_PLAN: 60 * 60, // 1 hour
};
