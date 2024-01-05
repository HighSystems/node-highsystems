'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighSystems = void 0;
/* Dependencies */
const deepmerge_1 = __importDefault(require("deepmerge"));
const debug_1 = require("debug");
const generic_throttle_1 = require("generic-throttle");
const axios_1 = __importDefault(require("axios"));
/* Debug */
const debugMain = (0, debug_1.debug)('highsystems:main');
const debugRequest = (0, debug_1.debug)('highsystems:request');
const debugResponse = (0, debug_1.debug)('highsystems:response');
/* Globals */
const VERSION = require('../package.json').version;
const IS_BROWSER = typeof (window) !== 'undefined';
const objKeysToLowercase = (obj) => {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [
        key.toLocaleLowerCase(),
        value
    ]));
};
/* Main Class */
class HighSystems {
    constructor(options) {
        this.CLASS_NAME = 'HighSystems';
        /**
         * The internal numerical id for API calls.
         *
         * Increments by 1 with each request.
         */
        this._id = 0;
        this.settings = (0, deepmerge_1.default)(HighSystems.defaults, options || {});
        this.throttle = new generic_throttle_1.Throttle(this.settings.connectionLimit, this.settings.connectionLimitPeriod, this.settings.errorOnConnectionLimit);
        debugMain('New Instance', this.settings);
        return this;
    }
    assignAuthorizationHeaders(headers) {
        if (!headers) {
            headers = {};
        }
        if (this.settings.userToken) {
            headers.Authorization = `Bearer ${this.settings.userToken}`;
        }
        return headers;
    }
    getBaseRequest() {
        return {
            method: 'GET',
            baseURL: `https://${this.settings.instance}.highsystems.io`,
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                [IS_BROWSER ? 'X-User-Agent' : 'User-Agent']: `${this.settings.userAgent} node-highsystems/v${VERSION} ${IS_BROWSER ? (window.navigator ? window.navigator.userAgent : '') : 'nodejs/' + process.version}`.trim()
            },
            proxy: this.settings.proxy
        };
    }
    request(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = 0 + (++this._id);
            try {
                debugRequest(id, options);
                options.headers = this.assignAuthorizationHeaders(options.headers);
                const results = yield axios_1.default.request(options);
                results.headers = objKeysToLowercase(results.headers);
                debugResponse(id, results);
                return results;
            }
            catch (err) {
                if (err.response) {
                    const qbErr = new Error(err.response.data.message);
                    debugResponse(id, 'High Systems Error', qbErr);
                    throw qbErr;
                }
                debugResponse(id, 'Error', err);
                throw err;
            }
        });
    }
    api(actOptions, reqOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.throttle.acquire(() => __awaiter(this, void 0, void 0, function* () {
                return yield this.request(deepmerge_1.default.all([
                    this.getBaseRequest(),
                    actOptions,
                    reqOptions || {}
                ]));
            }));
        });
    }
    /**
     * Rebuild the HighSystems instance from serialized JSON
     *
     * @param json HighSystems class options
     */
    fromJSON(json) {
        if (typeof (json) === 'string') {
            json = JSON.parse(json);
        }
        if (typeof (json) !== 'object') {
            throw new TypeError('json argument must be type of object or a valid JSON string');
        }
        this.settings = (0, deepmerge_1.default)(this.settings, json);
        return this;
    }
    /**
     * Serialize the HighSystems instance into JSON
     */
    toJSON() {
        return (0, deepmerge_1.default)({}, this.settings);
    }
    /**
     * Create a new HighSystems instance from serialized JSON
     *
     * @param json HighSystems class options
     */
    static fromJSON(json) {
        if (typeof (json) === 'string') {
            json = JSON.parse(json);
        }
        if (typeof (json) !== 'object') {
            throw new TypeError('json argument must be type of object or a valid JSON string');
        }
        return new HighSystems(json);
    }
    /**
     * Test if a variable is a `highsystems` object
     *
     * @param obj A variable you'd like to test
     */
    static IsHighSystems(obj) {
        return (obj || {}).CLASS_NAME === HighSystems.CLASS_NAME;
    }
    getTransaction({ requestOptions, returnAxios = false } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/transactions`,
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    deleteTransaction({ id, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'delete',
                url: `/api/rest/v1/transactions/${id}`,
                params: { id }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    postTransaction({ id, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'post',
                url: `/api/rest/v1/transactions/${id}`,
                params: { id }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getRealmSettings({ requestOptions, returnAxios = false } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/settings`,
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    putRealmSettings(_a) {
        var { requestOptions, returnAxios = false } = _a, body = __rest(_a, ["requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'put',
                url: `/api/rest/v1/settings`,
                data: body,
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getUsers({ requestOptions, returnAxios = false } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/users`,
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    postUser(_a) {
        var { requestOptions, returnAxios = false } = _a, body = __rest(_a, ["requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'post',
                url: `/api/rest/v1/users`,
                data: body,
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    deleteUser({ userid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'delete',
                url: `/api/rest/v1/users/${userid}`,
                params: { userid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getUser({ userid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/users/${userid}`,
                params: { userid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    putUser(_a) {
        var { userid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["userid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'put',
                url: `/api/rest/v1/users/${userid}`,
                data: body,
                params: { userid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getUserTokens({ userid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/users/${userid}/tokens`,
                params: { userid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    postUserToken(_a) {
        var { userid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["userid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'post',
                url: `/api/rest/v1/users/${userid}/tokens`,
                data: body,
                params: { userid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    deleteUserToken({ userid, tokenid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'delete',
                url: `/api/rest/v1/users/${userid}/tokens/${tokenid}`,
                params: { userid, tokenid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getUserToken({ userid, tokenid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/users/${userid}/tokens/${tokenid}`,
                params: { userid, tokenid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    putUserToken(_a) {
        var { tokenid, userid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["tokenid", "userid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'put',
                url: `/api/rest/v1/users/${userid}/tokens/${tokenid}`,
                data: body,
                params: { tokenid, userid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getApplications({ requestOptions, returnAxios = false } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications`,
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    postApplication(_a) {
        var { requestOptions, returnAxios = false } = _a, body = __rest(_a, ["requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'post',
                url: `/api/rest/v1/applications`,
                data: body,
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    deleteApplication({ appid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'delete',
                url: `/api/rest/v1/applications/${appid}`,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getApplication({ appid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}`,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    putApplication(_a) {
        var { appid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'put',
                url: `/api/rest/v1/applications/${appid}`,
                data: body,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getApplicationMenus({ appid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/menus`,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    postApplicationMenu(_a) {
        var { appid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'post',
                url: `/api/rest/v1/applications/${appid}/menus`,
                data: body,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    deleteApplicationMenu({ appid, menuid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'delete',
                url: `/api/rest/v1/applications/${appid}/menus/${menuid}`,
                params: { appid, menuid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getApplicationMenu({ appid, menuid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/menus/${menuid}`,
                params: { appid, menuid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    putApplicationMenu(_a) {
        var { appid, menuid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "menuid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'put',
                url: `/api/rest/v1/applications/${appid}/menus/${menuid}`,
                data: body,
                params: { appid, menuid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getApplicationUserMenu({ appid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/menus/user`,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getVariables({ appid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/variables`,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getVariable({ appid, variableid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/variables/${variableid}`,
                params: { appid, variableid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    postVariable(_a) {
        var { relatedApplication, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["relatedApplication", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'post',
                url: `/api/rest/v1/applications/${relatedApplication}/variables`,
                data: body,
                params: { relatedApplication }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    deleteVariable({ relatedApplication, variableid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'delete',
                url: `/api/rest/v1/applications/${relatedApplication}/variables/${variableid}`,
                params: { relatedApplication, variableid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    putVariable(_a) {
        var { relatedApplication, variableid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["relatedApplication", "variableid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'put',
                url: `/api/rest/v1/applications/${relatedApplication}/variables/${variableid}`,
                data: body,
                params: { relatedApplication, variableid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getRoles({ appid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/roles`,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getRole({ appid, roleid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/roles/${roleid}`,
                params: { appid, roleid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    postRole(_a) {
        var { relatedApplication, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["relatedApplication", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'post',
                url: `/api/rest/v1/applications/${relatedApplication}/roles`,
                data: body,
                params: { relatedApplication }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    deleteRole({ relatedApplication, roleid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'delete',
                url: `/api/rest/v1/applications/${relatedApplication}/roles/${roleid}`,
                params: { relatedApplication, roleid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    putRole(_a) {
        var { relatedApplication, roleid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["relatedApplication", "roleid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'put',
                url: `/api/rest/v1/applications/${relatedApplication}/roles/${roleid}`,
                data: body,
                params: { relatedApplication, roleid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getRolePermissions({ appid, roleid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/roles/${roleid}/permissions`,
                params: { appid, roleid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getRoleDefaults({ appid, roleid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/roles/${roleid}/defaults`,
                params: { appid, roleid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getApplicationUsers({ appid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/users`,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getApplicationUser({ appid, userid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/users/${userid}`,
                params: { appid, userid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    postApplicationUser(_a) {
        var { relatedApplication, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["relatedApplication", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'post',
                url: `/api/rest/v1/applications/${relatedApplication}/users`,
                data: body,
                params: { relatedApplication }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    putApplicationUser(_a) {
        var { relatedApplication, applicationUserId, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["relatedApplication", "applicationUserId", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'put',
                url: `/api/rest/v1/applications/${relatedApplication}/users/${applicationUserId}`,
                data: body,
                params: { relatedApplication, applicationUserId }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    deleteApplicationUser({ relatedApplication, userid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'delete',
                url: `/api/rest/v1/applications/${relatedApplication}/users/${userid}`,
                params: { relatedApplication, userid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getTables({ appid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/tables`,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    deleteTable({ appid, tableid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'delete',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}`,
                params: { appid, tableid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getTable({ appid, tableid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}`,
                params: { appid, tableid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    putTable(_a) {
        var { appid, tableid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "tableid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'put',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}`,
                data: body,
                params: { appid, tableid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    postTable(_a) {
        var { relatedApplication, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["relatedApplication", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'post',
                url: `/api/rest/v1/applications/${relatedApplication}/tables`,
                data: body,
                params: { relatedApplication }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getApplicationRelationships({ appid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/relationships`,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getTableRelationships({ appid, tableid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/tables/relationships`,
                params: { appid, tableid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getApplicationFields({ appid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/fields`,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getFields({ appid, tableid, clist, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/fields`,
                params: { appid, tableid, clist }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    deleteField({ appid, tableid, fieldid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'delete',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/fields/${fieldid}`,
                params: { appid, tableid, fieldid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getField({ appid, tableid, fieldid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/fields/${fieldid}`,
                params: { appid, tableid, fieldid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    postField(_a) {
        var { appid, relatedTable, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "relatedTable", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'post',
                url: `/api/rest/v1/applications/${appid}/tables/${relatedTable}/fields`,
                data: body,
                params: { appid, relatedTable }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    putField(_a) {
        var { appid, relatedTable, fieldid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "relatedTable", "fieldid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'put',
                url: `/api/rest/v1/applications/${appid}/tables/${relatedTable}/fields/${fieldid}`,
                data: body,
                params: { appid, relatedTable, fieldid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getApplicationReports({ appid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/reports`,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getReports({ appid, tableid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/reports`,
                params: { appid, tableid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    deleteReport({ appid, tableid, reportid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'delete',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/reports/${reportid}`,
                params: { appid, tableid, reportid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getReport({ appid, tableid, reportid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/reports/${reportid}`,
                params: { appid, tableid, reportid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    postReport(_a) {
        var { appid, relatedTable, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "relatedTable", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'post',
                url: `/api/rest/v1/applications/${appid}/tables/${relatedTable}/reports`,
                data: body,
                params: { appid, relatedTable }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    putReport(_a) {
        var { appid, relatedTable, reportid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "relatedTable", "reportid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'put',
                url: `/api/rest/v1/applications/${appid}/tables/${relatedTable}/reports/${reportid}`,
                data: body,
                params: { appid, relatedTable, reportid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getApplicationForms({ appid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/forms`,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getForms({ appid, tableid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/forms`,
                params: { appid, tableid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    deleteForm({ appid, tableid, formid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'delete',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/forms/${formid}`,
                params: { appid, tableid, formid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getForm({ appid, tableid, formid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/forms/${formid}`,
                params: { appid, tableid, formid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    postForm(_a) {
        var { relatedTable, appid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["relatedTable", "appid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'post',
                url: `/api/rest/v1/applications/${appid}/tables/${relatedTable}/forms`,
                data: body,
                params: { relatedTable, appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    putForm(_a) {
        var { relatedTable, appid, formid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["relatedTable", "appid", "formid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'put',
                url: `/api/rest/v1/applications/${appid}/tables/${relatedTable}/forms/${formid}`,
                data: body,
                params: { relatedTable, appid, formid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getApplicationEntityRelationshipDiagram({ appid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/erd`,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    putApplicationEntityRelationshipDiagram(_a) {
        var { appid, diagramid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "diagramid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'put',
                url: `/api/rest/v1/applications/${appid}/erd/${diagramid}`,
                data: body,
                params: { appid, diagramid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getDashboards({ appid, relatedTable, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/dashboards`,
                params: { appid, relatedTable }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    postDashboard(_a) {
        var { appid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'post',
                url: `/api/rest/v1/applications/${appid}/dashboards`,
                data: body,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    deleteDashboard({ appid, tableid, dashboardid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'delete',
                url: `/api/rest/v1/applications/${appid}/dashboards/${dashboardid}`,
                params: { appid, tableid, dashboardid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getDashboard({ appid, relatedTable, dashboardid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/dashboards/${dashboardid}`,
                params: { appid, relatedTable, dashboardid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    putDashboard(_a) {
        var { appid, dashboardid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "dashboardid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'put',
                url: `/api/rest/v1/applications/${appid}/dashboards/${dashboardid}`,
                data: body,
                params: { appid, dashboardid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getPages({ appid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/pages`,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    postPage(_a) {
        var { appid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'post',
                url: `/api/rest/v1/applications/${appid}/pages`,
                data: body,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    deletePage({ appid, pageid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'delete',
                url: `/api/rest/v1/applications/${appid}/pages/${pageid}`,
                params: { appid, pageid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getPage({ appid, pageid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/pages/${pageid}`,
                params: { appid, pageid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    putPage(_a) {
        var { appid, pageid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "pageid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'put',
                url: `/api/rest/v1/applications/${appid}/pages/${pageid}`,
                data: body,
                params: { appid, pageid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getNotifications({ appid, tableid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/notifications`,
                params: { appid, tableid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    deleteNotification({ appid, tableid, notificationid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'delete',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/notifications/${notificationid}`,
                params: { appid, tableid, notificationid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getNotification({ appid, tableid, notificationid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/notifications/${notificationid}`,
                params: { appid, tableid, notificationid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    putNotification(_a) {
        var { appid, tableid, notificationid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "tableid", "notificationid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'put',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/notifications/${notificationid}`,
                data: body,
                params: { appid, tableid, notificationid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    postNotification(_a) {
        var { relatedTable, appid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["relatedTable", "appid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'post',
                url: `/api/rest/v1/applications/${appid}/tables/${relatedTable}/notifications`,
                data: body,
                params: { relatedTable, appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getWebhooks({ appid, tableid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/webhooks`,
                params: { appid, tableid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    deleteWebhook({ appid, tableid, webhookid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'delete',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/webhooks/${webhookid}`,
                params: { appid, tableid, webhookid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getWebhook({ appid, tableid, webhookid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/webhooks/${webhookid}`,
                params: { appid, tableid, webhookid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    putWebhook(_a) {
        var { appid, tableid, webhookid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "tableid", "webhookid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'put',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/webhooks/${webhookid}`,
                data: body,
                params: { appid, tableid, webhookid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    postWebhook(_a) {
        var { relatedTable, appid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["relatedTable", "appid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'post',
                url: `/api/rest/v1/applications/${appid}/tables/${relatedTable}/webhooks`,
                data: body,
                params: { relatedTable, appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getFunctions({ appid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/functions`,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    postFunction(_a) {
        var { appid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'post',
                url: `/api/rest/v1/applications/${appid}/functions`,
                data: body,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    deleteFunction({ appid, functionid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'delete',
                url: `/api/rest/v1/applications/${appid}/functions/${functionid}`,
                params: { appid, functionid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getFunction({ appid, functionid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/functions/${functionid}`,
                params: { appid, functionid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    putFunction(_a) {
        var { appid, functionid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "functionid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'put',
                url: `/api/rest/v1/applications/${appid}/functions/${functionid}`,
                data: body,
                params: { appid, functionid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getTriggers({ appid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/triggers`,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    postTrigger(_a) {
        var { appid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'post',
                url: `/api/rest/v1/applications/${appid}/triggers`,
                data: body,
                params: { appid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    deleteTrigger({ appid, triggerid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'delete',
                url: `/api/rest/v1/applications/${appid}/triggers/${triggerid}`,
                params: { appid, triggerid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getTrigger({ appid, triggerid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/triggers/${triggerid}`,
                params: { appid, triggerid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    putTrigger(_a) {
        var { appid, triggerid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "triggerid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'put',
                url: `/api/rest/v1/applications/${appid}/triggers/${triggerid}`,
                data: body,
                params: { appid, triggerid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getRecords({ type, query, columns, summarize, grouping, sorting, page, mergeQuery, appid, tableid, reportid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/records`,
                params: { type, query, columns, summarize, grouping, sorting, page, mergeQuery, appid, tableid, reportid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    postRecord(_a) {
        var { appid, tableid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "tableid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'post',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/records`,
                data: body,
                params: { appid, tableid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getRecordsCount({ appid, tableid, reportid, query, mergeQuery, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/records/count`,
                params: { appid, tableid, reportid, query, mergeQuery }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getRecordsTotals({ type, query, totals, columns, summarize, grouping, sorting, page, mergeQuery, appid, tableid, reportid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/records/totals`,
                params: { type, query, totals, columns, summarize, grouping, sorting, page, mergeQuery, appid, tableid, reportid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    deleteRecord({ appid, tableid, recordid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'delete',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/records/${recordid}`,
                params: { appid, tableid, recordid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getRecord({ appid, tableid, recordid, clist, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/records/${recordid}`,
                params: { appid, tableid, recordid, clist }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    putRecord(_a) {
        var { appid, tableid, id, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "tableid", "id", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'put',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/records/${id}`,
                data: body,
                params: { appid, tableid, id }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    upsertRecords(_a) {
        var { appid, tableid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "tableid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'post',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/records/upsert`,
                data: body,
                params: { appid, tableid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    calculateRecordFormulas(_a) {
        var { appid, tableid, requestOptions, returnAxios = false } = _a, body = __rest(_a, ["appid", "tableid", "requestOptions", "returnAxios"]);
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'post',
                url: `/api/rest/v1/applications/${appid}/tables/${tableid}/calculate-formulas`,
                data: body,
                params: { appid, tableid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getFile({ appid, tableid, recordid, fieldid, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/files/${appid}/${tableid}/${recordid}/${fieldid}`,
                params: { appid, tableid, recordid, fieldid }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    getPresignedFileUrl({ appid, tableid, recordid, fieldid, pageid, logo, action, contentType, responseDisposition, responseType, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/files/presigned`,
                params: { appid, tableid, recordid, fieldid, pageid, logo, action, contentType, responseDisposition, responseType }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
    finalizeFileUpload({ appid, tableid, recordid, fieldid, tmpLocation, size, filename, requestOptions, returnAxios = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.api({
                method: 'get',
                url: `/api/rest/v1/files/finalize`,
                params: { appid, tableid, recordid, fieldid, tmpLocation, size, filename }
            }, requestOptions);
            if (returnAxios) {
                return results;
            }
            return typeof (results.data) === 'object' ? results.data.results : results.data;
        });
    }
}
exports.HighSystems = HighSystems;
HighSystems.CLASS_NAME = 'HighSystems';
HighSystems.VERSION = VERSION;
/**
 * The default settings of a `HighSystems` instance
 */
HighSystems.defaults = {
    instance: IS_BROWSER ? window.location.host.split('.')[0] : '',
    userToken: '',
    userAgent: '',
    connectionLimit: 10,
    connectionLimitPeriod: 1000,
    errorOnConnectionLimit: false,
    proxy: false
};
/* Export to Browser */
if (IS_BROWSER) {
    window.HighSystems = exports;
}
//# sourceMappingURL=client.js.map