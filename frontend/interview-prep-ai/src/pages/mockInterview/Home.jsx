import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  CornerRightDown,
  AlertTriangle,
  Code,
  Server,
  RefreshCw, // Import a new icon for "Start Over"
} from "lucide-react";

// The pcmToWav and base64ToArrayBuffer helper functions remain unchanged.
const pcmToWav = (pcmData, sampleRate) => {
  const numSamples = pcmData.length;
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  view.setUint32(0, 0x52494646, false);
  view.setUint32(4, 36 + dataSize, true);
  view.setUint32(8, 0x57415645, false);
  view.setUint32(12, 0x666d7420, false);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 0x64617461, false);
  view.setUint32(40, dataSize, true);
  for (let i = 0; i < numSamples; i++) {
    view.setInt16(44 + i * 2, pcmData[i], true);
  }
  return new Blob([view], { type: "audio/wav" });
};
const base64ToArrayBuffer = (base64) => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// --- AI Training Prompts (Updated for Multi-Stage Conversation) ---
const getSystemPrompt = (role, history, experienceLevel) => {
  const aiTurnCount = history.filter((h) => h.role === "model").length;

  // AI Turn 0: User said "Hello". AI must introduce itself and ask for the user's intro.
  if (aiTurnCount === 0) {
    return `You are a friendly and professional AI interviewer for a ${role} role. The candidate has just started the interview.
            **Your Task:** Greet the candidate warmly, and then ask them for a brief introduction about themselves and their background.
            **Example:** "Hello there! Thanks for coming in today. To get started, could you please tell me a little bit about yourself?"
            Keep it to a single, concise question.`;
  }

  // AI Turn 1: User has introduced themselves. AI must ask for experience level.
  if (aiTurnCount === 1) {
    return `The candidate has just given their introduction.
            **Your Task:** Acknowledge their introduction with a brief, positive comment (e.g., "Thanks for sharing that."). Then, ask for their specific number of years of professional experience in the ${role} role.
            **Example:** "Thanks for sharing that. And how many years of professional experience do you have as a ${role}?"
            Keep it to a single, concise question.`;
  }

  // AI Turn 2: User has given experience level. AI must start the main interview.
  if (aiTurnCount === 2) {
    return `
      You are an expert technical interviewer for a ${role} role, and the main part of the interview is now starting.
      The candidate has stated they have ${experienceLevel} years of experience. 
      Your tone must be professional, clear, and friendly.

      **CRITICAL INSTRUCTIONS:**
      1.  **Ask only ONE question at a time.**
      2.  **Start the interview gently.** Your first "real" question must be a high-level behavioral or project-based one. Example: "Great, thank you. Let's dive in. Could you walk me through a project you're particularly proud of?"
      3.  **Tailor question difficulty to experience:**
          - **0-2 years (Junior):** Focus on fundamental concepts.
          - **3-5 years (Mid-level):** Ask about practical applications, trade-offs.
          - **5+ years (Senior):** Dive into system design, architecture, scalability.
    `;
  }

  // Subsequent turns: Standard follow-up questions with ending logic.
  const questionsAsked = aiTurnCount - 2;
  return `
      You are a technical interviewer in the middle of an interview. You have already asked ${questionsAsked} technical/behavioral questions.
      The user (candidate) just gave the previous response. Ask the **next single, logical, and concise follow-up question.**
      Remember the candidate has ${experienceLevel} years of experience and adjust your question's difficulty accordingly.
      
      **CRITICAL ENDING INSTRUCTION:**
      - After you have asked a sufficient number of questions (around 3-5 more questions from this point), you MUST conclude the interview.
      - To do this, your response MUST start with the exact tag: **[END_INTERVIEW]**
      - Your closing message should be polite, for example: "[END_INTERVIEW] Thank you for your time. That's all the questions I have. The recruiting team will be in touch with the next steps."

      Do not greet them. Just ask the next question or end the interview.
      `;
};

