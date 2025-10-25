import {
  BaseInteraction,
  EmbedBuilder,
  Interaction,
  Locale,
  Message,
} from "discord.js"
import { readServerData } from "../server-data/read-write.js"
import { Emoji } from "../../types/emojis.js"

export async function getTopQuotes(
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
  async function reply(m: string) {
    await message?.reply({ content: m })
    await interaction?.editReply({ content: m })
  }
  async function replyEmbed(e: EmbedBuilder) {
    await message?.reply({ embeds: [e] })
    await interaction?.editReply({ embeds: [e] })
  }

  const data = readServerData(incoming.guildId)

  const topQuotes = data.quotes
    // Remove any quotes with 0 upvotes
    .filter((quote) => quote.upvoteIDs.length > 0)
    // Sort by upvotes descending
    .sort((a, b) => {
      // If different upvote counts, sort by that
      if (b.upvoteIDs.length !== a.upvoteIDs.length) {
        return b.upvoteIDs.length - a.upvoteIDs.length
      } else {
        // If same upvote counts, sort by downvotes ascending
        return a.downvoteIDs.length - b.downvoteIDs.length
      }
    })
    .slice(0, count)

  if (topQuotes.length === 0) {
    await reply(
      interaction?.locale === Locale.Swedish
        ? "Inga topp citat hittades."
        : "No top quotes found."
    )
    return
  }

  const embed = new EmbedBuilder().setTitle(`Top ${topQuotes.length} Quotes`)
  //  .setDescription(`Here are the top ${topQuotes.length} quotes by upvotes:`)

  for (const quote of topQuotes) {
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
