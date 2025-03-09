import { Message } from "@/shared/schema";
import { ChatMessage } from "./message";

interface MessageListProps {
  messages: Message[];
  showReasoning?: boolean;
  isLoading?: boolean;
}

export function MessageList({ messages, showReasoning = true, isLoading = false }: MessageListProps) {
  return (
    <div className="flex flex-col w-full space-y-4">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          showReasoning={showReasoning}
        />
      ))}
      
      {isLoading && (
        <div className="animate-pulse flex gap-3 mt-4">
          <div className="h-9 w-9 rounded-full bg-blue-200"></div>
          <div className="flex-1 space-y-2 max-w-[70%]">
            <div className="h-4 bg-blue-100 rounded w-3/4"></div>
            <div className="h-4 bg-blue-100 rounded w-1/2"></div>
            <div className="h-4 bg-blue-100 rounded w-1/4"></div>
          </div>
        </div>
      )}
    </div>
  );
}
