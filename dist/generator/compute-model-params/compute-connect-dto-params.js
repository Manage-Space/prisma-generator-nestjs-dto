"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeConnectDtoParams = void 0;
const slash_1 = __importDefault(require("slash"));
const node_path_1 = __importDefault(require("node:path"));
const field_classifiers_1 = require("../field-classifiers");
const helpers_1 = require("../helpers");
const api_decorator_1 = require("../api-decorator");
const class_validator_1 = require("../class-validator");
const annotations_1 = require("../annotations");
const computeConnectDtoParams = ({ model, templateHelpers, }) => {
    const imports = [];
    const apiExtraModels = [];
    const extraClasses = [];
    const classValidators = [];
    const idFields = model.fields.filter((field) => !(0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_CONNECT_HIDDEN) && (0, field_classifiers_1.isId)(field));
    const isUniqueFields = model.fields.filter((field) => !(0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_CONNECT_HIDDEN) && (0, field_classifiers_1.isUnique)(field));
    const uniqueCompoundFields = model.uniqueIndexes;
    if (model.primaryKey)
        uniqueCompoundFields.unshift(model.primaryKey);
    const uniqueCompounds = [];
    uniqueCompoundFields.forEach((uniqueIndex) => {
        const fields = [];
        uniqueIndex.fields.forEach((fieldName) => {
            const field = model.fields.find((f) => f.name === fieldName);
            if (field)
                fields.push(field);
        });
        uniqueCompounds.push({
            name: uniqueIndex.name || fields.map((field) => field.name).join('_'),
            fields,
        });
    });
    const uniqueFields = (0, helpers_1.uniq)([...idFields, ...isUniqueFields]);
    const overrides = uniqueFields.length + uniqueCompounds.length > 1
        ? { isRequired: false }
        : {};
    uniqueCompounds.forEach((compound) => {
        const compoundInput = (0, helpers_1.generateUniqueInput)({
            compoundName: compound.name,
            fields: compound.fields,
            model,
            templateHelpers,
        });
        (0, helpers_1.concatIntoArray)(compoundInput.imports, imports);
        (0, helpers_1.concatIntoArray)(compoundInput.generatedClasses, extraClasses);
        if (!templateHelpers.config.noDependencies)
            (0, helpers_1.concatIntoArray)(compoundInput.apiExtraModels, apiExtraModels);
        (0, helpers_1.concatUniqueIntoArray)(compoundInput.classValidators, classValidators, 'name');
        uniqueFields.push({
            name: compound.name,
            type: compoundInput.type,
            kind: 'object',
            isList: false,
            isRequired: true,
            isId: false,
            isUnique: false,
            isReadOnly: true,
            hasDefaultValue: false,
            pureType: true,
        });
    });
    const fields = uniqueFields.map((field) => {
        const decorators = {};
        if (templateHelpers.config.classValidation) {
            decorators.classValidators = (0, class_validator_1.parseClassValidators)({
                ...field,
                ...overrides,
            });
            (0, helpers_1.concatUniqueIntoArray)(decorators.classValidators, classValidators, 'name');
        }
        if (!templateHelpers.config.noDependencies) {
            decorators.apiProperties = (0, api_decorator_1.parseApiProperty)({
                ...field,
                ...overrides,
            }, {
                default: false,
                type: templateHelpers.config.outputApiPropertyType,
            });
            const typeProperty = decorators.apiProperties.find((p) => p.name === 'type');
            if ((typeProperty === null || typeProperty === void 0 ? void 0 : typeProperty.value) === field.type && field.type === 'Json')
                typeProperty.value = '() => Object';
        }
        if (templateHelpers.config.noDependencies) {
            if (field.type === 'Json')
                field.type = 'Object';
            else if (field.type === 'Decimal')
                field.type = 'String';
            if (field.kind === 'enum') {
                imports.push({
                    from: (0, slash_1.default)(`${(0, helpers_1.getRelativePath)(model.output.entity, templateHelpers.config.outputPath)}${node_path_1.default.sep}enums`),
                    destruct: [field.type],
                });
            }
        }
        return (0, helpers_1.mapDMMFToParsedField)(field, overrides, decorators);
    });
    const importPrismaClient = (0, helpers_1.makeImportsFromPrismaClient)(fields, templateHelpers.config.prismaClientImportPath, !templateHelpers.config.noDependencies);
    const importNestjsSwagger = (0, api_decorator_1.makeImportsFromNestjsSwagger)(fields, apiExtraModels);
    const importClassValidator = (0, class_validator_1.makeImportsFromClassValidator)(classValidators);
    return {
        model,
        fields,
        imports: (0, helpers_1.zipImportStatementParams)([
            ...importPrismaClient,
            ...importNestjsSwagger,
            ...importClassValidator,
            ...imports,
        ]),
        extraClasses,
        apiExtraModels,
    };
};
exports.computeConnectDtoParams = computeConnectDtoParams;
