import type { TemplateHelpers } from '../template-helpers';
import type { Model, UpdateDtoParams } from '../types';
interface ComputeUpdateDtoParamsParam {
    model: Model;
    allModels: Model[];
    templateHelpers: TemplateHelpers;
}
export declare const computeUpdateDtoParams: ({ model, allModels, templateHelpers, }: ComputeUpdateDtoParamsParam) => UpdateDtoParams;
export {};
