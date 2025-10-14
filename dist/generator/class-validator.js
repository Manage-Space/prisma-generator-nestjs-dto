"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeImportsFromClassValidator = exports.decorateClassValidators = exports.parseClassValidators = void 0;
const field_classifiers_1 = require("./field-classifiers");
const annotations_1 = require("./annotations");
const validatorsWithoutParams = [
    'IsEmpty',
    'IsDate',
    'IsBoolean',
    'IsString',
    'IsInt',
    'IsPositive',
    'IsNegative',
    'IsBooleanString',
    'IsDateString',
    'IsAlpha',
    'IsAlphanumeric',
    'IsAscii',
    'IsBase32',
    'IsBase58',
    'IsBase64',
    'IsIBAN',
    'IsBIC',
    'IsCreditCard',
    'IsISO4217CurrencyCode',
    'IsEthereumAddress',
    'IsBtcAddress',
    'IsDataURI',
    'IsFullWidth',
    'IsIsHalfWidth',
    'IsIsVariableWidth',
    'IsIsHexColor',
    'IsHSLColor',
    'IsHexadecimal',
    'IsOctal',
    'IsPort',
    'IsEAN',
    'IsISIN',
    'IsJWT',
    'IsObject',
    'IsNotEmptyObject',
    'IsLowercase',
    'IsUppercase',
    'IsLatLong',
    'IsLatitude',
    'IsLongitude',
    'IsISO31661Alpha2',
    'IsISO31661Alpha3',
    'IsLocale',
    'IsMongoId',
    'IsMultiByte',
    'IsNumberString',
    'IsSurrogatePair',
    'IsTaxId',
    'IsMagnetURI',
    'IsFirebasePushId',
    'IsMilitaryTime',
    'IsTimeZone',
    'IsMimeType',
    'IsSemVer',
    'IsISRC',
    'IsRFC3339',
    'Allow',
];
const validatorsWithParams = new Map([
    ['IsDefined', "''"],
    ['Equals', "''"],
    ['NotEquals', "''"],
    ['IsIn', '[]'],
    ['IsNotIn', '[]'],
    ['IsNumber', '{}'],
    ['IsEnum', '{}'],
    ['IsDivisibleBy', '1'],
    ['Min', '0'],
    ['Max', '10'],
    ['MinDate', 'new Date()'],
    ['MaxDate', 'new Date()'],
    ['IsNumberString', '{}'],
    ['Contains', "''"],
    ['NotContains', "''"],
    ['IsDecimal', '{}'],
    ['IsByteLength', '1, 4'],
    ['IsCurrency', '{}'],
    ['IsEmail', '{}'],
    ['IsFQDN', '{}'],
    ['IsRgbColor', '{}'],
    ['IsIdentityCard', "''"],
    ['IsPassportNumber', "''"],
    ['IsPostalCode', "''"],
    ['IsMACAddress', '{}'],
    ['IsIP', "'4'"],
    ['IsISBN', "'10'"],
    ['IsISO8601', '{}'],
    ['IsMobilePhone', "''"],
    ['IsPhoneNumber', "''"],
    ['IsUrl', '{}'],
    ['IsUUID', "'4'"],
    ['Length', '0, 10'],
    ['MinLength', '0'],
    ['MaxLength', '10'],
    ['Matches', "'', ''"],
    ['IsHash', "'md4'"],
    ['IsISSN', '{}'],
    ['IsStrongPassword', '{}'],
    ['IsInstance', "''"],
    ['ValidateIf', ''],
]);
const arrayValidators = [
    'ArrayContains',
    'ArrayNotContains',
    'ArrayNotEmpty',
    'ArrayMinSize',
    'ArrayMaxSize',
    'ArrayUnique',
];
const allValidators = [
    ...validatorsWithoutParams,
    ...validatorsWithParams.keys(),
    ...arrayValidators,
];
const PrismaScalarToValidator = {
    String: { name: 'IsString' },
    Boolean: { name: 'IsBoolean' },
    Int: { name: 'IsInt' },
    BigInt: { name: 'IsInt' },
    Float: { name: 'IsNumber' },
    Decimal: { name: 'IsDecimal' },
    DateTime: { name: 'IsDateString' },
};
function scalarToValidator(scalar) {
    const validator = PrismaScalarToValidator[scalar];
    if (validator) {
        return { ...PrismaScalarToValidator[scalar] };
    }
}
function extractValidator(field, prop) {
    const regexp = new RegExp(`@${prop}(?:\\(([^)]*)\\))?\s*$`, 'm');
    const matches = regexp.exec(field.documentation || '');
    if (matches) {
        return {
            name: prop,
            value: matches[1],
        };
    }
    return null;
}
function optEach(validator, isList) {
    if (isList && !arrayValidators.includes(validator.name)) {
        const defaultParams = validatorsWithParams.get(validator.name);
        if (!validator.value) {
            validator.value = `${defaultParams ? defaultParams + ', ' : ''}{ each: true }`;
            return;
        }
        if (/each:/.test(validator.value))
            return;
        if (defaultParams) {
            const defaults = defaultParams.split(/,\s*/);
            const values = validator.value.replace(/{.*}/, '_').split(/,\s*/);
            if (values.length > defaults.length && /.*}\s*$/.test(validator.value)) {
                validator.value = validator.value.replace(/}\s*$/, ', each: true }');
                return;
            }
            validator.value +=
                defaults.slice(values.length).join(', ') + ', { each: true }';
            return;
        }
        if (/.*}\s*$/.test(validator.value)) {
            validator.value = validator.value.replace(/}\s*$/, ', each: true }');
            return;
        }
        validator.value += ', { each: true }';
    }
}
function parseClassValidators(field, dtoName) {
    const validators = [];
    if (field.isRequired) {
        validators.push({ name: 'IsNotEmpty' });
    }
    else {
        validators.push({ name: 'IsOptional' });
    }
    if (field.isList) {
        validators.push({ name: 'IsArray' });
    }
    if ((0, field_classifiers_1.isType)(field) || (0, field_classifiers_1.isRelation)(field)) {
        const nestedValidator = { name: 'ValidateNested' };
        optEach(nestedValidator, field.isList);
        const rawCastType = [annotations_1.DTO_OVERRIDE_TYPE, annotations_1.DTO_CAST_TYPE].reduce((cast, annotation) => {
            if (cast)
                return cast;
            return (0, field_classifiers_1.isAnnotatedWith)(field, annotation, {
                returnAnnotationParameters: true,
            });
        }, false);
        const castType = rawCastType ? rawCastType.split(',')[0] : undefined;
        validators.push(nestedValidator);
        validators.push({
            name: 'Type',
            value: `() => ${dtoName
                ? typeof dtoName === 'string'
                    ? dtoName
                    : dtoName(field.type)
                : castType || field.type}`,
        });
    }
    else {
        const typeValidator = scalarToValidator(field.type);
        if (typeValidator) {
            optEach(typeValidator, field.isList);
            validators.push(typeValidator);
        }
    }
    if (field.documentation) {
        for (const prop of allValidators) {
            const validator = extractValidator(field, prop);
            if (validator) {
                const index = validators.findIndex((v) => v.name === validator.name);
                if (index > -1)
                    validators.splice(index, 1);
                optEach(validator, field.isList);
                validators.push(validator);
            }
        }
    }
    return validators;
}
exports.parseClassValidators = parseClassValidators;
function decorateClassValidators(field) {
    var _a;
    if (!((_a = field.classValidators) === null || _a === void 0 ? void 0 : _a.length))
        return '';
    let output = '';
    field.classValidators.forEach((prop) => {
        output += `@${prop.name}(${prop.value ? prop.value : ''})\n`;
    });
    return output;
}
exports.decorateClassValidators = decorateClassValidators;
function makeImportsFromClassValidator(classValidators) {
    const validator = new Set();
    const transformer = new Set();
    classValidators === null || classValidators === void 0 ? void 0 : classValidators.forEach((cv) => {
        if (cv.name === 'Type') {
            transformer.add(cv.name);
        }
        else {
            validator.add(cv.name);
        }
    });
    const imports = [];
    if (validator.size) {
        imports.push({
            from: 'class-validator',
            destruct: [...validator.values()],
        });
    }
    if (transformer.size) {
        imports.push({
            from: 'class-transformer',
            destruct: [...transformer.values()],
        });
    }
    return imports;
}
exports.makeImportsFromClassValidator = makeImportsFromClassValidator;
