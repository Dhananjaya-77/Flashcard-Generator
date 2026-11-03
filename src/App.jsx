import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'study-assistant-sessions';
const DEFAULT_GOAL = 10;
const TIMER_SECONDS = 20;

const IT_CATEGORIES = [
  { id: 'networking', label: 'Networking', icon: '🌐', desc: 'TCP/IP, DNS, HTTP, OSI model' },
  { id: 'os', label: 'Operating Systems', icon: '💻', desc: 'Linux, Windows, processes, memory' },
  { id: 'databases', label: 'Databases', icon: '🗄️', desc: 'SQL, NoSQL, indexing, transactions' },
  { id: 'security', label: 'Cybersecurity', icon: '🔐', desc: 'Encryption, attacks, firewalls' },
  { id: 'programming', label: 'Programming', icon: '⌨️', desc: 'OOP, algorithms, data structures' },
  { id: 'cloud', label: 'Cloud & DevOps', icon: '☁️', desc: 'AWS, Docker, CI/CD, Kubernetes' },
  { id: 'hardware', label: 'Hardware', icon: '🖥️', desc: 'CPU, RAM, storage, motherboards' },
  { id: 'webdev', label: 'Web Development', icon: '🌍', desc: 'HTML, CSS, JS, REST APIs' },
];

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function parseJsonResponse(responseText) {
  const cleaned = responseText.replace(/```json|```/gi, '').trim();
  return JSON.parse(cleaned);
}

function buildFallbackFlashcards(text, difficulty) {
  const sentences = text.split(/\s+/).filter(Boolean);
  const keywords = Array.from(new Set(sentences.slice(0, 20))).slice(0, 6);
  const level = difficulty || 'medium';
  return [
    { front: `What is the main idea of ${keywords[0] || 'this topic'}?`, back: `The main idea is to understand the key concept and connect it to real examples in ${level} difficulty practice.` },
    { front: 'How does this topic apply in practice?', back: 'It is used by identifying the core rule, linking it to a concrete example, and testing it with a short recall exercise.' },
    { front: 'Why is this concept important?', back: 'It helps turn abstract ideas into something you can explain clearly and remember under pressure.' },
    { front: `What is the difference between ${keywords[1] || 'the topic'} and a common misconception?`, back: 'The key difference is the accurate definition versus a simplified version that leaves out important context or exceptions.' },
    { front: 'What is one practical example of this idea?', back: 'A practical example is a simple scenario where the idea is used, observed, or tested in a real learning task.' },
    { front: 'How can you review this efficiently?', back: 'Review by recalling the answer aloud, checking the definition, and testing yourself with one small quiz.' },
  ];
}

function buildFallbackQuiz(topic) {
  const safeTopic = topic || 'general study';
  return [
    {
      question: `Which approach best helps you learn ${safeTopic}?`,
      options: {
        A: 'Active recall and spaced repetition',
        B: 'Reading the same page once',
        C: 'Highlighting without testing',
        D: 'Memorizing without examples',
      },
      answer: 'A',
      explanation: 'Active recall forces you to retrieve information from memory, which builds stronger understanding than passive reading.',
    },
    {
      question: `Why is explaining a concept out loud useful when studying ${safeTopic}?`,
      options: {
        A: 'It improves memory and clarity',
        B: 'It removes the need for practice',
        C: 'It guarantees perfect scores',
        D: 'It avoids repetition',
      },
      answer: 'A',
      explanation: 'Teaching or explaining the idea out loud reveals gaps in your understanding and reinforces the correct structure.',
    },
    {
      question: 'What is the best next step after you mis-answer a quiz question?',
      options: {
        A: 'Review the explanation and retry the concept',
        B: 'Ignore it and move on',
        C: 'Read the question once and guess',
        D: 'Stop studying the topic',
      },
      answer: 'A',
      explanation: 'Mistakes are useful review signals. Correcting them strengthens retention and helps prevent the same mistake later.',
    },
    {
      question: 'Which review pattern is most effective for deep learning?',
      options: {
        A: 'Short repeated sessions over time',
        B: 'One long cramming session',
        C: 'Only reading notes',
        D: 'Skipping difficult topics',
      },
      answer: 'A',
      explanation: 'Spaced review spreads memory retrieval across time, making the knowledge more durable and easier to recall.',
    },
  ];
}

