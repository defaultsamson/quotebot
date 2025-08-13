import {
  ChannelType,
  ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js"
import { Command } from "../types/command.js"
import {
  readServerData,
  writeServerData,
} from "../lib/server-data/read-write.js"

export default {
  data: new SlashCommandBuilder()
    .setName("channel")
    .setDescription("Sets the channel for quotes")
    .addSubcommand((sub) =>
      sub
        .setName("set")
        .setDescription("Set the channel for quotes")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel to set for quotes")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Remove the channel for quotes from the bot")
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction) return
    if (!(interaction.member instanceof GuildMember)) {
      interaction.reply({
        content: "This command can only be used in a server.",
        flags: MessageFlags.Ephemeral,
      })
      return
    }

    const data = readServerData(interaction.guildId)

    // Check if user is an admin
    if (!data.adminIDs.includes(interaction.user.id)) {
      interaction.reply({
        content:
          "You do not have permission (Quotebot Admin) to use this command.",
        flags: MessageFlags.Ephemeral,
      })
      return
    }

    const subcommand = interaction.options.getSubcommand()
    switch (subcommand) {
      case "remove": {
        // Clear the channel ID
        data.channelID = null
        writeServerData(data)

        await interaction.reply({
          content: "Quote channel removed from bot.",
          flags: MessageFlags.Ephemeral,
        })
        return
      }
      case "set": {
        // Set the channel ID
        const channel = interaction.options.getChannel("channel")
        if (!channel || channel.type !== ChannelType.GuildText) {
          interaction.reply({
            content: "Please provide a valid text channel.",
            flags: MessageFlags.Ephemeral,
          })
          return
        }

        const data = readServerData(interaction.guildId)
        data.channelID = channel.id
        writeServerData(data)

        await interaction.reply({
          content: `Quote channel set to ${channel}.`,
          flags: MessageFlags.Ephemeral,
        })
        return
      }
    }
  },
} as Command
