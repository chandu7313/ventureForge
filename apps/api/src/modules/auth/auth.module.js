"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
var common_1 = require("@nestjs/common");
var jwt_1 = require("@nestjs/jwt");
var auth_controller_1 = require("./auth.controller");
var auth_service_1 = require("./auth.service");
var auth_guard_1 = require("../../common/guards/auth.guard");
var plan_guard_1 = require("../../common/guards/plan.guard");
var AuthModule = /** @class */ (function () {
    function AuthModule() {
    }
    AuthModule = __decorate([
        (0, common_1.Module)({
            imports: [
                jwt_1.JwtModule.register({
                    global: true,
                    secret: process.env.JWT_SECRET || 'super-secret',
                    signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
                }),
            ],
            controllers: [auth_controller_1.AuthController],
            providers: [auth_service_1.AuthService, auth_guard_1.AuthGuard, plan_guard_1.PlanGuard],
            exports: [auth_guard_1.AuthGuard, plan_guard_1.PlanGuard, auth_service_1.AuthService],
        })
    ], AuthModule);
    return AuthModule;
}());
exports.AuthModule = AuthModule;
