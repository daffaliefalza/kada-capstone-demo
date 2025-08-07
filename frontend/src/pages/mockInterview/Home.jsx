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
  RefreshCw,
  FileText,
  Star,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import Navbar from "../../components/Layouts/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";

// Helper functions (pcmToWav, base64ToArrayBuffer) remain unchanged.
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


// Prompts (getSystemPrompt, getSummaryPrompt) remain unchanged.
const getSystemPrompt = (role, history, experienceLevel) => {
  const aiTurnCount = history.filter((h) => h.role === "model").length;

  if (aiTurnCount === 0) {
    return `You are a friendly and professional AI interviewer for a ${role} role. The candidate has just started the interview.
            **Your Task:** Greet the candidate warmly, and then ask them for a brief introduction about themselves and their background.
            **Example:** "Hello there! Thanks for coming in today. To get started, could you please tell me a little bit about yourself?"
            Keep it to a single, concise question.`;
  }

  if (aiTurnCount === 1) {
    return `The candidate has just given their introduction.
            **Your Task:** Acknowledge their introduction with a brief, positive comment (e.g., "Thanks for sharing that."). Then, ask for their specific number of years of professional experience in the ${role} role.
            **Example:** "Thanks for sharing that. And how many years of professional experience do you have as a ${role}?"
            Keep it to a single, concise question.`;
  }

  if (aiTurnCount === 2) {
    return `
      You are an expert technical interviewer for a ${role} role, and the main part of the interview is now starting.
      The candidate has stated they have ${experienceLevel} years of experience. 
      Your tone must be professional, clear, and friendly.

      **CRITICAL INSTRUCTIONS:**
      1. **Ask only ONE question at a time.**
      2. **Start the interview with a high-level behavioral or project-based question.** Example: "Great, thank you. Let's dive in. Could you walk me through a recent project you're particularly proud of?"
      3. **Tailor question difficulty to experience:**
          - **0-2 years (Junior):** Focus on fundamental concepts, learning mindset, simple projects.
          - **3-5 years (Mid-level):** Ask about practical applications, problem-solving, team collaboration.
          - **5+ years (Senior):** Dive into system design, architecture, leadership, scalability.
      4. **Keep the interview concise - plan for only 3-4 total questions after this one.**
    `;
  }

  const questionsAsked = aiTurnCount - 2;
  const maxQuestions = experienceLevel <= 2 ? 3 : experienceLevel <= 5 ? 4 : 4;
  
  return `
      You are a technical interviewer in the middle of an interview. You have already asked ${questionsAsked} technical/behavioral questions.
      The candidate has ${experienceLevel} years of experience.
      
      **CRITICAL ENDING LOGIC:**
      ${questionsAsked >= maxQuestions ? 
        `- You have asked enough questions (${questionsAsked}/${maxQuestions}). You MUST end the interview now.
         - Your response MUST start with the exact tag: **[END_INTERVIEW]**
         - Your closing message should be: "[END_INTERVIEW] Thank you for your time today. That covers all the questions I had. You'll hear back from our team soon with the next steps. Have a great day!"` :
        `- You still have ${maxQuestions - questionsAsked} question(s) remaining before ending.
         - Ask the **next single, logical, and concise follow-up question** based on their previous response.
         - Make it relevant to their experience level and the ${role} role.
         - Do not greet them again, just ask the next question directly.`
      }
      `;
};

