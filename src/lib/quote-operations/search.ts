import {
  BaseInteraction,
  ChatInputCommandInteraction,
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
    await message?.reply({ content: m })
    await interaction?.editReply({ content: m })
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
    const resultString = results
      .slice(0, count) // Limit the number of results displayed
      .map(
        (o) =>
          `(${Math.round(o.score * 100)}%) #${
            data.quotes.indexOf(o.obj) + 1
          }: ${o.obj.quote}`
      )
      .join("\n")

    // Discord has a max of 2000, but we wanna show even less so there's not spam
    const MAX = 1900
    const header = `Found ${results.length} quotes:\n`
    const space = MAX - header.length
    const body =
      resultString.length > space
        ? // Shorten the response if too long
          resultString.slice(0, space - 3) + "..."
        : resultString

    await reply(body)
  }
}
