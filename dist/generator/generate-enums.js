"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEnums = void 0;
const case_1 = require("case");
const template_helpers_1 = require("./template-helpers");
const generateEnums = (enumModels) => `
${(0, template_helpers_1.each)(enumModels, (model) => `
export const ${(0, case_1.camel)(model.name)} = [${(0, template_helpers_1.each)(model.values, (v) => `'${v.name}'`, ', ')}] as const;
export type ${model.name} = (typeof ${(0, case_1.camel)(model.name)})[number];
`, '\n')}
`;
exports.generateEnums = generateEnums;
