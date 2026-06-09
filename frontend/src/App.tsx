import { ChatWidget } from "./components/ChatWidget";

function App() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'hsl(230, 25%, 7%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30 animate-blob"
          style={{ background: 'radial-gradient(circle, hsl(250, 89%, 62%) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/3 -right-20 w-[500px] h-[500px] rounded-full opacity-20 animate-blob"
          style={{ background: 'radial-gradient(circle, hsl(190, 95%, 55%) 0%, transparent 70%)', animationDelay: '2s' }}
        />
        <div
          className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] rounded-full opacity-25 animate-blob"
          style={{ background: 'radial-gradient(circle, hsl(280, 80%, 55%) 0%, transparent 70%)', animationDelay: '4s' }}
        />
      </div>

      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="animate-fade-in mb-8">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
            style={{
              background: 'rgba(139, 92, 246, 0.15)',
              color: 'hsl(250, 89%, 75%)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'hsl(160, 80%, 55%)' }} />
            AI-Powered Support
          </span>
        </div>

        <h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-center mb-6 animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.85) 40%, hsl(250, 89%, 75%) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animationDelay: '0.1s',
            animationFillMode: 'both',
          }}
        >
          Customer support
          <br />
          that never sleeps.
        </h1>

        <p
          className="text-lg md:text-xl max-w-xl text-center mb-10 leading-relaxed animate-fade-in"
          style={{
            color: 'hsl(220, 20%, 60%)',
            animationDelay: '0.2s',
            animationFillMode: 'both',
          }}
        >
          Spur's AI agent handles support instantly — so your customers
          get answers and your team gets time back.
        </p>

        <div
          className="animate-fade-in flex items-center gap-3 text-sm"
          style={{
            color: 'hsl(220, 15%, 50%)',
            animationDelay: '0.35s',
            animationFillMode: 'both',
          }}
        >
          <span className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(190, 95%, 55%)' }}>
              <path d="m6 9 6 6 6-6" />
            </svg>
            Try the chat widget
          </span>
          <span style={{ color: 'hsl(220, 15%, 30%)' }}>•</span>
          <span>Bottom right corner</span>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}

export default App;
