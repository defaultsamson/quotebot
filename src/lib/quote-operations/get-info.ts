import {
  BaseInteraction,
  ChatInputCommandInteraction,
  Interaction,
  Locale,
  Message,
  MessageFlags,
} from "discord.js"
import { getRandom } from "./get-random.js"
import { readServerData } from "../server-data/read-write.js"
import { displayQuoteInChannel } from "./display-in-channel.js"
import dedent from "dedent"

export async function getInfo(
  incoming: ChatInputCommandInteraction,
  id: number
) {
  const data = readServerData(incoming.guildId)

  // Note: `id` starts at 1
  if (data.quotes.length >= id && id > 0) {
    // If the quote exists
    const quote = data.quotes[id - 1]
    await incoming.reply({
      content: dedent`Quote #${id}: ${quote.quote}
      Author: <@${quote.authorID}>
      Date: ${new Date(quote.date).toISOString()}
      Upvoted: ${quote.upvoteIDs.map((id) => `<@${id}>`).join(", ") || "None"}
      Downvoted: ${
        quote.downvoteIDs.map((id) => `<@${id}>`).join(", ") || "None"
      }
      `,
    })
  } else {
    // If the ID is out of range
    const reply =
      incoming.locale === Locale.Swedish
        ? `Citat med ID ${id} finns inte. Max ${data.quotes.length}`
        : `Quote with ID ${id} does not exist. Max ${data.quotes.length}`
    await incoming.reply({ content: reply, flags: MessageFlags.Ephemeral })
  }
}
