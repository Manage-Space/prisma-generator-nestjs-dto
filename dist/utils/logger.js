"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.warn = exports.logger = void 0;
const chalk_1 = __importDefault(require("chalk"));
function logger(message, ...data) {
    console.info(`${chalk_1.default.cyan('prisma')} ${message}`, ...data);
}
exports.logger = logger;
function warn(message, ...data) {
    console.info(chalk_1.default.yellowBright(`prisma ${message}`), ...data);
}
exports.warn = warn;
