import { Message } from "../../hooks/useChat";

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.sender === "user";

  return (
    <div
      className={`flex w-full mb-3 items-end ${
        isUser ? "justify-end animate-message-in-right" : "justify-start animate-message-in-left"
      }`}
    >
      {!isUser && (
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center mr-2 shrink-0 text-xs font-bold"
          style={{
            background: 'linear-gradient(135deg, hsl(250, 60%, 50%), hsl(280, 70%, 45%))',
            color: 'white',
          }}
        >
          S
        </div>
      )}

      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed ${
          isUser ? "rounded-br-md" : "rounded-bl-md"
        }`}
        style={
          isUser
            ? {
                background: 'linear-gradient(135deg, hsl(250, 60%, 50%), hsl(270, 65%, 48%))',
                color: 'white',
              }
            : {
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'hsl(210, 30%, 85%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }
        }
      >
        {message.content}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex w-full mb-3 items-end justify-start animate-fade-in">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center mr-2 shrink-0 text-xs font-bold"
        style={{
          background: 'linear-gradient(135deg, hsl(250, 60%, 50%), hsl(280, 70%, 45%))',
          color: 'white',
        }}
      >
        S
      </div>
      <div
        className="rounded-2xl rounded-bl-md px-4 py-3 flex space-x-1.5 items-center"
        style={{
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: 'hsl(250, 70%, 65%)', animationDelay: '-0.3s' }}
        />
        <div
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: 'hsl(260, 70%, 65%)', animationDelay: '-0.15s' }}
        />
        <div
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: 'hsl(270, 70%, 65%)' }}
        />
      </div>
    </div>
  );
}
