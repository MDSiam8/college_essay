import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  School, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  CheckCircle, 
  GraduationCap,
  Bird,
  BarChart3,
  ArrowRight,
  Microscope,
  Mail,
  Send,
  Zap,
  Bot,
  Key,
  X,
  FileText,
  Maximize2,
  Minimize2,
  RefreshCw,
  Download,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Target,
  Printer
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-6 py-3 rounded-xl font-medium transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden";
  const variants = {
    primary: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20 border border-cyan-400/20 backdrop-blur-sm",
    secondary: "bg-white/10 hover:bg-white/20 text-slate-700 hover:text-slate-900 border border-white/40",
    outline: "border border-slate-300 text-slate-600 hover:bg-slate-50"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-sheen" />
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
};

const ErrorModal = ({ error, onClose }) => (
  <Modal isOpen={!!error} onClose={onClose} title="Analysis Error">
    <div className="flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <p className="text-slate-600">
        {error || "Something went wrong while analyzing your essay. Please try again."}
      </p>
      <Button onClick={onClose} variant="secondary" className="w-full bg-slate-100">
        Close
      </Button>
    </div>
  </Modal>
);

const LockedSelectionModal = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Selection Locked">
    <div className="flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
        <School className="w-8 h-8 text-blue-500" />
      </div>
      <p className="text-slate-600">
        To ensure your analysis is accurate for your selected schools, please start a <strong>New Analysis</strong> if you wish to change your target universities.
      </p>
      <p className="text-xs text-slate-400">
        Don't worry, your essay draft will be safe!
      </p>
      <Button onClick={onClose} variant="primary" className="w-full">
        Got it
      </Button>
    </div>
  </Modal>
);

const ApiKeyModal = ({ isOpen, onClose, onSave }) => {
  const [key, setKey] = useState('');
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Custom API Key">
      <p className="text-slate-500 text-sm mb-4">
        Enter your own Google Gemini API key to use for analysis. This key is stored locally in your browser and never sent to our servers.
      </p>
      <input
        type="password"
        placeholder="AIza..."
        value={key}
        onChange={(e) => setKey(e.target.value)}
        className="w-full p-3 border border-slate-200 rounded-xl mb-4 focus:outline-none focus:border-cyan-500 bg-slate-50"
      />
      <Button onClick={() => { onSave(key); onClose(); }} className="w-full">
        Save Key
      </Button>
    </Modal>
  );
};

