import {
  Interaction,
  Message,
  MessageFlags,
  BaseInteraction,
  Locale,
} from "discord.js"
import { readServerData, writeServerData } from "../server-data/read-write.js"

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

  const data = readServerData(incoming.guildId)

  data.quotes.push({
    internalID: data.nextInternalID,
    quote: text,
    authorID: incoming.member.user.id,
    date: Date.now(),
    upvoteIDs: [],
    downvoteIDs: [],
  })

  data.nextInternalID++

  // TODO upon adding a quote, we should add it to the listener for upvotes/downvotes

  writeServerData(data)

  // Success
  const reply =
    interaction?.locale === Locale.Swedish
      ? `Citat #${data.quotes.length} tillagt.`
      : `Quote #${data.quotes.length} added.`
  await message?.reply({ content: reply })
  await interaction?.reply({ content: reply, flags: MessageFlags.Ephemeral })
}
