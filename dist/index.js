"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const make_dir_1 = __importDefault(require("make-dir"));
const slash_1 = __importDefault(require("slash"));
const generator_helper_1 = require("@prisma/generator-helper");
const prettier_1 = __importDefault(require("prettier"));
const utils_1 = require("./utils");
const generator_1 = require("./generator");
const field_classifiers_1 = require("./generator/field-classifiers");
const annotations_1 = require("./generator/annotations");
const stringToBoolean = (input, defaultValue = false) => {
    if (input === 'true') {
        return true;
    }
    if (input === 'false') {
        return false;
    }
    return defaultValue;
};
const generate = async (options) => {
    var _a;
    const output = (0, utils_1.parseEnvValue)(options.generator.output);
    if (!output) {
        throw new Error('Failed to parse output path');
    }
    const { connectDtoPrefix = 'Connect', createDtoPrefix = 'Create', updateDtoPrefix = 'Update', dtoSuffix = 'Dto', entityPrefix = '', entitySuffix = '', fileNamingStyle = 'camel', outputType = 'class', generateFileTypes = 'all', } = options.generator.config;
    const exportRelationModifierClasses = stringToBoolean(options.generator.config.exportRelationModifierClasses, true);
    const outputToNestJsResourceStructure = stringToBoolean(options.generator.config.outputToNestJsResourceStructure, false);
    const flatResourceStructure = stringToBoolean(options.generator.config.flatResourceStructure, false);
    const reExport = stringToBoolean(options.generator.config.reExport, false);
    const supportedFileNamingStyles = ['kebab', 'camel', 'pascal', 'snake'];
    const isSupportedFileNamingStyle = (style) => supportedFileNamingStyles.includes(style);
    if (!isSupportedFileNamingStyle(fileNamingStyle)) {
        throw new Error(`'${fileNamingStyle}' is not a valid file naming style. Valid options are ${supportedFileNamingStyles
            .map((s) => `'${s}'`)
            .join(', ')}.`);
    }
    const classValidation = stringToBoolean(options.generator.config.classValidation, false);
    const supportedOutputTypes = ['class', 'interface'];
    if (!supportedOutputTypes.includes(outputType)) {
        throw new Error(`'${outputType}' is not a valid output type. Valid options are 'class' and 'interface'.`);
    }
    const noDependencies = stringToBoolean(options.generator.config.noDependencies, false);
    if (classValidation && outputType !== 'class') {
        throw new Error(`To use 'classValidation' decorators, 'outputType' must be 'class'.`);
    }
    if (classValidation && noDependencies) {
        throw new Error(`To use 'classValidation' decorators, 'noDependencies' cannot be false.`);
    }
    const definiteAssignmentAssertion = stringToBoolean(options.generator.config.definiteAssignmentAssertion, false);
    if (definiteAssignmentAssertion && outputType !== 'class') {
        throw new Error(`To use 'definiteAssignmentAssertion', 'outputType' must be 'class'.`);
    }
    const requiredResponseApiProperty = stringToBoolean(options.generator.config.requiredResponseApiProperty, true);
    const prismaClientGenerator = options.otherGenerators.find((config) => config.name === 'client');
    const prismaClientOutputPath = (_a = prismaClientGenerator === null || prismaClientGenerator === void 0 ? void 0 : prismaClientGenerator.output) === null || _a === void 0 ? void 0 : _a.value;
    let prismaClientImportPath = '@prisma/client';
    if (prismaClientOutputPath &&
        !prismaClientOutputPath.endsWith(['node_modules', '@prisma', 'client'].join(node_path_1.default.sep))) {
        const withStructure = outputToNestJsResourceStructure
            ? flatResourceStructure
                ? '../'
                : '../../'
            : '';
        prismaClientImportPath = (0, slash_1.default)(withStructure + node_path_1.default.relative(output, prismaClientOutputPath));
        if (!prismaClientImportPath.startsWith('.')) {
            prismaClientImportPath = './' + prismaClientImportPath;
        }
    }
    const outputApiPropertyType = stringToBoolean(options.generator.config.outputApiPropertyType, true);
    if (!outputApiPropertyType) {
        (0, utils_1.warn)('`outputApiPropertyType = "false"` is deprecated. Please use `wrapRelationsAsType = "true"` instead and report any issues.');
    }
    const wrapRelationsAsType = stringToBoolean(options.generator.config.wrapRelationsAsType, false);
    const showDefaultValues = stringToBoolean(options.generator.config.showDefaultValues, false);
    const results = (0, generator_1.run)({
        output,
        dmmf: options.dmmf,
        exportRelationModifierClasses,
        outputToNestJsResourceStructure,
        flatResourceStructure,
        connectDtoPrefix,
        createDtoPrefix,
        updateDtoPrefix,
        dtoSuffix,
        entityPrefix,
        entitySuffix,
        fileNamingStyle,
        classValidation,
        outputType,
        noDependencies,
        definiteAssignmentAssertion,
        requiredResponseApiProperty,
        prismaClientImportPath,
        outputApiPropertyType,
        generateFileTypes,
        wrapRelationsAsType,
        showDefaultValues,
    });
    const deprecatedCastTypeAnnotation = [
        ...options.dmmf.datamodel.models,
        ...options.dmmf.datamodel.types,
    ].some((model) => model.fields.some((field) => (0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_CAST_TYPE)));
    if (deprecatedCastTypeAnnotation) {
        (0, utils_1.warn)('@DtoCastType annotation is deprecated. Please use DtoOverrideType instead.');
    }
    const indexCollections = {};
    if (reExport) {
        results.forEach(({ fileName }) => {
            const dirName = node_path_1.default.dirname(fileName);
            const { [dirName]: fileSpec } = indexCollections;
            indexCollections[dirName] = {
                fileName: (fileSpec === null || fileSpec === void 0 ? void 0 : fileSpec.fileName) || node_path_1.default.join(dirName, 'index.ts'),
                content: [
                    (fileSpec === null || fileSpec === void 0 ? void 0 : fileSpec.content) || '',
                    `export * from './${node_path_1.default.basename(fileName, '.ts')}';`,
                ].join('\n'),
            };
        });
        if (outputToNestJsResourceStructure) {
            const content = [];
            Object.entries(indexCollections)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .forEach(([dirName, file]) => {
                if (output === dirName) {
                    content.push(file.content);
                }
                else {
                    const base = dirName
                        .split(/[\\\/]/)
                        .slice(flatResourceStructure ? -1 : -2);
                    content.push(`export * from './${base[0]}${base[1] ? '/' + base[1] : ''}';`);
                }
            });
            indexCollections[output] = {
                fileName: node_path_1.default.join(output, 'index.ts'),
                content: content.join('\n'),
            };
        }
    }
    const applyPrettier = stringToBoolean(options.generator.config.prettier, false);
    let prettierConfig = {};
    if (applyPrettier) {
        const prettierConfigFile = await prettier_1.default.resolveConfigFile();
        if (!prettierConfigFile) {
            (0, utils_1.logger)('Stylizing output DTOs with the default Prettier config.');
        }
        else {
            (0, utils_1.logger)(`Stylizing output DTOs with found Prettier config. (${prettierConfigFile})`);
        }
        if (prettierConfigFile) {
            const resolvedConfig = await prettier_1.default.resolveConfig(prettierConfigFile, {
                config: prettierConfigFile,
            });
            if (resolvedConfig)
                prettierConfig = resolvedConfig;
        }
        prettierConfig.parser = 'typescript';
    }
    return Promise.all(results
        .concat(Object.values(indexCollections))
        .map(async ({ fileName, content }) => {
        await (0, make_dir_1.default)(node_path_1.default.dirname(fileName));
        if (applyPrettier) {
            content = await prettier_1.default.format(content, prettierConfig);
        }
        return promises_1.default.writeFile(fileName, content);
    }));
};
exports.generate = generate;
(0, generator_helper_1.generatorHandler)({
    onManifest: () => ({
        defaultOutput: '../src/generated/nestjs-dto',
        prettyName: 'NestJS DTO Generator',
    }),
    onGenerate: exports.generate,
});