function buildFallbackITQuiz(category, difficulty) {
  const label = category?.label || 'General IT';
  const detail = difficulty || 'medium';
  return [
    {
      question: `In ${label}, which practice is most useful for mastering the topic at ${detail} level?`,
      options: {
        A: 'Build a small example or lab and test your understanding',
        B: 'Only memorize definitions',
        C: 'Skip the hard parts',
        D: 'Read once without recall',
      },
      answer: 'A',
      explanation: 'Applied practice and recall are stronger learning methods than passive review because they check real understanding.',
    },
    {
      question: `Which habit improves retention when preparing for ${label}?`,
      options: {
        A: 'Mixing short review with active question answering',
        B: 'Only reviewing before the exam',
        C: 'Avoiding mistakes',
        D: 'Using only one study resource',
      },
      answer: 'A',
      explanation: 'Frequent active recall and small review sessions create more durable memory than last-minute review alone.',
    },
    {
      question: `Why is it useful to explain the concept in your own words for ${label}?`,
      options: {
        A: 'It shows which parts you truly understand',
        B: 'It means you no longer need repetition',
        C: 'It guarantees zero mistakes',
        D: 'It removes the need to review',
      },
      answer: 'A',
      explanation: 'If you can explain the idea clearly, it usually means you understand the concept and can apply it more confidently.',
    },
    {
      question: 'Which method improves confidence in technical learning?',
      options: {
        A: 'Reviewing errors and re-solving the problem',
        B: 'Ignoring hard questions',
        C: 'Memorizing without context',
        D: 'Avoiding practice altogether',
      },
      answer: 'A',
      explanation: 'Error review helps you close knowledge gaps and improves confidence because it turns mistakes into learning opportunities.',
    },
  ];
}

async function callClaude(prompt) {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
  if (!apiKey) {
    if (prompt.toLowerCase().includes('flashcard')) {
      const textMatch = prompt.match(/Study material:[\s\S]*?(?:Difficulty:|$)/i);
      const text = textMatch ? textMatch[0].replace('Study material:', '').replace(/Difficulty:[\s\S]*$/i, '').trim() : 'general study';
      return JSON.stringify(buildFallbackFlashcards(text, 'medium'));
    }
    if (prompt.toLowerCase().includes('multiple-choice')) {
      const topicMatch = prompt.match(/Generate 8 multiple-choice questions to test knowledge of: ([\s\S]*?)\n/i);
      const topic = topicMatch ? topicMatch[1].trim() : 'general knowledge';
      return JSON.stringify(buildFallbackQuiz(topic));
    }
    if (prompt.toLowerCase().includes('it quiz')) {
      const categoryMatch = prompt.match(/for: ([\s\S]*?) — /i);
      const categoryName = categoryMatch ? categoryMatch[1].trim() : 'General IT';
      const difficultyMatch = prompt.match(/Difficulty: ([\s\S]*?)\n/i);
      const difficulty = difficultyMatch ? difficultyMatch[1].trim() : 'medium';
      return JSON.stringify(buildFallbackITQuiz({ label: categoryName }, difficulty));
    }
    return JSON.stringify([]);
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  return data.content?.map((item) => item.text || '').join('') || '[]';
}

function summarizeStudyText(text) {
  if (!text.trim()) return ['Add text to create a quick study summary.'];
  const normalized = text.replace(/\s+/g, ' ').trim();
  const sentences = normalized.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 3);
  return sentences.length ? sentences : ['Focus on the key concept, make examples, and test recall.'];
}

