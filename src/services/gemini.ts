import { GoogleGenAI, Modality } from "@google/genai";
import { AgeGroup, PoemResponse } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generatePoem(theme: string, ageGroup: AgeGroup): Promise<PoemResponse> {
  const ai = getAI();
  const prompt = `Hãy sáng tác một bài thơ ngắn cho trẻ mầm non độ tuổi ${ageGroup} tuổi.
Chủ đề: ${theme}.
Yêu cầu:
- Thơ ngắn (khoảng 4-8 câu).
- Ngôn ngữ đơn giản, trong sáng, dễ nhớ, vần điệu.
- Nội dung giáo dục nhẹ nhàng hoặc vui tươi.
- Trả về định dạng JSON với cấu trúc: {"title": "Tên bài thơ", "content": "Nội dung bài thơ (dùng xuống dòng \\n)"}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(response.text || "{}") as PoemResponse;
  } catch (e) {
    console.error("Failed to parse poem", e);
    return { title: "Bài thơ của bé", content: response.text || "" };
  }
}

export async function readPoem(text: string): Promise<string | null> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Đọc diễn cảm bài thơ sau cho trẻ em nghe: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore sounds gentle
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/wav;base64,${base64Audio}`;
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
  return null;
}
