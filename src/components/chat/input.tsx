import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic, Image, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = "Type your message..." }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  // Focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-10 transition-all duration-300">
      <form 
        onSubmit={handleSubmit} 
        className="p-4 border-t border-gray-200 max-w-3xl mx-auto"
      >
        <div className={cn(
          "flex items-center gap-2 relative p-1 border rounded-full transition-all duration-300",
          focused ? "ring-2 ring-primary/20 border-primary/30" : "border-gray-200",
          disabled && "opacity-70"
        )}>
          <div className="flex items-center gap-1.5 pl-2">
            <button 
              type="button"
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button 
              type="button"
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              disabled={disabled}
            >
              <Image className="h-4 w-4" />
            </button>
          </div>

          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className="border-0 shadow-none focus-visible:ring-0 p-2"
          />

          <div className="flex items-center">
            {input.trim() ? (
              <Button 
                type="submit" 
                disabled={disabled || !input.trim()}
                size="sm"
                className="rounded-full h-9 w-9 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="button" 
                disabled={disabled}
                variant="ghost"
                size="sm"
                className="rounded-full h-9 w-9 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
