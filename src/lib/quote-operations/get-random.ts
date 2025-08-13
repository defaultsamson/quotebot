import { Interaction, Message } from "discord.js"
import { getQuote } from "./get.js"
import { readServerData } from "../server-data/read-write.js"

export async function getRandom(
  incoming: Interaction | Message
): Promise<void> {
  const data = readServerData(incoming.guildId)
  // ID is +1 because IDs start at 1, not 0
  const randomID = Math.floor(Math.random() * data.quotes.length) + 1
  await getQuote(incoming, randomID)
}
