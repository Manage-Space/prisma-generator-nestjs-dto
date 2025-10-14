import { DMMF } from '@prisma/generator-helper';
import { IClassValidator, ImportStatementParams, ParsedField } from './types';
export declare function parseClassValidators(field: DMMF.Field, dtoName?: string | ((name: string) => string)): IClassValidator[];
export declare function decorateClassValidators(field: ParsedField): string;
export declare function makeImportsFromClassValidator(classValidators: IClassValidator[]): ImportStatementParams[];
