import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Download, Volume2, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { PoemResponse } from '../types';

interface PoemCardProps {
  poem: PoemResponse | null;
  loading: boolean;
  imageLoading: boolean;
  onRead: () => void;
  reading: boolean;
}

export const PoemCard: React.FC<PoemCardProps> = ({ poem, loading, imageLoading, onRead, reading }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (cardRef.current === null) return;
    
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, backgroundColor: '#fff0f6' });
      const link = document.createElement('a');
      link.download = `${poem?.title || 'bai-tho-cua-be'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-lg mx-auto h-64 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-pink-600 opacity-50" />
        <p className="text-lg font-medium italic text-pink-800">Đang dệt vần thơ cho bé...</p>
      </div>
    );
  }

  if (!poem) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      <div 
        ref={cardRef}
        className="poem-card p-8 relative overflow-hidden border border-pink-100 flex flex-col gap-6"
      >
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-100 rounded-full opacity-50 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-50 rounded-full opacity-50 blur-2xl" />
        
        <div className="relative z-10 text-center">
          <h2 className="font-serif text-3xl font-bold mb-4 text-pink-900 italic">
            {poem.title}
          </h2>
          
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
            {/* Image Section */}
            <div className="w-full md:w-1/2 aspect-square rounded-2xl overflow-hidden bg-pink-50/50 border border-pink-100 flex items-center justify-center relative">
              {imageLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-pink-300" />
                  <span className="text-xs text-pink-300 italic">Đang vẽ tranh...</span>
                </div>
              ) : poem.imageUrl ? (
                <img 
                  src={poem.imageUrl} 
                  alt={poem.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-pink-200 text-xs italic">Không có ảnh minh họa</div>
              )}
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 whitespace-pre-line text-lg leading-relaxed text-pink-800 font-medium text-center md:text-left">
              {poem.content}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={onRead}
          disabled={reading}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50"
        >
          {reading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
          <span>Nghe đọc</span>
        </button>
        <button
          onClick={handleDownload}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          <span>Tải ảnh thơ</span>
        </button>
      </div>
    </motion.div>
  );
};
