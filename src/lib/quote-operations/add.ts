import { Interaction, MessageFlags } from "discord.js"

export async function addQuote(interaction: Interaction, text: string) {
  if (interaction.isRepliable()) {
    // Logic to add a quote
    return await interaction.reply({
      content: `Quote added: "${text}"`
    })
  }
}
