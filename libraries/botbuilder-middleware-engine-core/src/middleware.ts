import { Engine } from './engine';

/**
 * @module botbuildercommunity/middleware-engine-core
 */

export abstract class TextAnalysisMiddleware {
    public abstract engine: Engine;
    public abstract serviceKey: string;
    public abstract endpoint: string;
    public abstract options: any;
    protected config: any = { };
    public set(key: string, value: any): void {
        this.config[key] = value;
    }
}
