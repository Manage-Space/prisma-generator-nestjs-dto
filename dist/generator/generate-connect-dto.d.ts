import type { TemplateHelpers } from './template-helpers';
import type { ConnectDtoParams } from './types';
interface GenerateConnectDtoParam extends ConnectDtoParams {
    exportRelationModifierClasses: boolean;
    templateHelpers: TemplateHelpers;
}
export declare const generateConnectDto: ({ model, fields, imports, extraClasses, apiExtraModels, exportRelationModifierClasses, templateHelpers: t, }: GenerateConnectDtoParam) => string;
export {};