const FeedbackCard = ({ item, color, isSelected, onClick }) => {
  const isJHUCard = item.category === 'Blue Jay Insider';
  const [showExample, setShowExample] = useState(false);

  return (
    <div 
      className="group mb-4"
      onClick={() => onClick(item.id)}
    >
      <div 
        className={`
          cursor-pointer relative overflow-hidden rounded-2xl transition-all duration-300 border
          ${isSelected ? 'ring-2 ring-cyan-400 shadow-lg scale-[1.02]' : ''}
          ${isJHUCard 
            ? 'bg-blue-50 border-blue-400 shadow-blue-200/50 shadow-lg' 
            : 'bg-white/40 border-white/50 hover:bg-white/60'}
        `}
      >
        <div className="p-5 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0"> 
            <div className="flex items-center gap-2 mb-1">
              {/* Semantic Color Dot (if category matched) or Fallback */}
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`}></div>
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${
                isJHUCard ? 'bg-blue-600 text-white animate-pulse' :
                item.score >= 90 ? 'bg-green-100 text-green-700' :
                item.score >= 80 ? 'bg-cyan-100 text-cyan-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {isJHUCard && <Bird className="w-3 h-3 inline mr-1 mb-0.5"/>}
                {item.category}
              </span>
              <span className="text-xs text-slate-500 font-medium ml-auto">{item.score}/100</span>
            </div>
            <h3 className={`font-semibold text-lg truncate ${isJHUCard ? 'text-blue-900' : 'text-slate-800'}`}>{item.title}</h3>
            <p className={`text-sm mt-1 leading-relaxed line-clamp-2 ${isJHUCard ? 'text-blue-800' : 'text-slate-600'}`}>{item.summary}</p>
          </div>
          <div className={`mt-1 p-1 rounded-full transition-transform duration-300 ${isSelected ? 'rotate-180 bg-slate-200/50' : ''}`}>
            <ChevronDown className="w-5 h-5 text-slate-500" />
          </div>
        </div>

        <div className={`
          overflow-hidden transition-all duration-500 ease-in-out
          ${isSelected ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
        `}>
          <div className="p-5 pt-0 text-sm border-t border-slate-100/50">
            <div className="mt-4 space-y-4">
              <div className={`p-4 rounded-xl border ${isJHUCard ? 'bg-blue-100/50 border-blue-200' : 'bg-slate-50/80 border-slate-100'}`}>
                <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-600" />
                  Analysis
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  {item.details}
                </p>
                {item.quote && (
                   <div className="mt-3 pl-3 border-l-2 border-slate-300 text-slate-500 italic text-xs break-words">
                     "{item.quote}"
                   </div>
                )}
              </div>

              {item.rewrite_suggestion && (
                <div className="bg-white/50 p-4 rounded-xl border border-slate-200">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowExample(!showExample); }}
                    className="text-xs font-bold text-cyan-700 uppercase tracking-wide flex items-center gap-1 hover:text-cyan-800 mb-2"
                  >
                    <Lightbulb className="w-3 h-3" />
                    {showExample ? "Hide Example" : "See Rewrite Example"}
                  </button>
                  
                  <div className={`transition-all duration-300 overflow-hidden ${showExample ? 'max-h-40 opacity-100 pl-1' : 'max-h-0 opacity-0'}`}>
                    <div className="text-slate-600 italic border-l-2 border-cyan-300 pl-3 py-1 bg-cyan-50/50 rounded-r-lg">
                      {item.rewrite_suggestion}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 bg-cyan-50/50 p-4 rounded-xl border border-cyan-100">
                <div className="mt-0.5 p-1 bg-cyan-100 rounded-full text-cyan-700">
                  <Target className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-900 mb-1">Suggested Action</h4>
                  <p className="text-cyan-800">
                    {item.action}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Utilities ---

let genAIInstance = null;

const getGenAI = (apiKey) => {
  // Prioritize custom key, then fallback to environment variable (default key)
  // NOTE: This API key will be in the client bundle. This is expected for client-side apps.
  // The key MUST be restricted in Google Cloud Console with:
  // - HTTP referrer restrictions (domain-only access)
  // - API restrictions (Gemini API only)
  // See API_KEY_SECURITY.md for setup instructions.
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!key) {
    console.warn("Gemini API Key is missing. Please click the key icon to add your Google Gemini API key.");
    return null;
  }
  
  // Create new instance if key changed or doesn't exist
  if (!genAIInstance || genAIInstance._apiKey !== key) {
    genAIInstance = new GoogleGenerativeAI(key);
    genAIInstance._apiKey = key; // Store for comparison
  }
  return genAIInstance;
}

const HIGHLIGHT_COLORS = [
  'bg-yellow-200', 
  'bg-green-200', 
  'bg-blue-200', 
  'bg-purple-200', 
  'bg-pink-200', 
  'bg-orange-200',
  'bg-cyan-200',
  'bg-lime-200'
];

// Map categories to colors for Semantic Color Coding
const CATEGORY_COLORS = {
  'Narrative Arc': 'bg-blue-400',
  'Content': 'bg-blue-400',
  'Grammar': 'bg-yellow-400',
  'Flow': 'bg-yellow-400',
  'School Fit': 'bg-teal-400',
  'Blue Jay Insider': 'bg-teal-400',
  'Cliché Check': 'bg-orange-400',
  'Warning': 'bg-red-400',
  'Tone Analysis': 'bg-purple-400',
  'Hook Quality': 'bg-pink-400',
};

const getCategoryColor = (category) => {
  // Fuzzy match or default
  const key = Object.keys(CATEGORY_COLORS).find(k => category.includes(k));
  return key ? CATEGORY_COLORS[key] : 'bg-gray-400';
};

// Helper for fuzzy matching
const findQuoteIndex = (text, quote) => {
  if (!quote || !text) return -1;
  
  // 1. Try exact match
  let index = text.indexOf(quote);
  if (index !== -1) return index;

  // 2. Try trimmed match
  const trimmedQuote = quote.trim();
  index = text.indexOf(trimmedQuote);
  if (index !== -1) return index;

  return -1;
};

const analyzeEssayWithGemini = async (text, selectedSchools, apiKey) => {
  const genAI = getGenAI(apiKey);
  if (!genAI) {
    throw new Error("API Key is missing. Please click the key icon to add your Google Gemini API key.");
  }
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" }); 
  const schoolContext = selectedSchools.length > 0 
    ? `The student is targeting: ${selectedSchools.map(s => `${s.name} (Vibe: ${s.vibe})`).join(', ')}.`
    : "The student has not selected specific target schools yet.";

  const hasJHU = selectedSchools.find(s => s.id === 'jhu');
  const jhuContext = hasJHU 
    ? "IMPORTANT: The user is applying to Johns Hopkins. Include a specific feedback item with category 'Blue Jay Insider' that checks for 'Hopkins DNA' (interdisciplinary spirit, research, collaboration). Make this the first item."
    : "";

  const prompt = `
    You are an expert college admissions counselor specializing in the Common App Personal Statement.
    
    Context:
    This is primarily a specific evaluation of the Common App Personal Statement. 
    While the student may have target schools (${schoolContext}), remember that the Personal Statement is often sent to multiple universities. 
    Do NOT penalize the essay for not mentioning specific university names unless it is explicitly a "Why Us" supplement.
    Focus your analysis on the narrative arc, personal voice, vulnerability, and introspection.
    ${jhuContext}

    Essay Text:
    "${text}"

    Please provide a detailed analysis in valid JSON format. Do not wrap the JSON in markdown code blocks. The JSON must exactly match this structure:
    {
      "wordCount": number,
      "overallScore": number (0-100),
      "aiProbability": number (0-100, where 100 is definitely AI written),
      "readabilityGrade": "string (e.g. A-, B+)",
      "sentiment": "string (e.g. High, Neutral)",
      "uniquenessScore": "string (e.g. 8/10)",
      "summary": "Comprehensive 3-4 sentence summary of the essay's narrative strengths, weaknesses, and overall impression.",
      "feedback": [
        {
          "id": number,
          "category": "string (e.g. Narrative Arc, School Fit, Cliché Check, Blue Jay Insider, Tone Analysis, Hook Quality)",
          "score": number (0-100),
          "title": "Short punchy title",
          "summary": "One sentence summary of this specific feedback",
          "details": "Detailed explanation (3-4 sentences) explaining exactly why this feedback is given.",
          "quote": "The EXACT substring from the essay text that this feedback refers to. Copy it exactly from the input text including whitespace/punctuation. If general feedback, return null.",
          "action": "Specific, actionable advice on how to improve this section.",
          "rewrite_suggestion": "A concrete example of how to rewrite the quoted section to improve it (optional, return null if not applicable)."
        }
      ]
    }

    REQUIREMENTS:
    1. Provide 8-15+ distinct feedback items (or as many as needed for comprehensive coverage). Do not limit yourself to just 6-7 items. Be thorough and cover all aspects: narrative structure, voice, grammar, flow, tone, hook, clichés, school fit, specific quotes that need improvement, transitions, conclusion quality, etc. The more comprehensive the feedback, the better. Aim for 10-15 items for a typical essay, and adjust based on the essay's length and complexity.
    2. If JHU is selected, ensure the first item is 'Blue Jay Insider'.
    3. Be critical but constructive.
    4. Evaluate if the essay sounds like it was written by an AI (overly formal, generic structure, lack of personal voice).
    5. IMPORTANT: Ensure all suggestions and "action" items sound like they are written by a helpful human mentor. Avoid AI clichés like "delve deeper," "showcase," "unleash," or overly flowery language. Use direct, practical 12th-grade level language.
    6. REWRITE SUGGESTION RULE - CRITICAL: When providing a 'rewrite_suggestion', you MUST write it EXACTLY as a real 12th grader would write it. This is the most important rule.
       - Use contractions (I'm, it's, don't, can't, won't, that's, etc.)
       - Use simple, direct sentences. Avoid complex parallel structures.
       - Write with genuine, raw emotion - not polished or "inspiring"
       - Use casual, natural language patterns that a teenager would actually use
       - Keep it conversational, not essay-like
       - DO NOT use any of these AI cliché patterns:
         * "It isn't just __; it's also ___" or similar parallel structures
         * "Through [experience], I learned that..." (too formulaic)
         * "This experience taught me the importance of..." (sounds like ChatGPT)
         * "I realized that [abstract concept] is more than just [thing]" (overused pattern)
         * "Little did I know..." (overused hook)
         * "In that moment, everything changed" (dramatic cliché)
         * "I came to understand that..." (too formal)
         * Any variation of "This wasn't just about X, it was about Y"
       - Instead, write like a real student: "I was pretty nervous at first, but then I realized..." or "Honestly, I didn't think it would matter, but..." or "It hit me that..." or "I guess what I'm trying to say is..."
       - If the original quote is formal, make the rewrite more casual and authentic
       - If the original quote is already casual, keep it casual but improve clarity/impact
       - Remember: A 12th grader's voice is honest, sometimes awkward, and never perfectly polished. That's what makes it authentic.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const responseText = response.text();
  const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(jsonString);
};

const UNIVERSITIES = [
  { id: 'jhu', name: 'Johns Hopkins', vibe: 'Collaborative research, interdisciplinary impact, and curiosity beyond major.' },
  { id: 'harvard', name: 'Harvard', vibe: 'Transformative leadership, global citizen, and intellectual vitality.' },
  { id: 'mit', name: 'MIT', vibe: 'Mens et Manus (Mind and Hand), collaborative problem-solving, and humility.' },
  { id: 'stanford', name: 'Stanford', vibe: 'Intellectual vitality, innovation, and interdisciplinary thinking.' },
  { id: 'yale', name: 'Yale', vibe: 'Community contribution ("And" factor), global leadership, and curiosity.' },
  { id: 'princeton', name: 'Princeton', vibe: 'Service to humanity, deep independent research, and undergraduate focus.' },
  { id: 'uchicago', name: 'UChicago', vibe: '"The Life of the Mind," theoretical inquiry, and challenging norms.' },
  { id: 'columbia', name: 'Columbia', vibe: 'The Core Curriculum, engaging with NYC, and intellectual diversity.' },
  { id: 'upenn', name: 'UPenn', vibe: 'Interdisciplinary pragmatism, civic engagement, and applying knowledge.' },
  { id: 'duke', name: 'Duke', vibe: 'Ambitious interdisciplinary problem solving, spirited community, and impact.' },
  { id: 'berkeley', name: 'UC Berkeley', vibe: 'Changemaking, social justice, challenging the status quo, and scale.' },
  { id: 'northwestern', name: 'Northwestern', vibe: 'Interdisciplinary flexibility ("AND" DNA), communication, and creativity.' },
  { id: 'brown', name: 'Brown', vibe: 'The Open Curriculum, intellectual independence, and self-directed learning.' },
  { id: 'cornell', name: 'Cornell', vibe: '"Any person... any study," practical application, and diversity of thought.' },
  { id: 'dartmouth', name: 'Dartmouth', vibe: 'Sense of place, tight-knit community, and adventurous spirit.' },
  { id: 'nyu', name: 'NYU', vibe: 'Urban integration, independence, and global perspective.' },
  { id: 'ucla', name: 'UCLA', vibe: 'Optimism, diverse contributions, and academic excellence.' },
];

// --- Main Application ---

export default function EssayFlow() {
  const [text, setText] = useState('');
  const [selectedSchools, setSelectedSchools] = useState([UNIVERSITIES.find(u => u.id === 'jhu')]); // JHU default
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [customApiKey, setCustomApiKey] = useState(() => {
    // Load API key from localStorage on mount
    return localStorage.getItem('gemini_api_key') || '';
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [error, setError] = useState(null);
  
  // Save API key to localStorage whenever it changes
  useEffect(() => {
    if (customApiKey) {
      localStorage.setItem('gemini_api_key', customApiKey);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  }, [customApiKey]);
  
  // Layout State
  const [isTargetingExpanded, setIsTargetingExpanded] = useState(true);
  const [filter, setFilter] = useState('All');

  // Highlight State
  const [activeFeedbackId, setActiveFeedbackId] = useState(null);
  const editorRef = useRef(null);
  const resultsRef = useRef(null);

  // Email State
  const [email, setEmail] = useState('');
  const [isEmailing, setIsEmailing] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const toggleSchool = (school) => {
    if (results) {
      setShowLockedModal(true);
      return;
    }

    if (selectedSchools.find(s => s.id === school.id)) {
      setSelectedSchools(selectedSchools.filter(s => s.id !== school.id));
    } else {
      if (selectedSchools.length < 3) {
        setSelectedSchools([...selectedSchools, school]);
      }
    }
  };

  const handleReset = () => {
    // Only reset results/analysis, keep the text so user doesn't lose work
    setResults(null);
    setError(null);
    setIsTargetingExpanded(true);
    setActiveFeedbackId(null);
    setFilter('All');
  };

  const handleAnalyze = async () => {
    if (text.length < 50) return;
    setIsAnalyzing(true);
    setResults(null); 
    setError(null);
    
    // Auto-collapse targeting panel on analyze
    setIsTargetingExpanded(false);
    
    try {
      const data = await analyzeEssayWithGemini(text, selectedSchools, customApiKey);
      setResults(data);
      
      setTimeout(() => {
        const resultsEl = document.getElementById('results-section');
        if(resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      if (err.message?.includes('404') || err.message?.includes('not found')) {
         try {
            const genAI = getGenAI(customApiKey);
            if (genAI) {
                const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
                // Retry logic would go here
                console.log("Primary model failed, check API key or model availability.");
            }
         } catch (e) {}
      }
      console.error(err);
      setError(err.message || "Failed to analyze essay. Please check your API key or try again.");
      setIsTargetingExpanded(true); // Re-expand if error
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailResults = (e) => {
    e.preventDefault();
    if (!email || !results) return;
    
    setIsEmailing(true);
    
    const subject = `🎓 Your Hopkins Essay Lab Analysis`;
    const body = `
HOPKINS ESSAY LAB REPORT
========================

📝 SUMMARY
${results.summary}

📊 METRICS
• Overall Score: ${results.overallScore}/100
• Readability: ${results.readabilityGrade}
• Uniqueness: ${results.uniquenessScore}
• AI Probability: ${results.aiProbability}%

💡 DETAILED FEEDBACK
====================
${results.feedback.map((f, idx) => `
${idx + 1}. ${f.category.toUpperCase()} - ${f.score}/100
"${f.title}"

Summary: ${f.summary}

Details: ${f.details}

${f.quote ? `Quoted Text: "${f.quote}"` : ''}

Action: ${f.action}

${f.rewrite_suggestion ? `\n💡 REWRITE EXAMPLE:\n"${f.rewrite_suggestion}"` : ''}

${'-'.repeat(50)}
`).join('\n')}

------------------------------------------------
Powered by JHU Engineering
    `;

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    setTimeout(() => {
      window.location.href = mailtoLink;
      setIsEmailing(false);
      setEmailSent(true);
      setEmail('');
      setTimeout(() => setEmailSent(false), 3000);
    }, 800);
  };

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

  // Highlight Logic
  const handleHighlightClick = (id) => {
    setActiveFeedbackId(id);
    // Scroll to feedback card
    const card = document.getElementById(`feedback-card-${id}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleFeedbackClick = (id) => {
    setActiveFeedbackId(id === activeFeedbackId ? null : id);
    // Scroll to text highlight if activating
    if (id !== activeFeedbackId) {
      setTimeout(() => {
        const highlight = document.getElementById(`highlight-${id}`);
        if (highlight) {
          highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const renderHighlightedText = () => {
    if (!results || !results.feedback) return text;

    let ranges = [];
    results.feedback.forEach((item, index) => {
      // Use fuzzy match helper
      const startIndex = findQuoteIndex(text, item.quote);
      if (startIndex === -1) return;
      
      ranges.push({
        start: startIndex,
        end: startIndex + item.quote.trim().length, // Use trimmed length for safety
        id: item.id,
        color: getCategoryColor(item.category)
      });
    });

    ranges.sort((a, b) => a.start - b.start);

    const segments = [];
    let currentPos = 0;

    ranges.forEach(range => {
      if (range.start > currentPos) {
        segments.push({
          text: text.substring(currentPos, range.start),
          isHighlight: false
        });
      }
      segments.push({
        text: text.substring(range.start, range.end),
        isHighlight: true,
        id: range.id,
        color: range.color
      });
      currentPos = range.end;
    });

    if (currentPos < text.length) {
      segments.push({
        text: text.substring(currentPos),
        isHighlight: false
      });
    }

    return (
      <>
        {segments.map((seg, i) => {
          if (seg.isHighlight) {
            const isActive = activeFeedbackId === seg.id;
            return (
              <span 
                key={i}
                id={`highlight-${seg.id}`}
                onClick={() => handleHighlightClick(seg.id)}
                className={`
                  rounded-sm px-0.5 cursor-pointer transition-all duration-200 border-b-2
                  ${isActive 
                    ? `bg-white text-black font-medium shadow-lg scale-105 z-10 relative ring-2 ring-current border-transparent` 
                    : `${seg.color.replace('bg-', 'border-').replace('400', '300')} bg-opacity-20 hover:bg-opacity-40`
                  }
                `}
                style={{ 
                    backgroundColor: isActive ? 'white' : undefined,
                    borderColor: !isActive ? 'currentColor' : undefined 
                }}
              >
                {seg.text}
              </span>
            );
          }
          return <span key={i}>{seg.text}</span>;
        })}
      </>
    );
  };

  const filteredFeedback = results?.feedback.filter(item => {
    if (filter === 'All') return true;
    if (filter === 'Critical') return item.score < 75;
    if (filter === 'High Impact') return item.score >= 90;
    return true;
  });

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans selection:bg-cyan-200 selection:text-cyan-900">
      
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-600" />
      
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-500/20 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-400/20 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
      <div className="fixed top-[40%] left-[40%] w-[20vw] h-[20vw] bg-blue-400/10 rounded-full blur-[80px] animate-pulse-slow delay-500" />

      <ApiKeyModal 
        isOpen={showApiKeyModal} 
        onClose={() => setShowApiKeyModal(false)} 
        onSave={setCustomApiKey} 
      />

      <ErrorModal 
        error={error} 
        onClose={() => setError(null)} 
      />

      <LockedSelectionModal 
        isOpen={showLockedModal}
        onClose={() => setShowLockedModal(false)}
      />

      {/* Print Report Template (Visible only on print) */}
      {results && (
        <div id="print-container" className="hidden bg-white text-black p-8 max-w-[210mm] mx-auto font-sans">
          <div className="border-b-2 border-gray-800 pb-6 mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">Essay Analysis Report</h1>
              <p className="text-gray-600 font-medium">Hopkins Essay Lab • Powered by JHU Engineering</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              {new Date().toLocaleDateString()}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-100 p-4 rounded-lg text-center border border-gray-200">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-bold">Overall Score</div>
              <div className="text-3xl font-bold text-blue-700">{results.overallScore}</div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center border border-gray-200">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-bold">Readability</div>
              <div className="text-xl font-semibold text-gray-800">{results.readabilityGrade}</div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center border border-gray-200">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-bold">AI Probability</div>
              <div className="text-xl font-semibold text-gray-800">{results.aiProbability}%</div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center border border-gray-200">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-bold">Uniqueness</div>
              <div className="text-xl font-semibold text-gray-800">{results.uniquenessScore}</div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-600 mb-10">
            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-2">Executive Summary</h3>
            <p className="text-gray-800 leading-relaxed text-lg">{results.summary}</p>
          </div>

          <h3 className="text-2xl font-bold text-black mb-6 border-b pb-2">Detailed Feedback</h3>
          <div className="space-y-8">
            {results.feedback.map((item, idx) => (
              <div key={idx} className="break-inside-avoid mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded uppercase">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-xl text-gray-900">{item.title}</h4>
                  </div>
                  <span className="font-bold text-gray-400">{item.score}/100</span>
                </div>
                
                <p className="text-gray-700 mb-3">{item.details}</p>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <strong className="text-blue-800 text-xs uppercase block mb-1">Action Item:</strong>
                  <p className="text-gray-800 font-medium">{item.action}</p>
                </div>

                {item.rewrite_suggestion && (
                    <div className="mt-3 pl-4 border-l-4 border-green-400 italic text-gray-600">
                        <span className="text-green-700 font-bold text-xs not-italic block mb-1">Example Rewrite:</span>
                        "{item.rewrite_suggestion}"
                    </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-400 text-xs">
            Generated by Hopkins Essay Lab • Only for personal use
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex flex-col no-print">
        
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-cyan-400/20 group-hover:bg-cyan-400/30 transition-colors" />
              <Bird className="text-white w-6 h-6 relative z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Hopkins Essay Lab</h1>
              <p className="text-blue-200 text-xs font-medium tracking-wide uppercase opacity-80 flex items-center gap-1">
                Powered by JHU Engineering
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
             <Button 
               onClick={handleReset} 
               className="!px-4 !py-2 text-sm bg-white/10 text-blue-100 border-white/20 hover:bg-white/20 hover:text-white"
             >
               <RefreshCw className="w-3 h-3" />
               New Analysis
             </Button>

             <div className="text-right">
                <p className="text-white/90 text-sm font-medium">Future Blue Jay?</p>
                <p className="text-blue-200 text-xs">Applicant View</p>
             </div>
             <button 
               onClick={() => setShowApiKeyModal(true)}
               className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 p-[2px] animate-spin-slow cursor-pointer hover:scale-105 transition-transform"
               title="Set API Key"
             >
               <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                 <div className="bg-blue-600 w-full h-full flex items-center justify-center text-white text-xs font-bold">
                    {customApiKey ? <Key className="w-3 h-3" /> : "JHU"}
                 </div>
               </div>
             </button>
          </div>
        </header>

        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 transition-all duration-500 ease-in-out">
          
          {/* Collapsible Targeting Panel */}
          <div className={`
            flex flex-col gap-6 transition-all duration-500 ease-in-out
            ${isTargetingExpanded ? 'lg:col-span-3' : 'lg:col-span-1'}
          `}>
            <section className={`
              bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500
              ${isTargetingExpanded ? 'p-6' : 'p-3 items-center'}
            `}>
              <div 
                onClick={() => setIsTargetingExpanded(!isTargetingExpanded)}
                className="flex items-center gap-2 mb-4 cursor-pointer hover:opacity-80"
              >
                <School className="w-5 h-5 text-cyan-300" />
                {isTargetingExpanded && <h2 className="text-white font-semibold text-lg whitespace-nowrap">Target Universities</h2>}
                <div className="ml-auto">
                  {isTargetingExpanded ? <Minimize2 className="w-4 h-4 text-blue-200"/> : <Maximize2 className="w-4 h-4 text-blue-200"/>}
                </div>
              </div>
              
              <div className={`flex flex-wrap gap-2 ${!isTargetingExpanded && 'flex-col'}`}>
                {UNIVERSITIES.map((school) => {
                  const isSelected = selectedSchools.find(s => s.id === school.id);
                  const isJHU = school.id === 'jhu';
                  
                  if (!isTargetingExpanded && !isSelected) return null; // Hide unselected when collapsed

                  return (
                    <button
                      key={school.id}
                      onClick={() => toggleSchool(school)}
                      title={school.name}
                      className={`
                        rounded-lg text-sm font-medium transition-all duration-200 border relative overflow-hidden group
                        ${isTargetingExpanded ? 'px-3 py-1.5' : 'w-10 h-10 flex items-center justify-center p-0'}
                        ${isSelected 
                          ? (isJHU ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/40' : 'bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/20') 
                          : 'bg-white/5 text-blue-100 border-white/10 hover:bg-white/10 hover:border-white/30'}
                      `}
                    >
                      {isJHU && !isSelected && <span className="absolute inset-0 bg-blue-400/10 group-hover:bg-blue-400/20 transition-colors"></span>}
                      {isJHU && <Bird className={`w-3 h-3 ${isTargetingExpanded ? 'inline mr-1 -mt-0.5' : ''}`} />}
                      {isTargetingExpanded && school.name}
                    </button>
                  );
                })}
                {!isTargetingExpanded && (
                  <div 
                    onClick={() => setIsTargetingExpanded(true)}
                    className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-blue-200 cursor-pointer hover:bg-white/10"
                  >
                    <School className="w-4 h-4" />
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Editor Panel */}
          <div className={`
            flex flex-col gap-6 transition-all duration-500 ease-in-out
            ${isTargetingExpanded ? 'lg:col-span-5' : 'lg:col-span-6'}
          `}>
            <section className="flex-1 bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl p-1 shadow-2xl flex flex-col relative overflow-hidden h-full min-h-[600px]">
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center rounded-t-[20px]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Draft Editor</span>
                  {selectedSchools.some(s => s.id === 'jhu') && (
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full animate-pulse">
                      <Bird className="w-3 h-3" /> JHU Mode
                    </span>
                  )}
                </div>
                <span className={`text-xs font-mono px-2 py-1 rounded ${wordCount > 650 ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}`}>
                  {wordCount} Words
                </span>
              </div>
              
              <div className="flex-1 relative w-full" ref={editorRef}>
                {results ? (
                  // Read-only Highlighting View
                  <div className="absolute inset-0 p-6 text-slate-800 leading-relaxed text-lg font-serif whitespace-pre-wrap overflow-y-auto custom-scrollbar">
                    {renderHighlightedText()}
                  </div>
                ) : (
                  // Editable View
                  <textarea
                    className="absolute inset-0 w-full h-full bg-transparent p-6 text-slate-800 placeholder-slate-400 resize-none focus:outline-none leading-relaxed text-lg font-serif custom-scrollbar"
                    placeholder="Paste your essay here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    spellCheck="false"
                  />
                )}
              </div>

              {!results && (
                <div className="p-4 border-t border-slate-100 bg-white/50 backdrop-blur-sm flex justify-between items-center">
                  <p className="text-xs text-slate-400">Last saved just now</p>
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing || text.length < 20}
                    className="min-w-[140px]"
                  >
                    {isAnalyzing ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze Draft
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </section>
          </div>

          {/* Results Panel */}
          <div 
            id="results-section" 
            className={`
              flex flex-col gap-6 h-full max-h-[calc(100vh-6rem)] transition-all duration-500
              ${isTargetingExpanded ? 'lg:col-span-4' : 'lg:col-span-5'}
            `}
          >
            
            {!results ? (
              <div className="h-full min-h-[400px] bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl flex flex-col items-center justify-center text-center p-8 border-dashed border-2">
                <div className="w-20 h-20 bg-gradient-to-tr from-white/10 to-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                  <BarChart3 className="w-10 h-10 text-white/40" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Ready to Review</h3>
                <p className="text-blue-200/70 max-w-xs">
                  Paste your draft to receive comprehensive, personalized feedback from our AI counselor.
                </p>
              </div>
            ) : (
              <div className="animate-fadeIn flex flex-col h-full">
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6 pb-4">
                  
                  {/* Action Buttons & Filter */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        {['All', 'Critical', 'High Impact'].map(f => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${filter === f ? 'bg-white text-blue-900' : 'bg-white/10 text-blue-200 hover:bg-white/20'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                     <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 text-xs font-medium text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all"
                     >
                       <Printer className="w-3 h-3" />
                       Print / Save PDF
                     </button>
                  </div>

                  <div className="bg-gradient-to-br from-white/90 to-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

                    <div className="flex items-center justify-between mb-6 relative z-10">
                      <h2 className="text-slate-800 font-bold text-lg">Analysis Report</h2>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                        Live
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 mb-6 relative z-10">
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-100"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <path
                            className="text-cyan-500 transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                            strokeDasharray={`${results.overallScore}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-slate-800">{results.overallScore}</span>
                          <span className="text-[10px] font-medium text-slate-400 uppercase">Score</span>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                            results.aiProbability > 50 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {results.aiProbability > 50 ? 'AI-Like Detected' : 'Human Voice'}
                          </span>
                          <span className="text-xs text-slate-400">AI Prob: {results.aiProbability}%</span>
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed">
                          {results.summary}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center relative z-10">
                      <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                        <div className="text-xs text-slate-400 mb-1">Readability</div>
                        <div className="font-semibold text-slate-700">{results.readabilityGrade || "N/A"}</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                        <div className="text-xs text-slate-400 mb-1">Sentiment</div>
                        <div className="font-semibold text-slate-700">{results.sentiment || "N/A"}</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                        <div className="text-xs text-slate-400 mb-1">Uniqueness</div>
                        <div className="font-semibold text-slate-700">{results.uniquenessScore || "N/A"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Email Box (Restored) */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                    <form onSubmit={handleEmailResults} className="flex items-center gap-3">
                      <div className="flex-1 relative">
                         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200" />
                         <input 
                          type="email" 
                          required
                          placeholder="Email results..."
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-blue-200/50 focus:outline-none focus:border-cyan-400/50 focus:bg-black/30 transition-all"
                         />
                      </div>
                      <button 
                        type="submit" 
                        disabled={isEmailing || emailSent}
                        className={`
                          px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2
                          ${emailSent 
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                            : 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/20'}
                          ${isEmailing ? 'opacity-70 cursor-wait' : ''}
                        `}
                      >
                        {emailSent ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Sent!
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  <div className="relative">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h3 className="text-white font-semibold">Detailed Insights</h3>
                      <span className="text-xs text-blue-200 bg-white/10 px-2 py-1 rounded-full">
                        {filteredFeedback ? filteredFeedback.length : 0} Suggestions
                      </span>
                    </div>
                    
                    <div className="space-y-2 pb-12">
                      {filteredFeedback && filteredFeedback.map((item, idx) => (
                        <div id={`feedback-card-${item.id}`} key={idx}>
                          <FeedbackCard 
                            item={item} 
                            color={getCategoryColor(item.category)}
                            isSelected={activeFeedbackId === item.id}
                            onClick={handleFeedbackClick}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
