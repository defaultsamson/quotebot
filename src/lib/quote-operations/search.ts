import {
  BaseInteraction,
  ChatInputCommandInteraction,
  Interaction,
  Message,
  MessageFlags,
} from "discord.js"
import fuzzysort from "fuzzysort"
import { readServerData } from "../server-data/read-write.js"
import dedent from "dedent"

export async function searchQuote(
  incoming: ChatInputCommandInteraction | Message,
  text: string
) {
  /** @deprecated just here for legacy `!q` commands */
  const message = incoming instanceof Message ? incoming : null
  const interaction =
    incoming instanceof BaseInteraction && incoming.isRepliable()
      ? incoming
      : null

  // This could take longer than 3 seconds
  if (!interaction?.deferred) await interaction?.deferReply()

  const data = readServerData(incoming.guildId)

  const results = fuzzysort.go(text, data.quotes, {
    key: "quote",
    limit: 3,
  })

  if (results.length === 0) {
    await message?.reply({ content: "No matches found." })
    await interaction?.editReply({
      content: "No matches found.",
    })
    return
  }

  // Display the results
  const resultString = results
    .map(
      (o) =>
        `(${Math.floor(o.score * 100)}%) #${data.quotes.indexOf(o.obj) + 1}: ${
          o.obj.quote
        }`
    )
    .join("\n")
  await message?.reply({
    content: dedent`Found ${results.length} quote${results.length !== 1 && "s"}:
    ${resultString}
  `,
  })
  await interaction?.editReply({
    content: dedent`Found ${results.length} quote${results.length !== 1 && "s"}:
      ${resultString}
    `,
  })
}
