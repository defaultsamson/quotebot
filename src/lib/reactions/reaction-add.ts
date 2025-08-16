import {
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from "discord.js"
import { Emoji } from "../../types/emojis.js"
import { readServerData, writeServerData } from "../server-data/read-write.js"
import { REACTION_CACHE } from "./reaction-cache.js"

export async function reactionAdd(
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser
) {
  const mess = reaction.message
  if (user.bot) return // Ignore bot reactions
  if (!mess.guild) return // Ignore DMs

  const quoteUniqueId = REACTION_CACHE.get(mess.id)
  if (
    isNaN(quoteUniqueId) ||
    quoteUniqueId === null ||
    typeof quoteUniqueId !== "number"
  )
    return

  // Find the quote object
  const data = readServerData(mess.guildId)
  if (!data) return
  const quote = data.quotes.find((q) => q.internalID === quoteUniqueId)
  if (!quote) return // If no quote object can be found, return

  // Handle the reaction (e.g. add it to the quote)
  switch (reaction.emoji.toString()) {
    case data.customPlus:
    case Emoji.Plus:
      {
        // Add their upvote
        if (!quote.upvoteIDs.includes(user.id)) {
          quote.upvoteIDs.push(user.id)
        }
        // Remove any downvotes
        quote.downvoteIDs = quote.downvoteIDs.filter((id) => id !== user.id)
        writeServerData(data)

        // On the server-side, remove any non-upvote reactions
        const nonPlusReactions = mess.reactions.cache.filter(
          (r) => r.emoji.toString() !== (data.customPlus ?? Emoji.Plus)
        )
        if (nonPlusReactions.size > 0) {
          for (const reaction of nonPlusReactions.values()) {
            await reaction.users.remove(user.id)
          }
        }
      }
      break
    case data.customMinus:
    case Emoji.Minus:
      {
        // Add their downvote
        if (!quote.downvoteIDs.includes(user.id)) {
          quote.downvoteIDs.push(user.id)
        }
        // Remove any upvotes
        quote.upvoteIDs = quote.upvoteIDs.filter((id) => id !== user.id)
        writeServerData(data)

        // On the server-side, remove any non-downvote reactions
        const nonMinusReactions = mess.reactions.cache.filter(
          (r) => r.emoji.toString() !== (data.customMinus ?? Emoji.Minus)
        )
        if (nonMinusReactions.size > 0) {
          for (const reaction of nonMinusReactions.values()) {
            await reaction.users.remove(user.id)
          }
        }
      }
      break
  }
}
