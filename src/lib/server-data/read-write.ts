import fs from "fs"
import ServerData from "../../types/server-data.js"

const DATA_DIR = "./data/"

/** A cache of mutable ServerData objects */
const CACHE = new Map<string, ServerData>()

export function readServerData(serverID: string): ServerData {
  // If we have it cached, just use that instead of reading it over and over
  if (CACHE.has(serverID)) return CACHE.get(serverID)!

  const filePath = `${DATA_DIR}${serverID}.json`

  if (!fs.existsSync(filePath)) {
    console.warn(`Server data file not found for server ID: ${serverID}`)

    // Create new one
    const newData: ServerData = {
      nextInternalID: 0,
      serverID,
      quotes: [],
      removed: [],
      adminIDs: [],
    }
    // Write it
    writeServerData(newData)

    // Return it
    return newData
  }

  // Read the file
  const data = fs.readFileSync(filePath, "utf-8")
  const parsed = JSON.parse(data) as ServerData
  CACHE.set(serverID, parsed)
  return parsed
}

export function writeServerData(data: ServerData): void {
  if (!data || !data.serverID) return // If it's invalid for whatever reason, reject it
  if (!CACHE.has(data.serverID)) CACHE.set(data.serverID, data) // Update the cache

  const filePath = `${DATA_DIR}${data.serverID}.json`
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true }) // Ensure the directory exists
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error(`Error writing server json ${data.serverID}:`, error)
  }
}
