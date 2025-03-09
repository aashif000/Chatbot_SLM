import { Message } from "@/shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
  showReasoning?: boolean;
  animate?: boolean;
}

export function ChatMessage({ message, showReasoning = false, animate = true }: ChatMessageProps) {
  const isBot = message.role === "assistant";
  const hasReasoning = isBot && message.reasoning;

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
    <div 
      className={cn(
        "flex gap-3 mb-4",
        isBot ? "flex-row" : "flex-row-reverse",
        animate && "opacity-0 animate-fade-in"
      )}
      style={{ animationDelay: animate ? '100ms' : '0ms' }}
    >
      <Avatar className={cn(
        "h-9 w-9 shadow-sm border",
        isBot ? "bg-blue-500 border-blue-400" : "bg-green-500 border-green-400"
      )}>
        {isBot ? <Bot className="h-5 w-5 text-white" /> : <User className="h-5 w-5 text-white" />}
      </Avatar>

      <div className={cn(
        "max-w-[85%] rounded-2xl shadow-sm border transition-all duration-300",
        isBot ? "message-assistant" : "message-user",
        "transform-gpu"
      )}>
        <div className="p-3.5">
          <div className="text-sm space-y-2 whitespace-pre-wrap">
            {formatContent(message.content)}
          </div>

          {hasReasoning && showReasoning && (
            <div className="mt-3 text-xs text-gray-600 border-t pt-2.5 reasoning-appear">
              <div className="font-medium mb-1 text-primary/80">Reasoning:</div>
              <div className="pl-2.5 border-l-2 border-blue-200">
                {formatContent(message.reasoning || "")}
              </div>
            </div>
          )}

          {message.metadata?.wikiReferences && (
            <div className="mt-2.5 text-xs text-gray-500 italic border-t pt-2.5 flex items-center gap-1.5">
              <span className="inline-block w-4 h-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" className="w-full h-full">
                  <path d="M64 0a64 64 0 100 128 64 64 0 000-128zm0 118a54 54 0 110-108 54 54 0 010 108z" fill="currentColor" opacity={0.8} />
                  <path d="M84 93H44V35h40v58zM54 83h20V45H54v38z" fill="currentColor" opacity={0.8} />
                  <path d="M70 55H58v-2h12v2zm0 8H58v-2h12v2zm0 8H58v-2h12v2z" fill="currentColor" opacity={0.8} />
                </svg>
              </span>
              <span>Source: Wikipedia</span>
            </div>
          )}

          {message.metadata?.error && (
            <div className="mt-2.5 text-xs text-red-500 italic border-t pt-2.5">
              {message.metadata.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}