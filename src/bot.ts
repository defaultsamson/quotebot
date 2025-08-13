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
import { addQuote } from "./lib/quote-operations/add.js"
import { getRandom } from "./lib/quote-operations/get-random.js"
import { getQuote } from "./lib/quote-operations/get.js"
import { removeQuote } from "./lib/quote-operations/remove.js"

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

/** Legacy command handling */
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return // Ignore messages from bots
  if (!message.guild) return // Ignore DMs

  const raw = message.content.trim()
  const splitRaw = raw
    .trim()
    .split(" ")
    .map((s) => s.trim())

  // Check for blank `!q` or `!quote` commands
  if (splitRaw.length === 1 && splitRaw[0].startsWith("!q"))
    return await getRandom(message)

  // Check for `!remove <number>`
  if (
    splitRaw.length === 2 &&
    [
      "!remove",
      "!removequote",
      "!quoteremove",
      "!qremove",
      "!delete",
      "!quotedelete",
      "!deletequote",
      "!qdelete",
    ].some((cmd) => splitRaw[0].startsWith(cmd))
  ) {
    const id = parseInt(splitRaw[1])
    if (!isNaN(id)) {
      return removeQuote(message, id)
    }
  }

  // Note: check for the `remove` stuff before this because they are more specific
  // Check for `!q <number>`
  if (splitRaw.length === 2 && splitRaw[0].startsWith("!q")) {
    const id = parseInt(splitRaw[1])
    if (!isNaN(id)) {
      return await getQuote(message, id)
    }
  }

  // Check for `!q remove <number>`
  if (
    splitRaw.length === 3 &&
    ["!quote remove", "!q remove", "!quote delete", "!q delete"].some((cmd) =>
      (splitRaw[0] + " " + splitRaw[1]).startsWith(cmd)
    )
  ) {
    const id = parseInt(splitRaw[2])
    if (!isNaN(id)) {
      return getQuote(message, id)
    }
  }

  // Finally, check for add commands
  const addMatches = [
    // Note: start with the longest ones to avoid putting keywords as part of the quote
    "!quote add",
    "!quotes add",
    "!q add",
    "!add quote",
    "!quote", // Note: at this point we will have already handled the # and random commands, so checking for !quote is safe
    "!q",
    "!quotes",
    "!add",
    "!qadd",
  ]
  for (const m of addMatches) // Find a match and get the message
    if (raw.startsWith(m)) {
      const text = raw.slice(m.length).trim()
      if (text !== "add" && text !== "remove" && text !== "delete") {
        return await addQuote(message, text)
      }
    }

  // If nothing matches, ignore the message. This is only for legacy fallback anyways
})

client.login(TOKEN)
