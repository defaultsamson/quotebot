import {
  GuildMember,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Locale,
  MessageFlags,
} from "discord.js"
import { Command } from "../types/command.js"
import {
  readServerData,
  writeServerData,
} from "../lib/server-data/read-write.js"

export default {
  data: new SlashCommandBuilder()
    .setName("author")
    .setDescription("Set or clear the author of a quote")
    .setNameLocalizations({
      [Locale.Swedish]: "auteur",
    })
    .setDescriptionLocalizations({
      [Locale.Swedish]: "Ställ in eller rensa författaren till ett citat",
    })
    .addSubcommand((sub) =>
      sub
        .setName("set")
        .setDescription("Set the author of a quote")
        .setNameLocalizations({
          [Locale.Swedish]: "sätt",
        })
        .setDescriptionLocalizations({
          [Locale.Swedish]: "Ställ in författaren till ett citat",
        })
        .addIntegerOption((option) =>
          option
            .setName("id")
            .setDescription("The quote ID")
            .setDescriptionLocalizations({
              [Locale.Swedish]: "Citatets ID",
            })
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to set as author")
            .setNameLocalizations({
              [Locale.Swedish]: "användare",
            })
            .setDescriptionLocalizations({
              [Locale.Swedish]: "Användaren som ska ställas in som författare",
            })
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("clear")
        .setDescription("Clears the author of a quote")
        .setNameLocalizations({
          [Locale.Swedish]: "rensa",
        })
        .setDescriptionLocalizations({
          [Locale.Swedish]: "Rensar författaren till ett citat",
        })
        .addIntegerOption((option) =>
          option
            .setName("id")
            .setDescription("The quote ID")
            .setDescriptionLocalizations({
              [Locale.Swedish]: "Citatets ID",
            })
            .setRequired(true)
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

    // This could take longer than 3 seconds
    if (!interaction?.deferred) await interaction?.deferReply()

    const id = interaction.options.getInteger("id", true)

    const data = readServerData(interaction.guildId)

    // Note: `id` starts at 1
    if (data.quotes.length >= id && id > 0) {
      // If the quote exists
      const quote = data.quotes[id - 1]

      switch (interaction.options.getSubcommand()) {
        case "set":
          const user = interaction.options.getUser("user", true)
          quote.authorID = user.id

          break
        case "clear":
          quote.authorID = null
          break
      }

      writeServerData(data)

      const r =
        interaction?.locale === Locale.Swedish
          ? `Författaren till citat ${id} har uppdaterats.`
          : `Author of quote ${id} updated.`
      await interaction?.editReply({ content: r })
    } else {
      // If the ID is out of range
      const r =
        interaction?.locale === Locale.Swedish
          ? `Citat med ID ${id} finns inte. Max ${data.quotes.length}`
          : `Quote with ID ${id} does not exist. Max ${data.quotes.length}`
      await interaction?.editReply({ content: r })
    }
  },
} as Command
