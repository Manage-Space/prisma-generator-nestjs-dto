import type { TemplateHelpers } from '../template-helpers';
import type { Model, PlainDtoParams } from '../types';
interface ComputePlainDtoParamsParam {
    model: Model;
    allModels: Model[];
    templateHelpers: TemplateHelpers;
}
export declare const computePlainDtoParams: ({ model, allModels, templateHelpers, }: ComputePlainDtoParamsParam) => PlainDtoParams;
export {};
