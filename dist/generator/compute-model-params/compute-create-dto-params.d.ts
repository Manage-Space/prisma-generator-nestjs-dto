import type { TemplateHelpers } from '../template-helpers';
import type { Model, CreateDtoParams } from '../types';
interface ComputeCreateDtoParamsParam {
    model: Model;
    allModels: Model[];
    templateHelpers: TemplateHelpers;
}
export declare const computeCreateDtoParams: ({ model, allModels, templateHelpers, }: ComputeCreateDtoParamsParam) => CreateDtoParams;
export {};
