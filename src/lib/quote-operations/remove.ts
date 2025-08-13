import {
  BaseInteraction,
  Interaction,
  Locale,
  Message,
  MessageFlags,
} from "discord.js"

export async function removeQuote(incoming: Interaction | Message, id: number) {
  /** @deprecated just here for legacy `!q` commands */
  const message = incoming instanceof Message ? incoming : null
  const interaction =
    incoming instanceof BaseInteraction && incoming.isRepliable()
      ? incoming
      : null

  // Success
  const reply =
    interaction?.locale === Locale.Swedish
      ? `Citat med ID ${id} borttaget`
      : `Quote with ID ${id} removed.`
  await message?.reply({ content: reply })
  await interaction?.reply({ content: reply, flags: MessageFlags.Ephemeral })
}
