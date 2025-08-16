import { Quote } from "./quote.js"

export default interface ServerData {
  serverID: string
  quotes: Quote[]
  removed: Quote[]
  /** The next unique quote identifier. Must be incremented by 1 each time a quote is added. */
  nextInternalID: number
  adminIDs: string[]
  /** The ID of the channel to send quotes to. */
  channelID: string | null
  /** Optional custom emoji for upvotes. */
  customPlus?: string
  /** Optional custom emoji for downvotes. */
  customMinus?: string
}
