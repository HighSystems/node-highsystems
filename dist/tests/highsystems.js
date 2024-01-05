'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* Dependencies */
const dotenv = __importStar(require("dotenv"));
const ava_1 = __importDefault(require("ava"));
const client_1 = require("../client");
/* Tests */
dotenv.config();
const HS_INSTANCE = process.env.HS_INSTANCE;
const HS_USERTOKEN = process.env.HS_USERTOKEN;
if (!HS_INSTANCE || !HS_USERTOKEN) {
    throw new Error('Please check your .env file');
}
const hsOptions = {
    instance: HS_INSTANCE,
    userToken: HS_USERTOKEN,
    userAgent: 'Testing',
    connectionLimit: 10,
    connectionLimitPeriod: 1000,
    errorOnConnectionLimit: false,
    proxy: false
};
const hs = new client_1.HighSystems(hsOptions);
ava_1.default.serial('toJSON()', (t) => __awaiter(void 0, void 0, void 0, function* () {
    return t.truthy(JSON.stringify(hs.toJSON()) === JSON.stringify(hsOptions));
}));
ava_1.default.serial('fromJSON()', (t) => __awaiter(void 0, void 0, void 0, function* () {
    hs.fromJSON(hsOptions);
    return t.truthy(JSON.stringify(hs.toJSON()) === JSON.stringify(hsOptions));
}));
ava_1.default.serial('FromJSON()', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const nQb = client_1.HighSystems.fromJSON(hsOptions);
    return t.truthy(JSON.stringify(nQb.toJSON()) === JSON.stringify(hsOptions));
}));
ava_1.default.serial('getRecords', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield hs.getRecords({
        appid: 'grin4pcqqquude',
        tableid: 'lr511k2i3nlxyp',
        columns: 'id'
    });
    return t.truthy(results[0] !== undefined);
}));
//# sourceMappingURL=highsystems.js.map