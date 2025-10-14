import type { DMMF } from '@prisma/generator-helper';
export declare function isAnnotatedWith(instance: Pick<DMMF.Field | DMMF.Model, 'documentation'>, annotation: RegExp, options?: {
    returnAnnotationParameters?: false;
}): boolean;
export declare function isAnnotatedWith(instance: Pick<DMMF.Field | DMMF.Model, 'documentation'>, annotation: RegExp, options: {
    returnAnnotationParameters: true;
}): false | string;
export declare const isAnnotatedWithOneOf: (instance: DMMF.Field | DMMF.Model, annotations: RegExp[]) => boolean;
export declare const isId: (field: DMMF.Field) => boolean;
export declare const isRequired: (field: DMMF.Field) => boolean;
export declare const isScalar: (field: DMMF.Field) => boolean;
export declare const hasDefaultValue: (field: DMMF.Field) => boolean;
export declare const isUnique: (field: DMMF.Field) => boolean;
export declare const isRelation: (field: DMMF.Field) => boolean;
export declare const isType: (field: DMMF.Field) => boolean;
export declare const isIdWithDefaultValue: (field: DMMF.Field) => boolean;
export declare const isReadOnly: (field: DMMF.Field) => boolean;
export declare const isUpdatedAt: (field: DMMF.Field) => boolean;
export declare const isRequiredWithDefaultValue: (field: DMMF.Field) => boolean;
