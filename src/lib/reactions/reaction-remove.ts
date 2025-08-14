import {
  MessageReaction,
  PartialMessageReaction,
  User,
  PartialUser,
} from "discord.js"
import { Emoji } from "../../types/emojis.js"
import { readServerData, writeServerData } from "../server-data/read-write.js"
import { REACTION_CACHE } from "./reaction-cache.js"

export async function reactionRemove(
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
    case Emoji.Plus:
      {
        // Remove their upvote
        quote.upvoteIDs = quote.upvoteIDs.filter((id) => id !== user.id)
        writeServerData(data)
      }
      break
    case Emoji.Minus:
      {
        // Remove their downvote
        quote.downvoteIDs = quote.downvoteIDs.filter((id) => id !== user.id)
        writeServerData(data)
      }
      break
  }
}
