import {
  GuildMember,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Locale,
  MessageFlags,
} from "discord.js"
import { Command } from "../types/command.js"
import { addQuote } from "../lib/quote-operations/add.js"
import { searchQuote } from "../lib/quote-operations/search.js"
import { removeQuote } from "../lib/quote-operations/remove.js"
import { getRandom } from "../lib/quote-operations/get-random.js"
import { getQuote } from "../lib/quote-operations/get.js"
import { getInfo } from "../lib/quote-operations/get-info.js"
import { getTopQuotes } from "../lib/quote-operations/get-top.js"
import { getBottomQuotes } from "../lib/quote-operations/get-bottom.js"

export enum QuoteAction {
  Get = "get",
  Add = "add",
  Search = "search",
  Remove = "remove",
  Random = "random",
  Info = "info",
  Top = "top",
  Bottom = "bottom",
}

export default {
  data: new SlashCommandBuilder()
    .setName("quote")
    .setDescription("Get/add/remove quotes")
    .addSubcommand((sub) =>
      sub
        .setName(QuoteAction.Top)
        .setDescription("Show the top upvoted quotes in the server")
        .setNameLocalizations({
          [Locale.Swedish]: "topp",
        })
        .setDescriptionLocalizations({
          [Locale.Swedish]: "Visa de mest uppvotade citaten i servern",
        })
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("Number of top quotes to retrieve")
            .setNameLocalizations({
              [Locale.Swedish]: "antal",
            })
            .setDescriptionLocalizations({
              [Locale.Swedish]: "Antal citat att hämta",
            })
            .setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName(QuoteAction.Bottom)
        .setDescription("Show the most downvoted quotes in the server")
        .setNameLocalizations({
          [Locale.Swedish]: "botten",
        })
        .setDescriptionLocalizations({
          [Locale.Swedish]: "Visa de mest nedvotade citaten i servern",
        })
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("Number of bottom quotes to retrieve")
            .setNameLocalizations({
              [Locale.Swedish]: "antal",
            })
            .setDescriptionLocalizations({
              [Locale.Swedish]: "Antal citat att hämta",
            })
            .setRequired(false)
        )
    )
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
        .addIntegerOption((option) =>
          option
            .setName("top")
            .setDescription("Get the top number of results")
            .setNameLocalizations({
              [Locale.Swedish]: "topp",
            })
            .setDescriptionLocalizations({
              [Locale.Swedish]: "Hämta det översta antalet resultat",
            })
            .setRequired(false)
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
    )
    .addSubcommand((sub) =>
      sub
        .setName(QuoteAction.Info)
        .setDescription("Get information about a quote")
        .setNameLocalizations({
          [Locale.Swedish]: "information",
        })
        .setDescriptionLocalizations({
          [Locale.Swedish]: "Visa information om ett citat",
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

    const subcommand = interaction.options.getSubcommand()
    switch (subcommand) {
      case QuoteAction.Top: {
        const amount = interaction.options.getInteger("amount", false)
        getTopQuotes(interaction, amount)
        return
      }
      case QuoteAction.Bottom: {
        const amount = interaction.options.getInteger("amount", false)
        getBottomQuotes(interaction, amount)
        return
      }
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
        const limit = interaction.options.getInteger("top", false)
        searchQuote(interaction, text, limit)
        return
      }
      case QuoteAction.Remove: {
        const id = interaction.options.getInteger("id", true)
        removeQuote(interaction, id)
        return
      }
      case QuoteAction.Random: {
        getRandom(interaction)
        return
      }
      case QuoteAction.Info: {
        const id = interaction.options.getInteger("id", true)
        getInfo(interaction, id)
        return
      }
    }
  },
} as Command
