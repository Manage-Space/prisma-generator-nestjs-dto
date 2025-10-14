import type { TemplateHelpers } from './template-helpers';
import type { UpdateDtoParams } from './types';
interface GenerateUpdateDtoParam extends UpdateDtoParams {
    exportRelationModifierClasses: boolean;
    templateHelpers: TemplateHelpers;
}
export declare const generateUpdateDto: ({ model, fields, imports, extraClasses, apiExtraModels, exportRelationModifierClasses, templateHelpers: t, }: GenerateUpdateDtoParam) => string;
export {};
