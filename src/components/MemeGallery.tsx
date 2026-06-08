import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function MemeGallery() {
  const memes = useQuery(api.memes.list);
  const removeMeme = useMutation(api.memes.remove);
  const [selectedMeme, setSelectedMeme] = useState<{
    id: Id<"memes">;
    imageBase64: string;
    topText: string;
    bottomText: string;
    prompt: string;
    createdAt: number;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Id<"memes"> | null>(null);

  const handleDelete = async (id: Id<"memes">) => {
    try {
      await removeMeme({ id });
      setDeleteConfirm(null);
      if (selectedMeme?.id === id) {
        setSelectedMeme(null);
      }
    } catch (err) {
      console.error("Failed to delete meme:", err);
    }
  };

  const handleDownload = (imageBase64: string, topText: string) => {
    const link = document.createElement("a");
    link.download = `meme-${topText.slice(0, 10) || "download"}.png`;
    link.href = `data:image/png;base64,${imageBase64}`;
    link.click();
  };

  if (memes === undefined) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-darker border-2 border-yellow/20 animate-pulse"
            >
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl opacity-20">🎴</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (memes.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="text-8xl md:text-9xl mb-6 animate-float">😢</div>
        <h2 className="font-bangers text-3xl md:text-5xl text-yellow mb-4">
          NO MEMES YET
        </h2>
        <p className="font-mono text-white/60 text-sm md:text-base">
          Go to the CREATE tab and make some dank content!
        </p>
        <div className="mt-8">
          <div className="inline-block animate-bounce">
            <span className="text-4xl">👆</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      {/* Header */}
      <div className="text-center mb-8 md:mb-10">
        <h2 className="font-bangers text-3xl md:text-5xl text-pink mb-2">
          YOUR MEME COLLECTION
        </h2>
        <p className="font-mono text-white/50 text-xs md:text-sm">
          {memes.length} masterpiece{memes.length !== 1 ? "s" : ""} created
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {memes.map((meme: { _id: Id<"memes">; imageBase64: string; topText: string; bottomText: string; prompt: string; createdAt: number }, index: number) => (
          <div
            key={meme._id}
            className="group relative aspect-square bg-darker border-2 border-yellow/30 hover:border-yellow transition-all cursor-pointer transform hover:scale-105 hover:z-10"
            style={{
              animationDelay: `${index * 0.05}s`,
              animation: "fadeIn 0.3s ease-out forwards",
            }}
            onClick={() =>
              setSelectedMeme({
                id: meme._id,
                imageBase64: meme.imageBase64,
                topText: meme.topText,
                bottomText: meme.bottomText,
                prompt: meme.prompt,
                createdAt: meme.createdAt,
              })
            }
          >
            <img
              src={`data:image/png;base64,${meme.imageBase64}`}
              alt={meme.prompt}
              className="w-full h-full object-cover"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-dark/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
              <p className="font-archivo text-white text-xs md:text-sm text-center uppercase line-clamp-2">
                {meme.topText || meme.bottomText || "No text"}
              </p>
              <p className="font-mono text-yellow text-xs mt-2">
                Click to view
              </p>
            </div>

            {/* Delete button */}
            {deleteConfirm === meme._id ? (
              <div className="absolute inset-0 bg-pink/90 flex flex-col items-center justify-center gap-2 p-4 z-20">
                <p className="font-mono text-white text-xs text-center">
                  Delete this meme?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(meme._id);
                    }}
                    className="bg-white text-pink font-mono text-xs px-3 py-1 hover:bg-yellow transition-colors"
                  >
                    YES
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(null);
                    }}
                    className="border border-white text-white font-mono text-xs px-3 py-1 hover:bg-white/20 transition-colors"
                  >
                    NO
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirm(meme._id);
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-pink/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink flex items-center justify-center text-sm"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedMeme && (
        <div
          className="fixed inset-0 bg-dark/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMeme(null)}
        >
          <div
            className="max-w-2xl w-full bg-darker border-4 border-yellow p-4 md:p-6 transform"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedMeme(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 bg-pink text-white font-bangers text-xl hover:bg-yellow hover:text-dark transition-colors flex items-center justify-center"
            >
              ×
            </button>

            {/* Image */}
            <div className="relative mb-4">
              <img
                src={`data:image/png;base64,${selectedMeme.imageBase64}`}
                alt="Meme"
                className="w-full max-h-[50vh] object-contain"
              />
              {selectedMeme.topText && (
                <div className="absolute top-2 md:top-4 left-0 right-0 px-2">
                  <p className="meme-text text-xl sm:text-2xl md:text-3xl text-center">
                    {selectedMeme.topText.toUpperCase()}
                  </p>
                </div>
              )}
              {selectedMeme.bottomText && (
                <div className="absolute bottom-2 md:bottom-4 left-0 right-0 px-2">
                  <p className="meme-text text-xl sm:text-2xl md:text-3xl text-center">
                    {selectedMeme.bottomText.toUpperCase()}
                  </p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="border-t border-yellow/30 pt-4 mb-4">
              <p className="font-mono text-xs text-white/50 mb-1">PROMPT:</p>
              <p className="font-mono text-sm text-yellow">{selectedMeme.prompt}</p>
              <p className="font-mono text-xs text-white/30 mt-2">
                Created {new Date(selectedMeme.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  handleDownload(selectedMeme.imageBase64, selectedMeme.topText)
                }
                className="bg-green text-dark font-bangers text-lg py-3 hover:bg-yellow transition-colors"
              >
                ⬇️ DOWNLOAD
              </button>
              <button
                onClick={() => {
                  setDeleteConfirm(selectedMeme.id);
                  setSelectedMeme(null);
                }}
                className="bg-pink text-white font-bangers text-lg py-3 hover:bg-yellow hover:text-dark transition-colors"
              >
                🗑️ DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
