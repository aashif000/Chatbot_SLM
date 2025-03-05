// Simple tokenizer implementation for DistilGPT-2
// This is a basic implementation that we'll enhance later

export function encode(text: string): number[] {
  // Basic tokenization for now - split by spaces and punctuation
  return text.split(/([.,!?]\s*|\s+)/)
    .filter(token => token.trim().length > 0)
    .map(token => token.toLowerCase().charCodeAt(0));
}

export function decode(tokens: number[]): string {
  return tokens
    .map(token => String.fromCharCode(token))
    .join('');
}
