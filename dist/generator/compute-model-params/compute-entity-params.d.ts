import type { Model, EntityParams } from '../types';
import type { TemplateHelpers } from '../template-helpers';
interface ComputeEntityParamsParam {
    model: Model;
    allModels: Model[];
    templateHelpers: TemplateHelpers;
}
export declare const computeEntityParams: ({ model, allModels, templateHelpers, }: ComputeEntityParamsParam) => EntityParams;
export {};
