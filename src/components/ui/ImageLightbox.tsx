"use client";

import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex = 0, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!images.length) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[85vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-[-3rem] top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentIndex((i) => (i + 1) % images.length)}
              className="absolute right-[-3rem] top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <img
          src={images[currentIndex]}
          alt={`Screenshot ${currentIndex + 1}`}
          className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
        />

        {images.length > 1 && (
          <div className="absolute bottom-[-2rem] left-1/2 -translate-x-1/2 flex items-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? "bg-white" : "bg-white/30"}`}
              />
            ))}
            <span className="text-xs text-gray-400 ml-2">{currentIndex + 1}/{images.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}