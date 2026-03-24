/*
  parseAIResponse.js

  Splits an AI reply into an array of message parts before they hit the UI.
  This lets the AI send richer responses without the frontend needing to
  know anything about the prompt format.
*/

const CONCEPT_REGEX = /^\[concept:\s*([^|]+)\|\s*([\s\S]+)\]$/i

export function parseAIResponse(text) {
  const parts = []

  const segments = text
    .split('||')
    .map(s => s.trim())
    .filter(Boolean)

  for (const segment of segments) {
    const match = segment.match(CONCEPT_REGEX)
    if (match) {
      parts.push({
        type: 'concept',
        title: match[1].trim(),
        content: match[2].trim(),
      })
    } else {
      parts.push({
        type: 'text',
        content: segment,
      })
    }
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: text }]
}
