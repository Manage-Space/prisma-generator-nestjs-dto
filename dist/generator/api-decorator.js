"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeImportsFromNestjsSwagger = exports.decorateApiProperty = exports.parseApiProperty = exports.encapsulateString = exports.extractAnnotation = exports.isAnnotatedWithDoc = void 0;
const annotations_1 = require("./annotations");
const field_classifiers_1 = require("./field-classifiers");
const ApiProps = [
    'description',
    'minimum',
    'maximum',
    'exclusiveMinimum',
    'exclusiveMaximum',
    'minLength',
    'maxLength',
    'minItems',
    'maxItems',
    'example',
];
const PrismaScalarToFormat = {
    String: { type: 'string' },
    Boolean: { type: 'boolean' },
    Int: { type: 'integer', format: 'int32' },
    BigInt: { type: 'integer', format: 'int64' },
    Float: { type: 'number', format: 'float' },
    Decimal: { type: 'string', format: 'Decimal.js' },
    DateTime: { type: 'string', format: 'date-time' },
};
function isAnnotatedWithDoc(field) {
    return ApiProps.some((prop) => new RegExp(`@${prop}\\s+(.+)\\s*$`, 'm').test(field.documentation || ''));
}
exports.isAnnotatedWithDoc = isAnnotatedWithDoc;
function getDefaultValue(field) {
    if (!field.hasDefaultValue)
        return undefined;
    if (Array.isArray(field.default))
        return JSON.stringify(field.default);
    switch (typeof field.default) {
        case 'string':
        case 'number':
        case 'boolean':
            return field.default;
        case 'object':
            if (field.default.name) {
                return field.default.name;
            }
        default:
            return undefined;
    }
}
function extractAnnotation(field, prop) {
    const regexp = new RegExp(`@${prop}\\s+(.+)$`, 'm');
    const matches = regexp.exec(field.documentation || '');
    if (matches && matches[1]) {
        return {
            name: prop,
            value: matches[1].trim(),
        };
    }
    return null;
}
exports.extractAnnotation = extractAnnotation;
function encapsulateString(value) {
    if (value === 'true' ||
        value === 'false' ||
        value === 'null' ||
        /^-?\d+(?:\.\d+)?$/.test(value) ||
        /^\[.*]$/.test(value)) {
        return value;
    }
    return `'${value.replace(/'/g, "\\'")}'`;
}
exports.encapsulateString = encapsulateString;
function parseApiProperty(field, include = {}) {
    const incl = {
        default: true,
        doc: true,
        enum: true,
        type: true,
        ...include,
    };
    const properties = [];
    if (incl.doc && field.documentation) {
        for (const prop of ApiProps) {
            const property = extractAnnotation(field, prop);
            if (property) {
                properties.push(property);
            }
        }
    }
    if (incl.type) {
        const rawCastType = (0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_OVERRIDE_API_PROPERTY_TYPE, {
            returnAnnotationParameters: true,
        });
        const castType = rawCastType ? rawCastType.split(',')[0] : undefined;
        const scalarFormat = PrismaScalarToFormat[field.type];
        if (castType) {
            properties.push({
                name: 'type',
                value: '() => ' + castType,
                noEncapsulation: true,
            });
        }
        else if (scalarFormat) {
            properties.push({
                name: 'type',
                value: scalarFormat.type,
            });
            if (scalarFormat.format) {
                properties.push({ name: 'format', value: scalarFormat.format });
            }
        }
        else if (field.kind !== 'enum') {
            properties.push({
                name: 'type',
                value: field.type,
                noEncapsulation: true,
            });
        }
        if (field.isList) {
            properties.push({ name: 'isArray', value: 'true' });
        }
    }
    if (incl.enum && field.kind === 'enum') {
        properties.push({ name: 'enum', value: field.type });
        properties.push({ name: 'enumName', value: field.type });
    }
    const defaultValue = getDefaultValue(field);
    if (incl.default && defaultValue !== undefined) {
        properties.push({ name: 'default', value: `${defaultValue}` });
    }
    if (!field.isRequired) {
        properties.push({ name: 'required', value: 'false' });
    }
    if (typeof field.isNullable === 'boolean' ? field.isNullable : !field.isRequired) {
        properties.push({ name: 'nullable', value: 'true' });
    }
    if (properties.length === 0) {
        properties.push({ name: 'dummy', value: '' });
    }
    return properties;
}
exports.parseApiProperty = parseApiProperty;
function decorateApiProperty(field) {
    var _a, _b;
    if (field.apiHideProperty) {
        return '@ApiHideProperty()\n';
    }
    if (((_a = field.apiProperties) === null || _a === void 0 ? void 0 : _a.length) === 1 &&
        field.apiProperties[0].name === 'dummy') {
        return '@ApiProperty()\n';
    }
    let decorator = '';
    if ((_b = field.apiProperties) === null || _b === void 0 ? void 0 : _b.length) {
        decorator += '@ApiProperty({\n';
        field.apiProperties.forEach((prop) => {
            if (prop.name === 'dummy')
                return;
            decorator += `  ${prop.name}: ${prop.name === 'enum' || prop.noEncapsulation
                ? prop.value
                : encapsulateString(prop.value)},\n`;
        });
        decorator += '})\n';
    }
    return decorator;
}
exports.decorateApiProperty = decorateApiProperty;
function makeImportsFromNestjsSwagger(fields, apiExtraModels) {
    const hasApiProperty = fields.some((field) => { var _a; return (_a = field.apiProperties) === null || _a === void 0 ? void 0 : _a.length; });
    const hasApiHideProperty = fields.some((field) => field.apiHideProperty);
    if (hasApiProperty || hasApiHideProperty || (apiExtraModels === null || apiExtraModels === void 0 ? void 0 : apiExtraModels.length)) {
        const destruct = [];
        if (apiExtraModels === null || apiExtraModels === void 0 ? void 0 : apiExtraModels.length)
            destruct.push('ApiExtraModels');
        if (hasApiHideProperty)
            destruct.push('ApiHideProperty');
        if (hasApiProperty)
            destruct.push('ApiProperty');
        return [{ from: '@nestjs/swagger', destruct }];
    }
    return [];
}
exports.makeImportsFromNestjsSwagger = makeImportsFromNestjsSwagger;
