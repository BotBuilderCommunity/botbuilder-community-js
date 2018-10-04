import { IDispatchService, Service } from "./service";
import { LuisRecognizerSettings } from "botbuilder-ai";

/**
 * @module botbuilder-config
 */

export class DispatchService extends Service implements IDispatchService {
    public appId: string;
    public version: string;
    public authoringKey: string;
    public subscriptionKey: string;
    public endpointBasePath: string;
    constructor() {
        super();
    }
    public getOptions(): LuisRecognizerSettings {
        return null;
    }
}
