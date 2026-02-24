import { GoogleGenAI, Modality } from "@google/genai";
import { AgeGroup, PoemResponse } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generatePoem(theme: string, ageGroup: AgeGroup, customIdea?: string): Promise<PoemResponse> {
  const ai = getAI();
  const prompt = `Hãy sáng tác một bài thơ ngắn cho trẻ mầm non độ tuổi ${ageGroup} tuổi.
Chủ đề: ${theme}.
${customIdea ? `Ý tưởng bổ sung từ người dùng: ${customIdea}` : ""}
Yêu cầu:
- Thơ ngắn (khoảng 4-8 câu).
- Ngôn ngữ đơn giản, trong sáng, dễ nhớ, vần điệu.
- Nội dung giáo dục nhẹ nhàng hoặc vui tươi, rõ ràng, dễ hiểu.
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

export async function generatePoemImage(poemContent: string): Promise<string | null> {
  const ai = getAI();
  const prompt = `Hãy tạo một hình ảnh minh họa dễ thương, phong cách hoạt hình mầm non, màu sắc tươi sáng cho bài thơ sau: ${poemContent}. Hình ảnh nên đơn giản, tập trung vào chủ đề chính của bài thơ, không có chữ.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ text: prompt }],
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image Generation Error:", error);
  }
  return null;
}

export async function readPoem(text: string): Promise<string | null> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Hãy đọc bài thơ sau bằng tiếng Việt với giọng đọc cực kỳ dễ thương, nhẹ nhàng, truyền cảm như cô giáo mầm non đang đọc cho các bé nghe: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore is generally good, but the prompt will guide the tone
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
