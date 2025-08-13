import { Collection } from "discord.js"
import { Command } from "../types/command.js"

/** A map of command names and their implementations. */
const COMMANDS = new Collection<string, Command>()
function addCommand(c: Command) {
  COMMANDS.set(c.data.name, c)
}

// Dynamically import all command files
addCommand((await import("./ping.js")).default)
addCommand((await import("./quote.js")).default)

export default COMMANDS
