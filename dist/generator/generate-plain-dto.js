"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePlainDto = void 0;
const generatePlainDto = ({ model, fields, imports, apiExtraModels, templateHelpers: t, }) => `
${t.importStatements(imports)}

${t.if(apiExtraModels.length, t.apiExtraModels(apiExtraModels))}
export ${t.config.outputType} ${t.plainDtoName(model.name)} {
  ${t.fieldsToEntityProps(fields)}
}
`;
exports.generatePlainDto = generatePlainDto;
