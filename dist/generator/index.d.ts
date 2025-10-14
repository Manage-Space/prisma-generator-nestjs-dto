import { DMMF } from '@prisma/generator-helper';
import { NamingStyle, WriteableFileSpecs } from './types';
interface RunParam {
    output: string;
    dmmf: DMMF.Document;
    exportRelationModifierClasses: boolean;
    outputToNestJsResourceStructure: boolean;
    flatResourceStructure: boolean;
    connectDtoPrefix: string;
    createDtoPrefix: string;
    updateDtoPrefix: string;
    dtoSuffix: string;
    entityPrefix: string;
    entitySuffix: string;
    fileNamingStyle: NamingStyle;
    classValidation: boolean;
    outputType: string;
    noDependencies: boolean;
    definiteAssignmentAssertion: boolean;
    requiredResponseApiProperty: boolean;
    prismaClientImportPath: string;
    outputApiPropertyType: boolean;
    generateFileTypes: string;
    wrapRelationsAsType: boolean;
    showDefaultValues: boolean;
}
export declare const run: ({ output, dmmf, ...options }: RunParam) => WriteableFileSpecs[];
export {};
