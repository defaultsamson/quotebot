import { Interaction, MessageFlags } from "discord.js"

export async function searchQuote(interaction: Interaction, text: string) {
  if (interaction.isRepliable()) {
    return await interaction.reply({
      content: `Searching for quotes with: "${text}"`
    })
  }
}
