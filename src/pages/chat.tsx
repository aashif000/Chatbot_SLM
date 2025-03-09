import { useState, useEffect, useRef } from "react";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/input";
import { Button } from "@/components/ui/button";
import { Trash2, LightbulbIcon, MenuIcon, BrainIcon, InfoIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { sendToGemini } from "@/lib/gemini";
import { searchWikipedia, formatWikipediaResponseForAI } from "@/lib/mediaWiki";
import type { Message } from "@/shared/schema";
import { Switch } from "@/components/ui/switch";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ApiKeySidebar } from "@/components/sidebar/api-key-sidebar";
import { Card, CardContent } from "@/components/ui/card";

export default function ChatPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showReasoning, setShowReasoning] = useState(true);
  const [geminiApiKey, setGeminiApiKey] = useState<string>("");
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if API key exists in localStorage
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setGeminiApiKey(savedKey);
    }
    
    // Hide welcome screen if there are messages
    if (messages.length > 0) {
      setShowWelcome(false);
    }
  }, [messages.length]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const addMessage = (message: Omit<Message, "id">) => {
    const newMessage = { ...message, id: uuidv4() };
    setMessages((prev) => [...prev, newMessage]);
    setShowWelcome(false);
    return newMessage;
  };

  const handleSendMessage = async (content: string) => {
    try {
      if (!geminiApiKey) {
        toast({
          title: "API Key Required",
          description: "Please add your Gemini API key in the sidebar to use this feature.",
          variant: "destructive"
        });
        return;
      }

      setIsLoading(true);
      
      // Add the user message
      addMessage({
        content,
        role: "user"
      });

      // First try to get information from Wikipedia if query is longer than 3 characters
      let wikiInfo = null;
      let wikiError = null;
      
      try {
        // Only search Wikipedia if the query is more than 3 characters
        if (content.trim().length > 3) {
          wikiInfo = await searchWikipedia(content);
        }
      } catch (error) {
        console.error('Wikipedia search error:', error);
        wikiError = error instanceof Error ? error.message : "Unknown error";
      }

      let botMessage: Message;

      if (wikiInfo && wikiInfo.summary && wikiInfo.summary.length > 0 && 
          !wikiInfo.summary.includes("No Wikipedia results found") &&
          !wikiInfo.summary.includes("too short for Wikipedia search")) {
        // Format the Wikipedia response
        const formattedWikiResponse = formatWikipediaResponseForAI(wikiInfo);

        // Use Gemini to enhance the Wikipedia response with reasoning
        const geminiResponse = await sendToGemini(content, formattedWikiResponse, geminiApiKey);

        botMessage = addMessage({
          content: geminiResponse.content,
          role: "assistant",
          reasoning: geminiResponse.reasoning,
          metadata: {
            wikiReferences: [wikiInfo.title]
          }
        });
      } else {
        // If Wikipedia fails or has no relevant content, use Gemini API directly
        const geminiResponse = await sendToGemini(content, "", geminiApiKey);
        
        botMessage = addMessage({
          content: geminiResponse.content,
          role: "assistant",
          reasoning: geminiResponse.reasoning
        });
      }

      return botMessage;
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      toast({
        title: "Error",
        description: `Failed to process your request: ${errorMessage}`,
        variant: "destructive"
      });
      
      addMessage({
        content: "I apologize, but I'm having trouble processing that request. Could you please try again?",
        role: "assistant",
        metadata: { error: errorMessage }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setShowWelcome(true);
    toast({
      title: "Chat cleared",
      description: "All messages have been removed."
    });
  };

  const handleApiKeyChange = (key: string) => {
    setGeminiApiKey(key);
  };

  // Example prompts for quick starting
  const examplePrompts = [
    "What are the principles of minimalist design?",
    "Explain quantum computing in simple terms",
    "What's the difference between UI and UX design?",
    "How does machine learning work?"
  ];

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full overflow-hidden bg-gray-50/80">
        <ApiKeySidebar onApiKeyChange={handleApiKeyChange} />
        
        <div className="flex-1 flex flex-col">
          <header className="py-3 px-4 border-b flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <SidebarTrigger>
                <MenuIcon className="h-5 w-5 text-gray-600" />
              </SidebarTrigger>
              <div className="flex items-center">
                <BrainIcon className="h-6 w-6 text-primary mr-2" />
                <h1 className="text-xl font-medium">Wiki Me</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full text-xs">
                <LightbulbIcon className="h-3.5 w-3.5 text-amber-500" />
                <Switch 
                  checked={showReasoning} 
                  onCheckedChange={setShowReasoning} 
                  className="scale-75 data-[state=checked]:bg-amber-500"
                />
                <span className="text-gray-700">Show thinking</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleClearChat}
                disabled={isLoading}
                className="h-9 w-9 rounded-full"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {showWelcome ? (
            <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
              <div className="max-w-2xl w-full space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-800">Welcome</h2>
                  <p className="text-gray-600 max-w-lg mx-auto">
                    Ask me anything and see how I think through my responses step by step, with the power of AI.
                    For queries with more than 3 letters, I'll also search Wikipedia for relevant information.
                  </p>
                </div>

                {!geminiApiKey && (
                  <Card className="border-amber-200 bg-amber-50 animate-fade-in animate-delay-100">
                    <CardContent className="pt-4 pb-4 text-center">
                      <InfoIcon className="h-5 w-5 text-amber-600 mx-auto mb-2" />
                      <p className="text-sm text-amber-800">
                        <strong>API Key Required:</strong> Please add your Gemini API key in the sidebar to start using the assistant.
                      </p>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-3 animate-fade-in animate-delay-200">
                  <h3 className="text-sm font-medium text-gray-700 text-center">Try asking about:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {examplePrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => geminiApiKey && handleSendMessage(prompt)}
                        disabled={!geminiApiKey || isLoading}
                        className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-800 animate-fade-in"
                        style={{ animationDelay: `${300 + index * 100}ms` }}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-4">
              <div className="max-w-3xl mx-auto space-y-4">
                <MessageList messages={messages} showReasoning={showReasoning} isLoading={isLoading} />
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          <div className="border-t bg-white/80 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto w-full">
              <ChatInput
                onSend={handleSendMessage}
                disabled={isLoading || !geminiApiKey}
                placeholder={!geminiApiKey ? "Add your Gemini API key in the sidebar first" : "Ask me anything..."}
              />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}