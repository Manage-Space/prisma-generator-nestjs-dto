"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeUpdateDtoParams = void 0;
const node_path_1 = __importDefault(require("node:path"));
const slash_1 = __importDefault(require("slash"));
const annotations_1 = require("../annotations");
const field_classifiers_1 = require("../field-classifiers");
const helpers_1 = require("../helpers");
const api_decorator_1 = require("../api-decorator");
const class_validator_1 = require("../class-validator");
const computeUpdateDtoParams = ({ model, allModels, templateHelpers, }) => {
    const imports = [];
    const extraClasses = [];
    const apiExtraModels = [];
    const classValidators = [];
    const relationScalarFields = (0, helpers_1.getRelationScalars)(model.fields);
    const relationScalarFieldNames = Object.keys(relationScalarFields);
    const fields = model.fields.reduce((result, field) => {
        var _a, _b;
        const { name } = field;
        const overrides = {
            isRequired: false,
            isNullable: !field.isRequired,
        };
        const decorators = {};
        if ((0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_RELATION_INCLUDE_ID) &&
            relationScalarFieldNames.includes(name))
            field.isReadOnly = false;
        if ((0, field_classifiers_1.isReadOnly)(field))
            return result;
        if ((0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_UPDATE_HIDDEN))
            return result;
        if ((0, field_classifiers_1.isRelation)(field)) {
            if (!(0, field_classifiers_1.isAnnotatedWithOneOf)(field, annotations_1.DTO_RELATION_MODIFIERS_ON_UPDATE)) {
                return result;
            }
            const relationInputType = (0, helpers_1.generateRelationInput)({
                field,
                model,
                allModels,
                templateHelpers,
                preAndSuffixClassName: templateHelpers.updateDtoName,
                canCreateAnnotation: annotations_1.DTO_RELATION_CAN_CREATE_ON_UPDATE,
                canConnectAnnotation: annotations_1.DTO_RELATION_CAN_CONNECT_ON_UPDATE,
                canDisconnectAnnotation: annotations_1.DTO_RELATION_CAN_DISCONNECT_ON_UPDATE,
            });
            overrides.type = relationInputType.type;
            overrides.pureType = true;
            overrides.isList = false;
            overrides.isNullable = false;
            (0, helpers_1.concatIntoArray)(relationInputType.imports, imports);
            (0, helpers_1.concatIntoArray)(relationInputType.generatedClasses, extraClasses);
            if (!templateHelpers.config.noDependencies)
                (0, helpers_1.concatIntoArray)(relationInputType.apiExtraModels, apiExtraModels);
            (0, helpers_1.concatUniqueIntoArray)(relationInputType.classValidators, classValidators, 'name');
        }
        if (!(0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_RELATION_INCLUDE_ID) &&
            relationScalarFieldNames.includes(name))
            return result;
        const isDtoOptional = (0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_UPDATE_OPTIONAL);
        const doFullUpdate = (0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_TYPE_FULL_UPDATE);
        if (!isDtoOptional) {
            if ((0, field_classifiers_1.isId)(field))
                return result;
            if ((0, field_classifiers_1.isUpdatedAt)(field))
                return result;
            if ((0, field_classifiers_1.isRequiredWithDefaultValue)(field)) {
                if (templateHelpers.config.showDefaultValues)
                    overrides.isRequired = false;
                else
                    return result;
            }
        }
        if ((0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_UPDATE_REQUIRED)) {
            overrides.isRequired = true;
        }
        if ((0, field_classifiers_1.isType)(field)) {
            if (field.type !== model.name &&
                !(((0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_OVERRIDE_TYPE) ||
                    (0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_CAST_TYPE)) &&
                    (0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_OVERRIDE_API_PROPERTY_TYPE))) {
                const modelToImportFrom = allModels.find(({ name }) => name === field.type);
                if (!modelToImportFrom)
                    throw new Error(`related type '${field.type}' for '${model.name}.${field.name}' not found`);
                const importName = doFullUpdate
                    ? templateHelpers.createDtoName(field.type)
                    : templateHelpers.updateDtoName(field.type);
                const importFrom = (0, slash_1.default)(`${(0, helpers_1.getRelativePath)(model.output.dto, modelToImportFrom.output.dto)}${node_path_1.default.sep}${doFullUpdate
                    ? templateHelpers.createDtoFilename(field.type)
                    : templateHelpers.updateDtoFilename(field.type)}`);
                imports.push({
                    destruct: [
                        importName,
                        ...(templateHelpers.config.wrapRelationsAsType
                            ? [`type ${importName} as ${importName}AsType`]
                            : []),
                    ],
                    from: importFrom,
                });
            }
        }
        if (templateHelpers.config.classValidation) {
            if ((0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_UPDATE_VALIDATE_IF)) {
                overrides.documentation = (_b = ((_a = overrides.documentation) !== null && _a !== void 0 ? _a : field.documentation)) === null || _b === void 0 ? void 0 : _b.replace(annotations_1.DTO_UPDATE_VALIDATE_IF, '@ValidateIf');
            }
            decorators.classValidators = (0, class_validator_1.parseClassValidators)({
                ...field,
                ...overrides,
            }, overrides.type ||
                ((0, field_classifiers_1.isType)(field) && doFullUpdate
                    ? templateHelpers.createDtoName
                    : templateHelpers.updateDtoName));
            (0, helpers_1.concatUniqueIntoArray)(decorators.classValidators, classValidators, 'name');
        }
        if (!templateHelpers.config.noDependencies) {
            if ((0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_API_HIDDEN)) {
                decorators.apiHideProperty = true;
            }
            else {
                const includeType = templateHelpers.config.outputApiPropertyType
                    ? !overrides.type
                    : false;
                decorators.apiProperties = (0, api_decorator_1.parseApiProperty)({
                    ...field,
                    ...overrides,
                    isNullable: !field.isRequired,
                }, {
                    type: includeType,
                });
                if (overrides.type && templateHelpers.config.outputApiPropertyType)
                    decorators.apiProperties.push({
                        name: 'type',
                        value: overrides.type,
                        noEncapsulation: true,
                    });
                const typeProperty = decorators.apiProperties.find((p) => p.name === 'type');
                if ((typeProperty === null || typeProperty === void 0 ? void 0 : typeProperty.value) === field.type)
                    typeProperty.value =
                        '() => ' +
                            (field.type === 'Json'
                                ? 'Object'
                                : doFullUpdate
                                    ? templateHelpers.createDtoName(typeProperty.value)
                                    : templateHelpers.updateDtoName(typeProperty.value));
            }
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
        return [...result, (0, helpers_1.mapDMMFToParsedField)(field, overrides, decorators)];
    }, []);
    const importPrismaClient = (0, helpers_1.makeImportsFromPrismaClient)(fields, templateHelpers.config.prismaClientImportPath, !templateHelpers.config.noDependencies);
    const importNestjsSwagger = (0, api_decorator_1.makeImportsFromNestjsSwagger)(fields, apiExtraModels);
    const importClassValidator = (0, class_validator_1.makeImportsFromClassValidator)(classValidators);
    const customImports = (0, helpers_1.makeCustomImports)(fields);
    return {
        model,
        fields,
        imports: (0, helpers_1.zipImportStatementParams)([
            ...importPrismaClient,
            ...importNestjsSwagger,
            ...importClassValidator,
            ...customImports,
            ...imports,
        ]),
        extraClasses,
        apiExtraModels,
    };
};
exports.computeUpdateDtoParams = computeUpdateDtoParams;
