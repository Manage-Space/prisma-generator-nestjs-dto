import type { TemplateHelpers } from './template-helpers';
import type { CreateDtoParams } from './types';
interface GenerateCreateDtoParam extends CreateDtoParams {
    exportRelationModifierClasses: boolean;
    templateHelpers: TemplateHelpers;
}
export declare const generateCreateDto: ({ model, fields, imports, extraClasses, apiExtraModels, exportRelationModifierClasses, templateHelpers: t, }: GenerateCreateDtoParam) => string;
export {};
