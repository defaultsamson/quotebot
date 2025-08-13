import { Interaction, MessageFlags } from "discord.js"
import { getRandom } from "./get-random.js"

export async function getQuote(interaction: Interaction, id: number) {
  if (!id) {
    // If no ID is provided, get a random quote
    return await getRandom(interaction)
  }

  if (interaction.isRepliable()) {
    // Logic to get a quote by ID
    return await interaction.reply({
      content: `Quote with ID ${id} retrieved.`
    })
  }
}
