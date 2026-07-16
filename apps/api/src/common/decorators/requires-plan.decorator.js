"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequiresPlan = void 0;
var common_1 = require("@nestjs/common");
var RequiresPlan = function () {
    var plans = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        plans[_i] = arguments[_i];
    }
    return (0, common_1.SetMetadata)('plan', plans);
};
exports.RequiresPlan = RequiresPlan;
