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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGateway = void 0;
var websockets_1 = require("@nestjs/websockets");
var socket_io_1 = require("socket.io");
var ReportGateway = /** @class */ (function () {
    function ReportGateway() {
    }
    ReportGateway.prototype.handleSubscribe = function (client, reportId) {
        client.join("report:".concat(reportId));
    };
    ReportGateway.prototype.emitProgress = function (reportId, stage, progress, data) {
        this.server.to("report:".concat(reportId)).emit('report:progress', {
            stage: stage,
            progress: progress,
            data: data,
        });
    };
    __decorate([
        (0, websockets_1.WebSocketServer)(),
        __metadata("design:type", socket_io_1.Server)
    ], ReportGateway.prototype, "server", void 0);
    __decorate([
        (0, websockets_1.SubscribeMessage)('subscribeToReport'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [socket_io_1.Socket, String]),
        __metadata("design:returntype", void 0)
    ], ReportGateway.prototype, "handleSubscribe", null);
    ReportGateway = __decorate([
        (0, websockets_1.WebSocketGateway)({
            cors: {
                origin: '*',
            },
        })
    ], ReportGateway);
    return ReportGateway;
}());
exports.ReportGateway = ReportGateway;
