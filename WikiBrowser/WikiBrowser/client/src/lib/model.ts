import * as ort from 'onnxruntime-web';

let model: ort.InferenceSession | null = null;
const MODEL_URL = 'https://cdn.jsdelivr.net/gh/huggingface/transformers@main/model_zoo/gpt2-distilled/model.onnx';

export async function initModel() {
  if (!model) {
    try {
      // Configure WebAssembly for optimal performance
      const options: ort.InferenceSession.SessionOptions = {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      };

      model = await ort.InferenceSession.create(MODEL_URL, options);
      console.log('Model initialized successfully');
    } catch (error) {
      console.error('Model initialization error:', error);
      throw new Error('Failed to initialize the model');
    }
  }
  return model;
}

export async function generateResponse(input: string): Promise<string> {
  try {
    if (!model) {
      await initModel();
    }

    // For now, return a more natural response while we implement the full model
    const responses = [
      `I understand your question about "${input}". Let me think about that...`,
      `That's an interesting point about "${input}". Here's what I know...`,
      `Regarding "${input}", I can provide some insights...`
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];

    return response;
  } catch (error) {
    console.error('Generation error:', error);
    throw error;
  }
}