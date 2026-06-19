"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminGuard = void 0;
var common_1 = require("@nestjs/common");
var ADMIN_TOKENS = ((_a = process.env.ADMIN_TOKENS) !== null && _a !== void 0 ? _a : '').split(',').filter(Boolean);
/**
 * Guards the Bull Board admin UI at /admin/queues.
 * Expects an `Authorization: Bearer <ADMIN_TOKEN>` header
 * matching any token in the ADMIN_TOKENS env variable.
 */
var AdminGuard = /** @class */ (function () {
    function AdminGuard() {
    }
    AdminGuard.prototype.canActivate = function (context) {
        var _a;
        var req = context.switchToHttp().getRequest();
        var authHeader = (_a = req.headers['authorization']) !== null && _a !== void 0 ? _a : '';
        var token = authHeader.replace('Bearer ', '').trim();
        if (!token || !ADMIN_TOKENS.includes(token)) {
            throw new common_1.UnauthorizedException('Invalid or missing admin token');
        }
        return true;
    };
    AdminGuard = __decorate([
        (0, common_1.Injectable)()
    ], AdminGuard);
    return AdminGuard;
}());
exports.AdminGuard = AdminGuard;
