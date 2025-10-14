"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeHelpers = exports.importStatements = exports.importStatement = exports.each = exports.unless = exports.when = exports.echo = exports.scalarToTS = void 0;
const api_decorator_1 = require("./api-decorator");
const class_validator_1 = require("./class-validator");
const field_classifiers_1 = require("./field-classifiers");
const annotations_1 = require("./annotations");
const PrismaScalarToTypeScript = {
    String: 'string',
    Boolean: 'boolean',
    Int: 'number',
    BigInt: 'bigint',
    Float: 'number',
    Decimal: 'Prisma.Decimal',
    DateTime: 'Date',
    Json: 'Prisma.JsonValue',
    Bytes: 'Buffer',
    Object: '{ [key: string]: any }',
};
const knownPrismaScalarTypes = Object.keys(PrismaScalarToTypeScript);
const scalarToTS = (scalar, useInputTypes = false) => {
    if (!knownPrismaScalarTypes.includes(scalar)) {
        throw new Error(`Unrecognized scalar type: ${scalar}`);
    }
    if (useInputTypes && scalar === 'Json') {
        return 'Prisma.InputJsonValue';
    }
    return PrismaScalarToTypeScript[scalar];
};
exports.scalarToTS = scalarToTS;
const echo = (input) => input;
exports.echo = echo;
const when = (condition, thenTemplate, elseTemplate = '') => (condition ? thenTemplate : elseTemplate);
exports.when = when;
const unless = (condition, thenTemplate, elseTemplate = '') => (!condition ? thenTemplate : elseTemplate);
exports.unless = unless;
const each = (arr, fn, joinWith = '') => arr.map(fn).join(joinWith);
exports.each = each;
const importStatement = (input) => {
    const { from, destruct = [], default: defaultExport } = input;
    const fragments = ['import'];
    if (defaultExport) {
        if (typeof defaultExport === 'string') {
            fragments.push(defaultExport);
        }
        else {
            fragments.push(`* as ${defaultExport['*']}`);
        }
    }
    if (destruct.length) {
        if (defaultExport) {
            fragments.push(',');
        }
        fragments.push(`{${destruct.flatMap((item) => {
            if (typeof item === 'string')
                return item;
            return Object.entries(item).map(([key, value]) => `${key} as ${value}`);
        })}}`);
    }
    fragments.push(`from '${from}'`);
    return fragments.join(' ');
};
exports.importStatement = importStatement;
const importStatements = (items) => `${(0, exports.each)(items, exports.importStatement, '\n')}`;
exports.importStatements = importStatements;
const makeHelpers = ({ connectDtoPrefix, createDtoPrefix, updateDtoPrefix, dtoSuffix, entityPrefix, entitySuffix, transformClassNameCase = exports.echo, transformFileNameCase = exports.echo, classValidation, outputType, noDependencies, definiteAssignmentAssertion, requiredResponseApiProperty, outputPath, prismaClientImportPath, outputApiPropertyType, wrapRelationsAsType, showDefaultValues, }) => {
    const className = (name, prefix = '', suffix = '') => `${prefix}${transformClassNameCase(name)}${suffix}`;
    const fileName = (name, prefix = '', suffix = '', withExtension = false) => `${prefix}${transformFileNameCase(name)}${suffix}${(0, exports.when)(withExtension, '.ts')}`;
    const entityName = (name) => new RegExp(`${dtoSuffix || 'dto'}$`, 'i').test(name)
        ? className(name, '', '')
        : className(name, entityPrefix, entitySuffix);
    const connectDtoName = (name) => className(name, connectDtoPrefix, dtoSuffix);
    const createDtoName = (name) => className(name, createDtoPrefix, dtoSuffix);
    const updateDtoName = (name) => className(name, updateDtoPrefix, dtoSuffix);
    const plainDtoName = (name) => className(name, '', dtoSuffix);
    const dtoName = (name, dtoType) => {
        switch (dtoType) {
            case 'create':
                return createDtoName(name);
            case 'update':
                return updateDtoName(name);
            default:
                return plainDtoName(name);
        }
    };
    const connectDtoFilename = (name, withExtension = false) => fileName(name, 'connect-', '.dto', withExtension);
    const createDtoFilename = (name, withExtension = false) => fileName(name, 'create-', '.dto', withExtension);
    const updateDtoFilename = (name, withExtension = false) => fileName(name, 'update-', '.dto', withExtension);
    const entityFilename = (name, withExtension = false) => fileName(name, undefined, '.entity', withExtension);
    const plainDtoFilename = (name, withExtension = false) => fileName(name, undefined, '.dto', withExtension);
    const fieldType = (field, dtoType = 'plain', toInputType = false) => {
        const doFullUpdate = dtoType === 'update' &&
            (0, field_classifiers_1.isType)(field) &&
            (0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_TYPE_FULL_UPDATE);
        const rawCastType = [annotations_1.DTO_OVERRIDE_TYPE, annotations_1.DTO_CAST_TYPE].reduce((cast, annotation) => {
            if (cast)
                return cast;
            return (0, field_classifiers_1.isAnnotatedWith)(field, annotation, {
                returnAnnotationParameters: true,
            });
        }, false);
        const castType = rawCastType ? rawCastType.split(',')[0] : undefined;
        return `${castType ||
            (field.kind === 'scalar'
                ? (0, exports.scalarToTS)(field.type, toInputType)
                : field.kind === 'enum' ||
                    field.kind === 'relation-input' ||
                    field.pureType === true
                    ? field.type
                    : (field.relationName
                        ? entityName(field.type)
                        : dtoName(field.type, doFullUpdate ? 'create' : dtoType)) +
                        (0, exports.when)(wrapRelationsAsType, 'AsType'))}${(0, exports.when)(field.isList, '[]')}`;
    };
    const fieldToDtoProp = (field, dtoType, useInputTypes = false, forceOptional = false) => `${(0, api_decorator_1.decorateApiProperty)(field)}${(0, class_validator_1.decorateClassValidators)(field)}${field.name}${(0, exports.unless)(field.isRequired && !forceOptional, '?', (0, exports.when)(definiteAssignmentAssertion, '!'))}: ${fieldType(field, dtoType, useInputTypes)} ${(0, exports.when)(field.isNullable, ' | ' +
        (0, exports.when)(fieldType(field, dtoType, useInputTypes) === 'Prisma.InputJsonValue', 'Prisma.NullableJsonNullValueInput', 'null'))};`;
    const fieldsToDtoProps = (fields, dtoType, useInputTypes = false, forceOptional = false) => `${(0, exports.each)(fields, (field) => fieldToDtoProp(field, dtoType, useInputTypes, forceOptional), '\n')}`;
    const fieldToEntityProp = (field) => `${(0, api_decorator_1.decorateApiProperty)(field)}${(0, class_validator_1.decorateClassValidators)(field)}${field.name}${(0, exports.unless)(field.isRequired, '?', (0, exports.when)(definiteAssignmentAssertion, '!'))}: ${fieldType(field)} ${(0, exports.when)(field.isNullable, ' | null')};`;
    const fieldsToEntityProps = (fields) => `${(0, exports.each)(fields, (field) => fieldToEntityProp(field), '\n')}`;
    const apiExtraModels = (names) => `@ApiExtraModels(${names.map(entityName)})`;
    return {
        config: {
            connectDtoPrefix,
            createDtoPrefix,
            updateDtoPrefix,
            dtoSuffix,
            entityPrefix,
            entitySuffix,
            classValidation,
            outputType,
            noDependencies,
            definiteAssignmentAssertion,
            requiredResponseApiProperty,
            outputPath,
            prismaClientImportPath,
            outputApiPropertyType,
            wrapRelationsAsType,
            showDefaultValues,
        },
        apiExtraModels,
        entityName,
        connectDtoName,
        createDtoName,
        updateDtoName,
        plainDtoName,
        connectDtoFilename,
        createDtoFilename,
        updateDtoFilename,
        entityFilename,
        plainDtoFilename,
        each: exports.each,
        echo: exports.echo,
        fieldsToDtoProps,
        fieldToDtoProp,
        fieldToEntityProp,
        fieldsToEntityProps,
        fieldType,
        for: exports.each,
        if: exports.when,
        importStatement: exports.importStatement,
        importStatements: exports.importStatements,
        transformClassNameCase,
        transformFileNameCase,
        unless: exports.unless,
        when: exports.when,
    };
};
exports.makeHelpers = makeHelpers;
