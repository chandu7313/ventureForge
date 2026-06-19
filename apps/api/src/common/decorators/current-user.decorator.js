"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
var common_1 = require("@nestjs/common");
exports.CurrentUser = (0, common_1.createParamDecorator)(function (data, ctx) {
    var _a;
    var request = ctx.switchToHttp().getRequest();
    // In auth.guard.ts we attached { userId: string } to request.user
    return (_a = request.user) === null || _a === void 0 ? void 0 : _a.userId;
});
