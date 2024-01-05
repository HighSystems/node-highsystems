'use strict';

/* Types */
type SwaggerResponseBody = SwaggerBodyPropertyArray | SwaggerBodyPropertyObject;

type SwaggerBodyPropertyArray = {
	description: string;
	type: 'array';
	items: SwaggerBodySchema;
};

type SwaggerBodyPropertyBoolean = {
	description: string;
	type: 'boolean';
};

type SwaggerBodyPropertyInteger = {
	description: string;
	type: 'integer';
};

type SwaggerBodyPropertyString = {
	description: string;
	type: 'string';
	enum?: string[];
};

type SwaggerBodyPropertyObject = {
	description: string;
	type: 'object';
	additionalProperties: boolean;
	properties: SwaggerBodySchema;
	required?: string[] | false;
};

type SwaggerBodyProperty = SwaggerBodyPropertyObject | SwaggerBodyPropertyArray | SwaggerBodyPropertyBoolean | SwaggerBodyPropertyInteger | SwaggerBodyPropertyString;

type SwaggerBodySchema = {
	type: 'object';
	description?: string;
	required?: string[] | false;
	additionalProperties: boolean;
	properties: Record<string, SwaggerBodyProperty>
};

type SwaggerParameterPath = {
	name: string;
	description: string;
	required: boolean;
	in: 'path';
	example: string | number;
	type: 'string' | 'integer';
};

type SwaggerParameterQuery = {
	name: string;
	description: string;
	required: boolean;
	in: 'query';
	example: string | number;
	type: 'string' | 'integer';
};

type SwaggerParameter = SwaggerParameterQuery | SwaggerParameterPath;

type SwaggerOperation = {
	operationId: string;
	description?: string;
	requestBody?: {
		required: boolean;
		content?: {
			'application/json'?: {
				schema: SwaggerBodySchema;
			}
		}
	},
	parameters: SwaggerParameter[];
	responses: {
		'200': {
			description: string;
			content: {
				'application/json'?: {
					schema: SwaggerResponseBody;
				}
			}
		}
	}
};

type SwaggerAPI = {
	host: string;
	basePath: string;
	paths: Record<string, {
		post?: SwaggerOperation;
		get?: SwaggerOperation;
		delete?: SwaggerOperation;
		put?: SwaggerOperation;
	}>;
};

type FnArgHelp = {
	arg: string;
	description: string;
	definedParam?: boolean;
	defaultValue?: string;
};

/* Dependencies */
import fs from 'fs/promises';

import Debug from 'debug';
import merge from 'deepmerge';

const debug = Debug('highsystems:generate');
const apiSpec: SwaggerAPI = require('../../assets/openapi.json');

/* Overrides */
// const typeOverrides: Record<string, any> = {
// };

const overrides: Record<string, Partial<{
	request: Partial<{
		args: Record<string, string>;
		schema: Partial<SwaggerBodySchema>;
		withCredentials: boolean;
	}>;
	response: Partial<SwaggerResponseBody>;
	arrayMerge?: boolean;
}>> = {
};

/* Functions */
interface APIFunction {
	functionDefinition: string;
	types: {
		req: string;
		res: string
	}
};

