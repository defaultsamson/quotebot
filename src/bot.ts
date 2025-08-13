import { MessageFlags, REST, Routes } from "discord.js"
import { Client, Events, GatewayIntentBits } from "discord.js"
import legacyCommandHandler from "./lib/legacy-command-handler.js"

import config from "../config.json" with { type: "json" }
const TOKEN = config.token
const CLIENT_ID = config.clientID

// Load the commands
import COMMANDS from "./commands/all.js"
import { EMOJI_CACHE } from "./lib/emoji-cache.js"
import { Emoji } from "./types/emojis.js"
import {
  readServerData,
  writeServerData,
} from "./lib/server-data/read-write.js"

// Register the commands with Discord
const rest = new REST({ version: "10" }).setToken(TOKEN)
await rest.put(Routes.applicationCommands(CLIENT_ID), {
  body: Array.from(COMMANDS.values()).map((c) => c.data),
})

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
})

client.on(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}!`)
})

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = COMMANDS.get(interaction.commandName)

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`)
      return
    }

    try {
      // Execute the command
      await command.execute(interaction)
    } catch (error) {
      console.error(error)
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        })
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        })
      }
    }
  }
})

/** Legacy command handling (e.g. for "!q") */
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return // Ignore messages from bots
  if (!message.guild) return // Ignore DMs

  await legacyCommandHandler(message)
})

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  const mess = reaction.message
  if (user.bot) return // Ignore bot reactions
  if (!mess.guild) return // Ignore DMs

  const quoteUniqueId = EMOJI_CACHE.get(mess.id)
  if (
    isNaN(quoteUniqueId) ||
    quoteUniqueId === null ||
    typeof quoteUniqueId !== "number"
  )
    return

  // Find the quote object
  const data = readServerData(mess.guildId)
  if (!data) return
  const quote = data.quotes.find((q) => q.internalID === quoteUniqueId)
  if (!quote) return // If no quote object can be found, return

  // Handle the reaction (e.g. add it to the quote)
  switch (reaction.emoji.toString()) {
    case Emoji.Plus:
      {
        // Add their upvote
        if (!quote.upvoteIDs.includes(user.id)) {
          quote.upvoteIDs.push(user.id)
        }
        // Remove any downvotes
        quote.downvoteIDs = quote.downvoteIDs.filter((id) => id !== user.id)
        writeServerData(data)

        // On the server-side, remove any non-upvote reactions
        const nonPlusReactions = mess.reactions.cache.filter(r => r.emoji.toString() !== Emoji.Plus)
        if (nonPlusReactions.size > 0) {
          for (const reaction of nonPlusReactions.values()) {
            await reaction.users.remove(user.id)
          }
        }
      }
      break
    case Emoji.Minus:
      {
        // Add their downvote
        if (!quote.downvoteIDs.includes(user.id)) {
          quote.downvoteIDs.push(user.id)
        }
        // Remove any upvotes
        quote.upvoteIDs = quote.upvoteIDs.filter((id) => id !== user.id)
        writeServerData(data)

        // On the server-side, remove any non-downvote reactions
        const nonMinusReactions = mess.reactions.cache.filter(r => r.emoji.toString() !== Emoji.Minus)
        if (nonMinusReactions.size > 0) {
          for (const reaction of nonMinusReactions.values()) {
            await reaction.users.remove(user.id)
          }
        }
      }
      break
  }
})

client.on(Events.MessageReactionRemove, async (reaction, user) => {
  const mess = reaction.message
  if (user.bot) return // Ignore bot reactions
  if (!mess.guild) return // Ignore DMs

  const quoteUniqueId = EMOJI_CACHE.get(mess.id)
  if (
    isNaN(quoteUniqueId) ||
    quoteUniqueId === null ||
    typeof quoteUniqueId !== "number"
  )
    return

  // Find the quote object
  const data = readServerData(mess.guildId)
  if (!data) return
  const quote = data.quotes.find((q) => q.internalID === quoteUniqueId)
  if (!quote) return // If no quote object can be found, return

  // Handle the reaction (e.g. add it to the quote)
  switch (reaction.emoji.toString()) {
    case Emoji.Plus:
      {
        // Remove their upvote
        quote.upvoteIDs = quote.upvoteIDs.filter((id) => id !== user.id)
        writeServerData(data)
      }
      break
    case Emoji.Minus:
      {
        // Remove their downvote
        quote.downvoteIDs = quote.downvoteIDs.filter((id) => id !== user.id)
        writeServerData(data)
      }
      break
  }
})

client.login(TOKEN)
