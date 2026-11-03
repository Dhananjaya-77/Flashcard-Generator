# 📚 AI Flashcard & Quiz Generator

An intelligent, interactive study platform that uses AI to generate flashcards and quizzes from any study material. Built with React, this application helps students learn more effectively with personalized content and progress tracking.

## ✨ Features

### 🎴 Smart Flashcard Generator
- **AI-Powered Generation** - Convert any text (notes, textbook excerpts, articles) into flashcards
- **Three Difficulty Levels** - Easy (definitions), Medium (applications), Hard (analysis & edge cases)
- **Progress Tracking** - Mark cards as "Known" or "Still Learning"
- **Spaced Repetition** - Review only the cards you're still learning
- **Shuffle & Restart** - Customize your study session
- **Visual Progress** - Track your mastery with color-coded dots and progress bars

### 🎯 Custom Quiz Generator
- **Any Topic** - Generate quizzes on anything from Python to World History
- **8 Questions** - Optimal length for focused study sessions
- **Timed Questions** - 20 seconds per question to build recall speed
- **Instant Feedback** - Explanations for each answer
- **Detailed Review** - Review all answers with explanations after completion
- **Score Tracking** - Track correct answers, wrong answers, and timeouts

### 💻 IT & Tech Quiz Bank
- **8 Specialized Categories**:
  - 🌐 Networking (TCP/IP, DNS, HTTP, OSI model)
  - 💻 Operating Systems (Linux, Windows, processes, memory)
  - 🗄️ Databases (SQL, NoSQL, indexing, transactions)
  - 🔐 Cybersecurity (Encryption, attacks, firewalls)
  - ⌨️ Programming (OOP, algorithms, data structures)
  - ☁️ Cloud & DevOps (AWS, Docker, CI/CD, Kubernetes)
  - 🖥️ Hardware (CPU, RAM, storage, motherboards)
  - 🌍 Web Development (HTML, CSS, JS, REST APIs)
- **Difficulty Levels** - Beginner to advanced technical questions
- **Technical Depth** - Realistic interview-level questions

## 🎨 User Interface Highlights

- **Clean, Modern Design** - Glass morphism cards with gradient backgrounds
- **Dark Theme** - Easy on the eyes for long study sessions
- **Animated Flashcards** - 3D flip animations with smooth transitions
- **Timer Rings** - Visual countdown for quiz questions
- **Progress Indicators** - Real-time tracking of your study progress
- **Responsive Layout** - Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-flashcard-generator
cd ai-flashcard-generator

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will open at `http://localhost:5173`

### API Setup

This application uses **Claude API** (Anthropic) for AI generation:

1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Create a `.env` file in the root directory:
```env
VITE_CLAUDE_API_KEY=your-api-key-here
```

**Note:** The current version uses a direct API call. For production, implement a backend proxy to protect your API key.

## 📖 How to Use

### Generate Flashcards
1. Select **"Flashcards"** mode
2. Paste your study material (notes, textbook excerpt, etc.)
3. Choose difficulty level (Easy/Medium/Hard)
4. Click "Generate Flashcards"
5. Study by flipping cards and marking your progress

### Create a Custom Quiz
1. Select **"Custom Quiz"** mode
2. Enter any topic (e.g., "Machine Learning basics")
3. Click "Start Quiz"
4. Answer 8 multiple-choice questions within 20 seconds each
5. Review your results and explanations

### Take IT Quizzes
1. Select **"IT Quiz"** mode
2. Choose difficulty level
3. Pick a category (Networking, Programming, etc.)
4. Test your technical knowledge
5. Review detailed explanations for each answer

## 🧠 Learning Methodology

### Spaced Repetition System
- **Known Cards** - Mastered concepts you don't need to review
- **Learning Cards** - Concepts you're still working on
- **Unseen Cards** - New material to study

### Quiz Design Principles
- **Active Recall** - Forces retrieval from memory
- **Time Pressure** - Builds real recall speed
- **Immediate Feedback** - Explanations reinforce learning
- **Spaced Review** - Option to retry and review weak areas

## 🛠️ Technical Architecture

### Frontend Stack
- **React 18** - UI framework with hooks
- **CSS-in-JS** - Inline styles for component-scoped styling
- **Anthropic API** - AI generation for flashcards and quizzes

### Key Components

| Component | Purpose |
|-----------|---------|
| `FlashCard` | 3D flip card with front/back |
| `FlashcardDeck` | Manages card deck, progress, navigation |
| `QuizQuestion` | Multiple-choice question with timer |
| `QuizRunner` | Orchestrates quiz flow and scoring |
| `ScoreScreen` | Results display with performance metrics |
| `ReviewScreen` | Detailed answer review with explanations |

### AI Prompts Engineered For
- **Flashcards** - Structured JSON output with varied question types
- **Custom Quizzes** - Topic-specific questions with plausible distractors
- **IT Quizzes** - Technical depth with real-world scenarios

## 📊 Features in Detail

### Flashcard Progress Tracking
```
✓ Known: 15 cards mastered
↺ Learning: 3 cards in progress
— Unseen: 2 cards remaining
```

### Quiz Scoring Metrics
- **Correct** - Answered correctly within time limit
- **Wrong** - Incorrect answer selected
- **Timed Out** - No answer within 20 seconds

### Progress Visualizations
- Color-coded status dots (Green/Yellow/Gray)
- Progress bars with smooth animations
- Performance summaries with emoji indicators

## 🔒 Privacy & Data

- **No Data Storage** - All flashcards and quizzes are generated on-demand
- **No Tracking** - No analytics or user tracking
- **API Only** - Content is sent to AI, processed, and discarded

## 🎯 Use Cases

### For Students
- Convert lecture notes to flashcards
- Test knowledge before exams
- Learn new subjects systematically
- Prepare for technical interviews

### For Teachers
- Generate quizzes from lesson materials
- Create differentiated content by difficulty
- Provide interactive study aids

### For Self-Learners
- Study any topic with personalized content
- Track progress across subjects
- Build technical knowledge for certifications

## 🐛 Troubleshooting

### Common Issues

**"Failed to generate" error**
- Check your API key configuration
- Ensure you have internet connection
- Verify API credits on Anthropic account

**Slow generation**
- Large text inputs take longer to process
- Try breaking material into smaller chunks

**Quiz not loading**
- Refresh the page
- Check console for errors
- Ensure API is responding

## 🚀 Future Enhancements

- [ ] **User Accounts** - Save progress across sessions
- [ ] **Export Flashcards** - PDF/Anki format support
- [ ] **Study Analytics** - Performance over time graphs
- [ ] **Collaborative Decks** - Share with classmates
- [ ] **Voice Input** - Hands-free studying
- [ ] **Mobile App** - React Native version
- [ ] **Offline Mode** - Cache generated content
- [ ] **More Quiz Types** - True/False, Fill in blank
- [ ] **Image Support** - Diagrams in flashcards
- [ ] **Text-to-Speech** - Audio playback of questions

## 🤝 Contributing

Contributions are welcome! Areas for contribution:

1. **Bug Fixes** - Report issues via GitHub
2. **Feature Requests** - Open an issue for discussion
3. **UI Improvements** - Better responsive design
4. **Performance** - Optimize API calls and rendering
5. **Documentation** - Improve README and code comments

### Development Guidelines
```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm preview
```

## 📄 License

MIT License - Free for personal and educational use

## 🙏 Acknowledgments

- **Anthropic** for Claude API
- **React** team for the framework
- Open source community for inspiration

