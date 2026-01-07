import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

/**
 * Converts a File object to a Base64 string.
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data-URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Analyzes the image to extract text and describe content using Gemini.
 */
export const analyzeImage = async (file: File): Promise<AnalysisResult> => {
  try {
    const base64Data = await fileToBase64(file);
    
    // We use gemini-3-flash-preview as it supports multimodal inputs (images) 
    // and Structured Outputs (JSON Schema) which is crucial for separating text from description.
    const modelId = "gemini-3-flash-preview"; 

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: `Bạn là một trợ lý AI chuyên nghiệp chuyên phân tích tài liệu và hình ảnh. 
            Nhiệm vụ của bạn là:
            1. Trích xuất CHÍNH XÁC toàn bộ văn bản có trong hình ảnh (OCR). Giữ nguyên định dạng xuống dòng nếu có thể.
            2. Viết một mô tả chi tiết, sâu sắc về nội dung hình ảnh, bối cảnh, và các đối tượng xuất hiện trong ảnh bằng tiếng Việt.
            
            Hãy trả về kết quả dưới dạng JSON.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedText: {
              type: Type.STRING,
              description: "Toàn bộ văn bản được trích xuất từ hình ảnh."
            },
            description: {
              type: Type.STRING,
              description: "Mô tả chi tiết nội dung, ý nghĩa và bối cảnh của hình ảnh."
            }
          },
          required: ["extractedText", "description"]
        }
      }
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("Không nhận được phản hồi từ Gemini.");
    }

    const jsonResult = JSON.parse(textResponse) as AnalysisResult;
    return jsonResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Đã xảy ra lỗi khi phân tích hình ảnh. Vui lòng thử lại.");
  }
};