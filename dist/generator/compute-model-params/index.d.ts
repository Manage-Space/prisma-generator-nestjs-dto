import { TemplateHelpers } from '../template-helpers';
import type { Model, ModelParams } from '../types';
interface ComputeModelParamsParam {
    model: Model;
    allModels: Model[];
    templateHelpers: TemplateHelpers;
}
export declare const computeModelParams: ({ model, allModels, templateHelpers, }: ComputeModelParamsParam) => ModelParams;
export {};
