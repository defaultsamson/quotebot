import { BaseInteraction, Interaction, Locale, Message } from "discord.js"
import { readServerData } from "../server-data/read-write.js"
import dedent from "dedent"

export async function getInfo(incoming: Interaction | Message, id: number) {
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

  // Note: `id` starts at 1
  if (data.quotes.length >= id && id > 0) {
    // If the quote exists
    const quote = data.quotes[id - 1]

    let r: string
    if (interaction?.locale === Locale.Swedish) {
      r = dedent`Citat #${id}: ${quote.quote}
      Författare: <@${quote.authorID}>
      Datum: ${new Date(quote.date).toISOString()}
      Upp-röster: ${
        quote.upvoteIDs.map((id) => `<@${id}>`).join(", ") || "Ingen"
      }
      Ned-röster: ${
        quote.downvoteIDs.map((id) => `<@${id}>`).join(", ") || "Ingen"
      }
      `
    } else {
      r = dedent`Quote #${id}: ${quote.quote}
      Author: <@${quote.authorID}>
      Date: ${new Date(quote.date).toISOString()}
      Upvoted: ${quote.upvoteIDs.map((id) => `<@${id}>`).join(", ") || "None"}
      Downvoted: ${
        quote.downvoteIDs.map((id) => `<@${id}>`).join(", ") || "None"
      }
      `
    }

    await reply(r)
  } else {
    // If the ID is out of range
    const r =
      interaction?.locale === Locale.Swedish
        ? `Citat med ID ${id} finns inte. Max ${data.quotes.length}`
        : `Quote with ID ${id} does not exist. Max ${data.quotes.length}`
    await reply(r)
  }
}
