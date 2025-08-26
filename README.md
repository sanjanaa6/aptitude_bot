# Quantitative Chatbot

A comprehensive learning platform for quantitative topics with AI-powered explanations, interactive quizzes, and personal study tools.

## ✨ Features

### 🎯 **Core Learning**
- **AI-Powered Explanations**: Get detailed explanations of mathematical concepts using advanced AI
- **Topic Organization**: 39 organized topics across Arithmetic and Data Interpretation
- **Progress Tracking**: Monitor your learning progress across all topics
- **Interactive Chat**: Ask follow-up questions and get personalized help

### 🧠 **Practice Quizzes** (NEW!)
- **Multiple Choice Questions**: Test your knowledge with carefully crafted questions
- **Topic-Specific Quizzes**: Practice questions tailored to each mathematical concept
- **Difficulty Levels**: Questions range from easy to hard
- **Timed Assessments**: Track your performance and speed
- **Immediate Feedback**: See correct answers and explanations after completion
- **Progress Tracking**: Monitor your quiz performance over time

### 📚 **Bookmarks & Notes** (NEW!)
- **Save Important Content**: Bookmark key explanations and concepts
- **Personal Notes**: Add your own insights and study notes
- **Topic Organization**: Organize bookmarks and notes by topic
- **Easy Management**: Edit, update, and delete your saved content
- **Quick Access**: Find your saved information instantly

### 🏆 **Gamification System** (NEW!)
- **Achievement Badges**: Earn badges for completing topics, taking quizzes, and maintaining study streaks
- **Points & Levels**: Gain experience points and level up as you learn
- **Study Streaks**: Track your daily learning consistency
- **Progress Tracking**: Visual progress bars for upcoming achievements
- **Leaderboards**: Compete with other learners (admin view)
- **Badge Categories**: Common, Rare, Epic, and Legendary badges with different point values
- **Real-time Updates**: Badges and points awarded automatically as you learn

### 🔐 **User Management**
- **Secure Authentication**: JWT-based login system
- **User Profiles**: Personalized learning experience
- **Progress Persistence**: Your learning data is saved and synced

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- MongoDB
- Node.js 16+

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   Run the setup script or manually copy `env.example` to `.env`:
   ```bash
   python setup_env.py
   ```
   Then configure your `.env` file:
   ```env
   # Database Configuration
   MONGO_URI=mongodb://localhost:27017
   MONGO_DB=Quantitative-chatbot
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   
   # API Configuration
   OPENROUTER_API_KEY=your-openrouter-api-key-here
   
   # Environment Configuration
   ENVIRONMENT=development
   ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
   
   # Logging Configuration
   LOG_LEVEL=INFO
   LOG_FILE=app.log
   ```

5. **Test backend structure**:
   ```bash
   python test_backend.py
   ```

