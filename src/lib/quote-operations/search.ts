import {
  BaseInteraction,
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  Message,
} from "discord.js"
import fuzzysort from "fuzzysort"
import { readServerData } from "../server-data/read-write.js"
import { displayQuoteInChannel } from "./display-in-channel.js"

export async function searchQuote(
  incoming: ChatInputCommandInteraction | Message,
  text: string,
  count: number
) {
  if (!count || isNaN(count) || count < 1) count = 1 // Default to 1 if weird
  if (count > 10) count = 10 // Cap at 10

  /** @deprecated just here for legacy `!q` commands */
  const message = incoming instanceof Message ? incoming : null
  const interaction =
    incoming instanceof BaseInteraction && incoming.isRepliable()
      ? incoming
      : null

  // This could take longer than 3 seconds
  if (!interaction?.deferred) await interaction?.deferReply()
  async function reply(m: string) {
    await message?.reply({
      content: m,
      allowedMentions: { parse: [] }, // Prevent pings
    })
    await interaction?.editReply({
      content: m,
      allowedMentions: { parse: [] }, // Prevent pings
    })
  }
  async function replyEmbed(e: EmbedBuilder) {
    await message?.reply({
      embeds: [e],
      allowedMentions: { parse: [] }, // Prevent pings
    })
    await interaction?.editReply({
      embeds: [e],
      allowedMentions: { parse: [] }, // Prevent pings
    })
  }

  const data = readServerData(incoming.guildId)

  const results = fuzzysort.go(text, data.quotes, {
    key: "quote",
  })

  if (results.length === 0) {
    // No matches
    await reply("No matches found")
  } else if (count === 1) {
    // 1 Match (don't show % match)
    // Since there was only 1 match, show the quote with voting reactions
    await displayQuoteInChannel(incoming, data, results[0].obj, true)
  } else {
    // Display the results
    const embed = new EmbedBuilder().setTitle(
      `Showing ${Math.max(results.length, count)} matches`
    )

    embed.setColor(Colors.Blue)

    results
      .slice(0, count) // Limit the number of results displayed
      .forEach((r, i) => {
        // Adds each result as a field
        embed.addFields({
          name: `#${data.quotes.indexOf(r.obj) + 1}       (${Math.round(
            r.score * 100
          )}% Match)`,
          value: r.obj.quote,
        })
      })

    await replyEmbed(embed)
  }
}
