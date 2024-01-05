
'use strict';

/* Dependencies */
import merge from 'deepmerge';
import { debug } from 'debug';
import { Throttle } from 'generic-throttle';
import axios, {
	AxiosRequestConfig,
	AxiosRequestHeaders,
	AxiosResponse
} from 'axios';

/* Debug */
const debugMain = debug('highsystems:main');
const debugRequest = debug('highsystems:request');
const debugResponse = debug('highsystems:response');

/* Globals */
const VERSION = require('../package.json').version;
const IS_BROWSER = typeof(window) !== 'undefined';

/* Helpers */
type LowerKeysObject<T extends object> = {
	[K in keyof T as (K extends string ? Lowercase<K> : K)]: T[K]
};

const objKeysToLowercase = <T extends object>(obj: T): LowerKeysObject<T> => {
	return Object.fromEntries(Object.entries(obj).map(([key, value]) => [
		key.toLocaleLowerCase(),
		value
	])) as LowerKeysObject<T>;
};

/* Main Class */
export class HighSystems {

	public readonly CLASS_NAME: string = 'HighSystems';
	static readonly CLASS_NAME: string = 'HighSystems';

	static readonly VERSION: string = VERSION;

	/**
	 * The default settings of a `HighSystems` instance
	 */
	static defaults: Required<HighSystemsOptions> = {
		instance: IS_BROWSER ? window.location.host.split('.')[0] : '',
		userToken: '',
		userAgent: '',
		connectionLimit: 10,
		connectionLimitPeriod: 1000,
		errorOnConnectionLimit: false,
		proxy: false
	};

	/**
	 * The internal numerical id for API calls.
	 *
	 * Increments by 1 with each request.
	 */
	private _id: number = 0;

	/**
	 * The internal throttler for rate-limiting API calls
	 */
	private throttle: Throttle;

	/**
	 * The `HighSystems` instance settings
	 */
	public settings: Required<HighSystemsOptions>;

	constructor(options?: HighSystemsOptions){
		this.settings = merge(HighSystems.defaults, options || {});

		this.throttle = new Throttle(this.settings.connectionLimit, this.settings.connectionLimitPeriod, this.settings.errorOnConnectionLimit);

		debugMain('New Instance', this.settings);

		return this;
	}

	private assignAuthorizationHeaders(headers?: Partial<AxiosRequestHeaders>){
		if(!headers){
			headers = {};
		}

		if(this.settings.userToken){
			headers.Authorization = `Bearer ${this.settings.userToken}`;
		}

		return headers as AxiosRequestHeaders;
	}

	private getBaseRequest(){
		return {
			method: 'GET',
			baseURL: `https://${this.settings.instance}.highsystems.io`,
			headers: {
				'Content-Type': 'application/json',
				[IS_BROWSER ? 'X-User-Agent' : 'User-Agent']: `${this.settings.userAgent} node-highsystems/v${VERSION} ${IS_BROWSER ? (window.navigator ? window.navigator.userAgent : '') : 'nodejs/' + process.version}`.trim()
			},
			proxy: this.settings.proxy
		};
	}

	private async request<T = any>(options: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		const id = 0 + (++this._id);

		try {
			debugRequest(id, options);

			options.headers = this.assignAuthorizationHeaders(options.headers as AxiosRequestHeaders);

			const results = await axios.request<T>(options);

			results.headers = objKeysToLowercase<Record<string, string>>(results.headers);

			debugResponse(id, results);

			return results;
		}catch(err: any){
			if(err.response){
				const qbErr = new Error(err.response.data.message);

				debugResponse(id, 'High Systems Error', qbErr);

				throw qbErr;
			}

			debugResponse(id, 'Error', err);

			throw err;
		}
	}

	private async api<T = any>(actOptions: AxiosRequestConfig, reqOptions?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.throttle.acquire(async () => {
			return await this.request<T>(merge.all([
				this.getBaseRequest(),
				actOptions,
				reqOptions || {}
			]));
		});
	}

	/**
	 * Rebuild the HighSystems instance from serialized JSON
	 *
	 * @param json HighSystems class options
	 */
	fromJSON(json: string | HighSystemsOptions): HighSystems {
		if(typeof(json) === 'string'){
			json = JSON.parse(json);
		}

		if(typeof(json) !== 'object'){
			throw new TypeError('json argument must be type of object or a valid JSON string');
		}

		this.settings = merge(this.settings, json);

		return this;
	}

	/**
	 * Serialize the HighSystems instance into JSON
	 */
	toJSON(): Required<HighSystemsOptions> {
		return merge({}, this.settings);
	}

	/**
	 * Create a new HighSystems instance from serialized JSON
	 *
	 * @param json HighSystems class options
	 */
	static fromJSON(json: string | HighSystemsOptions): HighSystems {
		if(typeof(json) === 'string'){
			json = JSON.parse(json);
		}

		if(typeof(json) !== 'object'){
			throw new TypeError('json argument must be type of object or a valid JSON string');
		}

		return new HighSystems(json);
	}

	/**
	 * Test if a variable is a `highsystems` object
	 *
	 * @param obj A variable you'd like to test
	 */
	static IsHighSystems(obj: any): obj is HighSystems {
		return ((obj || {}) as HighSystems).CLASS_NAME === HighSystems.CLASS_NAME;
	}

