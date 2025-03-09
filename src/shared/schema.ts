
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  metadata?: {
    wikiReferences?: string[];
    error?: string;
  };
}
