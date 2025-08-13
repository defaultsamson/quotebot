import {
  GuildMember,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Locale,
  MessageFlags,
} from "discord.js"
import { Command } from "../types/command.js"

export enum QuoteAction {
  Get = "get",
  Add = "add",
  Search = "search",
  Remove = "remove",
  Random = "random",
}

export default {
  data: new SlashCommandBuilder()
    .setName("quote")
    .setDescription("Get/add/remove quotes")
    .addSubcommand((sub) =>
      sub
        .setName(QuoteAction.Get)
        .setDescription("Get a quote by ID")
        .setNameLocalizations({
          [Locale.Swedish]: "visa",
        })
        .setDescriptionLocalizations({
          [Locale.Swedish]: "Visa ett citat med ID",
        })
        .addIntegerOption((option) =>
          option
            .setName("id")
            .setDescription("Quote ID")
            .setNameLocalizations({
              [Locale.Swedish]: "id",
            })
            .setDescriptionLocalizations({
              [Locale.Swedish]: "Offertnummer",
            })
            .setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName(QuoteAction.Add)
        .setDescription("Add a new quote")
        .setNameLocalizations({
          [Locale.Swedish]: "tillägga",
        })
        .setDescriptionLocalizations({
          [Locale.Swedish]: "Lägg till ett nytt citat",
        })
        .addStringOption((option) =>
          option
            .setName("text")
            .setDescription("Quote text")
            .setNameLocalizations({
              [Locale.Swedish]: "text",
            })
            .setDescriptionLocalizations({
              [Locale.Swedish]: "Citattext",
            })
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName(QuoteAction.Search)
        .setDescription("Search for quotes")
        .setNameLocalizations({
          [Locale.Swedish]: "söka",
        })
        .setDescriptionLocalizations({
          [Locale.Swedish]: "Sök efter citat",
        })
        .addStringOption((option) =>
          option
            .setName("text")
            .setDescription("Text to search for")
            .setNameLocalizations({
              [Locale.Swedish]: "text",
            })
            .setDescriptionLocalizations({
              [Locale.Swedish]: "Text att söka efter",
            })
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName(QuoteAction.Remove)
        .setDescription("Remove a quote by ID")
        .setNameLocalizations({
          [Locale.Swedish]: "avlägsna",
        })
        .setDescriptionLocalizations({
          [Locale.Swedish]: "Ta bort ett citat med ID",
        })
        .addIntegerOption((option) =>
          option
            .setName("id")
            .setDescription("Quote ID")
            .setNameLocalizations({
              [Locale.Swedish]: "id",
            })
            .setDescriptionLocalizations({
              [Locale.Swedish]: "Offertnummer",
            })
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName(QuoteAction.Random)
        .setDescription("Get a random quote")
        .setNameLocalizations({
          [Locale.Swedish]: "godtycklig",
        })
        .setDescriptionLocalizations({
          [Locale.Swedish]: "Visa ett slumpmässigt citat",
        })
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand()
    switch (subcommand) {
      case QuoteAction.Get: {
        const id = interaction.options.getInteger("id", false)
        getQuote(interaction, id)
        return
      }
      case QuoteAction.Add: {
        const text = interaction.options.getString("text", true)
        addQuote(interaction, text)
        return
      }
      case QuoteAction.Search: {
        const text = interaction.options.getString("text", true)
        searchQuote(interaction, text)
        return
      }
      case QuoteAction.Remove: {
        const id = interaction.options.getInteger("id", true)
        removeQuote(interaction, id)
        return
      }
      case QuoteAction.Random: {
        doRandom(interaction)
        return
      }
      default: {
        interaction.reply({
          content: "Unknown subcommand.",
          flags: MessageFlags.Ephemeral,
        })
        return
      }
    }
  },
} as Command

function doRandom(interaction: ChatInputCommandInteraction) {
  // Logic to get a random quote
  return interaction.reply({
    content: `Get a random quote`,
    flags: MessageFlags.Ephemeral,
  })
}
function addQuote(interaction: ChatInputCommandInteraction, text: string) {
  // Logic to add a quote
  return interaction.reply({
    content: `Quote added: "${text}"`,
    flags: MessageFlags.Ephemeral,
  })
}
function removeQuote(interaction: ChatInputCommandInteraction, id: number) {
  // Logic to remove a quote
  return interaction.reply({
    content: `Quote with ID ${id} removed.`,
    flags: MessageFlags.Ephemeral,
  })
}
function getQuote(interaction: ChatInputCommandInteraction, id: number) {
  // Logic to get a quote by ID
  return interaction.reply({
    content: `Quote with ID ${id} retrieved.`,
    flags: MessageFlags.Ephemeral,
  })
}
function searchQuote(interaction: ChatInputCommandInteraction, text: string) {
  return interaction.reply({
    content: `Searching for quotes with: "${text}"`,
    flags: MessageFlags.Ephemeral,
  })
}
