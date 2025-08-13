import { Interaction, MessageFlags } from "discord.js"

export async function getRandom(interaction: Interaction) {
  if (interaction.isRepliable()) {
    // Logic to get a random quote
    return await interaction.reply({
      content: `Get a random quote`
    })
  }
}
