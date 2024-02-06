import { AxiosRequestConfig, AxiosResponse } from 'axios';
export declare class HighSystems {
    readonly CLASS_NAME: string;
    static readonly CLASS_NAME: string;
    static readonly VERSION: string;
    /**
     * The default settings of a `HighSystems` instance
     */
    static defaults: Required<HighSystemsOptions>;
    /**
     * The internal numerical id for API calls.
     *
     * Increments by 1 with each request.
     */
    private _id;
    /**
     * The internal throttler for rate-limiting API calls
     */
    private throttle;
    /**
     * The `HighSystems` instance settings
     */
    settings: Required<HighSystemsOptions>;
    constructor(options?: HighSystemsOptions);
    private assignAuthorizationHeaders;
    private getBaseRequest;
    private request;
    private api;
    /**
     * Rebuild the HighSystems instance from serialized JSON
     *
     * @param json HighSystems class options
     */
    fromJSON(json: string | HighSystemsOptions): HighSystems;
    /**
     * Serialize the HighSystems instance into JSON
     */
    toJSON(): Required<HighSystemsOptions>;
    /**
     * Create a new HighSystems instance from serialized JSON
     *
     * @param json HighSystems class options
     */
    static fromJSON(json: string | HighSystemsOptions): HighSystems;
    /**
     * Test if a variable is a `highsystems` object
     *
     * @param obj A variable you'd like to test
     */
    static IsHighSystems(obj: any): obj is HighSystems;
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
    getTransaction({ requestOptions, returnAxios }: HighSystemsRequestGetTransaction & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetTransaction['results']>;
    getTransaction({ requestOptions, returnAxios }: HighSystemsRequestGetTransaction & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetTransaction>>;
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
    deleteTransaction({ id, requestOptions, returnAxios }: HighSystemsRequestDeleteTransaction & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseDeleteTransaction['results']>;
    deleteTransaction({ id, requestOptions, returnAxios }: HighSystemsRequestDeleteTransaction & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseDeleteTransaction>>;
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
    postTransaction({ id, requestOptions, returnAxios }: HighSystemsRequestPostTransaction & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePostTransaction['results']>;
    postTransaction({ id, requestOptions, returnAxios }: HighSystemsRequestPostTransaction & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePostTransaction>>;
    /**
     * getInstanceSettings
     *
     * This endpoint allows you to retreive the settings for a given instance.
     *
     * @param options getInstanceSettings method options object
     * @param options.requestOptions Override axios request configuration
     * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
     */
    getInstanceSettings({ requestOptions, returnAxios }: HighSystemsRequestGetInstanceSettings & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetInstanceSettings['results']>;
    getInstanceSettings({ requestOptions, returnAxios }: HighSystemsRequestGetInstanceSettings & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetInstanceSettings>>;
    /**
     * putInstanceSettings
     *
     * This endpoint allows you to update the settings for a given instance.
     *
     * @param options putInstanceSettings method options object
     * @param options.requestOptions Override axios request configuration
     * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
     */
    putInstanceSettings({ requestOptions, returnAxios, ...body }: HighSystemsRequestPutInstanceSettings & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePutInstanceSettings['results']>;
    putInstanceSettings({ requestOptions, returnAxios, ...body }: HighSystemsRequestPutInstanceSettings & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePutInstanceSettings>>;
    /**
     * getUsers
     *
     * This endpoint allows you to query for all the users in the High Systems instance.
     *
     * @param options getUsers method options object
     * @param options.requestOptions Override axios request configuration
     * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
     */
    getUsers({ requestOptions, returnAxios }: HighSystemsRequestGetUsers & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetUsers['results']>;
    getUsers({ requestOptions, returnAxios }: HighSystemsRequestGetUsers & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetUsers>>;
    /**
     * postUser
     *
     * This endpoint allows you to create a new instance user.
     *
     * @param options postUser method options object
     * @param options.requestOptions Override axios request configuration
     * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
     */
    postUser({ requestOptions, returnAxios, ...body }: HighSystemsRequestPostUser & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePostUser['results']>;
    postUser({ requestOptions, returnAxios, ...body }: HighSystemsRequestPostUser & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePostUser>>;
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
    deleteUser({ userid, requestOptions, returnAxios }: HighSystemsRequestDeleteUser & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseDeleteUser['results']>;
    deleteUser({ userid, requestOptions, returnAxios }: HighSystemsRequestDeleteUser & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseDeleteUser>>;
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
    getUser({ userid, requestOptions, returnAxios }: HighSystemsRequestGetUser & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetUser['results']>;
    getUser({ userid, requestOptions, returnAxios }: HighSystemsRequestGetUser & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetUser>>;
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
    putUser({ userid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutUser & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePutUser['results']>;
    putUser({ userid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutUser & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePutUser>>;
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
    getUserTokens({ userid, requestOptions, returnAxios }: HighSystemsRequestGetUserTokens & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetUserTokens['results']>;
    getUserTokens({ userid, requestOptions, returnAxios }: HighSystemsRequestGetUserTokens & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetUserTokens>>;
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
    postUserToken({ userid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostUserToken & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePostUserToken['results']>;
    postUserToken({ userid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostUserToken & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePostUserToken>>;
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
    deleteUserToken({ userid, tokenid, requestOptions, returnAxios }: HighSystemsRequestDeleteUserToken & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseDeleteUserToken['results']>;
    deleteUserToken({ userid, tokenid, requestOptions, returnAxios }: HighSystemsRequestDeleteUserToken & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseDeleteUserToken>>;
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
    getUserToken({ userid, tokenid, requestOptions, returnAxios }: HighSystemsRequestGetUserToken & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetUserToken['results']>;
    getUserToken({ userid, tokenid, requestOptions, returnAxios }: HighSystemsRequestGetUserToken & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetUserToken>>;
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
    putUserToken({ tokenid, userid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutUserToken & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePutUserToken['results']>;
    putUserToken({ tokenid, userid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutUserToken & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePutUserToken>>;
    /**
     * getApplications
     *
     * This endpoint allows you to query for all the applications you've been invited to.
     *
     * @param options getApplications method options object
     * @param options.requestOptions Override axios request configuration
     * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
     */
    getApplications({ requestOptions, returnAxios }: HighSystemsRequestGetApplications & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetApplications['results']>;
    getApplications({ requestOptions, returnAxios }: HighSystemsRequestGetApplications & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetApplications>>;
    /**
     * postApplication
     *
     * This endpoint allows you to create a new application.
     *
     * @param options postApplication method options object
     * @param options.requestOptions Override axios request configuration
     * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
     */
    postApplication({ requestOptions, returnAxios, ...body }: HighSystemsRequestPostApplication & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePostApplication['results']>;
    postApplication({ requestOptions, returnAxios, ...body }: HighSystemsRequestPostApplication & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePostApplication>>;
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
    deleteApplication({ appid, requestOptions, returnAxios }: HighSystemsRequestDeleteApplication & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseDeleteApplication['results']>;
    deleteApplication({ appid, requestOptions, returnAxios }: HighSystemsRequestDeleteApplication & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseDeleteApplication>>;
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
    getApplication({ appid, requestOptions, returnAxios }: HighSystemsRequestGetApplication & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetApplication['results']>;
    getApplication({ appid, requestOptions, returnAxios }: HighSystemsRequestGetApplication & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetApplication>>;
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
    putApplication({ appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutApplication & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePutApplication['results']>;
    putApplication({ appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutApplication & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePutApplication>>;
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
    getApplicationMenus({ appid, requestOptions, returnAxios }: HighSystemsRequestGetApplicationMenus & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetApplicationMenus['results']>;
    getApplicationMenus({ appid, requestOptions, returnAxios }: HighSystemsRequestGetApplicationMenus & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetApplicationMenus>>;
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
    postApplicationMenu({ appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostApplicationMenu & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePostApplicationMenu['results']>;
    postApplicationMenu({ appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostApplicationMenu & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePostApplicationMenu>>;
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
    deleteApplicationMenu({ appid, menuid, requestOptions, returnAxios }: HighSystemsRequestDeleteApplicationMenu & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseDeleteApplicationMenu['results']>;
    deleteApplicationMenu({ appid, menuid, requestOptions, returnAxios }: HighSystemsRequestDeleteApplicationMenu & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseDeleteApplicationMenu>>;
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
    getApplicationMenu({ appid, menuid, requestOptions, returnAxios }: HighSystemsRequestGetApplicationMenu & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetApplicationMenu['results']>;
    getApplicationMenu({ appid, menuid, requestOptions, returnAxios }: HighSystemsRequestGetApplicationMenu & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetApplicationMenu>>;
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
    putApplicationMenu({ appid, menuid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutApplicationMenu & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePutApplicationMenu['results']>;
    putApplicationMenu({ appid, menuid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutApplicationMenu & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePutApplicationMenu>>;
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
    getApplicationUserMenu({ appid, requestOptions, returnAxios }: HighSystemsRequestGetApplicationUserMenu & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetApplicationUserMenu['results']>;
    getApplicationUserMenu({ appid, requestOptions, returnAxios }: HighSystemsRequestGetApplicationUserMenu & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetApplicationUserMenu>>;
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
    getVariables({ appid, requestOptions, returnAxios }: HighSystemsRequestGetVariables & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetVariables['results']>;
    getVariables({ appid, requestOptions, returnAxios }: HighSystemsRequestGetVariables & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetVariables>>;
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
    postVariable({ appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostVariable & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePostVariable['results']>;
    postVariable({ appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostVariable & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePostVariable>>;
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
    deleteVariable({ appid, variableid, requestOptions, returnAxios }: HighSystemsRequestDeleteVariable & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseDeleteVariable['results']>;
    deleteVariable({ appid, variableid, requestOptions, returnAxios }: HighSystemsRequestDeleteVariable & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseDeleteVariable>>;
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
    getVariable({ appid, variableid, requestOptions, returnAxios }: HighSystemsRequestGetVariable & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetVariable['results']>;
    getVariable({ appid, variableid, requestOptions, returnAxios }: HighSystemsRequestGetVariable & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetVariable>>;
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
    putVariable({ variableid, appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutVariable & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePutVariable['results']>;
    putVariable({ variableid, appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutVariable & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePutVariable>>;
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
    getRoles({ appid, requestOptions, returnAxios }: HighSystemsRequestGetRoles & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetRoles['results']>;
    getRoles({ appid, requestOptions, returnAxios }: HighSystemsRequestGetRoles & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetRoles>>;
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
    postRole({ appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostRole & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePostRole['results']>;
    postRole({ appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostRole & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePostRole>>;
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
    deleteRole({ appid, roleid, requestOptions, returnAxios }: HighSystemsRequestDeleteRole & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseDeleteRole['results']>;
    deleteRole({ appid, roleid, requestOptions, returnAxios }: HighSystemsRequestDeleteRole & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseDeleteRole>>;
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
    getRole({ appid, roleid, requestOptions, returnAxios }: HighSystemsRequestGetRole & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetRole['results']>;
    getRole({ appid, roleid, requestOptions, returnAxios }: HighSystemsRequestGetRole & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetRole>>;
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
    putRole({ appid, roleid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutRole & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePutRole['results']>;
    putRole({ appid, roleid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutRole & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePutRole>>;
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
    getRolePermissions({ appid, roleid, requestOptions, returnAxios }: HighSystemsRequestGetRolePermissions & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetRolePermissions['results']>;
    getRolePermissions({ appid, roleid, requestOptions, returnAxios }: HighSystemsRequestGetRolePermissions & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetRolePermissions>>;
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
    getRoleTablePermissions({ appid, roleid, requestOptions, returnAxios }: HighSystemsRequestGetRoleTablePermissions & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetRoleTablePermissions['results']>;
    getRoleTablePermissions({ appid, roleid, requestOptions, returnAxios }: HighSystemsRequestGetRoleTablePermissions & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetRoleTablePermissions>>;
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
    getRoleDefaults({ appid, roleid, requestOptions, returnAxios }: HighSystemsRequestGetRoleDefaults & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetRoleDefaults['results']>;
    getRoleDefaults({ appid, roleid, requestOptions, returnAxios }: HighSystemsRequestGetRoleDefaults & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetRoleDefaults>>;
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
    getApplicationUsers({ appid, requestOptions, returnAxios }: HighSystemsRequestGetApplicationUsers & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetApplicationUsers['results']>;
    getApplicationUsers({ appid, requestOptions, returnAxios }: HighSystemsRequestGetApplicationUsers & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetApplicationUsers>>;
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
    postApplicationUser({ appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostApplicationUser & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePostApplicationUser['results']>;
    postApplicationUser({ appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostApplicationUser & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePostApplicationUser>>;
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
    deleteApplicationUser({ appid, userid, requestOptions, returnAxios }: HighSystemsRequestDeleteApplicationUser & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseDeleteApplicationUser['results']>;
    deleteApplicationUser({ appid, userid, requestOptions, returnAxios }: HighSystemsRequestDeleteApplicationUser & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseDeleteApplicationUser>>;
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
    getApplicationUser({ appid, userid, requestOptions, returnAxios }: HighSystemsRequestGetApplicationUser & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetApplicationUser['results']>;
    getApplicationUser({ appid, userid, requestOptions, returnAxios }: HighSystemsRequestGetApplicationUser & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetApplicationUser>>;
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
    putApplicationUser({ appid, applicationUserId, requestOptions, returnAxios, ...body }: HighSystemsRequestPutApplicationUser & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePutApplicationUser['results']>;
    putApplicationUser({ appid, applicationUserId, requestOptions, returnAxios, ...body }: HighSystemsRequestPutApplicationUser & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePutApplicationUser>>;
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
    getTables({ appid, requestOptions, returnAxios }: HighSystemsRequestGetTables & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetTables['results']>;
    getTables({ appid, requestOptions, returnAxios }: HighSystemsRequestGetTables & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetTables>>;
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
    postTable({ appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostTable & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePostTable['results']>;
    postTable({ appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostTable & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePostTable>>;
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
    deleteTable({ appid, tableid, requestOptions, returnAxios }: HighSystemsRequestDeleteTable & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseDeleteTable['results']>;
    deleteTable({ appid, tableid, requestOptions, returnAxios }: HighSystemsRequestDeleteTable & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseDeleteTable>>;
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
    getTable({ appid, tableid, requestOptions, returnAxios }: HighSystemsRequestGetTable & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetTable['results']>;
    getTable({ appid, tableid, requestOptions, returnAxios }: HighSystemsRequestGetTable & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetTable>>;
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
    putTable({ appid, tableid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutTable & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePutTable['results']>;
    putTable({ appid, tableid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutTable & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePutTable>>;
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
    getApplicationRelationships({ appid, requestOptions, returnAxios }: HighSystemsRequestGetApplicationRelationships & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetApplicationRelationships['results']>;
    getApplicationRelationships({ appid, requestOptions, returnAxios }: HighSystemsRequestGetApplicationRelationships & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetApplicationRelationships>>;
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
    getTableRelationships({ appid, tableid, requestOptions, returnAxios }: HighSystemsRequestGetTableRelationships & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetTableRelationships['results']>;
    getTableRelationships({ appid, tableid, requestOptions, returnAxios }: HighSystemsRequestGetTableRelationships & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetTableRelationships>>;
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
    getApplicationFields({ appid, requestOptions, returnAxios }: HighSystemsRequestGetApplicationFields & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetApplicationFields['results']>;
    getApplicationFields({ appid, requestOptions, returnAxios }: HighSystemsRequestGetApplicationFields & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetApplicationFields>>;
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
    getFields({ appid, tableid, clist, requestOptions, returnAxios }: HighSystemsRequestGetFields & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetFields['results']>;
    getFields({ appid, tableid, clist, requestOptions, returnAxios }: HighSystemsRequestGetFields & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetFields>>;
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
    postField({ appid, tableid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostField & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePostField['results']>;
    postField({ appid, tableid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostField & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePostField>>;
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
    deleteField({ appid, tableid, fieldid, requestOptions, returnAxios }: HighSystemsRequestDeleteField & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseDeleteField['results']>;
    deleteField({ appid, tableid, fieldid, requestOptions, returnAxios }: HighSystemsRequestDeleteField & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseDeleteField>>;
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
    getField({ appid, tableid, fieldid, requestOptions, returnAxios }: HighSystemsRequestGetField & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetField['results']>;
    getField({ appid, tableid, fieldid, requestOptions, returnAxios }: HighSystemsRequestGetField & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetField>>;
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
    putField({ appid, tableid, fieldid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutField & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePutField['results']>;
    putField({ appid, tableid, fieldid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutField & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePutField>>;
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
    getApplicationReports({ appid, requestOptions, returnAxios }: HighSystemsRequestGetApplicationReports & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetApplicationReports['results']>;
    getApplicationReports({ appid, requestOptions, returnAxios }: HighSystemsRequestGetApplicationReports & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetApplicationReports>>;
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
    getReports({ appid, tableid, requestOptions, returnAxios }: HighSystemsRequestGetReports & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetReports['results']>;
    getReports({ appid, tableid, requestOptions, returnAxios }: HighSystemsRequestGetReports & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetReports>>;
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
    postReport({ appid, tableid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostReport & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePostReport['results']>;
    postReport({ appid, tableid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostReport & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePostReport>>;
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
    deleteReport({ appid, tableid, reportid, requestOptions, returnAxios }: HighSystemsRequestDeleteReport & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseDeleteReport['results']>;
    deleteReport({ appid, tableid, reportid, requestOptions, returnAxios }: HighSystemsRequestDeleteReport & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseDeleteReport>>;
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
    getReport({ appid, tableid, reportid, requestOptions, returnAxios }: HighSystemsRequestGetReport & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetReport['results']>;
    getReport({ appid, tableid, reportid, requestOptions, returnAxios }: HighSystemsRequestGetReport & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetReport>>;
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
    putReport({ appid, tableid, reportid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutReport & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePutReport['results']>;
    putReport({ appid, tableid, reportid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutReport & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePutReport>>;
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
    getApplicationForms({ appid, requestOptions, returnAxios }: HighSystemsRequestGetApplicationForms & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetApplicationForms['results']>;
    getApplicationForms({ appid, requestOptions, returnAxios }: HighSystemsRequestGetApplicationForms & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetApplicationForms>>;
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
    getForms({ appid, tableid, requestOptions, returnAxios }: HighSystemsRequestGetForms & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetForms['results']>;
    getForms({ appid, tableid, requestOptions, returnAxios }: HighSystemsRequestGetForms & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetForms>>;
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
    postForm({ appid, tableid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostForm & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePostForm['results']>;
    postForm({ appid, tableid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostForm & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePostForm>>;
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
    deleteForm({ appid, tableid, formid, requestOptions, returnAxios }: HighSystemsRequestDeleteForm & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseDeleteForm['results']>;
    deleteForm({ appid, tableid, formid, requestOptions, returnAxios }: HighSystemsRequestDeleteForm & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseDeleteForm>>;
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
    getForm({ appid, tableid, formid, requestOptions, returnAxios }: HighSystemsRequestGetForm & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetForm['results']>;
    getForm({ appid, tableid, formid, requestOptions, returnAxios }: HighSystemsRequestGetForm & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetForm>>;
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
    putForm({ appid, tableid, formid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutForm & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePutForm['results']>;
    putForm({ appid, tableid, formid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutForm & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePutForm>>;
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
    getApplicationEntityRelationshipDiagram({ appid, requestOptions, returnAxios }: HighSystemsRequestGetApplicationEntityRelationshipDiagram & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetApplicationEntityRelationshipDiagram['results']>;
    getApplicationEntityRelationshipDiagram({ appid, requestOptions, returnAxios }: HighSystemsRequestGetApplicationEntityRelationshipDiagram & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetApplicationEntityRelationshipDiagram>>;
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
    putApplicationEntityRelationshipDiagram({ appid, diagramid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutApplicationEntityRelationshipDiagram & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePutApplicationEntityRelationshipDiagram['results']>;
    putApplicationEntityRelationshipDiagram({ appid, diagramid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutApplicationEntityRelationshipDiagram & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePutApplicationEntityRelationshipDiagram>>;
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
    getDashboards({ appid, relatedTable, requestOptions, returnAxios }: HighSystemsRequestGetDashboards & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetDashboards['results']>;
    getDashboards({ appid, relatedTable, requestOptions, returnAxios }: HighSystemsRequestGetDashboards & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetDashboards>>;
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
    postDashboard({ appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostDashboard & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePostDashboard['results']>;
    postDashboard({ appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostDashboard & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePostDashboard>>;
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
    deleteDashboard({ appid, tableid, dashboardid, requestOptions, returnAxios }: HighSystemsRequestDeleteDashboard & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseDeleteDashboard['results']>;
    deleteDashboard({ appid, tableid, dashboardid, requestOptions, returnAxios }: HighSystemsRequestDeleteDashboard & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseDeleteDashboard>>;
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
    getDashboard({ appid, relatedTable, dashboardid, requestOptions, returnAxios }: HighSystemsRequestGetDashboard & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetDashboard['results']>;
    getDashboard({ appid, relatedTable, dashboardid, requestOptions, returnAxios }: HighSystemsRequestGetDashboard & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetDashboard>>;
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
    putDashboard({ appid, dashboardid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutDashboard & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePutDashboard['results']>;
    putDashboard({ appid, dashboardid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutDashboard & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePutDashboard>>;
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
    getPages({ appid, requestOptions, returnAxios }: HighSystemsRequestGetPages & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetPages['results']>;
    getPages({ appid, requestOptions, returnAxios }: HighSystemsRequestGetPages & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetPages>>;
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
    postPage({ appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostPage & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePostPage['results']>;
    postPage({ appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostPage & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePostPage>>;
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
    deletePage({ appid, pageid, requestOptions, returnAxios }: HighSystemsRequestDeletePage & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseDeletePage['results']>;
    deletePage({ appid, pageid, requestOptions, returnAxios }: HighSystemsRequestDeletePage & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseDeletePage>>;
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
    getPage({ appid, pageid, requestOptions, returnAxios }: HighSystemsRequestGetPage & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetPage['results']>;
    getPage({ appid, pageid, requestOptions, returnAxios }: HighSystemsRequestGetPage & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetPage>>;
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
    putPage({ appid, pageid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutPage & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePutPage['results']>;
    putPage({ appid, pageid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutPage & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePutPage>>;
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
    getNotifications({ appid, tableid, requestOptions, returnAxios }: HighSystemsRequestGetNotifications & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetNotifications['results']>;
    getNotifications({ appid, tableid, requestOptions, returnAxios }: HighSystemsRequestGetNotifications & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetNotifications>>;
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
    postNotification({ appid, tableid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostNotification & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePostNotification['results']>;
    postNotification({ appid, tableid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostNotification & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePostNotification>>;
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
    deleteNotification({ appid, tableid, notificationid, requestOptions, returnAxios }: HighSystemsRequestDeleteNotification & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseDeleteNotification['results']>;
    deleteNotification({ appid, tableid, notificationid, requestOptions, returnAxios }: HighSystemsRequestDeleteNotification & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseDeleteNotification>>;
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
    getNotification({ appid, tableid, notificationid, requestOptions, returnAxios }: HighSystemsRequestGetNotification & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetNotification['results']>;
    getNotification({ appid, tableid, notificationid, requestOptions, returnAxios }: HighSystemsRequestGetNotification & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetNotification>>;
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
    putNotification({ appid, tableid, notificationid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutNotification & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePutNotification['results']>;
    putNotification({ appid, tableid, notificationid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutNotification & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePutNotification>>;
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
    getWebhooks({ appid, tableid, requestOptions, returnAxios }: HighSystemsRequestGetWebhooks & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetWebhooks['results']>;
    getWebhooks({ appid, tableid, requestOptions, returnAxios }: HighSystemsRequestGetWebhooks & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetWebhooks>>;
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
    postWebhook({ appid, tableid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostWebhook & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePostWebhook['results']>;
    postWebhook({ appid, tableid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostWebhook & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePostWebhook>>;
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
    deleteWebhook({ appid, tableid, webhookid, requestOptions, returnAxios }: HighSystemsRequestDeleteWebhook & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseDeleteWebhook['results']>;
    deleteWebhook({ appid, tableid, webhookid, requestOptions, returnAxios }: HighSystemsRequestDeleteWebhook & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseDeleteWebhook>>;
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
    getWebhook({ appid, tableid, webhookid, requestOptions, returnAxios }: HighSystemsRequestGetWebhook & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetWebhook['results']>;
    getWebhook({ appid, tableid, webhookid, requestOptions, returnAxios }: HighSystemsRequestGetWebhook & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetWebhook>>;
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
    putWebhook({ appid, tableid, webhookid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutWebhook & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePutWebhook['results']>;
    putWebhook({ appid, tableid, webhookid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutWebhook & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePutWebhook>>;
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
    getFunctions({ appid, requestOptions, returnAxios }: HighSystemsRequestGetFunctions & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetFunctions['results']>;
    getFunctions({ appid, requestOptions, returnAxios }: HighSystemsRequestGetFunctions & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetFunctions>>;
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
    postFunction({ appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostFunction & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePostFunction['results']>;
    postFunction({ appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostFunction & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePostFunction>>;
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
    deleteFunction({ appid, functionid, requestOptions, returnAxios }: HighSystemsRequestDeleteFunction & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseDeleteFunction['results']>;
    deleteFunction({ appid, functionid, requestOptions, returnAxios }: HighSystemsRequestDeleteFunction & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseDeleteFunction>>;
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
    getFunction({ appid, functionid, requestOptions, returnAxios }: HighSystemsRequestGetFunction & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetFunction['results']>;
    getFunction({ appid, functionid, requestOptions, returnAxios }: HighSystemsRequestGetFunction & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetFunction>>;
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
    putFunction({ appid, functionid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutFunction & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePutFunction['results']>;
    putFunction({ appid, functionid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutFunction & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePutFunction>>;
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
    getTriggers({ appid, requestOptions, returnAxios }: HighSystemsRequestGetTriggers & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetTriggers['results']>;
    getTriggers({ appid, requestOptions, returnAxios }: HighSystemsRequestGetTriggers & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetTriggers>>;
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
    postTrigger({ appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostTrigger & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePostTrigger['results']>;
    postTrigger({ appid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostTrigger & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePostTrigger>>;
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
    deleteTrigger({ appid, triggerid, requestOptions, returnAxios }: HighSystemsRequestDeleteTrigger & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseDeleteTrigger['results']>;
    deleteTrigger({ appid, triggerid, requestOptions, returnAxios }: HighSystemsRequestDeleteTrigger & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseDeleteTrigger>>;
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
    getTrigger({ appid, triggerid, requestOptions, returnAxios }: HighSystemsRequestGetTrigger & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetTrigger['results']>;
    getTrigger({ appid, triggerid, requestOptions, returnAxios }: HighSystemsRequestGetTrigger & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetTrigger>>;
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
    putTrigger({ appid, triggerid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutTrigger & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePutTrigger['results']>;
    putTrigger({ appid, triggerid, requestOptions, returnAxios, ...body }: HighSystemsRequestPutTrigger & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePutTrigger>>;
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
    deleteRecords({ appid, tableid, query, requestOptions, returnAxios }: HighSystemsRequestDeleteRecords & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseDeleteRecords['results']>;
    deleteRecords({ appid, tableid, query, requestOptions, returnAxios }: HighSystemsRequestDeleteRecords & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseDeleteRecords>>;
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
    getRecords({ type, query, columns, summarize, grouping, sorting, page, mergeQuery, includePermissions, appid, tableid, reportid, requestOptions, returnAxios }: HighSystemsRequestGetRecords & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetRecords['results']>;
    getRecords({ type, query, columns, summarize, grouping, sorting, page, mergeQuery, includePermissions, appid, tableid, reportid, requestOptions, returnAxios }: HighSystemsRequestGetRecords & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetRecords>>;
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
    postRecord({ appid, tableid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostRecord & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePostRecord['results']>;
    postRecord({ appid, tableid, requestOptions, returnAxios, ...body }: HighSystemsRequestPostRecord & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePostRecord>>;
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
    getRecordsCount({ appid, tableid, reportid, query, mergeQuery, requestOptions, returnAxios }: HighSystemsRequestGetRecordsCount & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetRecordsCount['results']>;
    getRecordsCount({ appid, tableid, reportid, query, mergeQuery, requestOptions, returnAxios }: HighSystemsRequestGetRecordsCount & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetRecordsCount>>;
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
    getRecordsTotals({ type, query, totals, columns, summarize, grouping, sorting, page, mergeQuery, includePermissions, appid, tableid, reportid, requestOptions, returnAxios }: HighSystemsRequestGetRecordsTotals & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetRecordsTotals['results']>;
    getRecordsTotals({ type, query, totals, columns, summarize, grouping, sorting, page, mergeQuery, includePermissions, appid, tableid, reportid, requestOptions, returnAxios }: HighSystemsRequestGetRecordsTotals & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetRecordsTotals>>;
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
    deleteRecord({ appid, tableid, recordid, requestOptions, returnAxios }: HighSystemsRequestDeleteRecord & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseDeleteRecord['results']>;
    deleteRecord({ appid, tableid, recordid, requestOptions, returnAxios }: HighSystemsRequestDeleteRecord & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseDeleteRecord>>;
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
    getRecord({ appid, tableid, recordid, clist, includePermissions, requestOptions, returnAxios }: HighSystemsRequestGetRecord & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetRecord['results']>;
    getRecord({ appid, tableid, recordid, clist, includePermissions, requestOptions, returnAxios }: HighSystemsRequestGetRecord & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetRecord>>;
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
    putRecord({ appid, tableid, id, requestOptions, returnAxios, ...body }: HighSystemsRequestPutRecord & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePutRecord['results']>;
    putRecord({ appid, tableid, id, requestOptions, returnAxios, ...body }: HighSystemsRequestPutRecord & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePutRecord>>;
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
    upsertRecords({ appid, tableid, requestOptions, returnAxios, ...body }: HighSystemsRequestUpsertRecords & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseUpsertRecords['results']>;
    upsertRecords({ appid, tableid, requestOptions, returnAxios, ...body }: HighSystemsRequestUpsertRecords & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseUpsertRecords>>;
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
    calculateRecordFormulas({ appid, tableid, requestOptions, returnAxios, ...body }: HighSystemsRequestCalculateRecordFormulas & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseCalculateRecordFormulas['results']>;
    calculateRecordFormulas({ appid, tableid, requestOptions, returnAxios, ...body }: HighSystemsRequestCalculateRecordFormulas & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseCalculateRecordFormulas>>;
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
    getFile({ appid, tableid, recordid, fieldid, requestOptions, returnAxios }: HighSystemsRequestGetFile & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetFile['results']>;
    getFile({ appid, tableid, recordid, fieldid, requestOptions, returnAxios }: HighSystemsRequestGetFile & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetFile>>;
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
    getPresignedFileUrl({ appid, tableid, recordid, fieldid, pageid, logo, action, contentType, responseDisposition, responseType, requestOptions, returnAxios }: HighSystemsRequestGetPresignedFileUrl & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetPresignedFileUrl['results']>;
    getPresignedFileUrl({ appid, tableid, recordid, fieldid, pageid, logo, action, contentType, responseDisposition, responseType, requestOptions, returnAxios }: HighSystemsRequestGetPresignedFileUrl & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetPresignedFileUrl>>;
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
    finalizeFileUpload({ appid, tableid, recordid, fieldid, tmpLocation, size, filename, requestOptions, returnAxios }: HighSystemsRequestFinalizeFileUpload & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseFinalizeFileUpload['results']>;
    finalizeFileUpload({ appid, tableid, recordid, fieldid, tmpLocation, size, filename, requestOptions, returnAxios }: HighSystemsRequestFinalizeFileUpload & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseFinalizeFileUpload>>;
    /**
     * getPreferences
     *
     * This endpoint allows you to retrieve your saved preferences.
     *
     * @param options getPreferences method options object
     * @param options.requestOptions Override axios request configuration
     * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
     */
    getPreferences({ requestOptions, returnAxios }: HighSystemsRequestGetPreferences & {
        returnAxios?: false;
    }): Promise<HighSystemsResponseGetPreferences['results']>;
    getPreferences({ requestOptions, returnAxios }: HighSystemsRequestGetPreferences & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponseGetPreferences>>;
    /**
     * putPreferences
     *
     * This endpoint allows you to update your saved preferences.
     *
     * @param options putPreferences method options object
     * @param options.requestOptions Override axios request configuration
     * @param options.returnAxios If `true`, the returned object will be the entire `AxiosResponse` object
     */
    putPreferences({ requestOptions, returnAxios, ...body }: HighSystemsRequestPutPreferences & {
        returnAxios?: false;
    }): Promise<HighSystemsResponsePutPreferences['results']>;
    putPreferences({ requestOptions, returnAxios, ...body }: HighSystemsRequestPutPreferences & {
        returnAxios: true;
    }): Promise<AxiosResponse<HighSystemsResponsePutPreferences>>;
}
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
        };
    };
}>;
export type HighSystemsRequest = {
    requestOptions?: AxiosRequestConfig;
    returnAxios?: boolean;
};
export type HighSystemsRequestGetTransaction = HighSystemsRequest & {};
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
export type HighSystemsRequestGetInstanceSettings = HighSystemsRequest & {};
export type HighSystemsRequestPutInstanceSettings = HighSystemsRequest & {};
export type HighSystemsRequestGetUsers = HighSystemsRequest & {};
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
export type HighSystemsRequestGetApplications = HighSystemsRequest & {};
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
    data: {}[];
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
export type HighSystemsRequestGetPreferences = HighSystemsRequest & {};
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
    results: {};
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
