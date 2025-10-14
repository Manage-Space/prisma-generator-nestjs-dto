import type { ConnectDtoParams, Model } from '../types';
import { TemplateHelpers } from '../template-helpers';
interface ComputeConnectDtoParamsParam {
    model: Model;
    templateHelpers: TemplateHelpers;
}
export declare const computeConnectDtoParams: ({ model, templateHelpers, }: ComputeConnectDtoParamsParam) => ConnectDtoParams;
export {};
