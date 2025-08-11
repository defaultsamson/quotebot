import { BaseInteraction, ChatInputCommandInteraction, CommandInteraction, Interaction, SlashCommandBuilder } from "discord.js";

export interface Command {
  data: SlashCommandBuilder
  execute(interaction: CommandInteraction): Promise<void>
}
