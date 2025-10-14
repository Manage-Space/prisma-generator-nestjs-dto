import { DMMF } from '@prisma/generator-helper';
export interface Model extends DMMF.Model {
    output: {
        dto: string;
        entity: string;
    };
}
export interface ParsedField {
    kind: DMMF.FieldKind | 'relation-input';
    name: string;
    type: string;
    documentation?: string;
    isRequired: boolean;
    isList: boolean;
    isNullable?: boolean;
    hasDefaultValue?: boolean;
    default?: any;
    apiProperties?: IApiProperty[];
    apiHideProperty?: boolean;
    classValidators?: IClassValidator[];
    relationName?: string;
    relationFromFields?: string[];
    relationToFields?: string[];
    pureType?: boolean;
}
export interface ExtraModel {
    originalName: string;
    preAndPostfixedName: string;
    isLocal?: boolean;
}
export interface ImportStatementParams {
    from: string;
    default?: string | {
        '*': string;
    };
    destruct?: (string | Record<string, string>)[];
}
export interface DtoParams {
    model: DMMF.Model;
    fields: ParsedField[];
    imports: ImportStatementParams[];
}
export interface ConnectDtoParams extends DtoParams {
    extraClasses: string[];
    apiExtraModels: string[];
}
export interface CreateDtoParams extends DtoParams {
    extraClasses: string[];
    apiExtraModels: string[];
}
export interface UpdateDtoParams extends DtoParams {
    extraClasses: string[];
    apiExtraModels: string[];
}
export interface EntityParams extends DtoParams {
    apiExtraModels: string[];
}
export interface PlainDtoParams extends DtoParams {
    apiExtraModels: string[];
}
export interface ModelParams {
    connect: ConnectDtoParams;
    create: CreateDtoParams;
    update: UpdateDtoParams;
    entity: EntityParams;
    plain: PlainDtoParams;
}
export interface TypeParams {
    create: CreateDtoParams;
    update: UpdateDtoParams;
    plain: PlainDtoParams;
}
export type WriteableFileSpecs = {
    fileName: string;
    content: string;
};
export type NamingStyle = 'snake' | 'camel' | 'pascal' | 'kebab';
export interface IApiProperty {
    name: string;
    value: string;
    noEncapsulation?: boolean;
}
export interface IClassValidator {
    name: string;
    value?: string;
}
export interface IDecorators {
    apiProperties?: IApiProperty[];
    apiHideProperty?: boolean;
    classValidators?: IClassValidator[];
}
