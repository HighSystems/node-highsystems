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
				'Content-Type': 'application/json; charset=UTF-8',
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

			results.headers = objKeysToLowercase<Record<string, string>>(results.headers as AxiosRequestHeaders);

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

	// @ts-ignore/@remove-line - `api` is consumed by the genarated code, typescript doesn't know this
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

//** API CALLS **//

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

//** REQUEST TYPES **//

//** RESPONSE TYPES **//

/* Export to Browser */
if(IS_BROWSER){
	window.HighSystems = exports;
}
