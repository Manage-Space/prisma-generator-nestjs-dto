"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePlainDtoParams = void 0;
const slash_1 = __importDefault(require("slash"));
const node_path_1 = __importDefault(require("node:path"));
const annotations_1 = require("../annotations");
const field_classifiers_1 = require("../field-classifiers");
const helpers_1 = require("../helpers");
const api_decorator_1 = require("../api-decorator");
const computePlainDtoParams = ({ model, allModels, templateHelpers, }) => {
    const imports = [];
    const apiExtraModels = [];
    const relationScalarFields = (0, helpers_1.getRelationScalars)(model.fields);
    const relationScalarFieldNames = Object.keys(relationScalarFields);
    const fields = model.fields.reduce((result, field) => {
        const { name } = field;
        const overrides = {
            isRequired: true,
            isNullable: !field.isRequired,
        };
        const decorators = {};
        if ((0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_ENTITY_HIDDEN))
            return result;
        if ((0, field_classifiers_1.isRelation)(field))
            return result;
        if (!(0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_RELATION_INCLUDE_ID) &&
            relationScalarFieldNames.includes(name))
            return result;
        if ((0, field_classifiers_1.isType)(field)) {
            if (field.type !== model.name &&
                !(((0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_OVERRIDE_TYPE) ||
                    (0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_CAST_TYPE)) &&
                    (0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_OVERRIDE_API_PROPERTY_TYPE))) {
                const modelToImportFrom = allModels.find(({ name }) => name === field.type);
                if (!modelToImportFrom)
                    throw new Error(`related type '${field.type}' for '${model.name}.${field.name}' not found`);
                const importName = templateHelpers.plainDtoName(field.type);
                const importFrom = (0, slash_1.default)(`${(0, helpers_1.getRelativePath)(model.output.dto, modelToImportFrom.output.dto)}${node_path_1.default.sep}${templateHelpers.plainDtoFilename(field.type)}`);
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
        if (!templateHelpers.config.noDependencies) {
            if ((0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_API_HIDDEN)) {
                decorators.apiHideProperty = true;
            }
            else {
                decorators.apiProperties = (0, api_decorator_1.parseApiProperty)({
                    ...field,
                    isRequired: templateHelpers.config.requiredResponseApiProperty
                        ? !!overrides.isRequired
                        : false,
                    isNullable: !field.isRequired,
                }, {
                    default: false,
                    type: templateHelpers.config.outputApiPropertyType,
                });
                const typeProperty = decorators.apiProperties.find((p) => p.name === 'type');
                if ((typeProperty === null || typeProperty === void 0 ? void 0 : typeProperty.value) === field.type)
                    typeProperty.value =
                        '() => ' +
                            (field.type === 'Json'
                                ? 'Object'
                                : templateHelpers.plainDtoName(typeProperty.value));
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
    const customImports = (0, helpers_1.makeCustomImports)(fields);
    return {
        model,
        fields,
        imports: (0, helpers_1.zipImportStatementParams)([
            ...importPrismaClient,
            ...importNestjsSwagger,
            ...customImports,
            ...imports,
        ]),
        apiExtraModels,
    };
};
exports.computePlainDtoParams = computePlainDtoParams;
