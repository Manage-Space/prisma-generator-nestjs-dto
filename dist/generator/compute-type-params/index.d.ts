import { TemplateHelpers } from '../template-helpers';
import { Model, TypeParams } from '../types';
interface ComputeModelParamsParam {
    model: Model;
    allModels: Model[];
    templateHelpers: TemplateHelpers;
}
export declare const computeTypeParams: ({ model, allModels, templateHelpers, }: ComputeModelParamsParam) => TypeParams;
export {};
