"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const node_path_1 = __importDefault(require("node:path"));
const case_1 = require("case");
const utils_1 = require("../utils");
const template_helpers_1 = require("./template-helpers");
const compute_model_params_1 = require("./compute-model-params");
const compute_type_params_1 = require("./compute-type-params");
const generate_connect_dto_1 = require("./generate-connect-dto");
const generate_create_dto_1 = require("./generate-create-dto");
const generate_update_dto_1 = require("./generate-update-dto");
const generate_entity_1 = require("./generate-entity");
const generate_plain_dto_1 = require("./generate-plain-dto");
const generate_enums_1 = require("./generate-enums");
const annotations_1 = require("./annotations");
const field_classifiers_1 = require("./field-classifiers");
const run = ({ output, dmmf, ...options }) => {
    const { exportRelationModifierClasses, outputToNestJsResourceStructure, flatResourceStructure, fileNamingStyle = 'camel', classValidation, outputType, noDependencies, definiteAssignmentAssertion, requiredResponseApiProperty, prismaClientImportPath, outputApiPropertyType, generateFileTypes, wrapRelationsAsType, showDefaultValues, ...preAndSuffixes } = options;
    const transformers = {
        camel: case_1.camel,
        kebab: case_1.kebab,
        pascal: case_1.pascal,
        snake: case_1.snake,
    };
    const transformFileNameCase = transformers[fileNamingStyle];
    const templateHelpers = (0, template_helpers_1.makeHelpers)({
        transformFileNameCase,
        transformClassNameCase: case_1.pascal,
        classValidation,
        outputType,
        noDependencies,
        definiteAssignmentAssertion,
        outputPath: output,
        prismaClientImportPath,
        requiredResponseApiProperty,
        outputApiPropertyType,
        wrapRelationsAsType,
        showDefaultValues,
        ...preAndSuffixes,
    });
    const allModels = dmmf.datamodel.models;
    const filteredTypes = dmmf.datamodel.types
        .filter((model) => !(0, field_classifiers_1.isAnnotatedWith)(model, annotations_1.DTO_IGNORE_MODEL))
        .map((model) => ({
        ...model,
        output: {
            dto: outputToNestJsResourceStructure
                ? flatResourceStructure
                    ? node_path_1.default.join(output, transformFileNameCase(model.name))
                    : node_path_1.default.join(output, transformFileNameCase(model.name), 'dto')
                : output,
            entity: '',
        },
    }));
    if (generateFileTypes === 'entity' && filteredTypes.length) {
        throw new Error(`Generating only Entity files while having complex types is not possible. Set 'generateFileTypes' to 'all' or 'dto'.`);
    }
    const filteredModels = allModels
        .filter((model) => !(0, field_classifiers_1.isAnnotatedWith)(model, annotations_1.DTO_IGNORE_MODEL))
        .map((model) => ({
        ...model,
        type: 'model',
        output: {
            dto: outputToNestJsResourceStructure
                ? flatResourceStructure
                    ? node_path_1.default.join(output, transformFileNameCase(model.name))
                    : node_path_1.default.join(output, transformFileNameCase(model.name), 'dto')
                : output,
            entity: outputToNestJsResourceStructure
                ? flatResourceStructure
                    ? node_path_1.default.join(output, transformFileNameCase(model.name))
                    : node_path_1.default.join(output, transformFileNameCase(model.name), 'entities')
                : output,
        },
    }));
    const enumFiles = [];
    if (noDependencies) {
        if (dmmf.datamodel.enums.length) {
            (0, utils_1.logger)('Processing enums');
            enumFiles.push({
                fileName: node_path_1.default.join(output, 'enums.ts'),
                content: (0, generate_enums_1.generateEnums)(dmmf.datamodel.enums),
            });
        }
    }
    const typeFiles = filteredTypes.map((model) => {
        (0, utils_1.logger)(`Processing Type ${model.name}`);
        const typeParams = (0, compute_type_params_1.computeTypeParams)({
            model,
            allModels: filteredTypes,
            templateHelpers,
        });
        const createDto = {
            fileName: node_path_1.default.join(model.output.dto, templateHelpers.createDtoFilename(model.name, true)),
            content: (0, generate_create_dto_1.generateCreateDto)({
                ...typeParams.create,
                exportRelationModifierClasses,
                templateHelpers,
            }),
        };
        const updateDto = {
            fileName: node_path_1.default.join(model.output.dto, templateHelpers.updateDtoFilename(model.name, true)),
            content: (0, generate_update_dto_1.generateUpdateDto)({
                ...typeParams.update,
                exportRelationModifierClasses,
                templateHelpers,
            }),
        };
        const plainDto = {
            fileName: node_path_1.default.join(model.output.dto, templateHelpers.plainDtoFilename(model.name, true)),
            content: (0, generate_plain_dto_1.generatePlainDto)({
                ...typeParams.plain,
                templateHelpers,
            }),
        };
        return [createDto, updateDto, plainDto];
    });
    const modelFiles = filteredModels.map((model) => {
        (0, utils_1.logger)(`Processing Model ${model.name}`);
        const modelParams = (0, compute_model_params_1.computeModelParams)({
            model,
            allModels: [...filteredTypes, ...filteredModels],
            templateHelpers,
        });
        const connectDto = {
            fileName: node_path_1.default.join(model.output.dto, templateHelpers.connectDtoFilename(model.name, true)),
            content: (0, generate_connect_dto_1.generateConnectDto)({
                ...modelParams.connect,
                exportRelationModifierClasses,
                templateHelpers,
            }),
        };
        const createDto = {
            fileName: node_path_1.default.join(model.output.dto, templateHelpers.createDtoFilename(model.name, true)),
            content: (0, generate_create_dto_1.generateCreateDto)({
                ...modelParams.create,
                exportRelationModifierClasses,
                templateHelpers,
            }),
        };
        const updateDto = {
            fileName: node_path_1.default.join(model.output.dto, templateHelpers.updateDtoFilename(model.name, true)),
            content: (0, generate_update_dto_1.generateUpdateDto)({
                ...modelParams.update,
                exportRelationModifierClasses,
                templateHelpers,
            }),
        };
        const entity = {
            fileName: node_path_1.default.join(model.output.entity, templateHelpers.entityFilename(model.name, true)),
            content: (0, generate_entity_1.generateEntity)({
                ...modelParams.entity,
                templateHelpers,
            }),
        };
        const plainDto = {
            fileName: node_path_1.default.join(model.output.dto, templateHelpers.plainDtoFilename(model.name, true)),
            content: (0, generate_plain_dto_1.generatePlainDto)({
                ...modelParams.plain,
                templateHelpers,
            }),
        };
        switch (generateFileTypes) {
            case 'all':
                return [connectDto, createDto, updateDto, entity, plainDto];
            case 'dto':
                return [connectDto, createDto, updateDto, plainDto];
            case 'entity':
                return [entity];
            case 'custom':
                return [connectDto, createDto, updateDto, entity];
            default:
                throw new Error(`Unknown 'generateFileTypes' value. all, dto, entity and custom are valid options!`);
        }
    });
    return [...typeFiles, ...modelFiles, ...enumFiles].flat();
};
exports.run = run;
