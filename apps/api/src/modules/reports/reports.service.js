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
exports.ReportsService = void 0;
var common_1 = require("@nestjs/common");
var prisma_service_1 = require("../../prisma/prisma.service");
var report_repository_1 = require("../../prisma/report.repository");
var redis_service_1 = require("../../common/redis/redis.service");
var idea_dedup_service_1 = require("./idea-dedup.service");
var client_1 = require("@prisma/client");
var ReportsService = /** @class */ (function () {
    function ReportsService(prisma, reports, redis, dedup) {
        this.prisma = prisma;
        this.reports = reports;
        this.redis = redis;
        this.dedup = dedup;
        this.logger = new common_1.Logger(ReportsService_1.name);
    }
    ReportsService_1 = ReportsService;
    // ─────────────────────────────────────────────────
    // Called by controller: validates user, creates Report row,
    // logs usage, returns report + plan for producer
    // ─────────────────────────────────────────────────
    ReportsService.prototype.initiateGeneration = function (userId, dto, ideaHash) {
        return __awaiter(this, void 0, void 0, function () {
            var user, idea, report;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: userId } })];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
                        // Enforce FREE tier limit (reportsLimit of -1 = unlimited)
                        if (user.reportsLimit !== -1 && user.reportsUsed >= user.reportsLimit) {
                            throw new common_1.HttpException('Monthly report limit reached. Upgrade to Pro to generate more.', common_1.HttpStatus.PAYMENT_REQUIRED);
                        }
                        return [4 /*yield*/, this.prisma.idea.findFirst({
                                where: { id: dto.ideaId, userId: user.id },
                            })];
                    case 2:
                        idea = _a.sent();
                        if (!idea)
                            throw new common_1.NotFoundException('Idea not found');
                        return [4 /*yield*/, this.prisma.report.create({
                                data: {
                                    ideaId: idea.id,
                                    userId: user.id,
                                    status: client_1.ReportStatus.PENDING,
                                },
                            })];
                    case 3:
                        report = _a.sent();
                        // Increment usage counter
                        return [4 /*yield*/, this.prisma.user.update({
                                where: { id: user.id },
                                data: { reportsUsed: { increment: 1 } },
                            })];
                    case 4:
                        // Increment usage counter
                        _a.sent();
                        // Log usage
                        return [4 /*yield*/, this.prisma.usageLog.create({
                                data: {
                                    userId: user.id,
                                    action: 'report.generate',
                                    metadata: { reportId: report.id, ideaId: idea.id, ideaHash: ideaHash },
                                },
                            })];
                    case 5:
                        // Log usage
                        _a.sent();
                        // Invalidate user report count cache
                        return [4 /*yield*/, this.redis.del(redis_service_1.CacheKeys.userReportCount(user.id))];
                    case 6:
                        // Invalidate user report count cache
                        _a.sent();
                        return [2 /*return*/, { report: report, jobId: null, userPlan: user.plan }];
                }
            });
        });
    };
    // ─────────────────────────────────────────────────
    // GET by ID — Redis first, then DB
    // ─────────────────────────────────────────────────
    ReportsService.prototype.getReportById = function (userId, reportId) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, user, report;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = redis_service_1.CacheKeys.report(reportId);
                        return [4 /*yield*/, this.redis.get(cacheKey)];
                    case 1:
                        cached = _a.sent();
                        if (cached) {
                            this.logger.debug("Cache HIT: ".concat(cacheKey));
                            return [2 /*return*/, cached];
                        }
                        return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: userId } })];
                    case 2:
                        user = _a.sent();
                        if (!user)
                            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
                        return [4 /*yield*/, this.prisma.report.findFirst({
                                where: { id: reportId, userId: user.id, deletedAt: null },
                                include: { idea: true },
                            })];
                    case 3:
                        report = _a.sent();
                        if (!((report === null || report === void 0 ? void 0 : report.status) === client_1.ReportStatus.DONE)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.redis.set(cacheKey, report, redis_service_1.CacheTTL.REPORT)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, report];
                }
            });
        });
    };
    // ─────────────────────────────────────────────────
    // GET paginated user reports
    // ─────────────────────────────────────────────────
    ReportsService.prototype.getUserReports = function (userId, page, limit) {
        if (page === void 0) { page = 1; }
        if (limit === void 0) { limit = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: userId } })];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
                        return [2 /*return*/, this.reports.findByUser(user.id, page, limit)];
                }
            });
        });
    };
    // ─────────────────────────────────────────────────
    // Compare two reports
    // ─────────────────────────────────────────────────
    ReportsService.prototype.compareReports = function (userId, id1, id2) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var _e, r1, r2, winner, comparison;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.getReportById(userId, id1),
                            this.getReportById(userId, id2),
                        ])];
                    case 1:
                        _e = _f.sent(), r1 = _e[0], r2 = _e[1];
                        if (!r1)
                            throw new common_1.NotFoundException("Report ".concat(id1, " not found"));
                        if (!r2)
                            throw new common_1.NotFoundException("Report ".concat(id2, " not found"));
                        winner = null;
                        if (r1.investorScore != null && r2.investorScore != null) {
                            winner = r1.investorScore >= r2.investorScore ? id1 : id2;
                        }
                        return [4 /*yield*/, this.prisma.comparison.create({
                                data: {
                                    userId: userId,
                                    reportAId: id1,
                                    reportBId: id2,
                                    winner: winner,
                                    analysis: {
                                        scoreDelta: ((_a = r1.investorScore) !== null && _a !== void 0 ? _a : 0) - ((_b = r2.investorScore) !== null && _b !== void 0 ? _b : 0),
                                        marketScoreDelta: ((_c = r1.marketScore) !== null && _c !== void 0 ? _c : 0) - ((_d = r2.marketScore) !== null && _d !== void 0 ? _d : 0),
                                        verdictA: r1.verdict,
                                        verdictB: r2.verdict,
                                    },
                                },
                            })];
                    case 2:
                        comparison = _f.sent();
                        return [2 /*return*/, { reportA: r1, reportB: r2, winner: winner, comparisonId: comparison.id }];
                }
            });
        });
    };
    // ─────────────────────────────────────────────────
    // Soft delete report + bust cache
    // ─────────────────────────────────────────────────
    ReportsService.prototype.softDeleteReport = function (userId, reportId) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: userId } })];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
                        return [4 /*yield*/, this.reports.softDelete(reportId, user.id)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.redis.del(redis_service_1.CacheKeys.report(reportId))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    var ReportsService_1;
    ReportsService = ReportsService_1 = __decorate([
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [prisma_service_1.PrismaService,
            report_repository_1.ReportRepository,
            redis_service_1.RedisService,
            idea_dedup_service_1.IdeaDedupService])
    ], ReportsService);
    return ReportsService;
}());
exports.ReportsService = ReportsService;
