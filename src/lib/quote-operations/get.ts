import {
  BaseInteraction,
  Interaction,
  Locale,
  Message,
  MessageFlags,
} from "discord.js"
import { getRandom } from "./get-random.js"

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

  // Success
  const reply =
    interaction?.locale === Locale.Swedish
      ? `Citat med ID ${id} hämtat`
      : `Quote with ID ${id} retrieved.`
  await message?.reply({ content: reply })
  await interaction?.reply({ content: reply, flags: MessageFlags.Ephemeral })
}
