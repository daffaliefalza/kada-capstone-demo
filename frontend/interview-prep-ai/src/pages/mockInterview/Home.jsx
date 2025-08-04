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
} from "lucide-react";

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

// --- AI Training Prompts (Unchanged) ---
const getSystemPrompt = (role, history) => {
  if (history.length === 0) {
    const basePrompt = `
            You are an expert technical interviewer at a top tech company, conducting an interview for a senior ${role} role. 
            Your tone must be professional, clear, and friendly. The user is the job candidate.
            
            **CRITICAL INSTRUCTIONS:**
            1.  **Ask only ONE question at a time.** Do not list multiple questions.
            2.  Wait for the candidate's response before asking the next question.
            3.  Keep your questions concise and focused on a single concept.
            4.  Your first question, and only your first question, must be: "To start, could you tell me about your experience as a ${role}?"
            5.  For all subsequent questions, you will act as a follow-up interviewer.
        `;
    const frontendTopics = `
            **Core Interview Focus Areas (For the entire interview, not one turn):**
            - JavaScript Fundamentals (ES6+, async, closures, 'this', event loop).
            - Advanced React Concepts (Hooks, state management, performance).
            - HTML/CSS and Web Standards (Accessibility, responsive design, layouts).
            - Web Performance and Tooling (Core Web Vitals, Vite/Webpack).
            - Behavioral questions about teamwork and problem-solving.
        `;
    const backendTopics = `
            **Core Interview Focus Areas (For the entire interview, not one turn):**
            - Node.js Internals (Event-driven architecture, streams, performance).
            - API Design and Security (REST vs. GraphQL, authentication like JWT).
            - Databases (SQL vs. NoSQL, indexing, transactions).
            - System Design and Architecture (Microservices, caching, scalability).
            - DevOps and Cloud Concepts (Docker, CI/CD).
            - Behavioral questions about system design choices and production issues.
        `;
    return `${basePrompt} ${
      role === "Frontend Developer" ? frontendTopics : backendTopics
    }`;
  }
  return `
        You are a technical interviewer. The user (candidate) just gave the previous response. 
        Based on the conversation history and their last answer, ask the **next single, logical, and concise follow-up question.**
        Do not greet them or add any conversational filler. Just ask the next question.
    `;
};

