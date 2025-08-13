import { BaseInteraction, Interaction, Message } from "discord.js"
import ServerData from "../../types/server-data.js"
import { Quote } from "../../types/quote.js"
import { Emoji } from "../../types/emojis.js"
import { EMOJI_CACHE } from "../emoji-cache.js"

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

  // Display the quote with internalID `quoteInternalID`
  // Find it in `data`
  // if channelID is provided, display the quote there.
  // if not, use the ServerData channelID

  // Fetch the channel and send the quote
  const guild = incoming.guild
  if (!guild) {
    await message?.reply({ content: "InternalError: Server not found." })
    await interaction?.reply({
      content: "InternalError: Server not found.",
      ephemeral: true,
    })
    return
  }

  // Get the channel with a provided ID, or with ServerData channelID
  const targetChannel = reply ? incoming.channelId : data.channelID
  const channel = guild.channels.cache.get(targetChannel)
  if (!channel || !channel.isTextBased()) {
    await message?.reply({
      content: `InternalError: Channel ${targetChannel} not found.`,
    })
    await interaction?.reply({
      content: `InternalError: Channel ${targetChannel} not found.`,
      ephemeral: true,
    })
    return
  }

  function getQuoteString(): string {
    return `#${data.quotes.indexOf(quote) + 1}: ${quote.quote}`
  }

  // Send the quote to the channel
  await channel
    .send({ content: getQuoteString() })
    .then(async (sentMessage) => {
      EMOJI_CACHE.set(sentMessage.id, quote.internalID)

      // Add reactions for voting
      await sentMessage.react(Emoji.Plus)
      await sentMessage.react(Emoji.Minus)
      await new Promise((resolve) => setTimeout(resolve, VOTING_DURATION)).then(
        () => {
          sentMessage.reactions.removeAll()
          EMOJI_CACHE.delete(sentMessage.id)
        }
      )
    })
}
