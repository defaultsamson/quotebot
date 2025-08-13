import { BaseInteraction, Interaction, Message } from "discord.js"
import { getQuote } from "./get.js"

export async function getRandom(
  incoming: Interaction | Message
): Promise<void> {
  // TODO logic for getting a random quote
  await getQuote(incoming, ~~(Math.random() * 100))
}
