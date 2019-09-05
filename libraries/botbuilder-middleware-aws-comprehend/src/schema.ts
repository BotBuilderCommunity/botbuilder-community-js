import { Comprehend } from 'aws-sdk';

/**
 * @module botbuildercommunity/middleware-aws-comprehend
 */

export interface AWSComprehendOptions extends Comprehend.ClientConfiguration {
    lang?: string;
}
