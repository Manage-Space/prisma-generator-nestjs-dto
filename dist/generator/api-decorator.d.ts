import { DMMF } from '@prisma/generator-helper';
import { IApiProperty, ImportStatementParams, ParsedField } from './types';
export declare function isAnnotatedWithDoc(field: ParsedField): boolean;
export declare function extractAnnotation(field: ParsedField, prop: string): IApiProperty | null;
export declare function encapsulateString(value: string): string;
export declare function parseApiProperty(field: DMMF.Field, include?: {
    default?: boolean;
    doc?: boolean;
    enum?: boolean;
    type?: boolean;
}): IApiProperty[];
export declare function decorateApiProperty(field: ParsedField): string;
export declare function makeImportsFromNestjsSwagger(fields: ParsedField[], apiExtraModels?: string[]): ImportStatementParams[];
