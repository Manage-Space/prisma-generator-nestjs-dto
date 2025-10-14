"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateConnectDto = void 0;
const generateConnectDto = ({ model, fields, imports, extraClasses, apiExtraModels, exportRelationModifierClasses, templateHelpers: t, }) => `
${t.importStatements(imports)}

${t.each(extraClasses, exportRelationModifierClasses ? (content) => `export ${content}` : t.echo, '\n')}

${t.if(apiExtraModels.length, t.apiExtraModels(apiExtraModels))}
export ${t.config.outputType} ${t.connectDtoName(model.name)} {
  ${t.fieldsToDtoProps(fields, 'plain', true, false)}
}
`;
exports.generateConnectDto = generateConnectDto;