const getSummaryPrompt = (role, history, experienceLevel) => {
  return `
    You are an expert interview evaluator. Based on the following interview conversation for a ${role} position, 
    provide a comprehensive but concise summary and evaluation.
    The candidate has ${experienceLevel} years of experience.
    **Your task:** Analyze the conversation and provide:
    1. **Overall Score: X/100**
    2. **Overall Performance Summary** (2-3 sentences)
    3. **Key Strengths** (2-3 bullet points)
    4. **Areas for Improvement** (1-2 bullet points)
    5. **Recommendation** (Hire/Consider/Pass with brief reasoning)
    Format your response clearly.
  `;
};

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
  const [interviewSummary, setInterviewSummary] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // --- REFS ---
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  // --- REFS FOR GSAP ANIMATION (Path Selection) ---
  const frontendIconRef = useRef(null);
  const frontendButtonRef = useRef(null);
  const backendIconRef = useRef(null);
  const backendButtonRef = useRef(null);
  // --- REFS FOR GSAP ANIMATION (Interview Page) ---
  const aiIconMicRef = useRef(null);
  const aiIconHeadRef = useRef(null);
  const aiIconBaseRef = useRef(null);
  const gsapTimelineRef = useRef(null);

  // --- CONSTANTS ---
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  // --- Logic and helper functions (Speech Recognition, API calls, etc.) remain unchanged ---
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

      if (aiTurnCount === 2) {
        const expMatch = userResponse.match(/\d+/);
        const exp = expMatch ? parseInt(expMatch[0], 10) : 1;
        setExperienceLevel(exp);
        getAINextQuestion(updatedHistory, exp);
      } else {
        getAINextQuestion(updatedHistory, experienceLevel);
      }
    } else if (interviewState === "thinking" && !userResponse.trim()) {
      setInterviewState("welcome");
    }
  }, [interviewState, userResponse]);

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
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
      setError(
        "Gemini API Key is not set. Please add your key to the component."
      );
      setIsLoading(false);
      return null;
    }
    const model = "gemini-2.5-flash-lite";
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

  const generateSummary = async (history, exp) => {
    setIsGeneratingSummary(true);
    const model = "gemini-2.5-flash-lite";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    
    const conversationText = history.map((msg, index) => {
      const speaker = msg.role === "user" ? "Candidate" : "Interviewer";
      return `${speaker}: ${msg.parts[0].text}`;
    }).join("\n\n");
    
    const systemInstruction = getSummaryPrompt(interviewRole, history, exp);
    const payload = {
      contents: [
        { role: "user", parts: [{ text: `${systemInstruction}\n\nInterview Conversation:\n${conversationText}` }] },
      ],
      generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
    };
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Summary generation failed: ${response.status}`);
      }
      const result = await response.json();
      const summaryText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate summary.";
      setInterviewSummary(summaryText);
    } catch (e) {
      console.error("Summary generation error:", e);
      setError(`Summary generation failed: ${e.message}`);
    } finally {
      setIsGeneratingSummary(false);
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
      
      await generateSummary(history, exp);
      
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
    setInterviewSummary(null);
    setInterviewState("role-selection");
    setCurrentQuestion("Choose your interview path.");
  };

  const handleRestartInterview = () => {
    recognitionRef.current?.stop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setChatHistory([]);
    setUserResponse("");
    setError(null);
    setInterviewSummary(null);
    setCurrentQuestion(
      `You've selected the ${interviewRole} path. When you're ready, click the mic and say "Hello" to begin.`
    );
    setInterviewState("welcome");
  };

  // --- GSAP Handlers for Hover Animations (Path Selection) ---
  const createHoverHandlers = (iconRef, buttonRef, color) => ({
    onHoverStart: () => {
      gsap.to(iconRef.current, {
        scale: 1.15,
        rotate: "10deg",
        duration: 0.4,
        ease: "back.out(1.7)",
      });
      gsap.to(buttonRef.current, {
        y: -4,
        boxShadow: `0px 8px 20px -5px ${color}`,
        duration: 0.3,
        ease: "power2.out",
      });
    },
    onHoverEnd: () => {
      gsap.to(iconRef.current, {
        scale: 1,
        rotate: "0deg",
        duration: 0.4,
        ease: "back.in(1.7)",
      });
      gsap.to(buttonRef.current, {
        y: 0,
        boxShadow: "0px 0px 0px 0px rgba(0,0,0,0)",
        duration: 0.3,
        ease: "power2.in",
      });
    },
  });

  const frontendHoverHandlers = createHoverHandlers(frontendIconRef, frontendButtonRef, "rgba(59, 130, 246, 0.4)");
  const backendHoverHandlers = createHoverHandlers(backendIconRef, backendButtonRef, "rgba(168, 85, 247, 0.4)");

  // --- GSAP Animation for AI Icon ---
  useEffect(() => {
    const isAIActive = isLoading || interviewState === "speaking";

    if (isAIActive) {
        gsapTimelineRef.current = gsap.timeline({ repeat: -1, yoyo: true })
            .to(aiIconMicRef.current, { y: -3, duration: 1, ease: "sine.inOut" }, 0)
            .to(aiIconHeadRef.current, { y: -2, duration: 1, ease: "sine.inOut" }, 0.1)
            .to(aiIconBaseRef.current, { y: 2, duration: 1, ease: "sine.inOut" }, 0);
    }

    return () => {
        // Kill and clear the timeline when the component unmounts or the state changes
        if (gsapTimelineRef.current) {
            gsapTimelineRef.current.kill();
            gsap.set([aiIconMicRef.current, aiIconHeadRef.current, aiIconBaseRef.current], { clearProps: "all" });
        }
    };
  }, [isLoading, interviewState]);

  // --- RENDER LOGIC ---
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 flex flex-col items-center">
        {interviewState === "role-selection" ? (
          // --- PATH SELECTION PAGE (ANIMATED) ---
          <div className="min-h-screen w-full bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans overflow-hidden">
             <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center mb-10 sm:mb-12"
             >
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
                Choose Your Interview Path
              </h1>
              <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                Select a specialization to begin your tailored AI-powered mock
                interview. Each path focuses on relevant skills and questions.
              </p>
            </motion.div>
            
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.2,
                            delayChildren: 0.3,
                        }
                    }
                }}
            >
              <motion.div
                onClick={() => handleRoleSelect("Frontend Developer")}
                variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
                }}
                whileHover={{ y: -8, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                {...frontendHoverHandlers}
                className="group bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 md:p-10 cursor-pointer shadow-sm"
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div ref={frontendIconRef} className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                    <Code size={36} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 text-center mb-2">
                    Frontend Developer
                  </h2>
                  <p className="text-slate-600 text-center mb-4 sm:mb-6">
                    Test your knowledge in UI/UX principles, React framework, responsive
                    design, and more.
                  </p>
                  <button ref={frontendButtonRef} className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-full">
                    Start Interview
                  </button>
                </div>
              </motion.div>

              <motion.div
                onClick={() => handleRoleSelect("Backend Developer")}
                variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
                }}
                whileHover={{ y: -8, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                {...backendHoverHandlers}
                className="group bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 md:p-10 cursor-pointer shadow-sm"
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div ref={backendIconRef} className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                    <Server size={36} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 text-center mb-2">
                    Backend Developer
                  </h2>
                  <p className="text-slate-600 text-center mb-4 sm:mb-6">
                    Assess your skills in server-side logic, database management, API
                    design, and system architecture.
                  </p>
                  <button ref={backendButtonRef} className="bg-purple-500 text-white font-semibold py-2 px-6 rounded-full">
                    Start Interview
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        ) : interviewState === "finished" && interviewSummary ? (
          // --- SUMMARY PAGE (No changes here) ---
          <div className="bg-white text-gray-800 font-sans min-h-screen flex flex-col items-center justify-center p-4 w-full">
            <div className="w-full max-w-4xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Interview Summary
                  </h1>
                  <p className="text-gray-600">{interviewRole} Position</p>

                  {interviewSummary.includes("/100") && (
                    <div className="mt-6">
                      {(() => {
                        const scoreMatch = interviewSummary.match(/(\d+)\/100/);
                        const score = scoreMatch
                          ? parseInt(scoreMatch[1])
                          : 0;
                        const getScoreColor = (score) => {
                          if (score >= 90) return "from-green-500 to-emerald-500";
                          if (score >= 80) return "from-blue-500 to-cyan-500";
                          if (score >= 70) return "from-yellow-500 to-amber-500";
                          if (score >= 60) return "from-orange-500 to-red-500";
                          return "from-red-500 to-red-700";
                        };
                        const getScoreText = (score) => {
                          if (score >= 90) return "Exceptional";
                          if (score >= 80) return "Strong";
                          if (score >= 70) return "Good";
                          if (score >= 60) return "Average";
                          return "Needs Improvement";
                        };
                        return (
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-24 h-24 rounded-full bg-gradient-to-br ${getScoreColor(score)} flex items-center justify-center mb-3 relative overflow-hidden`}
                            >
                              <div className="text-2xl font-bold text-white">{score}</div>
                              <div className="absolute bottom-1 text-xs text-white/80 font-medium">/ 100</div>
                            </div>
                            <div className="text-lg font-semibold text-gray-700">{getScoreText(score)} Performance</div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{interviewSummary}</div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleRestartInterview}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg flex items-center gap-2"
                  >
                    <RefreshCw size={18} />
                    Restart the Interview
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // --- INTERVIEW PAGE (ANIMATED) ---
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white text-gray-800 font-sans min-h-screen flex flex-col items-center justify-center p-4 w-full"
          >
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
              {!isGeneratingSummary && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full mb-4">
                  <button
                    onClick={endInterview}
                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-full transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2"
                  >
                    <ArrowLeft size={18} />
                    Back to AI Interview Path
                  </button>
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 w-full">
                {/* AI Interviewer Card */}
                <motion.div 
                    animate={{ 
                        scale: (isLoading || interviewState === 'speaking') ? 1.03 : 1,
                        boxShadow: (isLoading || interviewState === 'speaking') ? "0px 10px 30px -5px rgba(168, 85, 247, 0.2)" : "0px 4px 6px -1px rgba(0, 0, 0, 0.1)"
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="bg-white border border-gray-200 rounded-2xl aspect-video flex flex-col items-center justify-center p-6 relative"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center mb-4 ring-2 ring-purple-500/50">
                    {interviewState === "speaking" || (isLoading && interviewState === "thinking") ? (
                      <Volume2 size={48} className="text-white animate-pulse" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path ref={aiIconMicRef} d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path ref={aiIconHeadRef} d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line ref={aiIconBaseRef} x1="12" y1="19" x2="12" y2="22"></line>
                      </svg>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">AI Interviewer</h2>
                  <span className="text-sm text-gray-500">{interviewRole}</span>
                  <button onClick={() => setIsAIMuted(!isAIMuted)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors" title={isAIMuted ? "Unmute AI Voice" : "Mute AI Voice"}>
                    {isAIMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                </motion.div>

                {/* User Card */}
                <motion.div 
                    animate={{ 
                        scale: interviewState === 'listening' ? 1.03 : 1,
                        boxShadow: interviewState === 'listening' ? "0px 10px 30px -5px rgba(239, 68, 68, 0.2)" : "0px 4px 6px -1px rgba(0, 0, 0, 0.1)"
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="bg-white border border-gray-200 rounded-2xl aspect-video flex flex-col items-center justify-center p-6 relative"
                >
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden">
                    <img src="https://placehold.co/100x100/E5E7EB/374151?text=You" alt="User Avatar" className="w-full h-full object-cover"/>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">You</h2>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <button onClick={toggleListening} disabled={isUserMuted || !["welcome", "listening"].includes(interviewState)}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${interviewState === "listening" ? "bg-red-500 animate-pulse" : "bg-blue-500 hover:bg-blue-600"} disabled:bg-gray-300 disabled:cursor-not-allowed`}
                    >
                      <Mic size={32} className="text-white" />
                    </button>
                  </div>
                  <button onClick={() => setIsUserMuted(!isUserMuted)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors">
                    {isUserMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                </motion.div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-gray-200 rounded-2xl p-6 min-h-[120px] w-full flex items-center justify-center text-center shadow-lg relative">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentQuestion}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-lg text-gray-700"
                  >
                    {interviewState === "listening" && userResponse ? userResponse : currentQuestion}
                  </motion.p>
                </AnimatePresence>
                {(isLoading || isGeneratingSummary) && (
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-2 border-dashed rounded-full animate-spin border-blue-400"></div>
                )}
              </motion.div>

              {userResponse && interviewState === "thinking" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center text-sm text-green-600 flex items-center justify-center gap-2">
                  <CornerRightDown size={16} />
                  <span>I heard: "{userResponse}"</span>
                </motion.div>
              )}

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center text-red-500 bg-red-100 border border-red-200 rounded-xl p-4 flex items-center justify-center gap-3">
                  <AlertTriangle size={20} />
                  <p><strong>Error:</strong> {error}</p>
                </motion.div>
              )}
            </div>
            <audio ref={audioRef} className="hidden" />
          </motion.div>
        )}
      </main>

      <footer className="bg-slate-50 text-gray-500 py-4">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm">
          &copy; {new Date().getFullYear()} Deadline Warrior. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
};

export default MockInterview;
