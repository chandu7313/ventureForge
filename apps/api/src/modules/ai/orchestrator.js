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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.AiOrchestrator = void 0;
var common_1 = require("@nestjs/common");
var cache_manager_1 = require("@nestjs/cache-manager");
var cache_manager_2 = require("cache-manager");
var market_agent_1 = require("./agents/market.agent");
var competitor_agent_1 = require("./agents/competitor.agent");
var product_agent_1 = require("./agents/product.agent");
var vc_agent_1 = require("./agents/vc.agent");
var report_gateway_1 = require("../reports/report.gateway");
var CACHE_TTL_24H = 60 * 60 * 24; // 24 hours in seconds
var AiOrchestrator = /** @class */ (function () {
    function AiOrchestrator(marketAgent, competitorAgent, productAgent, vcAgent, reportGateway, cache) {
        this.marketAgent = marketAgent;
        this.competitorAgent = competitorAgent;
        this.productAgent = productAgent;
        this.vcAgent = vcAgent;
        this.reportGateway = reportGateway;
        this.cache = cache;
        this.logger = new common_1.Logger(AiOrchestrator_1.name);
    }
    AiOrchestrator_1 = AiOrchestrator;
    /**
     * Retries an async function up to `maxRetries` times with exponential backoff.
     */
    AiOrchestrator.prototype.withRetry = function (fn, agentName, maxRetries) {
        if (maxRetries === void 0) { maxRetries = 2; }
        return __awaiter(this, void 0, void 0, function () {
            var lastError, _loop_1, this_1, attempt, state_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _loop_1 = function (attempt) {
                            var _b, err_1, delay_1;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _c.trys.push([0, 2, , 5]);
                                        _b = {};
                                        return [4 /*yield*/, fn()];
                                    case 1: return [2 /*return*/, (_b.value = _c.sent(), _b)];
                                    case 2:
                                        err_1 = _c.sent();
                                        lastError = err_1;
                                        delay_1 = Math.pow(2, attempt) * 500;
                                        this_1.logger.warn("[".concat(agentName, "] Attempt ").concat(attempt, " failed. Retrying in ").concat(delay_1, "ms... Error: ").concat(lastError.message));
                                        if (!(attempt <= maxRetries)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, new Promise(function (res) { return setTimeout(res, delay_1); })];
                                    case 3:
                                        _c.sent();
                                        _c.label = 4;
                                    case 4: return [3 /*break*/, 5];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        attempt = 1;
                        _a.label = 1;
                    case 1:
                        if (!(attempt <= maxRetries + 1)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(attempt)];
                    case 2:
                        state_1 = _a.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        _a.label = 3;
                    case 3:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 4: throw new Error("[".concat(agentName, "] All ").concat(maxRetries + 1, " attempts failed. Last error: ").concat(lastError.message));
                }
            });
        });
    };
    AiOrchestrator.prototype.run = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, marketOutput, competitorOutput, productOutput, err_2, vcOutput, result;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        cacheKey = "report:orchestration:".concat(input.reportId);
                        return [4 /*yield*/, this.cache.get(cacheKey)];
                    case 1:
                        cached = _b.sent();
                        if (cached) {
                            this.logger.log("[Orchestrator] Cache HIT for report ".concat(input.reportId));
                            return [2 /*return*/, cached];
                        }
                        this.logger.log("[Orchestrator] Starting parallel agent execution for report: ".concat(input.reportId));
                        // --- Stage 1: Run Agents 1-3 in parallel ---
                        this.reportGateway.emitProgress(input.reportId, 'starting', 0, { message: 'Initialising AI agents...' });
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, Promise.all([
                                this.withRetry(function () {
                                    return _this.marketAgent.run({
                                        ideaDescription: input.ideaDescription,
                                        industry: input.industry,
                                        geography: input.geography,
                                    });
                                }, 'MarketAgent').then(function (result) {
                                    _this.reportGateway.emitProgress(input.reportId, 'market_analysis', 25, {
                                        message: 'Market analysis complete.',
                                        data: result,
                                    });
                                    return result;
                                }),
                                this.withRetry(function () {
                                    return _this.competitorAgent.run({
                                        ideaDescription: input.ideaDescription,
                                        industry: input.industry,
                                    });
                                }, 'CompetitorAgent').then(function (result) {
                                    _this.reportGateway.emitProgress(input.reportId, 'competitor_scout', 50, {
                                        message: 'Competitor analysis complete.',
                                        data: result,
                                    });
                                    return result;
                                }),
                                this.withRetry(function () {
                                    return _this.productAgent.run({
                                        ideaDescription: input.ideaDescription,
                                        stage: input.stage,
                                        teamSize: input.teamSize,
                                        budget: input.budget,
                                    });
                                }, 'ProductAgent').then(function (result) {
                                    _this.reportGateway.emitProgress(input.reportId, 'product_strategy', 75, {
                                        message: 'Product & GTM strategy complete.',
                                        data: result,
                                    });
                                    return result;
                                }),
                            ])];
                    case 3:
                        _a = _b.sent(), marketOutput = _a[0], competitorOutput = _a[1], productOutput = _a[2];
                        return [3 /*break*/, 5];
                    case 4:
                        err_2 = _b.sent();
                        this.reportGateway.emitProgress(input.reportId, 'failed', -1, {
                            message: "Agent failure: ".concat(err_2.message),
                        });
                        throw err_2;
                    case 5:
                        // --- Stage 2: Run VC Agent with merged context ---
                        this.logger.log("[Orchestrator] Parallel agents complete. Running VC synthesis...");
                        return [4 /*yield*/, this.withRetry(function () {
                                return _this.vcAgent.run({
                                    ideaDescription: input.ideaDescription,
                                    marketData: marketOutput,
                                    competitorData: competitorOutput,
                                    productData: productOutput,
                                });
                            }, 'VcAgent')];
                    case 6:
                        vcOutput = _b.sent();
                        this.reportGateway.emitProgress(input.reportId, 'completed', 100, {
                            message: 'Report generation complete!',
                        });
                        result = {
                            market: marketOutput,
                            competitors: competitorOutput,
                            product: productOutput,
                            vc: vcOutput,
                        };
                        // --- Cache final result for 24h ---
                        return [4 /*yield*/, this.cache.set(cacheKey, result, CACHE_TTL_24H)];
                    case 7:
                        // --- Cache final result for 24h ---
                        _b.sent();
                        this.logger.log("[Orchestrator] Result cached for 24h. Report: ".concat(input.reportId));
                        return [2 /*return*/, result];
                }
            });
        });
    };
    var AiOrchestrator_1;
    var _a;
    AiOrchestrator = AiOrchestrator_1 = __decorate([
        (0, common_1.Injectable)(),
        __param(5, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
        __metadata("design:paramtypes", [market_agent_1.MarketAgent,
            competitor_agent_1.CompetitorAgent,
            product_agent_1.ProductAgent,
            vc_agent_1.VcAgent,
            report_gateway_1.ReportGateway, typeof (_a = typeof cache_manager_2.Cache !== "undefined" && cache_manager_2.Cache) === "function" ? _a : Object])
    ], AiOrchestrator);
    return AiOrchestrator;
}());
exports.AiOrchestrator = AiOrchestrator;
