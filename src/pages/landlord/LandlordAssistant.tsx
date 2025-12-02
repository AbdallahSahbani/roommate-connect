import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function LandlordAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canGenerate, setCanGenerate] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Check if we have enough data to generate a listing
    const messageContent = messages.map(m => m.content.toLowerCase()).join(" ");
    const hasBasics = messageContent.includes("rent") || messageContent.includes("price");
    const hasLocation = messageContent.includes("address") || messageContent.includes("city");
    const hasRooms = messageContent.includes("bedroom") || messageContent.includes("bath");
    
    setCanGenerate(hasBasics && hasLocation && hasRooms && messages.length >= 6);
  }, [messages]);

  const streamChat = async (userMessage: string, action?: string) => {
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/landlord-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            messages: newMessages,
            action 
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to start stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages([...newMessages, { role: "assistant", content: assistantContent }]);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Check if response contains JSON for property data
      if (action === "generate_listing" && assistantContent.includes("{")) {
        try {
          const jsonMatch = assistantContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const propertyData = JSON.parse(jsonMatch[0]);
            // Store in sessionStorage and navigate to form
            sessionStorage.setItem("draftListing", JSON.stringify(propertyData));
            toast.success("Draft listing created! Redirecting to form...");
            setTimeout(() => navigate("/landlord/listings/new"), 1500);
          }
        } catch (e) {
          console.error("Failed to parse property JSON:", e);
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to communicate with assistant");
      setMessages([...newMessages, { 
        role: "assistant", 
        content: "I'm sorry, I encountered an error. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    streamChat(input);
  };

  const handleGenerateListing = () => {
    setIsLoading(true);
    streamChat("Generate the complete listing now", "generate_listing");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              AI Listing Assistant
            </h1>
            <p className="text-muted-foreground mt-1">
              Let's create your property listing together
            </p>
          </div>
          {canGenerate && !isLoading && (
            <Button onClick={handleGenerateListing} size="lg">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Listing
            </Button>
          )}
        </div>

        <Card className="h-[600px] flex flex-col">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12 space-y-3">
                  <Sparkles className="h-12 w-12 mx-auto text-primary/50" />
                  <p className="text-muted-foreground">
                    Hi! I'm your AI assistant. I'll help you create a professional property listing
                    by asking you a few questions. Let's get started!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tell me about your property - what type is it and where is it located?
                  </p>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your response..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>The AI will guide you through all required information to create a complete listing.</p>
        </div>
      </div>
    </div>
  );
}
