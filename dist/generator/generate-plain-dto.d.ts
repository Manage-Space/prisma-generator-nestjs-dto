import type { TemplateHelpers } from './template-helpers';
import type { EntityParams } from './types';
interface GenerateEntityParam extends EntityParams {
    templateHelpers: TemplateHelpers;
}
export declare const generatePlainDto: ({ model, fields, imports, apiExtraModels, templateHelpers: t, }: GenerateEntityParam) => string;
export {};
