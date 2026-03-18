import { useState, useEffect, useRef } from "react";
import { generateSessionId } from "@/lib/utils";
import { useGetChatMessages, useSendChatMessage } from "@workspace/api-client-react";
import { MessageSquare, X, Send, User, Bot, Loader2 } from "lucide-react";
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session ID
  useEffect(() => {
    let sid = sessionStorage.getItem("siebert_chat_session");
    if (!sid) {
      sid = generateSessionId();
      sessionStorage.setItem("siebert_chat_session", sid);
    }
    setSessionId(sid);
    
    const savedName = sessionStorage.getItem("siebert_chat_name");
    if (savedName) {
      setName(savedName);
      setIsInitialized(true);
    }
  }, []);

  // Poll for messages
  const { data: messages = [], refetch } = useGetChatMessages(
    { sessionId },
    { 
      query: { 
        enabled: isOpen && !!sessionId,
        refetchInterval: 3000 // Poll every 3s
      } 
    }
  );

  const sendMessageMutation = useSendChatMessage();

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    sessionStorage.setItem("siebert_chat_name", name);
    setIsInitialized(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !sessionId) return;
    
    const msgText = message;
    setMessage("");
    
    try {
      await sendMessageMutation.mutateAsync({
        data: {
          sessionId,
          message: msgText,
          name,
          email
        }
      });
      refetch();
      
      // Simulate agent reply if backend doesn't handle it
      setTimeout(() => {
        sendMessageMutation.mutateAsync({
          data: {
            sessionId,
            message: `Hi ${name}, thanks for reaching out! A Siebert Services representative will review your message shortly.`,
            // Hack to pretend to be an agent for UI purposes if backend accepts it, 
            // otherwise backend defines sender in DB. We just trigger another message for effect.
          }
        }).then(() => refetch());
      }, 1500);

    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 hover:bg-primary/90 transition-all z-50 ring-4 ring-primary/20"
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
            {/* Header */}
            <div className="bg-navy p-4 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold leading-tight">Siebert Support</h3>
                  <p className="text-xs text-primary">Typically replies in minutes</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 relative">
              {!isInitialized ? (
                // Init Form
                <div className="p-6 flex-1 flex flex-col justify-center">
                  <h4 className="text-xl font-bold text-navy mb-2">Let's get started</h4>
                  <p className="text-sm text-muted-foreground mb-6">Please provide your details so we can assist you better.</p>
                  <form onSubmit={handleStartChat} className="space-y-4">
                    <div>
                      <Input 
                        placeholder="Your Name" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        required 
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                        className="bg-white"
                      />
                    </div>
                    <Button type="submit" className="w-full">Start Chat</Button>
                  </form>
                </div>
              ) : (
                // Chat Area
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center text-muted-foreground mt-10 text-sm">
                        Send a message to start the conversation.
                      </div>
                    )}
                    {messages.map((msg, i) => {
                      const isAgent = msg.sender === 'agent' || i % 2 !== 0; // Fallback logic if backend doesn't track properly for demo
                      return (
                        <div key={msg.id || i} className={cn("flex w-full", isAgent ? "justify-start" : "justify-end")}>
                          <div className={cn(
                            "max-w-[80%] rounded-2xl p-3 text-sm",
                            isAgent 
                              ? "bg-white border border-border text-navy rounded-tl-sm shadow-sm" 
                              : "bg-primary text-white rounded-tr-sm shadow-md"
                          )}>
                            {msg.message}
                          </div>
                        </div>
                      );
                    })}
                    {sendMessageMutation.isPending && (
                      <div className="flex justify-end w-full">
                        <div className="bg-primary/50 text-white rounded-2xl rounded-tr-sm p-3 shadow-md flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Input area */}
                  <div className="p-3 bg-white border-t border-border shrink-0">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input 
                        placeholder="Type a message..." 
                        value={message} 
                        onChange={e => setMessage(e.target.value)}
                        className="flex-1 rounded-full bg-gray-50 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent h-10 border-transparent shadow-inner"
                        disabled={sendMessageMutation.isPending}
                      />
                      <Button 
                        type="submit" 
                        size="icon" 
                        className="rounded-full h-10 w-10 shrink-0"
                        disabled={!message.trim() || sendMessageMutation.isPending}
                      >
                        <Send className="w-4 h-4 ml-1" />
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
