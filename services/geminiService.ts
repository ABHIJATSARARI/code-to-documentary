import { GoogleGenAI, Modality, Type, Chat } from "@google/genai";
import { CodeStats } from "../types";

// Initialize Gemini Client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

const STYLES: Record<string, string> = {
  nature: `You are Sir David Attenborough, the legendary nature documentary narrator. 
  You are observing a software codebase in its natural habitat. 
  Your goal is to describe this project's architecture, patterns, specific functions, and "behaviors" as if they were animals, plants, or ecosystems in the wild.
  
  Guidelines:
  - Be dramatic, insightful, and humorous.
  - Use analogies: "The garbage collector stalks its prey...", "The React components huddle together for warmth...", "The spaghetti code tangles like vines...".
  - Specificity: Mention specific file names, classes, or functions found in the provided code to make it authentic.`,

  grumpy: `You are a cynical, burnt-out Senior Software Engineer conducting a harsh code review.
  You've seen it all, and you are unimpressed. You hate over-engineering, magic numbers, and lack of comments.
  
  Guidelines:
  - Tone: Sarcastic, tired, "back in my day", "why didn't they just use a library?".
  - Critique the code: "Look at this nested loop, absolute tragedy", "This function is doing too much", "Who wrote this? GPT-4?".
  - Specificity: Roast specific files or variable names found in the code.
  - End with a sigh or a reluctantly approved "LGTM I guess".`,

  hype: `You are an overly enthusiastic Silicon Valley Tech Evangelist or DevRel at a keynote.
  Everything in this codebase is "game-changing", "blazingly fast", "AI-native", and "disruptive".
  
  Guidelines:
  - Tone: High energy, lots of buzzwords (synergy, velocity, paradigm shift, web3, scale).
  - Exaggerate: A simple helper function is "revolutionary architecture". A config file is "manifesting the future".
  - Specificity: Hype up specific files as if they are the next unicorn product.`,

  noir: `You are a grit-voiced Film Noir Private Investigator.
  The codebase is a rainy, crime-ridden city. The bugs are the criminals. The functions are the suspects.
  
  Guidelines:
  - Tone: Dark, moody, jazzy, speaking in metaphors about shadows and rain.
  - Narrative: "It was a dark and stormy night in App.tsx...", "The variable didn't look right to me, it had a shifting type...".
  - Specificity: Treat files as locations (the dive bar of utils.ts) and errors as mysteries.`,

  fantasy: `You are an Epic Fantasy Dungeon Master or Storyteller.
  The codebase is a magical kingdom or ancient realm. The code structure is the castle.
  
  Guidelines:
  - Tone: Grandiose, archaic (use "Thou", "Lo and behold", "Ancient scroll").
  - Metaphors: Functions are spells, bugs are dragons or goblins, the developer is the wizard or knight.
  - Specificity: "The ancient scroll of package.json reveals the summoned artifacts...", "The guardian middleware blocks the path...".`
};

export const generateDocumentaryScript = async (codebase: string, projectName: string, styleId: string = 'nature'): Promise<{ script: string; stats: CodeStats }> => {
  const ai = getAiClient();
  
  const baseInstruction = STYLES[styleId] || STYLES.nature;
  
  const systemInstruction = `${baseInstruction}
  
  General Constraints:
  - Length: Keep the spoken duration around 1 to 2 minutes (approx 150-300 words).
  - Structure: Intro, Body (observing specific behaviors/code), Conclusion.
  - Do NOT include markdown formatting like headers or bold text in the 'script' field.
  - Do NOT include stage directions like [pauses] or [whispers]. Just the words.
  - **IMPORTANT**: When you mention a specific file name in the narration, wrap it in double brackets like this: [[App.tsx]] or [[utils/helper.js]]. This allows the visualizer to highlight it.
  
  You must also analyze the code to provide three metrics (0-100):
  1. Spaghetti Index (How messy/nested/complex is it? 100 = Italian Restaurant).
  2. Modernity Score (How new are the patterns/libs? 100 = Bleeding Edge).
  3. Tech Debt Level (How much refactoring is needed? 100 = Bankruptcy).`;

  const prompt = `Project Name: ${projectName}
  
  Here is the codebase content:
  ${codebase.slice(0, 500000)} 
  
  Provide the narration script and the analysis stats now.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 1024 },
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            script: { type: Type.STRING },
            spaghettiIndex: { type: Type.NUMBER },
            modernityScore: { type: Type.NUMBER },
            techDebtLevel: { type: Type.NUMBER },
          },
          required: ["script", "spaghettiIndex", "modernityScore", "techDebtLevel"]
        }
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);

    return {
      script: data.script || "The jungle is silent. (Failed to generate script)",
      stats: {
        spaghettiIndex: data.spaghettiIndex || 50,
        modernityScore: data.modernityScore || 50,
        techDebtLevel: data.techDebtLevel || 50
      }
    };
  } catch (error: any) {
    console.error("Script Generation Error:", error);
    throw new Error(`Failed to generate script: ${error.message}`);
  }
};

// Chat Functionality
export const createNarratorChat = (codebase: string, projectName: string, styleId: string): Chat => {
  const ai = getAiClient();
  const baseInstruction = STYLES[styleId] || STYLES.nature;
  
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `${baseInstruction}
      
      You are now in a Q&A session with the developer after presenting the documentary.
      Answer their questions about the codebase you just analyzed.
      Maintain the persona strictly. 
      Keep answers concise (under 3 sentences) unless asked to elaborate.
      
      Project: ${projectName}
      Codebase Context:
      ${codebase.slice(0, 100000)}` // Truncate for chat context safety
    }
  });
};

export interface NarrationConfig {
  voice: string;
}

export const generateNarrationAudio = async (script: string, config: NarrationConfig = { voice: 'Fenrir' }): Promise<AudioBuffer> => {
  const ai = getAiClient();
  
  // Clean script for TTS (Remove visual markers [[ ]])
  const cleanScript = script.replace(/\[\[(.*?)\]\]/g, '$1');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: cleanScript }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { 
              voiceName: config.voice
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data received from Gemini.");
    }

    // Decode audio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      audioContext,
      24000,
      1
    );

    return audioBuffer;

  } catch (error: any) {
    console.error("Audio Generation Error:", error);
    throw new Error(`Failed to generate audio: ${error.message}`);
  }
};

// --- Audio Helper Functions ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}