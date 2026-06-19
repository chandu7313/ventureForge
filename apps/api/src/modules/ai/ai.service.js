"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
// This file is kept for backward compatibility.
// The orchestration logic has been moved to orchestrator.ts.
// Use AiOrchestrator for all AI generation tasks.
var orchestrator_1 = require("./orchestrator");
Object.defineProperty(exports, "AiService", { enumerable: true, get: function () { return orchestrator_1.AiOrchestrator; } });
