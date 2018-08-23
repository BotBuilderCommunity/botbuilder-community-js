import { IBotConfiguration, Service, IServiceBase, BotConfigurationOptions  } from "./service"
import { AzureBotService } from "./azurebotservice";
import { DispatchService } from "./dispatch";
import { EndpointService } from "./endpoint";
import { LUISService } from "./luis";
import { QnAMakerService } from "./qnamaker";
import {AzureTableStorageService } from "./azuretablestorage";
import { AzureBlobStorageService } from "./azureblobstorage";
import * as fs from "fs";
import * as shelljs from "shelljs";
import * as path from "path";
import * as crypto from "crypto";

/**
 * @module botbuilder-config
 */

/*
 * Encrypted properties sourced from Microsoft's MSBot CLI source code.
 * 
 */

export class BotConfig implements IBotConfiguration {
    private readonly _encryptedProperties = {
        endpoint: ["appPassword"],
        abs: ["appPassword"],
        luis: ["authoringKey", "subscriptionKey"],
        qna: ["subscriptionKey"],
        dispatch: ["authoringKey", "subscriptionKey"],
        ats: ["storageKey"]
    };
    private readonly _algorithm: string = "aes192";
    private readonly _base64: crypto.HexBase64BinaryEncoding = "hex";
    private readonly _ascii: crypto.Utf8AsciiBinaryEncoding = "utf8";
    public name: string;
    public description: string;
    public secretKey: string;
    public services: IServiceBase[];
    constructor(public options?: BotConfigurationOptions) {
        this.options = this.options || {};
        this.init();
    }
    private init(): BotConfig {
        const botFile = this.parseBotFile();
        for(let k in botFile) {
            if(botFile.hasOwnProperty(k)) {
                this[k] = botFile[k];
            }
        }
        return this;
    }
    private parseBotFile(): IBotConfiguration {
        let botFile = (this.options.botFilePath !== null) ? this.options.botFilePath : this.getBotFileInDirectory();
        return this.parse(botFile);
    }
    private getBotFileInDirectory(): string {
        let botFile: string;
        let dir = shelljs.pwd().toString();
        let files: string[] = fs.readdirSync(dir);
        files.forEach((f: string) => {
            if(f.endsWith(".bot")) {
                if(botFile !== null) {
                    throw new Error("Error: Multiple *.bot files in this project directory.");
                }
                botFile = path.join(dir, f);
            }
        });
        if(botFile === null) {
            throw new Error ("Error: No *.bot file found in the current working directory.");
        }
        return botFile;
    }
    private parse(botFile: string): IBotConfiguration {
        //Might need to account for other encodings.
        let f: string = fs.readFileSync(botFile, "utf-8");
        return <IBotConfiguration>JSON.parse(f);
    }
    private parseService(type: string, name?: string): Service {
        let services: IServiceBase[] = [];
        this.services.forEach((s: Service, idx: number) => {
            if(s.type === type && (name == null || s.name === name)) {
                services.push(s);
            }
        });
        if(services.length === 0) {
            if(name != null) {
                throw new Error(`Error: No services of type: ${type} and name: ${name} found in your bot file.`);
            }
            throw new Error(`Error: No services of type: ${type} found in your bot file.`);
        }
        return new Service(services[0]);
    }
    public getService(type: string, name?: string): Service {
        switch(type.toLowerCase()) {
            case "endpoint":
                return <EndpointService>this.parseService(type, name);
            case "abs":
                return <AzureBotService>this.parseService(type, name);
            case "luis":
                return <LUISService>this.parseService(type, name);
            case "qna":
                return <QnAMakerService>this.parseService(type, name);
            case "dispatch":
                return <DispatchService>this.parseService(type, name);
            case "ats":
                return <AzureTableStorageService>this.parseService(type, name);
            case "blob":
                return <AzureBlobStorageService>this.parseService(type, name);
            default:
                throw new Error(`Error: Invalid Bot Service [${type}] specified.`);
        }
    }
    public decryptAll(): IBotConfiguration {
        var self = this;
        self.services.forEach((s: Service, idx: number) => {
            let encryptedProps: string[] = self._encryptedProperties[s.type];
            for(let k in s) {
                if(s.hasOwnProperty(k) && encryptedProps.indexOf(k) != -1 && s[k] != "") {
                    s[k] = self.decrypt(s[k]);
                }
            }
        });
        return self;
    }
    public encrypt(value: string): string {
        try {
            const c = crypto.createCipher(this._algorithm, this.options.secret);
            let v = c.update(value, this._ascii, this._base64);
            v += c.final(this._base64);
            return v;
        }
        catch(e) {
            console.log(`Error: Encryption of ${value} failed.`);
        }
    }
    public decrypt(value: string): string {
        try {
            const d = crypto.createDecipher(this._algorithm, this.options.secret);
            let prop = d.update(value, this._base64, this._ascii);
            prop += d.final(this._ascii);
            return prop;
        }
        catch(e) {
            console.log(`Error: Decryption for ${value} failed.`);
        }
    }
    public Endpoint(name?: string): EndpointService {
        return <EndpointService>this.parseService("endpoint", name);
    }
    public AzureBotService(name?: string): AzureBotService {
        return <AzureBotService>this.parseService("abs", name);
    }
    public LUIS(name?: string): LUISService {
        return <LUISService>this.parseService("luis", name);
    }
    public QnAMaker(name?: string): QnAMakerService {
        return <QnAMakerService>this.parseService("qna", name);
    }
    public Dispatch(name?: string): DispatchService {
        return <DispatchService>this.parseService("dispatch", name);
    }
    public AzureTableStorage(name?: string): AzureTableStorageService {
        return <AzureTableStorageService>this.parseService("ats", name);
    }
    public AzureBlobStorage(name?: string): AzureBlobStorageService {
        return <AzureBlobStorageService>this.parseService("blob", name);
    }
}
