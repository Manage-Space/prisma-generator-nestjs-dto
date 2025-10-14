"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRequiredWithDefaultValue = exports.isUpdatedAt = exports.isReadOnly = exports.isIdWithDefaultValue = exports.isType = exports.isRelation = exports.isUnique = exports.hasDefaultValue = exports.isScalar = exports.isRequired = exports.isId = exports.isAnnotatedWithOneOf = exports.isAnnotatedWith = void 0;
const annotations_1 = require("./annotations");
const ANNOTATION_PARAMS_REGEX = /(?:\(([@_A-Za-z0-9\-\/\>\+\=\'\.\\\, \[\]]*)\))?/;
function isAnnotatedWith(instance, annotation, options) {
    var _a;
    const { documentation = '' } = instance;
    if (!(options === null || options === void 0 ? void 0 : options.returnAnnotationParameters)) {
        return annotation.test(documentation);
    }
    else {
        const annotationAndParams = new RegExp(annotation.source + ANNOTATION_PARAMS_REGEX.source, annotation.flags);
        const match = annotationAndParams.exec(documentation);
        if (match === null || match.length < 2) {
            return false;
        }
        else {
            return (_a = match[1]) !== null && _a !== void 0 ? _a : '';
        }
    }
}
exports.isAnnotatedWith = isAnnotatedWith;
const isAnnotatedWithOneOf = (instance, annotations) => annotations.some((annotation) => isAnnotatedWith(instance, annotation));
exports.isAnnotatedWithOneOf = isAnnotatedWithOneOf;
const isId = (field) => {
    return field.isId;
};
exports.isId = isId;
const isRequired = (field) => {
    return field.isRequired;
};
exports.isRequired = isRequired;
const isScalar = (field) => {
    return field.kind === 'scalar';
};
exports.isScalar = isScalar;
const hasDefaultValue = (field) => {
    return field.hasDefaultValue;
};
exports.hasDefaultValue = hasDefaultValue;
const isUnique = (field) => {
    return field.isUnique;
};
exports.isUnique = isUnique;
const isRelation = (field) => {
    const { kind, relationName } = field;
    return kind === 'object' && !!relationName;
};
exports.isRelation = isRelation;
const isType = (field) => {
    return field.kind === 'object' && !field.relationName;
};
exports.isType = isType;
const isIdWithDefaultValue = (field) => (0, exports.isId)(field) && (0, exports.hasDefaultValue)(field);
exports.isIdWithDefaultValue = isIdWithDefaultValue;
const isReadOnly = (field) => field.isReadOnly || isAnnotatedWith(field, annotations_1.DTO_READ_ONLY);
exports.isReadOnly = isReadOnly;
const isUpdatedAt = (field) => {
    return !!field.isUpdatedAt;
};
exports.isUpdatedAt = isUpdatedAt;
const isRequiredWithDefaultValue = (field) => (0, exports.isRequired)(field) && (0, exports.hasDefaultValue)(field);
exports.isRequiredWithDefaultValue = isRequiredWithDefaultValue;
