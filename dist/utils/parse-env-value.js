"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEnvValue = void 0;
function parseEnvValue(object) {
    if (object.fromEnvVar && object.fromEnvVar != 'null') {
        const value = process.env[object.fromEnvVar];
        if (!value) {
            throw new Error(`Attempted to load provider value using \`env(${object.fromEnvVar})\` but it was not present. Please ensure that it is present in your Environment Variables`);
        }
        return value;
    }
    return object.value;
}
exports.parseEnvValue = parseEnvValue;
