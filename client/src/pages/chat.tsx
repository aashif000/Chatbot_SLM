import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/input";
import { apiRequest } from "@/lib/queryClient";
import { generateResponse } from "@/lib/model";
import { searchWikipedia, extractWikiContent, getDetailedInfo } from "@/lib/wiki";
import type { Message } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ChatPage() {
  const { toast } = useToast();

  const {
    data: messages = [],
    isLoading,
    refetch
  } = useQuery<Message[]>({ 
    queryKey: ["/api/messages"]
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      // Send user message
      await apiRequest("POST", "/api/messages", {
        content,
        role: "user",
      });

      try {
        // Get detailed Wikipedia information
        const detailedInfo = await getDetailedInfo(content);

        let response = '';
        if (detailedInfo.summary) {
          // Add the title and summary first
          response = `*${detailedInfo.title}*\n\n${detailedInfo.summary}\n\n`;

          // Add detailed sections
          Object.entries(detailedInfo.sections).forEach(([category, content]) => {
            if (content && content.length > 0) {
              response += `*${category}*\n${content}\n\n`;
            }
          });

          // Add suggestions if available
          if (detailedInfo.suggestions?.length) {
            response += '\nRelated topics you might be interested in:\n';
            response += detailedInfo.suggestions.map(s => `• ${s}`).join('\n');
          }

        } else {
          // Fallback to model response if no Wikipedia data
          response = await generateResponse(content);
        }

        // Send bot response
        await apiRequest("POST", "/api/messages", {
          content: response,
          role: "assistant",
          metadata: {
            wikiReferences: [content]
          }
        });
      } catch (error) {
        console.error('Error:', error);
        await apiRequest("POST", "/api/messages", {
          content: "I apologize, but I'm having trouble processing that request. Could you please try again?",
          role: "assistant",
          metadata: { error: error instanceof Error ? error.message : "Unknown error" }
        });
      }

      return refetch();
    }
  });

  const clearChat = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/messages");
      return refetch();
    }
  });

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b flex justify-between items-center bg-primary/5">
        <h1 className="text-xl font-bold">WikiSmart Assistant</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={() => clearChat.mutate()}
          disabled={clearChat.isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          Loading messages...
        </div>
      ) : (
        <MessageList messages={messages} />
      )}

      <ChatInput
        onSend={(content) => sendMessage.mutate(content)}
        disabled={sendMessage.isPending}
      />
    </div>
  );
}