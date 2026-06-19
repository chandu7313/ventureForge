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
exports.ReportsController = exports.PaginationDto = exports.GenerateReportDto = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var reports_service_1 = require("./reports.service");
var report_producer_1 = require("./report.producer");
var idea_dedup_service_1 = require("./idea-dedup.service");
var auth_guard_1 = require("../../common/guards/auth.guard");
var plan_guard_1 = require("../../common/guards/plan.guard");
var http_cache_interceptor_1 = require("../../common/redis/http-cache.interceptor");
var current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
var logging_interceptor_1 = require("../../common/interceptors/logging.interceptor");
var GenerateReportDto = /** @class */ (function () {
    function GenerateReportDto() {
    }
    __decorate([
        (0, class_validator_1.IsString)(),
        __metadata("design:type", String)
    ], GenerateReportDto.prototype, "ideaId", void 0);
    __decorate([
        (0, class_validator_1.IsString)(),
        __metadata("design:type", String)
    ], GenerateReportDto.prototype, "ideaDescription", void 0);
    __decorate([
        (0, class_validator_1.IsString)(),
        __metadata("design:type", String)
    ], GenerateReportDto.prototype, "industry", void 0);
    __decorate([
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.IsOptional)(),
        __metadata("design:type", String)
    ], GenerateReportDto.prototype, "geography", void 0);
    __decorate([
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.IsOptional)(),
        __metadata("design:type", String)
    ], GenerateReportDto.prototype, "stage", void 0);
    __decorate([
        (0, class_validator_1.IsNumber)(),
        (0, class_validator_1.IsOptional)(),
        (0, class_transformer_1.Type)(function () { return Number; }),
        __metadata("design:type", Number)
    ], GenerateReportDto.prototype, "teamSize", void 0);
    __decorate([
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.IsOptional)(),
        __metadata("design:type", String)
    ], GenerateReportDto.prototype, "budget", void 0);
    return GenerateReportDto;
}());
exports.GenerateReportDto = GenerateReportDto;
var PaginationDto = /** @class */ (function () {
    function PaginationDto() {
        this.page = 1;
        this.limit = 10;
    }
    __decorate([
        (0, class_validator_1.IsOptional)(),
        (0, class_transformer_1.Type)(function () { return Number; }),
        (0, class_validator_1.IsNumber)(),
        (0, class_validator_1.Min)(1),
        __metadata("design:type", Number)
    ], PaginationDto.prototype, "page", void 0);
    __decorate([
        (0, class_validator_1.IsOptional)(),
        (0, class_transformer_1.Type)(function () { return Number; }),
        (0, class_validator_1.IsNumber)(),
        (0, class_validator_1.Min)(1),
        (0, class_validator_1.Max)(50),
        __metadata("design:type", Number)
    ], PaginationDto.prototype, "limit", void 0);
    return PaginationDto;
}());
exports.PaginationDto = PaginationDto;
var ReportsController = /** @class */ (function () {
    function ReportsController(reportsService, producer, dedup) {
        this.reportsService = reportsService;
        this.producer = producer;
        this.dedup = dedup;
    }
    // ─────────────────────────────────────────────────
    // POST /api/v1/reports/generate
    // ─────────────────────────────────────────────────
    ReportsController.prototype.generateReport = function (userId, dto) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function () {
            var ideaHash, existingReportId, _g, report, jobId, userPlan;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        ideaHash = this.dedup.computeHash({
                            description: dto.ideaDescription,
                            industry: dto.industry,
                            geography: (_a = dto.geography) !== null && _a !== void 0 ? _a : 'PAN_INDIA',
                            stage: (_b = dto.stage) !== null && _b !== void 0 ? _b : 'idea',
                        });
                        return [4 /*yield*/, this.dedup.findDuplicate(ideaHash)];
                    case 1:
                        existingReportId = _h.sent();
                        if (existingReportId) {
                            return [2 /*return*/, {
                                    cached: true,
                                    reportId: existingReportId,
                                    message: 'Identical idea found — returning existing report.',
                                }];
                        }
                        return [4 /*yield*/, this.reportsService.initiateGeneration(userId, dto, ideaHash)];
                    case 2:
                        _g = _h.sent(), report = _g.report, jobId = _g.jobId, userPlan = _g.userPlan;
                        // 3. Enqueue with plan-based priority
                        return [4 /*yield*/, this.producer.addJob({
                                reportId: report.id,
                                ideaId: dto.ideaId,
                                ideaDescription: dto.ideaDescription,
                                industry: dto.industry,
                                geography: (_c = dto.geography) !== null && _c !== void 0 ? _c : 'PAN_INDIA',
                                stage: (_d = dto.stage) !== null && _d !== void 0 ? _d : 'idea',
                                teamSize: (_e = dto.teamSize) !== null && _e !== void 0 ? _e : 1,
                                budget: (_f = dto.budget) !== null && _f !== void 0 ? _f : '< ₹5L',
                                userPlan: userPlan,
                            })];
                    case 3:
                        // 3. Enqueue with plan-based priority
                        _h.sent();
                        return [2 /*return*/, {
                                cached: false,
                                reportId: report.id,
                                message: 'Report generation queued.',
                            }];
                }
            });
        });
    };
    // ─────────────────────────────────────────────────
    // GET /api/v1/reports
    // ─────────────────────────────────────────────────
    ReportsController.prototype.getUserReports = function (userId, query) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.reportsService.getUserReports(userId, query.page, query.limit)];
            });
        });
    };
    // ─────────────────────────────────────────────────
    // GET /api/v1/reports/compare?id1=...&id2=...
    // ─────────────────────────────────────────────────
    ReportsController.prototype.compareReports = function (userId, id1, id2) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!id1 || !id2)
                    throw new common_1.BadRequestException('Both id1 and id2 are required');
                if (id1 === id2)
                    throw new common_1.BadRequestException('Report IDs must be different');
                return [2 /*return*/, this.reportsService.compareReports(userId, id1, id2)];
            });
        });
    };
    // ─────────────────────────────────────────────────
    // GET /api/v1/reports/:id
    // ─────────────────────────────────────────────────
    ReportsController.prototype.getReport = function (userId, id) {
        return __awaiter(this, void 0, void 0, function () {
            var report;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.reportsService.getReportById(userId, id)];
                    case 1:
                        report = _a.sent();
                        if (!report)
                            throw new common_1.NotFoundException("Report ".concat(id, " not found"));
                        return [2 /*return*/, report];
                }
            });
        });
    };
    // ─────────────────────────────────────────────────
    // DELETE /api/v1/reports/:id
    // ─────────────────────────────────────────────────
    ReportsController.prototype.deleteReport = function (userId, id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.reportsService.softDeleteReport(userId, id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        (0, common_1.Post)('generate'),
        (0, common_1.UseGuards)(plan_guard_1.PlanGuard),
        (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
        (0, swagger_1.ApiOperation)({ summary: 'Trigger AI report generation (queues a background job)' }),
        (0, swagger_1.ApiResponse)({ status: 202, description: 'Job accepted' }),
        (0, swagger_1.ApiResponse)({ status: 402, description: 'Plan limit reached' }),
        __param(0, (0, current_user_decorator_1.CurrentUser)()),
        __param(1, (0, common_1.Body)()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, GenerateReportDto]),
        __metadata("design:returntype", Promise)
    ], ReportsController.prototype, "generateReport", null);
    __decorate([
        (0, common_1.Get)(),
        (0, common_1.UseInterceptors)(http_cache_interceptor_1.HttpCacheInterceptor),
        (0, swagger_1.ApiOperation)({ summary: 'Get paginated list of user reports' }),
        (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
        (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
        __param(0, (0, current_user_decorator_1.CurrentUser)()),
        __param(1, (0, common_1.Query)()),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, PaginationDto]),
        __metadata("design:returntype", Promise)
    ], ReportsController.prototype, "getUserReports", null);
    __decorate([
        (0, common_1.Get)('compare'),
        (0, swagger_1.ApiOperation)({ summary: 'Compare two reports side-by-side' }),
        (0, swagger_1.ApiQuery)({ name: 'id1', required: true }),
        (0, swagger_1.ApiQuery)({ name: 'id2', required: true }),
        __param(0, (0, current_user_decorator_1.CurrentUser)()),
        __param(1, (0, common_1.Query)('id1')),
        __param(2, (0, common_1.Query)('id2')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, String, String]),
        __metadata("design:returntype", Promise)
    ], ReportsController.prototype, "compareReports", null);
    __decorate([
        (0, common_1.Get)(':id'),
        (0, swagger_1.ApiOperation)({ summary: 'Get report by ID (Redis cache → DB)' }),
        (0, swagger_1.ApiParam)({ name: 'id', description: 'Report CUID' }),
        __param(0, (0, current_user_decorator_1.CurrentUser)()),
        __param(1, (0, common_1.Param)('id')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, String]),
        __metadata("design:returntype", Promise)
    ], ReportsController.prototype, "getReport", null);
    __decorate([
        (0, common_1.Delete)(':id'),
        (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
        (0, swagger_1.ApiOperation)({ summary: 'Soft-delete a report' }),
        __param(0, (0, current_user_decorator_1.CurrentUser)()),
        __param(1, (0, common_1.Param)('id')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, String]),
        __metadata("design:returntype", Promise)
    ], ReportsController.prototype, "deleteReport", null);
    ReportsController = __decorate([
        (0, swagger_1.ApiTags)('Reports'),
        (0, swagger_1.ApiBearerAuth)(),
        (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
        (0, common_1.UseInterceptors)(logging_interceptor_1.LoggingInterceptor),
        (0, common_1.Controller)('api/v1/reports'),
        __metadata("design:paramtypes", [reports_service_1.ReportsService,
            report_producer_1.ReportProducer,
            idea_dedup_service_1.IdeaDedupService])
    ], ReportsController);
    return ReportsController;
}());
exports.ReportsController = ReportsController;
