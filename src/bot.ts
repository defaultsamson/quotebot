// The start of the bot main file

console.log("beep boop")

import { MessageFlags, REST, Routes } from "discord.js"

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
// for global commands
// await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] })
// 	.then(() => console.log('Successfully deleted all application commands.'))
// 	.catch(console.error);

import { Client, Events, GatewayIntentBits } from "discord.js"

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.on(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}!`)
})

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return

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
})

client.login(TOKEN)
