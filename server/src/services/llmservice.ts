// services/llmService.ts
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
export const getRemedyFromLLM = async (keywords: string[]) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = "gemini-2.0-flash"; 
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

  try {
    const response = await axios.post(
      `${endpoint}?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Output only a comma separated collection of 1 or more symptoms based on my input. Output as many symptoms associated with the user input as possible.: ${keywords.join(", ")}.`
              }
            ]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    const content = response.data?.candidates?.[0]?.content;
    const result = content?.parts?.[0]?.text || "No response generated.";
    return result;

  } catch (error: any) {
    console.error("Error using Gemini API:", {
      message: error.message,
      data: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};