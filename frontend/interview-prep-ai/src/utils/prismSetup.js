// utils/prismSetup.js
import Prism from "prismjs";

// Import CSS theme
import "prismjs/themes/prism-tomorrow.css";

// Import language components - do this after the main import
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-cpp";

// Safely highlight code with error handling
export const highlightCode = (code, language) => {
  try {
    // Ensure Prism and languages are available
    if (!Prism || !Prism.languages) {
      return code;
    }

    const grammar = Prism.languages[language];
    if (grammar) {
      return Prism.highlight(code, grammar, language);
    }

    // Fallback to plain text
    return code;
  } catch (error) {
    console.warn("Syntax highlighting failed for language:", language, error);
    return code;
  }
};

// Get available languages
export const getAvailableLanguages = () => {
  if (!Prism || !Prism.languages) return [];
  return Object.keys(Prism.languages).filter((lang) =>
    ["javascript", "python", "java", "cpp"].includes(lang)
  );
};

// Check if a language is supported
export const isLanguageSupported = (language) => {
  return Prism && Prism.languages && !!Prism.languages[language];
};

export default Prism;
