import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { MessageSquare, X, Send, Bot, Loader2, Sparkles } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
const API_BASE = `${BASE_URL}/api`;

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const savedName = sessionStorage.getItem("siebert_chat_name");
    const savedEmail = sessionStorage.getItem("siebert_chat_email");
    const savedConvId = sessionStorage.getItem("siebert_chat_conv_id");
    if (savedName && savedEmail) {
      setName(savedName);
      setEmail(savedEmail);
      setIsInitialized(true);
    }
    if (savedConvId) {
      const id = parseInt(savedConvId);
      setConversationId(id);
      loadHistory(id);
    }
  }, []);

  const loadHistory = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/openai/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(
          data.messages.map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }))
        );
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    sessionStorage.setItem("siebert_chat_name", name);
    sessionStorage.setItem("siebert_chat_email", email);

    try {
      const res = await fetch(`${API_BASE}/openai/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `Chat with ${name}` }),
      });
      if (res.ok) {
        const conv = await res.json();
        setConversationId(conv.id);
        sessionStorage.setItem("siebert_chat_conv_id", String(conv.id));
        setMessages([
          {
            role: "assistant",
            content: `Hi ${name}! I'm the Siebert Services AI assistant. How can I help you today? Whether you have questions about our IT services, cloud solutions, cybersecurity, or anything else — I'm here to help.`,
          },
        ]);
      }
    } catch {
      // fallback: just show the greeting
      setMessages([
        {
          role: "assistant",
          content: `Hi ${name}! I'm the Siebert Services AI assistant. How can I help you today?`,
        },
      ]);
    }

    setIsInitialized(true);
  };

  const sendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!message.trim() || !conversationId || isStreaming) return;

      const userMsg = message.trim();
      setMessage("");

      setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
      setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`${API_BASE}/openai/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: userMsg }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error("Stream failed");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const json = JSON.parse(line.slice(6));
                if (json.done) {
                  setMessages((prev) =>
                    prev.map((m, i) =>
                      i === prev.length - 1 ? { ...m, streaming: false } : m
                    )
                  );
                } else if (json.content) {
                  setMessages((prev) =>
                    prev.map((m, i) =>
                      i === prev.length - 1
                        ? { ...m, content: m.content + json.content }
                        : m
                    )
                  );
                }
              } catch {
                // ignore malformed JSON
              }
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m, i) =>
              i === prev.length - 1
                ? { ...m, content: "Sorry, I had trouble responding. Please try again.", streaming: false }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [message, conversationId, isStreaming]
  );

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 lg:bottom-6 lg:right-28 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 hover:bg-primary/90 transition-all z-50 ring-4 ring-primary/20"
            aria-label="Open AI chat"
          >
            <MessageSquare className="w-8 h-8" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] max-w-[calc(100vw-3rem)] z-50 flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-border/50 bg-background"
          >
            <div className="bg-navy p-4 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold leading-tight flex items-center gap-1.5">
                    Siebert AI Assistant
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </h3>
                  <p className="text-xs text-primary">Powered by AI · Always available</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors p-2"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 relative">
              {!isInitialized ? (
                <div className="p-6 flex-1 flex flex-col justify-center">
                  <h4 className="text-xl font-bold text-navy mb-2">Let's get started</h4>
                  <p className="text-sm text-muted-foreground mb-6">
                    Please introduce yourself so our AI assistant can personalize your experience.
                  </p>
                  <form onSubmit={handleStartChat} className="space-y-4">
                    <Input
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-white"
                    />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white"
                    />
                    <Button type="submit" className="w-full">
                      Start Chat
                    </Button>
                  </form>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center text-muted-foreground mt-10 text-sm">
                        Ask me anything about Siebert Services.
                      </div>
                    )}
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={cn("flex w-full", msg.role === "assistant" ? "justify-start" : "justify-end")}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2 mt-1">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl p-3 text-sm",
                            msg.role === "assistant"
                              ? "bg-white border border-border text-navy rounded-tl-sm shadow-sm"
                              : "bg-primary text-white rounded-tr-sm shadow-md"
                          )}
                        >
                          {msg.content}
                          {msg.streaming && (
                            <span className="inline-flex gap-0.5 ml-1">
                              <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0ms]" />
                              <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:150ms]" />
                              <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:300ms]" />
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-3 bg-white border-t border-border shrink-0">
                    <form onSubmit={sendMessage} className="flex gap-2">
                      <Input
                        placeholder="Ask me anything..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 rounded-full bg-gray-50 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent h-10 border-transparent shadow-inner"
                        disabled={isStreaming}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage(e as unknown as React.FormEvent);
                          }
                        }}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        className="rounded-full h-10 w-10 shrink-0"
                        disabled={!message.trim() || isStreaming}
                      >
                        {isStreaming ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 ml-0.5" />
                        )}
                      </Button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
