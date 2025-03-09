
# Gemini Thoughts Assistant

A chatbot application that integrates Google's Gemini API with MediaWiki API (Wikipedia) to provide comprehensive, transparent and explainable AI responses with chain-of-thought reasoning capabilities.

## Features

- **AI Agent Integration**: Combines Wikipedia data with Gemini AI for comprehensive responses
- **Chain-of-Thought Reasoning**: See how the AI thinks through its responses step by step
- **Toggle Reasoning**: Show or hide the reasoning process with a simple click
- **Wikipedia Integration**: Enhances responses with information from Wikipedia
- **Sidebar API Key Input**: Easily add your Gemini API key through the user interface
- **Clean UI**: Built with React, Tailwind CSS, and shadcn/ui for a modern user experience

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gemini-thoughts-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Set up your Gemini API key:
   - Sign up for a Gemini API key at https://ai.google.dev/
   - Add your API key directly through the sidebar in the application
   - Your API key will be stored securely in your browser's localStorage

## Required NPM Packages

This project uses the following key dependencies:
- React and React DOM
- TypeScript
- TanStack Query (React Query)
- shadcn/ui components
- Tailwind CSS
- Lucide React (for icons)
- html-entities (for processing Wikipedia content)
- UUID (for generating unique message IDs)

## How It Works

The application works as an AI agent by:

1. When a user asks a question, it first searches Wikipedia using the MediaWiki API
2. If relevant information is found, it provides this to the Gemini AI as context
3. Gemini AI generates a response with chain-of-thought reasoning
4. The combined response is displayed to the user, with the option to show/hide the reasoning process

This approach gives the benefits of both factual information from Wikipedia and the reasoning capabilities of Gemini AI.

## API Integration

### MediaWiki API
The application uses the MediaWiki Action API to fetch data from Wikipedia:
- Searches for articles relevant to user queries
- Extracts summaries and detailed sections
- Provides source links and related topics

### Gemini API
Google's Gemini API is used for:
- Generating structured responses with reasoning
- Enhancing Wikipedia content with additional explanations
- Providing fallback responses when Wikipedia doesn't have relevant information

## Customization

- Modify the system prompt in `src/lib/gemini.ts` to adjust how the AI generates responses
- Adjust the Gemini API parameters (temperature, topK, etc.) to control the creativity and diversity of responses
- Customize the UI components in the `src/components` directory
- Add additional MediaWiki query parameters in `src/lib/mediaWiki.ts` for more detailed information

## License

This project is licensed under the MIT License - see the LICENSE file for details.
