import { MessageFlags, REST, Routes } from "discord.js"
import { Client, Events, GatewayIntentBits } from "discord.js"
import legacyCommandHandler from "./lib/legacy-command-handler.js"

import config from "../config.json" with { type: "json" }
const TOKEN = config.token
const CLIENT_ID = config.clientID

// Load the commands
import COMMANDS from "./commands/all.js"

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

client.login(TOKEN)
