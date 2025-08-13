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
    .setName("admin")
    .setDescription("Admin commands")
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

    const subcommand = interaction.options.getSubcommand()
    switch (subcommand) {
      case "add": {
        // Check if user is an admin
        if (!data.adminIDs.includes(interaction.user.id)) {
          interaction.reply({
            content:
              "You do not have permission (Quotebot Admin) to use this command.",
            flags: MessageFlags.Ephemeral,
          })
          return
        }

        const userID = interaction.options.getUser("user").id
        if (!data.adminIDs.includes(userID)) {
          data.adminIDs.push(userID)
          writeServerData(data)

          await interaction.reply({
            content: "User added as admin.",
            flags: MessageFlags.Ephemeral,
          })
        } else {
          await interaction.reply({
            content: "User is already an admin.",
            flags: MessageFlags.Ephemeral,
          })
        }
        return
      }
      case "remove": {
        // Check if user is an admin
        if (!data.adminIDs.includes(interaction.user.id)) {
          interaction.reply({
            content:
              "You do not have permission (Quotebot Admin) to use this command.",
            flags: MessageFlags.Ephemeral,
          })
          return
        }

        const userID = interaction.options.getUser("user").id

        if (data.adminIDs.includes(userID)) {
          data.adminIDs.splice(data.adminIDs.indexOf(userID), 1)
          writeServerData(data)

          await interaction.reply({
            content: "User removed from admin.",
            flags: MessageFlags.Ephemeral,
          })
        } else {
          await interaction.reply({
            content: "User is not an admin.",
            flags: MessageFlags.Ephemeral,
          })
        }
        return
      }
      case "claim": {
        // The role can only be claimed if there are no other admins
        if (data.adminIDs.length > 0) {
          await interaction.reply({
            content: "There are already admins in this server.",
            flags: MessageFlags.Ephemeral,
          })
        } else {
          data.adminIDs.push(interaction.user.id)
          writeServerData(data)

          await interaction.reply({
            content: "You have claimed the admin role.",
            flags: MessageFlags.Ephemeral,
          })
        }
        return
      }
    }
  },
} as Command
