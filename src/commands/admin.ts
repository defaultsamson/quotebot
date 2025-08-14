import {
  ChannelType,
  ChatInputCommandInteraction,
  GuildMember,
  Locale,
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
    .setName("admin")
    .setDescription("Admin commands")
    .addSubcommandGroup((group) =>
      group
        .setName("users")
        .setDescription("Manage admin users")
        .addSubcommand((sub) =>
          sub
            .setName("add")
            .setDescription("Add a user as an admin")
            .addUserOption((option) =>
              option
                .setName("user")
                .setDescription("The user to add as an admin")
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName("remove")
            .setDescription("Remove a user from the admin list")
            .addUserOption((option) =>
              option
                .setName("user")
                .setDescription("The user to remove from the admin list")
                .setRequired(true)
            )
        )
        .addSubcommand((sub) =>
          sub.setName("claim").setDescription("Claim the admin role")
        )
    )
    .addSubcommandGroup((group) =>
      group
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
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction) return
    if (!(interaction.member instanceof GuildMember)) {
      interaction.reply({
        content:
          interaction?.locale === Locale.Swedish
            ? "Detta kommando kan endast användas i en server."
            : "This command can only be used in a server.",
        flags: MessageFlags.Ephemeral,
      })
      return
    }

    // This may take longer than 3 seconds (do an ephemeral defer)
    if (!interaction.deferred)
      await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    const data = readServerData(interaction.guildId)

    const subcommandGroup = interaction.options.getSubcommandGroup()
    const subcommand = interaction.options.getSubcommand()

    // If there are admins...
    if (data.adminIDs.length > 0) {
      // Check if user is an admin
      if (!data.adminIDs.includes(interaction.user.id)) {
        interaction.editReply({
          content:
            "You do not have permission (Quotebot Admin) to use this command.",
        })
        // If not, then return
        return
      }
      // If there are no admins, and the user is not running the claim command, prompt it
    } else if (subcommand !== "claim") {
      interaction.editReply({
        content:
          "This server has no admins. Run the command `/admin users claim` to become the first admin.",
      })
      return
    }

    if (subcommandGroup === "channel") {
      switch (subcommand) {
        case "remove": {
          // Clear the channel ID
          data.channelID = null
          writeServerData(data)

          await interaction.editReply({
            content: "Quote channel removed from bot.",
          })
          return
        }
        case "set": {
          // Set the channel ID
          const channel = interaction.options.getChannel("channel")
          if (!channel || channel.type !== ChannelType.GuildText) {
            interaction.editReply({
              content: "Please provide a valid text channel.",
            })
            return
          }

          const data = readServerData(interaction.guildId)
          data.channelID = channel.id
          writeServerData(data)

          await interaction.editReply({
            content: `Quote channel set to ${channel}.`,
          })
          return
        }
      }
    }

    if (subcommandGroup === "users") {
      switch (subcommand) {
        case "add": {
          const userID = interaction.options.getUser("user").id
          if (!data.adminIDs.includes(userID)) {
            data.adminIDs.push(userID)
            writeServerData(data)

            await interaction.editReply({
              content: "User added as admin.",
            })
          } else {
            await interaction.editReply({
              content: "User is already an admin.",
            })
          }
          return
        }
        case "remove": {
          const userID = interaction.options.getUser("user").id

          if (data.adminIDs.includes(userID)) {
            data.adminIDs.splice(data.adminIDs.indexOf(userID), 1)
            writeServerData(data)

            await interaction.editReply({
              content: "User removed from admin.",
            })
          } else {
            await interaction.editReply({
              content: "User is not an admin.",
            })
          }
          return
        }
        case "claim": {
          // The role can only be claimed if there are no other admins
          if (data.adminIDs.length > 0) {
            await interaction.editReply({
              content: "There are already admins in this server.",
            })
          } else {
            data.adminIDs.push(interaction.user.id)
            writeServerData(data)

            await interaction.editReply({
              content: "You have claimed the admin role.",
            })
          }
          return
        }
      }
    }
  },
} as Command
