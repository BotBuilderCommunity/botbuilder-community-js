import { IAzureBotService, Service } from "./service";

/**
 * @module botbuilder-config
 */

export class AzureBotService extends Service implements IAzureBotService {
    public tenantId: string;
    public resourceGroup: string;
    public subscriptionId: string;
    public endpoint: string;
    public appId: string;
    public appPassword: string;
    constructor() {
        super();
    }
}
