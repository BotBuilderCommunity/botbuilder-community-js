import { IAzureBlobStorageService, Service } from "./service";

/**
 * @module botbuilder-config
 */

export class AzureBlobStorageService extends Service implements IAzureBlobStorageService {
    public container: string;
    public storageKey: string;
    public storageAccount: string;
    public connectionString: string;
    constructor() {
        super();
    }
}
