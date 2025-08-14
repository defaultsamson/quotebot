import { BaseInteraction, Interaction, Message } from "discord.js"
import ServerData from "../../types/server-data.js"
import { Quote } from "../../types/quote.js"
import { Emoji } from "../../types/emojis.js"
import { REACTION_CACHE } from "../reactions/reaction-cache.js"

// 5mins
const VOTING_DURATION = 1000 * 5 * 60

/**
 * This function is the backbone is displaying quotes as messages in Discord.
 * It handles pasting a quote into a specific channel, and manages the
 * emoji reactions so that people can vote on it.
 */
export async function displayQuoteInChannel(
  incoming: Interaction | Message,
  data: ServerData,
  quote: Quote,
  /** Whether to reply, or send the quote into the main quotes channel */
  reply: boolean
) {
  /** @deprecated just here for legacy `!q` commands */
  const message = incoming instanceof Message ? incoming : null
  const interaction =
    incoming instanceof BaseInteraction && incoming.isRepliable()
      ? incoming
      : null

  // This could take longer than 3 seconds
  if (!interaction?.deferred) await interaction?.deferReply()
  async function sendReply(m: string) {
    await message?.reply({ content: m })
    await interaction?.editReply({ content: m })
  }

  // Display the quote with internalID `quoteInternalID`
  // Find it in `data`
  // if channelID is provided, display the quote there.
  // if not, use the ServerData channelID

  // Fetch the channel and send the quote
  const guild = incoming.guild
  if (!guild) return await sendReply("InternalError: Server not found.")

  // Get the channel with a provided ID, or with ServerData channelID
  const targetChannel = reply ? incoming.channelId : data.channelID
  const channel = guild.channels.cache.get(targetChannel)
  if (!channel || !channel.isTextBased()) {
    return await sendReply(`InternalError: Channel ${targetChannel} not found.`)
  }

  /**
   * Adds emoji to the `sentMessage` and manages the reaction cache,
   * which allows users to upvote and downvote quotes.
   */
  async function addEmojiToMessage(sentMessage: Message) {
    REACTION_CACHE.set(sentMessage.id, quote.internalID)

    // Add reactions for voting
    await sentMessage.react(Emoji.Plus)
    await sentMessage.react(Emoji.Minus)

    // Automatically clear the emojis after the VOTING_DURATION
    await new Promise((resolve) => setTimeout(resolve, VOTING_DURATION)).then(
      () => {
        sentMessage.reactions.removeAll()
        REACTION_CACHE.delete(sentMessage.id)
      }
    )
  }

  const response = {
    content: `#${data.quotes.indexOf(quote) + 1}: ${quote.quote}`,
  }

  if (reply) {
    // Reply directly to the user
    await message?.reply(response).then(addEmojiToMessage)
    await interaction?.editReply(response).then(addEmojiToMessage)
  } else {
    // Send the quote to the channel
    await channel.send(response).then(addEmojiToMessage)
  }
}
