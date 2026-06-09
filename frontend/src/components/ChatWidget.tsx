import { MessageSquare, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { ChatMessage, TypingIndicator } from "./ChatMessage";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, error, sendMessage, resetChat } = useChat();

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div
          className="w-[380px] sm:w-[420px] h-[540px] mb-4 flex flex-col overflow-hidden animate-slide-up rounded-2xl"
          style={{
            background: 'hsl(230, 25%, 11%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.5), 0 0 40px -10px rgba(139, 92, 246, 0.15)',
          }}
        >
          <div
            className="py-4 px-5 flex items-center justify-between shrink-0"
            style={{
              background: 'linear-gradient(135deg, hsl(250, 60%, 45%) 0%, hsl(280, 70%, 40%) 50%, hsl(310, 60%, 40%) 100%)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-[15px] leading-tight">Spur Support</h3>
                <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Online now
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                title="New chat"
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))', border: '1px solid rgba(139, 92, 246, 0.15)' }}
                >
                  <MessageSquare className="w-7 h-7" style={{ color: 'hsl(250, 89%, 75%)' }} />
                </div>
                <p className="font-semibold text-[15px] mb-2" style={{ color: 'hsl(210, 40%, 92%)' }}>Welcome to Spur! 👋</p>
                <p className="text-sm leading-relaxed max-w-[240px]" style={{ color: 'hsl(220, 15%, 50%)' }}>
                  Ask us anything about shipping, returns, or orders. We're here to help!
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <ChatMessage key={msg.id || idx} message={msg} />
            ))}

            {isLoading && <TypingIndicator />}

            {error && (
              <div
                className="flex items-center gap-2 text-sm p-3 rounded-xl mt-2 mb-4 animate-fade-in"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'hsl(0, 80%, 65%)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p>{error}</p>
              </div>
            )}

            <div ref={scrollRef} className="h-1" />
          </div>

          <div
            className="px-4 py-3 shrink-0"
            style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', background: 'hsl(230, 25%, 9%)' }}
          >
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                ref={inputRef}
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 h-10 px-4 rounded-xl text-sm outline-none transition-all duration-200 placeholder:text-gray-500 disabled:opacity-50"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'hsl(210, 40%, 92%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: input.trim() ? 'linear-gradient(135deg, hsl(250, 60%, 50%), hsl(280, 70%, 45%))' : 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                }}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {!isOpen && (
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full animate-pulse-ring"
            style={{ background: 'linear-gradient(135deg, hsl(250, 60%, 50%), hsl(280, 70%, 45%))' }}
          />
          <button
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1"
            style={{
              background: 'linear-gradient(135deg, hsl(250, 60%, 50%), hsl(280, 70%, 45%))',
              boxShadow: '0 8px 32px -4px rgba(139, 92, 246, 0.4)',
            }}
          >
            <MessageSquare className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
