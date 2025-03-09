// and manages the chain-of-thought reasoning capabilities
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// System prompt that encourages the model to show its reasoning
const SYSTEM_PROMPT = `
You are a helpful assistant that thinks step by step before answering.
When responding to questions, use the following format:

<reasoning>
- First, think about what's being asked
- Break down the question into logical steps
- Consider multiple perspectives or approaches
- Check for any potential errors or misunderstandings
- Arrive at a well-reasoned conclusion
</reasoning>

<answer>
Your final, clear, and concise answer goes here.
</answer>

Always show your reasoning before providing an answer.
`;

/**
 * Extract reasoning and answer from Gemini response
 */
function extractReasoningAndAnswer(text: string): { reasoning: string; answer: string } {
  const reasoningMatch = text.match(/<reasoning>([\s\S]*?)<\/reasoning>/i);
  const answerMatch = text.match(/<answer>([\s\S]*?)<\/answer>/i);

  const reasoning = reasoningMatch ? reasoningMatch[1].trim() : '';
  const answer = answerMatch ? answerMatch[1].trim() : text;

  return { reasoning, answer };
}

/**
 * Sends a request to the Gemini API using the official SDK
 */
export async function sendToGemini(
  userPrompt: string,
  contextInfo: string = '',
  apiKey: string = ''
): Promise<{ content: string; reasoning: string }> {
  if (!apiKey) {
    throw new Error('Gemini API key is not provided. Please add your API key to use this feature.');
  }

  try {
    // Initialize the API with the provided key
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Available models: gemini-1.5-flash, gemini-1.5-pro, etc.
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Include any context information in the prompt
    const fullPrompt = contextInfo 
      ? `${SYSTEM_PROMPT}\n\nContext information: ${contextInfo}\n\nUser question: ${userPrompt}`
      : `${SYSTEM_PROMPT}\n\nUser question: ${userPrompt}`;

    // Generate content
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const generatedText = response.text();

    // Extract reasoning and answer
    const { reasoning, answer } = extractReasoningAndAnswer(generatedText);

    return {
      content: answer,
      reasoning: reasoning,
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}