import {
  BaseInteraction,
  EmbedBuilder,
  Interaction,
  Locale,
  Message,
} from "discord.js"
import { readServerData } from "../server-data/read-write.js"
import { Emoji } from "../../types/emojis.js"

export async function getBottomQuotes(
  incoming: Interaction | Message,
  count?: number
) {
  if (!count || isNaN(count) || count < 1) count = 6 // Default to 6 if weird
  if (count > 20) count = 20 // Cap at 20

  /** @deprecated just here for legacy `!q` commands */
  const message = incoming instanceof Message ? incoming : null
  const interaction =
    incoming instanceof BaseInteraction && incoming.isRepliable()
      ? incoming
      : null

  // This could take longer than 3 seconds
  if (!interaction?.deferred) await interaction?.deferReply()
  async function replyEmbed(e: EmbedBuilder) {
    await message?.reply({ embeds: [e] })
    await interaction?.editReply({ embeds: [e] })
  }
  async function reply(m: string) {
    await message?.reply({ content: m })
    await interaction?.editReply({ content: m })
  }

  const data = readServerData(incoming.guildId)

  const bottomQuotes = data.quotes
    // Remove any quotes with 0 downvotes
    .filter((quote) => quote.downvoteIDs.length > 0)
    // Sort by downvotes descending
    .sort((a, b) => {
      // If different downvote counts, sort by that
      if (b.downvoteIDs.length !== a.downvoteIDs.length) {
        return b.downvoteIDs.length - a.downvoteIDs.length
      } else {
        // If same upvote counts, sort by upvotes ascending
        return a.upvoteIDs.length - b.upvoteIDs.length
      }
    })
    .slice(0, count)

  if (bottomQuotes.length === 0) {
    await reply(
      interaction?.locale === Locale.Swedish
        ? "Inga botten citat hittades."
        : "No bottom quotes found."
    )
    return
  }

  const embed = new EmbedBuilder().setTitle(
    `Bottom ${bottomQuotes.length} Quotes`
  )
  //  .setDescription(`Here are the top ${topQuotes.length} quotes by upvotes:`)

  for (const quote of bottomQuotes) {
    // Finds the original # of the quote in the server data
    const index = data.quotes.indexOf(quote)
    embed.addFields({
      name: `#${index + 1}   ${quote.upvoteIDs.length}   ${
        data.customPlus ?? Emoji.Plus
      }   ${quote.downvoteIDs.length}   ${data.customMinus ?? Emoji.Minus}`,
      value: `${quote.quote}`,
    })
  }

  await replyEmbed(embed)
}
