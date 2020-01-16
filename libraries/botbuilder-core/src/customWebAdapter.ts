
import { BotAdapter, WebRequest } from 'botbuilder';
import { parse as parseQueryString } from 'qs';

export abstract class CustomWebAdapter extends BotAdapter {

    /**
     * Retrieve body from WebRequest
     * Works with Express & Restify
     * @protected
     * @param req incoming web request
     */
    protected retrieveBody(req: WebRequest): Promise<any> {

        const contentType = req.headers['content-type'] || req.headers['Content-Type'];

        return new Promise((resolve: any, reject: any): void => {

            if (req.body) {
                try {
                    resolve(req.body);
                } catch (err) {
                    reject(err);
                }
            } else {
                let requestData = '';
                req.on('data', (chunk: string): void => {
                    requestData += chunk;
                });
                req.on('end', (): void => {
                    try {
                        if (contentType.includes('application/x-www-form-urlencoded')) {
                            req.body = parseQueryString(requestData);
                        } else {
                            req.body = JSON.parse(requestData);
                        }

                        resolve(req.body);
                    } catch (err) {
                        reject(err);
                    }
                });
            }
        });
    }

    /**
     * Copied from `botFrameworkAdapter.ts` to support { type: 'delay' } activity.
     * @param timeout timeout in miliseconds, defaults to 1000
     */
    protected delay(timeout: number): Promise<void> {
        timeout = (typeof timeout === 'number' ? timeout : 1000);

        return new Promise((resolve): void => {
            setTimeout(resolve, timeout);
        });
    }

}