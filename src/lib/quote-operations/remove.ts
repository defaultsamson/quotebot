import {
  BaseInteraction,
  Interaction,
  Locale,
  Message,
  MessageFlags,
} from "discord.js"
import { readServerData, writeServerData } from "../server-data/read-write.js"

export async function removeQuote(incoming: Interaction | Message, id: number) {
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

    // Adds the 1 spliced quote to the removed array
    const removedQuote = data.quotes.splice(id - 1, 1)[0]
    removedQuote.removedDate = Date.now() // Set the removal date
    removedQuote.removedBy = incoming.member.user.id // Set the user who removed it
    data.removed.push(removedQuote) // Add to removed list
    writeServerData(data)

    // Success
    await reply(
      interaction?.locale === Locale.Swedish
        ? `Citat med ID ${id} borttaget`
        : `Quote with ID ${id} removed.`
    )
  } else {
    // If the ID is out of range
    await reply(
      interaction?.locale === Locale.Swedish
        ? `Citat med ID ${id} finns inte. Max ${data.quotes.length}`
        : `Quote with ID ${id} does not exist. Max ${data.quotes.length}`
    )
  }
}
