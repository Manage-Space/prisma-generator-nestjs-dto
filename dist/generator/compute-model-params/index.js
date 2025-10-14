"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeModelParams = void 0;
const compute_connect_dto_params_1 = require("./compute-connect-dto-params");
const compute_create_dto_params_1 = require("./compute-create-dto-params");
const compute_update_dto_params_1 = require("./compute-update-dto-params");
const compute_entity_params_1 = require("./compute-entity-params");
const compute_plain_dto_params_1 = require("./compute-plain-dto-params");
const computeModelParams = ({ model, allModels, templateHelpers, }) => ({
    connect: (0, compute_connect_dto_params_1.computeConnectDtoParams)({ model, templateHelpers }),
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
    entity: (0, compute_entity_params_1.computeEntityParams)({
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
exports.computeModelParams = computeModelParams;
