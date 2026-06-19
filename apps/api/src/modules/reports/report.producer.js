"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.ReportProducer = void 0;
var common_1 = require("@nestjs/common");
var bullmq_1 = require("@nestjs/bullmq");
var bullmq_2 = require("bullmq");
/** Lower number = higher priority in BullMQ */
var PLAN_PRIORITY = {
    PREMIUM: 1,
    PRO: 5,
    FREE: 10,
};
/** Exponential backoff delays in ms: 30s, 2m, 10m */
var BACKOFF_DELAYS = [30000, 120000, 600000];
var ReportProducer = /** @class */ (function () {
    function ReportProducer(queue, dlq) {
        this.queue = queue;
        this.dlq = dlq;
        this.logger = new common_1.Logger(ReportProducer_1.name);
    }
    ReportProducer_1 = ReportProducer;
    ReportProducer.prototype.addJob = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var priority, job;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        priority = PLAN_PRIORITY[data.userPlan];
                        return [4 /*yield*/, this.queue.add('generate-report', data, {
                                priority: priority,
                                attempts: 3,
                                backoff: { type: 'exponential', delay: BACKOFF_DELAYS[0] },
                                removeOnComplete: { count: 200, age: 60 * 60 * 24 * 7 }, // keep 200 or 7 days
                                removeOnFail: false, // keep ALL failed jobs — inspectable via Bull Board
                            })];
                    case 1:
                        job = _a.sent();
                        this.logger.log("\uD83D\uDCE5 Job ".concat(job.id, " queued | report: ").concat(data.reportId, " | plan: ").concat(data.userPlan, " | priority: ").concat(priority));
                        return [2 /*return*/, job.id];
                }
            });
        });
    };
    /** Move a permanently failed job to the Dead Letter Queue for manual review */
    ReportProducer.prototype.moveToDlq = function (jobData, failReason) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dlq.add('dead-report', __assign(__assign({}, jobData), { failReason: failReason }), {
                            attempts: 1,
                            removeOnFail: false,
                        })];
                    case 1:
                        _a.sent();
                        this.logger.warn("\u2620\uFE0F  Job for report ".concat(jobData.reportId, " moved to DLQ. Reason: ").concat(failReason));
                        return [2 /*return*/];
                }
            });
        });
    };
    var ReportProducer_1;
    ReportProducer = ReportProducer_1 = __decorate([
        (0, common_1.Injectable)(),
        __param(0, (0, bullmq_1.InjectQueue)('report-generation')),
        __param(1, (0, bullmq_1.InjectQueue)('report-generation-dlq')),
        __metadata("design:paramtypes", [bullmq_2.Queue,
            bullmq_2.Queue])
    ], ReportProducer);
    return ReportProducer;
}());
exports.ReportProducer = ReportProducer;
