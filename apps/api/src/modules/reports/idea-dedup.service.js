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
exports.IdeaDedupService = void 0;
var common_1 = require("@nestjs/common");
var crypto = require("crypto");
var redis_service_1 = require("../../common/redis/redis.service");
var report_repository_1 = require("../../prisma/report.repository");
var IdeaDedupService = /** @class */ (function () {
    function IdeaDedupService(redis, reports) {
        this.redis = redis;
        this.reports = reports;
        this.logger = new common_1.Logger(IdeaDedupService_1.name);
    }
    IdeaDedupService_1 = IdeaDedupService;
    /** Deterministic SHA-256 hash of idea inputs */
    IdeaDedupService.prototype.computeHash = function (input) {
        var normalized = JSON.stringify({
            description: input.description.trim().toLowerCase(),
            industry: input.industry,
            geography: input.geography,
            stage: input.stage,
        });
        return crypto.createHash('sha256').update(normalized).digest('hex');
    };
    /** Check Redis first, then DB, for an identical completed report */
    IdeaDedupService.prototype.findDuplicate = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, report;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = redis_service_1.CacheKeys.ideaDedup(hash);
                        return [4 /*yield*/, this.redis.get(cacheKey)];
                    case 1:
                        cached = _a.sent();
                        if (cached) {
                            this.logger.log("[IdeaDedup] Cache HIT for hash ".concat(hash.slice(0, 12), "..."));
                            return [2 /*return*/, cached.reportId];
                        }
                        return [4 /*yield*/, this.reports.findByIdeaHash(hash)];
                    case 2:
                        report = _a.sent();
                        if (!report) return [3 /*break*/, 4];
                        // Repopulate cache for next time
                        return [4 /*yield*/, this.redis.set(cacheKey, { reportId: report.id }, redis_service_1.CacheTTL.IDEA_DEDUP)];
                    case 3:
                        // Repopulate cache for next time
                        _a.sent();
                        this.logger.log("[IdeaDedup] DB HIT for hash ".concat(hash.slice(0, 12), "... \u2192 ").concat(report.id));
                        return [2 /*return*/, report.id];
                    case 4: return [2 /*return*/, null];
                }
            });
        });
    };
    /** Store the hash → reportId mapping after successful generation */
    IdeaDedupService.prototype.storeHash = function (hash, reportId) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = redis_service_1.CacheKeys.ideaDedup(hash);
                        return [4 /*yield*/, this.redis.set(cacheKey, { reportId: reportId }, redis_service_1.CacheTTL.IDEA_DEDUP)];
                    case 1:
                        _a.sent();
                        this.logger.log("[IdeaDedup] Stored hash ".concat(hash.slice(0, 12), "... \u2192 ").concat(reportId));
                        return [2 /*return*/];
                }
            });
        });
    };
    var IdeaDedupService_1;
    IdeaDedupService = IdeaDedupService_1 = __decorate([
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [redis_service_1.RedisService,
            report_repository_1.ReportRepository])
    ], IdeaDedupService);
    return IdeaDedupService;
}());
exports.IdeaDedupService = IdeaDedupService;
