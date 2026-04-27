import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FunctionsHttpError } from "@supabase/supabase-js";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Leaf,
  Sparkles,
  ChevronDown,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER_QUESTIONS = [
  "Best crops for black soil in Maharashtra?",
  "How to improve soil pH for maize?",
  "NPK ratio for banana cultivation?",
  "Kharif vs Rabi crop differences?",
  "How to control Fall Armyworm in maize?",
];

function formatMessage(text: string) {
  // Convert **bold** and bullet points to styled spans
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const formatted = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code class="bg-brand-50 px-1 rounded text-brand-700 text-xs font-mono">$1</code>');
    const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("• ");
    if (isBullet) {
      return (
        <div key={i} className="flex items-start gap-2 my-0.5">
          <span className="text-brand-500 mt-1 flex-shrink-0 text-xs">•</span>
          <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^[-•]\s*/, "") }} />
        </div>
      );
    }
    return (
      <p key={i} className={line === "" ? "mt-2" : "my-0.5"} dangerouslySetInnerHTML={{ __html: formatted }} />
    );
  });
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "Namaste! 🌾 I'm your AgriYield AI Assistant. I'm here to help with crop selection, soil health, fertilizer recommendations, pest management, and more — tailored for Indian farming conditions.\n\nWhat would you like to know today?",
        },
      ]);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text?: string) {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("agri-ai-chat", {
        body: {
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        },
      });

      if (error) {
        let errMsg = error.message;
        if (error instanceof FunctionsHttpError) {
          try {
            const text = await error.context?.text();
            errMsg = text || errMsg;
          } catch {}
        }
        throw new Error(errMsg);
      }

      setMessages([...newMessages, { role: "assistant", content: data.content }]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-90 ${
          open
            ? "bg-gray-700 rotate-0"
            : "bg-gradient-to-br from-brand-600 to-emerald-600 hover:scale-110"
        }`}
        aria-label="AI Assistant"
      >
        {open ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </div>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[370px] max-h-[600px] bg-white rounded-3xl shadow-2xl border border-border flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-emerald-600 px-4 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-heading font-700 text-white text-sm leading-none">AgriYield Assistant</h3>
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              </div>
              <p className="text-brand-100 text-xs mt-0.5">Powered by Gemini 3 Flash</p>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/30 px-2 py-1 rounded-full flex-shrink-0">
              <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
              <span className="text-white text-xs font-medium">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-2.5 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "assistant"
                      ? "bg-brand-100"
                      : "bg-emerald-600"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Leaf className="w-3.5 h-3.5 text-brand-600" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                {/* Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-brand-600 text-white rounded-tr-sm"
                      : "bg-brand-50 text-foreground rounded-tl-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="space-y-0.5">{formatMessage(msg.content)}</div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-3.5 h-3.5 text-brand-600" />
                </div>
                <div className="bg-brand-50 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Starter questions */}
            {messages.length === 1 && !loading && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <ChevronDown className="w-3 h-3" />
                  Quick questions to get started:
                </p>
                {STARTER_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="w-full text-left text-xs px-3 py-2 bg-white border border-brand-200 text-brand-700 rounded-xl hover:bg-brand-50 hover:border-brand-300 transition-colors font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-border p-3 bg-white">
            <div className="flex items-end gap-2 bg-brand-50 rounded-2xl border-2 border-brand-100 focus-within:border-brand-400 transition-colors px-3 py-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about crops, soil, fertilizers..."
                rows={1}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none max-h-24 leading-relaxed py-0.5"
                style={{ minHeight: "24px" }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 active:scale-90"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-white" />
                )}
              </button>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-1.5">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}