// Main App Component
const MockInterview = () => {
  // --- STATE MANAGEMENT ---
  const [interviewState, setInterviewState] = useState("role-selection");
  const [interviewRole, setInterviewRole] = useState(null);
  const [experienceLevel, setExperienceLevel] = useState(null);
  const [isUserMuted, setIsUserMuted] = useState(false);
  const [isAIMuted, setIsAIMuted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(
    "Choose your interview path."
  );
  const [userResponse, setUserResponse] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- REFS ---
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  // --- CONSTANTS ---
  const GEMINI_API_KEY = ""; // IMPORTANT: Add your key here

  // --- SPEECH RECOGNITION (Unchanged) ---
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      setError(
        "Your browser doesn't support the Web Speech API. Please try Google Chrome."
      );
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onstart = () => {
      setInterviewState("listening");
      setUserResponse("");
      setError(null);
    };
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      setUserResponse(transcript);
    };
    recognition.onend = () => {
      setInterviewState("thinking");
    };
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setError(
        `Speech recognition error: ${event.error}. Please check microphone permissions.`
      );
      setInterviewState("welcome");
    };
    recognitionRef.current = recognition;
  }, []);

  // --- AI RESPONSE LOGIC (Updated for Multi-Stage Conversation) ---
  useEffect(() => {
    if (interviewState === "thinking" && userResponse.trim()) {
      const updatedHistory = [
        ...chatHistory,
        { role: "user", parts: [{ text: userResponse }] },
      ];
      setChatHistory(updatedHistory);

      const aiTurnCount = updatedHistory.filter(
        (h) => h.role === "model"
      ).length;

      // This is the turn where we capture the experience level from the user's response.
      if (aiTurnCount === 2) {
        const expMatch = userResponse.match(/\d+/);
        const exp = expMatch ? parseInt(expMatch[0], 10) : 1;
        setExperienceLevel(exp);
        getAINextQuestion(updatedHistory, exp); // Pass experience directly
      } else {
        // For all other turns, pass the current experience level (which may be null initially).
        getAINextQuestion(updatedHistory, experienceLevel);
      }
    } else if (interviewState === "thinking" && !userResponse.trim()) {
      setInterviewState("welcome");
    }
  }, [interviewState, userResponse]);

  // --- HELPER FUNCTIONS (Updated) ---
  const handleRoleSelect = (role) => {
    setInterviewRole(role);
    setCurrentQuestion(
      `You've selected the ${role} path. When you're ready, click the mic and say "Hello" to begin.`
    );
    setInterviewState("welcome");
  };

  const toggleListening = () => {
    if (interviewState === "listening") {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const generateText = async (history, exp) => {
    setIsLoading(true);
    setError(null);
    if (!GEMINI_API_KEY) {
      setError(
        "Gemini API Key is not set. Please add your key to the component."
      );
      setIsLoading(false);
      return null;
    }
    const model = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    const systemInstruction = getSystemPrompt(interviewRole, history, exp);
    const payload = {
      contents: [
        { role: "user", parts: [{ text: systemInstruction }] },
        ...history,
      ],
      generationConfig: { temperature: 0.7, maxOutputTokens: 250 },
    };
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(
          `API call failed: ${response.status}. ${
            errorBody?.error?.message || "Unknown error"
          }`
        );
      }
      const result = await response.json();
      return (
        result.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I'm sorry, I couldn't think of a response."
      );
    } catch (e) {
      console.error("Gemini API Error:", e);
      setError(`Text generation failed: ${e.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateAudio = async (textToSpeak) => {
    setIsLoading(true);
    setError(null);
    const model = "gemini-2.5-flash-preview-tts";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
      contents: [
        {
          parts: [
            { text: `Say in a clear, professional voice: ${textToSpeak}` },
          ],
        },
      ],
      generationConfig: { responseModalities: ["AUDIO"] },
      model: "gemini-2.5-flash-preview-tts",
    };
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorBody = await response.json();
        if (response.status === 429) {
          throw new Error(
            "You've exceeded the daily free limit for AI voice generation. Mute the AI to continue."
          );
        }
        throw new Error(
          `TTS API call failed: ${response.status}. ${
            errorBody?.error?.message || "Unknown error"
          }`
        );
      }
      const result = await response.json();
      const part = result?.candidates?.[0]?.content?.parts?.[0];
      const audioData = part?.inlineData?.data;
      const mimeType = part?.inlineData?.mimeType;
      if (audioData && mimeType?.startsWith("audio/L16")) {
        const sampleRateMatch = mimeType.match(/rate=(\d+)/);
        const sampleRate = sampleRateMatch
          ? parseInt(sampleRateMatch[1], 10)
          : 24000;
        const pcmBuffer = base64ToArrayBuffer(audioData);
        const pcmData = new Int16Array(pcmBuffer);
        const wavBlob = pcmToWav(pcmData, sampleRate);
        const audioUrl = URL.createObjectURL(wavBlob);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          await audioRef.current.play();
        }
      } else {
        throw new Error("Invalid audio data received from API.");
      }
    } catch (e) {
      console.error("Gemini TTS Error:", e);
      setError(`Voice generation failed: ${e.message}`);
      setInterviewState("welcome");
    } finally {
      setIsLoading(false);
    }
  };

  const getAINextQuestion = async (history, exp) => {
    const aiResponseText = await generateText(history, exp);
    if (!aiResponseText || !aiResponseText.trim()) {
      setInterviewState("welcome");
      return;
    }

    if (aiResponseText.startsWith("[END_INTERVIEW]")) {
      const closingMessage = aiResponseText
        .replace("[END_INTERVIEW]", "")
        .trim();
      setChatHistory((prev) => [
        ...prev,
        { role: "model", parts: [{ text: closingMessage }] },
      ]);
      setCurrentQuestion(closingMessage);
      if (isAIMuted) {
        setInterviewState("finished");
      } else {
        setInterviewState("speaking");
        audioRef.current.onended = () => setInterviewState("finished");
        await generateAudio(closingMessage);
      }
    } else {
      setChatHistory((prev) => [
        ...prev,
        { role: "model", parts: [{ text: aiResponseText }] },
      ]);
      setCurrentQuestion(aiResponseText);
      if (isAIMuted) {
        setInterviewState("welcome");
      } else {
        setInterviewState("speaking");
        audioRef.current.onended = () => setInterviewState("welcome");
        await generateAudio(aiResponseText);
      }
    }
  };

  const endInterview = () => {
    recognitionRef.current?.stop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setInterviewRole(null);
    setExperienceLevel(null);
    setChatHistory([]);
    setUserResponse("");
    setError(null);
    setInterviewState("role-selection");
    setCurrentQuestion("Choose your interview path.");
  };

  // --- RENDER LOGIC ---
  if (interviewState === "role-selection") {
    return (
      <div className="bg-[#121212] text-white font-sans min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">AI Mock Interview</h1>
          <p className="text-xl text-gray-400 mb-12">{currentQuestion}</p>
          <div className="flex flex-col md:flex-row gap-6">
            <button
              onClick={() => handleRoleSelect("Frontend Developer")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-6 px-10 rounded-xl transition-all duration-300 shadow-lg text-2xl flex items-center justify-center gap-4"
            >
              <Code size={32} /> Frontend
            </button>
            <button
              onClick={() => handleRoleSelect("Backend Developer")}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-6 px-10 rounded-xl transition-all duration-300 shadow-lg text-2xl flex items-center justify-center gap-4"
            >
              <Server size={32} /> Backend
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] text-white font-sans min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
          <div className="bg-[#1E1E1E] border border-gray-700 rounded-2xl aspect-video flex flex-col items-center justify-center p-6 shadow-lg relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center mb-4 ring-2 ring-purple-500/50">
              {interviewState === "speaking" ||
              (isLoading && interviewState === "thinking") ? (
                <Volume2 size={48} className="text-white animate-pulse" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  {" "}
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>{" "}
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>{" "}
                  <line x1="12" y1="19" x2="12" y2="22"></line>{" "}
                </svg>
              )}
            </div>
            <h2 className="text-xl font-semibold">AI Interviewer</h2>
            <span className="text-sm text-gray-400">
              {interviewRole}
              {experienceLevel && ` | ${experienceLevel} yrs exp`}
            </span>
            <button
              onClick={() => setIsAIMuted(!isAIMuted)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              title={isAIMuted ? "Unmute AI Voice" : "Mute AI Voice"}
            >
              {isAIMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
          <div className="bg-[#1E1E1E] border border-gray-700 rounded-2xl aspect-video flex flex-col items-center justify-center p-6 shadow-lg relative">
            <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center mb-4 overflow-hidden">
              <img
                src="https://placehold.co/100x100/4A5568/FFFFFF?text=You"
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-semibold">You</h2>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <button
                onClick={toggleListening}
                disabled={
                  isUserMuted ||
                  !["welcome", "listening"].includes(interviewState)
                }
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  interviewState === "listening"
                    ? "bg-red-600 animate-pulse"
                    : "bg-blue-600 hover:bg-blue-500"
                } disabled:bg-gray-500 disabled:cursor-not-allowed`}
              >
                <Mic size={32} />
              </button>
            </div>
            <button
              onClick={() => setIsUserMuted(!isUserMuted)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              {isUserMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          </div>
        </div>
        <div className="bg-[#1E1E1E] border border-gray-700 rounded-2xl p-6 min-h-[120px] flex items-center justify-center text-center shadow-lg relative">
          <p className="text-lg text-gray-300 italic">
            {interviewState === "listening" && userResponse
              ? userResponse
              : currentQuestion}
          </p>
          {isLoading && (
            <div className="absolute bottom-2 right-2 w-4 h-4 border-2 border-dashed rounded-full animate-spin border-purple-400"></div>
          )}
        </div>
        {userResponse && interviewState === "thinking" && (
          <div className="mt-4 text-center text-sm text-green-400 flex items-center justify-center gap-2">
            <CornerRightDown size={16} />
            <span>I heard: "{userResponse}"</span>
          </div>
        )}
        {error && (
          <div className="mt-4 text-center text-red-400 bg-red-900/50 border border-red-700 rounded-xl p-4 flex items-center justify-center gap-3">
            <AlertTriangle size={20} />
            <p>
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}
        <div className="mt-8 flex justify-center">
          <button
            onClick={endInterview}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg flex items-center gap-2"
          >
            {interviewState === "finished" ? (
              <>
                {" "}
                <RefreshCw size={18} /> Start Over{" "}
              </>
            ) : (
              "End Interview"
            )}
          </button>
        </div>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default MockInterview;