const buildAPIFunction = (path: string, method: 'delete' | 'put' | 'post' | 'get', operationObj: SwaggerOperation): APIFunction => {
	const functionName = operationObj.operationId.split('-').slice(-1)[0];
	const capitalizedOperation = capitalizeFirstLetters(functionName);

	const fnArgs: FnArgHelp[] = [];

	const reqTypeName = `HighSystemsRequest${capitalizedOperation}`;
	const reqType = [
		`type ${reqTypeName} = HighSystemsRequest & {`,
	];

	const resTypeName = `HighSystemsResponse${capitalizedOperation}`;
	const resType: string[] = [];
	const queryArgs: string[] = [];

	operationObj.parameters.forEach(({ name, description, type, required }) => {
		const override = overrides[operationObj.operationId]?.request;
	
		if(override && override.args !== undefined && override.args[name]){
			name = override.args[name];

			// @ts-ignore
			delete overrides[operationObj.id].request.args[origName];
		}

		fnArgs.push({
			arg: name,
			description: description
		});

		queryArgs.push(name);

		if(description){
			reqType.push(`	/**`);
			reqType.push(`	 * ${description}`);
			reqType.push(`	 */`);
		}
		reqType.push(`	${name}${required ? '' : '?'}: ${transformType(type)};`);
	});

	if(operationObj.responses['200'] && operationObj.responses['200'].content['application/json']?.schema){
		resType.push('type ' + buildType({
			operationObj,
			key: resTypeName,
			property: getResponseSchema(operationObj),
			isNested: false,
			tabLevel: 1
		}).map((line) => {
			return line.slice(1);
		}).join('\n').trim());
	}

	const override = overrides[operationObj.operationId]?.request;

	if(override && override.args){
		Object.entries(override.args).forEach((arg) => {
			fnArgs.push({
				arg: arg[1],
				description: ''
			});
		});
	}

	fnArgs.push({
		arg: 'requestOptions',
		description: 'Override axios request configuration'
	});

	fnArgs.push({
		arg: 'returnAxios',
		description: 'If `true`, the returned object will be the entire `AxiosResponse` object'
	});

	const hasBody = !!operationObj.requestBody;

	if(operationObj.requestBody && operationObj.requestBody.content?.['application/json']?.schema){
		const bodySchema = getBodySchema(operationObj, operationObj.requestBody.content?.['application/json']?.schema);

		reqType.push(buildBodyType(operationObj, bodySchema).join('\n'));

		fnArgs.push({
			arg: '...body',
			description: ''
		});

		// buildFnHelpArgs(operationObj, bodySchema).forEach((fnArg) => {
		// 	fnArgs.push(fnArg);
		// });
	}

	reqType.push('};');

	const argsList = (returnAxiosDefaultValue?: string) => fnArgs.filter(arg => arg.definedParam !== false).map(({ arg, defaultValue }) => {
		if(arg !== 'returnAxios' || !returnAxiosDefaultValue){
			return `${arg}${defaultValue ? ` = ${defaultValue}` : ''}`;
		}

		return `${arg} = ${returnAxiosDefaultValue}`;
	});
	const argsAreOptional = argsList().length <= 2;

	let pathTemplate = path;

	fnArgs.forEach((fnArg) => {
		const regex = new RegExp('{' + fnArg.arg + '}', 'g');

		pathTemplate = pathTemplate.replace(regex, '${' + fnArg.arg + '}');
	});

	const functionDefinition = [
		'/**',
		` * ${functionName}`,
		' *',
		`${(operationObj.description ?? '').split('\n').map((line) => {
			return ` * ${escapeDescription(line)}`;
		}).join('\n')}`,
		' *',
		// ` * [High Systems Documentation](#TODO)`,
		// ' *',
		` * @param options ${functionName} method options object`,
		fnArgs.filter(({ description }) => !!description).map(({ arg, description }) => {
			return ` * @param options.${arg} ${escapeDescription(description)}`;
		}).join('\n'),
		' */',
		`public async ${functionName}({ ${argsList('false').join(', ')} }: ${reqTypeName} & { returnAxios?: false }): Promise<${resTypeName}['results']>;`,
		`public async ${functionName}({ ${argsList('true').join(', ')} }: ${reqTypeName} & { returnAxios: true }): Promise<AxiosResponse<${resTypeName}>>;`,
		`public async ${functionName}({ ${argsList('false').join(', ')} }: ${reqTypeName}${argsAreOptional ? ' = {}' : ''}): Promise<${resTypeName}['results'] | AxiosResponse<${resTypeName}>> {`,
		`	const results = await this.api<${resTypeName}>({`,
		`		method: '${method}',`,
		`		url: \`${pathTemplate}\`,`,
		hasBody ? `		data: body,` : false,
		queryArgs.length > 0 ? `		params: { ${queryArgs.join(', ')} }` : false,
		`	}, requestOptions);`,
		'',
		`	if(returnAxios){`,
		`		return results;`,
		`	}`,
		'',
		`	return typeof(results.data) === 'object' ? results.data.results : results.data;`,
		'}'
	].filter((val) => val !== false).join('\n');

	return {
		functionDefinition,
		types: {
			req: reqType.join('\n'),
			res: resType.join('\n')
		}
	};
};

