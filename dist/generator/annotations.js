"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DTO_UPDATE_VALIDATE_IF = exports.DTO_CREATE_VALIDATE_IF = exports.DTO_OVERRIDE_API_PROPERTY_TYPE = exports.DTO_OVERRIDE_TYPE = exports.DTO_CAST_TYPE = exports.DTO_TYPE_FULL_UPDATE = exports.DTO_RELATION_MODIFIERS_ON_UPDATE = exports.DTO_RELATION_MODIFIERS_ON_CREATE = exports.DTO_RELATION_MODIFIERS = exports.DTO_RELATION_CAN_DISCONNECT_ON_UPDATE = exports.DTO_RELATION_CAN_CONNECT_ON_UPDATE = exports.DTO_RELATION_CAN_CREATE_ON_UPDATE = exports.DTO_RELATION_CAN_CONNECT_ON_CREATE = exports.DTO_RELATION_CAN_CREATE_ON_CREATE = exports.DTO_RELATION_INCLUDE_ID = exports.DTO_RELATION_REQUIRED = exports.DTO_UPDATE_REQUIRED = exports.DTO_UPDATE_OPTIONAL = exports.DTO_CREATE_REQUIRED = exports.DTO_CREATE_OPTIONAL = exports.DTO_API_HIDDEN = exports.DTO_CONNECT_HIDDEN = exports.DTO_ENTITY_HIDDEN = exports.DTO_UPDATE_HIDDEN = exports.DTO_CREATE_HIDDEN = exports.DTO_READ_ONLY = exports.DTO_IGNORE_MODEL = void 0;
exports.DTO_IGNORE_MODEL = /@DtoIgnoreModel/;
exports.DTO_READ_ONLY = /@DtoReadOnly/;
exports.DTO_CREATE_HIDDEN = /@DtoCreateHidden/;
exports.DTO_UPDATE_HIDDEN = /@DtoUpdateHidden/;
exports.DTO_ENTITY_HIDDEN = /@DtoEntityHidden/;
exports.DTO_CONNECT_HIDDEN = /@DtoConnectHidden/;
exports.DTO_API_HIDDEN = /@DtoApiHidden/;
exports.DTO_CREATE_OPTIONAL = /@DtoCreateOptional/;
exports.DTO_CREATE_REQUIRED = /@DtoCreateRequired/;
exports.DTO_UPDATE_OPTIONAL = /@DtoUpdateOptional/;
exports.DTO_UPDATE_REQUIRED = /@DtoUpdateRequired/;
exports.DTO_RELATION_REQUIRED = /@DtoRelationRequired/;
exports.DTO_RELATION_INCLUDE_ID = /@DtoRelationIncludeId/;
exports.DTO_RELATION_CAN_CREATE_ON_CREATE = /@DtoRelationCanCreateOnCreate/;
exports.DTO_RELATION_CAN_CONNECT_ON_CREATE = /@DtoRelationCanConnectOnCreate/;
exports.DTO_RELATION_CAN_CREATE_ON_UPDATE = /@DtoRelationCanCreateOnUpdate/;
exports.DTO_RELATION_CAN_CONNECT_ON_UPDATE = /@DtoRelationCanConnectOnUpdate/;
exports.DTO_RELATION_CAN_DISCONNECT_ON_UPDATE = /@DtoRelationCanDisconnectOnUpdate/;
exports.DTO_RELATION_MODIFIERS = [
    exports.DTO_RELATION_CAN_CREATE_ON_CREATE,
    exports.DTO_RELATION_CAN_CONNECT_ON_CREATE,
    exports.DTO_RELATION_CAN_CREATE_ON_UPDATE,
    exports.DTO_RELATION_CAN_CONNECT_ON_UPDATE,
];
exports.DTO_RELATION_MODIFIERS_ON_CREATE = [
    exports.DTO_RELATION_CAN_CREATE_ON_CREATE,
    exports.DTO_RELATION_CAN_CONNECT_ON_CREATE,
];
exports.DTO_RELATION_MODIFIERS_ON_UPDATE = [
    exports.DTO_RELATION_CAN_CREATE_ON_UPDATE,
    exports.DTO_RELATION_CAN_CONNECT_ON_UPDATE,
    exports.DTO_RELATION_CAN_DISCONNECT_ON_UPDATE,
];
exports.DTO_TYPE_FULL_UPDATE = /@DtoTypeFullUpdate/;
exports.DTO_CAST_TYPE = /@DtoCastType/;
exports.DTO_OVERRIDE_TYPE = /@DtoOverrideType/;
exports.DTO_OVERRIDE_API_PROPERTY_TYPE = /@DtoOverrideApiPropertyType/;
exports.DTO_CREATE_VALIDATE_IF = /@DtoCreateValidateIf/;
exports.DTO_UPDATE_VALIDATE_IF = /@DtoUpdateValidateIf/;
