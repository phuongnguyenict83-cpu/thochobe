/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BookOpen, Baby, School, Heart, Dog, Sun, Cloud, Loader2, PenTool } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AgeGroup, PoemResponse } from './types';
import { generatePoem, readPoem, generatePoemImage } from './services/gemini';
import { PoemCard } from './components/PoemCard';
import { BlossomEffect } from './components/BlossomEffect';

const THEMES = [
  { id: 'gia đình', label: 'Gia đình', icon: Heart, color: 'bg-pink-100 text-pink-600' },
  { id: 'trường học', label: 'Trường lớp', icon: School, color: 'bg-blue-100 text-blue-600' },
  { id: 'động vật', label: 'Động vật', icon: Dog, color: 'bg-orange-100 text-orange-600' },
  { id: 'thiên nhiên', label: 'Thiên nhiên', icon: Sun, color: 'bg-yellow-100 text-yellow-600' },
  { id: 'đồ vật', label: 'Đồ vật', icon: BookOpen, color: 'bg-purple-100 text-purple-600' },
  { id: 'thời tiết', label: 'Thời tiết', icon: Cloud, color: 'bg-cyan-100 text-cyan-600' },
];

const AGES: { id: AgeGroup; label: string }[] = [
  { id: '3-4', label: '3-4 tuổi' },
  { id: '4-5', label: '4-5 tuổi' },
  { id: '5-6', label: '5-6 tuổi' },
];

export default function App() {
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0].id);
  const [selectedAge, setSelectedAge] = useState<AgeGroup>('3-4');
  const [customIdea, setCustomIdea] = useState('');
  const [poem, setPoem] = useState<PoemResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [reading, setReading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setPoem(null);
    if (audio) {
      audio.pause();
      setAudio(null);
    }
    
    try {
      const result = await generatePoem(selectedTheme, selectedAge, customIdea);
      setPoem(result);
      
      // Start image generation in parallel or after
      setImageLoading(true);
      const imageUrl = await generatePoemImage(result.content);
      setPoem(prev => prev ? { ...prev, imageUrl: imageUrl || undefined } : null);
      setImageLoading(false);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d6336c', '#ffdeeb', '#fcc2d7']
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setImageLoading(false);
    }
  };

  const handleRead = async () => {
    if (!poem) return;
    if (audio) {
      audio.play();
      return;
    }

    setReading(true);
    try {
      const audioUrl = await readPoem(poem.content);
      if (audioUrl) {
        const newAudio = new Audio(audioUrl);
        newAudio.onended = () => setReading(false);
        setAudio(newAudio);
        newAudio.play();
      } else {
        setReading(false);
      }
    } catch (error) {
      console.error(error);
      setReading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-12 max-w-4xl mx-auto relative">
      <BlossomEffect />
      
      <header className="text-center mb-12 relative z-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block mb-4"
        >
          <div className="bg-pink-600 text-white p-3 rounded-2xl rotate-3 shadow-lg shadow-pink-200">
            <Baby className="w-8 h-8" />
          </div>
        </motion.div>
        <h1 className="text-5xl font-serif font-bold text-pink-800 mb-2 italic">
          Vườn Thơ Bé Ngoan
        </h1>
        <p className="text-pink-600 font-medium">Sáng tạo những vần thơ ngọt ngào cho bé yêu</p>
      </header>

      <main className="space-y-12 relative z-10">
        <section className="bg-white/80 backdrop-blur-md p-8 rounded-[40px] border border-pink-100 shadow-xl shadow-pink-100/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Theme Selection */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-pink-400 mb-4 ml-2">
                  1. Chọn chủ đề
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-3xl transition-all ${
                        selectedTheme === theme.id
                          ? 'bg-pink-600 text-white shadow-lg scale-105'
                          : 'bg-white hover:bg-pink-50 text-pink-600 border border-pink-50'
                      }`}
                    >
                      <theme.icon className={`w-6 h-6 mb-2 ${selectedTheme === theme.id ? 'text-white' : ''}`} />
                      <span className="text-xs font-bold">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-pink-400 mb-4 ml-2 flex items-center gap-2">
                  <PenTool className="w-3 h-3" />
                  3. Ý tưởng của bạn (tùy chọn)
                </label>
                <textarea
                  value={customIdea}
                  onChange={(e) => setCustomIdea(e.target.value)}
                  placeholder="Ví dụ: Bé đi học lần đầu, bé giúp mẹ quét nhà..."
                  className="w-full p-4 rounded-3xl border border-pink-100 bg-white/50 focus:ring-2 focus:ring-pink-200 focus:border-pink-300 outline-none transition-all text-pink-800 placeholder:text-pink-200 min-h-[100px] resize-none"
                />
              </div>
            </div>

            {/* Age Selection */}
            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-pink-400 mb-4 ml-2">
                  2. Chọn lứa tuổi
                </label>
                <div className="flex gap-3">
                  {AGES.map((age) => (
                    <button
                      key={age.id}
                      onClick={() => setSelectedAge(age.id)}
                      className={`flex-1 py-4 rounded-3xl font-bold transition-all ${
                        selectedAge === age.id
                          ? 'bg-pink-600 text-white shadow-lg'
                          : 'bg-white hover:bg-pink-50 text-pink-600 border border-pink-50'
                      }`}
                    >
                      {age.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full mt-8 py-5 bg-pink-600 text-white rounded-[32px] font-bold text-lg flex items-center justify-center gap-3 hover:bg-pink-700 transition-all disabled:opacity-50 shadow-xl shadow-pink-200"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Sparkles className="w-6 h-6" />
                )}
                <span>Tạo bài thơ ngay</span>
              </button>
            </div>
          </div>
        </section>

        <AnimatePresence mode="wait">
          {(poem || loading) && (
            <PoemCard 
              poem={poem} 
              loading={loading} 
              imageLoading={imageLoading}
              onRead={handleRead} 
              reading={reading}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-20 text-center text-pink-400 text-sm font-medium relative z-10">
        <p className="mb-1">© 2026 Vườn Thơ Bé Ngoan • Ươm mầm tâm hồn trẻ thơ</p>
        <p className="text-pink-600 font-bold text-base">GV: Nguyễn Phương</p>
      </footer>
    </div>
  );
}
