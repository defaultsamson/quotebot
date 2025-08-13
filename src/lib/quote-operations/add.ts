import {
  Interaction,
  Message,
  MessageFlags,
  BaseInteraction,
  Locale,
} from "discord.js"

export async function addQuote(
  incoming: Interaction | Message,
  text: string
): Promise<void> {
  /** @deprecated just here for legacy `!q` commands */
  const message = incoming instanceof Message ? incoming : null
  const interaction =
    incoming instanceof BaseInteraction && incoming.isRepliable()
      ? incoming
      : null

  if (!text || text.trim() === "") {
    // Empty quote
    const reply =
      interaction?.locale === Locale.Swedish
        ? "Vänligen ange en giltig offert."
        : "Please provide a valid quote."
    await message?.reply({ content: reply })
    await interaction?.reply({ content: reply, flags: MessageFlags.Ephemeral })
    return
  }

  // Success
  const reply =
    interaction?.locale === Locale.Swedish
      ? `Citat tillagt: ${text}`
      : `Quote added: ${text}`
  await message?.reply({ content: reply })
  await interaction?.reply({ content: reply, flags: MessageFlags.Ephemeral })
}
