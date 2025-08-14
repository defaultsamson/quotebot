import {
  Interaction,
  Message,
  MessageFlags,
  BaseInteraction,
  Locale,
} from "discord.js"
import { readServerData, writeServerData } from "../server-data/read-write.js"
import { Quote } from "../../types/quote.js"
import { displayQuoteInChannel } from "./display-in-channel.js"

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

  // This could take longer than 3 seconds
  if (!interaction?.deferred) await interaction?.deferReply()
  async function reply(m: string) {
    await message?.reply({ content: m })
    await interaction?.editReply({ content: m })
  }

  if (!text || text.trim() === "") {
    // Empty quote
    return await reply(
      interaction?.locale === Locale.Swedish
        ? "Vänligen ange en giltig offert."
        : "Please provide a valid quote."
    )
  }

  const data = readServerData(incoming.guildId)

  const newQuote: Quote = {
    internalID: data.nextInternalID,
    quote: text,
    authorID: incoming.member.user.id,
    date: Date.now(),
    upvoteIDs: [],
    downvoteIDs: [],
  }

  data.quotes.push(newQuote)
  data.nextInternalID++
  writeServerData(data)

  displayQuoteInChannel(incoming, data, newQuote, false)

  // Success
  await reply(
    interaction?.locale === Locale.Swedish
      ? `Citat #${data.quotes.length} tillagt.`
      : `Quote #${data.quotes.length} added.`
  )
}
