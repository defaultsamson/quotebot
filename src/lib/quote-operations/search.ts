import {
  BaseInteraction,
  ChatInputCommandInteraction,
  Message,
} from "discord.js"
import fuzzysort from "fuzzysort"
import { readServerData } from "../server-data/read-write.js"

export async function searchQuote(
  incoming: ChatInputCommandInteraction | Message,
  text: string,
  count: number
) {
  if (!count || isNaN(count) || count < 1) count = 1 // Default to 1 if weird

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
    limit: count,
  })

  if (results.length === 0) {
    // No matches
    await reply("No matches found")
  } else if (results.length === 1) {
    // 1 Match (don't show % match)
    const resultString = results.map(
      (o) => `#${data.quotes.indexOf(o.obj) + 1}: ${o.obj.quote}`
    )[0]
    await reply(resultString)
  } else {
    // Display the results
    const resultString = results
      .map(
        (o) =>
          `(${Math.floor(o.score * 100)}%) #${
            data.quotes.indexOf(o.obj) + 1
          }: ${o.obj.quote}`
      )
      .join("\n")

      await reply(`Found ${results.length} quotes:\n${resultString}`)
  }
}
