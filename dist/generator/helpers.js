"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zipImportStatementParams = exports.mergeImportStatements = exports.generateUniqueInput = exports.generateRelationInput = exports.getRelativePath = exports.getRelationConnectInputFields = exports.getRelationScalars = exports.mapDMMFToParsedField = exports.makeCustomImports = exports.makeImportsFromPrismaClient = exports.concatUniqueIntoArray = exports.concatIntoArray = exports.uniq = void 0;
const node_path_1 = __importDefault(require("node:path"));
const slash_1 = __importDefault(require("slash"));
const field_classifiers_1 = require("./field-classifiers");
const template_helpers_1 = require("./template-helpers");
const api_decorator_1 = require("./api-decorator");
const class_validator_1 = require("./class-validator");
const annotations_1 = require("./annotations");
const uniq = (input) => Array.from(new Set(input));
exports.uniq = uniq;
const concatIntoArray = (source, target) => source.forEach((item) => target.push(item));
exports.concatIntoArray = concatIntoArray;
function concatUniqueIntoArray(source, target, prop) {
    const find = prop
        ? (item) => !target.find((v) => v[prop] === item[prop])
        : (item) => target.indexOf(item) < 0;
    source.filter(find).forEach((item) => target.push(item));
}
exports.concatUniqueIntoArray = concatUniqueIntoArray;
const makeImportsFromPrismaClient = (fields, prismaClientImportPath, importEnums = true) => {
    const enumsToImport = importEnums
        ? (0, exports.uniq)(fields.filter(({ kind }) => kind === 'enum').map(({ type }) => type))
        : [];
    const importPrisma = fields
        .filter(({ kind }) => kind === 'scalar')
        .some(({ type, documentation }) => !(0, field_classifiers_1.isAnnotatedWith)({ documentation }, annotations_1.DTO_CAST_TYPE) &&
        !(0, field_classifiers_1.isAnnotatedWith)({ documentation }, annotations_1.DTO_OVERRIDE_TYPE) &&
        (0, template_helpers_1.scalarToTS)(type).includes('Prisma'));
    return enumsToImport.length || importPrisma
        ? [
            {
                from: prismaClientImportPath,
                destruct: importPrisma ? ['Prisma', ...enumsToImport] : enumsToImport,
            },
        ]
        : [];
};
exports.makeImportsFromPrismaClient = makeImportsFromPrismaClient;
const makeCustomImports = (fields) => {
    return [
        [annotations_1.DTO_OVERRIDE_TYPE, annotations_1.DTO_CAST_TYPE],
        [annotations_1.DTO_OVERRIDE_API_PROPERTY_TYPE],
    ].flatMap((annotations) => {
        return fields.flatMap(({ documentation }) => {
            const castType = annotations.reduce((cast, annotation) => {
                if (cast)
                    return cast;
                return (0, field_classifiers_1.isAnnotatedWith)({ documentation }, annotation, {
                    returnAnnotationParameters: true,
                });
            }, false);
            if (!castType || !castType.includes(',')) {
                return [];
            }
            const [importAs, importFrom, importWas] = castType
                .split(',')
                .map((s) => s.trim());
            if (!importFrom) {
                throw new Error("Invalid DTOCastType annotation. Requesting import but did not provide 'from' value.");
            }
            if (!importWas || importWas === importAs) {
                return {
                    from: importFrom,
                    destruct: [importAs],
                };
            }
            else if (importWas === 'default') {
                return {
                    from: importFrom,
                    default: importAs,
                };
            }
            else if (importWas === '*') {
                return {
                    from: importFrom,
                    default: { '*': importAs },
                };
            }
            else {
                return {
                    from: importFrom,
                    destruct: [{ [importWas]: importAs }],
                };
            }
        });
    });
};
exports.makeCustomImports = makeCustomImports;
const mapDMMFToParsedField = (field, overrides = {}, decorators = {}) => ({
    ...field,
    ...overrides,
    ...decorators,
});
exports.mapDMMFToParsedField = mapDMMFToParsedField;
const getRelationScalars = (fields) => {
    const scalars = fields.flatMap(({ relationFromFields = [] }) => relationFromFields);
    return scalars.reduce((result, scalar) => ({
        ...result,
        [scalar]: fields
            .filter(({ relationFromFields = [] }) => relationFromFields.includes(scalar))
            .map(({ name }) => name),
    }), {});
};
exports.getRelationScalars = getRelationScalars;
const getRelationConnectInputFields = ({ field, allModels, }) => {
    const { name, type, relationToFields = [] } = field;
    if (!(0, field_classifiers_1.isRelation)(field)) {
        throw new Error(`Can not resolve RelationConnectInputFields for field '${name}'. Not a relation field.`);
    }
    const relatedModel = allModels.find(({ name: modelName }) => modelName === type);
    if (!relatedModel) {
        throw new Error(`Can not resolve RelationConnectInputFields for field '${name}'. Related model '${type}' unknown.`);
    }
    if (!relationToFields.length) {
        throw new Error(`Can not resolve RelationConnectInputFields for field '${name}'. Foreign keys are unknown.`);
    }
    const foreignKeyFields = relationToFields.map((relationToFieldName) => {
        const relatedField = relatedModel.fields.find((relatedModelField) => relatedModelField.name === relationToFieldName);
        if (!relatedField)
            throw new Error(`Can not find foreign key field '${relationToFieldName}' on model '${relatedModel.name}'`);
        return relatedField;
    });
    const idFields = relatedModel.fields.filter((relatedModelField) => (0, field_classifiers_1.isId)(relatedModelField));
    const uniqueFields = relatedModel.fields.filter((relatedModelField) => (0, field_classifiers_1.isUnique)(relatedModelField));
    const foreignFields = new Set([
        ...foreignKeyFields,
        ...idFields,
        ...uniqueFields,
    ]);
    return foreignFields;
};
exports.getRelationConnectInputFields = getRelationConnectInputFields;
const getRelativePath = (from, to) => {
    const result = (0, slash_1.default)(node_path_1.default.relative(from, to));
    return result || '.';
};
exports.getRelativePath = getRelativePath;
const generateRelationInput = ({ field, model, allModels, templateHelpers: t, preAndSuffixClassName, canCreateAnnotation, canConnectAnnotation, canDisconnectAnnotation, }) => {
    const relationInputClassProps = [];
    const imports = [];
    const apiExtraModels = [];
    const generatedClasses = [];
    const classValidators = [];
    const createRelation = (0, field_classifiers_1.isAnnotatedWith)(field, canCreateAnnotation);
    const connectRelation = (0, field_classifiers_1.isAnnotatedWith)(field, canConnectAnnotation);
    const disconnectRelation = canDisconnectAnnotation
        ? (0, field_classifiers_1.isAnnotatedWith)(field, canDisconnectAnnotation)
        : undefined;
    const isRequired = [createRelation, connectRelation, disconnectRelation].filter((v) => v)
        .length === 1;
    const rawCastType = [annotations_1.DTO_OVERRIDE_TYPE, annotations_1.DTO_CAST_TYPE].reduce((cast, annotation) => {
        if (cast)
            return cast;
        return (0, field_classifiers_1.isAnnotatedWith)(field, annotation, {
            returnAnnotationParameters: true,
        });
    }, false);
    const castType = rawCastType ? rawCastType.split(',')[0] : undefined;
    const rawCastApiType = (0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_OVERRIDE_API_PROPERTY_TYPE, {
        returnAnnotationParameters: true,
    });
    const castApiType = rawCastApiType ? rawCastApiType.split(',')[0] : undefined;
    if (createRelation) {
        const preAndPostfixedName = t.createDtoName(field.type);
        apiExtraModels.push(preAndPostfixedName);
        const modelToImportFrom = allModels.find(({ name }) => name === field.type);
        if (!modelToImportFrom)
            throw new Error(`related model '${field.type}' for '${model.name}.${field.name}' not found`);
        imports.push({
            from: (0, slash_1.default)(`${(0, exports.getRelativePath)(model.output.dto, modelToImportFrom.output.dto)}${node_path_1.default.sep}${t.createDtoFilename(field.type)}`),
            destruct: [preAndPostfixedName],
        });
        const decorators = {};
        if (t.config.classValidation) {
            decorators.classValidators = (0, class_validator_1.parseClassValidators)({ ...field, isRequired }, castType || preAndPostfixedName);
            concatUniqueIntoArray(decorators.classValidators, classValidators, 'name');
        }
        if (!t.config.noDependencies) {
            decorators.apiProperties = (0, api_decorator_1.parseApiProperty)({ ...field, isRequired }, { type: false });
            decorators.apiProperties.push({
                name: 'type',
                value: castApiType ? '() => ' + castApiType : preAndPostfixedName,
                noEncapsulation: true,
            });
            if (field.isList)
                decorators.apiProperties.push({
                    name: 'isArray',
                    value: 'true',
                });
        }
        relationInputClassProps.push({
            name: 'create',
            type: castType || preAndPostfixedName,
            apiProperties: decorators.apiProperties,
            classValidators: decorators.classValidators,
        });
    }
    if (connectRelation) {
        const preAndPostfixedName = t.connectDtoName(field.type);
        apiExtraModels.push(preAndPostfixedName);
        const modelToImportFrom = allModels.find(({ name }) => name === field.type);
        if (!modelToImportFrom)
            throw new Error(`related model '${field.type}' for '${model.name}.${field.name}' not found`);
        imports.push({
            from: (0, slash_1.default)(`${(0, exports.getRelativePath)(model.output.dto, modelToImportFrom.output.dto)}${node_path_1.default.sep}${t.connectDtoFilename(field.type)}`),
            destruct: [preAndPostfixedName],
        });
        const decorators = {};
        if (t.config.classValidation) {
            decorators.classValidators = (0, class_validator_1.parseClassValidators)({ ...field, isRequired }, castType || preAndPostfixedName);
            concatUniqueIntoArray(decorators.classValidators, classValidators, 'name');
        }
        if (!t.config.noDependencies) {
            decorators.apiProperties = (0, api_decorator_1.parseApiProperty)({ ...field, isRequired }, { type: false });
            decorators.apiProperties.push({
                name: 'type',
                value: castApiType ? '() => ' + castApiType : preAndPostfixedName,
                noEncapsulation: true,
            });
            if (field.isList)
                decorators.apiProperties.push({
                    name: 'isArray',
                    value: 'true',
                });
        }
        relationInputClassProps.push({
            name: 'connect',
            type: castType || preAndPostfixedName,
            apiProperties: decorators.apiProperties,
            classValidators: decorators.classValidators,
        });
    }
    if (disconnectRelation) {
        if (field.isRequired && !field.isList) {
            throw new Error(`The disconnect annotation is not supported for required field '${model.name}.${field.name}'`);
        }
        if (!field.isList) {
            const decorators = {};
            if (t.config.classValidation) {
                decorators.classValidators = (0, class_validator_1.parseClassValidators)({
                    ...field,
                    isRequired,
                    type: 'Boolean',
                    kind: 'scalar',
                });
                concatUniqueIntoArray(decorators.classValidators, classValidators, 'name');
            }
            if (!t.config.noDependencies) {
                decorators.apiProperties = (0, api_decorator_1.parseApiProperty)({ ...field, isRequired }, { type: false });
                decorators.apiProperties.push({
                    name: 'type',
                    value: 'boolean',
                    noEncapsulation: false,
                });
            }
            relationInputClassProps.push({
                name: 'disconnect',
                type: 'boolean',
                apiProperties: decorators.apiProperties,
                classValidators: decorators.classValidators,
            });
        }
        else {
            const preAndPostfixedName = t.connectDtoName(field.type);
            apiExtraModels.push(preAndPostfixedName);
            const modelToImportFrom = allModels.find(({ name }) => name === field.type);
            if (!modelToImportFrom)
                throw new Error(`related model '${field.type}' for '${model.name}.${field.name}' not found`);
            imports.push({
                from: (0, slash_1.default)(`${(0, exports.getRelativePath)(model.output.dto, modelToImportFrom.output.dto)}${node_path_1.default.sep}${t.connectDtoFilename(field.type)}`),
                destruct: [preAndPostfixedName],
            });
            const decorators = {};
            if (t.config.classValidation) {
                decorators.classValidators = (0, class_validator_1.parseClassValidators)({ ...field, isRequired }, castType || preAndPostfixedName);
                concatUniqueIntoArray(decorators.classValidators, classValidators, 'name');
            }
            if (!t.config.noDependencies) {
                decorators.apiProperties = (0, api_decorator_1.parseApiProperty)({ ...field, isRequired }, { type: false });
                decorators.apiProperties.push({
                    name: 'type',
                    value: castApiType ? '() => ' + castApiType : preAndPostfixedName,
                    noEncapsulation: true,
                });
            }
            relationInputClassProps.push({
                name: 'disconnect',
                type: castType || preAndPostfixedName,
                apiProperties: decorators.apiProperties,
                classValidators: decorators.classValidators,
            });
        }
    }
    if (!relationInputClassProps.length) {
        throw new Error(`Can not find relation input props for '${model.name}.${field.name}'`);
    }
    if (t.config.wrapRelationsAsType) {
        relationInputClassProps.forEach((prop) => {
            prop.type += 'AsType';
        });
        imports.forEach(({ destruct }) => {
            if (destruct && destruct[0]) {
                destruct.push(`type ${destruct[0]} as ${destruct[0]}AsType`);
            }
        });
    }
    const originalInputClassName = `${t.transformClassNameCase(model.name)}${t.transformClassNameCase(field.name)}RelationInput`;
    const preAndPostfixedInputClassName = preAndSuffixClassName(originalInputClassName);
    generatedClasses.push(`${t.config.outputType} ${preAndPostfixedInputClassName} {
    ${t.fieldsToDtoProps(relationInputClassProps.map((inputField) => ({
        ...inputField,
        kind: 'relation-input',
        isRequired: relationInputClassProps.length === 1,
        isList: field.isList,
    })), 'plain', true)}
  }`);
    apiExtraModels.push(preAndPostfixedInputClassName);
    return {
        type: preAndPostfixedInputClassName,
        imports,
        generatedClasses,
        apiExtraModels,
        classValidators,
    };
};
exports.generateRelationInput = generateRelationInput;
const generateUniqueInput = ({ compoundName, fields, model, templateHelpers: t, }) => {
    const imports = [];
    const apiExtraModels = [];
    const generatedClasses = [];
    const classValidators = [];
    const parsedFields = fields.map((field) => {
        const overrides = { isRequired: true };
        const decorators = {};
        if (t.config.classValidation) {
            decorators.classValidators = (0, class_validator_1.parseClassValidators)({
                ...field,
                ...overrides,
            });
            concatUniqueIntoArray(decorators.classValidators, classValidators, 'name');
        }
        if (!t.config.noDependencies) {
            decorators.apiProperties = (0, api_decorator_1.parseApiProperty)({
                ...field,
                ...overrides,
            }, {
                type: t.config.outputApiPropertyType,
            });
            const typeProperty = decorators.apiProperties.find((p) => p.name === 'type');
            if ((typeProperty === null || typeProperty === void 0 ? void 0 : typeProperty.value) === field.type && field.type === 'Json')
                typeProperty.value = '() => Object';
        }
        if (t.config.noDependencies) {
            if (field.type === 'Json')
                field.type = 'Object';
            else if (field.type === 'Decimal')
                field.type = 'String';
        }
        return (0, exports.mapDMMFToParsedField)(field, overrides, decorators);
    });
    const originalInputClassName = `${t.transformClassNameCase(model.name)}${t.transformClassNameCase(compoundName)}UniqueInput`;
    const preAndPostfixedInputClassName = t.plainDtoName(originalInputClassName);
    generatedClasses.push(`${t.config.outputType} ${preAndPostfixedInputClassName} {
    ${t.fieldsToDtoProps(parsedFields, 'plain', true)}
  }`);
    apiExtraModels.push(preAndPostfixedInputClassName);
    const importPrismaClient = (0, exports.makeImportsFromPrismaClient)(fields, t.config.prismaClientImportPath);
    return {
        type: preAndPostfixedInputClassName,
        imports: (0, exports.zipImportStatementParams)([...importPrismaClient, ...imports]),
        generatedClasses,
        apiExtraModels,
        classValidators,
    };
};
exports.generateUniqueInput = generateUniqueInput;
const mergeImportStatements = (first, second) => {
    if (first.from !== second.from) {
        throw new Error(`Can not merge import statements; 'from' parameter is different`);
    }
    if (first.default && second.default && first.default !== second.default) {
        throw new Error(`Can not merge import statements; both statements have set the 'default' preoperty`);
    }
    const firstDestruct = first.destruct || [];
    const secondDestruct = second.destruct || [];
    const destructStrings = (0, exports.uniq)([...firstDestruct, ...secondDestruct].filter((destructItem) => typeof destructItem === 'string'));
    const destructObject = [...firstDestruct, ...secondDestruct].reduce((result, destructItem) => {
        if (typeof destructItem === 'string')
            return result;
        return { ...result, ...destructItem };
    }, {});
    return {
        ...first,
        ...second,
        destruct: [...destructStrings, destructObject],
    };
};
exports.mergeImportStatements = mergeImportStatements;
const zipImportStatementParams = (items) => {
    const itemsByFrom = items.reduce((result, item) => {
        const { from } = item;
        const { [from]: existingItem } = result;
        if (!existingItem) {
            return { ...result, [from]: item };
        }
        return {
            ...result,
            [from]: (0, exports.mergeImportStatements)(existingItem, item),
        };
    }, {});
    const imports = Object.values(itemsByFrom);
    imports.forEach((item) => {
        var _a;
        (_a = item.destruct) === null || _a === void 0 ? void 0 : _a.sort();
    });
    return imports;
};
exports.zipImportStatementParams = zipImportStatementParams;
