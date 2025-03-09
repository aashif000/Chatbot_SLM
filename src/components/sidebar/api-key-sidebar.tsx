import { useState, useEffect } from "react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { KeyIcon, SaveIcon, CheckIcon, InfoIcon, LinkIcon, GlobeIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";

interface ApiKeySidebarProps {
  onApiKeyChange: (key: string) => void;
}

export function ApiKeySidebar({ onApiKeyChange }: ApiKeySidebarProps) {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string>("");
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
      onApiKeyChange(savedKey);
    }
  }, [onApiKeyChange]);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("gemini_api_key", apiKey);
      setIsSaved(true);
      onApiKeyChange(apiKey);
      
      toast({
        title: "API Key Saved",
        description: "Your Gemini API key has been saved securely."
      });
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid API key.",
        variant: "destructive"
      });
    }
  };

  return (
    <Sidebar className="border-r bg-secondary/30">
      <SidebarHeader className="p-4 border-b border-gray-200/70">
        <div className="flex items-center gap-2">
          <KeyIcon className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">API Settings</h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-5">
        <div className="space-y-5">
          <Card className="border border-gray-200/70 bg-white/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <span className="text-primary">
                  <GlobeIcon className="h-4 w-4 inline-block" />
                </span>
                Gemini API
              </CardTitle>
              <CardDescription className="text-xs">
                Configure your Gemini API access
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 space-y-4">
              <div>
                <p className="text-xs text-gray-600 mb-4">
                  Enter your Gemini API key to access AI-powered features.
                </p>
                <div 
                  className={`relative border transition-all duration-200 rounded-md ${
                    isFocused ? "ring-2 ring-primary/20 border-primary/40" : "border-gray-200"
                  }`}
                >
                  <Input
                    type="password"
                    placeholder="Enter your API key"
                    value={apiKey}
                    className="border-0 shadow-none focus-visible:ring-0"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setIsSaved(false);
                    }}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-1">
              <Button 
                onClick={handleSaveApiKey}
                className="w-full rounded-md transition-all transform active:scale-95"
                disabled={!apiKey.trim()}
              >
                {isSaved ? (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Saved
                  </>
                ) : (
                  <>
                    <SaveIcon className="h-4 w-4 mr-2" />
                    Save API Key
                  </>
                )}
              </Button>
              
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                <InfoIcon className="h-3.5 w-3.5" />
                <p>Get your key from <a 
                  href="https://ai.google.dev/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:underline inline-flex items-center"
                >
                  Google AI Studio
                  <LinkIcon className="h-3 w-3 ml-0.5" />
                </a>
                </p>
              </div>
            </CardFooter>
          </Card>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">About Gemini</h3>
            <p className="text-xs text-gray-600">
              Gemini is Google's most capable AI model, designed to reason across text, code, images, and more. This assistant uses Gemini 1.5 Flash to analyze your questions and provide thoughtful answers.
            </p>
            
            <div className="mt-4 bg-blue-50 rounded-md p-3 text-xs border border-blue-100">
              <p className="font-medium text-blue-700 mb-1">Model information</p>
              <p className="text-blue-600">
                This app uses the Gemini 1.5 Flash model, which is faster and more efficient for general purpose use cases while maintaining high quality responses.
              </p>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
