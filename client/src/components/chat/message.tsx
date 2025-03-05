import { Message } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.role === "assistant";

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Format bold text (surrounded by *)
      const formattedLine = line.replace(/\*(.*?)\*/g, (_, text) => (
        `<span class="font-bold">${text}</span>`
      ));

      // Format bullet points
      const bulletLine = line.startsWith('•') ? 
        `<span class="text-primary">${line}</span>` : 
        formattedLine;

      return (
        <span 
          key={i} 
          className={line.startsWith('•') ? 'block ml-2 mt-1' : ''}
          dangerouslySetInnerHTML={{ __html: bulletLine }}
        />
      );
    });
  };

  return (
    <div className={`flex gap-3 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
      <Avatar className={`h-8 w-8 ${isBot ? 'bg-blue-500' : 'bg-green-500'}`}>
        {isBot ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
      </Avatar>

      <Card className={`max-w-[80%] ${isBot ? 'bg-blue-50' : 'bg-green-50'}`}>
        <CardContent className="p-3">
          <div className="text-sm space-y-2 whitespace-pre-wrap">
            {formatContent(message.content)}
          </div>

          {message.metadata?.wikiReferences && (
            <div className="mt-2 text-xs text-gray-500 italic border-t pt-2">
              Source: Wikipedia
            </div>
          )}

          {message.metadata?.error && (
            <div className="mt-2 text-xs text-red-500">
              {message.metadata.error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}