import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { BreathingExercise } from "@/components/BreathingExercise";
import { Send, LogOut, AlertCircle, Wind } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    loadMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUserId(user.id);
  };

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      return;
    }

    setMessages((data || []) as Message[]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const saveMessage = async (role: "user" | "assistant", content: string) => {
    const { error } = await supabase
      .from("chat_messages")
      .insert({ role, content, user_id: userId });

    if (error) {
      console.error("Error saving message:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for breathing exercise keywords
    const breathingKeywords = [
      "breathing exercise", "calm down", "relax", "anxiety",
      "stressed", "panic", "overwhelmed", "breathing", "calm me"
    ];
    
    if (breathingKeywords.some(keyword => lowerMessage.includes(keyword))) {
      setShowBreathingExercise(true);
    }
    
    setInput("");
    setLoading(true);

    // Add user message to UI immediately
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    // Save user message
    await saveMessage("user", userMessage);

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage }
          ],
        },
      });

      if (error) throw error;

      const aiMessage = data.message;
      const isCrisis = data.isCrisis;

      // Show crisis alert if detected
      if (isCrisis) {
        setShowCrisisAlert(true);
      }

      // Add AI response
      const aiMsg: Message = {
        id: `temp-ai-${Date.now()}`,
        role: "assistant",
        content: aiMessage,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Save AI message
      await saveMessage("assistant", aiMessage);

    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Lumacalm AI
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Crisis Alert */}
      {showCrisisAlert && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <Alert className="bg-destructive/10 border-destructive/50">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-sm">
              <strong>Crisis Support Available:</strong> If you're experiencing a mental health crisis, please reach out immediately:
              <br />
              <strong>TeleMANAS (India):</strong> Call <a href="tel:08046110007" className="underline font-semibold">08046110007</a>
              <br />
              <strong>National Crisis Helpline:</strong> <a href="tel:1800-891-4416" className="underline font-semibold">1800-891-4416</a>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-foreground/60 mb-2">
                Welcome to Lumacalm AI 💙
              </p>
              <p className="text-sm text-foreground/50">
                I'm here to listen and support you. How are you feeling today?
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex gap-3 max-w-[80%]">
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-lg">🤖</span>
                  </div>
                )}
                <div
                  className={`rounded-3xl px-5 py-3 shadow-md ${
                    message.role === "user"
                      ? "bg-[hsl(var(--user-message))] text-foreground"
                      : "bg-[hsl(var(--bot-message))] text-foreground"
                  }`}
                >
                  <p className="text-base leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-lg">🤖</span>
                </div>
                <div className="bg-[hsl(var(--bot-message))] rounded-3xl px-5 py-3 shadow-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-border/50 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBreathingExercise(!showBreathingExercise)}
              className="h-12 w-12 rounded-full flex-shrink-0 text-primary hover:bg-primary/10"
              title="Breathing Exercise"
            >
              <Wind className="w-5 h-5" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className="h-12 text-base rounded-full"
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              size="icon"
              className="h-12 w-12 rounded-full flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            This chatbot does not provide professional therapy.
          </p>
        </div>
      </div>

      {/* Breathing Exercise Widget */}
      {showBreathingExercise && (
        <BreathingExercise onClose={() => setShowBreathingExercise(false)} />
      )}
    </div>
  );
};

export default Chat;
