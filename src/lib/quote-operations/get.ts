import {
  BaseInteraction,
  Interaction,
  Locale,
  Message,
  MessageFlags,
} from "discord.js"
import { getRandom } from "./get-random.js"
import { readServerData } from "../server-data/read-write.js"
import { displayQuoteInChannel } from "./display-in-channel.js"

export async function getQuote(incoming: Interaction | Message, id: number) {
  /** @deprecated just here for legacy `!q` commands */
  const message = incoming instanceof Message ? incoming : null
  const interaction =
    incoming instanceof BaseInteraction && incoming.isRepliable()
      ? incoming
      : null

  if (!id) {
    // If no ID is provided, get a random quote
    return await getRandom(incoming)
  }

  // It could potentially take more than 3 seconds to load this
  if (!interaction?.deferred) await interaction?.deferReply()

  const data = readServerData(incoming.guildId)

  // Note: `id` starts at 1
  if (data.quotes.length >= id && id > 0) {
    // If the quote exists, display it with emoji reactions
    displayQuoteInChannel(incoming, data, data.quotes[id - 1], true)
  } else {
    // If the ID is out of range
    const reply =
      interaction?.locale === Locale.Swedish
        ? `Citat med ID ${id} finns inte. Max ${data.quotes.length}`
        : `Quote with ID ${id} does not exist. Max ${data.quotes.length}`
    await message?.reply({ content: reply })
    await interaction?.editReply({ content: reply })
  }
}
