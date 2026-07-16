"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.ReportWorker = void 0;
var bullmq_1 = require("@nestjs/bullmq");
var bullmq_2 = require("bullmq");
var common_1 = require("@nestjs/common");
var orchestrator_1 = require("../ai/orchestrator");
var report_repository_1 = require("../../prisma/report.repository");
var redis_service_1 = require("../../common/redis/redis.service");
var idea_dedup_service_1 = require("./idea-dedup.service");
var report_producer_1 = require("./report.producer");
var client_1 = require("@prisma/client");
var prisma_service_1 = require("../../prisma/prisma.service");
var ReportWorker = /** @class */ (function (_super) {
    __extends(ReportWorker, _super);
    function ReportWorker(orchestrator, reportRepo, redis, dedup, producer, prisma) {
        var _this = _super.call(this) || this;
        _this.orchestrator = orchestrator;
        _this.reportRepo = reportRepo;
        _this.redis = redis;
        _this.dedup = dedup;
        _this.producer = producer;
        _this.prisma = prisma;
        _this.logger = new common_1.Logger(ReportWorker_1.name);
        return _this;
    }
    ReportWorker_1 = ReportWorker;
    ReportWorker.prototype.process = function (job) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function () {
            var data, startTime, result, generationTimeMs, verdictMap, marketScoreRaw, finalReport, err_1, msg;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        data = job.data;
                        startTime = Date.now();
                        this.logger.log("\u2699\uFE0F  Processing job ".concat(job.id, " \u2192 report ").concat(data.reportId));
                        return [4 /*yield*/, job.updateProgress(5)];
                    case 1:
                        _g.sent();
                        return [4 /*yield*/, this.reportRepo.updateStatus(data.reportId, client_1.ReportStatus.PROCESSING)];
                    case 2:
                        _g.sent();
                        _g.label = 3;
                    case 3:
                        _g.trys.push([3, 12, , 17]);
                        return [4 /*yield*/, this.orchestrator.run({
                                reportId: data.reportId,
                                ideaId: data.ideaId,
                                ideaDescription: data.ideaDescription,
                                industry: data.industry,
                                geography: data.geography,
                                stage: data.stage,
                                teamSize: data.teamSize,
                                budget: data.budget,
                            })];
                    case 4:
                        result = _g.sent();
                        return [4 /*yield*/, job.updateProgress(90)];
                    case 5:
                        _g.sent();
                        generationTimeMs = Date.now() - startTime;
                        verdictMap = {
                            Fund: client_1.Verdict.FUND,
                            Watch: client_1.Verdict.WATCH,
                            Pass: client_1.Verdict.PASS,
                        };
                        marketScoreRaw = ((_a = result.market.sam) === null || _a === void 0 ? void 0 : _a.inrCr)
                            ? Math.min(100, Math.round((result.market.sam.inrCr / 50000) * 100))
                            : 70;
                        return [4 /*yield*/, this.reportRepo.updateStatus(data.reportId, client_1.ReportStatus.DONE, {
                                ideaScore: Math.round((result.vc.investorScore + marketScoreRaw) / 2),
                                marketScore: marketScoreRaw,
                                moatScore: ((_c = (_b = result.vc.dimensions) === null || _b === void 0 ? void 0 : _b.find(function (d) { return d.name === 'Defensibility'; })) === null || _c === void 0 ? void 0 : _c.score)
                                    ? Math.round(result.vc.dimensions.find(function (d) { return d.name === 'Defensibility'; }).score * 10)
                                    : null,
                                riskScore: ((_d = result.product.risks) === null || _d === void 0 ? void 0 : _d.filter(function (r) { return r.severity === 'High'; }).length)
                                    ? Math.max(0, 100 - result.product.risks.filter(function (r) { return r.severity === 'High'; }).length * 20)
                                    : 80,
                                investorScore: result.vc.investorScore,
                                verdict: (_e = verdictMap[result.vc.verdict]) !== null && _e !== void 0 ? _e : client_1.Verdict.WATCH,
                                marketData: result.market,
                                competitorData: result.competitors,
                                riskData: result.product.risks,
                                monetizationData: {
                                    monetization: result.vc.monetization,
                                    fundingRecommendation: result.vc.fundingRecommendation,
                                },
                                mvpData: result.product.mvp,
                                gtmData: result.product.gtm,
                                investorData: result.vc.dimensions,
                                pitchData: result.vc.pitch,
                                generationTimeMs: generationTimeMs,
                            })];
                    case 6:
                        _g.sent();
                        return [4 /*yield*/, this.prisma.report.findUnique({
                                where: { id: data.reportId },
                                include: { idea: true },
                            })];
                    case 7:
                        finalReport = _g.sent();
                        return [4 /*yield*/, this.redis.set(redis_service_1.CacheKeys.report(data.reportId), finalReport, redis_service_1.CacheTTL.REPORT)];
                    case 8:
                        _g.sent();
                        if (!data.ideaHash) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.dedup.storeHash(data.ideaHash, data.reportId)];
                    case 9:
                        _g.sent();
                        _g.label = 10;
                    case 10: return [4 /*yield*/, job.updateProgress(100)];
                    case 11:
                        _g.sent();
                        this.logger.log("\u2705 Job ".concat(job.id, " done in ").concat(generationTimeMs, "ms"));
                        return [3 /*break*/, 17];
                    case 12:
                        err_1 = _g.sent();
                        msg = err_1.message;
                        this.logger.error("\u274C Job ".concat(job.id, " failed (attempt ").concat(job.attemptsMade, "): ").concat(msg));
                        if (!(job.attemptsMade >= ((_f = job.opts.attempts) !== null && _f !== void 0 ? _f : 3))) return [3 /*break*/, 15];
                        return [4 /*yield*/, this.reportRepo.updateStatus(data.reportId, client_1.ReportStatus.FAILED, {
                                errorMessage: msg,
                            })];
                    case 13:
                        _g.sent();
                        return [4 /*yield*/, this.producer.moveToDlq(data, msg)];
                    case 14:
                        _g.sent();
                        return [3 /*break*/, 16];
                    case 15:
                        // Transient failure — keep status as PROCESSING for next retry
                        this.logger.warn("\u21A9\uFE0F  Retrying job ".concat(job.id, " (").concat(job.attemptsMade, "/").concat(job.opts.attempts, ")"));
                        _g.label = 16;
                    case 16: throw err_1; // Re-throw so BullMQ applies backoff and retry
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    ReportWorker.prototype.onCompleted = function (job) {
        this.logger.log("\uD83C\uDFC1 [BullMQ] Job ".concat(job.id, " COMPLETED"));
    };
    ReportWorker.prototype.onFailed = function (job, err) {
        this.logger.error("\uD83D\uDC80 [BullMQ] Job ".concat(job.id, " permanently FAILED after ").concat(job.attemptsMade, " attempts: ").concat(err.message));
    };
    ReportWorker.prototype.onStalled = function (jobId) {
        this.logger.warn("\u26A0\uFE0F  [BullMQ] Job ".concat(jobId, " STALLED \u2014 possible worker crash"));
    };
    ReportWorker.prototype.onProgress = function (job, progress) {
        this.logger.debug("\uD83D\uDCCA [BullMQ] Job ".concat(job.id, " progress: ").concat(progress, "%"));
    };
    var ReportWorker_1;
    __decorate([
        (0, bullmq_1.OnWorkerEvent)('completed'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [bullmq_2.Job]),
        __metadata("design:returntype", void 0)
    ], ReportWorker.prototype, "onCompleted", null);
    __decorate([
        (0, bullmq_1.OnWorkerEvent)('failed'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [bullmq_2.Job, Error]),
        __metadata("design:returntype", void 0)
    ], ReportWorker.prototype, "onFailed", null);
    __decorate([
        (0, bullmq_1.OnWorkerEvent)('stalled'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String]),
        __metadata("design:returntype", void 0)
    ], ReportWorker.prototype, "onStalled", null);
    __decorate([
        (0, bullmq_1.OnWorkerEvent)('progress'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [bullmq_2.Job, Number]),
        __metadata("design:returntype", void 0)
    ], ReportWorker.prototype, "onProgress", null);
    ReportWorker = ReportWorker_1 = __decorate([
        (0, bullmq_1.Processor)('report-generation', { concurrency: 3 }),
        __metadata("design:paramtypes", [orchestrator_1.AiOrchestrator,
            report_repository_1.ReportRepository,
            redis_service_1.RedisService,
            idea_dedup_service_1.IdeaDedupService,
            report_producer_1.ReportProducer,
            prisma_service_1.PrismaService])
    ], ReportWorker);
    return ReportWorker;
}(bullmq_1.WorkerHost));
exports.ReportWorker = ReportWorker;
