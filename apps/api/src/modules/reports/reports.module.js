"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsModule = void 0;
var common_1 = require("@nestjs/common");
var bullmq_1 = require("@nestjs/bullmq");
var nestjs_1 = require("@bull-board/nestjs");
var bullMQAdapter_1 = require("@bull-board/api/bullMQAdapter");
var reports_service_1 = require("./reports.service");
var reports_controller_1 = require("./reports.controller");
var report_gateway_1 = require("./report.gateway");
var report_worker_1 = require("./report.worker");
var report_producer_1 = require("./report.producer");
var idea_dedup_service_1 = require("./idea-dedup.service");
var ai_module_1 = require("../ai/ai.module");
var REPORT_QUEUE = 'report-generation';
var DLQ_NAME = 'report-generation-dlq';
var ReportsModule = /** @class */ (function () {
    function ReportsModule() {
    }
    ReportsModule = __decorate([
        (0, common_1.Module)({
            imports: [
                ai_module_1.AiModule,
                // Main queue
                bullmq_1.BullModule.registerQueue({ name: REPORT_QUEUE }),
                // Dead Letter Queue — failed jobs land here after all retries exhausted
                bullmq_1.BullModule.registerQueue({ name: DLQ_NAME }),
                // Bull Board admin panel entries
                nestjs_1.BullBoardModule.forFeature({
                    name: REPORT_QUEUE,
                    adapter: bullMQAdapter_1.BullMQAdapter,
                }),
                nestjs_1.BullBoardModule.forFeature({
                    name: DLQ_NAME,
                    adapter: bullMQAdapter_1.BullMQAdapter,
                }),
            ],
            providers: [
                reports_service_1.ReportsService,
                report_gateway_1.ReportGateway,
                report_worker_1.ReportWorker,
                report_producer_1.ReportProducer,
                idea_dedup_service_1.IdeaDedupService,
            ],
            controllers: [reports_controller_1.ReportsController],
            exports: [report_producer_1.ReportProducer, idea_dedup_service_1.IdeaDedupService, reports_service_1.ReportsService],
        })
    ], ReportsModule);
    return ReportsModule;
}());
exports.ReportsModule = ReportsModule;