6. **Start the backend**:
   ```bash
   python main.py
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

## 📖 How to Use

### Taking Quizzes

1. **Select a Topic**: Choose a topic from the left panel
2. **Switch to Quiz Tab**: Click the "Quiz" tab in the main area
3. **Answer Questions**: Select your answers from multiple choice options
4. **Navigate**: Use Previous/Next buttons to move between questions
5. **Submit**: Complete all questions and submit your quiz
6. **Review Results**: See your score, time taken, and correct answers

### Managing Bookmarks & Notes

1. **Switch to Bookmarks Tab**: Click the "Bookmarks" tab
2. **Create Content**: Click "Add Bookmark" or "Add Note"
3. **Fill Details**: Enter title and content
4. **Organize**: Your content is automatically organized by topic
5. **Edit/Delete**: Manage your saved content as needed

### Study Workflow

1. **Learn**: Read AI explanations of topics
2. **Practice**: Take quizzes to test understanding
3. **Save**: Bookmark important concepts and add personal notes
4. **Review**: Access your saved content for revision
5. **Track Progress**: Monitor your learning journey

## 🔧 **New Features & Improvements**

### **Enhanced Security & Logging**
- **Environment-Based CORS**: Configurable CORS settings for development and production
- **Structured Logging**: Comprehensive logging with file and console output
- **Request Logging**: All API requests and responses are logged with timing
- **Error Tracking**: Centralized error handling and logging
- **Security Headers**: Proper CORS configuration with environment-specific settings

### **Production Ready**
- **Environment Configuration**: Separate settings for development and production
- **Log Levels**: Configurable logging levels (DEBUG, INFO, WARNING, ERROR)
- **Global Exception Handling**: Catches and logs all unhandled exceptions
- **Performance Monitoring**: Request timing and performance metrics

## 🏗️ Architecture
```
backend/
├── models.py          # Data models and schemas
├── database.py        # Database connection and operations
├── auth.py           # Authentication and JWT handling
├── quiz_service.py   # Quiz business logic
├── bookmark_service.py # Bookmarks and notes logic
├── routers/          # API route handlers
│   ├── quiz.py       # Quiz endpoints
│   └── bookmarks.py  # Bookmark/note endpoints
└── main.py           # Main application entry point
```

### Frontend Structure
```
frontend/src/
├── components/
│   ├── Quiz.jsx          # Quiz interface
│   ├── Bookmarks.jsx     # Bookmarks and notes management
│   ├── Gamification.jsx  # Gamification dashboard
│   ├── Chat.jsx          # AI chat interface
│   └── ...               # Other components
├── admin/
│   └── GamificationManager.jsx  # Admin gamification management
├── api.js                # API client functions
└── App.jsx               # Main application component
```

## 🔧 API Endpoints

### Quiz Endpoints
- `GET /quiz/topics` - Get available quiz topics
- `POST /quiz/questions` - Get quiz questions for a topic
- `POST /quiz/submit` - Submit quiz answers
- `GET /quiz/results` - Get user's quiz results

### Bookmark Endpoints
- `GET /bookmarks/` - Get user's bookmarks
- `POST /bookmarks/` - Create a new bookmark
- `PUT /bookmarks/{id}` - Update a bookmark
- `DELETE /bookmarks/{id}` - Delete a bookmark

### Note Endpoints
- `GET /bookmarks/notes` - Get user's notes
- `POST /bookmarks/notes` - Create a new note
- `PUT /bookmarks/notes/{id}` - Update a note
- `DELETE /bookmarks/notes/{id}` - Delete a note

### Gamification Endpoints
- `GET /gamification/stats` - Get user's gamification statistics
- `GET /gamification/badges` - Get user's earned badges
- `GET /gamification/progress` - Get progress towards unearned badges
- `POST /gamification/action` - Record user action and trigger badge checks
- `POST /gamification/initialize` - Initialize user's gamification data
- `POST /gamification/admin/badges/seed` - Seed default badges (admin only)
- `GET /gamification/admin/badges` - Get all available badges (admin only)
- `GET /gamification/admin/leaderboard` - Get leaderboard (admin only)

## 🎨 Customization

### Adding New Quiz Questions
Edit `backend/quiz_service.py` to add new questions to the `SAMPLE_QUIZZES` dictionary.

### Modifying Topics
Update the topics in `backend/main.py` in the `get_sections()` function.

### Styling
Modify the inline styles in the React components or add CSS files for custom styling.

## 🚧 Development

### Running Tests
```bash
cd backend
python test_backend.py
python test_gamification.py
```

### Code Structure
- **Models**: Define data structures using Pydantic
- **Services**: Business logic and data operations
- **Routers**: API endpoint definitions
- **Components**: React UI components

### Adding New Features
1. Define models in `models.py`
2. Create service functions in appropriate service files
3. Add API endpoints in router files
4. Create React components for the frontend
5. Update the main App.jsx to include new features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify your environment variables are set correctly
3. Ensure MongoDB is running
4. Check that all dependencies are installed

## 🔮 Future Enhancements

- **Spaced Repetition**: Smart review scheduling
- **Performance Analytics**: Detailed learning insights
- **Study Groups**: Collaborative learning features
- **Mobile App**: Native mobile experience
- **Offline Mode**: Download content for offline study
- **Voice Input**: Speak your questions
- **Image Recognition**: Upload math problems as images
