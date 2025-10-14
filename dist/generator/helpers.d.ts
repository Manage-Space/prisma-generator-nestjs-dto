import type { DMMF } from '@prisma/generator-helper';
import type { TemplateHelpers } from './template-helpers';
import type { IClassValidator, IDecorators, ImportStatementParams, Model, ParsedField } from './types';
export declare const uniq: <T = any>(input: T[]) => T[];
export declare const concatIntoArray: <T = any>(source: T[], target: T[]) => void;
export declare function concatUniqueIntoArray<T = any>(source: T[], target: T[]): void;
export declare function concatUniqueIntoArray<T = {
    [key: string]: any;
}>(source: T[], target: T[], prop: string): void;
export declare const makeImportsFromPrismaClient: (fields: ParsedField[], prismaClientImportPath: string, importEnums?: boolean) => ImportStatementParams[];
export declare const makeCustomImports: (fields: ParsedField[]) => ImportStatementParams[];
export declare const mapDMMFToParsedField: (field: DMMF.Field, overrides?: Partial<DMMF.Field>, decorators?: IDecorators) => ParsedField;
export declare const getRelationScalars: (fields: DMMF.Field[]) => Record<string, string[]>;
interface GetRelationConnectInputFieldsParam {
    field: DMMF.Field;
    allModels: DMMF.Model[];
}
export declare const getRelationConnectInputFields: ({ field, allModels, }: GetRelationConnectInputFieldsParam) => Set<DMMF.Field>;
export declare const getRelativePath: (from: string, to: string) => string;
interface GenerateRelationInputParam {
    field: DMMF.Field;
    model: Model;
    allModels: Model[];
    templateHelpers: TemplateHelpers;
    preAndSuffixClassName: TemplateHelpers['createDtoName'] | TemplateHelpers['updateDtoName'];
    canCreateAnnotation: RegExp;
    canConnectAnnotation: RegExp;
    canDisconnectAnnotation?: RegExp;
}
export declare const generateRelationInput: ({ field, model, allModels, templateHelpers: t, preAndSuffixClassName, canCreateAnnotation, canConnectAnnotation, canDisconnectAnnotation, }: GenerateRelationInputParam) => {
    type: string;
    imports: ImportStatementParams[];
    generatedClasses: string[];
    apiExtraModels: string[];
    classValidators: IClassValidator[];
};
interface GenerateUniqueInputParam {
    compoundName: string;
    fields: DMMF.Field[];
    model: Model;
    templateHelpers: TemplateHelpers;
}
export declare const generateUniqueInput: ({ compoundName, fields, model, templateHelpers: t, }: GenerateUniqueInputParam) => {
    type: string;
    imports: ImportStatementParams[];
    generatedClasses: string[];
    apiExtraModels: string[];
    classValidators: IClassValidator[];
};
export declare const mergeImportStatements: (first: ImportStatementParams, second: ImportStatementParams) => ImportStatementParams;
export declare const zipImportStatementParams: (items: ImportStatementParams[]) => ImportStatementParams[];
export {};
