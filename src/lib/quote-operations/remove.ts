import { Interaction, MessageFlags } from "discord.js";

export async function removeQuote(interaction: Interaction, id: number) {
  if (interaction.isRepliable()) {
    // Logic to remove a quote
    return await interaction.reply({
      content: `Quote with ID ${id} removed.`
    })
  }
}