	/**
	 * getTransaction
	 *
	 * 
	 *
	 * @param options getTransaction method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getTransaction({ requestOptions, returnAxios = false }: HighSystemsRequestGetTransaction & { returnAxios?: false }): Promise<HighSystemsResponseGetTransaction['results']>;
	public async getTransaction({ requestOptions, returnAxios = true }: HighSystemsRequestGetTransaction & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetTransaction>>;
	public async getTransaction({ requestOptions, returnAxios = false }: HighSystemsRequestGetTransaction = {}): Promise<HighSystemsResponseGetTransaction['results'] | AxiosResponse<HighSystemsResponseGetTransaction>> {
		const results = await this.api<HighSystemsResponseGetTransaction>({
			method: 'get',
			url: `/api/rest/v1/transactions`,
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * deleteTransaction
	 *
	 * 
	 *
	 * @param options deleteTransaction method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteTransaction({ id, requestOptions, returnAxios = false }: HighSystemsRequestDeleteTransaction & { returnAxios?: false }): Promise<HighSystemsResponseDeleteTransaction['results']>;
	public async deleteTransaction({ id, requestOptions, returnAxios = true }: HighSystemsRequestDeleteTransaction & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteTransaction>>;
	public async deleteTransaction({ id, requestOptions, returnAxios = false }: HighSystemsRequestDeleteTransaction): Promise<HighSystemsResponseDeleteTransaction['results'] | AxiosResponse<HighSystemsResponseDeleteTransaction>> {
		const results = await this.api<HighSystemsResponseDeleteTransaction>({
			method: 'delete',
			url: `/api/rest/v1/transactions/${id}`,
			params: { id }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * postTransaction
	 *
	 * 
	 *
	 * @param options postTransaction method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postTransaction({ id, requestOptions, returnAxios = false }: HighSystemsRequestPostTransaction & { returnAxios?: false }): Promise<HighSystemsResponsePostTransaction['results']>;
	public async postTransaction({ id, requestOptions, returnAxios = true }: HighSystemsRequestPostTransaction & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostTransaction>>;
	public async postTransaction({ id, requestOptions, returnAxios = false }: HighSystemsRequestPostTransaction): Promise<HighSystemsResponsePostTransaction['results'] | AxiosResponse<HighSystemsResponsePostTransaction>> {
		const results = await this.api<HighSystemsResponsePostTransaction>({
			method: 'post',
			url: `/api/rest/v1/transactions/${id}`,
			params: { id }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getRealmSettings
	 *
	 * 
	 *
	 * @param options getRealmSettings method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getRealmSettings({ requestOptions, returnAxios = false }: HighSystemsRequestGetRealmSettings & { returnAxios?: false }): Promise<HighSystemsResponseGetRealmSettings['results']>;
	public async getRealmSettings({ requestOptions, returnAxios = true }: HighSystemsRequestGetRealmSettings & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetRealmSettings>>;
	public async getRealmSettings({ requestOptions, returnAxios = false }: HighSystemsRequestGetRealmSettings = {}): Promise<HighSystemsResponseGetRealmSettings['results'] | AxiosResponse<HighSystemsResponseGetRealmSettings>> {
		const results = await this.api<HighSystemsResponseGetRealmSettings>({
			method: 'get',
			url: `/api/rest/v1/settings`,
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putRealmSettings
	 *
	 * 
	 *
	 * @param options putRealmSettings method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putRealmSettings({ requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutRealmSettings & { returnAxios?: false }): Promise<HighSystemsResponsePutRealmSettings['results']>;
	public async putRealmSettings({ requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutRealmSettings & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutRealmSettings>>;
	public async putRealmSettings({ requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutRealmSettings): Promise<HighSystemsResponsePutRealmSettings['results'] | AxiosResponse<HighSystemsResponsePutRealmSettings>> {
		const results = await this.api<HighSystemsResponsePutRealmSettings>({
			method: 'put',
			url: `/api/rest/v1/settings`,
			data: body,
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getUsers
	 *
	 * 
	 *
	 * @param options getUsers method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getUsers({ requestOptions, returnAxios = false }: HighSystemsRequestGetUsers & { returnAxios?: false }): Promise<HighSystemsResponseGetUsers['results']>;
	public async getUsers({ requestOptions, returnAxios = true }: HighSystemsRequestGetUsers & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetUsers>>;
	public async getUsers({ requestOptions, returnAxios = false }: HighSystemsRequestGetUsers = {}): Promise<HighSystemsResponseGetUsers['results'] | AxiosResponse<HighSystemsResponseGetUsers>> {
		const results = await this.api<HighSystemsResponseGetUsers>({
			method: 'get',
			url: `/api/rest/v1/users`,
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * postUser
	 *
	 * 
	 *
	 * @param options postUser method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postUser({ requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostUser & { returnAxios?: false }): Promise<HighSystemsResponsePostUser['results']>;
	public async postUser({ requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostUser & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostUser>>;
	public async postUser({ requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostUser): Promise<HighSystemsResponsePostUser['results'] | AxiosResponse<HighSystemsResponsePostUser>> {
		const results = await this.api<HighSystemsResponsePostUser>({
			method: 'post',
			url: `/api/rest/v1/users`,
			data: body,
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * deleteUser
	 *
	 * 
	 *
	 * @param options deleteUser method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteUser({ userid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteUser & { returnAxios?: false }): Promise<HighSystemsResponseDeleteUser['results']>;
	public async deleteUser({ userid, requestOptions, returnAxios = true }: HighSystemsRequestDeleteUser & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteUser>>;
	public async deleteUser({ userid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteUser): Promise<HighSystemsResponseDeleteUser['results'] | AxiosResponse<HighSystemsResponseDeleteUser>> {
		const results = await this.api<HighSystemsResponseDeleteUser>({
			method: 'delete',
			url: `/api/rest/v1/users/${userid}`,
			params: { userid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getUser
	 *
	 * 
	 *
	 * @param options getUser method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getUser({ userid, requestOptions, returnAxios = false }: HighSystemsRequestGetUser & { returnAxios?: false }): Promise<HighSystemsResponseGetUser['results']>;
	public async getUser({ userid, requestOptions, returnAxios = true }: HighSystemsRequestGetUser & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetUser>>;
	public async getUser({ userid, requestOptions, returnAxios = false }: HighSystemsRequestGetUser): Promise<HighSystemsResponseGetUser['results'] | AxiosResponse<HighSystemsResponseGetUser>> {
		const results = await this.api<HighSystemsResponseGetUser>({
			method: 'get',
			url: `/api/rest/v1/users/${userid}`,
			params: { userid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putUser
	 *
	 * 
	 *
	 * @param options putUser method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putUser({ userid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutUser & { returnAxios?: false }): Promise<HighSystemsResponsePutUser['results']>;
	public async putUser({ userid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutUser & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutUser>>;
	public async putUser({ userid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutUser): Promise<HighSystemsResponsePutUser['results'] | AxiosResponse<HighSystemsResponsePutUser>> {
		const results = await this.api<HighSystemsResponsePutUser>({
			method: 'put',
			url: `/api/rest/v1/users/${userid}`,
			data: body,
			params: { userid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getUserTokens
	 *
	 * 
	 *
	 * @param options getUserTokens method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getUserTokens({ userid, requestOptions, returnAxios = false }: HighSystemsRequestGetUserTokens & { returnAxios?: false }): Promise<HighSystemsResponseGetUserTokens['results']>;
	public async getUserTokens({ userid, requestOptions, returnAxios = true }: HighSystemsRequestGetUserTokens & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetUserTokens>>;
	public async getUserTokens({ userid, requestOptions, returnAxios = false }: HighSystemsRequestGetUserTokens): Promise<HighSystemsResponseGetUserTokens['results'] | AxiosResponse<HighSystemsResponseGetUserTokens>> {
		const results = await this.api<HighSystemsResponseGetUserTokens>({
			method: 'get',
			url: `/api/rest/v1/users/${userid}/tokens`,
			params: { userid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * postUserToken
	 *
	 * 
	 *
	 * @param options postUserToken method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postUserToken({ userid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostUserToken & { returnAxios?: false }): Promise<HighSystemsResponsePostUserToken['results']>;
	public async postUserToken({ userid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostUserToken & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostUserToken>>;
	public async postUserToken({ userid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostUserToken): Promise<HighSystemsResponsePostUserToken['results'] | AxiosResponse<HighSystemsResponsePostUserToken>> {
		const results = await this.api<HighSystemsResponsePostUserToken>({
			method: 'post',
			url: `/api/rest/v1/users/${userid}/tokens`,
			data: body,
			params: { userid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * deleteUserToken
	 *
	 * 
	 *
	 * @param options deleteUserToken method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteUserToken({ userid, tokenid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteUserToken & { returnAxios?: false }): Promise<HighSystemsResponseDeleteUserToken['results']>;
	public async deleteUserToken({ userid, tokenid, requestOptions, returnAxios = true }: HighSystemsRequestDeleteUserToken & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteUserToken>>;
	public async deleteUserToken({ userid, tokenid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteUserToken): Promise<HighSystemsResponseDeleteUserToken['results'] | AxiosResponse<HighSystemsResponseDeleteUserToken>> {
		const results = await this.api<HighSystemsResponseDeleteUserToken>({
			method: 'delete',
			url: `/api/rest/v1/users/${userid}/tokens/${tokenid}`,
			params: { userid, tokenid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getUserToken
	 *
	 * 
	 *
	 * @param options getUserToken method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getUserToken({ userid, tokenid, requestOptions, returnAxios = false }: HighSystemsRequestGetUserToken & { returnAxios?: false }): Promise<HighSystemsResponseGetUserToken['results']>;
	public async getUserToken({ userid, tokenid, requestOptions, returnAxios = true }: HighSystemsRequestGetUserToken & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetUserToken>>;
	public async getUserToken({ userid, tokenid, requestOptions, returnAxios = false }: HighSystemsRequestGetUserToken): Promise<HighSystemsResponseGetUserToken['results'] | AxiosResponse<HighSystemsResponseGetUserToken>> {
		const results = await this.api<HighSystemsResponseGetUserToken>({
			method: 'get',
			url: `/api/rest/v1/users/${userid}/tokens/${tokenid}`,
			params: { userid, tokenid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putUserToken
	 *
	 * 
	 *
	 * @param options putUserToken method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putUserToken({ tokenid, userid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutUserToken & { returnAxios?: false }): Promise<HighSystemsResponsePutUserToken['results']>;
	public async putUserToken({ tokenid, userid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutUserToken & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutUserToken>>;
	public async putUserToken({ tokenid, userid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutUserToken): Promise<HighSystemsResponsePutUserToken['results'] | AxiosResponse<HighSystemsResponsePutUserToken>> {
		const results = await this.api<HighSystemsResponsePutUserToken>({
			method: 'put',
			url: `/api/rest/v1/users/${userid}/tokens/${tokenid}`,
			data: body,
			params: { tokenid, userid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getApplications
	 *
	 * 
	 *
	 * @param options getApplications method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getApplications({ requestOptions, returnAxios = false }: HighSystemsRequestGetApplications & { returnAxios?: false }): Promise<HighSystemsResponseGetApplications['results']>;
	public async getApplications({ requestOptions, returnAxios = true }: HighSystemsRequestGetApplications & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetApplications>>;
	public async getApplications({ requestOptions, returnAxios = false }: HighSystemsRequestGetApplications = {}): Promise<HighSystemsResponseGetApplications['results'] | AxiosResponse<HighSystemsResponseGetApplications>> {
		const results = await this.api<HighSystemsResponseGetApplications>({
			method: 'get',
			url: `/api/rest/v1/applications`,
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * postApplication
	 *
	 * 
	 *
	 * @param options postApplication method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postApplication({ requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostApplication & { returnAxios?: false }): Promise<HighSystemsResponsePostApplication['results']>;
	public async postApplication({ requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostApplication & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostApplication>>;
	public async postApplication({ requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostApplication): Promise<HighSystemsResponsePostApplication['results'] | AxiosResponse<HighSystemsResponsePostApplication>> {
		const results = await this.api<HighSystemsResponsePostApplication>({
			method: 'post',
			url: `/api/rest/v1/applications`,
			data: body,
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * deleteApplication
	 *
	 * 
	 *
	 * @param options deleteApplication method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteApplication({ appid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteApplication & { returnAxios?: false }): Promise<HighSystemsResponseDeleteApplication['results']>;
	public async deleteApplication({ appid, requestOptions, returnAxios = true }: HighSystemsRequestDeleteApplication & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteApplication>>;
	public async deleteApplication({ appid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteApplication): Promise<HighSystemsResponseDeleteApplication['results'] | AxiosResponse<HighSystemsResponseDeleteApplication>> {
		const results = await this.api<HighSystemsResponseDeleteApplication>({
			method: 'delete',
			url: `/api/rest/v1/applications/${appid}`,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getApplication
	 *
	 * 
	 *
	 * @param options getApplication method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getApplication({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplication & { returnAxios?: false }): Promise<HighSystemsResponseGetApplication['results']>;
	public async getApplication({ appid, requestOptions, returnAxios = true }: HighSystemsRequestGetApplication & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetApplication>>;
	public async getApplication({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplication): Promise<HighSystemsResponseGetApplication['results'] | AxiosResponse<HighSystemsResponseGetApplication>> {
		const results = await this.api<HighSystemsResponseGetApplication>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}`,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putApplication
	 *
	 * 
	 *
	 * @param options putApplication method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putApplication({ appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutApplication & { returnAxios?: false }): Promise<HighSystemsResponsePutApplication['results']>;
	public async putApplication({ appid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutApplication & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutApplication>>;
	public async putApplication({ appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutApplication): Promise<HighSystemsResponsePutApplication['results'] | AxiosResponse<HighSystemsResponsePutApplication>> {
		const results = await this.api<HighSystemsResponsePutApplication>({
			method: 'put',
			url: `/api/rest/v1/applications/${appid}`,
			data: body,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getApplicationMenus
	 *
	 * 
	 *
	 * @param options getApplicationMenus method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getApplicationMenus({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplicationMenus & { returnAxios?: false }): Promise<HighSystemsResponseGetApplicationMenus['results']>;
	public async getApplicationMenus({ appid, requestOptions, returnAxios = true }: HighSystemsRequestGetApplicationMenus & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetApplicationMenus>>;
	public async getApplicationMenus({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplicationMenus): Promise<HighSystemsResponseGetApplicationMenus['results'] | AxiosResponse<HighSystemsResponseGetApplicationMenus>> {
		const results = await this.api<HighSystemsResponseGetApplicationMenus>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/menus`,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * postApplicationMenu
	 *
	 * 
	 *
	 * @param options postApplicationMenu method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postApplicationMenu({ appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostApplicationMenu & { returnAxios?: false }): Promise<HighSystemsResponsePostApplicationMenu['results']>;
	public async postApplicationMenu({ appid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostApplicationMenu & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostApplicationMenu>>;
	public async postApplicationMenu({ appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostApplicationMenu): Promise<HighSystemsResponsePostApplicationMenu['results'] | AxiosResponse<HighSystemsResponsePostApplicationMenu>> {
		const results = await this.api<HighSystemsResponsePostApplicationMenu>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/menus`,
			data: body,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * deleteApplicationMenu
	 *
	 * 
	 *
	 * @param options deleteApplicationMenu method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteApplicationMenu({ appid, menuid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteApplicationMenu & { returnAxios?: false }): Promise<HighSystemsResponseDeleteApplicationMenu['results']>;
	public async deleteApplicationMenu({ appid, menuid, requestOptions, returnAxios = true }: HighSystemsRequestDeleteApplicationMenu & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteApplicationMenu>>;
	public async deleteApplicationMenu({ appid, menuid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteApplicationMenu): Promise<HighSystemsResponseDeleteApplicationMenu['results'] | AxiosResponse<HighSystemsResponseDeleteApplicationMenu>> {
		const results = await this.api<HighSystemsResponseDeleteApplicationMenu>({
			method: 'delete',
			url: `/api/rest/v1/applications/${appid}/menus/${menuid}`,
			params: { appid, menuid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getApplicationMenu
	 *
	 * 
	 *
	 * @param options getApplicationMenu method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getApplicationMenu({ appid, menuid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplicationMenu & { returnAxios?: false }): Promise<HighSystemsResponseGetApplicationMenu['results']>;
	public async getApplicationMenu({ appid, menuid, requestOptions, returnAxios = true }: HighSystemsRequestGetApplicationMenu & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetApplicationMenu>>;
	public async getApplicationMenu({ appid, menuid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplicationMenu): Promise<HighSystemsResponseGetApplicationMenu['results'] | AxiosResponse<HighSystemsResponseGetApplicationMenu>> {
		const results = await this.api<HighSystemsResponseGetApplicationMenu>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/menus/${menuid}`,
			params: { appid, menuid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putApplicationMenu
	 *
	 * 
	 *
	 * @param options putApplicationMenu method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putApplicationMenu({ appid, menuid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutApplicationMenu & { returnAxios?: false }): Promise<HighSystemsResponsePutApplicationMenu['results']>;
	public async putApplicationMenu({ appid, menuid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutApplicationMenu & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutApplicationMenu>>;
	public async putApplicationMenu({ appid, menuid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutApplicationMenu): Promise<HighSystemsResponsePutApplicationMenu['results'] | AxiosResponse<HighSystemsResponsePutApplicationMenu>> {
		const results = await this.api<HighSystemsResponsePutApplicationMenu>({
			method: 'put',
			url: `/api/rest/v1/applications/${appid}/menus/${menuid}`,
			data: body,
			params: { appid, menuid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getApplicationUserMenu
	 *
	 * 
	 *
	 * @param options getApplicationUserMenu method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getApplicationUserMenu({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplicationUserMenu & { returnAxios?: false }): Promise<HighSystemsResponseGetApplicationUserMenu['results']>;
	public async getApplicationUserMenu({ appid, requestOptions, returnAxios = true }: HighSystemsRequestGetApplicationUserMenu & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetApplicationUserMenu>>;
	public async getApplicationUserMenu({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplicationUserMenu): Promise<HighSystemsResponseGetApplicationUserMenu['results'] | AxiosResponse<HighSystemsResponseGetApplicationUserMenu>> {
		const results = await this.api<HighSystemsResponseGetApplicationUserMenu>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/menus/user`,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getVariables
	 *
	 * 
	 *
	 * @param options getVariables method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getVariables({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetVariables & { returnAxios?: false }): Promise<HighSystemsResponseGetVariables['results']>;
	public async getVariables({ appid, requestOptions, returnAxios = true }: HighSystemsRequestGetVariables & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetVariables>>;
	public async getVariables({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetVariables): Promise<HighSystemsResponseGetVariables['results'] | AxiosResponse<HighSystemsResponseGetVariables>> {
		const results = await this.api<HighSystemsResponseGetVariables>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/variables`,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getVariable
	 *
	 * 
	 *
	 * @param options getVariable method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getVariable({ appid, variableid, requestOptions, returnAxios = false }: HighSystemsRequestGetVariable & { returnAxios?: false }): Promise<HighSystemsResponseGetVariable['results']>;
	public async getVariable({ appid, variableid, requestOptions, returnAxios = true }: HighSystemsRequestGetVariable & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetVariable>>;
	public async getVariable({ appid, variableid, requestOptions, returnAxios = false }: HighSystemsRequestGetVariable): Promise<HighSystemsResponseGetVariable['results'] | AxiosResponse<HighSystemsResponseGetVariable>> {
		const results = await this.api<HighSystemsResponseGetVariable>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/variables/${variableid}`,
			params: { appid, variableid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * postVariable
	 *
	 * 
	 *
	 * @param options postVariable method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postVariable({ relatedApplication, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostVariable & { returnAxios?: false }): Promise<HighSystemsResponsePostVariable['results']>;
	public async postVariable({ relatedApplication, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostVariable & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostVariable>>;
	public async postVariable({ relatedApplication, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostVariable): Promise<HighSystemsResponsePostVariable['results'] | AxiosResponse<HighSystemsResponsePostVariable>> {
		const results = await this.api<HighSystemsResponsePostVariable>({
			method: 'post',
			url: `/api/rest/v1/applications/${relatedApplication}/variables`,
			data: body,
			params: { relatedApplication }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * deleteVariable
	 *
	 * 
	 *
	 * @param options deleteVariable method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteVariable({ relatedApplication, variableid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteVariable & { returnAxios?: false }): Promise<HighSystemsResponseDeleteVariable['results']>;
	public async deleteVariable({ relatedApplication, variableid, requestOptions, returnAxios = true }: HighSystemsRequestDeleteVariable & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteVariable>>;
	public async deleteVariable({ relatedApplication, variableid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteVariable): Promise<HighSystemsResponseDeleteVariable['results'] | AxiosResponse<HighSystemsResponseDeleteVariable>> {
		const results = await this.api<HighSystemsResponseDeleteVariable>({
			method: 'delete',
			url: `/api/rest/v1/applications/${relatedApplication}/variables/${variableid}`,
			params: { relatedApplication, variableid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putVariable
	 *
	 * 
	 *
	 * @param options putVariable method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putVariable({ relatedApplication, variableid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutVariable & { returnAxios?: false }): Promise<HighSystemsResponsePutVariable['results']>;
	public async putVariable({ relatedApplication, variableid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutVariable & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutVariable>>;
	public async putVariable({ relatedApplication, variableid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutVariable): Promise<HighSystemsResponsePutVariable['results'] | AxiosResponse<HighSystemsResponsePutVariable>> {
		const results = await this.api<HighSystemsResponsePutVariable>({
			method: 'put',
			url: `/api/rest/v1/applications/${relatedApplication}/variables/${variableid}`,
			data: body,
			params: { relatedApplication, variableid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getRoles
	 *
	 * 
	 *
	 * @param options getRoles method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getRoles({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetRoles & { returnAxios?: false }): Promise<HighSystemsResponseGetRoles['results']>;
	public async getRoles({ appid, requestOptions, returnAxios = true }: HighSystemsRequestGetRoles & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetRoles>>;
	public async getRoles({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetRoles): Promise<HighSystemsResponseGetRoles['results'] | AxiosResponse<HighSystemsResponseGetRoles>> {
		const results = await this.api<HighSystemsResponseGetRoles>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/roles`,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getRole
	 *
	 * 
	 *
	 * @param options getRole method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getRole({ appid, roleid, requestOptions, returnAxios = false }: HighSystemsRequestGetRole & { returnAxios?: false }): Promise<HighSystemsResponseGetRole['results']>;
	public async getRole({ appid, roleid, requestOptions, returnAxios = true }: HighSystemsRequestGetRole & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetRole>>;
	public async getRole({ appid, roleid, requestOptions, returnAxios = false }: HighSystemsRequestGetRole): Promise<HighSystemsResponseGetRole['results'] | AxiosResponse<HighSystemsResponseGetRole>> {
		const results = await this.api<HighSystemsResponseGetRole>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/roles/${roleid}`,
			params: { appid, roleid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * postRole
	 *
	 * 
	 *
	 * @param options postRole method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postRole({ relatedApplication, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostRole & { returnAxios?: false }): Promise<HighSystemsResponsePostRole['results']>;
	public async postRole({ relatedApplication, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostRole & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostRole>>;
	public async postRole({ relatedApplication, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostRole): Promise<HighSystemsResponsePostRole['results'] | AxiosResponse<HighSystemsResponsePostRole>> {
		const results = await this.api<HighSystemsResponsePostRole>({
			method: 'post',
			url: `/api/rest/v1/applications/${relatedApplication}/roles`,
			data: body,
			params: { relatedApplication }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * deleteRole
	 *
	 * 
	 *
	 * @param options deleteRole method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteRole({ relatedApplication, roleid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteRole & { returnAxios?: false }): Promise<HighSystemsResponseDeleteRole['results']>;
	public async deleteRole({ relatedApplication, roleid, requestOptions, returnAxios = true }: HighSystemsRequestDeleteRole & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteRole>>;
	public async deleteRole({ relatedApplication, roleid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteRole): Promise<HighSystemsResponseDeleteRole['results'] | AxiosResponse<HighSystemsResponseDeleteRole>> {
		const results = await this.api<HighSystemsResponseDeleteRole>({
			method: 'delete',
			url: `/api/rest/v1/applications/${relatedApplication}/roles/${roleid}`,
			params: { relatedApplication, roleid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putRole
	 *
	 * 
	 *
	 * @param options putRole method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putRole({ relatedApplication, roleid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutRole & { returnAxios?: false }): Promise<HighSystemsResponsePutRole['results']>;
	public async putRole({ relatedApplication, roleid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutRole & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutRole>>;
	public async putRole({ relatedApplication, roleid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutRole): Promise<HighSystemsResponsePutRole['results'] | AxiosResponse<HighSystemsResponsePutRole>> {
		const results = await this.api<HighSystemsResponsePutRole>({
			method: 'put',
			url: `/api/rest/v1/applications/${relatedApplication}/roles/${roleid}`,
			data: body,
			params: { relatedApplication, roleid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getRolePermissions
	 *
	 * 
	 *
	 * @param options getRolePermissions method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getRolePermissions({ appid, roleid, requestOptions, returnAxios = false }: HighSystemsRequestGetRolePermissions & { returnAxios?: false }): Promise<HighSystemsResponseGetRolePermissions['results']>;
	public async getRolePermissions({ appid, roleid, requestOptions, returnAxios = true }: HighSystemsRequestGetRolePermissions & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetRolePermissions>>;
	public async getRolePermissions({ appid, roleid, requestOptions, returnAxios = false }: HighSystemsRequestGetRolePermissions): Promise<HighSystemsResponseGetRolePermissions['results'] | AxiosResponse<HighSystemsResponseGetRolePermissions>> {
		const results = await this.api<HighSystemsResponseGetRolePermissions>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/roles/${roleid}/permissions`,
			params: { appid, roleid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getRoleDefaults
	 *
	 * 
	 *
	 * @param options getRoleDefaults method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getRoleDefaults({ appid, roleid, requestOptions, returnAxios = false }: HighSystemsRequestGetRoleDefaults & { returnAxios?: false }): Promise<HighSystemsResponseGetRoleDefaults['results']>;
	public async getRoleDefaults({ appid, roleid, requestOptions, returnAxios = true }: HighSystemsRequestGetRoleDefaults & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetRoleDefaults>>;
	public async getRoleDefaults({ appid, roleid, requestOptions, returnAxios = false }: HighSystemsRequestGetRoleDefaults): Promise<HighSystemsResponseGetRoleDefaults['results'] | AxiosResponse<HighSystemsResponseGetRoleDefaults>> {
		const results = await this.api<HighSystemsResponseGetRoleDefaults>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/roles/${roleid}/defaults`,
			params: { appid, roleid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getApplicationUsers
	 *
	 * 
	 *
	 * @param options getApplicationUsers method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getApplicationUsers({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplicationUsers & { returnAxios?: false }): Promise<HighSystemsResponseGetApplicationUsers['results']>;
	public async getApplicationUsers({ appid, requestOptions, returnAxios = true }: HighSystemsRequestGetApplicationUsers & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetApplicationUsers>>;
	public async getApplicationUsers({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplicationUsers): Promise<HighSystemsResponseGetApplicationUsers['results'] | AxiosResponse<HighSystemsResponseGetApplicationUsers>> {
		const results = await this.api<HighSystemsResponseGetApplicationUsers>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/users`,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getApplicationUser
	 *
	 * 
	 *
	 * @param options getApplicationUser method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getApplicationUser({ appid, userid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplicationUser & { returnAxios?: false }): Promise<HighSystemsResponseGetApplicationUser['results']>;
	public async getApplicationUser({ appid, userid, requestOptions, returnAxios = true }: HighSystemsRequestGetApplicationUser & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetApplicationUser>>;
	public async getApplicationUser({ appid, userid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplicationUser): Promise<HighSystemsResponseGetApplicationUser['results'] | AxiosResponse<HighSystemsResponseGetApplicationUser>> {
		const results = await this.api<HighSystemsResponseGetApplicationUser>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/users/${userid}`,
			params: { appid, userid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * postApplicationUser
	 *
	 * 
	 *
	 * @param options postApplicationUser method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postApplicationUser({ relatedApplication, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostApplicationUser & { returnAxios?: false }): Promise<HighSystemsResponsePostApplicationUser['results']>;
	public async postApplicationUser({ relatedApplication, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostApplicationUser & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostApplicationUser>>;
	public async postApplicationUser({ relatedApplication, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostApplicationUser): Promise<HighSystemsResponsePostApplicationUser['results'] | AxiosResponse<HighSystemsResponsePostApplicationUser>> {
		const results = await this.api<HighSystemsResponsePostApplicationUser>({
			method: 'post',
			url: `/api/rest/v1/applications/${relatedApplication}/users`,
			data: body,
			params: { relatedApplication }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putApplicationUser
	 *
	 * 
	 *
	 * @param options putApplicationUser method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putApplicationUser({ relatedApplication, applicationUserId, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutApplicationUser & { returnAxios?: false }): Promise<HighSystemsResponsePutApplicationUser['results']>;
	public async putApplicationUser({ relatedApplication, applicationUserId, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutApplicationUser & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutApplicationUser>>;
	public async putApplicationUser({ relatedApplication, applicationUserId, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutApplicationUser): Promise<HighSystemsResponsePutApplicationUser['results'] | AxiosResponse<HighSystemsResponsePutApplicationUser>> {
		const results = await this.api<HighSystemsResponsePutApplicationUser>({
			method: 'put',
			url: `/api/rest/v1/applications/${relatedApplication}/users/${applicationUserId}`,
			data: body,
			params: { relatedApplication, applicationUserId }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * deleteApplicationUser
	 *
	 * 
	 *
	 * @param options deleteApplicationUser method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteApplicationUser({ relatedApplication, userid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteApplicationUser & { returnAxios?: false }): Promise<HighSystemsResponseDeleteApplicationUser['results']>;
	public async deleteApplicationUser({ relatedApplication, userid, requestOptions, returnAxios = true }: HighSystemsRequestDeleteApplicationUser & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteApplicationUser>>;
	public async deleteApplicationUser({ relatedApplication, userid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteApplicationUser): Promise<HighSystemsResponseDeleteApplicationUser['results'] | AxiosResponse<HighSystemsResponseDeleteApplicationUser>> {
		const results = await this.api<HighSystemsResponseDeleteApplicationUser>({
			method: 'delete',
			url: `/api/rest/v1/applications/${relatedApplication}/users/${userid}`,
			params: { relatedApplication, userid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getTables
	 *
	 * 
	 *
	 * @param options getTables method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getTables({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetTables & { returnAxios?: false }): Promise<HighSystemsResponseGetTables['results']>;
	public async getTables({ appid, requestOptions, returnAxios = true }: HighSystemsRequestGetTables & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetTables>>;
	public async getTables({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetTables): Promise<HighSystemsResponseGetTables['results'] | AxiosResponse<HighSystemsResponseGetTables>> {
		const results = await this.api<HighSystemsResponseGetTables>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/tables`,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * deleteTable
	 *
	 * 
	 *
	 * @param options deleteTable method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteTable({ appid, tableid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteTable & { returnAxios?: false }): Promise<HighSystemsResponseDeleteTable['results']>;
	public async deleteTable({ appid, tableid, requestOptions, returnAxios = true }: HighSystemsRequestDeleteTable & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteTable>>;
	public async deleteTable({ appid, tableid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteTable): Promise<HighSystemsResponseDeleteTable['results'] | AxiosResponse<HighSystemsResponseDeleteTable>> {
		const results = await this.api<HighSystemsResponseDeleteTable>({
			method: 'delete',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}`,
			params: { appid, tableid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getTable
	 *
	 * 
	 *
	 * @param options getTable method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getTable({ appid, tableid, requestOptions, returnAxios = false }: HighSystemsRequestGetTable & { returnAxios?: false }): Promise<HighSystemsResponseGetTable['results']>;
	public async getTable({ appid, tableid, requestOptions, returnAxios = true }: HighSystemsRequestGetTable & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetTable>>;
	public async getTable({ appid, tableid, requestOptions, returnAxios = false }: HighSystemsRequestGetTable): Promise<HighSystemsResponseGetTable['results'] | AxiosResponse<HighSystemsResponseGetTable>> {
		const results = await this.api<HighSystemsResponseGetTable>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}`,
			params: { appid, tableid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putTable
	 *
	 * 
	 *
	 * @param options putTable method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putTable({ appid, tableid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutTable & { returnAxios?: false }): Promise<HighSystemsResponsePutTable['results']>;
	public async putTable({ appid, tableid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutTable & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutTable>>;
	public async putTable({ appid, tableid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutTable): Promise<HighSystemsResponsePutTable['results'] | AxiosResponse<HighSystemsResponsePutTable>> {
		const results = await this.api<HighSystemsResponsePutTable>({
			method: 'put',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}`,
			data: body,
			params: { appid, tableid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * postTable
	 *
	 * 
	 *
	 * @param options postTable method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postTable({ relatedApplication, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostTable & { returnAxios?: false }): Promise<HighSystemsResponsePostTable['results']>;
	public async postTable({ relatedApplication, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostTable & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostTable>>;
	public async postTable({ relatedApplication, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostTable): Promise<HighSystemsResponsePostTable['results'] | AxiosResponse<HighSystemsResponsePostTable>> {
		const results = await this.api<HighSystemsResponsePostTable>({
			method: 'post',
			url: `/api/rest/v1/applications/${relatedApplication}/tables`,
			data: body,
			params: { relatedApplication }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getApplicationRelationships
	 *
	 * 
	 *
	 * @param options getApplicationRelationships method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getApplicationRelationships({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplicationRelationships & { returnAxios?: false }): Promise<HighSystemsResponseGetApplicationRelationships['results']>;
	public async getApplicationRelationships({ appid, requestOptions, returnAxios = true }: HighSystemsRequestGetApplicationRelationships & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetApplicationRelationships>>;
	public async getApplicationRelationships({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplicationRelationships): Promise<HighSystemsResponseGetApplicationRelationships['results'] | AxiosResponse<HighSystemsResponseGetApplicationRelationships>> {
		const results = await this.api<HighSystemsResponseGetApplicationRelationships>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/relationships`,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getTableRelationships
	 *
	 * 
	 *
	 * @param options getTableRelationships method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getTableRelationships({ appid, tableid, requestOptions, returnAxios = false }: HighSystemsRequestGetTableRelationships & { returnAxios?: false }): Promise<HighSystemsResponseGetTableRelationships['results']>;
	public async getTableRelationships({ appid, tableid, requestOptions, returnAxios = true }: HighSystemsRequestGetTableRelationships & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetTableRelationships>>;
	public async getTableRelationships({ appid, tableid, requestOptions, returnAxios = false }: HighSystemsRequestGetTableRelationships): Promise<HighSystemsResponseGetTableRelationships['results'] | AxiosResponse<HighSystemsResponseGetTableRelationships>> {
		const results = await this.api<HighSystemsResponseGetTableRelationships>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/tables/relationships`,
			params: { appid, tableid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getApplicationFields
	 *
	 * 
	 *
	 * @param options getApplicationFields method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getApplicationFields({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplicationFields & { returnAxios?: false }): Promise<HighSystemsResponseGetApplicationFields['results']>;
	public async getApplicationFields({ appid, requestOptions, returnAxios = true }: HighSystemsRequestGetApplicationFields & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetApplicationFields>>;
	public async getApplicationFields({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplicationFields): Promise<HighSystemsResponseGetApplicationFields['results'] | AxiosResponse<HighSystemsResponseGetApplicationFields>> {
		const results = await this.api<HighSystemsResponseGetApplicationFields>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/fields`,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getFields
	 *
	 * 
	 *
	 * @param options getFields method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getFields({ appid, tableid, clist, requestOptions, returnAxios = false }: HighSystemsRequestGetFields & { returnAxios?: false }): Promise<HighSystemsResponseGetFields['results']>;
	public async getFields({ appid, tableid, clist, requestOptions, returnAxios = true }: HighSystemsRequestGetFields & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetFields>>;
	public async getFields({ appid, tableid, clist, requestOptions, returnAxios = false }: HighSystemsRequestGetFields): Promise<HighSystemsResponseGetFields['results'] | AxiosResponse<HighSystemsResponseGetFields>> {
		const results = await this.api<HighSystemsResponseGetFields>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/fields`,
			params: { appid, tableid, clist }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * deleteField
	 *
	 * 
	 *
	 * @param options deleteField method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteField({ appid, tableid, fieldid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteField & { returnAxios?: false }): Promise<HighSystemsResponseDeleteField['results']>;
	public async deleteField({ appid, tableid, fieldid, requestOptions, returnAxios = true }: HighSystemsRequestDeleteField & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteField>>;
	public async deleteField({ appid, tableid, fieldid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteField): Promise<HighSystemsResponseDeleteField['results'] | AxiosResponse<HighSystemsResponseDeleteField>> {
		const results = await this.api<HighSystemsResponseDeleteField>({
			method: 'delete',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/fields/${fieldid}`,
			params: { appid, tableid, fieldid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getField
	 *
	 * 
	 *
	 * @param options getField method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getField({ appid, tableid, fieldid, requestOptions, returnAxios = false }: HighSystemsRequestGetField & { returnAxios?: false }): Promise<HighSystemsResponseGetField['results']>;
	public async getField({ appid, tableid, fieldid, requestOptions, returnAxios = true }: HighSystemsRequestGetField & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetField>>;
	public async getField({ appid, tableid, fieldid, requestOptions, returnAxios = false }: HighSystemsRequestGetField): Promise<HighSystemsResponseGetField['results'] | AxiosResponse<HighSystemsResponseGetField>> {
		const results = await this.api<HighSystemsResponseGetField>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/fields/${fieldid}`,
			params: { appid, tableid, fieldid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * postField
	 *
	 * 
	 *
	 * @param options postField method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postField({ appid, relatedTable, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostField & { returnAxios?: false }): Promise<HighSystemsResponsePostField['results']>;
	public async postField({ appid, relatedTable, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostField & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostField>>;
	public async postField({ appid, relatedTable, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostField): Promise<HighSystemsResponsePostField['results'] | AxiosResponse<HighSystemsResponsePostField>> {
		const results = await this.api<HighSystemsResponsePostField>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/tables/${relatedTable}/fields`,
			data: body,
			params: { appid, relatedTable }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putField
	 *
	 * 
	 *
	 * @param options putField method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putField({ appid, relatedTable, fieldid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutField & { returnAxios?: false }): Promise<HighSystemsResponsePutField['results']>;
	public async putField({ appid, relatedTable, fieldid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutField & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutField>>;
	public async putField({ appid, relatedTable, fieldid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutField): Promise<HighSystemsResponsePutField['results'] | AxiosResponse<HighSystemsResponsePutField>> {
		const results = await this.api<HighSystemsResponsePutField>({
			method: 'put',
			url: `/api/rest/v1/applications/${appid}/tables/${relatedTable}/fields/${fieldid}`,
			data: body,
			params: { appid, relatedTable, fieldid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getApplicationReports
	 *
	 * 
	 *
	 * @param options getApplicationReports method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getApplicationReports({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplicationReports & { returnAxios?: false }): Promise<HighSystemsResponseGetApplicationReports['results']>;
	public async getApplicationReports({ appid, requestOptions, returnAxios = true }: HighSystemsRequestGetApplicationReports & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetApplicationReports>>;
	public async getApplicationReports({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplicationReports): Promise<HighSystemsResponseGetApplicationReports['results'] | AxiosResponse<HighSystemsResponseGetApplicationReports>> {
		const results = await this.api<HighSystemsResponseGetApplicationReports>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/reports`,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getReports
	 *
	 * 
	 *
	 * @param options getReports method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getReports({ appid, tableid, requestOptions, returnAxios = false }: HighSystemsRequestGetReports & { returnAxios?: false }): Promise<HighSystemsResponseGetReports['results']>;
	public async getReports({ appid, tableid, requestOptions, returnAxios = true }: HighSystemsRequestGetReports & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetReports>>;
	public async getReports({ appid, tableid, requestOptions, returnAxios = false }: HighSystemsRequestGetReports): Promise<HighSystemsResponseGetReports['results'] | AxiosResponse<HighSystemsResponseGetReports>> {
		const results = await this.api<HighSystemsResponseGetReports>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/reports`,
			params: { appid, tableid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * deleteReport
	 *
	 * 
	 *
	 * @param options deleteReport method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteReport({ appid, tableid, reportid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteReport & { returnAxios?: false }): Promise<HighSystemsResponseDeleteReport['results']>;
	public async deleteReport({ appid, tableid, reportid, requestOptions, returnAxios = true }: HighSystemsRequestDeleteReport & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteReport>>;
	public async deleteReport({ appid, tableid, reportid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteReport): Promise<HighSystemsResponseDeleteReport['results'] | AxiosResponse<HighSystemsResponseDeleteReport>> {
		const results = await this.api<HighSystemsResponseDeleteReport>({
			method: 'delete',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/reports/${reportid}`,
			params: { appid, tableid, reportid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getReport
	 *
	 * 
	 *
	 * @param options getReport method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getReport({ appid, tableid, reportid, requestOptions, returnAxios = false }: HighSystemsRequestGetReport & { returnAxios?: false }): Promise<HighSystemsResponseGetReport['results']>;
	public async getReport({ appid, tableid, reportid, requestOptions, returnAxios = true }: HighSystemsRequestGetReport & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetReport>>;
	public async getReport({ appid, tableid, reportid, requestOptions, returnAxios = false }: HighSystemsRequestGetReport): Promise<HighSystemsResponseGetReport['results'] | AxiosResponse<HighSystemsResponseGetReport>> {
		const results = await this.api<HighSystemsResponseGetReport>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/reports/${reportid}`,
			params: { appid, tableid, reportid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * postReport
	 *
	 * 
	 *
	 * @param options postReport method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postReport({ appid, relatedTable, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostReport & { returnAxios?: false }): Promise<HighSystemsResponsePostReport['results']>;
	public async postReport({ appid, relatedTable, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostReport & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostReport>>;
	public async postReport({ appid, relatedTable, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostReport): Promise<HighSystemsResponsePostReport['results'] | AxiosResponse<HighSystemsResponsePostReport>> {
		const results = await this.api<HighSystemsResponsePostReport>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/tables/${relatedTable}/reports`,
			data: body,
			params: { appid, relatedTable }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putReport
	 *
	 * 
	 *
	 * @param options putReport method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putReport({ appid, relatedTable, reportid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutReport & { returnAxios?: false }): Promise<HighSystemsResponsePutReport['results']>;
	public async putReport({ appid, relatedTable, reportid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutReport & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutReport>>;
	public async putReport({ appid, relatedTable, reportid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutReport): Promise<HighSystemsResponsePutReport['results'] | AxiosResponse<HighSystemsResponsePutReport>> {
		const results = await this.api<HighSystemsResponsePutReport>({
			method: 'put',
			url: `/api/rest/v1/applications/${appid}/tables/${relatedTable}/reports/${reportid}`,
			data: body,
			params: { appid, relatedTable, reportid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getApplicationForms
	 *
	 * 
	 *
	 * @param options getApplicationForms method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getApplicationForms({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplicationForms & { returnAxios?: false }): Promise<HighSystemsResponseGetApplicationForms['results']>;
	public async getApplicationForms({ appid, requestOptions, returnAxios = true }: HighSystemsRequestGetApplicationForms & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetApplicationForms>>;
	public async getApplicationForms({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplicationForms): Promise<HighSystemsResponseGetApplicationForms['results'] | AxiosResponse<HighSystemsResponseGetApplicationForms>> {
		const results = await this.api<HighSystemsResponseGetApplicationForms>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/forms`,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getForms
	 *
	 * 
	 *
	 * @param options getForms method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getForms({ appid, tableid, requestOptions, returnAxios = false }: HighSystemsRequestGetForms & { returnAxios?: false }): Promise<HighSystemsResponseGetForms['results']>;
	public async getForms({ appid, tableid, requestOptions, returnAxios = true }: HighSystemsRequestGetForms & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetForms>>;
	public async getForms({ appid, tableid, requestOptions, returnAxios = false }: HighSystemsRequestGetForms): Promise<HighSystemsResponseGetForms['results'] | AxiosResponse<HighSystemsResponseGetForms>> {
		const results = await this.api<HighSystemsResponseGetForms>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/forms`,
			params: { appid, tableid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * deleteForm
	 *
	 * 
	 *
	 * @param options deleteForm method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteForm({ appid, tableid, formid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteForm & { returnAxios?: false }): Promise<HighSystemsResponseDeleteForm['results']>;
	public async deleteForm({ appid, tableid, formid, requestOptions, returnAxios = true }: HighSystemsRequestDeleteForm & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteForm>>;
	public async deleteForm({ appid, tableid, formid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteForm): Promise<HighSystemsResponseDeleteForm['results'] | AxiosResponse<HighSystemsResponseDeleteForm>> {
		const results = await this.api<HighSystemsResponseDeleteForm>({
			method: 'delete',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/forms/${formid}`,
			params: { appid, tableid, formid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getForm
	 *
	 * 
	 *
	 * @param options getForm method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getForm({ appid, tableid, formid, requestOptions, returnAxios = false }: HighSystemsRequestGetForm & { returnAxios?: false }): Promise<HighSystemsResponseGetForm['results']>;
	public async getForm({ appid, tableid, formid, requestOptions, returnAxios = true }: HighSystemsRequestGetForm & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetForm>>;
	public async getForm({ appid, tableid, formid, requestOptions, returnAxios = false }: HighSystemsRequestGetForm): Promise<HighSystemsResponseGetForm['results'] | AxiosResponse<HighSystemsResponseGetForm>> {
		const results = await this.api<HighSystemsResponseGetForm>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/forms/${formid}`,
			params: { appid, tableid, formid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * postForm
	 *
	 * 
	 *
	 * @param options postForm method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postForm({ relatedTable, appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostForm & { returnAxios?: false }): Promise<HighSystemsResponsePostForm['results']>;
	public async postForm({ relatedTable, appid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostForm & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostForm>>;
	public async postForm({ relatedTable, appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostForm): Promise<HighSystemsResponsePostForm['results'] | AxiosResponse<HighSystemsResponsePostForm>> {
		const results = await this.api<HighSystemsResponsePostForm>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/tables/${relatedTable}/forms`,
			data: body,
			params: { relatedTable, appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putForm
	 *
	 * 
	 *
	 * @param options putForm method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putForm({ relatedTable, appid, formid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutForm & { returnAxios?: false }): Promise<HighSystemsResponsePutForm['results']>;
	public async putForm({ relatedTable, appid, formid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutForm & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutForm>>;
	public async putForm({ relatedTable, appid, formid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutForm): Promise<HighSystemsResponsePutForm['results'] | AxiosResponse<HighSystemsResponsePutForm>> {
		const results = await this.api<HighSystemsResponsePutForm>({
			method: 'put',
			url: `/api/rest/v1/applications/${appid}/tables/${relatedTable}/forms/${formid}`,
			data: body,
			params: { relatedTable, appid, formid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getApplicationEntityRelationshipDiagram
	 *
	 * 
	 *
	 * @param options getApplicationEntityRelationshipDiagram method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getApplicationEntityRelationshipDiagram({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplicationEntityRelationshipDiagram & { returnAxios?: false }): Promise<HighSystemsResponseGetApplicationEntityRelationshipDiagram['results']>;
	public async getApplicationEntityRelationshipDiagram({ appid, requestOptions, returnAxios = true }: HighSystemsRequestGetApplicationEntityRelationshipDiagram & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetApplicationEntityRelationshipDiagram>>;
	public async getApplicationEntityRelationshipDiagram({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetApplicationEntityRelationshipDiagram): Promise<HighSystemsResponseGetApplicationEntityRelationshipDiagram['results'] | AxiosResponse<HighSystemsResponseGetApplicationEntityRelationshipDiagram>> {
		const results = await this.api<HighSystemsResponseGetApplicationEntityRelationshipDiagram>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/erd`,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putApplicationEntityRelationshipDiagram
	 *
	 * 
	 *
	 * @param options putApplicationEntityRelationshipDiagram method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putApplicationEntityRelationshipDiagram({ appid, diagramid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutApplicationEntityRelationshipDiagram & { returnAxios?: false }): Promise<HighSystemsResponsePutApplicationEntityRelationshipDiagram['results']>;
	public async putApplicationEntityRelationshipDiagram({ appid, diagramid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutApplicationEntityRelationshipDiagram & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutApplicationEntityRelationshipDiagram>>;
	public async putApplicationEntityRelationshipDiagram({ appid, diagramid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutApplicationEntityRelationshipDiagram): Promise<HighSystemsResponsePutApplicationEntityRelationshipDiagram['results'] | AxiosResponse<HighSystemsResponsePutApplicationEntityRelationshipDiagram>> {
		const results = await this.api<HighSystemsResponsePutApplicationEntityRelationshipDiagram>({
			method: 'put',
			url: `/api/rest/v1/applications/${appid}/erd/${diagramid}`,
			data: body,
			params: { appid, diagramid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getDashboards
	 *
	 * 
	 *
	 * @param options getDashboards method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getDashboards({ appid, relatedTable, requestOptions, returnAxios = false }: HighSystemsRequestGetDashboards & { returnAxios?: false }): Promise<HighSystemsResponseGetDashboards['results']>;
	public async getDashboards({ appid, relatedTable, requestOptions, returnAxios = true }: HighSystemsRequestGetDashboards & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetDashboards>>;
	public async getDashboards({ appid, relatedTable, requestOptions, returnAxios = false }: HighSystemsRequestGetDashboards): Promise<HighSystemsResponseGetDashboards['results'] | AxiosResponse<HighSystemsResponseGetDashboards>> {
		const results = await this.api<HighSystemsResponseGetDashboards>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/dashboards`,
			params: { appid, relatedTable }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * postDashboard
	 *
	 * 
	 *
	 * @param options postDashboard method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postDashboard({ appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostDashboard & { returnAxios?: false }): Promise<HighSystemsResponsePostDashboard['results']>;
	public async postDashboard({ appid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostDashboard & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostDashboard>>;
	public async postDashboard({ appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostDashboard): Promise<HighSystemsResponsePostDashboard['results'] | AxiosResponse<HighSystemsResponsePostDashboard>> {
		const results = await this.api<HighSystemsResponsePostDashboard>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/dashboards`,
			data: body,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * deleteDashboard
	 *
	 * 
	 *
	 * @param options deleteDashboard method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteDashboard({ appid, tableid, dashboardid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteDashboard & { returnAxios?: false }): Promise<HighSystemsResponseDeleteDashboard['results']>;
	public async deleteDashboard({ appid, tableid, dashboardid, requestOptions, returnAxios = true }: HighSystemsRequestDeleteDashboard & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteDashboard>>;
	public async deleteDashboard({ appid, tableid, dashboardid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteDashboard): Promise<HighSystemsResponseDeleteDashboard['results'] | AxiosResponse<HighSystemsResponseDeleteDashboard>> {
		const results = await this.api<HighSystemsResponseDeleteDashboard>({
			method: 'delete',
			url: `/api/rest/v1/applications/${appid}/dashboards/${dashboardid}`,
			params: { appid, tableid, dashboardid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getDashboard
	 *
	 * 
	 *
	 * @param options getDashboard method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getDashboard({ appid, relatedTable, dashboardid, requestOptions, returnAxios = false }: HighSystemsRequestGetDashboard & { returnAxios?: false }): Promise<HighSystemsResponseGetDashboard['results']>;
	public async getDashboard({ appid, relatedTable, dashboardid, requestOptions, returnAxios = true }: HighSystemsRequestGetDashboard & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetDashboard>>;
	public async getDashboard({ appid, relatedTable, dashboardid, requestOptions, returnAxios = false }: HighSystemsRequestGetDashboard): Promise<HighSystemsResponseGetDashboard['results'] | AxiosResponse<HighSystemsResponseGetDashboard>> {
		const results = await this.api<HighSystemsResponseGetDashboard>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/dashboards/${dashboardid}`,
			params: { appid, relatedTable, dashboardid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putDashboard
	 *
	 * 
	 *
	 * @param options putDashboard method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putDashboard({ appid, dashboardid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutDashboard & { returnAxios?: false }): Promise<HighSystemsResponsePutDashboard['results']>;
	public async putDashboard({ appid, dashboardid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutDashboard & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutDashboard>>;
	public async putDashboard({ appid, dashboardid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutDashboard): Promise<HighSystemsResponsePutDashboard['results'] | AxiosResponse<HighSystemsResponsePutDashboard>> {
		const results = await this.api<HighSystemsResponsePutDashboard>({
			method: 'put',
			url: `/api/rest/v1/applications/${appid}/dashboards/${dashboardid}`,
			data: body,
			params: { appid, dashboardid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getPages
	 *
	 * 
	 *
	 * @param options getPages method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getPages({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetPages & { returnAxios?: false }): Promise<HighSystemsResponseGetPages['results']>;
	public async getPages({ appid, requestOptions, returnAxios = true }: HighSystemsRequestGetPages & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetPages>>;
	public async getPages({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetPages): Promise<HighSystemsResponseGetPages['results'] | AxiosResponse<HighSystemsResponseGetPages>> {
		const results = await this.api<HighSystemsResponseGetPages>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/pages`,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * postPage
	 *
	 * 
	 *
	 * @param options postPage method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postPage({ appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostPage & { returnAxios?: false }): Promise<HighSystemsResponsePostPage['results']>;
	public async postPage({ appid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostPage & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostPage>>;
	public async postPage({ appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostPage): Promise<HighSystemsResponsePostPage['results'] | AxiosResponse<HighSystemsResponsePostPage>> {
		const results = await this.api<HighSystemsResponsePostPage>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/pages`,
			data: body,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * deletePage
	 *
	 * 
	 *
	 * @param options deletePage method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deletePage({ appid, pageid, requestOptions, returnAxios = false }: HighSystemsRequestDeletePage & { returnAxios?: false }): Promise<HighSystemsResponseDeletePage['results']>;
	public async deletePage({ appid, pageid, requestOptions, returnAxios = true }: HighSystemsRequestDeletePage & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeletePage>>;
	public async deletePage({ appid, pageid, requestOptions, returnAxios = false }: HighSystemsRequestDeletePage): Promise<HighSystemsResponseDeletePage['results'] | AxiosResponse<HighSystemsResponseDeletePage>> {
		const results = await this.api<HighSystemsResponseDeletePage>({
			method: 'delete',
			url: `/api/rest/v1/applications/${appid}/pages/${pageid}`,
			params: { appid, pageid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getPage
	 *
	 * 
	 *
	 * @param options getPage method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getPage({ appid, pageid, requestOptions, returnAxios = false }: HighSystemsRequestGetPage & { returnAxios?: false }): Promise<HighSystemsResponseGetPage['results']>;
	public async getPage({ appid, pageid, requestOptions, returnAxios = true }: HighSystemsRequestGetPage & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetPage>>;
	public async getPage({ appid, pageid, requestOptions, returnAxios = false }: HighSystemsRequestGetPage): Promise<HighSystemsResponseGetPage['results'] | AxiosResponse<HighSystemsResponseGetPage>> {
		const results = await this.api<HighSystemsResponseGetPage>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/pages/${pageid}`,
			params: { appid, pageid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putPage
	 *
	 * 
	 *
	 * @param options putPage method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putPage({ appid, pageid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutPage & { returnAxios?: false }): Promise<HighSystemsResponsePutPage['results']>;
	public async putPage({ appid, pageid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutPage & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutPage>>;
	public async putPage({ appid, pageid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutPage): Promise<HighSystemsResponsePutPage['results'] | AxiosResponse<HighSystemsResponsePutPage>> {
		const results = await this.api<HighSystemsResponsePutPage>({
			method: 'put',
			url: `/api/rest/v1/applications/${appid}/pages/${pageid}`,
			data: body,
			params: { appid, pageid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getNotifications
	 *
	 * 
	 *
	 * @param options getNotifications method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getNotifications({ appid, tableid, requestOptions, returnAxios = false }: HighSystemsRequestGetNotifications & { returnAxios?: false }): Promise<HighSystemsResponseGetNotifications['results']>;
	public async getNotifications({ appid, tableid, requestOptions, returnAxios = true }: HighSystemsRequestGetNotifications & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetNotifications>>;
	public async getNotifications({ appid, tableid, requestOptions, returnAxios = false }: HighSystemsRequestGetNotifications): Promise<HighSystemsResponseGetNotifications['results'] | AxiosResponse<HighSystemsResponseGetNotifications>> {
		const results = await this.api<HighSystemsResponseGetNotifications>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/notifications`,
			params: { appid, tableid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * deleteNotification
	 *
	 * 
	 *
	 * @param options deleteNotification method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteNotification({ appid, tableid, notificationid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteNotification & { returnAxios?: false }): Promise<HighSystemsResponseDeleteNotification['results']>;
	public async deleteNotification({ appid, tableid, notificationid, requestOptions, returnAxios = true }: HighSystemsRequestDeleteNotification & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteNotification>>;
	public async deleteNotification({ appid, tableid, notificationid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteNotification): Promise<HighSystemsResponseDeleteNotification['results'] | AxiosResponse<HighSystemsResponseDeleteNotification>> {
		const results = await this.api<HighSystemsResponseDeleteNotification>({
			method: 'delete',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/notifications/${notificationid}`,
			params: { appid, tableid, notificationid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getNotification
	 *
	 * 
	 *
	 * @param options getNotification method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getNotification({ appid, tableid, notificationid, requestOptions, returnAxios = false }: HighSystemsRequestGetNotification & { returnAxios?: false }): Promise<HighSystemsResponseGetNotification['results']>;
	public async getNotification({ appid, tableid, notificationid, requestOptions, returnAxios = true }: HighSystemsRequestGetNotification & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetNotification>>;
	public async getNotification({ appid, tableid, notificationid, requestOptions, returnAxios = false }: HighSystemsRequestGetNotification): Promise<HighSystemsResponseGetNotification['results'] | AxiosResponse<HighSystemsResponseGetNotification>> {
		const results = await this.api<HighSystemsResponseGetNotification>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/notifications/${notificationid}`,
			params: { appid, tableid, notificationid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putNotification
	 *
	 * 
	 *
	 * @param options putNotification method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putNotification({ appid, tableid, notificationid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutNotification & { returnAxios?: false }): Promise<HighSystemsResponsePutNotification['results']>;
	public async putNotification({ appid, tableid, notificationid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutNotification & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutNotification>>;
	public async putNotification({ appid, tableid, notificationid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutNotification): Promise<HighSystemsResponsePutNotification['results'] | AxiosResponse<HighSystemsResponsePutNotification>> {
		const results = await this.api<HighSystemsResponsePutNotification>({
			method: 'put',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/notifications/${notificationid}`,
			data: body,
			params: { appid, tableid, notificationid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * postNotification
	 *
	 * 
	 *
	 * @param options postNotification method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postNotification({ relatedTable, appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostNotification & { returnAxios?: false }): Promise<HighSystemsResponsePostNotification['results']>;
	public async postNotification({ relatedTable, appid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostNotification & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostNotification>>;
	public async postNotification({ relatedTable, appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostNotification): Promise<HighSystemsResponsePostNotification['results'] | AxiosResponse<HighSystemsResponsePostNotification>> {
		const results = await this.api<HighSystemsResponsePostNotification>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/tables/${relatedTable}/notifications`,
			data: body,
			params: { relatedTable, appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getWebhooks
	 *
	 * 
	 *
	 * @param options getWebhooks method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getWebhooks({ appid, tableid, requestOptions, returnAxios = false }: HighSystemsRequestGetWebhooks & { returnAxios?: false }): Promise<HighSystemsResponseGetWebhooks['results']>;
	public async getWebhooks({ appid, tableid, requestOptions, returnAxios = true }: HighSystemsRequestGetWebhooks & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetWebhooks>>;
	public async getWebhooks({ appid, tableid, requestOptions, returnAxios = false }: HighSystemsRequestGetWebhooks): Promise<HighSystemsResponseGetWebhooks['results'] | AxiosResponse<HighSystemsResponseGetWebhooks>> {
		const results = await this.api<HighSystemsResponseGetWebhooks>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/webhooks`,
			params: { appid, tableid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * deleteWebhook
	 *
	 * 
	 *
	 * @param options deleteWebhook method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteWebhook({ appid, tableid, webhookid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteWebhook & { returnAxios?: false }): Promise<HighSystemsResponseDeleteWebhook['results']>;
	public async deleteWebhook({ appid, tableid, webhookid, requestOptions, returnAxios = true }: HighSystemsRequestDeleteWebhook & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteWebhook>>;
	public async deleteWebhook({ appid, tableid, webhookid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteWebhook): Promise<HighSystemsResponseDeleteWebhook['results'] | AxiosResponse<HighSystemsResponseDeleteWebhook>> {
		const results = await this.api<HighSystemsResponseDeleteWebhook>({
			method: 'delete',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/webhooks/${webhookid}`,
			params: { appid, tableid, webhookid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getWebhook
	 *
	 * 
	 *
	 * @param options getWebhook method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getWebhook({ appid, tableid, webhookid, requestOptions, returnAxios = false }: HighSystemsRequestGetWebhook & { returnAxios?: false }): Promise<HighSystemsResponseGetWebhook['results']>;
	public async getWebhook({ appid, tableid, webhookid, requestOptions, returnAxios = true }: HighSystemsRequestGetWebhook & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetWebhook>>;
	public async getWebhook({ appid, tableid, webhookid, requestOptions, returnAxios = false }: HighSystemsRequestGetWebhook): Promise<HighSystemsResponseGetWebhook['results'] | AxiosResponse<HighSystemsResponseGetWebhook>> {
		const results = await this.api<HighSystemsResponseGetWebhook>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/webhooks/${webhookid}`,
			params: { appid, tableid, webhookid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putWebhook
	 *
	 * 
	 *
	 * @param options putWebhook method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putWebhook({ appid, tableid, webhookid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutWebhook & { returnAxios?: false }): Promise<HighSystemsResponsePutWebhook['results']>;
	public async putWebhook({ appid, tableid, webhookid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutWebhook & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutWebhook>>;
	public async putWebhook({ appid, tableid, webhookid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutWebhook): Promise<HighSystemsResponsePutWebhook['results'] | AxiosResponse<HighSystemsResponsePutWebhook>> {
		const results = await this.api<HighSystemsResponsePutWebhook>({
			method: 'put',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/webhooks/${webhookid}`,
			data: body,
			params: { appid, tableid, webhookid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * postWebhook
	 *
	 * 
	 *
	 * @param options postWebhook method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postWebhook({ relatedTable, appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostWebhook & { returnAxios?: false }): Promise<HighSystemsResponsePostWebhook['results']>;
	public async postWebhook({ relatedTable, appid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostWebhook & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostWebhook>>;
	public async postWebhook({ relatedTable, appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostWebhook): Promise<HighSystemsResponsePostWebhook['results'] | AxiosResponse<HighSystemsResponsePostWebhook>> {
		const results = await this.api<HighSystemsResponsePostWebhook>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/tables/${relatedTable}/webhooks`,
			data: body,
			params: { relatedTable, appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getFunctions
	 *
	 * 
	 *
	 * @param options getFunctions method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getFunctions({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetFunctions & { returnAxios?: false }): Promise<HighSystemsResponseGetFunctions['results']>;
	public async getFunctions({ appid, requestOptions, returnAxios = true }: HighSystemsRequestGetFunctions & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetFunctions>>;
	public async getFunctions({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetFunctions): Promise<HighSystemsResponseGetFunctions['results'] | AxiosResponse<HighSystemsResponseGetFunctions>> {
		const results = await this.api<HighSystemsResponseGetFunctions>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/functions`,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * postFunction
	 *
	 * 
	 *
	 * @param options postFunction method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postFunction({ appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostFunction & { returnAxios?: false }): Promise<HighSystemsResponsePostFunction['results']>;
	public async postFunction({ appid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostFunction & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostFunction>>;
	public async postFunction({ appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostFunction): Promise<HighSystemsResponsePostFunction['results'] | AxiosResponse<HighSystemsResponsePostFunction>> {
		const results = await this.api<HighSystemsResponsePostFunction>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/functions`,
			data: body,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * deleteFunction
	 *
	 * 
	 *
	 * @param options deleteFunction method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteFunction({ appid, functionid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteFunction & { returnAxios?: false }): Promise<HighSystemsResponseDeleteFunction['results']>;
	public async deleteFunction({ appid, functionid, requestOptions, returnAxios = true }: HighSystemsRequestDeleteFunction & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteFunction>>;
	public async deleteFunction({ appid, functionid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteFunction): Promise<HighSystemsResponseDeleteFunction['results'] | AxiosResponse<HighSystemsResponseDeleteFunction>> {
		const results = await this.api<HighSystemsResponseDeleteFunction>({
			method: 'delete',
			url: `/api/rest/v1/applications/${appid}/functions/${functionid}`,
			params: { appid, functionid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getFunction
	 *
	 * 
	 *
	 * @param options getFunction method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getFunction({ appid, functionid, requestOptions, returnAxios = false }: HighSystemsRequestGetFunction & { returnAxios?: false }): Promise<HighSystemsResponseGetFunction['results']>;
	public async getFunction({ appid, functionid, requestOptions, returnAxios = true }: HighSystemsRequestGetFunction & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetFunction>>;
	public async getFunction({ appid, functionid, requestOptions, returnAxios = false }: HighSystemsRequestGetFunction): Promise<HighSystemsResponseGetFunction['results'] | AxiosResponse<HighSystemsResponseGetFunction>> {
		const results = await this.api<HighSystemsResponseGetFunction>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/functions/${functionid}`,
			params: { appid, functionid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putFunction
	 *
	 * 
	 *
	 * @param options putFunction method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putFunction({ appid, functionid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutFunction & { returnAxios?: false }): Promise<HighSystemsResponsePutFunction['results']>;
	public async putFunction({ appid, functionid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutFunction & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutFunction>>;
	public async putFunction({ appid, functionid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutFunction): Promise<HighSystemsResponsePutFunction['results'] | AxiosResponse<HighSystemsResponsePutFunction>> {
		const results = await this.api<HighSystemsResponsePutFunction>({
			method: 'put',
			url: `/api/rest/v1/applications/${appid}/functions/${functionid}`,
			data: body,
			params: { appid, functionid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getTriggers
	 *
	 * 
	 *
	 * @param options getTriggers method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getTriggers({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetTriggers & { returnAxios?: false }): Promise<HighSystemsResponseGetTriggers['results']>;
	public async getTriggers({ appid, requestOptions, returnAxios = true }: HighSystemsRequestGetTriggers & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetTriggers>>;
	public async getTriggers({ appid, requestOptions, returnAxios = false }: HighSystemsRequestGetTriggers): Promise<HighSystemsResponseGetTriggers['results'] | AxiosResponse<HighSystemsResponseGetTriggers>> {
		const results = await this.api<HighSystemsResponseGetTriggers>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/triggers`,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * postTrigger
	 *
	 * 
	 *
	 * @param options postTrigger method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postTrigger({ appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostTrigger & { returnAxios?: false }): Promise<HighSystemsResponsePostTrigger['results']>;
	public async postTrigger({ appid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostTrigger & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostTrigger>>;
	public async postTrigger({ appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostTrigger): Promise<HighSystemsResponsePostTrigger['results'] | AxiosResponse<HighSystemsResponsePostTrigger>> {
		const results = await this.api<HighSystemsResponsePostTrigger>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/triggers`,
			data: body,
			params: { appid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * deleteTrigger
	 *
	 * 
	 *
	 * @param options deleteTrigger method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteTrigger({ appid, triggerid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteTrigger & { returnAxios?: false }): Promise<HighSystemsResponseDeleteTrigger['results']>;
	public async deleteTrigger({ appid, triggerid, requestOptions, returnAxios = true }: HighSystemsRequestDeleteTrigger & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteTrigger>>;
	public async deleteTrigger({ appid, triggerid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteTrigger): Promise<HighSystemsResponseDeleteTrigger['results'] | AxiosResponse<HighSystemsResponseDeleteTrigger>> {
		const results = await this.api<HighSystemsResponseDeleteTrigger>({
			method: 'delete',
			url: `/api/rest/v1/applications/${appid}/triggers/${triggerid}`,
			params: { appid, triggerid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getTrigger
	 *
	 * 
	 *
	 * @param options getTrigger method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getTrigger({ appid, triggerid, requestOptions, returnAxios = false }: HighSystemsRequestGetTrigger & { returnAxios?: false }): Promise<HighSystemsResponseGetTrigger['results']>;
	public async getTrigger({ appid, triggerid, requestOptions, returnAxios = true }: HighSystemsRequestGetTrigger & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetTrigger>>;
	public async getTrigger({ appid, triggerid, requestOptions, returnAxios = false }: HighSystemsRequestGetTrigger): Promise<HighSystemsResponseGetTrigger['results'] | AxiosResponse<HighSystemsResponseGetTrigger>> {
		const results = await this.api<HighSystemsResponseGetTrigger>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/triggers/${triggerid}`,
			params: { appid, triggerid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putTrigger
	 *
	 * 
	 *
	 * @param options putTrigger method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putTrigger({ appid, triggerid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutTrigger & { returnAxios?: false }): Promise<HighSystemsResponsePutTrigger['results']>;
	public async putTrigger({ appid, triggerid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutTrigger & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutTrigger>>;
	public async putTrigger({ appid, triggerid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutTrigger): Promise<HighSystemsResponsePutTrigger['results'] | AxiosResponse<HighSystemsResponsePutTrigger>> {
		const results = await this.api<HighSystemsResponsePutTrigger>({
			method: 'put',
			url: `/api/rest/v1/applications/${appid}/triggers/${triggerid}`,
			data: body,
			params: { appid, triggerid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getRecords
	 *
	 * 
	 *
	 * @param options getRecords method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getRecords({ type, query, columns, summarize, grouping, sorting, page, mergeQuery, appid, tableid, reportid, requestOptions, returnAxios = false }: HighSystemsRequestGetRecords & { returnAxios?: false }): Promise<HighSystemsResponseGetRecords['results']>;
	public async getRecords({ type, query, columns, summarize, grouping, sorting, page, mergeQuery, appid, tableid, reportid, requestOptions, returnAxios = true }: HighSystemsRequestGetRecords & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetRecords>>;
	public async getRecords({ type, query, columns, summarize, grouping, sorting, page, mergeQuery, appid, tableid, reportid, requestOptions, returnAxios = false }: HighSystemsRequestGetRecords): Promise<HighSystemsResponseGetRecords['results'] | AxiosResponse<HighSystemsResponseGetRecords>> {
		const results = await this.api<HighSystemsResponseGetRecords>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/records`,
			params: { type, query, columns, summarize, grouping, sorting, page, mergeQuery, appid, tableid, reportid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * postRecord
	 *
	 * 
	 *
	 * @param options postRecord method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postRecord({ appid, tableid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostRecord & { returnAxios?: false }): Promise<HighSystemsResponsePostRecord['results']>;
	public async postRecord({ appid, tableid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostRecord & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostRecord>>;
	public async postRecord({ appid, tableid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostRecord): Promise<HighSystemsResponsePostRecord['results'] | AxiosResponse<HighSystemsResponsePostRecord>> {
		const results = await this.api<HighSystemsResponsePostRecord>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/records`,
			data: body,
			params: { appid, tableid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getRecordsCount
	 *
	 * 
	 *
	 * @param options getRecordsCount method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getRecordsCount({ appid, tableid, reportid, query, mergeQuery, requestOptions, returnAxios = false }: HighSystemsRequestGetRecordsCount & { returnAxios?: false }): Promise<HighSystemsResponseGetRecordsCount['results']>;
	public async getRecordsCount({ appid, tableid, reportid, query, mergeQuery, requestOptions, returnAxios = true }: HighSystemsRequestGetRecordsCount & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetRecordsCount>>;
	public async getRecordsCount({ appid, tableid, reportid, query, mergeQuery, requestOptions, returnAxios = false }: HighSystemsRequestGetRecordsCount): Promise<HighSystemsResponseGetRecordsCount['results'] | AxiosResponse<HighSystemsResponseGetRecordsCount>> {
		const results = await this.api<HighSystemsResponseGetRecordsCount>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/records/count`,
			params: { appid, tableid, reportid, query, mergeQuery }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getRecordsTotals
	 *
	 * 
	 *
	 * @param options getRecordsTotals method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getRecordsTotals({ type, query, totals, columns, summarize, grouping, sorting, page, mergeQuery, appid, tableid, reportid, requestOptions, returnAxios = false }: HighSystemsRequestGetRecordsTotals & { returnAxios?: false }): Promise<HighSystemsResponseGetRecordsTotals['results']>;
	public async getRecordsTotals({ type, query, totals, columns, summarize, grouping, sorting, page, mergeQuery, appid, tableid, reportid, requestOptions, returnAxios = true }: HighSystemsRequestGetRecordsTotals & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetRecordsTotals>>;
	public async getRecordsTotals({ type, query, totals, columns, summarize, grouping, sorting, page, mergeQuery, appid, tableid, reportid, requestOptions, returnAxios = false }: HighSystemsRequestGetRecordsTotals): Promise<HighSystemsResponseGetRecordsTotals['results'] | AxiosResponse<HighSystemsResponseGetRecordsTotals>> {
		const results = await this.api<HighSystemsResponseGetRecordsTotals>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/records/totals`,
			params: { type, query, totals, columns, summarize, grouping, sorting, page, mergeQuery, appid, tableid, reportid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * deleteRecord
	 *
	 * 
	 *
	 * @param options deleteRecord method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteRecord({ appid, tableid, recordid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteRecord & { returnAxios?: false }): Promise<HighSystemsResponseDeleteRecord['results']>;
	public async deleteRecord({ appid, tableid, recordid, requestOptions, returnAxios = true }: HighSystemsRequestDeleteRecord & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteRecord>>;
	public async deleteRecord({ appid, tableid, recordid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteRecord): Promise<HighSystemsResponseDeleteRecord['results'] | AxiosResponse<HighSystemsResponseDeleteRecord>> {
		const results = await this.api<HighSystemsResponseDeleteRecord>({
			method: 'delete',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/records/${recordid}`,
			params: { appid, tableid, recordid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getRecord
	 *
	 * 
	 *
	 * @param options getRecord method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getRecord({ appid, tableid, recordid, clist, requestOptions, returnAxios = false }: HighSystemsRequestGetRecord & { returnAxios?: false }): Promise<HighSystemsResponseGetRecord['results']>;
	public async getRecord({ appid, tableid, recordid, clist, requestOptions, returnAxios = true }: HighSystemsRequestGetRecord & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetRecord>>;
	public async getRecord({ appid, tableid, recordid, clist, requestOptions, returnAxios = false }: HighSystemsRequestGetRecord): Promise<HighSystemsResponseGetRecord['results'] | AxiosResponse<HighSystemsResponseGetRecord>> {
		const results = await this.api<HighSystemsResponseGetRecord>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/records/${recordid}`,
			params: { appid, tableid, recordid, clist }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putRecord
	 *
	 * 
	 *
	 * @param options putRecord method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putRecord({ appid, tableid, id, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutRecord & { returnAxios?: false }): Promise<HighSystemsResponsePutRecord['results']>;
	public async putRecord({ appid, tableid, id, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutRecord & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutRecord>>;
	public async putRecord({ appid, tableid, id, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutRecord): Promise<HighSystemsResponsePutRecord['results'] | AxiosResponse<HighSystemsResponsePutRecord>> {
		const results = await this.api<HighSystemsResponsePutRecord>({
			method: 'put',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/records/${id}`,
			data: body,
			params: { appid, tableid, id }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * upsertRecords
	 *
	 * 
	 *
	 * @param options upsertRecords method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async upsertRecords({ appid, tableid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestUpsertRecords & { returnAxios?: false }): Promise<HighSystemsResponseUpsertRecords['results']>;
	public async upsertRecords({ appid, tableid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestUpsertRecords & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseUpsertRecords>>;
	public async upsertRecords({ appid, tableid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestUpsertRecords): Promise<HighSystemsResponseUpsertRecords['results'] | AxiosResponse<HighSystemsResponseUpsertRecords>> {
		const results = await this.api<HighSystemsResponseUpsertRecords>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/records/upsert`,
			data: body,
			params: { appid, tableid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * calculateRecordFormulas
	 *
	 * 
	 *
	 * @param options calculateRecordFormulas method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async calculateRecordFormulas({ appid, tableid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestCalculateRecordFormulas & { returnAxios?: false }): Promise<HighSystemsResponseCalculateRecordFormulas['results']>;
	public async calculateRecordFormulas({ appid, tableid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestCalculateRecordFormulas & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseCalculateRecordFormulas>>;
	public async calculateRecordFormulas({ appid, tableid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestCalculateRecordFormulas): Promise<HighSystemsResponseCalculateRecordFormulas['results'] | AxiosResponse<HighSystemsResponseCalculateRecordFormulas>> {
		const results = await this.api<HighSystemsResponseCalculateRecordFormulas>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/calculate-formulas`,
			data: body,
			params: { appid, tableid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getFile
	 *
	 * 
	 *
	 * @param options getFile method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getFile({ appid, tableid, recordid, fieldid, requestOptions, returnAxios = false }: HighSystemsRequestGetFile & { returnAxios?: false }): Promise<HighSystemsResponseGetFile['results']>;
	public async getFile({ appid, tableid, recordid, fieldid, requestOptions, returnAxios = true }: HighSystemsRequestGetFile & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetFile>>;
	public async getFile({ appid, tableid, recordid, fieldid, requestOptions, returnAxios = false }: HighSystemsRequestGetFile): Promise<HighSystemsResponseGetFile['results'] | AxiosResponse<HighSystemsResponseGetFile>> {
		const results = await this.api<HighSystemsResponseGetFile>({
			method: 'get',
			url: `/api/rest/v1/files/${appid}/${tableid}/${recordid}/${fieldid}`,
			params: { appid, tableid, recordid, fieldid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getPresignedFileUrl
	 *
	 * 
	 *
	 * @param options getPresignedFileUrl method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getPresignedFileUrl({ appid, tableid, recordid, fieldid, pageid, logo, action, contentType, responseDisposition, responseType, requestOptions, returnAxios = false }: HighSystemsRequestGetPresignedFileUrl & { returnAxios?: false }): Promise<HighSystemsResponseGetPresignedFileUrl['results']>;
	public async getPresignedFileUrl({ appid, tableid, recordid, fieldid, pageid, logo, action, contentType, responseDisposition, responseType, requestOptions, returnAxios = true }: HighSystemsRequestGetPresignedFileUrl & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetPresignedFileUrl>>;
	public async getPresignedFileUrl({ appid, tableid, recordid, fieldid, pageid, logo, action, contentType, responseDisposition, responseType, requestOptions, returnAxios = false }: HighSystemsRequestGetPresignedFileUrl): Promise<HighSystemsResponseGetPresignedFileUrl['results'] | AxiosResponse<HighSystemsResponseGetPresignedFileUrl>> {
		const results = await this.api<HighSystemsResponseGetPresignedFileUrl>({
			method: 'get',
			url: `/api/rest/v1/files/presigned`,
			params: { appid, tableid, recordid, fieldid, pageid, logo, action, contentType, responseDisposition, responseType }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * finalizeFileUpload
	 *
	 * 
	 *
	 * @param options finalizeFileUpload method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async finalizeFileUpload({ appid, tableid, recordid, fieldid, tmpLocation, size, filename, requestOptions, returnAxios = false }: HighSystemsRequestFinalizeFileUpload & { returnAxios?: false }): Promise<HighSystemsResponseFinalizeFileUpload['results']>;
	public async finalizeFileUpload({ appid, tableid, recordid, fieldid, tmpLocation, size, filename, requestOptions, returnAxios = true }: HighSystemsRequestFinalizeFileUpload & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseFinalizeFileUpload>>;
	public async finalizeFileUpload({ appid, tableid, recordid, fieldid, tmpLocation, size, filename, requestOptions, returnAxios = false }: HighSystemsRequestFinalizeFileUpload): Promise<HighSystemsResponseFinalizeFileUpload['results'] | AxiosResponse<HighSystemsResponseFinalizeFileUpload>> {
		const results = await this.api<HighSystemsResponseFinalizeFileUpload>({
			method: 'get',
			url: `/api/rest/v1/files/finalize`,
			params: { appid, tableid, recordid, fieldid, tmpLocation, size, filename }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

}

/* Types */
export type HighSystemsOptions = Partial<{
	/**
	 * High Systems Instance.
	 *
	 * For example, if your High Systems url is: `demo.highsystems.io`
	 * Your instance is: `demo`
	 */
	instance: string;

	/**
	 * A High Systems User Token.
	 *
	 * If both a `userToken` and `tempToken` are defined, the `tempToken` will be used
	 *
	 * [High Systems Documentation](https://developer.highsystems.io/auth)
	 */
	userToken: string;

	/**
	 * Provide a custom User-Agent to help track API usage within your logs
	 *
	 * When used in the browser, this sets the X-User-Agent header instead
	 * as the browser will block any attempt to set a custom User-Agent
	 */
	userAgent: string;

	/**
	 * The maximum number of open, pending API connections to High Systems
	 *
	 * Default is `10`
	 */
	connectionLimit: number;

	/**
	 * The period length, in milliseconds, of connection limit
	 *
	 * Default is `1000`
	 */
	connectionLimitPeriod: number;

	/**
	 * Throw an error if the connection limit is exceeded
	 *
	 * Default is `false`
	 */
	errorOnConnectionLimit: boolean;

	/**
	 * Allows the use of a proxy for High Systems API requests
	 *
	 * Default is `false`
	 */
	proxy: false | {
		host: string;
		port: number;
		auth?: {
			username: string;
			password: string;
		}
	}
}>;

export type HighSystemsRequest = {
	requestOptions?: AxiosRequestConfig;
	returnAxios?: boolean;
};

export type HighSystemsRequestGetTransaction = HighSystemsRequest & {
};

export type HighSystemsRequestDeleteTransaction = HighSystemsRequest & {
	id: any;
};

export type HighSystemsRequestPostTransaction = HighSystemsRequest & {
	id: any;
};

export type HighSystemsRequestGetRealmSettings = HighSystemsRequest & {
};

export type HighSystemsRequestPutRealmSettings = HighSystemsRequest & {

};

export type HighSystemsRequestGetUsers = HighSystemsRequest & {
};

export type HighSystemsRequestPostUser = HighSystemsRequest & {
	email: string;
	password?: string;
	firstName?: string;
	middleName?: string;
	lastName?: string;
	isRealmAdmin?: boolean;
	isRealmLimitedAdmin?: boolean;
	reset?: boolean;
	valid?: boolean;
	twoFactorEnabled?: boolean;
	sendEmail?: boolean;
};

export type HighSystemsRequestDeleteUser = HighSystemsRequest & {
	userid: any;
};

export type HighSystemsRequestGetUser = HighSystemsRequest & {
	userid: any;
};

export type HighSystemsRequestPutUser = HighSystemsRequest & {
	userid: any;
	email: string;
	password: string;
	firstName: string;
	middleName: string;
	lastName: string;
	isRealmAdmin: boolean;
	isRealmLimitedAdmin: boolean;
	reset: boolean;
	valid: boolean;
	twoFactorEnabled: boolean;
};

export type HighSystemsRequestGetUserTokens = HighSystemsRequest & {
	userid: any;
};

export type HighSystemsRequestPostUserToken = HighSystemsRequest & {
	userid: any;
	name: string;
	description?: string;
	applications?: string[];
	active: boolean;
};

export type HighSystemsRequestDeleteUserToken = HighSystemsRequest & {
	userid: any;
	tokenid: any;
};

export type HighSystemsRequestGetUserToken = HighSystemsRequest & {
	userid: any;
	tokenid: any;
};

export type HighSystemsRequestPutUserToken = HighSystemsRequest & {
	tokenid: any;
	userid: any;
	name: string;
	description: string;
	applications: string[];
	active: boolean;
};

export type HighSystemsRequestGetApplications = HighSystemsRequest & {
};

export type HighSystemsRequestPostApplication = HighSystemsRequest & {
	icon?: '' | 'AcademicCapIcon' | 'AdjustmentsHorizontalIcon' | 'AdjustmentsVerticalIcon' | 'ArchiveBoxArrowDownIcon' | 'ArchiveBoxXMarkIcon' | 'ArchiveBoxIcon' | 'ArrowDownCircleIcon' | 'ArrowDownLeftIcon' | 'ArrowDownOnSquareStackIcon' | 'ArrowDownOnSquareIcon' | 'ArrowDownRightIcon' | 'ArrowDownTrayIcon' | 'ArrowDownIcon' | 'ArrowLeftCircleIcon' | 'ArrowLeftOnRectangleIcon' | 'ArrowLeftIcon' | 'ArrowLongDownIcon' | 'ArrowLongLeftIcon' | 'ArrowLongRightIcon' | 'ArrowLongUpIcon' | 'ArrowPathRoundedSquareIcon' | 'ArrowPathIcon' | 'ArrowRightCircleIcon' | 'ArrowRightOnRectangleIcon' | 'ArrowRightIcon' | 'ArrowSmallDownIcon' | 'ArrowSmallLeftIcon' | 'ArrowSmallRightIcon' | 'ArrowSmallUpIcon' | 'ArrowTopRightOnSquareIcon' | 'ArrowTrendingDownIcon' | 'ArrowTrendingUpIcon' | 'ArrowUpCircleIcon' | 'ArrowUpLeftIcon' | 'ArrowUpOnSquareStackIcon' | 'ArrowUpOnSquareIcon' | 'ArrowUpRightIcon' | 'ArrowUpTrayIcon' | 'ArrowUpIcon' | 'ArrowUturnDownIcon' | 'ArrowUturnLeftIcon' | 'ArrowUturnRightIcon' | 'ArrowUturnUpIcon' | 'ArrowsPointingInIcon' | 'ArrowsPointingOutIcon' | 'ArrowsRightLeftIcon' | 'ArrowsUpDownIcon' | 'AtSymbolIcon' | 'BackspaceIcon' | 'BackwardIcon' | 'BanknotesIcon' | 'Bars2Icon' | 'Bars3BottomLeftIcon' | 'Bars3BottomRightIcon' | 'Bars3CenterLeftIcon' | 'Bars3Icon' | 'Bars4Icon' | 'BarsArrowDownIcon' | 'BarsArrowUpIcon' | 'Battery0Icon' | 'Battery100Icon' | 'Battery50Icon' | 'BeakerIcon' | 'BellAlertIcon' | 'BellSlashIcon' | 'BellSnoozeIcon' | 'BellIcon' | 'BoltSlashIcon' | 'BoltIcon' | 'BookOpenIcon' | 'BookmarkSlashIcon' | 'BookmarkSquareIcon' | 'BookmarkIcon' | 'BriefcaseIcon' | 'BugAntIcon' | 'BuildingLibraryIcon' | 'BuildingOffice2Icon' | 'BuildingOfficeIcon' | 'BuildingStorefrontIcon' | 'CakeIcon' | 'CalculatorIcon' | 'CalendarDaysIcon' | 'CalendarIcon' | 'CameraIcon' | 'ChartBarSquareIcon' | 'ChartBarIcon' | 'ChartPieIcon' | 'ChatBubbleBottomCenterTextIcon' | 'ChatBubbleBottomCenterIcon' | 'ChatBubbleLeftEllipsisIcon' | 'ChatBubbleLeftRightIcon' | 'ChatBubbleLeftIcon' | 'ChatBubbleOvalLeftEllipsisIcon' | 'ChatBubbleOvalLeftIcon' | 'CheckBadgeIcon' | 'CheckCircleIcon' | 'CheckIcon' | 'ChevronDoubleDownIcon' | 'ChevronDoubleLeftIcon' | 'ChevronDoubleRightIcon' | 'ChevronDoubleUpIcon' | 'ChevronDownIcon' | 'ChevronLeftIcon' | 'ChevronRightIcon' | 'ChevronUpDownIcon' | 'ChevronUpIcon' | 'CircleStackIcon' | 'ClipboardDocumentCheckIcon' | 'ClipboardDocumentListIcon' | 'ClipboardDocumentIcon' | 'ClipboardIcon' | 'ClockIcon' | 'CloudArrowDownIcon' | 'CloudArrowUpIcon' | 'CloudIcon' | 'CodeBracketSquareIcon' | 'CodeBracketIcon' | 'Cog6ToothIcon' | 'Cog8ToothIcon' | 'CogIcon' | 'CommandLineIcon' | 'ComputerDesktopIcon' | 'CpuChipIcon' | 'CreditCardIcon' | 'CubeTransparentIcon' | 'CubeIcon' | 'CurrencyBangladeshiIcon' | 'CurrencyDollarIcon' | 'CurrencyEuroIcon' | 'CurrencyPoundIcon' | 'CurrencyRupeeIcon' | 'CurrencyYenIcon' | 'CursorArrowRaysIcon' | 'CursorArrowRippleIcon' | 'DevicePhoneMobileIcon' | 'DeviceTabletIcon' | 'DocumentArrowDownIcon' | 'DocumentArrowUpIcon' | 'DocumentChartBarIcon' | 'DocumentCheckIcon' | 'DocumentDuplicateIcon' | 'DocumentMagnifyingGlassIcon' | 'DocumentMinusIcon' | 'DocumentPlusIcon' | 'DocumentTextIcon' | 'DocumentIcon' | 'EllipsisHorizontalCircleIcon' | 'EllipsisHorizontalIcon' | 'EllipsisVerticalIcon' | 'EnvelopeOpenIcon' | 'EnvelopeIcon' | 'ExclamationCircleIcon' | 'ExclamationTriangleIcon' | 'EyeDropperIcon' | 'EyeSlashIcon' | 'EyeIcon' | 'FaceFrownIcon' | 'FaceSmileIcon' | 'FilmIcon' | 'FingerPrintIcon' | 'FireIcon' | 'FlagIcon' | 'FolderArrowDownIcon' | 'FolderMinusIcon' | 'FolderOpenIcon' | 'FolderPlusIcon' | 'FolderIcon' | 'ForwardIcon' | 'FunnelIcon' | 'GifIcon' | 'GiftTopIcon' | 'GiftIcon' | 'GlobeAltIcon' | 'GlobeAmericasIcon' | 'GlobeAsiaAustraliaIcon' | 'GlobeEuropeAfricaIcon' | 'HandRaisedIcon' | 'HandThumbDownIcon' | 'HandThumbUpIcon' | 'HashtagIcon' | 'HeartIcon' | 'HomeModernIcon' | 'HomeIcon' | 'IdentificationIcon' | 'InboxArrowDownIcon' | 'InboxStackIcon' | 'InboxIcon' | 'InformationCircleIcon' | 'KeyIcon' | 'LanguageIcon' | 'LifebuoyIcon' | 'LightBulbIcon' | 'LinkIcon' | 'ListBulletIcon' | 'LockClosedIcon' | 'LockOpenIcon' | 'MagnifyingGlassCircleIcon' | 'MagnifyingGlassMinusIcon' | 'MagnifyingGlassPlusIcon' | 'MagnifyingGlassIcon' | 'MapPinIcon' | 'MapIcon' | 'MegaphoneIcon' | 'MicrophoneIcon' | 'MinusCircleIcon' | 'MinusSmallIcon' | 'MinusIcon' | 'MoonIcon' | 'MusicalNoteIcon' | 'NewspaperIcon' | 'NoSymbolIcon' | 'PaintBrushIcon' | 'PaperAirplaneIcon' | 'PaperClipIcon' | 'PauseCircleIcon' | 'PauseIcon' | 'PencilSquareIcon' | 'PencilIcon' | 'PhoneArrowDownLeftIcon' | 'PhoneArrowUpRightIcon' | 'PhoneXMarkIcon' | 'PhoneIcon' | 'PhotoIcon' | 'PlayCircleIcon' | 'PlayPauseIcon' | 'PlayIcon' | 'PlusCircleIcon' | 'PlusSmallIcon' | 'PlusIcon' | 'PowerIcon' | 'PresentationChartBarIcon' | 'PresentationChartLineIcon' | 'PrinterIcon' | 'PuzzlePieceIcon' | 'QrCodeIcon' | 'QuestionMarkCircleIcon' | 'QueueListIcon' | 'RadioIcon' | 'ReceiptPercentIcon' | 'ReceiptRefundIcon' | 'RectangleGroupIcon' | 'RectangleStackIcon' | 'RocketLaunchIcon' | 'RssIcon' | 'ScaleIcon' | 'ScissorsIcon' | 'ServerStackIcon' | 'ServerIcon' | 'ShareIcon' | 'ShieldCheckIcon' | 'ShieldExclamationIcon' | 'ShoppingBagIcon' | 'ShoppingCartIcon' | 'SignalSlashIcon' | 'SignalIcon' | 'SparklesIcon' | 'SpeakerWaveIcon' | 'SpeakerXMarkIcon' | 'Square2StackIcon' | 'Square3Stack3DIcon' | 'Squares2X2Icon' | 'SquaresPlusIcon' | 'StarIcon' | 'StopCircleIcon' | 'StopIcon' | 'SunIcon' | 'SwatchIcon' | 'TableCellsIcon' | 'TagIcon' | 'TicketIcon' | 'TrashIcon' | 'TrophyIcon' | 'TruckIcon' | 'TvIcon' | 'UserCircleIcon' | 'UserGroupIcon' | 'UserMinusIcon' | 'UserPlusIcon' | 'UserIcon' | 'UsersIcon' | 'VariableIcon' | 'VideoCameraSlashIcon' | 'VideoCameraIcon' | 'ViewColumnsIcon' | 'ViewfinderCircleIcon' | 'WalletIcon' | 'WifiIcon' | 'WindowIcon' | 'WrenchScrewdriverIcon' | 'WrenchIcon' | 'XCircleIcon' | 'XMarkIcon';
	name: string;
	description?: string;
	dateFormat: string;
	datetimeFormat: string;
	timeFormat: string;
	defaultCurrency?: 'AED' | 'AFN' | 'ALL' | 'AMD' | 'ANG' | 'AOA' | 'ARS' | 'AUD' | 'AWG' | 'AZN' | 'BAM' | 'BBD' | 'BDT' | 'BGN' | 'BHD' | 'BIF' | 'BMD' | 'BND' | 'BOB' | 'BOV' | 'BRL' | 'BSD' | 'BTN' | 'BWP' | 'BYN' | 'BZD' | 'CAD' | 'CDF' | 'CHE' | 'CHF' | 'CHW' | 'CLF' | 'CLP' | 'COP' | 'COU' | 'CRC' | 'CUP' | 'CVE' | 'CZK' | 'DJF' | 'DKK' | 'DOP' | 'DZD' | 'EGP' | 'ERN' | 'ETB' | 'EUR' | 'FJD' | 'FKP' | 'GBP' | 'GEL' | 'GHS' | 'GIP' | 'GMD' | 'GNF' | 'GTQ' | 'GYD' | 'HKD' | 'HNL' | 'HTG' | 'HUF' | 'IDR' | 'ILS' | 'INR' | 'IQD' | 'IRR' | 'ISK' | 'JMD' | 'JOD' | 'JPY' | 'KES' | 'KGS' | 'KHR' | 'KMF' | 'KPW' | 'KRW' | 'KWD' | 'KYD' | 'KZT' | 'LAK' | 'LBP' | 'LKR' | 'LRD' | 'LSL' | 'LYD' | 'MAD' | 'MDL' | 'MGA' | 'MKD' | 'MMK' | 'MNT' | 'MOP' | 'MRU' | 'MUR' | 'MVR' | 'MWK' | 'MXN' | 'MXV' | 'MYR' | 'MZN' | 'NAD' | 'NGN' | 'NIO' | 'NOK' | 'NPR' | 'NZD' | 'OMR' | 'PAB' | 'PEN' | 'PGK' | 'PHP' | 'PKR' | 'PLN' | 'PYG' | 'QAR' | 'RON' | 'RSD' | 'CNY' | 'RUB' | 'RWF' | 'SAR' | 'SBD' | 'SCR' | 'SDG' | 'SEK' | 'SGD' | 'SHP' | 'SLE' | 'SLL' | 'SOS' | 'SRD' | 'SSP' | 'STN' | 'SVC' | 'SYP' | 'SZL' | 'THB' | 'TJS' | 'TMT' | 'TND' | 'TOP' | 'TRY' | 'TTD' | 'TWD' | 'TZS' | 'UAH' | 'UGX' | 'USD' | 'USN' | 'UYI' | 'UYU' | 'UYW' | 'UZS' | 'VED' | 'VES' | 'VND' | 'VUV' | 'WST' | 'XAF' | 'XAG' | 'XAU' | 'XBA' | 'XBB' | 'XBC' | 'XBD' | 'XCD' | 'XDR' | 'XOF' | 'XPD' | 'XPF' | 'XPT' | 'XSU' | 'XTS' | 'XUA' | 'XXX' | 'YER' | 'ZAR' | 'ZMW' | 'ZWL';
};

export type HighSystemsRequestDeleteApplication = HighSystemsRequest & {
	appid: any;
};

export type HighSystemsRequestGetApplication = HighSystemsRequest & {
	appid: any;
};

export type HighSystemsRequestPutApplication = HighSystemsRequest & {
	appid: any;
	icon: '' | 'AcademicCapIcon' | 'AdjustmentsHorizontalIcon' | 'AdjustmentsVerticalIcon' | 'ArchiveBoxArrowDownIcon' | 'ArchiveBoxXMarkIcon' | 'ArchiveBoxIcon' | 'ArrowDownCircleIcon' | 'ArrowDownLeftIcon' | 'ArrowDownOnSquareStackIcon' | 'ArrowDownOnSquareIcon' | 'ArrowDownRightIcon' | 'ArrowDownTrayIcon' | 'ArrowDownIcon' | 'ArrowLeftCircleIcon' | 'ArrowLeftOnRectangleIcon' | 'ArrowLeftIcon' | 'ArrowLongDownIcon' | 'ArrowLongLeftIcon' | 'ArrowLongRightIcon' | 'ArrowLongUpIcon' | 'ArrowPathRoundedSquareIcon' | 'ArrowPathIcon' | 'ArrowRightCircleIcon' | 'ArrowRightOnRectangleIcon' | 'ArrowRightIcon' | 'ArrowSmallDownIcon' | 'ArrowSmallLeftIcon' | 'ArrowSmallRightIcon' | 'ArrowSmallUpIcon' | 'ArrowTopRightOnSquareIcon' | 'ArrowTrendingDownIcon' | 'ArrowTrendingUpIcon' | 'ArrowUpCircleIcon' | 'ArrowUpLeftIcon' | 'ArrowUpOnSquareStackIcon' | 'ArrowUpOnSquareIcon' | 'ArrowUpRightIcon' | 'ArrowUpTrayIcon' | 'ArrowUpIcon' | 'ArrowUturnDownIcon' | 'ArrowUturnLeftIcon' | 'ArrowUturnRightIcon' | 'ArrowUturnUpIcon' | 'ArrowsPointingInIcon' | 'ArrowsPointingOutIcon' | 'ArrowsRightLeftIcon' | 'ArrowsUpDownIcon' | 'AtSymbolIcon' | 'BackspaceIcon' | 'BackwardIcon' | 'BanknotesIcon' | 'Bars2Icon' | 'Bars3BottomLeftIcon' | 'Bars3BottomRightIcon' | 'Bars3CenterLeftIcon' | 'Bars3Icon' | 'Bars4Icon' | 'BarsArrowDownIcon' | 'BarsArrowUpIcon' | 'Battery0Icon' | 'Battery100Icon' | 'Battery50Icon' | 'BeakerIcon' | 'BellAlertIcon' | 'BellSlashIcon' | 'BellSnoozeIcon' | 'BellIcon' | 'BoltSlashIcon' | 'BoltIcon' | 'BookOpenIcon' | 'BookmarkSlashIcon' | 'BookmarkSquareIcon' | 'BookmarkIcon' | 'BriefcaseIcon' | 'BugAntIcon' | 'BuildingLibraryIcon' | 'BuildingOffice2Icon' | 'BuildingOfficeIcon' | 'BuildingStorefrontIcon' | 'CakeIcon' | 'CalculatorIcon' | 'CalendarDaysIcon' | 'CalendarIcon' | 'CameraIcon' | 'ChartBarSquareIcon' | 'ChartBarIcon' | 'ChartPieIcon' | 'ChatBubbleBottomCenterTextIcon' | 'ChatBubbleBottomCenterIcon' | 'ChatBubbleLeftEllipsisIcon' | 'ChatBubbleLeftRightIcon' | 'ChatBubbleLeftIcon' | 'ChatBubbleOvalLeftEllipsisIcon' | 'ChatBubbleOvalLeftIcon' | 'CheckBadgeIcon' | 'CheckCircleIcon' | 'CheckIcon' | 'ChevronDoubleDownIcon' | 'ChevronDoubleLeftIcon' | 'ChevronDoubleRightIcon' | 'ChevronDoubleUpIcon' | 'ChevronDownIcon' | 'ChevronLeftIcon' | 'ChevronRightIcon' | 'ChevronUpDownIcon' | 'ChevronUpIcon' | 'CircleStackIcon' | 'ClipboardDocumentCheckIcon' | 'ClipboardDocumentListIcon' | 'ClipboardDocumentIcon' | 'ClipboardIcon' | 'ClockIcon' | 'CloudArrowDownIcon' | 'CloudArrowUpIcon' | 'CloudIcon' | 'CodeBracketSquareIcon' | 'CodeBracketIcon' | 'Cog6ToothIcon' | 'Cog8ToothIcon' | 'CogIcon' | 'CommandLineIcon' | 'ComputerDesktopIcon' | 'CpuChipIcon' | 'CreditCardIcon' | 'CubeTransparentIcon' | 'CubeIcon' | 'CurrencyBangladeshiIcon' | 'CurrencyDollarIcon' | 'CurrencyEuroIcon' | 'CurrencyPoundIcon' | 'CurrencyRupeeIcon' | 'CurrencyYenIcon' | 'CursorArrowRaysIcon' | 'CursorArrowRippleIcon' | 'DevicePhoneMobileIcon' | 'DeviceTabletIcon' | 'DocumentArrowDownIcon' | 'DocumentArrowUpIcon' | 'DocumentChartBarIcon' | 'DocumentCheckIcon' | 'DocumentDuplicateIcon' | 'DocumentMagnifyingGlassIcon' | 'DocumentMinusIcon' | 'DocumentPlusIcon' | 'DocumentTextIcon' | 'DocumentIcon' | 'EllipsisHorizontalCircleIcon' | 'EllipsisHorizontalIcon' | 'EllipsisVerticalIcon' | 'EnvelopeOpenIcon' | 'EnvelopeIcon' | 'ExclamationCircleIcon' | 'ExclamationTriangleIcon' | 'EyeDropperIcon' | 'EyeSlashIcon' | 'EyeIcon' | 'FaceFrownIcon' | 'FaceSmileIcon' | 'FilmIcon' | 'FingerPrintIcon' | 'FireIcon' | 'FlagIcon' | 'FolderArrowDownIcon' | 'FolderMinusIcon' | 'FolderOpenIcon' | 'FolderPlusIcon' | 'FolderIcon' | 'ForwardIcon' | 'FunnelIcon' | 'GifIcon' | 'GiftTopIcon' | 'GiftIcon' | 'GlobeAltIcon' | 'GlobeAmericasIcon' | 'GlobeAsiaAustraliaIcon' | 'GlobeEuropeAfricaIcon' | 'HandRaisedIcon' | 'HandThumbDownIcon' | 'HandThumbUpIcon' | 'HashtagIcon' | 'HeartIcon' | 'HomeModernIcon' | 'HomeIcon' | 'IdentificationIcon' | 'InboxArrowDownIcon' | 'InboxStackIcon' | 'InboxIcon' | 'InformationCircleIcon' | 'KeyIcon' | 'LanguageIcon' | 'LifebuoyIcon' | 'LightBulbIcon' | 'LinkIcon' | 'ListBulletIcon' | 'LockClosedIcon' | 'LockOpenIcon' | 'MagnifyingGlassCircleIcon' | 'MagnifyingGlassMinusIcon' | 'MagnifyingGlassPlusIcon' | 'MagnifyingGlassIcon' | 'MapPinIcon' | 'MapIcon' | 'MegaphoneIcon' | 'MicrophoneIcon' | 'MinusCircleIcon' | 'MinusSmallIcon' | 'MinusIcon' | 'MoonIcon' | 'MusicalNoteIcon' | 'NewspaperIcon' | 'NoSymbolIcon' | 'PaintBrushIcon' | 'PaperAirplaneIcon' | 'PaperClipIcon' | 'PauseCircleIcon' | 'PauseIcon' | 'PencilSquareIcon' | 'PencilIcon' | 'PhoneArrowDownLeftIcon' | 'PhoneArrowUpRightIcon' | 'PhoneXMarkIcon' | 'PhoneIcon' | 'PhotoIcon' | 'PlayCircleIcon' | 'PlayPauseIcon' | 'PlayIcon' | 'PlusCircleIcon' | 'PlusSmallIcon' | 'PlusIcon' | 'PowerIcon' | 'PresentationChartBarIcon' | 'PresentationChartLineIcon' | 'PrinterIcon' | 'PuzzlePieceIcon' | 'QrCodeIcon' | 'QuestionMarkCircleIcon' | 'QueueListIcon' | 'RadioIcon' | 'ReceiptPercentIcon' | 'ReceiptRefundIcon' | 'RectangleGroupIcon' | 'RectangleStackIcon' | 'RocketLaunchIcon' | 'RssIcon' | 'ScaleIcon' | 'ScissorsIcon' | 'ServerStackIcon' | 'ServerIcon' | 'ShareIcon' | 'ShieldCheckIcon' | 'ShieldExclamationIcon' | 'ShoppingBagIcon' | 'ShoppingCartIcon' | 'SignalSlashIcon' | 'SignalIcon' | 'SparklesIcon' | 'SpeakerWaveIcon' | 'SpeakerXMarkIcon' | 'Square2StackIcon' | 'Square3Stack3DIcon' | 'Squares2X2Icon' | 'SquaresPlusIcon' | 'StarIcon' | 'StopCircleIcon' | 'StopIcon' | 'SunIcon' | 'SwatchIcon' | 'TableCellsIcon' | 'TagIcon' | 'TicketIcon' | 'TrashIcon' | 'TrophyIcon' | 'TruckIcon' | 'TvIcon' | 'UserCircleIcon' | 'UserGroupIcon' | 'UserMinusIcon' | 'UserPlusIcon' | 'UserIcon' | 'UsersIcon' | 'VariableIcon' | 'VideoCameraSlashIcon' | 'VideoCameraIcon' | 'ViewColumnsIcon' | 'ViewfinderCircleIcon' | 'WalletIcon' | 'WifiIcon' | 'WindowIcon' | 'WrenchScrewdriverIcon' | 'WrenchIcon' | 'XCircleIcon' | 'XMarkIcon';
	name: string;
	description: string;
	dateFormat: string;
	datetimeFormat: string;
	timeFormat: string;
	defaultMenu: string;
	defaultCurrency: 'AED' | 'AFN' | 'ALL' | 'AMD' | 'ANG' | 'AOA' | 'ARS' | 'AUD' | 'AWG' | 'AZN' | 'BAM' | 'BBD' | 'BDT' | 'BGN' | 'BHD' | 'BIF' | 'BMD' | 'BND' | 'BOB' | 'BOV' | 'BRL' | 'BSD' | 'BTN' | 'BWP' | 'BYN' | 'BZD' | 'CAD' | 'CDF' | 'CHE' | 'CHF' | 'CHW' | 'CLF' | 'CLP' | 'COP' | 'COU' | 'CRC' | 'CUP' | 'CVE' | 'CZK' | 'DJF' | 'DKK' | 'DOP' | 'DZD' | 'EGP' | 'ERN' | 'ETB' | 'EUR' | 'FJD' | 'FKP' | 'GBP' | 'GEL' | 'GHS' | 'GIP' | 'GMD' | 'GNF' | 'GTQ' | 'GYD' | 'HKD' | 'HNL' | 'HTG' | 'HUF' | 'IDR' | 'ILS' | 'INR' | 'IQD' | 'IRR' | 'ISK' | 'JMD' | 'JOD' | 'JPY' | 'KES' | 'KGS' | 'KHR' | 'KMF' | 'KPW' | 'KRW' | 'KWD' | 'KYD' | 'KZT' | 'LAK' | 'LBP' | 'LKR' | 'LRD' | 'LSL' | 'LYD' | 'MAD' | 'MDL' | 'MGA' | 'MKD' | 'MMK' | 'MNT' | 'MOP' | 'MRU' | 'MUR' | 'MVR' | 'MWK' | 'MXN' | 'MXV' | 'MYR' | 'MZN' | 'NAD' | 'NGN' | 'NIO' | 'NOK' | 'NPR' | 'NZD' | 'OMR' | 'PAB' | 'PEN' | 'PGK' | 'PHP' | 'PKR' | 'PLN' | 'PYG' | 'QAR' | 'RON' | 'RSD' | 'CNY' | 'RUB' | 'RWF' | 'SAR' | 'SBD' | 'SCR' | 'SDG' | 'SEK' | 'SGD' | 'SHP' | 'SLE' | 'SLL' | 'SOS' | 'SRD' | 'SSP' | 'STN' | 'SVC' | 'SYP' | 'SZL' | 'THB' | 'TJS' | 'TMT' | 'TND' | 'TOP' | 'TRY' | 'TTD' | 'TWD' | 'TZS' | 'UAH' | 'UGX' | 'USD' | 'USN' | 'UYI' | 'UYU' | 'UYW' | 'UZS' | 'VED' | 'VES' | 'VND' | 'VUV' | 'WST' | 'XAF' | 'XAG' | 'XAU' | 'XBA' | 'XBB' | 'XBC' | 'XBD' | 'XCD' | 'XDR' | 'XOF' | 'XPD' | 'XPF' | 'XPT' | 'XSU' | 'XTS' | 'XUA' | 'XXX' | 'YER' | 'ZAR' | 'ZMW' | 'ZWL';
};

export type HighSystemsRequestGetApplicationMenus = HighSystemsRequest & {
	appid: any;
};

export type HighSystemsRequestPostApplicationMenu = HighSystemsRequest & {
	appid: any;
	name: string;
	groups: any;
};

export type HighSystemsRequestDeleteApplicationMenu = HighSystemsRequest & {
	appid: any;
	menuid: any;
};

export type HighSystemsRequestGetApplicationMenu = HighSystemsRequest & {
	appid: any;
	menuid: any;
};

export type HighSystemsRequestPutApplicationMenu = HighSystemsRequest & {
	appid: any;
	menuid: any;
	name: string;
	groups: any;
};

export type HighSystemsRequestGetApplicationUserMenu = HighSystemsRequest & {
	appid: any;
};

export type HighSystemsRequestGetVariables = HighSystemsRequest & {
	appid: any;
};

export type HighSystemsRequestGetVariable = HighSystemsRequest & {
	appid: any;
	variableid: any;
};

export type HighSystemsRequestPostVariable = HighSystemsRequest & {
	relatedApplication: any;
	name: string;
	value?: string;
};

export type HighSystemsRequestDeleteVariable = HighSystemsRequest & {
	relatedApplication: any;
	variableid: any;
};

export type HighSystemsRequestPutVariable = HighSystemsRequest & {
	relatedApplication: any;
	variableid: any;
	name: string;
	value: string;
};

export type HighSystemsRequestGetRoles = HighSystemsRequest & {
	appid: any;
};

export type HighSystemsRequestGetRole = HighSystemsRequest & {
	appid: any;
	roleid: any;
};

export type HighSystemsRequestPostRole = HighSystemsRequest & {
	relatedApplication: any;
	name: string;
	description?: string;
	isAdmin?: boolean;
	isLimitedAdmin?: boolean;
	canInvite?: boolean;
	readonly?: boolean;
	defaultDashboard?: string;
	relatedMenu?: string;
};

export type HighSystemsRequestDeleteRole = HighSystemsRequest & {
	relatedApplication: any;
	roleid: any;
};

export type HighSystemsRequestPutRole = HighSystemsRequest & {
	relatedApplication: any;
	roleid: any;
	name: string;
	description: string;
	isAdmin: boolean;
	isLimitedAdmin: boolean;
	canInvite: boolean;
	readonly: boolean;
	defaultDashboard: string;
	relatedMenu: string;
	permissions: {
		tables: {
			relatedTable: string;
			hasAccess: boolean;
			add: boolean;
			edit: boolean;
			editCondition?: string;
			view: boolean;
			viewCondition?: string;
			delete: boolean;
			deleteCondition?: string;
			defaultDashboard?: string;
			defaultForm?: string;
			settings: boolean;
			permissions: boolean;
		}[];
		fields: {
			relatedTable: string;
			relatedField: string;
			hasAccess: boolean;
			add: boolean;
			edit: boolean;
			view: boolean;
		}[];
	};
};

export type HighSystemsRequestGetRolePermissions = HighSystemsRequest & {
	appid: any;
	roleid: any;
};

export type HighSystemsRequestGetRoleDefaults = HighSystemsRequest & {
	appid: any;
	roleid: any;
};

export type HighSystemsRequestGetApplicationUsers = HighSystemsRequest & {
	appid: any;
};

export type HighSystemsRequestGetApplicationUser = HighSystemsRequest & {
	appid: any;
	userid: any;
};

export type HighSystemsRequestPostApplicationUser = HighSystemsRequest & {
	relatedApplication: any;
	relatedUser?: string;
	relatedRole: string;
	email?: string;
	sendEmail?: boolean;
};

export type HighSystemsRequestPutApplicationUser = HighSystemsRequest & {
	relatedApplication: any;
	applicationUserId: any;
	relatedUser: string;
	relatedRole: string;
};

export type HighSystemsRequestDeleteApplicationUser = HighSystemsRequest & {
	relatedApplication: any;
	userid: any;
};

export type HighSystemsRequestGetTables = HighSystemsRequest & {
	appid: any;
};

export type HighSystemsRequestDeleteTable = HighSystemsRequest & {
	appid: any;
	tableid: any;
};

export type HighSystemsRequestGetTable = HighSystemsRequest & {
	appid: any;
	tableid: any;
};

export type HighSystemsRequestPutTable = HighSystemsRequest & {
	appid: any;
	tableid: any;
	relatedApplication: string;
	icon: '' | 'AcademicCapIcon' | 'AdjustmentsHorizontalIcon' | 'AdjustmentsVerticalIcon' | 'ArchiveBoxArrowDownIcon' | 'ArchiveBoxXMarkIcon' | 'ArchiveBoxIcon' | 'ArrowDownCircleIcon' | 'ArrowDownLeftIcon' | 'ArrowDownOnSquareStackIcon' | 'ArrowDownOnSquareIcon' | 'ArrowDownRightIcon' | 'ArrowDownTrayIcon' | 'ArrowDownIcon' | 'ArrowLeftCircleIcon' | 'ArrowLeftOnRectangleIcon' | 'ArrowLeftIcon' | 'ArrowLongDownIcon' | 'ArrowLongLeftIcon' | 'ArrowLongRightIcon' | 'ArrowLongUpIcon' | 'ArrowPathRoundedSquareIcon' | 'ArrowPathIcon' | 'ArrowRightCircleIcon' | 'ArrowRightOnRectangleIcon' | 'ArrowRightIcon' | 'ArrowSmallDownIcon' | 'ArrowSmallLeftIcon' | 'ArrowSmallRightIcon' | 'ArrowSmallUpIcon' | 'ArrowTopRightOnSquareIcon' | 'ArrowTrendingDownIcon' | 'ArrowTrendingUpIcon' | 'ArrowUpCircleIcon' | 'ArrowUpLeftIcon' | 'ArrowUpOnSquareStackIcon' | 'ArrowUpOnSquareIcon' | 'ArrowUpRightIcon' | 'ArrowUpTrayIcon' | 'ArrowUpIcon' | 'ArrowUturnDownIcon' | 'ArrowUturnLeftIcon' | 'ArrowUturnRightIcon' | 'ArrowUturnUpIcon' | 'ArrowsPointingInIcon' | 'ArrowsPointingOutIcon' | 'ArrowsRightLeftIcon' | 'ArrowsUpDownIcon' | 'AtSymbolIcon' | 'BackspaceIcon' | 'BackwardIcon' | 'BanknotesIcon' | 'Bars2Icon' | 'Bars3BottomLeftIcon' | 'Bars3BottomRightIcon' | 'Bars3CenterLeftIcon' | 'Bars3Icon' | 'Bars4Icon' | 'BarsArrowDownIcon' | 'BarsArrowUpIcon' | 'Battery0Icon' | 'Battery100Icon' | 'Battery50Icon' | 'BeakerIcon' | 'BellAlertIcon' | 'BellSlashIcon' | 'BellSnoozeIcon' | 'BellIcon' | 'BoltSlashIcon' | 'BoltIcon' | 'BookOpenIcon' | 'BookmarkSlashIcon' | 'BookmarkSquareIcon' | 'BookmarkIcon' | 'BriefcaseIcon' | 'BugAntIcon' | 'BuildingLibraryIcon' | 'BuildingOffice2Icon' | 'BuildingOfficeIcon' | 'BuildingStorefrontIcon' | 'CakeIcon' | 'CalculatorIcon' | 'CalendarDaysIcon' | 'CalendarIcon' | 'CameraIcon' | 'ChartBarSquareIcon' | 'ChartBarIcon' | 'ChartPieIcon' | 'ChatBubbleBottomCenterTextIcon' | 'ChatBubbleBottomCenterIcon' | 'ChatBubbleLeftEllipsisIcon' | 'ChatBubbleLeftRightIcon' | 'ChatBubbleLeftIcon' | 'ChatBubbleOvalLeftEllipsisIcon' | 'ChatBubbleOvalLeftIcon' | 'CheckBadgeIcon' | 'CheckCircleIcon' | 'CheckIcon' | 'ChevronDoubleDownIcon' | 'ChevronDoubleLeftIcon' | 'ChevronDoubleRightIcon' | 'ChevronDoubleUpIcon' | 'ChevronDownIcon' | 'ChevronLeftIcon' | 'ChevronRightIcon' | 'ChevronUpDownIcon' | 'ChevronUpIcon' | 'CircleStackIcon' | 'ClipboardDocumentCheckIcon' | 'ClipboardDocumentListIcon' | 'ClipboardDocumentIcon' | 'ClipboardIcon' | 'ClockIcon' | 'CloudArrowDownIcon' | 'CloudArrowUpIcon' | 'CloudIcon' | 'CodeBracketSquareIcon' | 'CodeBracketIcon' | 'Cog6ToothIcon' | 'Cog8ToothIcon' | 'CogIcon' | 'CommandLineIcon' | 'ComputerDesktopIcon' | 'CpuChipIcon' | 'CreditCardIcon' | 'CubeTransparentIcon' | 'CubeIcon' | 'CurrencyBangladeshiIcon' | 'CurrencyDollarIcon' | 'CurrencyEuroIcon' | 'CurrencyPoundIcon' | 'CurrencyRupeeIcon' | 'CurrencyYenIcon' | 'CursorArrowRaysIcon' | 'CursorArrowRippleIcon' | 'DevicePhoneMobileIcon' | 'DeviceTabletIcon' | 'DocumentArrowDownIcon' | 'DocumentArrowUpIcon' | 'DocumentChartBarIcon' | 'DocumentCheckIcon' | 'DocumentDuplicateIcon' | 'DocumentMagnifyingGlassIcon' | 'DocumentMinusIcon' | 'DocumentPlusIcon' | 'DocumentTextIcon' | 'DocumentIcon' | 'EllipsisHorizontalCircleIcon' | 'EllipsisHorizontalIcon' | 'EllipsisVerticalIcon' | 'EnvelopeOpenIcon' | 'EnvelopeIcon' | 'ExclamationCircleIcon' | 'ExclamationTriangleIcon' | 'EyeDropperIcon' | 'EyeSlashIcon' | 'EyeIcon' | 'FaceFrownIcon' | 'FaceSmileIcon' | 'FilmIcon' | 'FingerPrintIcon' | 'FireIcon' | 'FlagIcon' | 'FolderArrowDownIcon' | 'FolderMinusIcon' | 'FolderOpenIcon' | 'FolderPlusIcon' | 'FolderIcon' | 'ForwardIcon' | 'FunnelIcon' | 'GifIcon' | 'GiftTopIcon' | 'GiftIcon' | 'GlobeAltIcon' | 'GlobeAmericasIcon' | 'GlobeAsiaAustraliaIcon' | 'GlobeEuropeAfricaIcon' | 'HandRaisedIcon' | 'HandThumbDownIcon' | 'HandThumbUpIcon' | 'HashtagIcon' | 'HeartIcon' | 'HomeModernIcon' | 'HomeIcon' | 'IdentificationIcon' | 'InboxArrowDownIcon' | 'InboxStackIcon' | 'InboxIcon' | 'InformationCircleIcon' | 'KeyIcon' | 'LanguageIcon' | 'LifebuoyIcon' | 'LightBulbIcon' | 'LinkIcon' | 'ListBulletIcon' | 'LockClosedIcon' | 'LockOpenIcon' | 'MagnifyingGlassCircleIcon' | 'MagnifyingGlassMinusIcon' | 'MagnifyingGlassPlusIcon' | 'MagnifyingGlassIcon' | 'MapPinIcon' | 'MapIcon' | 'MegaphoneIcon' | 'MicrophoneIcon' | 'MinusCircleIcon' | 'MinusSmallIcon' | 'MinusIcon' | 'MoonIcon' | 'MusicalNoteIcon' | 'NewspaperIcon' | 'NoSymbolIcon' | 'PaintBrushIcon' | 'PaperAirplaneIcon' | 'PaperClipIcon' | 'PauseCircleIcon' | 'PauseIcon' | 'PencilSquareIcon' | 'PencilIcon' | 'PhoneArrowDownLeftIcon' | 'PhoneArrowUpRightIcon' | 'PhoneXMarkIcon' | 'PhoneIcon' | 'PhotoIcon' | 'PlayCircleIcon' | 'PlayPauseIcon' | 'PlayIcon' | 'PlusCircleIcon' | 'PlusSmallIcon' | 'PlusIcon' | 'PowerIcon' | 'PresentationChartBarIcon' | 'PresentationChartLineIcon' | 'PrinterIcon' | 'PuzzlePieceIcon' | 'QrCodeIcon' | 'QuestionMarkCircleIcon' | 'QueueListIcon' | 'RadioIcon' | 'ReceiptPercentIcon' | 'ReceiptRefundIcon' | 'RectangleGroupIcon' | 'RectangleStackIcon' | 'RocketLaunchIcon' | 'RssIcon' | 'ScaleIcon' | 'ScissorsIcon' | 'ServerStackIcon' | 'ServerIcon' | 'ShareIcon' | 'ShieldCheckIcon' | 'ShieldExclamationIcon' | 'ShoppingBagIcon' | 'ShoppingCartIcon' | 'SignalSlashIcon' | 'SignalIcon' | 'SparklesIcon' | 'SpeakerWaveIcon' | 'SpeakerXMarkIcon' | 'Square2StackIcon' | 'Square3Stack3DIcon' | 'Squares2X2Icon' | 'SquaresPlusIcon' | 'StarIcon' | 'StopCircleIcon' | 'StopIcon' | 'SunIcon' | 'SwatchIcon' | 'TableCellsIcon' | 'TagIcon' | 'TicketIcon' | 'TrashIcon' | 'TrophyIcon' | 'TruckIcon' | 'TvIcon' | 'UserCircleIcon' | 'UserGroupIcon' | 'UserMinusIcon' | 'UserPlusIcon' | 'UserIcon' | 'UsersIcon' | 'VariableIcon' | 'VideoCameraSlashIcon' | 'VideoCameraIcon' | 'ViewColumnsIcon' | 'ViewfinderCircleIcon' | 'WalletIcon' | 'WifiIcon' | 'WindowIcon' | 'WrenchScrewdriverIcon' | 'WrenchIcon' | 'XCircleIcon' | 'XMarkIcon';
	name: string;
	description: string;
	singular: string;
	plural: string;
	recordPicker: string[];
	recordLabel: string;
	displayOnMenu: boolean;
	defaultDashboard: string;
	defaultForm: string;
	dataRule: string;
};

export type HighSystemsRequestPostTable = HighSystemsRequest & {
	relatedApplication: any;
	icon?: '' | 'AcademicCapIcon' | 'AdjustmentsHorizontalIcon' | 'AdjustmentsVerticalIcon' | 'ArchiveBoxArrowDownIcon' | 'ArchiveBoxXMarkIcon' | 'ArchiveBoxIcon' | 'ArrowDownCircleIcon' | 'ArrowDownLeftIcon' | 'ArrowDownOnSquareStackIcon' | 'ArrowDownOnSquareIcon' | 'ArrowDownRightIcon' | 'ArrowDownTrayIcon' | 'ArrowDownIcon' | 'ArrowLeftCircleIcon' | 'ArrowLeftOnRectangleIcon' | 'ArrowLeftIcon' | 'ArrowLongDownIcon' | 'ArrowLongLeftIcon' | 'ArrowLongRightIcon' | 'ArrowLongUpIcon' | 'ArrowPathRoundedSquareIcon' | 'ArrowPathIcon' | 'ArrowRightCircleIcon' | 'ArrowRightOnRectangleIcon' | 'ArrowRightIcon' | 'ArrowSmallDownIcon' | 'ArrowSmallLeftIcon' | 'ArrowSmallRightIcon' | 'ArrowSmallUpIcon' | 'ArrowTopRightOnSquareIcon' | 'ArrowTrendingDownIcon' | 'ArrowTrendingUpIcon' | 'ArrowUpCircleIcon' | 'ArrowUpLeftIcon' | 'ArrowUpOnSquareStackIcon' | 'ArrowUpOnSquareIcon' | 'ArrowUpRightIcon' | 'ArrowUpTrayIcon' | 'ArrowUpIcon' | 'ArrowUturnDownIcon' | 'ArrowUturnLeftIcon' | 'ArrowUturnRightIcon' | 'ArrowUturnUpIcon' | 'ArrowsPointingInIcon' | 'ArrowsPointingOutIcon' | 'ArrowsRightLeftIcon' | 'ArrowsUpDownIcon' | 'AtSymbolIcon' | 'BackspaceIcon' | 'BackwardIcon' | 'BanknotesIcon' | 'Bars2Icon' | 'Bars3BottomLeftIcon' | 'Bars3BottomRightIcon' | 'Bars3CenterLeftIcon' | 'Bars3Icon' | 'Bars4Icon' | 'BarsArrowDownIcon' | 'BarsArrowUpIcon' | 'Battery0Icon' | 'Battery100Icon' | 'Battery50Icon' | 'BeakerIcon' | 'BellAlertIcon' | 'BellSlashIcon' | 'BellSnoozeIcon' | 'BellIcon' | 'BoltSlashIcon' | 'BoltIcon' | 'BookOpenIcon' | 'BookmarkSlashIcon' | 'BookmarkSquareIcon' | 'BookmarkIcon' | 'BriefcaseIcon' | 'BugAntIcon' | 'BuildingLibraryIcon' | 'BuildingOffice2Icon' | 'BuildingOfficeIcon' | 'BuildingStorefrontIcon' | 'CakeIcon' | 'CalculatorIcon' | 'CalendarDaysIcon' | 'CalendarIcon' | 'CameraIcon' | 'ChartBarSquareIcon' | 'ChartBarIcon' | 'ChartPieIcon' | 'ChatBubbleBottomCenterTextIcon' | 'ChatBubbleBottomCenterIcon' | 'ChatBubbleLeftEllipsisIcon' | 'ChatBubbleLeftRightIcon' | 'ChatBubbleLeftIcon' | 'ChatBubbleOvalLeftEllipsisIcon' | 'ChatBubbleOvalLeftIcon' | 'CheckBadgeIcon' | 'CheckCircleIcon' | 'CheckIcon' | 'ChevronDoubleDownIcon' | 'ChevronDoubleLeftIcon' | 'ChevronDoubleRightIcon' | 'ChevronDoubleUpIcon' | 'ChevronDownIcon' | 'ChevronLeftIcon' | 'ChevronRightIcon' | 'ChevronUpDownIcon' | 'ChevronUpIcon' | 'CircleStackIcon' | 'ClipboardDocumentCheckIcon' | 'ClipboardDocumentListIcon' | 'ClipboardDocumentIcon' | 'ClipboardIcon' | 'ClockIcon' | 'CloudArrowDownIcon' | 'CloudArrowUpIcon' | 'CloudIcon' | 'CodeBracketSquareIcon' | 'CodeBracketIcon' | 'Cog6ToothIcon' | 'Cog8ToothIcon' | 'CogIcon' | 'CommandLineIcon' | 'ComputerDesktopIcon' | 'CpuChipIcon' | 'CreditCardIcon' | 'CubeTransparentIcon' | 'CubeIcon' | 'CurrencyBangladeshiIcon' | 'CurrencyDollarIcon' | 'CurrencyEuroIcon' | 'CurrencyPoundIcon' | 'CurrencyRupeeIcon' | 'CurrencyYenIcon' | 'CursorArrowRaysIcon' | 'CursorArrowRippleIcon' | 'DevicePhoneMobileIcon' | 'DeviceTabletIcon' | 'DocumentArrowDownIcon' | 'DocumentArrowUpIcon' | 'DocumentChartBarIcon' | 'DocumentCheckIcon' | 'DocumentDuplicateIcon' | 'DocumentMagnifyingGlassIcon' | 'DocumentMinusIcon' | 'DocumentPlusIcon' | 'DocumentTextIcon' | 'DocumentIcon' | 'EllipsisHorizontalCircleIcon' | 'EllipsisHorizontalIcon' | 'EllipsisVerticalIcon' | 'EnvelopeOpenIcon' | 'EnvelopeIcon' | 'ExclamationCircleIcon' | 'ExclamationTriangleIcon' | 'EyeDropperIcon' | 'EyeSlashIcon' | 'EyeIcon' | 'FaceFrownIcon' | 'FaceSmileIcon' | 'FilmIcon' | 'FingerPrintIcon' | 'FireIcon' | 'FlagIcon' | 'FolderArrowDownIcon' | 'FolderMinusIcon' | 'FolderOpenIcon' | 'FolderPlusIcon' | 'FolderIcon' | 'ForwardIcon' | 'FunnelIcon' | 'GifIcon' | 'GiftTopIcon' | 'GiftIcon' | 'GlobeAltIcon' | 'GlobeAmericasIcon' | 'GlobeAsiaAustraliaIcon' | 'GlobeEuropeAfricaIcon' | 'HandRaisedIcon' | 'HandThumbDownIcon' | 'HandThumbUpIcon' | 'HashtagIcon' | 'HeartIcon' | 'HomeModernIcon' | 'HomeIcon' | 'IdentificationIcon' | 'InboxArrowDownIcon' | 'InboxStackIcon' | 'InboxIcon' | 'InformationCircleIcon' | 'KeyIcon' | 'LanguageIcon' | 'LifebuoyIcon' | 'LightBulbIcon' | 'LinkIcon' | 'ListBulletIcon' | 'LockClosedIcon' | 'LockOpenIcon' | 'MagnifyingGlassCircleIcon' | 'MagnifyingGlassMinusIcon' | 'MagnifyingGlassPlusIcon' | 'MagnifyingGlassIcon' | 'MapPinIcon' | 'MapIcon' | 'MegaphoneIcon' | 'MicrophoneIcon' | 'MinusCircleIcon' | 'MinusSmallIcon' | 'MinusIcon' | 'MoonIcon' | 'MusicalNoteIcon' | 'NewspaperIcon' | 'NoSymbolIcon' | 'PaintBrushIcon' | 'PaperAirplaneIcon' | 'PaperClipIcon' | 'PauseCircleIcon' | 'PauseIcon' | 'PencilSquareIcon' | 'PencilIcon' | 'PhoneArrowDownLeftIcon' | 'PhoneArrowUpRightIcon' | 'PhoneXMarkIcon' | 'PhoneIcon' | 'PhotoIcon' | 'PlayCircleIcon' | 'PlayPauseIcon' | 'PlayIcon' | 'PlusCircleIcon' | 'PlusSmallIcon' | 'PlusIcon' | 'PowerIcon' | 'PresentationChartBarIcon' | 'PresentationChartLineIcon' | 'PrinterIcon' | 'PuzzlePieceIcon' | 'QrCodeIcon' | 'QuestionMarkCircleIcon' | 'QueueListIcon' | 'RadioIcon' | 'ReceiptPercentIcon' | 'ReceiptRefundIcon' | 'RectangleGroupIcon' | 'RectangleStackIcon' | 'RocketLaunchIcon' | 'RssIcon' | 'ScaleIcon' | 'ScissorsIcon' | 'ServerStackIcon' | 'ServerIcon' | 'ShareIcon' | 'ShieldCheckIcon' | 'ShieldExclamationIcon' | 'ShoppingBagIcon' | 'ShoppingCartIcon' | 'SignalSlashIcon' | 'SignalIcon' | 'SparklesIcon' | 'SpeakerWaveIcon' | 'SpeakerXMarkIcon' | 'Square2StackIcon' | 'Square3Stack3DIcon' | 'Squares2X2Icon' | 'SquaresPlusIcon' | 'StarIcon' | 'StopCircleIcon' | 'StopIcon' | 'SunIcon' | 'SwatchIcon' | 'TableCellsIcon' | 'TagIcon' | 'TicketIcon' | 'TrashIcon' | 'TrophyIcon' | 'TruckIcon' | 'TvIcon' | 'UserCircleIcon' | 'UserGroupIcon' | 'UserMinusIcon' | 'UserPlusIcon' | 'UserIcon' | 'UsersIcon' | 'VariableIcon' | 'VideoCameraSlashIcon' | 'VideoCameraIcon' | 'ViewColumnsIcon' | 'ViewfinderCircleIcon' | 'WalletIcon' | 'WifiIcon' | 'WindowIcon' | 'WrenchScrewdriverIcon' | 'WrenchIcon' | 'XCircleIcon' | 'XMarkIcon';
	name: string;
	description?: string;
	singular: string;
	plural: string;
	displayOnMenu?: boolean;
	defaultDashboard?: string;
	defaultForm?: string;
	dataRule?: string;
};

export type HighSystemsRequestGetApplicationRelationships = HighSystemsRequest & {
	appid: any;
};

export type HighSystemsRequestGetTableRelationships = HighSystemsRequest & {
	appid: any;
	tableid: any;
};

export type HighSystemsRequestGetApplicationFields = HighSystemsRequest & {
	appid: any;
};

export type HighSystemsRequestGetFields = HighSystemsRequest & {
	appid: any;
	tableid: any;
	clist?: any;
};

export type HighSystemsRequestDeleteField = HighSystemsRequest & {
	appid: any;
	tableid: any;
	fieldid: any;
};

export type HighSystemsRequestGetField = HighSystemsRequest & {
	appid: any;
	tableid: any;
	fieldid: any;
};

export type HighSystemsRequestPostField = HighSystemsRequest & {
	appid: any;
	relatedTable: any;
	field: any;
};

export type HighSystemsRequestPutField = HighSystemsRequest & {
	appid: any;
	relatedTable: any;
	fieldid: any;
	field: any;
};

export type HighSystemsRequestGetApplicationReports = HighSystemsRequest & {
	appid: any;
};

export type HighSystemsRequestGetReports = HighSystemsRequest & {
	appid: any;
	tableid: any;
};

export type HighSystemsRequestDeleteReport = HighSystemsRequest & {
	appid: any;
	tableid: any;
	reportid: any;
};

export type HighSystemsRequestGetReport = HighSystemsRequest & {
	appid: any;
	tableid: any;
	reportid: any;
};

export type HighSystemsRequestPostReport = HighSystemsRequest & {
	appid: any;
	relatedTable: any;
	report: any;
};

export type HighSystemsRequestPutReport = HighSystemsRequest & {
	appid: any;
	relatedTable: any;
	reportid: any;
	report: any;
};

export type HighSystemsRequestGetApplicationForms = HighSystemsRequest & {
	appid: any;
};

export type HighSystemsRequestGetForms = HighSystemsRequest & {
	appid: any;
	tableid: any;
};

export type HighSystemsRequestDeleteForm = HighSystemsRequest & {
	appid: any;
	tableid: any;
	formid: any;
};

export type HighSystemsRequestGetForm = HighSystemsRequest & {
	appid: any;
	tableid: any;
	formid: any;
};

export type HighSystemsRequestPostForm = HighSystemsRequest & {
	relatedTable: any;
	appid: any;
	name: string;
	description?: string;
	schema: any;
	layout: {
		md: {
			id: string;
			x: number;
			y: number;
			w: number;
			h: number;
			children?: any;
		}[];
		sm: {
			id: string;
			x: number;
			y: number;
			w: number;
			h: number;
			children?: any;
		}[];
		xs: {
			id: string;
			x: number;
			y: number;
			w: number;
			h: number;
			children?: any;
		}[];
	};
	rules: {
		when: string;
		actions: {
			type: 'show' | 'hide' | 'require' | 'unrequire' | 'editable' | 'readOnly' | 'changeField' | 'displayMessage';
			fieldId?: string;
			value?: any;
			valueType?: 'value' | 'fieldValue';
		}[];
	}[];
	properties: {
		displayCoreFields: boolean;
		displayOnMenu: boolean;
		useCustomLayouts: boolean;
	};
};

export type HighSystemsRequestPutForm = HighSystemsRequest & {
	relatedTable: any;
	appid: any;
	formid: any;
	name: string;
	description: string;
	schema: any;
	layout: {
		md: {
			id: string;
			x: number;
			y: number;
			w: number;
			h: number;
			children: any;
		}[];
		sm: {
			id: string;
			x: number;
			y: number;
			w: number;
			h: number;
			children: any;
		}[];
		xs: {
			id: string;
			x: number;
			y: number;
			w: number;
			h: number;
			children: any;
		}[];
	};
	rules: {
		when: string;
		actions: {
			type: 'show' | 'hide' | 'require' | 'unrequire' | 'editable' | 'readOnly' | 'changeField' | 'displayMessage';
			fieldId: string;
			value: any;
			valueType: 'value' | 'fieldValue';
		}[];
	}[];
	properties: {
		displayCoreFields: boolean;
		displayOnMenu: boolean;
		useCustomLayouts: boolean;
	};
};

export type HighSystemsRequestGetApplicationEntityRelationshipDiagram = HighSystemsRequest & {
	appid: any;
};

export type HighSystemsRequestPutApplicationEntityRelationshipDiagram = HighSystemsRequest & {
	appid: any;
	diagramid: any;
	layout: any;
};

export type HighSystemsRequestGetDashboards = HighSystemsRequest & {
	appid: any;
	relatedTable?: any;
};

export type HighSystemsRequestPostDashboard = HighSystemsRequest & {
	appid: any;
	relatedTable?: string;
	type: 'application' | 'table';
	name: string;
	description?: string;
	schema: {
		md: {
			id: string;
			type: 'widget';
			widget: any;
		}[];
		sm: {
			id: string;
			type: 'widget';
			widget: any;
		}[];
		xs: {
			id: string;
			type: 'widget';
			widget: any;
		}[];
	};
	layout: {
		md: {
			id: string;
			x: number;
			y: number;
			w: number;
			h: number;
		}[];
		sm: {
			id: string;
			x: number;
			y: number;
			w: number;
			h: number;
		}[];
		xs: {
			id: string;
			x: number;
			y: number;
			w: number;
			h: number;
		}[];
	};
	properties: {
		displayOnMenu: boolean;
		useCustomLayouts?: boolean;
	};
};

export type HighSystemsRequestDeleteDashboard = HighSystemsRequest & {
	appid: any;
	tableid?: any;
	dashboardid: any;
};

export type HighSystemsRequestGetDashboard = HighSystemsRequest & {
	appid: any;
	relatedTable?: any;
	dashboardid: any;
};

export type HighSystemsRequestPutDashboard = HighSystemsRequest & {
	appid: any;
	dashboardid: any;
	relatedTable: string;
	type: 'application' | 'table';
	name: string;
	description: string;
	schema: {
		md: {
			id: string;
			type: 'widget';
			widget: any;
		}[];
		sm: {
			id: string;
			type: 'widget';
			widget: any;
		}[];
		xs: {
			id: string;
			type: 'widget';
			widget: any;
		}[];
	};
	layout: {
		md: {
			id: string;
			x: number;
			y: number;
			w: number;
			h: number;
		}[];
		sm: {
			id: string;
			x: number;
			y: number;
			w: number;
			h: number;
		}[];
		xs: {
			id: string;
			x: number;
			y: number;
			w: number;
			h: number;
		}[];
	};
	properties: {
		displayOnMenu: boolean;
		useCustomLayouts: boolean;
	};
};

export type HighSystemsRequestGetPages = HighSystemsRequest & {
	appid: any;
};

export type HighSystemsRequestPostPage = HighSystemsRequest & {
	appid: any;
	name: any;
	content: any;
	properties: any;
};

export type HighSystemsRequestDeletePage = HighSystemsRequest & {
	appid: any;
	pageid: any;
};

export type HighSystemsRequestGetPage = HighSystemsRequest & {
	appid: any;
	pageid: any;
};

export type HighSystemsRequestPutPage = HighSystemsRequest & {
	appid: any;
	pageid: any;
	name: any;
	content: any;
	properties: any;
};

export type HighSystemsRequestGetNotifications = HighSystemsRequest & {
	appid: any;
	tableid: any;
};

export type HighSystemsRequestDeleteNotification = HighSystemsRequest & {
	appid: any;
	tableid: any;
	notificationid: any;
};

export type HighSystemsRequestGetNotification = HighSystemsRequest & {
	appid: any;
	tableid: any;
	notificationid: any;
};

export type HighSystemsRequestPutNotification = HighSystemsRequest & {
	appid: any;
	tableid: any;
	notificationid: any;
	relatedTable: string;
	relatedOwner: string;
	active: boolean;
	name: string;
	description: string;
	type: string[];
	condition: string;
	from: string;
	to: string[];
	cc: string[];
	bcc: string[];
	subject: string;
	html: string;
	body: string;
	attachments: any;
};

export type HighSystemsRequestPostNotification = HighSystemsRequest & {
	relatedTable: any;
	appid: any;
	active: boolean;
	name: string;
	description?: string;
	type?: string[];
	condition: string;
	to: string[];
	cc?: string[];
	bcc?: string[];
	subject: string;
	html?: string;
	body?: string;
	attachments?: any;
};

export type HighSystemsRequestGetWebhooks = HighSystemsRequest & {
	appid: any;
	tableid: any;
};

export type HighSystemsRequestDeleteWebhook = HighSystemsRequest & {
	appid: any;
	tableid: any;
	webhookid: any;
};

export type HighSystemsRequestGetWebhook = HighSystemsRequest & {
	appid: any;
	tableid: any;
	webhookid: any;
};

export type HighSystemsRequestPutWebhook = HighSystemsRequest & {
	appid: any;
	tableid: any;
	webhookid: any;
	relatedTable: string;
	relatedOwner: string;
	active: boolean;
	name: string;
	description: string;
	type: string[];
	condition: string;
	endpoint: string;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	headers: {
		key: string;
		value: any;
	}[];
	body: string;
};

export type HighSystemsRequestPostWebhook = HighSystemsRequest & {
	relatedTable: any;
	appid: any;
	relatedOwner: string;
	active: boolean;
	name: string;
	description: string;
	type: string[];
	condition: string;
	endpoint: string;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	headers: {
		key: string;
		value: any;
	}[];
	body: string;
};

export type HighSystemsRequestGetFunctions = HighSystemsRequest & {
	appid: any;
};

export type HighSystemsRequestPostFunction = HighSystemsRequest & {
	appid: any;
	name: string;
	description?: string;
	body: string;
};

export type HighSystemsRequestDeleteFunction = HighSystemsRequest & {
	appid: any;
	functionid: any;
};

export type HighSystemsRequestGetFunction = HighSystemsRequest & {
	appid: any;
	functionid: any;
};

export type HighSystemsRequestPutFunction = HighSystemsRequest & {
	appid: any;
	functionid: any;
	name: string;
	description?: string;
	body: string;
};

export type HighSystemsRequestGetTriggers = HighSystemsRequest & {
	appid: any;
};

export type HighSystemsRequestPostTrigger = HighSystemsRequest & {
	appid: any;
	owner?: string;
	active?: boolean;
	name: string;
	description?: string;
	timing: 'before' | 'after' | 'instead of';
	event: 'insert' | 'update' | 'delete';
	relatedTable: string;
	forEach: 'row' | 'statement';
	where?: string;
	relatedFunction: string;
};

export type HighSystemsRequestDeleteTrigger = HighSystemsRequest & {
	appid: any;
	triggerid: any;
};

export type HighSystemsRequestGetTrigger = HighSystemsRequest & {
	appid: any;
	triggerid: any;
};

export type HighSystemsRequestPutTrigger = HighSystemsRequest & {
	appid: any;
	triggerid: any;
	owner: string;
	active?: boolean;
	name: string;
	description?: string;
	timing: 'before' | 'after' | 'instead of';
	event: 'insert' | 'update' | 'delete';
	relatedTable: string;
	forEach: 'row' | 'statement';
	where?: string;
	relatedFunction: string;
};

export type HighSystemsRequestGetRecords = HighSystemsRequest & {
	type?: any;
	query?: any;
	columns?: any;
	summarize?: any;
	grouping?: any;
	sorting?: any;
	page?: any;
	mergeQuery?: any;
	appid: any;
	tableid: any;
	reportid?: any;
};

export type HighSystemsRequestPostRecord = HighSystemsRequest & {
	appid: any;
	tableid: any;
	format: any;
};

export type HighSystemsRequestGetRecordsCount = HighSystemsRequest & {
	appid: any;
	tableid: any;
	reportid?: any;
	query?: any;
	mergeQuery?: any;
};

export type HighSystemsRequestGetRecordsTotals = HighSystemsRequest & {
	type?: any;
	query?: any;
	totals?: any;
	columns?: any;
	summarize?: any;
	grouping?: any;
	sorting?: any;
	page?: any;
	mergeQuery?: any;
	appid: any;
	tableid: any;
	reportid?: any;
};

export type HighSystemsRequestDeleteRecord = HighSystemsRequest & {
	appid: any;
	tableid: any;
	recordid: any;
};

export type HighSystemsRequestGetRecord = HighSystemsRequest & {
	appid: any;
	tableid: any;
	recordid: any;
	clist?: any;
};

export type HighSystemsRequestPutRecord = HighSystemsRequest & {
	appid: any;
	tableid: any;
	id: any;
	format: any;
};

export type HighSystemsRequestUpsertRecords = HighSystemsRequest & {
	appid: any;
	tableid: any;
	data: {
	}[];
};

export type HighSystemsRequestCalculateRecordFormulas = HighSystemsRequest & {
	appid: any;
	tableid: any;
	recordid?: string;
	formulas: string[];
	adHocData: {
		id: string;
		dateCreated: string;
		dateModified: string;
		recordOwner: string;
		lastModifiedBy: string;
	};
};

export type HighSystemsRequestGetFile = HighSystemsRequest & {
	appid: any;
	tableid: any;
	recordid: any;
	fieldid: any;
};

export type HighSystemsRequestGetPresignedFileUrl = HighSystemsRequest & {
	appid?: any;
	tableid?: any;
	recordid?: any;
	fieldid?: any;
	pageid?: any;
	logo?: any;
	action: any;
	contentType?: any;
	responseDisposition?: any;
	responseType?: any;
};

export type HighSystemsRequestFinalizeFileUpload = HighSystemsRequest & {
	appid: any;
	tableid: any;
	recordid: any;
	fieldid: any;
	tmpLocation: any;
	size: any;
	filename: any;
};

export type HighSystemsResponseGetTransaction = {
	success: boolean;
	results: string;
};

export type HighSystemsResponseDeleteTransaction = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponsePostTransaction = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetRealmSettings = {
	success: boolean;
	results: {
		realm: string;
		name?: string;
		logo: {
			size: number;
			filename: string;
		};
		theme?: {
			primary: string;
		};
		twoFactorEnforced?: boolean;
	};
};

export type HighSystemsResponsePutRealmSettings = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetUsers = {
	success: boolean;
	results: {
		id: string;
		email: string;
		firstName: string;
		middleName: string;
		lastName: string;
		isRealmAdmin: boolean;
		isRealmLimitedAdmin: boolean;
		reset: boolean;
		valid: boolean;
	}[];
};

export type HighSystemsResponsePostUser = {
	success: boolean;
	results: string;
};

export type HighSystemsResponseDeleteUser = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetUser = {
	success: boolean;
	results: {
		id: string;
		email: string;
		firstName: string;
		middleName: string;
		lastName: string;
		isRealmAdmin: boolean;
		isRealmLimitedAdmin: boolean;
		reset: boolean;
		valid: boolean;
	};
};

export type HighSystemsResponsePutUser = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetUserTokens = {
	success: boolean;
	results: {
		id: string;
		relatedUser: string;
		token: string;
		name: string;
		description?: string;
		applications?: string[];
		active: boolean;
	}[];
};

export type HighSystemsResponsePostUserToken = {
	success: boolean;
	results: string;
};

export type HighSystemsResponseDeleteUserToken = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetUserToken = {
	success: boolean;
	results: {
		id: string;
		relatedUser: string;
		token: string;
		name: string;
		description?: string;
		applications?: string[];
		active: boolean;
	};
};

export type HighSystemsResponsePutUserToken = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetApplications = {
	success: boolean;
	results: {
		id: string;
		icon?: '' | 'AcademicCapIcon' | 'AdjustmentsHorizontalIcon' | 'AdjustmentsVerticalIcon' | 'ArchiveBoxArrowDownIcon' | 'ArchiveBoxXMarkIcon' | 'ArchiveBoxIcon' | 'ArrowDownCircleIcon' | 'ArrowDownLeftIcon' | 'ArrowDownOnSquareStackIcon' | 'ArrowDownOnSquareIcon' | 'ArrowDownRightIcon' | 'ArrowDownTrayIcon' | 'ArrowDownIcon' | 'ArrowLeftCircleIcon' | 'ArrowLeftOnRectangleIcon' | 'ArrowLeftIcon' | 'ArrowLongDownIcon' | 'ArrowLongLeftIcon' | 'ArrowLongRightIcon' | 'ArrowLongUpIcon' | 'ArrowPathRoundedSquareIcon' | 'ArrowPathIcon' | 'ArrowRightCircleIcon' | 'ArrowRightOnRectangleIcon' | 'ArrowRightIcon' | 'ArrowSmallDownIcon' | 'ArrowSmallLeftIcon' | 'ArrowSmallRightIcon' | 'ArrowSmallUpIcon' | 'ArrowTopRightOnSquareIcon' | 'ArrowTrendingDownIcon' | 'ArrowTrendingUpIcon' | 'ArrowUpCircleIcon' | 'ArrowUpLeftIcon' | 'ArrowUpOnSquareStackIcon' | 'ArrowUpOnSquareIcon' | 'ArrowUpRightIcon' | 'ArrowUpTrayIcon' | 'ArrowUpIcon' | 'ArrowUturnDownIcon' | 'ArrowUturnLeftIcon' | 'ArrowUturnRightIcon' | 'ArrowUturnUpIcon' | 'ArrowsPointingInIcon' | 'ArrowsPointingOutIcon' | 'ArrowsRightLeftIcon' | 'ArrowsUpDownIcon' | 'AtSymbolIcon' | 'BackspaceIcon' | 'BackwardIcon' | 'BanknotesIcon' | 'Bars2Icon' | 'Bars3BottomLeftIcon' | 'Bars3BottomRightIcon' | 'Bars3CenterLeftIcon' | 'Bars3Icon' | 'Bars4Icon' | 'BarsArrowDownIcon' | 'BarsArrowUpIcon' | 'Battery0Icon' | 'Battery100Icon' | 'Battery50Icon' | 'BeakerIcon' | 'BellAlertIcon' | 'BellSlashIcon' | 'BellSnoozeIcon' | 'BellIcon' | 'BoltSlashIcon' | 'BoltIcon' | 'BookOpenIcon' | 'BookmarkSlashIcon' | 'BookmarkSquareIcon' | 'BookmarkIcon' | 'BriefcaseIcon' | 'BugAntIcon' | 'BuildingLibraryIcon' | 'BuildingOffice2Icon' | 'BuildingOfficeIcon' | 'BuildingStorefrontIcon' | 'CakeIcon' | 'CalculatorIcon' | 'CalendarDaysIcon' | 'CalendarIcon' | 'CameraIcon' | 'ChartBarSquareIcon' | 'ChartBarIcon' | 'ChartPieIcon' | 'ChatBubbleBottomCenterTextIcon' | 'ChatBubbleBottomCenterIcon' | 'ChatBubbleLeftEllipsisIcon' | 'ChatBubbleLeftRightIcon' | 'ChatBubbleLeftIcon' | 'ChatBubbleOvalLeftEllipsisIcon' | 'ChatBubbleOvalLeftIcon' | 'CheckBadgeIcon' | 'CheckCircleIcon' | 'CheckIcon' | 'ChevronDoubleDownIcon' | 'ChevronDoubleLeftIcon' | 'ChevronDoubleRightIcon' | 'ChevronDoubleUpIcon' | 'ChevronDownIcon' | 'ChevronLeftIcon' | 'ChevronRightIcon' | 'ChevronUpDownIcon' | 'ChevronUpIcon' | 'CircleStackIcon' | 'ClipboardDocumentCheckIcon' | 'ClipboardDocumentListIcon' | 'ClipboardDocumentIcon' | 'ClipboardIcon' | 'ClockIcon' | 'CloudArrowDownIcon' | 'CloudArrowUpIcon' | 'CloudIcon' | 'CodeBracketSquareIcon' | 'CodeBracketIcon' | 'Cog6ToothIcon' | 'Cog8ToothIcon' | 'CogIcon' | 'CommandLineIcon' | 'ComputerDesktopIcon' | 'CpuChipIcon' | 'CreditCardIcon' | 'CubeTransparentIcon' | 'CubeIcon' | 'CurrencyBangladeshiIcon' | 'CurrencyDollarIcon' | 'CurrencyEuroIcon' | 'CurrencyPoundIcon' | 'CurrencyRupeeIcon' | 'CurrencyYenIcon' | 'CursorArrowRaysIcon' | 'CursorArrowRippleIcon' | 'DevicePhoneMobileIcon' | 'DeviceTabletIcon' | 'DocumentArrowDownIcon' | 'DocumentArrowUpIcon' | 'DocumentChartBarIcon' | 'DocumentCheckIcon' | 'DocumentDuplicateIcon' | 'DocumentMagnifyingGlassIcon' | 'DocumentMinusIcon' | 'DocumentPlusIcon' | 'DocumentTextIcon' | 'DocumentIcon' | 'EllipsisHorizontalCircleIcon' | 'EllipsisHorizontalIcon' | 'EllipsisVerticalIcon' | 'EnvelopeOpenIcon' | 'EnvelopeIcon' | 'ExclamationCircleIcon' | 'ExclamationTriangleIcon' | 'EyeDropperIcon' | 'EyeSlashIcon' | 'EyeIcon' | 'FaceFrownIcon' | 'FaceSmileIcon' | 'FilmIcon' | 'FingerPrintIcon' | 'FireIcon' | 'FlagIcon' | 'FolderArrowDownIcon' | 'FolderMinusIcon' | 'FolderOpenIcon' | 'FolderPlusIcon' | 'FolderIcon' | 'ForwardIcon' | 'FunnelIcon' | 'GifIcon' | 'GiftTopIcon' | 'GiftIcon' | 'GlobeAltIcon' | 'GlobeAmericasIcon' | 'GlobeAsiaAustraliaIcon' | 'GlobeEuropeAfricaIcon' | 'HandRaisedIcon' | 'HandThumbDownIcon' | 'HandThumbUpIcon' | 'HashtagIcon' | 'HeartIcon' | 'HomeModernIcon' | 'HomeIcon' | 'IdentificationIcon' | 'InboxArrowDownIcon' | 'InboxStackIcon' | 'InboxIcon' | 'InformationCircleIcon' | 'KeyIcon' | 'LanguageIcon' | 'LifebuoyIcon' | 'LightBulbIcon' | 'LinkIcon' | 'ListBulletIcon' | 'LockClosedIcon' | 'LockOpenIcon' | 'MagnifyingGlassCircleIcon' | 'MagnifyingGlassMinusIcon' | 'MagnifyingGlassPlusIcon' | 'MagnifyingGlassIcon' | 'MapPinIcon' | 'MapIcon' | 'MegaphoneIcon' | 'MicrophoneIcon' | 'MinusCircleIcon' | 'MinusSmallIcon' | 'MinusIcon' | 'MoonIcon' | 'MusicalNoteIcon' | 'NewspaperIcon' | 'NoSymbolIcon' | 'PaintBrushIcon' | 'PaperAirplaneIcon' | 'PaperClipIcon' | 'PauseCircleIcon' | 'PauseIcon' | 'PencilSquareIcon' | 'PencilIcon' | 'PhoneArrowDownLeftIcon' | 'PhoneArrowUpRightIcon' | 'PhoneXMarkIcon' | 'PhoneIcon' | 'PhotoIcon' | 'PlayCircleIcon' | 'PlayPauseIcon' | 'PlayIcon' | 'PlusCircleIcon' | 'PlusSmallIcon' | 'PlusIcon' | 'PowerIcon' | 'PresentationChartBarIcon' | 'PresentationChartLineIcon' | 'PrinterIcon' | 'PuzzlePieceIcon' | 'QrCodeIcon' | 'QuestionMarkCircleIcon' | 'QueueListIcon' | 'RadioIcon' | 'ReceiptPercentIcon' | 'ReceiptRefundIcon' | 'RectangleGroupIcon' | 'RectangleStackIcon' | 'RocketLaunchIcon' | 'RssIcon' | 'ScaleIcon' | 'ScissorsIcon' | 'ServerStackIcon' | 'ServerIcon' | 'ShareIcon' | 'ShieldCheckIcon' | 'ShieldExclamationIcon' | 'ShoppingBagIcon' | 'ShoppingCartIcon' | 'SignalSlashIcon' | 'SignalIcon' | 'SparklesIcon' | 'SpeakerWaveIcon' | 'SpeakerXMarkIcon' | 'Square2StackIcon' | 'Square3Stack3DIcon' | 'Squares2X2Icon' | 'SquaresPlusIcon' | 'StarIcon' | 'StopCircleIcon' | 'StopIcon' | 'SunIcon' | 'SwatchIcon' | 'TableCellsIcon' | 'TagIcon' | 'TicketIcon' | 'TrashIcon' | 'TrophyIcon' | 'TruckIcon' | 'TvIcon' | 'UserCircleIcon' | 'UserGroupIcon' | 'UserMinusIcon' | 'UserPlusIcon' | 'UserIcon' | 'UsersIcon' | 'VariableIcon' | 'VideoCameraSlashIcon' | 'VideoCameraIcon' | 'ViewColumnsIcon' | 'ViewfinderCircleIcon' | 'WalletIcon' | 'WifiIcon' | 'WindowIcon' | 'WrenchScrewdriverIcon' | 'WrenchIcon' | 'XCircleIcon' | 'XMarkIcon';
		name: string;
		description?: string;
		dateFormat: string;
		datetimeFormat: string;
		timeFormat: string;
		defaultMenu?: string;
		defaultCurrency?: 'AED' | 'AFN' | 'ALL' | 'AMD' | 'ANG' | 'AOA' | 'ARS' | 'AUD' | 'AWG' | 'AZN' | 'BAM' | 'BBD' | 'BDT' | 'BGN' | 'BHD' | 'BIF' | 'BMD' | 'BND' | 'BOB' | 'BOV' | 'BRL' | 'BSD' | 'BTN' | 'BWP' | 'BYN' | 'BZD' | 'CAD' | 'CDF' | 'CHE' | 'CHF' | 'CHW' | 'CLF' | 'CLP' | 'COP' | 'COU' | 'CRC' | 'CUP' | 'CVE' | 'CZK' | 'DJF' | 'DKK' | 'DOP' | 'DZD' | 'EGP' | 'ERN' | 'ETB' | 'EUR' | 'FJD' | 'FKP' | 'GBP' | 'GEL' | 'GHS' | 'GIP' | 'GMD' | 'GNF' | 'GTQ' | 'GYD' | 'HKD' | 'HNL' | 'HTG' | 'HUF' | 'IDR' | 'ILS' | 'INR' | 'IQD' | 'IRR' | 'ISK' | 'JMD' | 'JOD' | 'JPY' | 'KES' | 'KGS' | 'KHR' | 'KMF' | 'KPW' | 'KRW' | 'KWD' | 'KYD' | 'KZT' | 'LAK' | 'LBP' | 'LKR' | 'LRD' | 'LSL' | 'LYD' | 'MAD' | 'MDL' | 'MGA' | 'MKD' | 'MMK' | 'MNT' | 'MOP' | 'MRU' | 'MUR' | 'MVR' | 'MWK' | 'MXN' | 'MXV' | 'MYR' | 'MZN' | 'NAD' | 'NGN' | 'NIO' | 'NOK' | 'NPR' | 'NZD' | 'OMR' | 'PAB' | 'PEN' | 'PGK' | 'PHP' | 'PKR' | 'PLN' | 'PYG' | 'QAR' | 'RON' | 'RSD' | 'CNY' | 'RUB' | 'RWF' | 'SAR' | 'SBD' | 'SCR' | 'SDG' | 'SEK' | 'SGD' | 'SHP' | 'SLE' | 'SLL' | 'SOS' | 'SRD' | 'SSP' | 'STN' | 'SVC' | 'SYP' | 'SZL' | 'THB' | 'TJS' | 'TMT' | 'TND' | 'TOP' | 'TRY' | 'TTD' | 'TWD' | 'TZS' | 'UAH' | 'UGX' | 'USD' | 'USN' | 'UYI' | 'UYU' | 'UYW' | 'UZS' | 'VED' | 'VES' | 'VND' | 'VUV' | 'WST' | 'XAF' | 'XAG' | 'XAU' | 'XBA' | 'XBB' | 'XBC' | 'XBD' | 'XCD' | 'XDR' | 'XOF' | 'XPD' | 'XPF' | 'XPT' | 'XSU' | 'XTS' | 'XUA' | 'XXX' | 'YER' | 'ZAR' | 'ZMW' | 'ZWL';
	}[];
};

export type HighSystemsResponsePostApplication = {
	success: boolean;
	results: string;
};

export type HighSystemsResponseDeleteApplication = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetApplication = {
	success: boolean;
	results: {
		id: string;
		icon?: '' | 'AcademicCapIcon' | 'AdjustmentsHorizontalIcon' | 'AdjustmentsVerticalIcon' | 'ArchiveBoxArrowDownIcon' | 'ArchiveBoxXMarkIcon' | 'ArchiveBoxIcon' | 'ArrowDownCircleIcon' | 'ArrowDownLeftIcon' | 'ArrowDownOnSquareStackIcon' | 'ArrowDownOnSquareIcon' | 'ArrowDownRightIcon' | 'ArrowDownTrayIcon' | 'ArrowDownIcon' | 'ArrowLeftCircleIcon' | 'ArrowLeftOnRectangleIcon' | 'ArrowLeftIcon' | 'ArrowLongDownIcon' | 'ArrowLongLeftIcon' | 'ArrowLongRightIcon' | 'ArrowLongUpIcon' | 'ArrowPathRoundedSquareIcon' | 'ArrowPathIcon' | 'ArrowRightCircleIcon' | 'ArrowRightOnRectangleIcon' | 'ArrowRightIcon' | 'ArrowSmallDownIcon' | 'ArrowSmallLeftIcon' | 'ArrowSmallRightIcon' | 'ArrowSmallUpIcon' | 'ArrowTopRightOnSquareIcon' | 'ArrowTrendingDownIcon' | 'ArrowTrendingUpIcon' | 'ArrowUpCircleIcon' | 'ArrowUpLeftIcon' | 'ArrowUpOnSquareStackIcon' | 'ArrowUpOnSquareIcon' | 'ArrowUpRightIcon' | 'ArrowUpTrayIcon' | 'ArrowUpIcon' | 'ArrowUturnDownIcon' | 'ArrowUturnLeftIcon' | 'ArrowUturnRightIcon' | 'ArrowUturnUpIcon' | 'ArrowsPointingInIcon' | 'ArrowsPointingOutIcon' | 'ArrowsRightLeftIcon' | 'ArrowsUpDownIcon' | 'AtSymbolIcon' | 'BackspaceIcon' | 'BackwardIcon' | 'BanknotesIcon' | 'Bars2Icon' | 'Bars3BottomLeftIcon' | 'Bars3BottomRightIcon' | 'Bars3CenterLeftIcon' | 'Bars3Icon' | 'Bars4Icon' | 'BarsArrowDownIcon' | 'BarsArrowUpIcon' | 'Battery0Icon' | 'Battery100Icon' | 'Battery50Icon' | 'BeakerIcon' | 'BellAlertIcon' | 'BellSlashIcon' | 'BellSnoozeIcon' | 'BellIcon' | 'BoltSlashIcon' | 'BoltIcon' | 'BookOpenIcon' | 'BookmarkSlashIcon' | 'BookmarkSquareIcon' | 'BookmarkIcon' | 'BriefcaseIcon' | 'BugAntIcon' | 'BuildingLibraryIcon' | 'BuildingOffice2Icon' | 'BuildingOfficeIcon' | 'BuildingStorefrontIcon' | 'CakeIcon' | 'CalculatorIcon' | 'CalendarDaysIcon' | 'CalendarIcon' | 'CameraIcon' | 'ChartBarSquareIcon' | 'ChartBarIcon' | 'ChartPieIcon' | 'ChatBubbleBottomCenterTextIcon' | 'ChatBubbleBottomCenterIcon' | 'ChatBubbleLeftEllipsisIcon' | 'ChatBubbleLeftRightIcon' | 'ChatBubbleLeftIcon' | 'ChatBubbleOvalLeftEllipsisIcon' | 'ChatBubbleOvalLeftIcon' | 'CheckBadgeIcon' | 'CheckCircleIcon' | 'CheckIcon' | 'ChevronDoubleDownIcon' | 'ChevronDoubleLeftIcon' | 'ChevronDoubleRightIcon' | 'ChevronDoubleUpIcon' | 'ChevronDownIcon' | 'ChevronLeftIcon' | 'ChevronRightIcon' | 'ChevronUpDownIcon' | 'ChevronUpIcon' | 'CircleStackIcon' | 'ClipboardDocumentCheckIcon' | 'ClipboardDocumentListIcon' | 'ClipboardDocumentIcon' | 'ClipboardIcon' | 'ClockIcon' | 'CloudArrowDownIcon' | 'CloudArrowUpIcon' | 'CloudIcon' | 'CodeBracketSquareIcon' | 'CodeBracketIcon' | 'Cog6ToothIcon' | 'Cog8ToothIcon' | 'CogIcon' | 'CommandLineIcon' | 'ComputerDesktopIcon' | 'CpuChipIcon' | 'CreditCardIcon' | 'CubeTransparentIcon' | 'CubeIcon' | 'CurrencyBangladeshiIcon' | 'CurrencyDollarIcon' | 'CurrencyEuroIcon' | 'CurrencyPoundIcon' | 'CurrencyRupeeIcon' | 'CurrencyYenIcon' | 'CursorArrowRaysIcon' | 'CursorArrowRippleIcon' | 'DevicePhoneMobileIcon' | 'DeviceTabletIcon' | 'DocumentArrowDownIcon' | 'DocumentArrowUpIcon' | 'DocumentChartBarIcon' | 'DocumentCheckIcon' | 'DocumentDuplicateIcon' | 'DocumentMagnifyingGlassIcon' | 'DocumentMinusIcon' | 'DocumentPlusIcon' | 'DocumentTextIcon' | 'DocumentIcon' | 'EllipsisHorizontalCircleIcon' | 'EllipsisHorizontalIcon' | 'EllipsisVerticalIcon' | 'EnvelopeOpenIcon' | 'EnvelopeIcon' | 'ExclamationCircleIcon' | 'ExclamationTriangleIcon' | 'EyeDropperIcon' | 'EyeSlashIcon' | 'EyeIcon' | 'FaceFrownIcon' | 'FaceSmileIcon' | 'FilmIcon' | 'FingerPrintIcon' | 'FireIcon' | 'FlagIcon' | 'FolderArrowDownIcon' | 'FolderMinusIcon' | 'FolderOpenIcon' | 'FolderPlusIcon' | 'FolderIcon' | 'ForwardIcon' | 'FunnelIcon' | 'GifIcon' | 'GiftTopIcon' | 'GiftIcon' | 'GlobeAltIcon' | 'GlobeAmericasIcon' | 'GlobeAsiaAustraliaIcon' | 'GlobeEuropeAfricaIcon' | 'HandRaisedIcon' | 'HandThumbDownIcon' | 'HandThumbUpIcon' | 'HashtagIcon' | 'HeartIcon' | 'HomeModernIcon' | 'HomeIcon' | 'IdentificationIcon' | 'InboxArrowDownIcon' | 'InboxStackIcon' | 'InboxIcon' | 'InformationCircleIcon' | 'KeyIcon' | 'LanguageIcon' | 'LifebuoyIcon' | 'LightBulbIcon' | 'LinkIcon' | 'ListBulletIcon' | 'LockClosedIcon' | 'LockOpenIcon' | 'MagnifyingGlassCircleIcon' | 'MagnifyingGlassMinusIcon' | 'MagnifyingGlassPlusIcon' | 'MagnifyingGlassIcon' | 'MapPinIcon' | 'MapIcon' | 'MegaphoneIcon' | 'MicrophoneIcon' | 'MinusCircleIcon' | 'MinusSmallIcon' | 'MinusIcon' | 'MoonIcon' | 'MusicalNoteIcon' | 'NewspaperIcon' | 'NoSymbolIcon' | 'PaintBrushIcon' | 'PaperAirplaneIcon' | 'PaperClipIcon' | 'PauseCircleIcon' | 'PauseIcon' | 'PencilSquareIcon' | 'PencilIcon' | 'PhoneArrowDownLeftIcon' | 'PhoneArrowUpRightIcon' | 'PhoneXMarkIcon' | 'PhoneIcon' | 'PhotoIcon' | 'PlayCircleIcon' | 'PlayPauseIcon' | 'PlayIcon' | 'PlusCircleIcon' | 'PlusSmallIcon' | 'PlusIcon' | 'PowerIcon' | 'PresentationChartBarIcon' | 'PresentationChartLineIcon' | 'PrinterIcon' | 'PuzzlePieceIcon' | 'QrCodeIcon' | 'QuestionMarkCircleIcon' | 'QueueListIcon' | 'RadioIcon' | 'ReceiptPercentIcon' | 'ReceiptRefundIcon' | 'RectangleGroupIcon' | 'RectangleStackIcon' | 'RocketLaunchIcon' | 'RssIcon' | 'ScaleIcon' | 'ScissorsIcon' | 'ServerStackIcon' | 'ServerIcon' | 'ShareIcon' | 'ShieldCheckIcon' | 'ShieldExclamationIcon' | 'ShoppingBagIcon' | 'ShoppingCartIcon' | 'SignalSlashIcon' | 'SignalIcon' | 'SparklesIcon' | 'SpeakerWaveIcon' | 'SpeakerXMarkIcon' | 'Square2StackIcon' | 'Square3Stack3DIcon' | 'Squares2X2Icon' | 'SquaresPlusIcon' | 'StarIcon' | 'StopCircleIcon' | 'StopIcon' | 'SunIcon' | 'SwatchIcon' | 'TableCellsIcon' | 'TagIcon' | 'TicketIcon' | 'TrashIcon' | 'TrophyIcon' | 'TruckIcon' | 'TvIcon' | 'UserCircleIcon' | 'UserGroupIcon' | 'UserMinusIcon' | 'UserPlusIcon' | 'UserIcon' | 'UsersIcon' | 'VariableIcon' | 'VideoCameraSlashIcon' | 'VideoCameraIcon' | 'ViewColumnsIcon' | 'ViewfinderCircleIcon' | 'WalletIcon' | 'WifiIcon' | 'WindowIcon' | 'WrenchScrewdriverIcon' | 'WrenchIcon' | 'XCircleIcon' | 'XMarkIcon';
		name: string;
		description?: string;
		dateFormat: string;
		datetimeFormat: string;
		timeFormat: string;
		defaultMenu?: string;
		defaultCurrency?: 'AED' | 'AFN' | 'ALL' | 'AMD' | 'ANG' | 'AOA' | 'ARS' | 'AUD' | 'AWG' | 'AZN' | 'BAM' | 'BBD' | 'BDT' | 'BGN' | 'BHD' | 'BIF' | 'BMD' | 'BND' | 'BOB' | 'BOV' | 'BRL' | 'BSD' | 'BTN' | 'BWP' | 'BYN' | 'BZD' | 'CAD' | 'CDF' | 'CHE' | 'CHF' | 'CHW' | 'CLF' | 'CLP' | 'COP' | 'COU' | 'CRC' | 'CUP' | 'CVE' | 'CZK' | 'DJF' | 'DKK' | 'DOP' | 'DZD' | 'EGP' | 'ERN' | 'ETB' | 'EUR' | 'FJD' | 'FKP' | 'GBP' | 'GEL' | 'GHS' | 'GIP' | 'GMD' | 'GNF' | 'GTQ' | 'GYD' | 'HKD' | 'HNL' | 'HTG' | 'HUF' | 'IDR' | 'ILS' | 'INR' | 'IQD' | 'IRR' | 'ISK' | 'JMD' | 'JOD' | 'JPY' | 'KES' | 'KGS' | 'KHR' | 'KMF' | 'KPW' | 'KRW' | 'KWD' | 'KYD' | 'KZT' | 'LAK' | 'LBP' | 'LKR' | 'LRD' | 'LSL' | 'LYD' | 'MAD' | 'MDL' | 'MGA' | 'MKD' | 'MMK' | 'MNT' | 'MOP' | 'MRU' | 'MUR' | 'MVR' | 'MWK' | 'MXN' | 'MXV' | 'MYR' | 'MZN' | 'NAD' | 'NGN' | 'NIO' | 'NOK' | 'NPR' | 'NZD' | 'OMR' | 'PAB' | 'PEN' | 'PGK' | 'PHP' | 'PKR' | 'PLN' | 'PYG' | 'QAR' | 'RON' | 'RSD' | 'CNY' | 'RUB' | 'RWF' | 'SAR' | 'SBD' | 'SCR' | 'SDG' | 'SEK' | 'SGD' | 'SHP' | 'SLE' | 'SLL' | 'SOS' | 'SRD' | 'SSP' | 'STN' | 'SVC' | 'SYP' | 'SZL' | 'THB' | 'TJS' | 'TMT' | 'TND' | 'TOP' | 'TRY' | 'TTD' | 'TWD' | 'TZS' | 'UAH' | 'UGX' | 'USD' | 'USN' | 'UYI' | 'UYU' | 'UYW' | 'UZS' | 'VED' | 'VES' | 'VND' | 'VUV' | 'WST' | 'XAF' | 'XAG' | 'XAU' | 'XBA' | 'XBB' | 'XBC' | 'XBD' | 'XCD' | 'XDR' | 'XOF' | 'XPD' | 'XPF' | 'XPT' | 'XSU' | 'XTS' | 'XUA' | 'XXX' | 'YER' | 'ZAR' | 'ZMW' | 'ZWL';
	};
};

export type HighSystemsResponsePutApplication = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetApplicationMenus = {
	success: boolean;
	results: {
		id: string;
		relatedApplication: string;
		name: string;
		groups: any;
	}[];
};

export type HighSystemsResponsePostApplicationMenu = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseDeleteApplicationMenu = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetApplicationMenu = {
	success: boolean;
	results: {
		id: string;
		relatedApplication: string;
		name: string;
		groups: any;
	};
};

export type HighSystemsResponsePutApplicationMenu = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetApplicationUserMenu = {
	success: boolean;
	results: {
		id: string;
		relatedApplication: string;
		name: string;
		groups: any;
	};
};

export type HighSystemsResponseGetVariables = {
	success: boolean;
	results: {
		id: string;
		relatedApplication: string;
		name: string;
		value?: string;
	}[];
};

export type HighSystemsResponseGetVariable = {
	success: boolean;
	results: {
		id: string;
		relatedApplication: string;
		name: string;
		value?: string;
	};
};

export type HighSystemsResponsePostVariable = {
	success: boolean;
	results: string;
};

export type HighSystemsResponseDeleteVariable = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponsePutVariable = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetRoles = {
	success: boolean;
	results: {
		id: string;
		relatedApplication: string;
		name: string;
		description?: string;
		isAdmin?: boolean;
		isLimitedAdmin?: boolean;
		canInvite?: boolean;
		readonly?: boolean;
		defaultDashboard?: string;
		relatedMenu?: string;
	}[];
};

export type HighSystemsResponseGetRole = {
	success: boolean;
	results: {
		id: string;
		relatedApplication: string;
		name: string;
		description?: string;
		isAdmin?: boolean;
		isLimitedAdmin?: boolean;
		canInvite?: boolean;
		readonly?: boolean;
		defaultDashboard?: string;
		relatedMenu?: string;
	};
};

export type HighSystemsResponsePostRole = {
	success: boolean;
	results: string;
};

export type HighSystemsResponseDeleteRole = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponsePutRole = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetRolePermissions = {
	success: boolean;
	results: {
		tables: {
			relatedTable: string;
			hasAccess: boolean;
			add: boolean;
			edit: boolean;
			editCondition?: string;
			view: boolean;
			viewCondition?: string;
			delete: boolean;
			deleteCondition?: string;
			defaultDashboard?: string;
			defaultForm?: string;
			settings: boolean;
			permissions: boolean;
		}[];
		fields: {
			relatedTable: string;
			relatedField: string;
			hasAccess: boolean;
			add: boolean;
			edit: boolean;
			view: boolean;
		}[];
	};
};

export type HighSystemsResponseGetRoleDefaults = {
	success: boolean;
	results: {
		relatedTable: string;
		defaultDashboard?: string;
		defaultForm?: string;
	}[];
};

export type HighSystemsResponseGetApplicationUsers = {
	success: boolean;
	results: {
		id: string;
		email: string;
		firstName: string;
		middleName: string;
		lastName: string;
		isRealmAdmin: boolean;
		isRealmLimitedAdmin: boolean;
		reset: boolean;
		valid: boolean;
		relatedRole: string;
		relatedApplication: string;
		isAdmin?: boolean;
		isLimitedAdmin?: boolean;
		canInvite?: boolean;
		readonly?: boolean;
		roleName: string;
	}[];
};

export type HighSystemsResponseGetApplicationUser = {
	success: boolean;
	results: {
		id: string;
		email: string;
		firstName: string;
		middleName: string;
		lastName: string;
		isRealmAdmin: boolean;
		isRealmLimitedAdmin: boolean;
		reset: boolean;
		valid: boolean;
		relatedRole: string;
		relatedApplication: string;
		isAdmin?: boolean;
		isLimitedAdmin?: boolean;
		canInvite?: boolean;
		readonly?: boolean;
		roleName: string;
	};
};

export type HighSystemsResponsePostApplicationUser = {
	success: boolean;
	results: string;
};

export type HighSystemsResponsePutApplicationUser = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseDeleteApplicationUser = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetTables = {
	success: boolean;
	results: {
		id: string;
		relatedApplication: string;
		icon?: '' | 'AcademicCapIcon' | 'AdjustmentsHorizontalIcon' | 'AdjustmentsVerticalIcon' | 'ArchiveBoxArrowDownIcon' | 'ArchiveBoxXMarkIcon' | 'ArchiveBoxIcon' | 'ArrowDownCircleIcon' | 'ArrowDownLeftIcon' | 'ArrowDownOnSquareStackIcon' | 'ArrowDownOnSquareIcon' | 'ArrowDownRightIcon' | 'ArrowDownTrayIcon' | 'ArrowDownIcon' | 'ArrowLeftCircleIcon' | 'ArrowLeftOnRectangleIcon' | 'ArrowLeftIcon' | 'ArrowLongDownIcon' | 'ArrowLongLeftIcon' | 'ArrowLongRightIcon' | 'ArrowLongUpIcon' | 'ArrowPathRoundedSquareIcon' | 'ArrowPathIcon' | 'ArrowRightCircleIcon' | 'ArrowRightOnRectangleIcon' | 'ArrowRightIcon' | 'ArrowSmallDownIcon' | 'ArrowSmallLeftIcon' | 'ArrowSmallRightIcon' | 'ArrowSmallUpIcon' | 'ArrowTopRightOnSquareIcon' | 'ArrowTrendingDownIcon' | 'ArrowTrendingUpIcon' | 'ArrowUpCircleIcon' | 'ArrowUpLeftIcon' | 'ArrowUpOnSquareStackIcon' | 'ArrowUpOnSquareIcon' | 'ArrowUpRightIcon' | 'ArrowUpTrayIcon' | 'ArrowUpIcon' | 'ArrowUturnDownIcon' | 'ArrowUturnLeftIcon' | 'ArrowUturnRightIcon' | 'ArrowUturnUpIcon' | 'ArrowsPointingInIcon' | 'ArrowsPointingOutIcon' | 'ArrowsRightLeftIcon' | 'ArrowsUpDownIcon' | 'AtSymbolIcon' | 'BackspaceIcon' | 'BackwardIcon' | 'BanknotesIcon' | 'Bars2Icon' | 'Bars3BottomLeftIcon' | 'Bars3BottomRightIcon' | 'Bars3CenterLeftIcon' | 'Bars3Icon' | 'Bars4Icon' | 'BarsArrowDownIcon' | 'BarsArrowUpIcon' | 'Battery0Icon' | 'Battery100Icon' | 'Battery50Icon' | 'BeakerIcon' | 'BellAlertIcon' | 'BellSlashIcon' | 'BellSnoozeIcon' | 'BellIcon' | 'BoltSlashIcon' | 'BoltIcon' | 'BookOpenIcon' | 'BookmarkSlashIcon' | 'BookmarkSquareIcon' | 'BookmarkIcon' | 'BriefcaseIcon' | 'BugAntIcon' | 'BuildingLibraryIcon' | 'BuildingOffice2Icon' | 'BuildingOfficeIcon' | 'BuildingStorefrontIcon' | 'CakeIcon' | 'CalculatorIcon' | 'CalendarDaysIcon' | 'CalendarIcon' | 'CameraIcon' | 'ChartBarSquareIcon' | 'ChartBarIcon' | 'ChartPieIcon' | 'ChatBubbleBottomCenterTextIcon' | 'ChatBubbleBottomCenterIcon' | 'ChatBubbleLeftEllipsisIcon' | 'ChatBubbleLeftRightIcon' | 'ChatBubbleLeftIcon' | 'ChatBubbleOvalLeftEllipsisIcon' | 'ChatBubbleOvalLeftIcon' | 'CheckBadgeIcon' | 'CheckCircleIcon' | 'CheckIcon' | 'ChevronDoubleDownIcon' | 'ChevronDoubleLeftIcon' | 'ChevronDoubleRightIcon' | 'ChevronDoubleUpIcon' | 'ChevronDownIcon' | 'ChevronLeftIcon' | 'ChevronRightIcon' | 'ChevronUpDownIcon' | 'ChevronUpIcon' | 'CircleStackIcon' | 'ClipboardDocumentCheckIcon' | 'ClipboardDocumentListIcon' | 'ClipboardDocumentIcon' | 'ClipboardIcon' | 'ClockIcon' | 'CloudArrowDownIcon' | 'CloudArrowUpIcon' | 'CloudIcon' | 'CodeBracketSquareIcon' | 'CodeBracketIcon' | 'Cog6ToothIcon' | 'Cog8ToothIcon' | 'CogIcon' | 'CommandLineIcon' | 'ComputerDesktopIcon' | 'CpuChipIcon' | 'CreditCardIcon' | 'CubeTransparentIcon' | 'CubeIcon' | 'CurrencyBangladeshiIcon' | 'CurrencyDollarIcon' | 'CurrencyEuroIcon' | 'CurrencyPoundIcon' | 'CurrencyRupeeIcon' | 'CurrencyYenIcon' | 'CursorArrowRaysIcon' | 'CursorArrowRippleIcon' | 'DevicePhoneMobileIcon' | 'DeviceTabletIcon' | 'DocumentArrowDownIcon' | 'DocumentArrowUpIcon' | 'DocumentChartBarIcon' | 'DocumentCheckIcon' | 'DocumentDuplicateIcon' | 'DocumentMagnifyingGlassIcon' | 'DocumentMinusIcon' | 'DocumentPlusIcon' | 'DocumentTextIcon' | 'DocumentIcon' | 'EllipsisHorizontalCircleIcon' | 'EllipsisHorizontalIcon' | 'EllipsisVerticalIcon' | 'EnvelopeOpenIcon' | 'EnvelopeIcon' | 'ExclamationCircleIcon' | 'ExclamationTriangleIcon' | 'EyeDropperIcon' | 'EyeSlashIcon' | 'EyeIcon' | 'FaceFrownIcon' | 'FaceSmileIcon' | 'FilmIcon' | 'FingerPrintIcon' | 'FireIcon' | 'FlagIcon' | 'FolderArrowDownIcon' | 'FolderMinusIcon' | 'FolderOpenIcon' | 'FolderPlusIcon' | 'FolderIcon' | 'ForwardIcon' | 'FunnelIcon' | 'GifIcon' | 'GiftTopIcon' | 'GiftIcon' | 'GlobeAltIcon' | 'GlobeAmericasIcon' | 'GlobeAsiaAustraliaIcon' | 'GlobeEuropeAfricaIcon' | 'HandRaisedIcon' | 'HandThumbDownIcon' | 'HandThumbUpIcon' | 'HashtagIcon' | 'HeartIcon' | 'HomeModernIcon' | 'HomeIcon' | 'IdentificationIcon' | 'InboxArrowDownIcon' | 'InboxStackIcon' | 'InboxIcon' | 'InformationCircleIcon' | 'KeyIcon' | 'LanguageIcon' | 'LifebuoyIcon' | 'LightBulbIcon' | 'LinkIcon' | 'ListBulletIcon' | 'LockClosedIcon' | 'LockOpenIcon' | 'MagnifyingGlassCircleIcon' | 'MagnifyingGlassMinusIcon' | 'MagnifyingGlassPlusIcon' | 'MagnifyingGlassIcon' | 'MapPinIcon' | 'MapIcon' | 'MegaphoneIcon' | 'MicrophoneIcon' | 'MinusCircleIcon' | 'MinusSmallIcon' | 'MinusIcon' | 'MoonIcon' | 'MusicalNoteIcon' | 'NewspaperIcon' | 'NoSymbolIcon' | 'PaintBrushIcon' | 'PaperAirplaneIcon' | 'PaperClipIcon' | 'PauseCircleIcon' | 'PauseIcon' | 'PencilSquareIcon' | 'PencilIcon' | 'PhoneArrowDownLeftIcon' | 'PhoneArrowUpRightIcon' | 'PhoneXMarkIcon' | 'PhoneIcon' | 'PhotoIcon' | 'PlayCircleIcon' | 'PlayPauseIcon' | 'PlayIcon' | 'PlusCircleIcon' | 'PlusSmallIcon' | 'PlusIcon' | 'PowerIcon' | 'PresentationChartBarIcon' | 'PresentationChartLineIcon' | 'PrinterIcon' | 'PuzzlePieceIcon' | 'QrCodeIcon' | 'QuestionMarkCircleIcon' | 'QueueListIcon' | 'RadioIcon' | 'ReceiptPercentIcon' | 'ReceiptRefundIcon' | 'RectangleGroupIcon' | 'RectangleStackIcon' | 'RocketLaunchIcon' | 'RssIcon' | 'ScaleIcon' | 'ScissorsIcon' | 'ServerStackIcon' | 'ServerIcon' | 'ShareIcon' | 'ShieldCheckIcon' | 'ShieldExclamationIcon' | 'ShoppingBagIcon' | 'ShoppingCartIcon' | 'SignalSlashIcon' | 'SignalIcon' | 'SparklesIcon' | 'SpeakerWaveIcon' | 'SpeakerXMarkIcon' | 'Square2StackIcon' | 'Square3Stack3DIcon' | 'Squares2X2Icon' | 'SquaresPlusIcon' | 'StarIcon' | 'StopCircleIcon' | 'StopIcon' | 'SunIcon' | 'SwatchIcon' | 'TableCellsIcon' | 'TagIcon' | 'TicketIcon' | 'TrashIcon' | 'TrophyIcon' | 'TruckIcon' | 'TvIcon' | 'UserCircleIcon' | 'UserGroupIcon' | 'UserMinusIcon' | 'UserPlusIcon' | 'UserIcon' | 'UsersIcon' | 'VariableIcon' | 'VideoCameraSlashIcon' | 'VideoCameraIcon' | 'ViewColumnsIcon' | 'ViewfinderCircleIcon' | 'WalletIcon' | 'WifiIcon' | 'WindowIcon' | 'WrenchScrewdriverIcon' | 'WrenchIcon' | 'XCircleIcon' | 'XMarkIcon';
		name: string;
		description?: string;
		singular: string;
		plural: string;
		recordPicker?: string[];
		recordLabel?: string;
		displayOnMenu?: boolean;
		defaultDashboard?: string;
		defaultForm?: string;
		dataRule?: string;
	}[];
};

export type HighSystemsResponseDeleteTable = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetTable = {
	success: boolean;
	results: {
		id: string;
		relatedApplication: string;
		icon?: '' | 'AcademicCapIcon' | 'AdjustmentsHorizontalIcon' | 'AdjustmentsVerticalIcon' | 'ArchiveBoxArrowDownIcon' | 'ArchiveBoxXMarkIcon' | 'ArchiveBoxIcon' | 'ArrowDownCircleIcon' | 'ArrowDownLeftIcon' | 'ArrowDownOnSquareStackIcon' | 'ArrowDownOnSquareIcon' | 'ArrowDownRightIcon' | 'ArrowDownTrayIcon' | 'ArrowDownIcon' | 'ArrowLeftCircleIcon' | 'ArrowLeftOnRectangleIcon' | 'ArrowLeftIcon' | 'ArrowLongDownIcon' | 'ArrowLongLeftIcon' | 'ArrowLongRightIcon' | 'ArrowLongUpIcon' | 'ArrowPathRoundedSquareIcon' | 'ArrowPathIcon' | 'ArrowRightCircleIcon' | 'ArrowRightOnRectangleIcon' | 'ArrowRightIcon' | 'ArrowSmallDownIcon' | 'ArrowSmallLeftIcon' | 'ArrowSmallRightIcon' | 'ArrowSmallUpIcon' | 'ArrowTopRightOnSquareIcon' | 'ArrowTrendingDownIcon' | 'ArrowTrendingUpIcon' | 'ArrowUpCircleIcon' | 'ArrowUpLeftIcon' | 'ArrowUpOnSquareStackIcon' | 'ArrowUpOnSquareIcon' | 'ArrowUpRightIcon' | 'ArrowUpTrayIcon' | 'ArrowUpIcon' | 'ArrowUturnDownIcon' | 'ArrowUturnLeftIcon' | 'ArrowUturnRightIcon' | 'ArrowUturnUpIcon' | 'ArrowsPointingInIcon' | 'ArrowsPointingOutIcon' | 'ArrowsRightLeftIcon' | 'ArrowsUpDownIcon' | 'AtSymbolIcon' | 'BackspaceIcon' | 'BackwardIcon' | 'BanknotesIcon' | 'Bars2Icon' | 'Bars3BottomLeftIcon' | 'Bars3BottomRightIcon' | 'Bars3CenterLeftIcon' | 'Bars3Icon' | 'Bars4Icon' | 'BarsArrowDownIcon' | 'BarsArrowUpIcon' | 'Battery0Icon' | 'Battery100Icon' | 'Battery50Icon' | 'BeakerIcon' | 'BellAlertIcon' | 'BellSlashIcon' | 'BellSnoozeIcon' | 'BellIcon' | 'BoltSlashIcon' | 'BoltIcon' | 'BookOpenIcon' | 'BookmarkSlashIcon' | 'BookmarkSquareIcon' | 'BookmarkIcon' | 'BriefcaseIcon' | 'BugAntIcon' | 'BuildingLibraryIcon' | 'BuildingOffice2Icon' | 'BuildingOfficeIcon' | 'BuildingStorefrontIcon' | 'CakeIcon' | 'CalculatorIcon' | 'CalendarDaysIcon' | 'CalendarIcon' | 'CameraIcon' | 'ChartBarSquareIcon' | 'ChartBarIcon' | 'ChartPieIcon' | 'ChatBubbleBottomCenterTextIcon' | 'ChatBubbleBottomCenterIcon' | 'ChatBubbleLeftEllipsisIcon' | 'ChatBubbleLeftRightIcon' | 'ChatBubbleLeftIcon' | 'ChatBubbleOvalLeftEllipsisIcon' | 'ChatBubbleOvalLeftIcon' | 'CheckBadgeIcon' | 'CheckCircleIcon' | 'CheckIcon' | 'ChevronDoubleDownIcon' | 'ChevronDoubleLeftIcon' | 'ChevronDoubleRightIcon' | 'ChevronDoubleUpIcon' | 'ChevronDownIcon' | 'ChevronLeftIcon' | 'ChevronRightIcon' | 'ChevronUpDownIcon' | 'ChevronUpIcon' | 'CircleStackIcon' | 'ClipboardDocumentCheckIcon' | 'ClipboardDocumentListIcon' | 'ClipboardDocumentIcon' | 'ClipboardIcon' | 'ClockIcon' | 'CloudArrowDownIcon' | 'CloudArrowUpIcon' | 'CloudIcon' | 'CodeBracketSquareIcon' | 'CodeBracketIcon' | 'Cog6ToothIcon' | 'Cog8ToothIcon' | 'CogIcon' | 'CommandLineIcon' | 'ComputerDesktopIcon' | 'CpuChipIcon' | 'CreditCardIcon' | 'CubeTransparentIcon' | 'CubeIcon' | 'CurrencyBangladeshiIcon' | 'CurrencyDollarIcon' | 'CurrencyEuroIcon' | 'CurrencyPoundIcon' | 'CurrencyRupeeIcon' | 'CurrencyYenIcon' | 'CursorArrowRaysIcon' | 'CursorArrowRippleIcon' | 'DevicePhoneMobileIcon' | 'DeviceTabletIcon' | 'DocumentArrowDownIcon' | 'DocumentArrowUpIcon' | 'DocumentChartBarIcon' | 'DocumentCheckIcon' | 'DocumentDuplicateIcon' | 'DocumentMagnifyingGlassIcon' | 'DocumentMinusIcon' | 'DocumentPlusIcon' | 'DocumentTextIcon' | 'DocumentIcon' | 'EllipsisHorizontalCircleIcon' | 'EllipsisHorizontalIcon' | 'EllipsisVerticalIcon' | 'EnvelopeOpenIcon' | 'EnvelopeIcon' | 'ExclamationCircleIcon' | 'ExclamationTriangleIcon' | 'EyeDropperIcon' | 'EyeSlashIcon' | 'EyeIcon' | 'FaceFrownIcon' | 'FaceSmileIcon' | 'FilmIcon' | 'FingerPrintIcon' | 'FireIcon' | 'FlagIcon' | 'FolderArrowDownIcon' | 'FolderMinusIcon' | 'FolderOpenIcon' | 'FolderPlusIcon' | 'FolderIcon' | 'ForwardIcon' | 'FunnelIcon' | 'GifIcon' | 'GiftTopIcon' | 'GiftIcon' | 'GlobeAltIcon' | 'GlobeAmericasIcon' | 'GlobeAsiaAustraliaIcon' | 'GlobeEuropeAfricaIcon' | 'HandRaisedIcon' | 'HandThumbDownIcon' | 'HandThumbUpIcon' | 'HashtagIcon' | 'HeartIcon' | 'HomeModernIcon' | 'HomeIcon' | 'IdentificationIcon' | 'InboxArrowDownIcon' | 'InboxStackIcon' | 'InboxIcon' | 'InformationCircleIcon' | 'KeyIcon' | 'LanguageIcon' | 'LifebuoyIcon' | 'LightBulbIcon' | 'LinkIcon' | 'ListBulletIcon' | 'LockClosedIcon' | 'LockOpenIcon' | 'MagnifyingGlassCircleIcon' | 'MagnifyingGlassMinusIcon' | 'MagnifyingGlassPlusIcon' | 'MagnifyingGlassIcon' | 'MapPinIcon' | 'MapIcon' | 'MegaphoneIcon' | 'MicrophoneIcon' | 'MinusCircleIcon' | 'MinusSmallIcon' | 'MinusIcon' | 'MoonIcon' | 'MusicalNoteIcon' | 'NewspaperIcon' | 'NoSymbolIcon' | 'PaintBrushIcon' | 'PaperAirplaneIcon' | 'PaperClipIcon' | 'PauseCircleIcon' | 'PauseIcon' | 'PencilSquareIcon' | 'PencilIcon' | 'PhoneArrowDownLeftIcon' | 'PhoneArrowUpRightIcon' | 'PhoneXMarkIcon' | 'PhoneIcon' | 'PhotoIcon' | 'PlayCircleIcon' | 'PlayPauseIcon' | 'PlayIcon' | 'PlusCircleIcon' | 'PlusSmallIcon' | 'PlusIcon' | 'PowerIcon' | 'PresentationChartBarIcon' | 'PresentationChartLineIcon' | 'PrinterIcon' | 'PuzzlePieceIcon' | 'QrCodeIcon' | 'QuestionMarkCircleIcon' | 'QueueListIcon' | 'RadioIcon' | 'ReceiptPercentIcon' | 'ReceiptRefundIcon' | 'RectangleGroupIcon' | 'RectangleStackIcon' | 'RocketLaunchIcon' | 'RssIcon' | 'ScaleIcon' | 'ScissorsIcon' | 'ServerStackIcon' | 'ServerIcon' | 'ShareIcon' | 'ShieldCheckIcon' | 'ShieldExclamationIcon' | 'ShoppingBagIcon' | 'ShoppingCartIcon' | 'SignalSlashIcon' | 'SignalIcon' | 'SparklesIcon' | 'SpeakerWaveIcon' | 'SpeakerXMarkIcon' | 'Square2StackIcon' | 'Square3Stack3DIcon' | 'Squares2X2Icon' | 'SquaresPlusIcon' | 'StarIcon' | 'StopCircleIcon' | 'StopIcon' | 'SunIcon' | 'SwatchIcon' | 'TableCellsIcon' | 'TagIcon' | 'TicketIcon' | 'TrashIcon' | 'TrophyIcon' | 'TruckIcon' | 'TvIcon' | 'UserCircleIcon' | 'UserGroupIcon' | 'UserMinusIcon' | 'UserPlusIcon' | 'UserIcon' | 'UsersIcon' | 'VariableIcon' | 'VideoCameraSlashIcon' | 'VideoCameraIcon' | 'ViewColumnsIcon' | 'ViewfinderCircleIcon' | 'WalletIcon' | 'WifiIcon' | 'WindowIcon' | 'WrenchScrewdriverIcon' | 'WrenchIcon' | 'XCircleIcon' | 'XMarkIcon';
		name: string;
		description?: string;
		singular: string;
		plural: string;
		recordPicker?: string[];
		recordLabel?: string;
		displayOnMenu?: boolean;
		defaultDashboard?: string;
		defaultForm?: string;
		dataRule?: string;
	};
};

export type HighSystemsResponsePutTable = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponsePostTable = {
	success: boolean;
	results: string;
};

export type HighSystemsResponseGetApplicationRelationships = {
	success: boolean;
	results: any;
};

export type HighSystemsResponseGetTableRelationships = {
	success: boolean;
	results: {
		parents: string[];
		children: string[];
	};
};

export type HighSystemsResponseGetApplicationFields = {
	success: boolean;
	results: any;
};

export type HighSystemsResponseGetFields = {
	success: boolean;
	results: any;
};

export type HighSystemsResponseDeleteField = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetField = {
	success: boolean;
	results: any;
};

export type HighSystemsResponsePostField = {
	success: boolean;
	results: string;
};

export type HighSystemsResponsePutField = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetApplicationReports = {
	success: boolean;
	results: any;
};

export type HighSystemsResponseGetReports = {
	success: boolean;
	results: any;
};

export type HighSystemsResponseDeleteReport = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetReport = {
	success: boolean;
	results: any;
};

export type HighSystemsResponsePostReport = {
	success: boolean;
	results: string;
};

export type HighSystemsResponsePutReport = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetApplicationForms = {
	success: boolean;
	results: {
		id: string;
		relatedTable: string;
		name: string;
		description?: string;
		schema: any;
		layout: {
			md: {
				id: string;
				x: number;
				y: number;
				w: number;
				h: number;
				children?: any;
			}[];
			sm: {
				id: string;
				x: number;
				y: number;
				w: number;
				h: number;
				children?: any;
			}[];
			xs: {
				id: string;
				x: number;
				y: number;
				w: number;
				h: number;
				children?: any;
			}[];
		};
		rules: {
			when: string;
			actions: {
				type: 'show' | 'hide' | 'require' | 'unrequire' | 'editable' | 'readOnly' | 'changeField' | 'displayMessage';
				fieldId?: string;
				value?: any;
				valueType?: 'value' | 'fieldValue';
			}[];
		}[];
		properties: {
			displayCoreFields: boolean;
			displayOnMenu: boolean;
			useCustomLayouts: boolean;
		};
	}[];
};

export type HighSystemsResponseGetForms = {
	success: boolean;
	results: {
		id: string;
		relatedTable: string;
		name: string;
		description?: string;
		schema: any;
		layout: {
			md: {
				id: string;
				x: number;
				y: number;
				w: number;
				h: number;
				children?: any;
			}[];
			sm: {
				id: string;
				x: number;
				y: number;
				w: number;
				h: number;
				children?: any;
			}[];
			xs: {
				id: string;
				x: number;
				y: number;
				w: number;
				h: number;
				children?: any;
			}[];
		};
		rules: {
			when: string;
			actions: {
				type: 'show' | 'hide' | 'require' | 'unrequire' | 'editable' | 'readOnly' | 'changeField' | 'displayMessage';
				fieldId?: string;
				value?: any;
				valueType?: 'value' | 'fieldValue';
			}[];
		}[];
		properties: {
			displayCoreFields: boolean;
			displayOnMenu: boolean;
			useCustomLayouts: boolean;
		};
	}[];
};

export type HighSystemsResponseDeleteForm = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetForm = {
	success: boolean;
	results: {
		id: string;
		relatedTable: string;
		name: string;
		description?: string;
		schema: any;
		layout: {
			md: {
				id: string;
				x: number;
				y: number;
				w: number;
				h: number;
				children?: any;
			}[];
			sm: {
				id: string;
				x: number;
				y: number;
				w: number;
				h: number;
				children?: any;
			}[];
			xs: {
				id: string;
				x: number;
				y: number;
				w: number;
				h: number;
				children?: any;
			}[];
		};
		rules: {
			when: string;
			actions: {
				type: 'show' | 'hide' | 'require' | 'unrequire' | 'editable' | 'readOnly' | 'changeField' | 'displayMessage';
				fieldId?: string;
				value?: any;
				valueType?: 'value' | 'fieldValue';
			}[];
		}[];
		properties: {
			displayCoreFields: boolean;
			displayOnMenu: boolean;
			useCustomLayouts: boolean;
		};
	};
};

export type HighSystemsResponsePostForm = {
	success: boolean;
	results: string;
};

export type HighSystemsResponsePutForm = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetApplicationEntityRelationshipDiagram = {
	success: boolean;
	results: {
		id: string;
		type: 'application' | 'table';
		relatedApplication: string;
		relatedTable?: string;
		layout: any;
	};
};

export type HighSystemsResponsePutApplicationEntityRelationshipDiagram = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetDashboards = {
	success: boolean;
	results: {
		id: string;
		relatedApplication: string;
		relatedTable?: string;
		type: 'application' | 'table';
		name: string;
		description: string;
		schema: {
			md: {
				id: string;
				type: 'widget';
				widget: any;
			}[];
			sm: {
				id: string;
				type: 'widget';
				widget: any;
			}[];
			xs: {
				id: string;
				type: 'widget';
				widget: any;
			}[];
		};
		layout: {
			md: {
				id: string;
				x: number;
				y: number;
				w: number;
				h: number;
			}[];
			sm: {
				id: string;
				x: number;
				y: number;
				w: number;
				h: number;
			}[];
			xs: {
				id: string;
				x: number;
				y: number;
				w: number;
				h: number;
			}[];
		};
		properties: {
			displayOnMenu: boolean;
			useCustomLayouts?: boolean;
		};
	}[];
};

export type HighSystemsResponsePostDashboard = {
	success: boolean;
	results: string;
};

export type HighSystemsResponseDeleteDashboard = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetDashboard = {
	success: boolean;
	results: {
		id: string;
		relatedApplication: string;
		relatedTable?: string;
		type: 'application' | 'table';
		name: string;
		description: string;
		schema: {
			md: {
				id: string;
				type: 'widget';
				widget: any;
			}[];
			sm: {
				id: string;
				type: 'widget';
				widget: any;
			}[];
			xs: {
				id: string;
				type: 'widget';
				widget: any;
			}[];
		};
		layout: {
			md: {
				id: string;
				x: number;
				y: number;
				w: number;
				h: number;
			}[];
			sm: {
				id: string;
				x: number;
				y: number;
				w: number;
				h: number;
			}[];
			xs: {
				id: string;
				x: number;
				y: number;
				w: number;
				h: number;
			}[];
		};
		properties: {
			displayOnMenu: boolean;
			useCustomLayouts?: boolean;
		};
	};
};

export type HighSystemsResponsePutDashboard = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetPages = {
	success: boolean;
	results: {
		id: string;
		relatedApplication: string;
		name: string;
		properties: {
			displayOnMenu: boolean;
			displayEmbedded: boolean;
		};
		file: {
			size: number;
			filename: string;
			location: {
				appid: string;
				pageid: string;
			};
		};
	}[];
};

export type HighSystemsResponsePostPage = {
	success: boolean;
	results: string;
};

export type HighSystemsResponseDeletePage = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetPage = {
	success: boolean;
	results: {
		id: string;
		relatedApplication: string;
		name: string;
		properties: {
			displayOnMenu: boolean;
			displayEmbedded: boolean;
		};
		file: {
			size: number;
			filename: string;
			location: {
				appid: string;
				pageid: string;
			};
		};
	};
};

export type HighSystemsResponsePutPage = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetNotifications = {
	success: boolean;
	results: {
		id: string;
		relatedTable: string;
		relatedOwner: string;
		active: boolean;
		name: string;
		description?: string;
		type?: string[];
		condition: string;
		from: string;
		to: string[];
		cc?: string[];
		bcc?: string[];
		subject: string;
		html?: string;
		body?: string;
		attachments?: any;
	}[];
};

export type HighSystemsResponseDeleteNotification = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetNotification = {
	success: boolean;
	results: {
		id: string;
		relatedTable: string;
		relatedOwner: string;
		active: boolean;
		name: string;
		description?: string;
		type?: string[];
		condition: string;
		from: string;
		to: string[];
		cc?: string[];
		bcc?: string[];
		subject: string;
		html?: string;
		body?: string;
		attachments?: any;
	};
};

export type HighSystemsResponsePutNotification = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponsePostNotification = {
	success: boolean;
	results: string;
};

export type HighSystemsResponseGetWebhooks = {
	success: boolean;
	results: {
		id: string;
		relatedTable: string;
		relatedOwner: string;
		active?: boolean;
		name: string;
		description?: string;
		type?: string[];
		condition: string;
		endpoint: string;
		method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
		headers?: {
			key: string;
			value: any;
		}[];
		body?: string;
	}[];
};

export type HighSystemsResponseDeleteWebhook = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetWebhook = {
	success: boolean;
	results: {
		id: string;
		relatedTable: string;
		relatedOwner: string;
		active?: boolean;
		name: string;
		description?: string;
		type?: string[];
		condition: string;
		endpoint: string;
		method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
		headers?: {
			key: string;
			value: any;
		}[];
		body?: string;
	};
};

export type HighSystemsResponsePutWebhook = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponsePostWebhook = {
	success: boolean;
	results: string;
};

export type HighSystemsResponseGetFunctions = {
	success: boolean;
	results: {
		id: string;
		relatedApplication: string;
		name: string;
		description?: string;
		body: string;
	}[];
};

export type HighSystemsResponsePostFunction = {
	success: boolean;
	results: string;
};

export type HighSystemsResponseDeleteFunction = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetFunction = {
	success: boolean;
	results: {
		id: string;
		relatedApplication: string;
		name: string;
		description?: string;
		body: string;
	};
};

export type HighSystemsResponsePutFunction = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetTriggers = {
	success: boolean;
	results: {
		id: string;
		relatedApplication: string;
		owner: string;
		active?: boolean;
		name: string;
		description?: string;
		timing: 'before' | 'after' | 'instead of';
		event: 'insert' | 'update' | 'delete';
		relatedTable: string;
		forEach: 'row' | 'statement';
		where?: string;
		relatedFunction: string;
	}[];
};

export type HighSystemsResponsePostTrigger = {
	success: boolean;
	results: string;
};

export type HighSystemsResponseDeleteTrigger = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetTrigger = {
	success: boolean;
	results: {
		id: string;
		relatedApplication: string;
		owner: string;
		active?: boolean;
		name: string;
		description?: string;
		timing: 'before' | 'after' | 'instead of';
		event: 'insert' | 'update' | 'delete';
		relatedTable: string;
		forEach: 'row' | 'statement';
		where?: string;
		relatedFunction: string;
	};
};

export type HighSystemsResponsePutTrigger = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetRecords = {
	success: boolean;
	results: any;
};

export type HighSystemsResponsePostRecord = {
	success: boolean;
	results: string;
};

export type HighSystemsResponseGetRecordsCount = {
	success: boolean;
	results: number;
};

export type HighSystemsResponseGetRecordsTotals = {
	success: boolean;
	results: {
	};
};

export type HighSystemsResponseDeleteRecord = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetRecord = {
	success: boolean;
	results: {
		id: string;
		dateCreated: string;
		dateModified: string;
		recordOwner: string;
		lastModifiedBy: string;
	};
};

export type HighSystemsResponsePutRecord = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseUpsertRecords = {
	success: boolean;
	results: string[];
};

export type HighSystemsResponseCalculateRecordFormulas = {
	success: boolean;
	results: {
		id: string;
		dateCreated: string;
		dateModified: string;
		recordOwner: string;
		lastModifiedBy: string;
	};
};

export type HighSystemsResponseGetFile = {
	success: boolean;
	results: {
		size: number;
		filename: string;
		location: {
			appid: string;
			tableid: string;
			recordid: string;
			fieldid: string;
		};
	};
};

export type HighSystemsResponseGetPresignedFileUrl = {
	success: boolean;
	results: {
		location: string;
		url: string;
	};
};

export type HighSystemsResponseFinalizeFileUpload = {
	success: boolean;
	results?: any;
};

/* Export to Browser */
if(IS_BROWSER){
	window.HighSystems = exports;
}
