import { BotAdapter, ConversationReference, TurnContext, Activity, ResourceResponse } from 'botbuilder';

/**
 * @module botbuildercommunity/adapter-alexa
 */

 export class AdapterAlexa extends BotAdapter {
     public async continueConversation(reference: Partial<ConversationReference>, logic: (revocableContext: TurnContext) => Promise<void>): Promise<void> {}
     public async deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {}
     public async sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
         return [];
     }
     public async updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
         throw new Error(`updateActivity is not implemented for ${AdapterAlexa.name}`)
     }
 }