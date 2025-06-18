import {Message} from 'node-telegram-bot-api';

/*
 * Extracts the user ID of the author of the message being genuinely replied to.
 *
 * In Telegram's API, when a new message is sent directly into a topic
 * (i.e., not as a reply to another user's message *within* that topic),
 * the `Message` object's `reply_to_message` field is still populated.
 * However, this `reply_to_message` points to a service message indicating
 * the topic's creation. Such service messages are identifiable by the presence
 * of the `forum_topic_created` field within `reply_to_message`.
 *
 * @param {Message} msg The incoming Telegram `Message` object to analyze.
 * @returns {number | undefined} The user ID (`number`) of the original sender of the message
 *                               being genuinely replied to or undefined if the message is not
 *                               a reply to another user's message.
 */
export function getReplyMessageFromId(msg: Message): number | undefined {
  const isReplyToTopic =
    msg.reply_to_message?.forum_topic_created?.name !== undefined;
  if (isReplyToTopic) return undefined;
  return msg.reply_to_message?.from?.id;
}
