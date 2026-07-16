"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
var common_1 = require("@nestjs/common");
var bullmq_1 = require("@nestjs/bullmq");
var orchestrator_1 = require("./orchestrator");
var ai_processor_1 = require("./ai.processor");
var market_agent_1 = require("./agents/market.agent");
var competitor_agent_1 = require("./agents/competitor.agent");
var product_agent_1 = require("./agents/product.agent");
var vc_agent_1 = require("./agents/vc.agent");
var report_gateway_1 = require("../reports/report.gateway");
var AiModule = /** @class */ (function () {
    function AiModule() {
    }
    AiModule = __decorate([
        (0, common_1.Module)({
            imports: [
                bullmq_1.BullModule.registerQueue({
                    name: 'ai-report-generation',
                }),
            ],
            providers: [
                orchestrator_1.AiOrchestrator,
                ai_processor_1.AiProcessor,
                market_agent_1.MarketAgent,
                competitor_agent_1.CompetitorAgent,
                product_agent_1.ProductAgent,
                vc_agent_1.VcAgent,
                report_gateway_1.ReportGateway,
            ],
            exports: [orchestrator_1.AiOrchestrator],
        })
    ], AiModule);
    return AiModule;
}());
exports.AiModule = AiModule;