function extractKeywords(text) {
  if (!text.trim()) return [];
  const stopWords = new Set([
    'about', 'after', 'again', 'against', 'also', 'always', 'because', 'been', 'before', 'being', 'between', 'could', 'does', 'done', 'during', 'each', 'first', 'from', 'have', 'into', 'just', 'like', 'make', 'many', 'more', 'most', 'much', 'need', 'only', 'other', 'over', 'same', 'some', 'such', 'than', 'that', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'very', 'what', 'when', 'where', 'which', 'while', 'will', 'with', 'your', 'into', 'them', 'there', 'yourself', 'under', 'using', 'study', 'notes', 'topic', 'material'
  ]);

  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 4 && !stopWords.has(word));

  const counts = {};
  words.forEach((word) => {
    counts[word] = (counts[word] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
}

function ProgressBar({ value, max, color = '#22d3ee', track = '#1e293b' }) {
  const pct = max === 0 ? 0 : (value / max) * 100;
  return (
    <div style={{ width: '100%', height: 8, background: track, borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 0.25s ease' }} />
    </div>
  );
}

function App() {
  const [mode, setMode] = useState('flashcard');
  const [studyText, setStudyText] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [flashcards, setFlashcards] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [cardStatuses, setCardStatuses] = useState({});
  const [summary, setSummary] = useState(['Add text to generate a summary.']);
  const [topic, setTopic] = useState('');
  const [customQuiz, setCustomQuiz] = useState([]);
  const [itCategory, setItCategory] = useState('programming');
  const [itDifficulty, setItDifficulty] = useState('medium');
  const [itQuiz, setItQuiz] = useState([]);
  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedSessions, setSavedSessions] = useLocalStorage(STORAGE_KEY, []);
  const [currentSessionName, setCurrentSessionName] = useState('Study Session');
  const [themeMode, setThemeMode] = useLocalStorage('study-theme', 'dark');
  const [notes, setNotes] = useLocalStorage('study-notes', 'Key idea:\n- What I need to remember\n- The current challenge\n- A quick example');
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [focusRemaining, setFocusRemaining] = useState(25 * 60);
  const [isFocusRunning, setIsFocusRunning] = useState(false);
  const [focusSessions, setFocusSessions] = useState(0);
  const [studyHistory, setStudyHistory] = useLocalStorage('study-history', []);
  const [miniExam, setMiniExam] = useState([]);
  const [miniExamIndex, setMiniExamIndex] = useState(0);

  const summaryBuild = useMemo(() => summarizeStudyText(studyText), [studyText]);
  const keywordCloud = useMemo(() => extractKeywords(studyText), [studyText]);
  const reviewQueue = useMemo(
    () => flashcards.filter((_, index) => cardStatuses[index] === 'learning' || cardStatuses[index] === undefined),
    [flashcards, cardStatuses],
  );
  const adaptivePlan = useMemo(() => {
    if (!flashcards.length) {
      return {
        focus: 'Generate a deck to unlock your adaptive plan.',
        plan: ['Add source material', 'Review key ideas', 'Test recall with a quick quiz'],
      };
    }

    const weakCards = flashcards.filter((_, index) => (cardStatuses[index] || 'unseen') === 'learning');
    const strongCards = flashcards.filter((_, index) => (cardStatuses[index] || 'unseen') === 'known');

    if (weakCards.length > 0) {
      return {
        focus: weakCards[0].front,
        plan: [
          'Review weak cards before starting new material.',
          'Explain each answer in your own words.',
          'Run a short recall drill after each round.',
        ],
      };
    }

    if (strongCards.length > 0) {
      return {
        focus: 'Your deck is stable — add a challenge round.',
        plan: [
          'Try a harder question set.',
          'Mix in a recall exam.',
          'Refresh the topic with a short summary.',
        ],
      };
    }

    return {
      focus: 'Start with the basics and build a consistent review loop.',
      plan: ['Read the main idea', 'Mark confidence', 'Repeat with active recall'],
    };
  }, [flashcards, cardStatuses]);

  useEffect(() => {
    if (!flashcards.length) return;
    setCardStatuses((prev) => {
      const next = { ...prev };
      flashcards.forEach((_, index) => {
        if (next[index] === undefined) next[index] = 'unseen';
      });
      return next;
    });
  }, [flashcards]);

  useEffect(() => {
    if (!isFocusRunning) return undefined;

    const timer = setInterval(() => {
      setFocusRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFocusRunning(false);
          setFocusSessions((count) => count + 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFocusRunning]);

  const buildFlashcards = async () => {
    if (!studyText.trim()) {
      setError('Please enter your study material first.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await callClaude(`Convert this study material into 6 flashcards.

Study material:
${studyText}

Difficulty: ${difficulty}
Rules: Focus on key facts, use varied question types, and keep answers concise.
Respond ONLY with a JSON array:
[{"front":"Question?","back":"Answer."}]`);
      const cards = parseJsonResponse(response);
      setFlashcards(Array.isArray(cards) ? cards : buildFallbackFlashcards(studyText, difficulty));
      setCardIndex(0);
      setCardStatuses({});
      setSummary(summaryBuild);
    } catch {
      setError('Generation failed. Using a local fallback set instead.');
      const fallback = buildFallbackFlashcards(studyText, difficulty);
      setFlashcards(fallback);
      setCardIndex(0);
      setSummary(summaryBuild);
    } finally {
      setLoading(false);
    }
  };

  const buildQuiz = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic to generate a quiz.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await callClaude(`Generate 4 multiple-choice questions to test knowledge of: ${topic}

Rules: varied difficulty, plausible distractors, clear explanations.
Respond ONLY with JSON array:
[{"question":"?","options":{"A":"","B":"","C":"","D":""},"answer":"B","explanation":"One sentence."}]`);
      const questions = parseJsonResponse(response);
      setCustomQuiz(Array.isArray(questions) ? questions : buildFallbackQuiz(topic));
    } catch {
      setError('Quiz generation failed. Using a local fallback set instead.');
      setCustomQuiz(buildFallbackQuiz(topic));
    } finally {
      setLoading(false);
    }
  };

  const buildITQuiz = async (categoryId) => {
    const category = IT_CATEGORIES.find((item) => item.id === categoryId) || IT_CATEGORIES[0];
    setItCategory(categoryId);
    setLoading(true);
    setError('');

    try {
      const response = await callClaude(`Generate 4 multiple-choice IT quiz questions for: ${category.label} — ${category.desc}

Difficulty: ${itDifficulty}
Rules: specific and technical, all 4 options plausible, explanations that teach.
Respond ONLY with JSON array:
[{"question":"?","options":{"A":"","B":"","C":"","D":""},"answer":"A","explanation":"One clear sentence."}]`);
      const questions = parseJsonResponse(response);
      setItQuiz(Array.isArray(questions) ? questions : buildFallbackITQuiz(category, itDifficulty));
    } catch {
      setError('IT quiz generation failed. Using a local fallback set instead.');
      setItQuiz(buildFallbackITQuiz(category, itDifficulty));
    } finally {
      setLoading(false);
    }
  };

  const handleCardStatus = (status) => {
    setCardStatuses((prev) => ({ ...prev, [cardIndex]: status }));
    setCardIndex((prev) => (prev + 1 < flashcards.length ? prev + 1 : prev));
  };

  const saveSession = () => {
    const session = {
      id: Date.now(),
      title: currentSessionName,
      cards: flashcards.length,
      topic: topic || 'General study',
      createdAt: new Date().toLocaleString(),
      known: totalKnown,
    };
    setSavedSessions((prev) => [session, ...prev].slice(0, 5));
    setStudyHistory((prev) => [{ ...session, date: new Date().toISOString() }, ...prev].slice(0, 7));
  };

  const totalKnown = Object.values(cardStatuses).filter((value) => value === 'known').length;
  const totalLearning = Object.values(cardStatuses).filter((value) => value === 'learning').length;
  const retentionScore = flashcards.length ? Math.round((totalKnown / flashcards.length) * 100) : 0;
  const focusMinutesDisplay = Math.floor(focusRemaining / 60);
  const focusSecondsDisplay = focusRemaining % 60;

  const startMiniExam = () => {
    const source = flashcards.length ? flashcards : buildFallbackFlashcards(studyText || 'general study', difficulty);
    const nextExam = shuffle(source).slice(0, Math.min(3, source.length)).map((card, index) => ({
      id: `${card.front}-${index}`,
      prompt: card.front,
      answer: card.back,
      reveal: false,
    }));
    setMiniExam(nextExam);
    setMiniExamIndex(0);
  };

  const currentMiniExam = miniExam[miniExamIndex] || null;
  const theme = themeMode === 'dark'
    ? {
        bg: '#020c14',
        panel: '#0f172a',
        panelAlt: '#0b1320',
        panelAlt2: '#111827',
        border: '#1e293b',
        borderSoft: '#334155',
        text: '#edf6ff',
        muted: '#94a3b8',
        accent: '#67e8f9',
        input: '#020c14',
        shadow: 'rgba(0,0,0,0.25)',
      }
    : {
        bg: '#f5f7ff',
        panel: '#ffffff',
        panelAlt: '#f3f1ff',
        panelAlt2: '#edf8ff',
        border: '#dfe7f5',
        borderSoft: '#cddaf5',
        text: '#1d2b3a',
        muted: '#5b6c84',
        accent: '#6c63ff',
        accentSoft: '#8b7dff',
        accent2: '#3aa6ff',
        input: '#f9fbff',
        shadow: 'rgba(108, 99, 255, 0.14)',
      };

  return (
    <div style={{ minHeight: '100vh', padding: '32px 18px 60px', background: theme.bg, color: theme.text, transition: 'all 0.25s ease' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button
              onClick={() => setThemeMode((value) => (value === 'dark' ? 'light' : 'dark'))}
              style={{
                background: theme.panel,
                border: `1px solid ${theme.border}`,
                color: theme.accent,
                padding: '8px 12px',
                borderRadius: 999,
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              {themeMode === 'dark' ? '☀ Light mode' : '🌙 Dark mode'}
            </button>
          </div>

          <div style={{ display: 'inline-block', border: `1px solid ${theme.border}`, borderRadius: 999, padding: '6px 14px', color: theme.accent, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: 11, background: theme.panelAlt }}>
            Study Assistant
          </div>
          <h1 style={{ margin: '16px 0 8px', fontSize: 'clamp(2rem, 5vw, 3.3rem)', letterSpacing: '-0.06em', color: theme.text }}>
            AI Flashcard Generator
          </h1>
          <p style={{ margin: 0, color: theme.muted }}>Study smarter with cards, quizzes, focused review cycles, and progress analytics.</p>
        </header>

        <nav style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '26px' }}>
          {[
            ['flashcard', '⚡ Flashcards'],
            ['quiz', '🎯 Custom Quiz'],
            ['it', '🖥️ IT Quiz'],
            ['planner', '📋 Planner'],
            ['smart', '🧠 Smart Study'],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              style={{
                padding: '10px 18px', borderRadius: 12, cursor: 'pointer',
                background: mode === value ? `${theme.accent}22` : theme.panel,
                border: mode === value ? `1px solid ${theme.accent}` : `1px solid ${theme.border}`,
                color: mode === value ? theme.accent : theme.muted,
                fontWeight: 600,
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '20px', alignItems: 'start' }}>
          <section style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 22, padding: 24, boxShadow: `0 18px 50px ${theme.shadow}` }}>
            {mode === 'flashcard' && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: theme.accent, marginBottom: 8 }}>
                    Study Material
                  </label>
                  <textarea
                    value={studyText}
                    onChange={(event) => setStudyText(event.target.value)}
                    rows={7}
                    placeholder="Paste notes, an article excerpt, or textbook content here..."
                    style={{ width: '100%', padding: '16px 18px', background: theme.input, border: `1px solid ${theme.border}`, borderRadius: 14, color: theme.text, resize: 'vertical', boxShadow: themeMode === 'light' ? 'inset 0 1px 3px rgba(108,99,255,0.06)' : 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                  {['easy', 'medium', 'hard'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setDifficulty(option)}
                      style={{
                        background: difficulty === option ? (themeMode === 'dark' ? '#22d3ee22' : '#ece9ff') : 'transparent',
                        color: difficulty === option ? theme.accent : theme.muted,
                        border: difficulty === option ? `1px solid ${theme.accent}` : `1px solid ${theme.borderSoft}`,
                        borderRadius: 10,
                        padding: '8px 14px',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                  <button onClick={buildFlashcards} disabled={loading} style={{ background: themeMode === 'dark' ? 'linear-gradient(135deg, #22d3ee, #0ea5e9)' : 'linear-gradient(135deg, #7c6cff, #45b7ff)', color: themeMode === 'dark' ? '#032338' : '#ffffff', fontWeight: 800, borderRadius: 12, padding: '12px 18px', cursor: 'pointer', boxShadow: themeMode === 'light' ? '0 10px 24px rgba(108,99,255,0.2)' : 'none' }}>
                    {loading ? 'Generating...' : 'Generate Flashcards'}
                  </button>
                  <button onClick={() => setStudyText('')} style={{ background: 'transparent', border: `1px solid ${theme.borderSoft}`, color: theme.muted, borderRadius: 12, padding: '12px 18px', cursor: 'pointer' }}>
                    Clear
                  </button>
                </div>

                {error && <p style={{ color: '#fca5a5', marginTop: 8 }}>{error}</p>}

                {flashcards.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: theme.muted, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      <span>{cardIndex + 1}/{flashcards.length}</span>
                      <span>{totalKnown} known • {totalLearning} learning</span>
                    </div>
                    <div style={{ background: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 20, boxShadow: themeMode === 'light' ? '0 12px 26px rgba(108,99,255,0.08)' : 'none' }}>
                      <div style={{ marginBottom: 10, color: theme.accent, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                        {cardStatuses[cardIndex] === 'known' ? 'Known' : cardStatuses[cardIndex] === 'learning' ? 'Learning' : 'Unseen'}
                      </div>
                      <h3 style={{ margin: '0 0 12px', fontSize: '1.6rem', lineHeight: 1.3, color: theme.text }}>{flashcards[cardIndex]?.front}</h3>
                      <p style={{ margin: 0, color: theme.text, lineHeight: 1.7 }}>{flashcards[cardIndex]?.back}</p>
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
                      <button onClick={() => handleCardStatus('learning')} style={{ background: '#facc15', color: '#111827', borderRadius: 12, padding: '10px 14px', cursor: 'pointer', fontWeight: 800 }}>
                        Still learning
                      </button>
                      <button onClick={() => handleCardStatus('known')} style={{ background: '#4ade80', color: '#052e16', borderRadius: 12, padding: '10px 14px', cursor: 'pointer', fontWeight: 800 }}>
                        Got it
                      </button>
                      <button onClick={() => setCardIndex((prev) => Math.max(0, prev - 1))} style={{ background: 'transparent', border: `1px solid ${theme.borderSoft}`, color: theme.text, borderRadius: 12, padding: '10px 14px', cursor: 'pointer' }}>
                        Previous
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {mode === 'quiz' && (
              <>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: theme.accent, marginBottom: 8 }}>
                  Topic
                </label>
                <input
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="e.g. Machine learning basics"
                  style={{ width: '100%', padding: '14px 16px', background: theme.input, border: `1px solid ${theme.border}`, borderRadius: 12, color: theme.text, marginBottom: 12 }}
                />

                <button onClick={buildQuiz} disabled={loading} style={{ background: themeMode === 'dark' ? 'linear-gradient(135deg, #34d399, #22c55e)' : 'linear-gradient(135deg, #34d399, #2bb673)', color: themeMode === 'dark' ? '#052e16' : '#ffffff', fontWeight: 800, borderRadius: 12, padding: '12px 18px', cursor: 'pointer', boxShadow: themeMode === 'light' ? '0 10px 20px rgba(70, 185, 117, 0.16)' : 'none' }}>
                  {loading ? 'Generating...' : 'Start Quiz'}
                </button>

                {error && <p style={{ color: '#fca5a5', marginTop: 12 }}>{error}</p>}

                {customQuiz.length > 0 && (
                  <div style={{ marginTop: 22 }}>
                    {customQuiz.map((question, index) => (
                      <div key={`${question.question}-${index}`} style={{ background: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 18, marginBottom: 14, boxShadow: themeMode === 'light' ? '0 8px 18px rgba(108,99,255,0.06)' : 'none' }}>
                        <div style={{ fontSize: 12, color: theme.accent, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                          Question {index + 1}
                        </div>
                        <h4 style={{ margin: '0 0 12px', lineHeight: 1.5, color: theme.text }}>{question.question}</h4>
                        <div style={{ display: 'grid', gap: 8 }}>
                          {Object.entries(question.options).map(([letter, option]) => (
                            <div key={letter} style={{ background: theme.panel, border: `1px solid ${theme.borderSoft}`, borderRadius: 10, padding: '10px 12px', color: theme.text }}>
                              <strong style={{ marginRight: 10 }}>{letter})</strong>{option}
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: 12, color: theme.muted, fontSize: 13, lineHeight: 1.6 }}>
                          <strong style={{ color: '#22c55e' }}>Answer:</strong> {question.answer} · {question.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {mode === 'it' && (
              <>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {IT_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => buildITQuiz(category.id)}
                      style={{
                        background: itCategory === category.id ? (themeMode === 'dark' ? '#22d3ee22' : '#ece9ff') : theme.panelAlt,
                        border: itCategory === category.id ? `1px solid ${theme.accent}` : `1px solid ${theme.borderSoft}`,
                        color: itCategory === category.id ? theme.accent : theme.text,
                        borderRadius: 12,
                        padding: '12px 14px',
                        cursor: 'pointer',
                      }}
                    >
                      {category.icon} {category.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                  {['easy', 'medium', 'hard'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setItDifficulty(option)}
                      style={{
                        background: itDifficulty === option ? (themeMode === 'dark' ? '#22d3ee22' : '#ece9ff') : 'transparent',
                        border: itDifficulty === option ? `1px solid ${theme.accent}` : `1px solid ${theme.borderSoft}`,
                        color: itDifficulty === option ? theme.accent : theme.muted,
                        borderRadius: 10,
                        padding: '8px 12px',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {error && <p style={{ color: '#fca5a5', marginTop: 12 }}>{error}</p>}

                {itQuiz.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    {itQuiz.map((question, index) => (
                      <div key={`${question.question}-${index}`} style={{ background: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 18, marginBottom: 14 }}>
                        <div style={{ color: theme.accent, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>IT Quiz</div>
                        <h4 style={{ margin: '0 0 12px', lineHeight: 1.5, color: theme.text }}>{question.question}</h4>
                        {Object.entries(question.options).map(([letter, option]) => (
                          <div key={letter} style={{ background: theme.panel, border: `1px solid ${theme.borderSoft}`, borderRadius: 10, padding: '10px 12px', marginBottom: 8, color: theme.text }}>
                            <strong>{letter})</strong> {option}
                          </div>
                        ))}
                        <div style={{ marginTop: 10, color: theme.muted }}>
                          <strong style={{ color: '#4ade80' }}>Correct:</strong> {question.answer} · {question.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {mode === 'planner' && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: theme.accent, marginBottom: 8 }}>
                    Session Name
                  </label>
                  <input
                    value={currentSessionName}
                    onChange={(event) => setCurrentSessionName(event.target.value)}
                    style={{ width: '100%', padding: '12px 14px', background: theme.input, border: `1px solid ${theme.border}`, borderRadius: 12, color: theme.text }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ color: theme.muted }}>Daily goal</span>
                    <strong style={{ color: theme.accent }}>{goal} cards</strong>
                  </div>
                  <input type="range" min="5" max="40" value={goal} onChange={(event) => setGoal(Number(event.target.value))} style={{ width: '100%' }} />
                </div>

                <div style={{ background: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ color: theme.muted }}>Progress</span>
                    <strong style={{ color: theme.accent }}>{Math.min(100, Math.round((flashcards.length / goal) * 100))}%</strong>
                  </div>
                  <ProgressBar value={Math.min(flashcards.length, goal)} max={goal} color={theme.accent} track={themeMode === 'light' ? '#e6ecf7' : '#1e293b'} />
                </div>

                <div style={{ background: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 16 }}>
                  <div style={{ color: theme.accent, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                    Quick study summary
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, color: theme.text, display: 'grid', gap: 8 }}>
                    {summaryBuild.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginTop: 18 }}>
                  <button onClick={saveSession} style={{ background: themeMode === 'dark' ? 'linear-gradient(135deg, #22d3ee, #38bdf8)' : 'linear-gradient(135deg, #6c63ff, #4ab0ff)', color: themeMode === 'dark' ? '#032338' : '#ffffff', fontWeight: 800, borderRadius: 12, padding: '12px 18px', cursor: 'pointer' }}>
                    Save session
                  </button>
                </div>
              </>
            )}

            {mode === 'smart' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
                  <div style={{ background: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 18 }}>
                    <div style={{ color: theme.muted, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Retention</div>
                    <div style={{ fontSize: 32, fontWeight: 800, marginTop: 10, color: theme.text }}>{retentionScore}%</div>
                  </div>
                  <div style={{ background: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 18 }}>
                    <div style={{ color: theme.muted, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Focus streak</div>
                    <div style={{ fontSize: 32, fontWeight: 800, marginTop: 10, color: theme.text }}>{focusSessions}</div>
                  </div>
                  <div style={{ background: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 18 }}>
                    <div style={{ color: theme.muted, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Due review</div>
                    <div style={{ fontSize: 32, fontWeight: 800, marginTop: 10, color: theme.text }}>{reviewQueue.length}</div>
                  </div>
                </div>

                <div style={{ background: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 18, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div>
                      <div style={{ color: theme.accent, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Focus timer</div>
                      <div style={{ color: theme.muted, fontSize: 12, marginTop: 4 }}>Deep work block</div>
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: theme.text }}>
                      {String(focusMinutesDisplay).padStart(2, '0')}:{String(focusSecondsDisplay).padStart(2, '0')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    {[15, 25, 45].map((minutes) => (
                      <button
                        key={minutes}
                        onClick={() => {
                          setFocusMinutes(minutes);
                          setFocusRemaining(minutes * 60);
                          setIsFocusRunning(false);
                        }}
                        style={{
                          background: focusMinutes === minutes ? (themeMode === 'dark' ? '#22d3ee22' : '#ece9ff') : theme.panel,
                          border: focusMinutes === minutes ? `1px solid ${theme.accent}` : `1px solid ${theme.borderSoft}`,
                          borderRadius: 10,
                          padding: '8px 12px',
                          color: focusMinutes === minutes ? theme.accent : theme.text,
                          cursor: 'pointer',
                        }}
                      >
                        {minutes}m
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button onClick={() => setIsFocusRunning((value) => !value)} style={{ background: themeMode === 'dark' ? 'linear-gradient(135deg, #34d399, #22c55e)' : 'linear-gradient(135deg, #2ec98d, #39b971)', color: themeMode === 'dark' ? '#052e16' : '#ffffff', fontWeight: 800, borderRadius: 12, padding: '10px 16px', cursor: 'pointer' }}>
                      {isFocusRunning ? 'Pause' : 'Start'} focus
                    </button>
                    <button onClick={() => { setIsFocusRunning(false); setFocusRemaining(focusMinutes * 60); }} style={{ background: 'transparent', border: `1px solid ${theme.borderSoft}`, color: theme.muted, borderRadius: 12, padding: '10px 16px', cursor: 'pointer' }}>
                      Reset
                    </button>
                  </div>
                </div>

                <div style={{ background: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 18, marginBottom: 20 }}>
                  <div style={{ color: theme.accent, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
                    Spaced repetition review
                  </div>
                  {reviewQueue.length === 0 ? (
                    <p style={{ color: theme.muted, margin: 0 }}>Everything looks ready for the next round.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: 10 }}>
                      {reviewQueue.slice(0, 4).map((card, index) => (
                        <div key={`${card.front}-${index}`} style={{ background: theme.panel, border: `1px solid ${theme.borderSoft}`, borderRadius: 12, padding: 12 }}>
                          <div style={{ fontWeight: 700, color: theme.text }}>{card.front}</div>
                          <div style={{ color: theme.muted, fontSize: 12, marginTop: 6 }}>{card.back}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ background: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 18, marginBottom: 20 }}>
                  <div style={{ color: theme.accent, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
                    Adaptive study plan
                  </div>
                  <div style={{ color: theme.text, fontWeight: 700, marginBottom: 8 }}>{adaptivePlan.focus}</div>
                  <ul style={{ margin: 0, paddingLeft: 18, color: theme.text, display: 'grid', gap: 8 }}>
                    {adaptivePlan.plan.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>

                <div style={{ background: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 18, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ color: theme.accent, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      Recall challenge
                    </div>
                    <button onClick={startMiniExam} style={{ background: themeMode === 'dark' ? '#22d3ee22' : '#ece9ff', border: `1px solid ${theme.accent}`, color: theme.accent, borderRadius: 10, padding: '8px 12px', cursor: 'pointer' }}>
                      New exam
                    </button>
                  </div>

                  {currentMiniExam ? (
                    <div>
                      <div style={{ color: theme.muted, fontSize: 12, marginBottom: 8 }}>Card {miniExamIndex + 1} / {miniExam.length}</div>
                      <div style={{ background: theme.panel, border: `1px solid ${theme.borderSoft}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                        <div style={{ fontWeight: 700, lineHeight: 1.5, color: theme.text }}>{currentMiniExam.prompt}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button onClick={() => setMiniExam((items) => items.map((item, idx) => idx === miniExamIndex ? { ...item, reveal: true } : item))} style={{ background: themeMode === 'dark' ? '#34d399' : '#22c55e', color: themeMode === 'dark' ? '#052e16' : '#ffffff', borderRadius: 10, padding: '9px 12px', cursor: 'pointer', fontWeight: 700 }}>
                          Reveal answer
                        </button>
                        <button onClick={() => setMiniExamIndex((idx) => (idx + 1 < miniExam.length ? idx + 1 : 0))} style={{ background: 'transparent', border: `1px solid ${theme.borderSoft}`, color: theme.text, borderRadius: 10, padding: '9px 12px', cursor: 'pointer' }}>
                          Next question
                        </button>
                      </div>
                      {currentMiniExam.reveal && (
                        <div style={{ marginTop: 12, background: themeMode === 'dark' ? '#052e16' : '#eafaf1', border: `1px solid ${themeMode === 'dark' ? '#4ade80' : '#86efac'}`, borderRadius: 10, padding: 12, color: themeMode === 'dark' ? '#d1fae5' : '#166534', lineHeight: 1.6 }}>
                          {currentMiniExam.answer}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p style={{ color: theme.muted, margin: 0 }}>Generate a quick recall round to test yourself on your most important cards.</p>
                  )}
                </div>

                <div style={{ background: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 18 }}>
                  <div style={{ color: theme.accent, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
                    Study notes
                  </div>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={7}
                    style={{ width: '100%', background: theme.input, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 14, color: theme.text, resize: 'vertical' }}
                  />
                </div>
              </>
            )}
          </section>

          <aside style={{ display: 'grid', gap: 20 }}>
            <div style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 22, padding: 20 }}>
              <div style={{ color: theme.accent, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 11, marginBottom: 12 }}>
                Study insights
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ background: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 14 }}>
                  <div style={{ color: theme.muted, fontSize: 12 }}>Cards created</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: theme.text }}>{flashcards.length}</div>
                </div>
                <div style={{ background: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 14 }}>
                  <div style={{ color: theme.muted, fontSize: 12 }}>Known cards</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: theme.text }}>{totalKnown}</div>
                </div>
                <div style={{ background: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 14 }}>
                  <div style={{ color: theme.muted, fontSize: 12 }}>Learning cards</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: theme.text }}>{totalLearning}</div>
                </div>
              </div>
            </div>

            <div style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 22, padding: 20 }}>
              <div style={{ color: theme.accent, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 11, marginBottom: 12 }}>
                Saved sessions
              </div>
              {savedSessions.length === 0 ? (
                <p style={{ color: theme.muted, margin: 0 }}>No sessions saved yet.</p>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {savedSessions.map((item) => (
                    <div key={item.id} style={{ background: theme.panelAlt, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 12 }}>
                      <div style={{ fontWeight: 700, color: theme.text }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: theme.muted }}>{item.createdAt}</div>
                      <div style={{ fontSize: 12, color: theme.accent, marginTop: 6 }}>{item.cards} cards · {item.topic}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 22, padding: 20 }}>
              <div style={{ color: theme.accent, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 11, marginBottom: 12 }}>
                Keyword map
              </div>
              {keywordCloud.length === 0 ? (
                <p style={{ color: theme.muted, margin: 0 }}>Add source text to generate topic keywords.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {keywordCloud.map((word, index) => (
                    <span key={`${word}-${index}`} style={{
                      background: index % 2 === 0 ? (themeMode === 'dark' ? '#22d3ee22' : '#e7e3ff') : (themeMode === 'dark' ? '#34d39922' : '#eaf8ff'),
                      border: `1px solid ${theme.borderSoft}`,
                      color: theme.text,
                      borderRadius: 999,
                      padding: '7px 10px',
                      fontSize: 12,
                    }}>
                      {word}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 22, padding: 20 }}>
              <div style={{ color: theme.accent, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 11, marginBottom: 12 }}>
                Smart tips
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, color: theme.text, display: 'grid', gap: 8 }}>
                <li>Review learning cards before new material.</li>
                <li>Use the focus timer for short deep-work blocks.</li>
                <li>Save sessions after each strong study sprint.</li>
                <li>Use keyword clusters to spot weak topic areas.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
