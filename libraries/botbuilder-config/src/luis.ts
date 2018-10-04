import { ILUISService, Service } from "./service";
import { LuisRecognizerSettings } from "botbuilder-ai";

/**
 * @module botbuilder-config
 */

export class LUISService extends Service implements ILUISService {
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