const buildFnHelpArgs = (operationObj: SwaggerOperation, schema: SwaggerBodySchema | SwaggerBodyPropertyObject) => {
	const results: FnArgHelp[] = [];

	Object.entries(schema.properties).forEach(([ key, property ]) => {
		buildFnHelp(operationObj, key, property).forEach((result) => {
			results.push(result);
		});
	});

	return results;
};

const buildFnHelp = (operationObj: SwaggerOperation, key: string, property: SwaggerBodyProperty): FnArgHelp[] => {
	const override = overrides[operationObj.operationId]?.request;

	if(override && override.args !== undefined && override.args[key]){
		key = override.args[key];
	}

	const results: FnArgHelp[] = [];

	if(property.type === 'array'){
		if(property.items && property.items.type === 'object' && property.items.properties){
			buildFnHelpArgs(operationObj, property.items).forEach((line) => {
				line.arg = [
					`${key}[]`,
					line.arg
				].join('.');

				results.push(line);
			});
		}else{
			results.push({
				arg: `${key}`,
				description: property.description,
				definedParam: false
			});
		}
	}else
	if(property.type === 'object'){
		if(property.properties){
			buildFnHelpArgs(operationObj, property).forEach((line) => {
				line.arg = [
					key,
					line.arg
				].join('.');

				results.push(line);
			});
		}else{
			debug(`[WARN] Missing fnHelp object type: ${key}. Please modify update.ts to account for this`);
		}
	}else{
		results.push({
			arg: key,
			description: property.description,
			definedParam: false
		});
	}

	return results;
};

const buildBodyType = (operationObj: SwaggerOperation, schema: SwaggerBodySchema | SwaggerBodyPropertyObject, tabLevel: number = 1) => {
	const results: string[] = [];

	Object.entries(schema.properties).forEach(([ key, property ]) => {
		buildType({
			operationObj,
			key,
			property,
			required: schema.required === undefined || schema.required === false || schema.required.indexOf(key) !== -1,
			tabLevel
		}).forEach((result) => {
			results.push(result);
		});
	});

	return results;
};

const buildType = ({
	operationObj,
	key,
	property,
	required = true,
	tabLevel = 1,
	isNested = true,
	unionProp
}: {
	operationObj: SwaggerOperation;
	key: string;
	property: SwaggerBodyProperty;
	required?: boolean;
	tabLevel?: number;
	isNested?: boolean;
	unionProp?: SwaggerBodyProperty;
}): string[] => {
	const override = overrides[operationObj.operationId]?.request;

	if(override && override.args !== undefined && override.args[key]){
		key = override.args[key];
	}

	const results: string[] = [];

	if(property.description){
		results.push(
			`/**`,
			` * ${escapeDescription(property.description)}`,
			` */`
		);
	}

	if(property.type === 'array'){
		if(property.items && property.items.type){
			if(property.items.type === 'object'){
				results.push(`${key}${required ? '' : '?'}${isNested ? ':' : ' ='} {`);

				buildBodyType(operationObj, property.items, isNested ? tabLevel : tabLevel).forEach((line) => {
					results.push(line);
				});

				results.push(`}[]${unionProp ? ' | false' : ''};`);
			}else{
				results.push(`${key}${required ? '' : '?'}: ${transformType(property.items.type)}[];`);
			}
		}else{
			debug(`[WARN] Missing items type: ${key}. Assigning as \`any\`.`);

			results.push(`${key}${required ? '' : '?'}: any;`);
		}
	}else
	if(property.type === 'object'){
		if(property.properties){
			results.push(`${key}${required ? '' : '?'}${isNested ? ':' : ' ='} {`);

			buildBodyType(operationObj, property, isNested ? tabLevel : tabLevel).forEach((line) => {
				results.push(line);
			});

			results.push(`};`);
		}else{
			debug(`[WARN] Missing properties for object type: ${key}. Assigning as \`any\`.`);

			results.push(`${key}${required ? '' : '?'}${isNested ? ':' : ' ='} any;`);
		}
	}else{
		if(property.type){
			if(property.type === 'string' && property.enum){
				results.push(`${key}${required ? '' : '?'}: ${property.enum.map((val) => {
					return `'${val}'`;
				}).join(' | ')};`);
			}else{
				results.push(`${key}${required ? '' : '?'}: ${transformType(property.type)};`);
			}
		}else{
			debug(`[WARN] Missing type: ${key}. Assigning as \`any\`.`);

			results.push(`${key}${required ? '' : '?'}: any;`);
		}
	}

	return results.map((line) => {
		return ''.padStart(tabLevel, `\t`) + line;
	});
};

