# AI-Powered Dental Chatbot Widget

An intelligent, AI-powered chatbot for Dr. Ahmed Dental Care using Google Gemini API. This chatbot understands natural language, handles complex conversations, books appointments with real-time availability checking, and provides personalized responses based on user authentication status.

## Key Features

### AI Intelligence (Google Gemini 1.5 Flash)
- **Natural Language Understanding** - Powered by Google Gemini for human-like conversations
- **Function Calling** - Real-time appointment booking with database integration
- **Context Memory** - MongoDB-persisted conversation history
- **Authentication Awareness** - Different experiences for logged-in vs guest users
- **Emergency Detection** - Prioritizes urgent situations with immediate guidance

### Capabilities
- **Book Appointments** - Check real availability, collect info, confirm booking
- **Service Information** - Detailed info on all services with accurate pricing
- **Clinic Information** - Hours, location, contact details
- **Emergency Guidance** - Immediate help for dental emergencies
- **User Recognition** - Pre-fills data for logged-in users

## Architecture

```
Frontend (React)              Backend (Node.js)              External
┌─────────────────┐          ┌─────────────────┐          ┌──────────┐
│ ChatbotWidget   │◄────────►│ /api/chatbot/*  │◄────────►│ Google   │
│ + AuthContext   │  REST    │ + GeminiService │  API     │ Gemini   │
│ + useChatSession│          │ + SessionMgr    │          └──────────┘
└─────────────────┘          └────────┬────────┘
                                      │
                             ┌────────▼────────┐
                             │    MongoDB      │
                             │ - chat_sessions │
                             │ - chat_messages │
                             └─────────────────┘
```

## Files Structure

```
chatbot/
├── ChatbotWidget.jsx        # Main React component (UI)
├── ChatbotConfig.js         # Clinic info and quick actions
├── hooks/
│   └── useChatSession.js    # Session management hook
├── index.js                 # Exports
└── README.md                # This documentation

backend/
├── models/
│   ├── ChatSession.js       # Session schema
│   └── ChatMessage.js       # Message schema
├── services/
│   ├── geminiService.js     # Gemini AI integration
│   └── chatSessionManager.js # Session CRUD
├── controllers/
│   └── chatbotController.js # Request handlers
├── routes/
│   └── chatbotRoutes.js     # API routes
└── middleware/
    └── optionalAuth.js      # Soft authentication
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/message` | Send message, get AI response |
| POST | `/api/chatbot/session` | Create new session |
| GET | `/api/chatbot/session/:id` | Get session history |
| DELETE | `/api/chatbot/session/:id` | Clear session |
| PUT | `/api/chatbot/session/:id/auth` | Update session with auth |
| GET | `/api/chatbot/quick-info` | Get clinic info |

## Environment Variables

Add to `.env`:

```bash
# Google Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Chatbot Configuration
CHATBOT_RATE_LIMIT=10
CHATBOT_SESSION_TIMEOUT=7200000
```

Get your FREE API key from: https://aistudio.google.com/app/apikey

## Authentication Scenarios

### A: Logged-In User
- Pre-filled name, email, phone
- Streamlined booking experience
- "I can help you book using your account details"

### B: Registered but Not Logged In
- Detected via email/phone during booking
- Prompted to log in for faster experience
- "I notice you have an account. Would you like to log in?"

### C: New Guest
- Full information collection during booking
- Account creation offered after booking

### D: Returning Guest
- Recognized via browser storage
- Warm welcome back message

## AI Function Calling

The chatbot has access to these functions:

### check_availability(date)
Checks available appointment slots for a specific date.
- Returns available time slots
- Respects clinic hours (9-6 weekdays, 9-2 Saturday)
- Excludes already booked slots

### book_appointment(name, phone, email, date, time, serviceType)
Books an appointment after user confirmation.
- Creates appointment in database
- Links to existing user if found
- Sends confirmation emails

### get_services(category)
Retrieves service information with pricing.
- Categories: preventive, cosmetic, surgical, orthodontic
- Includes accurate pricing in PKR

### detect_user_account(email, phone)
Checks if contact info has an existing account.
- Prompts login for existing users
- Enables pre-filling of data

## Rate Limiting

- **Per User:** 10 messages/minute
- **Per IP:** 100 messages/hour
- **Fallback:** Graceful degradation with helpful error message

## Testing

### Test Message Endpoint
```bash
curl -X POST http://localhost:5000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test-123", "message": "What services do you offer?"}'
```

### Test with Authentication
```bash
curl -X POST http://localhost:5000/api/chatbot/message \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test-123", "message": "Book an appointment for tomorrow"}'
```

## Testing Scenarios

| Query | Expected Response |
|-------|-------------------|
| "What services do you offer?" | Lists all dental services with categories |
| "I need an appointment" | Asks about appointment type, then dates |
| "What are your hours?" | Shows Mon-Fri 9-6, Sat 9-2, Sun closed |
| "I have severe tooth pain!" | Emergency response with phone number |
| "How much is teeth whitening?" | Rs. 8,000 - 15,000 with details |
| "Book for tomorrow at 10 AM" | Checks availability, proceeds to booking |

## Fallback Behavior

If Gemini API fails:
1. Detects emergency keywords → Emergency response
2. Detects appointment keywords → Booking link + phone
3. Detects service keywords → General service info
4. Default → Contact information with phone numbers

## Customization

### Update Clinic Information
Edit `backend/services/geminiService.js`:

```javascript
const CLINIC_INFO = {
  name: 'Your Clinic Name',
  location: 'Your Address',
  phone: '+92 XXX XXXXXXX',
  // ...
}
```

### Update Services/Pricing
Edit `SERVICES_INFO` in the same file.

### Modify AI Behavior
Edit the system prompt in `buildSystemPrompt()` function.

## Session Storage

**Frontend (localStorage):**
- `chatbot_session_id` - Current session UUID
- `chatbot_guest_id` - Guest identifier

**Backend (MongoDB):**
- Chat sessions auto-expire after 2 hours of inactivity
- Messages compressed for long conversations (>20 messages)

## Performance

- **Response Time:** ~1-3 seconds (Gemini API)
- **Fallback Time:** <100ms
- **Session Persistence:** MongoDB with TTL indexes
- **Rate Limit:** 10 req/min per user

## Cost

**Google Gemini API: FREE**
- Free tier: 60 requests/minute, 1500 requests/day
- No credit card required
- Sufficient for ~9000 conversations/month

---

Built with Google Gemini AI for Dr. Ahmed Dental Care
