
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
	 * This endpoint allows you to start a new transaction.
	 * 
	 * Transactions allow you to execute multiple API calls within the same, well, transaction. A transaction allows you to rollback or commit all the changes you've made attached to the transaction.
	 * 
	 * This is useful for when you are creating multiple records and need to do any clean up if one of those records fails to be added.
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
	 * This endpoint allows you to rollback an existing transaction.
	 *
	 * @param options deleteTransaction method options object
	 * @param options.id The Transaction ID of the transaction you want to commit.
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
	 * This endpoint allows you to commit an existing transaction.
	 *
	 * @param options postTransaction method options object
	 * @param options.id The Transaction ID of the transaction you want to commit.
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
	 * getInstanceSettings
	 *
	 * This endpoint allows you to retreive the settings for a given instance.
	 *
	 * @param options getInstanceSettings method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getInstanceSettings({ requestOptions, returnAxios = false }: HighSystemsRequestGetInstanceSettings & { returnAxios?: false }): Promise<HighSystemsResponseGetInstanceSettings['results']>;
	public async getInstanceSettings({ requestOptions, returnAxios = true }: HighSystemsRequestGetInstanceSettings & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetInstanceSettings>>;
	public async getInstanceSettings({ requestOptions, returnAxios = false }: HighSystemsRequestGetInstanceSettings = {}): Promise<HighSystemsResponseGetInstanceSettings['results'] | AxiosResponse<HighSystemsResponseGetInstanceSettings>> {
		const results = await this.api<HighSystemsResponseGetInstanceSettings>({
			method: 'get',
			url: `/api/rest/v1/settings`,
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putInstanceSettings
	 *
	 * This endpoint allows you to update the settings for a given instance.
	 *
	 * @param options putInstanceSettings method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putInstanceSettings({ requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutInstanceSettings & { returnAxios?: false }): Promise<HighSystemsResponsePutInstanceSettings['results']>;
	public async putInstanceSettings({ requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutInstanceSettings & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutInstanceSettings>>;
	public async putInstanceSettings({ requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutInstanceSettings): Promise<HighSystemsResponsePutInstanceSettings['results'] | AxiosResponse<HighSystemsResponsePutInstanceSettings>> {
		const results = await this.api<HighSystemsResponsePutInstanceSettings>({
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
	 * This endpoint allows you to query for all the users in the High Systems instance.
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
	 * This endpoint allows you to create a new instance user.
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
	 * This endpoint allows you to delete an existing instance user. This will remove them from all applications they've been invited to.
	 *
	 * @param options deleteUser method options object
	 * @param options.userid The User ID of the user you wish to delete.
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
	 * This endpoint allows you to query for a specific user by their user id.
	 *
	 * @param options getUser method options object
	 * @param options.userid The User ID of the user you wish to query for.
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
	 * This endpoint allows you to update an existing instance user.
	 *
	 * @param options putUser method options object
	 * @param options.userid The User ID of the user you wish to update.
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
	 * This endpoint allows you to query for all the user tokens for a given user.
	 *
	 * @param options getUserTokens method options object
	 * @param options.userid The User ID of the user you wish to get their user tokens of.
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
	 * This endpoint allows you to create a new user token.
	 *
	 * @param options postUserToken method options object
	 * @param options.userid The User ID of the user the token you wish to create belongs to.
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
	 * This endpoint allows you to delete an existing user token.
	 *
	 * @param options deleteUserToken method options object
	 * @param options.userid The User ID of the user the token you wish to delete belongs to.
	 * @param options.tokenid The User Token ID of the token you wish to delete.
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
	 * This endpoint allows you to query for a specific user token.
	 *
	 * @param options getUserToken method options object
	 * @param options.userid The User ID of the user the token you are querying belongs to.
	 * @param options.tokenid The User Token ID of the token you wish to query for.
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
	 * This endpoint allows you to update an existing user token.
	 *
	 * @param options putUserToken method options object
	 * @param options.tokenid The User ID of the user the token you wish to update belongs to.
	 * @param options.userid The User Token ID of the token you wish to update.
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
	 * This endpoint allows you to query for all the applications you've been invited to.
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
	 * This endpoint allows you to create a new application.
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
	 * This endpoint allows you to delete an existing application.
	 *
	 * @param options deleteApplication method options object
	 * @param options.appid The Application ID of the application you wish to delete.
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
	 * This endpoint allows you to query for a specific application.
	 *
	 * @param options getApplication method options object
	 * @param options.appid The Application ID you wish to query for.
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
	 * This endpoint allows you to update an existing application.
	 *
	 * @param options putApplication method options object
	 * @param options.appid The Application ID of the application you wish to update.
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
	 * This endpoint allows you to query for all the menus available for an application.
	 *
	 * @param options getApplicationMenus method options object
	 * @param options.appid The Application ID of the application you wish to query all menus for.
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
	 * @param options.appid Application ID
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
	 * @param options.appid Application ID
	 * @param options.menuid Menu ID
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
	 * This endpoint allows you to query for a specific application menu.
	 *
	 * @param options getApplicationMenu method options object
	 * @param options.appid The Application ID of the menu you wish to query for.
	 * @param options.menuid The Menu ID of the menu you wish to query for.
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
	 * @param options.appid Application ID
	 * @param options.menuid Menu ID
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
	 * This endpoint allows you to query for the rendered application menu for the current user.
	 *
	 * @param options getApplicationUserMenu method options object
	 * @param options.appid The Application ID of the menu you wish to query for.
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
	 * @param options.appid Application ID
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
	 * postVariable
	 *
	 * 
	 *
	 * @param options postVariable method options object
	 * @param options.appid Application ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postVariable({ appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostVariable & { returnAxios?: false }): Promise<HighSystemsResponsePostVariable['results']>;
	public async postVariable({ appid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostVariable & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostVariable>>;
	public async postVariable({ appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostVariable): Promise<HighSystemsResponsePostVariable['results'] | AxiosResponse<HighSystemsResponsePostVariable>> {
		const results = await this.api<HighSystemsResponsePostVariable>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/variables`,
			data: body,
			params: { appid }
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
	 * @param options.appid Application ID
	 * @param options.variableid Variable ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteVariable({ appid, variableid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteVariable & { returnAxios?: false }): Promise<HighSystemsResponseDeleteVariable['results']>;
	public async deleteVariable({ appid, variableid, requestOptions, returnAxios = true }: HighSystemsRequestDeleteVariable & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteVariable>>;
	public async deleteVariable({ appid, variableid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteVariable): Promise<HighSystemsResponseDeleteVariable['results'] | AxiosResponse<HighSystemsResponseDeleteVariable>> {
		const results = await this.api<HighSystemsResponseDeleteVariable>({
			method: 'delete',
			url: `/api/rest/v1/applications/${appid}/variables/${variableid}`,
			params: { appid, variableid }
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
	 * @param options.appid Application ID
	 * @param options.variableid Variable ID
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
	 * putVariable
	 *
	 * 
	 *
	 * @param options putVariable method options object
	 * @param options.variableid Variable ID
	 * @param options.appid Application ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putVariable({ variableid, appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutVariable & { returnAxios?: false }): Promise<HighSystemsResponsePutVariable['results']>;
	public async putVariable({ variableid, appid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutVariable & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutVariable>>;
	public async putVariable({ variableid, appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutVariable): Promise<HighSystemsResponsePutVariable['results'] | AxiosResponse<HighSystemsResponsePutVariable>> {
		const results = await this.api<HighSystemsResponsePutVariable>({
			method: 'put',
			url: `/api/rest/v1/applications/${appid}/variables/${variableid}`,
			data: body,
			params: { variableid, appid }
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
	 * @param options.appid Application ID
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
	 * postRole
	 *
	 * 
	 *
	 * @param options postRole method options object
	 * @param options.appid Application ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postRole({ appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostRole & { returnAxios?: false }): Promise<HighSystemsResponsePostRole['results']>;
	public async postRole({ appid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostRole & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostRole>>;
	public async postRole({ appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostRole): Promise<HighSystemsResponsePostRole['results'] | AxiosResponse<HighSystemsResponsePostRole>> {
		const results = await this.api<HighSystemsResponsePostRole>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/roles`,
			data: body,
			params: { appid }
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
	 * @param options.appid Application ID
	 * @param options.roleid Role ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteRole({ appid, roleid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteRole & { returnAxios?: false }): Promise<HighSystemsResponseDeleteRole['results']>;
	public async deleteRole({ appid, roleid, requestOptions, returnAxios = true }: HighSystemsRequestDeleteRole & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteRole>>;
	public async deleteRole({ appid, roleid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteRole): Promise<HighSystemsResponseDeleteRole['results'] | AxiosResponse<HighSystemsResponseDeleteRole>> {
		const results = await this.api<HighSystemsResponseDeleteRole>({
			method: 'delete',
			url: `/api/rest/v1/applications/${appid}/roles/${roleid}`,
			params: { appid, roleid }
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
	 * @param options.appid Application ID
	 * @param options.roleid Role ID
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
	 * putRole
	 *
	 * 
	 *
	 * @param options putRole method options object
	 * @param options.appid Application ID
	 * @param options.roleid Role ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putRole({ appid, roleid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutRole & { returnAxios?: false }): Promise<HighSystemsResponsePutRole['results']>;
	public async putRole({ appid, roleid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutRole & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutRole>>;
	public async putRole({ appid, roleid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutRole): Promise<HighSystemsResponsePutRole['results'] | AxiosResponse<HighSystemsResponsePutRole>> {
		const results = await this.api<HighSystemsResponsePutRole>({
			method: 'put',
			url: `/api/rest/v1/applications/${appid}/roles/${roleid}`,
			data: body,
			params: { appid, roleid }
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
	 * @param options.appid Application ID
	 * @param options.roleid Role ID
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
	 * getRoleTablePermissions
	 *
	 * 
	 *
	 * @param options getRoleTablePermissions method options object
	 * @param options.appid Application ID
	 * @param options.roleid Role ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getRoleTablePermissions({ appid, roleid, requestOptions, returnAxios = false }: HighSystemsRequestGetRoleTablePermissions & { returnAxios?: false }): Promise<HighSystemsResponseGetRoleTablePermissions['results']>;
	public async getRoleTablePermissions({ appid, roleid, requestOptions, returnAxios = true }: HighSystemsRequestGetRoleTablePermissions & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetRoleTablePermissions>>;
	public async getRoleTablePermissions({ appid, roleid, requestOptions, returnAxios = false }: HighSystemsRequestGetRoleTablePermissions): Promise<HighSystemsResponseGetRoleTablePermissions['results'] | AxiosResponse<HighSystemsResponseGetRoleTablePermissions>> {
		const results = await this.api<HighSystemsResponseGetRoleTablePermissions>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/roles/${roleid}/permissions/tables`,
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
	 * @param options.appid Application ID
	 * @param options.roleid Role ID
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
	 * @param options.appid Application ID
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
	 * postApplicationUser
	 *
	 * 
	 *
	 * @param options postApplicationUser method options object
	 * @param options.appid Application ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postApplicationUser({ appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostApplicationUser & { returnAxios?: false }): Promise<HighSystemsResponsePostApplicationUser['results']>;
	public async postApplicationUser({ appid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostApplicationUser & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostApplicationUser>>;
	public async postApplicationUser({ appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostApplicationUser): Promise<HighSystemsResponsePostApplicationUser['results'] | AxiosResponse<HighSystemsResponsePostApplicationUser>> {
		const results = await this.api<HighSystemsResponsePostApplicationUser>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/users`,
			data: body,
			params: { appid }
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
	 * @param options.appid Application ID
	 * @param options.userid User ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteApplicationUser({ appid, userid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteApplicationUser & { returnAxios?: false }): Promise<HighSystemsResponseDeleteApplicationUser['results']>;
	public async deleteApplicationUser({ appid, userid, requestOptions, returnAxios = true }: HighSystemsRequestDeleteApplicationUser & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteApplicationUser>>;
	public async deleteApplicationUser({ appid, userid, requestOptions, returnAxios = false }: HighSystemsRequestDeleteApplicationUser): Promise<HighSystemsResponseDeleteApplicationUser['results'] | AxiosResponse<HighSystemsResponseDeleteApplicationUser>> {
		const results = await this.api<HighSystemsResponseDeleteApplicationUser>({
			method: 'delete',
			url: `/api/rest/v1/applications/${appid}/users/${userid}`,
			params: { appid, userid }
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
	 * @param options.appid Application ID
	 * @param options.userid User ID
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
	 * putApplicationUser
	 *
	 * 
	 *
	 * @param options putApplicationUser method options object
	 * @param options.appid Application ID
	 * @param options.applicationUserId Application User ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putApplicationUser({ appid, applicationUserId, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutApplicationUser & { returnAxios?: false }): Promise<HighSystemsResponsePutApplicationUser['results']>;
	public async putApplicationUser({ appid, applicationUserId, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutApplicationUser & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutApplicationUser>>;
	public async putApplicationUser({ appid, applicationUserId, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutApplicationUser): Promise<HighSystemsResponsePutApplicationUser['results'] | AxiosResponse<HighSystemsResponsePutApplicationUser>> {
		const results = await this.api<HighSystemsResponsePutApplicationUser>({
			method: 'put',
			url: `/api/rest/v1/applications/${appid}/users/${applicationUserId}`,
			data: body,
			params: { appid, applicationUserId }
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
	 * @param options.appid Application ID
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
	 * postTable
	 *
	 * 
	 *
	 * @param options postTable method options object
	 * @param options.appid Application ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postTable({ appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostTable & { returnAxios?: false }): Promise<HighSystemsResponsePostTable['results']>;
	public async postTable({ appid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostTable & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostTable>>;
	public async postTable({ appid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostTable): Promise<HighSystemsResponsePostTable['results'] | AxiosResponse<HighSystemsResponsePostTable>> {
		const results = await this.api<HighSystemsResponsePostTable>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/tables`,
			data: body,
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
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
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
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
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
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
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
	 * getApplicationRelationships
	 *
	 * 
	 *
	 * @param options getApplicationRelationships method options object
	 * @param options.appid Application ID
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
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
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
	 * @param options.appid Application ID
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
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
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
	 * postField
	 *
	 * 
	 *
	 * @param options postField method options object
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postField({ appid, tableid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostField & { returnAxios?: false }): Promise<HighSystemsResponsePostField['results']>;
	public async postField({ appid, tableid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostField & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostField>>;
	public async postField({ appid, tableid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostField): Promise<HighSystemsResponsePostField['results'] | AxiosResponse<HighSystemsResponsePostField>> {
		const results = await this.api<HighSystemsResponsePostField>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/fields`,
			data: body,
			params: { appid, tableid }
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
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.fieldid Field ID
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
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.fieldid Field ID
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
	 * putField
	 *
	 * 
	 *
	 * @param options putField method options object
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.fieldid Field ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putField({ appid, tableid, fieldid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutField & { returnAxios?: false }): Promise<HighSystemsResponsePutField['results']>;
	public async putField({ appid, tableid, fieldid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutField & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutField>>;
	public async putField({ appid, tableid, fieldid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutField): Promise<HighSystemsResponsePutField['results'] | AxiosResponse<HighSystemsResponsePutField>> {
		const results = await this.api<HighSystemsResponsePutField>({
			method: 'put',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/fields/${fieldid}`,
			data: body,
			params: { appid, tableid, fieldid }
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
	 * @param options.appid Application ID
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
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
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
	 * postReport
	 *
	 * 
	 *
	 * @param options postReport method options object
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postReport({ appid, tableid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostReport & { returnAxios?: false }): Promise<HighSystemsResponsePostReport['results']>;
	public async postReport({ appid, tableid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostReport & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostReport>>;
	public async postReport({ appid, tableid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostReport): Promise<HighSystemsResponsePostReport['results'] | AxiosResponse<HighSystemsResponsePostReport>> {
		const results = await this.api<HighSystemsResponsePostReport>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/reports`,
			data: body,
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
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.reportid Report ID
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
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.reportid Report ID
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
	 * putReport
	 *
	 * 
	 *
	 * @param options putReport method options object
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.reportid Report ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putReport({ appid, tableid, reportid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutReport & { returnAxios?: false }): Promise<HighSystemsResponsePutReport['results']>;
	public async putReport({ appid, tableid, reportid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutReport & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutReport>>;
	public async putReport({ appid, tableid, reportid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutReport): Promise<HighSystemsResponsePutReport['results'] | AxiosResponse<HighSystemsResponsePutReport>> {
		const results = await this.api<HighSystemsResponsePutReport>({
			method: 'put',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/reports/${reportid}`,
			data: body,
			params: { appid, tableid, reportid }
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
	 * @param options.appid Application ID
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
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
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
	 * postForm
	 *
	 * 
	 *
	 * @param options postForm method options object
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postForm({ appid, tableid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostForm & { returnAxios?: false }): Promise<HighSystemsResponsePostForm['results']>;
	public async postForm({ appid, tableid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostForm & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostForm>>;
	public async postForm({ appid, tableid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostForm): Promise<HighSystemsResponsePostForm['results'] | AxiosResponse<HighSystemsResponsePostForm>> {
		const results = await this.api<HighSystemsResponsePostForm>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/forms`,
			data: body,
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
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.formid Form ID
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
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.formid Form ID
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
	 * putForm
	 *
	 * 
	 *
	 * @param options putForm method options object
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.formid Form ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putForm({ appid, tableid, formid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutForm & { returnAxios?: false }): Promise<HighSystemsResponsePutForm['results']>;
	public async putForm({ appid, tableid, formid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutForm & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutForm>>;
	public async putForm({ appid, tableid, formid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutForm): Promise<HighSystemsResponsePutForm['results'] | AxiosResponse<HighSystemsResponsePutForm>> {
		const results = await this.api<HighSystemsResponsePutForm>({
			method: 'put',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/forms/${formid}`,
			data: body,
			params: { appid, tableid, formid }
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
	 * @param options.appid Application ID
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
	 * @param options.appid Application ID
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
	 * @param options.appid Application ID
	 * @param options.relatedTable Table ID
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
	 * @param options.appid Application ID
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
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.dashboardid Dashboard ID
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
	 * @param options.appid Application ID
	 * @param options.relatedTable Table ID
	 * @param options.dashboardid Dashboard ID
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
	 * @param options.appid Application ID
	 * @param options.dashboardid Dashboard ID
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
	 * @param options.appid Application ID
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
	 * @param options.appid Application ID
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
	 * @param options.appid Application ID
	 * @param options.pageid Page ID
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
	 * @param options.appid Application ID
	 * @param options.pageid Page ID
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
	 * @param options.appid Application ID
	 * @param options.pageid Page ID
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
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
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
	 * postNotification
	 *
	 * 
	 *
	 * @param options postNotification method options object
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postNotification({ appid, tableid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostNotification & { returnAxios?: false }): Promise<HighSystemsResponsePostNotification['results']>;
	public async postNotification({ appid, tableid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostNotification & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostNotification>>;
	public async postNotification({ appid, tableid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostNotification): Promise<HighSystemsResponsePostNotification['results'] | AxiosResponse<HighSystemsResponsePostNotification>> {
		const results = await this.api<HighSystemsResponsePostNotification>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/notifications`,
			data: body,
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
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.notificationid Notification ID
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
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.notificationid Notification ID
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
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.notificationid Notification ID
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
	 * getWebhooks
	 *
	 * 
	 *
	 * @param options getWebhooks method options object
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
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
	 * postWebhook
	 *
	 * 
	 *
	 * @param options postWebhook method options object
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async postWebhook({ appid, tableid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostWebhook & { returnAxios?: false }): Promise<HighSystemsResponsePostWebhook['results']>;
	public async postWebhook({ appid, tableid, requestOptions, returnAxios = true, ...body }: HighSystemsRequestPostWebhook & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePostWebhook>>;
	public async postWebhook({ appid, tableid, requestOptions, returnAxios = false, ...body }: HighSystemsRequestPostWebhook): Promise<HighSystemsResponsePostWebhook['results'] | AxiosResponse<HighSystemsResponsePostWebhook>> {
		const results = await this.api<HighSystemsResponsePostWebhook>({
			method: 'post',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/webhooks`,
			data: body,
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
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.webhookid Webhook ID
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
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.webhookid Webhook ID
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
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.webhookid Webhook ID
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
	 * getFunctions
	 *
	 * 
	 *
	 * @param options getFunctions method options object
	 * @param options.appid Application ID
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
	 * @param options.appid Application ID
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
	 * @param options.appid Application ID
	 * @param options.functionid Function ID
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
	 * @param options.appid Application ID
	 * @param options.functionid Function ID
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
	 * @param options.appid Application ID
	 * @param options.functionid Function ID
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
	 * @param options.appid Application ID
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
	 * @param options.appid Application ID
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
	 * @param options.appid Application ID
	 * @param options.triggerid Trigger ID
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
	 * @param options.appid Application ID
	 * @param options.triggerid Trigger ID
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
	 * @param options.appid Application ID
	 * @param options.triggerid Trigger ID
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
	 * deleteRecords
	 *
	 * This endpoint allows you to delete multiple records from a table.
	 *
	 * @param options deleteRecords method options object
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async deleteRecords({ appid, tableid, query, requestOptions, returnAxios = false }: HighSystemsRequestDeleteRecords & { returnAxios?: false }): Promise<HighSystemsResponseDeleteRecords['results']>;
	public async deleteRecords({ appid, tableid, query, requestOptions, returnAxios = true }: HighSystemsRequestDeleteRecords & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseDeleteRecords>>;
	public async deleteRecords({ appid, tableid, query, requestOptions, returnAxios = false }: HighSystemsRequestDeleteRecords): Promise<HighSystemsResponseDeleteRecords['results'] | AxiosResponse<HighSystemsResponseDeleteRecords>> {
		const results = await this.api<HighSystemsResponseDeleteRecords>({
			method: 'delete',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/records`,
			params: { appid, tableid, query }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * getRecords
	 *
	 * This endpoint allows you to fetch a collection of records.
	 *
	 * @param options getRecords method options object
	 * @param options.type Query type
	 * @param options.query Query string to filter the record set
	 * @param options.columns An array of field ids to return in the query. Can also be a period delimited string.
	 * @param options.summarize An array of field ids to summarize by. Can also be a period delimited string.
	 * @param options.grouping An array of field ids to group by. Can also be a period delimited string.
	 * @param options.sorting An array of field ids to sort by. Can also be a period delimited string.
	 * @param options.mergeQuery Merge the submitted query string with the saved query string from the report
	 * @param options.includePermissions Return a `permissions` object that includes an `edit` and `delete` properties as booleans.
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getRecords({ type, query, columns, summarize, grouping, sorting, page, mergeQuery, includePermissions, appid, tableid, reportid, requestOptions, returnAxios = false }: HighSystemsRequestGetRecords & { returnAxios?: false }): Promise<HighSystemsResponseGetRecords['results']>;
	public async getRecords({ type, query, columns, summarize, grouping, sorting, page, mergeQuery, includePermissions, appid, tableid, reportid, requestOptions, returnAxios = true }: HighSystemsRequestGetRecords & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetRecords>>;
	public async getRecords({ type, query, columns, summarize, grouping, sorting, page, mergeQuery, includePermissions, appid, tableid, reportid, requestOptions, returnAxios = false }: HighSystemsRequestGetRecords): Promise<HighSystemsResponseGetRecords['results'] | AxiosResponse<HighSystemsResponseGetRecords>> {
		const results = await this.api<HighSystemsResponseGetRecords>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/records`,
			params: { type, query, columns, summarize, grouping, sorting, page, mergeQuery, includePermissions, appid, tableid, reportid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * postRecord
	 *
	 * This endpoint allows you to create a new record.
	 *
	 * @param options postRecord method options object
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
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
	 * This endpoint allows you to fetch the total number of records that match a given query or report.
	 *
	 * @param options getRecordsCount method options object
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.mergeQuery Merge the submitted query string with the saved query string from the report
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
	 * This endpoint allows you to fetch the totals and averages of a given record set.
	 *
	 * @param options getRecordsTotals method options object
	 * @param options.type Query type
	 * @param options.query Query string to filter the record set
	 * @param options.totals If true, the returned data will be summarized
	 * @param options.columns An array of field ids to return in the query. Can also be a period delimited string.
	 * @param options.summarize An array of field ids to summarize by. Can also be a period delimited string.
	 * @param options.grouping An array of field ids to group by. Can also be a period delimited string.
	 * @param options.sorting An array of field ids to sort by. Can also be a period delimited string.
	 * @param options.mergeQuery Merge the submitted query string with the saved query string from the report
	 * @param options.includePermissions Return a `permissions` object that includes an `edit` and `delete` properties as booleans.
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getRecordsTotals({ type, query, totals, columns, summarize, grouping, sorting, page, mergeQuery, includePermissions, appid, tableid, reportid, requestOptions, returnAxios = false }: HighSystemsRequestGetRecordsTotals & { returnAxios?: false }): Promise<HighSystemsResponseGetRecordsTotals['results']>;
	public async getRecordsTotals({ type, query, totals, columns, summarize, grouping, sorting, page, mergeQuery, includePermissions, appid, tableid, reportid, requestOptions, returnAxios = true }: HighSystemsRequestGetRecordsTotals & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetRecordsTotals>>;
	public async getRecordsTotals({ type, query, totals, columns, summarize, grouping, sorting, page, mergeQuery, includePermissions, appid, tableid, reportid, requestOptions, returnAxios = false }: HighSystemsRequestGetRecordsTotals): Promise<HighSystemsResponseGetRecordsTotals['results'] | AxiosResponse<HighSystemsResponseGetRecordsTotals>> {
		const results = await this.api<HighSystemsResponseGetRecordsTotals>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/records/totals`,
			params: { type, query, totals, columns, summarize, grouping, sorting, page, mergeQuery, includePermissions, appid, tableid, reportid }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * deleteRecord
	 *
	 * This endpoint allows you to delete a specific record from a table.
	 *
	 * @param options deleteRecord method options object
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.recordid Record ID
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
	 * This endpoint allows you to fetch a specific record.
	 *
	 * @param options getRecord method options object
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.recordid Record ID
	 * @param options.includePermissions Return a `permissions` object that includes an `edit` and `delete` properties as booleans.
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getRecord({ appid, tableid, recordid, clist, includePermissions, requestOptions, returnAxios = false }: HighSystemsRequestGetRecord & { returnAxios?: false }): Promise<HighSystemsResponseGetRecord['results']>;
	public async getRecord({ appid, tableid, recordid, clist, includePermissions, requestOptions, returnAxios = true }: HighSystemsRequestGetRecord & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetRecord>>;
	public async getRecord({ appid, tableid, recordid, clist, includePermissions, requestOptions, returnAxios = false }: HighSystemsRequestGetRecord): Promise<HighSystemsResponseGetRecord['results'] | AxiosResponse<HighSystemsResponseGetRecord>> {
		const results = await this.api<HighSystemsResponseGetRecord>({
			method: 'get',
			url: `/api/rest/v1/applications/${appid}/tables/${tableid}/records/${recordid}`,
			params: { appid, tableid, recordid, clist, includePermissions }
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putRecord
	 *
	 * This endpoint allows you to update an existing record.
	 *
	 * @param options putRecord method options object
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.id Record ID
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
	 * This endpoint allows you to add and modify records in a single call. If an `id` is provided, it will update the record, otherwise it will add a new record.
	 *
	 * @param options upsertRecords method options object
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
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
	 * This endpoint allows you calculate the value of a given formula with a given record and data.
	 *
	 * @param options calculateRecordFormulas method options object
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
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
	 * This endpoint allows you to download a file as base 64.
	 *
	 * @param options getFile method options object
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.recordid Record ID
	 * @param options.fieldid Field ID
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
	 * This endpoint allows you to obtain a presigned URL for either fetching or uploading a file attachment.
	 *
	 * @param options getPresignedFileUrl method options object
	 * @param options.appid Application ID
	 * @param options.tableid Table ID
	 * @param options.recordid Record ID
	 * @param options.fieldid Field ID
	 * @param options.pageid Page ID
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
	 * This endpoint allows you to finalize a file upload, attaching a temporarily uploaded file to a record.
	 *
	 * @param options finalizeFileUpload method options object
	 * @param options.appid Target Application ID
	 * @param options.tableid Target Table ID
	 * @param options.recordid Target Record ID
	 * @param options.fieldid Target Field ID
	 * @param options.tmpLocation Temporary location of the file to finalize
	 * @param options.size Size of the file to upload
	 * @param options.filename The filename of the file to upload
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

	/**
	 * getPreferences
	 *
	 * This endpoint allows you to retrieve your saved preferences.
	 *
	 * @param options getPreferences method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async getPreferences({ requestOptions, returnAxios = false }: HighSystemsRequestGetPreferences & { returnAxios?: false }): Promise<HighSystemsResponseGetPreferences['results']>;
	public async getPreferences({ requestOptions, returnAxios = true }: HighSystemsRequestGetPreferences & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponseGetPreferences>>;
	public async getPreferences({ requestOptions, returnAxios = false }: HighSystemsRequestGetPreferences = {}): Promise<HighSystemsResponseGetPreferences['results'] | AxiosResponse<HighSystemsResponseGetPreferences>> {
		const results = await this.api<HighSystemsResponseGetPreferences>({
			method: 'get',
			url: `/api/rest/v1/preferences`,
		}, requestOptions);
	
		if(returnAxios){
			return results;
		}
	
		return typeof(results.data) === 'object' ? results.data.results : results.data;
	}

	/**
	 * putPreferences
	 *
	 * This endpoint allows you to update your saved preferences.
	 *
	 * @param options putPreferences method options object
	 * @param options.requestOptions Override axios request configuration
	 * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
	 */
	public async putPreferences({ requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutPreferences & { returnAxios?: false }): Promise<HighSystemsResponsePutPreferences['results']>;
	public async putPreferences({ requestOptions, returnAxios = true, ...body }: HighSystemsRequestPutPreferences & { returnAxios: true }): Promise<AxiosResponse<HighSystemsResponsePutPreferences>>;
	public async putPreferences({ requestOptions, returnAxios = false, ...body }: HighSystemsRequestPutPreferences): Promise<HighSystemsResponsePutPreferences['results'] | AxiosResponse<HighSystemsResponsePutPreferences>> {
		const results = await this.api<HighSystemsResponsePutPreferences>({
			method: 'put',
			url: `/api/rest/v1/preferences`,
			data: body,
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
	/**
	 * The Transaction ID of the transaction you want to commit.
	 */
	id: any;
};

export type HighSystemsRequestPostTransaction = HighSystemsRequest & {
	/**
	 * The Transaction ID of the transaction you want to commit.
	 */
	id: any;
};

export type HighSystemsRequestGetInstanceSettings = HighSystemsRequest & {
};

export type HighSystemsRequestPutInstanceSettings = HighSystemsRequest & {

};

export type HighSystemsRequestGetUsers = HighSystemsRequest & {
};

export type HighSystemsRequestPostUser = HighSystemsRequest & {
	email: string;
	password?: string;
	firstName?: string;
	middleName?: string;
	lastName?: string;
	isInstanceAdmin?: boolean;
	isInstanceLimitedAdmin?: boolean;
	reset?: boolean;
	valid?: boolean;
	twoFactorEnabled?: boolean;
	/**
	 * If true, an email will be sent the user inviting them to the instance and/or application.
	 */
	sendEmail?: boolean;
};

export type HighSystemsRequestDeleteUser = HighSystemsRequest & {
	/**
	 * The User ID of the user you wish to delete.
	 */
	userid: any;
};

export type HighSystemsRequestGetUser = HighSystemsRequest & {
	/**
	 * The User ID of the user you wish to query for.
	 */
	userid: any;
};

export type HighSystemsRequestPutUser = HighSystemsRequest & {
	/**
	 * The User ID of the user you wish to update.
	 */
	userid: any;
	email: string;
	password: string;
	firstName: string;
	middleName: string;
	lastName: string;
	isInstanceAdmin: boolean;
	isInstanceLimitedAdmin: boolean;
	reset: boolean;
	valid: boolean;
	twoFactorEnabled: boolean;
};

export type HighSystemsRequestGetUserTokens = HighSystemsRequest & {
	/**
	 * The User ID of the user you wish to get their user tokens of.
	 */
	userid: any;
};

export type HighSystemsRequestPostUserToken = HighSystemsRequest & {
	/**
	 * The User ID of the user the token you wish to create belongs to.
	 */
	userid: any;
	name: string;
	description?: string;
	applications?: string[];
	active: boolean;
};

export type HighSystemsRequestDeleteUserToken = HighSystemsRequest & {
	/**
	 * The User ID of the user the token you wish to delete belongs to.
	 */
	userid: any;
	/**
	 * The User Token ID of the token you wish to delete.
	 */
	tokenid: any;
};

export type HighSystemsRequestGetUserToken = HighSystemsRequest & {
	/**
	 * The User ID of the user the token you are querying belongs to.
	 */
	userid: any;
	/**
	 * The User Token ID of the token you wish to query for.
	 */
	tokenid: any;
};

export type HighSystemsRequestPutUserToken = HighSystemsRequest & {
	/**
	 * The User ID of the user the token you wish to update belongs to.
	 */
	tokenid: any;
	/**
	 * The User Token ID of the token you wish to update.
	 */
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
	/**
	 * The Application ID of the application you wish to delete.
	 */
	appid: any;
};

export type HighSystemsRequestGetApplication = HighSystemsRequest & {
	/**
	 * The Application ID you wish to query for.
	 */
	appid: any;
};

export type HighSystemsRequestPutApplication = HighSystemsRequest & {
	/**
	 * The Application ID of the application you wish to update.
	 */
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
	/**
	 * The Application ID of the application you wish to query all menus for.
	 */
	appid: any;
};

export type HighSystemsRequestPostApplicationMenu = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	name: string;
	groups: any;
};

export type HighSystemsRequestDeleteApplicationMenu = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Menu ID
	 */
	menuid: any;
};

export type HighSystemsRequestGetApplicationMenu = HighSystemsRequest & {
	/**
	 * The Application ID of the menu you wish to query for.
	 */
	appid: any;
	/**
	 * The Menu ID of the menu you wish to query for.
	 */
	menuid: any;
};

export type HighSystemsRequestPutApplicationMenu = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Menu ID
	 */
	menuid: any;
	name: string;
	groups: any;
};

export type HighSystemsRequestGetApplicationUserMenu = HighSystemsRequest & {
	/**
	 * The Application ID of the menu you wish to query for.
	 */
	appid: any;
};

export type HighSystemsRequestGetVariables = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
};

export type HighSystemsRequestPostVariable = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	name: string;
	value?: string;
};

export type HighSystemsRequestDeleteVariable = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Variable ID
	 */
	variableid: any;
};

export type HighSystemsRequestGetVariable = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Variable ID
	 */
	variableid: any;
};

export type HighSystemsRequestPutVariable = HighSystemsRequest & {
	/**
	 * Variable ID
	 */
	variableid: any;
	/**
	 * Application ID
	 */
	appid: any;
	relatedApplication: string;
	name: string;
	value: string;
};

export type HighSystemsRequestGetRoles = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
};

export type HighSystemsRequestPostRole = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
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
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Role ID
	 */
	roleid: any;
};

export type HighSystemsRequestGetRole = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Role ID
	 */
	roleid: any;
};

export type HighSystemsRequestPutRole = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Role ID
	 */
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
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Role ID
	 */
	roleid: any;
};

export type HighSystemsRequestGetRoleTablePermissions = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Role ID
	 */
	roleid: any;
};

export type HighSystemsRequestGetRoleDefaults = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Role ID
	 */
	roleid: any;
};

export type HighSystemsRequestGetApplicationUsers = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
};

export type HighSystemsRequestPostApplicationUser = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	relatedUser?: string;
	relatedRole: string;
	email?: string;
	sendEmail?: boolean;
};

export type HighSystemsRequestDeleteApplicationUser = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * User ID
	 */
	userid: any;
};

export type HighSystemsRequestGetApplicationUser = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * User ID
	 */
	userid: any;
};

export type HighSystemsRequestPutApplicationUser = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Application User ID
	 */
	applicationUserId: any;
	relatedRole: string;
};

export type HighSystemsRequestGetTables = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
};

export type HighSystemsRequestPostTable = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
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

export type HighSystemsRequestDeleteTable = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
};

export type HighSystemsRequestGetTable = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
};

export type HighSystemsRequestPutTable = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
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

export type HighSystemsRequestGetApplicationRelationships = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
};

export type HighSystemsRequestGetTableRelationships = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
};

export type HighSystemsRequestGetApplicationFields = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
};

export type HighSystemsRequestGetFields = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	clist?: any;
};

export type HighSystemsRequestPostField = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	field: any;
	fields: any;
};

export type HighSystemsRequestDeleteField = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	/**
	 * Field ID
	 */
	fieldid: any;
};

export type HighSystemsRequestGetField = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	/**
	 * Field ID
	 */
	fieldid: any;
};

export type HighSystemsRequestPutField = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	/**
	 * Field ID
	 */
	fieldid: any;
	field: any;
};

export type HighSystemsRequestGetApplicationReports = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
};

export type HighSystemsRequestGetReports = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
};

export type HighSystemsRequestPostReport = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	report: any;
};

export type HighSystemsRequestDeleteReport = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	/**
	 * Report ID
	 */
	reportid: any;
};

export type HighSystemsRequestGetReport = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	/**
	 * Report ID
	 */
	reportid: any;
};

export type HighSystemsRequestPutReport = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	/**
	 * Report ID
	 */
	reportid: any;
	report: any;
};

export type HighSystemsRequestGetApplicationForms = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
};

export type HighSystemsRequestGetForms = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
};

export type HighSystemsRequestPostForm = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	name: string;
	description?: string;
	schema: {
		md: any;
		sm: any;
		xs: any;
	};
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
		applyReverse?: boolean;
	}[];
	properties: {
		displayCoreFields: boolean;
		displayOnMenu: boolean;
		useCustomLayouts: boolean;
		addRedirect?: 'referrer' | 'record';
		editRedirect?: 'referrer' | 'record';
	};
};

export type HighSystemsRequestDeleteForm = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	/**
	 * Form ID
	 */
	formid: any;
};

export type HighSystemsRequestGetForm = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	/**
	 * Form ID
	 */
	formid: any;
};

export type HighSystemsRequestPutForm = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	/**
	 * Form ID
	 */
	formid: any;
	relatedTable: string;
	name: string;
	description: string;
	schema: {
		md: any;
		sm: any;
		xs: any;
	};
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
		applyReverse: boolean;
	}[];
	properties: {
		displayCoreFields: boolean;
		displayOnMenu: boolean;
		useCustomLayouts: boolean;
		addRedirect: 'referrer' | 'record';
		editRedirect: 'referrer' | 'record';
	};
};

export type HighSystemsRequestGetApplicationEntityRelationshipDiagram = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
};

export type HighSystemsRequestPutApplicationEntityRelationshipDiagram = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	diagramid: any;
	layout: any;
};

export type HighSystemsRequestGetDashboards = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	relatedTable?: any;
};

export type HighSystemsRequestPostDashboard = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	relatedTable?: string;
	type: 'application' | 'table';
	name: string;
	description?: string;
	schema: {
		md: any;
		sm: any;
		xs: any;
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
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid?: any;
	/**
	 * Dashboard ID
	 */
	dashboardid: any;
};

export type HighSystemsRequestGetDashboard = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	relatedTable?: any;
	/**
	 * Dashboard ID
	 */
	dashboardid: any;
};

export type HighSystemsRequestPutDashboard = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Dashboard ID
	 */
	dashboardid: any;
	relatedTable: string;
	type: 'application' | 'table';
	name: string;
	description: string;
	schema: {
		md: any;
		sm: any;
		xs: any;
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
	/**
	 * Application ID
	 */
	appid: any;
};

export type HighSystemsRequestPostPage = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	name: any;
	content: any;
	properties: any;
};

export type HighSystemsRequestDeletePage = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Page ID
	 */
	pageid: any;
};

export type HighSystemsRequestGetPage = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Page ID
	 */
	pageid: any;
};

export type HighSystemsRequestPutPage = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Page ID
	 */
	pageid: any;
	name: any;
	content: any;
	properties: any;
};

export type HighSystemsRequestGetNotifications = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
};

export type HighSystemsRequestPostNotification = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	active: boolean;
	name: string;
	description?: string;
	type?: string[];
	triggeringFields?: string[];
	condition: string;
	to: string[];
	cc?: string[];
	bcc?: string[];
	subject: string;
	html?: string;
	body?: string;
	attachments?: any;
};

export type HighSystemsRequestDeleteNotification = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	/**
	 * Notification ID
	 */
	notificationid: any;
};

export type HighSystemsRequestGetNotification = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	/**
	 * Notification ID
	 */
	notificationid: any;
};

export type HighSystemsRequestPutNotification = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	/**
	 * Notification ID
	 */
	notificationid: any;
	relatedTable: string;
	relatedOwner: string;
	active: boolean;
	name: string;
	description: string;
	type: string[];
	triggeringFields: string[];
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

export type HighSystemsRequestGetWebhooks = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
};

export type HighSystemsRequestPostWebhook = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	relatedOwner: string;
	active: boolean;
	name: string;
	description: string;
	type: string[];
	triggeringFields: string[];
	condition: string;
	endpoint: string;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	headers: {
		key: string;
		value: any;
	}[];
	body: string;
};

export type HighSystemsRequestDeleteWebhook = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	/**
	 * Webhook ID
	 */
	webhookid: any;
};

export type HighSystemsRequestGetWebhook = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	/**
	 * Webhook ID
	 */
	webhookid: any;
};

export type HighSystemsRequestPutWebhook = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	/**
	 * Webhook ID
	 */
	webhookid: any;
	relatedTable: string;
	relatedOwner: string;
	active: boolean;
	name: string;
	description: string;
	type: string[];
	triggeringFields: string[];
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
	/**
	 * Application ID
	 */
	appid: any;
};

export type HighSystemsRequestPostFunction = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	name: string;
	description?: string;
	body: string;
};

export type HighSystemsRequestDeleteFunction = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Function ID
	 */
	functionid: any;
};

export type HighSystemsRequestGetFunction = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Function ID
	 */
	functionid: any;
};

export type HighSystemsRequestPutFunction = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Function ID
	 */
	functionid: any;
	name: string;
	description?: string;
	body: string;
};

export type HighSystemsRequestGetTriggers = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
};

export type HighSystemsRequestPostTrigger = HighSystemsRequest & {
	/**
	 * Application ID
	 */
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
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Trigger ID
	 */
	triggerid: any;
};

export type HighSystemsRequestGetTrigger = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Trigger ID
	 */
	triggerid: any;
};

export type HighSystemsRequestPutTrigger = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Trigger ID
	 */
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

export type HighSystemsRequestDeleteRecords = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	query?: any;
};

export type HighSystemsRequestGetRecords = HighSystemsRequest & {
	/**
	 * Query type
	 */
	type?: any;
	/**
	 * Query string to filter the record set
	 */
	query?: any;
	/**
	 * An array of field ids to return in the query. Can also be a period delimited string.
	 */
	columns?: any;
	/**
	 * An array of field ids to summarize by. Can also be a period delimited string.
	 */
	summarize?: any;
	/**
	 * An array of field ids to group by. Can also be a period delimited string.
	 */
	grouping?: any;
	/**
	 * An array of field ids to sort by. Can also be a period delimited string.
	 */
	sorting?: any;
	page?: any;
	/**
	 * Merge the submitted query string with the saved query string from the report
	 */
	mergeQuery?: any;
	/**
	 * Return a `permissions` object that includes an `edit` and `delete` properties as booleans.
	 */
	includePermissions?: any;
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	reportid?: any;
};

export type HighSystemsRequestPostRecord = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	format: any;
};

export type HighSystemsRequestGetRecordsCount = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	reportid?: any;
	query?: any;
	/**
	 * Merge the submitted query string with the saved query string from the report
	 */
	mergeQuery?: any;
};

export type HighSystemsRequestGetRecordsTotals = HighSystemsRequest & {
	/**
	 * Query type
	 */
	type?: any;
	/**
	 * Query string to filter the record set
	 */
	query?: any;
	/**
	 * If true, the returned data will be summarized
	 */
	totals?: any;
	/**
	 * An array of field ids to return in the query. Can also be a period delimited string.
	 */
	columns?: any;
	/**
	 * An array of field ids to summarize by. Can also be a period delimited string.
	 */
	summarize?: any;
	/**
	 * An array of field ids to group by. Can also be a period delimited string.
	 */
	grouping?: any;
	/**
	 * An array of field ids to sort by. Can also be a period delimited string.
	 */
	sorting?: any;
	page?: any;
	/**
	 * Merge the submitted query string with the saved query string from the report
	 */
	mergeQuery?: any;
	/**
	 * Return a `permissions` object that includes an `edit` and `delete` properties as booleans.
	 */
	includePermissions?: any;
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	reportid?: any;
};

export type HighSystemsRequestDeleteRecord = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	/**
	 * Record ID
	 */
	recordid: any;
};

export type HighSystemsRequestGetRecord = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	/**
	 * Record ID
	 */
	recordid: any;
	clist?: any;
	/**
	 * Return a `permissions` object that includes an `edit` and `delete` properties as booleans.
	 */
	includePermissions?: any;
};

export type HighSystemsRequestPutRecord = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	/**
	 * Record ID
	 */
	id: any;
	format: any;
};

export type HighSystemsRequestUpsertRecords = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	/**
	 * An array of records to upsert
	 */
	data: {
	}[];
};

export type HighSystemsRequestCalculateRecordFormulas = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	/**
	 * Record ID
	 */
	recordid?: string;
	formulas: string[];
	adHocData: any;
};

export type HighSystemsRequestGetFile = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid: any;
	/**
	 * Table ID
	 */
	tableid: any;
	/**
	 * Record ID
	 */
	recordid: any;
	/**
	 * Field ID
	 */
	fieldid: any;
};

export type HighSystemsRequestGetPresignedFileUrl = HighSystemsRequest & {
	/**
	 * Application ID
	 */
	appid?: any;
	/**
	 * Table ID
	 */
	tableid?: any;
	/**
	 * Record ID
	 */
	recordid?: any;
	/**
	 * Field ID
	 */
	fieldid?: any;
	/**
	 * Page ID
	 */
	pageid?: any;
	logo?: any;
	action: any;
	contentType?: any;
	responseDisposition?: any;
	responseType?: any;
};

export type HighSystemsRequestFinalizeFileUpload = HighSystemsRequest & {
	/**
	 * Target Application ID
	 */
	appid: any;
	/**
	 * Target Table ID
	 */
	tableid: any;
	/**
	 * Target Record ID
	 */
	recordid: any;
	/**
	 * Target Field ID
	 */
	fieldid: any;
	/**
	 * Temporary location of the file to finalize
	 */
	tmpLocation: any;
	/**
	 * Size of the file to upload
	 */
	size: any;
	/**
	 * The filename of the file to upload
	 */
	filename: any;
};

export type HighSystemsRequestGetPreferences = HighSystemsRequest & {
};

export type HighSystemsRequestPutPreferences = HighSystemsRequest & {
	reports: {
		perPage: any;
	};
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

export type HighSystemsResponseGetInstanceSettings = {
	success: boolean;
	results: {
		instance: string;
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

export type HighSystemsResponsePutInstanceSettings = {
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
		isInstanceAdmin: boolean;
		isInstanceLimitedAdmin: boolean;
		reset: boolean;
		valid: boolean;
	}[];
};

export type HighSystemsResponsePostUser = {
	success: boolean;
	/**
	 * The User ID of the newly created user.
	 */
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
		isInstanceAdmin: boolean;
		isInstanceLimitedAdmin: boolean;
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

export type HighSystemsResponsePostVariable = {
	success: boolean;
	results: string;
};

export type HighSystemsResponseDeleteVariable = {
	success: boolean;
	results?: any;
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

export type HighSystemsResponsePostRole = {
	success: boolean;
	results: string;
};

export type HighSystemsResponseDeleteRole = {
	success: boolean;
	results?: any;
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

export type HighSystemsResponseGetRoleTablePermissions = {
	success: boolean;
	results: {
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
		isInstanceAdmin: boolean;
		isInstanceLimitedAdmin: boolean;
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

export type HighSystemsResponsePostApplicationUser = {
	success: boolean;
	results: string;
};

export type HighSystemsResponseDeleteApplicationUser = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetApplicationUser = {
	success: boolean;
	results: {
		id: string;
		email: string;
		firstName: string;
		middleName: string;
		lastName: string;
		isInstanceAdmin: boolean;
		isInstanceLimitedAdmin: boolean;
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

export type HighSystemsResponsePutApplicationUser = {
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

export type HighSystemsResponsePostTable = {
	success: boolean;
	results: string;
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

export type HighSystemsResponsePostField = {
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

export type HighSystemsResponsePostReport = {
	success: boolean;
	results: string;
};

export type HighSystemsResponseDeleteReport = {
	success: boolean;
	results?: any;
};

export type HighSystemsResponseGetReport = {
	success: boolean;
	results: any;
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
		schema: {
			md: any;
			sm: any;
			xs: any;
		};
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
			applyReverse?: boolean;
		}[];
		properties: {
			displayCoreFields: boolean;
			displayOnMenu: boolean;
			useCustomLayouts: boolean;
			addRedirect?: 'referrer' | 'record';
			editRedirect?: 'referrer' | 'record';
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
		schema: {
			md: any;
			sm: any;
			xs: any;
		};
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
			applyReverse?: boolean;
		}[];
		properties: {
			displayCoreFields: boolean;
			displayOnMenu: boolean;
			useCustomLayouts: boolean;
			addRedirect?: 'referrer' | 'record';
			editRedirect?: 'referrer' | 'record';
		};
	}[];
};

export type HighSystemsResponsePostForm = {
	success: boolean;
	results: string;
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
		schema: {
			md: any;
			sm: any;
			xs: any;
		};
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
			applyReverse?: boolean;
		}[];
		properties: {
			displayCoreFields: boolean;
			displayOnMenu: boolean;
			useCustomLayouts: boolean;
			addRedirect?: 'referrer' | 'record';
			editRedirect?: 'referrer' | 'record';
		};
	};
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
			md: any;
			sm: any;
			xs: any;
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
			md: any;
			sm: any;
			xs: any;
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
		triggeringFields?: string[];
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

export type HighSystemsResponsePostNotification = {
	success: boolean;
	results: string;
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
		triggeringFields?: string[];
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
		triggeringFields?: string[];
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

export type HighSystemsResponsePostWebhook = {
	success: boolean;
	results: string;
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
		triggeringFields?: string[];
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

export type HighSystemsResponseDeleteRecords = {
	success: boolean;
	results: number;
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
		permissions: {
			edit: boolean;
			delete: boolean;
		};
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
	results: any;
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

export type HighSystemsResponseGetPreferences = {
	success: boolean;
	results: {
		relatedUser: string;
		reports: {
			perPage: any;
		};
	};
};

export type HighSystemsResponsePutPreferences = {
	success: boolean;
	results?: any;
};

/* Export to Browser */
if(IS_BROWSER){
	window.HighSystems = exports;
}