const capitalizeFirstLetter = (string: string) => {
	return string.charAt(0).toLocaleUpperCase() + string.slice(1);
};

const capitalizeFirstLetters = (string: string) => {
	return string.split(' ').map(capitalizeFirstLetter).join(' ');
};

const escapeDescription = (description: string) => {
	return description.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
};

// const getAxiosDataParam = (operationObj: SwaggerOperation) => {
// 	const override = overrides[operationObj.operationId]?.request;

// 	if(!override || override.args === undefined || Object.keys(override.args).length === 0){
// 		return 'body';
// 	}

// 	return `{
// ${Object.entries(override.args).map(([ orgArg, newArg ]) => {
// 	return `\t\t\t${orgArg}: ${newArg}`
// }).join(',\n')},
// \t\t\t...body
// \t\t}`;
// };

const getBodySchema = (operationObj: SwaggerOperation, schema: SwaggerBodySchema) => {
	return merge.all([
		schema,
		overrides[operationObj.operationId]?.request?.schema || {}
	]) as SwaggerBodySchema;
};

const getResponseSchema = (operationObj: SwaggerOperation) => {
	return merge.all([
		operationObj.responses['200'].content['application/json']?.schema ?? {},
		overrides[operationObj.operationId]?.response || {},
		{
			description: ''
		}
	]/*, overrides[operationObj.id]?.arrayMerge ? {
		// @ts-ignore unused vars
		// arrayMerge: (target, source, options) => source
	} : undefined */) as SwaggerBodyProperty;
};

const transformType = (type: string) => {
	if(type === 'integer'){
		return 'number';
	}

	return type || 'any';
};

/* Main */
(async () => {
	try {
		const baseCodeBuffer = await fs.readFile(__dirname + '/base.ts');
		const baseCode = baseCodeBuffer.toString();

		const results = Object.entries(apiSpec.paths).reduce<APIFunction[]>((results, [ path, operations ]) => {
			if(operations.delete){
				results.push(buildAPIFunction(path, 'delete', operations.delete));
			}

			if(operations.get){
				results.push(buildAPIFunction(path, 'get', operations.get));
			}

			if(operations.post){
				results.push(buildAPIFunction(path, 'post', operations.post));
			}

			if(operations.put){
				results.push(buildAPIFunction(path, 'put', operations.put));
			}

			return results;
		}, []);

		await fs.writeFile(
			__dirname + '/../client.ts',
			baseCode.split('\n').reduce((code, line) => {
				if(line.match(/\@remove\-line/)){
					return code;
				}

				return code + '\n' + line;
			}, '')
				.replace('//** API CALLS **//', results.map((result) => {
					return result.functionDefinition.split('\n').map((line) => {
						return `\t${line}`;
					}).join('\n');
				}).join('\n\n'))
				.replace('//** REQUEST TYPES **//', results.filter((result) => {
					return !!result.types.req;
				}).map((result) => {
					return `export ${result.types.req}`;
				}).join('\n\n'))
				.replace('//** RESPONSE TYPES **//', results.filter((result) => {
					return !!result.types.res;
				}).map((result) => {
					return `export ${result.types.res}`;
				}).join('\n\n'))
		);
	}catch(err: any){
		console.error(err);

		process.exit(1);
	}
})();
