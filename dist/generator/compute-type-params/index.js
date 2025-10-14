"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeTypeParams = void 0;
const compute_create_dto_params_1 = require("../compute-model-params/compute-create-dto-params");
const compute_update_dto_params_1 = require("../compute-model-params/compute-update-dto-params");
const compute_plain_dto_params_1 = require("../compute-model-params/compute-plain-dto-params");
const computeTypeParams = ({ model, allModels, templateHelpers, }) => ({
    create: (0, compute_create_dto_params_1.computeCreateDtoParams)({
        model,
        allModels,
        templateHelpers,
    }),
    update: (0, compute_update_dto_params_1.computeUpdateDtoParams)({
        model,
        allModels,
        templateHelpers,
    }),
    plain: (0, compute_plain_dto_params_1.computePlainDtoParams)({
        model,
        allModels,
        templateHelpers,
    }),
});
exports.computeTypeParams = computeTypeParams;
