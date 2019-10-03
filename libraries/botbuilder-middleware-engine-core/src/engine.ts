/**
 * @module botbuildercommunity/middleware-engine-core
 */

export abstract class Engine {
    public client: any;
    public async abstract entities(input: any, config?: any): Promise<any>;
    public async abstract keyPhrases(input: any, config?: any): Promise<any>;
    public async abstract detectLanguage(input: any, config?: any): Promise<any>;
    public async abstract sentiment(input: any, config?: any): Promise<any>;
    public async abstract categories(input: any, config?: any): Promise<any>;
    public async abstract concepts(input: any, config?: any): Promise<any>;
    public async abstract emotion(input: any, config?: any): Promise<any>;
}
