export interface Quote {
  internalID: number // Internal ID for the quote, used for referring to specific quotes
  /** The text of the quote */
  quote: string
  authorID: string | null // Not all quotes have authors (e.g. old ones)
  date: number
  removedDate?: number // Date when the quote was removed
  removedBy?: string // User ID of who removed the quote
  upvoteIDs: string[] // User IDs who upvoted this quote
  downvoteIDs: string[] // User IDs who downvoted this quote
}
