import { WebRequest } from 'botbuilder';
import { parse } from 'qs';

/**
 * @module botbuildercommunity/adapter-twitter
 */

export function retrieveBody(req: WebRequest): Promise<any> {
    return new Promise((resolve: any, reject: any): any => {

        const type = req.headers['content-type'] || req.headers['Content-Type'];

        if (req.body) {
            try {
                resolve(req.body);
            }
            catch (err) {
                reject(err);
            }
        }
        else {
            let requestData = '';
            req.on('data', (chunk: string): void => {
                requestData += chunk;
            });
            req.on('end', (): void => {
                try {
                    if (type.includes('application/x-www-form-urlencoded')) {
                        req.body = parse(requestData);
                    }
                    else {
                        req.body = JSON.parse(requestData);
                    }

                    resolve(req.body);
                }
                catch (err) {
                    reject(err);
                }
            });
        }
    });
}
