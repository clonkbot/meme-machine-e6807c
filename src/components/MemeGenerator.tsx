import { useState, useRef } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const MEME_SUGGESTIONS = [
  "surprised cat staring at camera",
  "confused dog with question marks",
  "galaxy brain expanding",
  "drake pointing meme style",
  "distracted boyfriend looking back",
  "stonks guy going up",
  "crying wojak face",
  "chad gigachad portrait",
  "skeleton waiting forever",
  "this is fine dog in fire",
];

export function MemeGenerator() {
  const [prompt, setPrompt] = useState("");
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGettingIdea, setIsGettingIdea] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateImage = useAction(api.ai.generateImage);
  const chat = useAction(api.ai.chat);
  const saveMeme = useMutation(api.memes.create);
  const saveIdea = useMutation(api.memes.saveIdea);
  const ideas = useQuery(api.memes.listIdeas);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Yo, enter a prompt first!");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const memePrompt = `Create a simple, funny meme template image for: ${prompt}. Make it bold, clear, and suitable for adding text overlay. No text in the image. Cartoon or digital art style with high contrast.`;
      const image = await generateImage({ prompt: memePrompt });
      if (image) {
        setGeneratedImage(image);
        setSuccess("Image generated! Now add your text 🔥");
      } else {
        setError("Failed to generate image. Try a different prompt, bestie.");
      }
    } catch (err) {
      setError("AI machine broke. Try again! 💀");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetIdea = async () => {
    setIsGettingIdea(true);
    setError(null);

    try {
      const response = await chat({
        messages: [
          {
            role: "user",
            content: "Generate a random viral meme idea. Give me 3 things in this exact format, nothing else:\nIMAGE: [describe the image]\nTOP: [top text, short and punchy]\nBOTTOM: [bottom text, the punchline]",
          },
        ],
        systemPrompt:
          "You are a gen-z meme lord who creates the dankest, most viral memes. Be funny, edgy (but not offensive), and use internet humor. Keep text SHORT - max 5 words each. Be absurd and random.",
      });

      // Parse the response
      const imageMatch = response.match(/IMAGE:\s*(.+)/i);
      const topMatch = response.match(/TOP:\s*(.+)/i);
      const bottomMatch = response.match(/BOTTOM:\s*(.+)/i);

      if (imageMatch) setPrompt(imageMatch[1].trim());
      if (topMatch) setTopText(topMatch[1].trim());
      if (bottomMatch) setBottomText(bottomMatch[1].trim());

      // Save the idea
      if (imageMatch && topMatch && bottomMatch) {
        await saveIdea({
          idea: imageMatch[1].trim(),
          topText: topMatch[1].trim(),
          bottomText: bottomMatch[1].trim(),
        });
      }
    } catch (err) {
      setError("Brain too smooth rn, try again");
    } finally {
      setIsGettingIdea(false);
    }
  };

  const handleSaveMeme = async () => {
    if (!generatedImage) {
      setError("Generate an image first!");
      return;
    }

    try {
      // Create the final meme with text overlay
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Configure text style
        const fontSize = Math.max(canvas.width / 12, 24);
        ctx.font = `bold ${fontSize}px 'Archivo Black', Impact, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = fontSize / 15;

        // Draw top text
        if (topText) {
          const y = fontSize + 10;
          ctx.strokeText(topText.toUpperCase(), canvas.width / 2, y);
          ctx.fillText(topText.toUpperCase(), canvas.width / 2, y);
        }

        // Draw bottom text
        if (bottomText) {
          const y = canvas.height - 20;
          ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, y);
          ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, y);
        }

        // Get final image
        const finalImage = canvas.toDataURL("image/png").split(",")[1];

        await saveMeme({
          topText,
          bottomText,
          imageBase64: finalImage,
          prompt,
        });

        setSuccess("MEME SAVED! 🎉 Check your gallery!");
      };
      img.src = `data:image/png;base64,${generatedImage}`;
    } catch (err) {
      setError("Couldn't save meme. Sadge.");
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !generatedImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const fontSize = Math.max(canvas.width / 12, 24);
      ctx.font = `bold ${fontSize}px 'Archivo Black', Impact, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = fontSize / 15;

      if (topText) {
        const y = fontSize + 10;
        ctx.strokeText(topText.toUpperCase(), canvas.width / 2, y);
        ctx.fillText(topText.toUpperCase(), canvas.width / 2, y);
      }

      if (bottomText) {
        const y = canvas.height - 20;
        ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, y);
        ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, y);
      }

      const link = document.createElement("a");
      link.download = "meme.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = `data:image/png;base64,${generatedImage}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      <canvas ref={canvasRef} className="hidden" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          {/* AI Idea Generator */}
          <div className="bg-darker border-4 border-pink p-4 md:p-6 transform -rotate-1 hover:rotate-0 transition-transform">
            <h2 className="font-bangers text-2xl md:text-3xl text-pink mb-4">
              🧠 AI BRAIN MODE
            </h2>
            <p className="font-mono text-white/60 text-xs md:text-sm mb-4">
              Let the AI cook up a dank meme idea for you
            </p>
            <button
              onClick={handleGetIdea}
              disabled={isGettingIdea}
              className="w-full bg-pink text-white font-bangers text-lg md:text-xl py-3 md:py-4 hover:bg-yellow hover:text-dark transition-all disabled:opacity-50 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              {isGettingIdea ? (
                <>
                  <span className="animate-spin">🧠</span> THINKING...
                </>
              ) : (
                <>GENERATE IDEA 🎲</>
              )}
            </button>

            {ideas && ideas.length > 0 && (
              <div className="mt-4 pt-4 border-t border-pink/30">
                <p className="font-mono text-xs text-pink/60 mb-2">Recent ideas:</p>
                <div className="flex flex-wrap gap-2">
                  {ideas.slice(0, 3).map((idea: { _id: string; idea: string; topText: string; bottomText: string }) => (
                    <button
                      key={idea._id}
                      onClick={() => {
                        setPrompt(idea.idea);
                        setTopText(idea.topText);
                        setBottomText(idea.bottomText);
                      }}
                      className="text-xs font-mono bg-pink/20 text-pink px-2 py-1 hover:bg-pink/40 transition-colors truncate max-w-32"
                    >
                      {idea.idea.slice(0, 20)}...
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Image Prompt */}
          <div className="bg-darker border-4 border-yellow p-4 md:p-6 transform rotate-1 hover:rotate-0 transition-transform">
            <h2 className="font-bangers text-2xl md:text-3xl text-yellow mb-4">
              📸 IMAGE PROMPT
            </h2>

            <div className="mb-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your meme image... (e.g., 'shocked pikachu face')"
                className="w-full h-24 bg-dark border-2 border-yellow/50 text-white font-mono text-sm p-3 focus:outline-none focus:border-yellow resize-none"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {MEME_SUGGESTIONS.slice(0, 5).map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(suggestion)}
                  className="text-xs font-mono bg-yellow/20 text-yellow px-2 py-1 hover:bg-yellow/40 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-yellow text-dark font-bangers text-lg md:text-xl py-3 md:py-4 hover:bg-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">🎨</span> GENERATING...
                </span>
              ) : (
                "GENERATE IMAGE 🔥"
              )}
            </button>
          </div>

          {/* Text Overlay */}
          <div className="bg-darker border-4 border-green p-4 md:p-6 transform -rotate-1 hover:rotate-0 transition-transform">
            <h2 className="font-bangers text-2xl md:text-3xl text-green mb-4">
              ✍️ MEME TEXT
            </h2>

            <div className="space-y-4">
              <div>
                <label className="font-mono text-xs text-green/60 uppercase tracking-wider block mb-2">
                  Top Text
                </label>
                <input
                  type="text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="WHEN YOU..."
                  className="w-full bg-dark border-2 border-green/50 text-white font-archivo text-sm md:text-base px-4 py-3 focus:outline-none focus:border-green uppercase"
                />
              </div>
              <div>
                <label className="font-mono text-xs text-green/60 uppercase tracking-wider block mb-2">
                  Bottom Text
                </label>
                <input
                  type="text"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="...BUT THEN"
                  className="w-full bg-dark border-2 border-green/50 text-white font-archivo text-sm md:text-base px-4 py-3 focus:outline-none focus:border-green uppercase"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          {error && (
            <div className="bg-pink/20 border-2 border-pink text-pink font-mono text-sm p-4 animate-shake">
              ❌ {error}
            </div>
          )}
          {success && (
            <div className="bg-green/20 border-2 border-green text-green font-mono text-sm p-4">
              ✅ {success}
            </div>
          )}
        </div>

        {/* Right Column - Preview */}
        <div className="lg:sticky lg:top-32 h-fit">
          <div className="bg-darker border-4 border-yellow p-4 md:p-6 animate-rainbow-border">
            <h2 className="font-bangers text-2xl md:text-3xl text-yellow mb-4 text-center">
              👁️ PREVIEW
            </h2>

            <div className="relative aspect-square bg-dark border-2 border-white/10 flex items-center justify-center overflow-hidden">
              {isGenerating ? (
                <div className="text-center p-4">
                  <div className="text-6xl md:text-8xl mb-4 animate-pulse-glow inline-block">
                    🎨
                  </div>
                  <p className="font-bangers text-xl md:text-2xl text-pink">
                    AI IS COOKING...
                  </p>
                  <div className="mt-4 flex justify-center gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 md:w-3 md:h-3 bg-yellow rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              ) : generatedImage ? (
                <div className="relative w-full h-full meme-preview">
                  <img
                    src={`data:image/png;base64,${generatedImage}`}
                    alt="Generated meme"
                    className="w-full h-full object-contain"
                  />
                  {/* Text Overlays */}
                  {topText && (
                    <div className="absolute top-2 md:top-4 left-0 right-0 px-2">
                      <p className="meme-text text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                        {topText.toUpperCase()}
                      </p>
                    </div>
                  )}
                  {bottomText && (
                    <div className="absolute bottom-2 md:bottom-4 left-0 right-0 px-2">
                      <p className="meme-text text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                        {bottomText.toUpperCase()}
                      </p>
                    </div>
                  )}
                  <div className="scanlines"></div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <div className="text-6xl md:text-8xl mb-4 opacity-30">🖼️</div>
                  <p className="font-mono text-white/40 text-sm">
                    Your meme will appear here
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {generatedImage && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={handleSaveMeme}
                  className="bg-green text-dark font-bangers text-base md:text-lg py-3 hover:bg-yellow transition-colors transform hover:scale-105 active:scale-95"
                >
                  💾 SAVE
                </button>
                <button
                  onClick={handleDownload}
                  className="bg-pink text-white font-bangers text-base md:text-lg py-3 hover:bg-yellow hover:text-dark transition-colors transform hover:scale-105 active:scale-95"
                >
                  ⬇️ DOWNLOAD
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
