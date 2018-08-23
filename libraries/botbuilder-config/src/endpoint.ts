import { IEndpointService, Service } from "./service";

/**
 * @module botbuilder-config
 */

export class EndpointService extends Service implements IEndpointService {
    public appId: string;
    public appPassword: string;
    constructor() {
        super();
    }
}
