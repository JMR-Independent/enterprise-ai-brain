# AI Chatbot Frontend

A modern React frontend for the AI chatbot with RAG capabilities, built with TypeScript, Tailwind CSS, and Vite.

## 🚀 Features

### ✅ Core Features
- **Real-time Chat Interface** - Modern chat UI with typing animations
- **Document Upload** - Drag-and-drop file upload with progress tracking
- **RAG Integration** - Chat with your documents using AI
- **Authentication** - Secure JWT-based login/register
- **Document Management** - Upload, process, and manage documents
- **Responsive Design** - Mobile-first responsive layout

### ✅ Advanced Features
- **Dark/Light Theme** - System theme detection with manual toggle
- **Document Search** - Semantic search through uploaded documents
- **Source Citations** - View document sources for AI responses
- **Chat Export** - Export conversations to JSON
- **File Processing Status** - Real-time document processing updates
- **Error Handling** - Comprehensive error states and recovery

## 🛠️ Tech Stack

- **React 18** - Latest React with hooks and concurrent features
- **TypeScript** - Full type safety and intellisense
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Query** - Server state management
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form handling and validation
- **React Dropzone** - File upload with drag-and-drop
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, Card)
│   ├── chat/           # Chat-specific components
│   ├── documents/      # Document management components
│   └── Layout.tsx      # Main layout component
├── pages/              # Page components
│   ├── Login.tsx       # Authentication pages
│   ├── Register.tsx
│   ├── Chat.tsx        # Main chat interface
│   ├── Documents.tsx   # Document management
│   └── Profile.tsx     # User profile
├── stores/             # Zustand state stores
│   ├── authStore.ts    # Authentication state
│   ├── chatStore.ts    # Chat and conversations
│   ├── documentStore.ts # Document management
│   └── uiStore.ts      # UI state (theme, sidebar)
├── services/           # API integration
│   └── api.ts          # Axios API client
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
│   └── utils.ts        # Helper functions
├── types/              # TypeScript type definitions
│   └── index.ts        # All type definitions
└── styles/             # Global styles and CSS
    └── index.css       # Tailwind and custom styles
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Running FastAPI backend at `localhost:8000`

### Installation

1. **Navigate to frontend directory:**
   ```bash
   cd ai-chatbot/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### Build for Production

```bash
npm run build
npm run preview
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_APP_NAME` | Application name | `AI Chatbot` |
| `VITE_ENABLE_RAG` | Enable RAG features | `true` |
| `VITE_MAX_FILE_SIZE` | Max upload size (bytes) | `10485760` (10MB) |

### API Integration

The frontend connects to these backend endpoints:

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

#### Chat
- `POST /api/chat/` - Send message with RAG support
- `GET /api/chat/conversations` - List conversations
- `POST /api/chat/conversations` - Create conversation
- `GET /api/chat/conversations/{id}/messages` - Get messages
- `DELETE /api/chat/conversations/{id}` - Delete conversation
- `POST /api/chat/search` - Search documents

#### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/` - List documents
- `GET /api/documents/{id}` - Get document details
- `DELETE /api/documents/{id}` - Delete document
- `GET /api/documents/{id}/status` - Processing status

## 🎨 UI Components

### Base Components
- **Button** - Multiple variants and sizes
- **Input** - Form inputs with validation styles
- **Card** - Content containers
- **LoadingSpinner** - Loading states

### Chat Components
- **MessageBubble** - Chat message display
- **MessageInput** - Message composition
- **TypingIndicator** - AI typing animation
- **SourceDocuments** - Document citations

### Document Components
- **FileUpload** - Drag-and-drop upload
- **DocumentList** - Document management
- **ProcessingStatus** - Real-time status updates

## 🎯 Key Features

### Real-time Chat
- Message bubbles with role-based styling
- Typing indicators and animations
- Source document citations
- RAG toggle for enhanced responses
- Conversation history and management

### Document Management
- Drag-and-drop file upload
- Support for PDF, DOCX, TXT, CSV, XLSX
- Real-time processing status
- File validation and error handling
- Document search and filtering

### Authentication
- JWT-based authentication
- Secure token storage
- Auto-refresh on token expiry
- Protected routes

### Theme System
- Light/Dark/System theme modes
- CSS custom properties
- Smooth transitions
- Persistent preferences

### Responsive Design
- Mobile-first approach
- Collapsible sidebar
- Touch-friendly interactions
- Optimized for all screen sizes

## 📱 Mobile Experience

- **Responsive Layout** - Adapts to all screen sizes
- **Touch Interactions** - Optimized for mobile devices
- **Mobile Navigation** - Collapsible sidebar with backdrop
- **File Upload** - Mobile-friendly file selection
- **Performance** - Optimized bundle size and loading

## 🔒 Security

- **XSS Protection** - Input sanitization
- **CSRF Prevention** - Token-based authentication
- **Secure Storage** - Encrypted local storage
- **API Validation** - Request/response validation

## 🚀 Deployment

### Docker (Recommended)

```bash
# Build Docker image
docker build -t ai-chatbot-frontend .

# Run container
docker run -p 3000:80 ai-chatbot-frontend
```

### Static Hosting

```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting provider
```

### Environment-specific Builds

```bash
# Development
npm run dev

# Production
npm run build && npm run preview
```

## 🧪 Development

### Code Quality
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Formatting (if using Prettier)
npm run format
```

### Hot Module Replacement
- Instant updates during development
- Preserves application state
- Fast refresh for React components

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for all new components
3. Follow Tailwind CSS conventions
4. Add proper error handling
5. Test on mobile devices

## 📚 API Documentation

The frontend integrates with the FastAPI backend's automatic documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🐛 Troubleshooting

### Common Issues

**CORS Errors:**
- Ensure backend CORS settings include frontend URL
- Check `VITE_API_URL` environment variable

**Build Errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

**API Connection:**
- Verify backend is running on port 8000
- Check network tab for failed requests
- Ensure JWT token is valid

---

🎉 **Your modern React frontend is ready!** Start chatting with your AI assistant and upload documents for enhanced RAG conversations.