import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { MemeGenerator } from "./components/MemeGenerator";
import { MemeGallery } from "./components/MemeGallery";
import "./styles.css";

function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid credentials, chief" : "Sign up failed, try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    try {
      await signIn("anonymous");
    } catch (err) {
      setError("Couldn't go anonymous, weird");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 overflow-hidden relative">
      {/* Chaotic background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-8xl md:text-9xl opacity-10 animate-float">🔥</div>
        <div className="absolute top-1/4 right-10 text-7xl md:text-8xl opacity-10 animate-float-delayed">💀</div>
        <div className="absolute bottom-20 left-1/4 text-6xl md:text-7xl opacity-10 animate-float">😂</div>
        <div className="absolute bottom-1/3 right-1/4 text-8xl md:text-9xl opacity-10 animate-float-delayed">🤡</div>
        <div className="absolute top-1/2 left-5 text-5xl md:text-6xl opacity-10 animate-float">💯</div>
        <div className="noise-overlay"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-bangers text-5xl md:text-7xl text-yellow glitch-text mb-2" data-text="MEME MACHINE">
            MEME MACHINE
          </h1>
          <p className="font-mono text-pink text-sm md:text-base tracking-widest uppercase">
            AI-Powered Dankness Generator
          </p>
        </div>

        <div className="bg-darker border-4 border-yellow p-6 md:p-8 transform rotate-1 hover:rotate-0 transition-transform">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-green text-xs uppercase tracking-wider block mb-2">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-dark border-2 border-pink text-white font-mono px-4 py-3 focus:outline-none focus:border-yellow focus:shadow-glow transition-all"
                placeholder="dank@memer.lol"
              />
            </div>
            <div>
              <label className="font-mono text-green text-xs uppercase tracking-wider block mb-2">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full bg-dark border-2 border-pink text-white font-mono px-4 py-3 focus:outline-none focus:border-yellow focus:shadow-glow transition-all"
                placeholder="••••••••"
              />
            </div>
            <input name="flow" type="hidden" value={flow} />

            {error && (
              <div className="bg-pink/20 border border-pink text-pink font-mono text-sm p-3 animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow text-dark font-bangers text-xl py-4 hover:bg-pink hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              {isLoading ? "LOADING..." : flow === "signIn" ? "ENTER THE MEME ZONE" : "JOIN THE MEME ARMY"}
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="w-full border-2 border-green text-green font-mono text-sm py-3 hover:bg-green hover:text-dark transition-colors"
            >
              {flow === "signIn" ? "Create account instead" : "Already have account?"}
            </button>

            <button
              type="button"
              onClick={handleAnonymous}
              disabled={isLoading}
              className="w-full border-2 border-pink/50 text-pink/70 font-mono text-xs py-2 hover:border-pink hover:text-pink transition-colors disabled:opacity-50"
            >
              or continue as guest 👀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainApp() {
  const { signOut } = useAuthActions();
  const [activeTab, setActiveTab] = useState<"create" | "gallery">("create");

  return (
    <div className="min-h-screen bg-dark relative">
      <div className="noise-overlay"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-darker/95 backdrop-blur border-b-4 border-yellow">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <h1 className="font-bangers text-2xl md:text-4xl text-yellow glitch-text-small" data-text="MEME MACHINE">
            MEME MACHINE
          </h1>
          <button
            onClick={() => signOut()}
            className="font-mono text-xs md:text-sm text-pink hover:text-yellow transition-colors border border-pink hover:border-yellow px-3 py-2 md:px-4"
          >
            LOGOUT
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-0">
          <button
            onClick={() => setActiveTab("create")}
            className={`font-bangers text-base md:text-xl px-4 md:px-6 py-2 md:py-3 border-2 border-b-0 transition-all ${
              activeTab === "create"
                ? "bg-yellow text-dark border-yellow"
                : "bg-transparent text-yellow/50 border-yellow/30 hover:border-yellow/60"
            }`}
          >
            CREATE 🔥
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`font-bangers text-base md:text-xl px-4 md:px-6 py-2 md:py-3 border-2 border-b-0 transition-all ${
              activeTab === "gallery"
                ? "bg-pink text-white border-pink"
                : "bg-transparent text-pink/50 border-pink/30 hover:border-pink/60"
            }`}
          >
            MY MEMES 🖼️
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {activeTab === "create" ? <MemeGenerator /> : <MemeGallery />}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 md:py-8 border-t border-yellow/20 mt-12 md:mt-20">
        <p className="text-center font-mono text-xs text-white/30">
          Requested by <span className="text-pink/50">@stringer_kade</span> · Built by <span className="text-green/50">@clonkbot</span>
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="font-bangers text-4xl md:text-6xl text-yellow animate-pulse glitch-text" data-text="LOADING...">
            LOADING...
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-3 h-3 md:w-4 md:h-4 bg-pink rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <MainApp /> : <SignIn />;
}
