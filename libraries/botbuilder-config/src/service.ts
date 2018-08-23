import * as crypto from "crypto";

/**
 * @module botbuilder-config
 */

export interface IBotConfiguration {
    name?: string
    , description?: string
    , secretKey?: string
    , services: IServiceBase[]
    , getService: (type: string, name?: string) => Service
    , encrypt: (value: string, secret: string) => string
    , decrypt: (value: string, secret: string) => string
    , decryptAll: () => IBotConfiguration
    , Endpoint: (name?: string) => IEndpointService 
    , AzureBotService: (name?: string) => IAzureBotService 
    , LUIS: (name?: string) => ILUISService 
    , QnAMaker: (name?: string) => IQnAMakerService
    , Dispatch: (name?: string) => IDispatchService
    , AzureTableStorage: (name?: string) => IAzureTableStorageService
    , AzureBlobStorage: (name?: string) => IAzureBlobStorageService
};

export interface BotConfigurationOptions {
    botFilePath?: string
    , secret?: string
};

export interface IServiceBase {
    type: string
    , name?: string
    , id?: string
};

export interface IService extends IServiceBase {
    add: (name: string, value: string) => boolean
    , remove: (name: string) => boolean
};

export interface IEndpointService extends IService {
    appId?: string
    , appPassword?: string
};

export interface IAzureBotService extends IService {
    tenantId?: string
    , resourceGroup?: string
    , subscriptionId?: string
    , endpoint?: string
    , appId?: string
    , appPassword?: string
};

export interface ILUISService extends IService {
    appId?: string
    , version?: string
    , authoringKey?: string
    , subscriptionKey?: string
    , endpointBasePath?: string
};

export interface IQnAMakerService extends IService {
    subscriptionKey?: string
    , endpointKey?: string
    , kbId?: string
    , hostname?: string
};

export interface IDispatchService extends ILUISService {
};

export interface IAzureTableStorageService extends IService {
    tableName: string
    , storageKey: string
    , storageName?: string
    , connectionString?: string
}


export interface IAzureBlobStorageService extends IService {
    container: string
    , storageKey: string
    , storageName?: string
    , connectionString?: string
}

export class Service implements IService {
    public type: string;
    public name: string;
    public id: string;
    constructor(props?: any) {
        for(let k in props) {
            if(props.hasOwnProperty(k)) {
                this[k] = props[k];
            }
        }
    }
    public add(name: string, value: string): boolean {
        try {
            this[name] = value;
            return true;
        }
        catch(e) {
            return false;
        }
    }
    public remove(name: string): boolean {
        try {
            this[name] = undefined;
            return true;
        }
        catch(e) {
            return false;
        }
    }
}