// Main App Component
const MockInterview = () => {
  // --- STATE MANAGEMENT ---
  const [interviewState, setInterviewState] = useState("role-selection");
  const [interviewRole, setInterviewRole] = useState(null);
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

  // --- SPEECH RECOGNITION (USER INPUT) ---
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      setError(
        "Your browser doesn't support the Web Speech API. Please try Google Chrome."
      );
      return;
    }
    const recognition = new window.webkitSpeechRecognition();

    // ** UPDATED for patience: a key change to allow pauses **
    recognition.continuous = true; // Keeps listening through pauses.
    recognition.interimResults = true; // Shows live transcript.
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setInterviewState("listening");
      setUserResponse(""); // Clear previous response
      setError(null);
    };

    recognition.onresult = (event) => {
      // Combine all transcript parts into one string.
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      setUserResponse(transcript);
    };

    // This now only fires when recognition.stop() is called by the user.
    recognition.onend = () => {
      setInterviewState("thinking");
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setError(
        `Speech recognition error: ${event.error}. Please check your microphone permissions.`
      );
      setInterviewState("welcome");
    };
    recognitionRef.current = recognition;
  }, []);

  // --- AI RESPONSE LOGIC ---
  useEffect(() => {
    // This logic is now more robust. It only fires when the user is done and has said something.
    if (interviewState === "thinking" && userResponse.trim()) {
      const updatedHistory = [
        ...chatHistory,
        { role: "user", parts: [{ text: userResponse }] },
      ];
      setChatHistory(updatedHistory);
      getAINextQuestion(updatedHistory);
    } else if (interviewState === "thinking" && !userResponse.trim()) {
      // If user stops without saying anything, go back to welcome state.
      setInterviewState("welcome");
    }
  }, [interviewState, userResponse]);

  // --- HELPER FUNCTIONS ---
  const handleRoleSelect = (role) => {
    setInterviewRole(role);
    setInterviewState("welcome");
    const welcomeMessage = `You've selected the ${role} path. When you're ready, click the microphone to begin the interview.`;
    setCurrentQuestion(welcomeMessage);
  };

  // This function now starts listening OR stops listening, giving user full control.
  const toggleListening = () => {
    if (interviewState === "listening") {
      recognitionRef.current?.stop(); // User is done talking.
    } else {
      recognitionRef.current?.start(); // User wants to start talking.
    }
  };

  const generateText = async (history) => {
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
    const systemInstruction = getSystemPrompt(interviewRole, history);
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
        console.error("API Error Body:", errorBody);
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
            {
              text: `Say in a clear, professional, and friendly interviewer voice: ${textToSpeak}`,
            },
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
        console.error("TTS API Error Body:", errorBody);
        if (response.status === 429) {
          throw new Error(
            "You've exceeded the daily free limit for AI voice generation. Please mute the AI to continue with a text-only interview or try again tomorrow."
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
          audioRef.current.onended = () => setInterviewState("welcome");
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

  const getAINextQuestion = async (history) => {
    const aiResponseText = await generateText(history);
    if (!aiResponseText || !aiResponseText.trim()) {
      setInterviewState("welcome");
      return;
    }
    setChatHistory((prev) => [
      ...prev,
      { role: "model", parts: [{ text: aiResponseText }] },
    ]);
    setCurrentQuestion(aiResponseText);
    if (isAIMuted) {
      setInterviewState("welcome");
    } else {
      setInterviewState("speaking");
      await generateAudio(aiResponseText);
    }
  };

  const endInterview = () => {
    recognitionRef.current?.stop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setInterviewRole(null);
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
        {/* UI Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* AI Panel */}
          <div className="bg-[#1E1E1E] border border-gray-700 rounded-2xl aspect-video flex flex-col items-center justify-center p-6 shadow-lg transition-all duration-300 relative">
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
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="22"></line>
                </svg>
              )}
            </div>
            <h2 className="text-xl font-semibold">AI Interviewer</h2>
            <span className="text-sm text-gray-400">{interviewRole}</span>
            <button
              onClick={() => setIsAIMuted(!isAIMuted)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors group"
              title={
                isAIMuted
                  ? "Unmute AI Voice (Uses Quota)"
                  : "Mute AI Voice (Saves Quota)"
              }
            >
              {isAIMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
          {/* User Panel */}
          <div className="bg-[#1E1E1E] border border-gray-700 rounded-2xl aspect-video flex flex-col items-center justify-center p-6 shadow-lg relative">
            <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center mb-4 overflow-hidden">
              <img
                src="https://placehold.co/100x100/4A5568/FFFFFF?text=You"
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-semibold">You</h2>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <button
                onClick={toggleListening}
                disabled={
                  isUserMuted ||
                  !["welcome", "listening", "finished"].includes(interviewState)
                }
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  interviewState === "listening"
                    ? "bg-red-600"
                    : "bg-blue-600 hover:bg-blue-500"
                } disabled:bg-gray-500 disabled:cursor-not-allowed`}
              >
                {isUserMuted ? (
                  <MicOff size={32} className="text-gray-400" />
                ) : interviewState === "listening" ? (
                  <Mic size={32} className="text-red-500 animate-pulse" />
                ) : (
                  <Mic size={32} className="text-gray-200" />
                )}
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
        {/* Question/Transcript Box */}
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
        {/* User Response Preview */}
        {userResponse && interviewState === "thinking" && (
          <div className="mt-4 text-center text-sm text-green-400 flex items-center justify-center gap-2">
            <CornerRightDown size={16} />
            <span>I heard: "{userResponse}"</span>
          </div>
        )}
        {/* Error Display */}
        {error && (
          <div className="mt-4 text-center text-red-400 bg-red-900/50 border border-red-700 rounded-xl p-4 flex items-center justify-center gap-3">
            <AlertTriangle size={20} />
            <p>
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}
        {/* Controls */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={endInterview}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg"
          >
            End Interview
          </button>
        </div>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default MockInterview;
