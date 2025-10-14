"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCreateDto = void 0;
const generateCreateDto = ({ model, fields, imports, extraClasses, apiExtraModels, exportRelationModifierClasses, templateHelpers: t, }) => `
${t.importStatements(imports)}

${t.each(extraClasses, exportRelationModifierClasses ? (content) => `export ${content}` : t.echo, '\n')}

${t.if(apiExtraModels.length, t.apiExtraModels(apiExtraModels))}
export ${t.config.outputType} ${t.createDtoName(model.name)} {
  ${t.fieldsToDtoProps(fields, 'create', true)}
}
`;
exports.generateCreateDto = generateCreateDto;
