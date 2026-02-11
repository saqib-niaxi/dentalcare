# Dental Chatbot Widget - Advanced Intelligent Version

A fully intelligent, context-aware chatbot for Dr. Ahmed Dental Care. This advanced version understands natural language, handles typos, maintains conversation context, and provides comprehensive answers to dental questions.

## Key Features

### Intelligence
- **Natural Language Understanding** - Regex-based intent matching with typo correction
- **Context Memory** - Remembers conversation flow and previous topics
- **Multi-step Flows** - Complete appointment booking with data collection
- **Emergency Detection** - Prioritizes urgent situations with immediate help
- **Service Knowledge** - Detailed info on all services with pricing

### User Experience
- **Matches Website Design** - Luxury gold/black theme, Playfair Display fonts
- **Quick Action Buttons** - Pre-built options for common queries
- **Typing Indicator** - Natural conversation feel
- **Persistent Chat** - Remembers conversation during session
- **Mobile Responsive** - Works on all screen sizes

## Files Structure

```
chatbot/
├── ChatbotWidget.jsx    # Main React component with AI logic
├── ChatbotConfig.js     # Knowledge base and configuration
├── index.js             # Exports
└── README.md            # This documentation
```

## Configuration

### Clinic Information (ChatbotConfig.js)

```javascript
export const chatbotConfig = {
  clinicName: 'Dr. Ahmed Dental Care',
  phone: '+92 320 2067666',
  emergencyPhone: '+92 300 6089947',
  email: 'info@ahmeddental.com',
  address: '123 Main Street, Gulshan-e-Iqbal, Karachi',

  officeHours: {
    monday: '9:00 AM - 6:00 PM',
    // ... other days
  },

  acceptedInsurance: [
    'State Life Insurance',
    'Jubilee Health Insurance',
    // ... more
  ]
}
```

### Widget Behavior

```javascript
autoOpen: false,           // Auto-open on page load
autoOpenDelay: 5000,       // Delay before auto-open (ms)
showTimestamps: true,      // Show message timestamps
showPulseAnimation: true,  // Attention-grabbing animation
```

## Knowledge Base

### Services (`services` object)
Each service includes:
- `service` - Name of the service
- `keywords` - Words that trigger this response
- `description` - Brief explanation
- `duration` - How long it takes
- `cost` - Price range in PKR
- `details` - Detailed explanation

**Categories:**
- `preventive` - Cleanings, exams, X-rays, fluoride, sealants
- `restorative` - Fillings, crowns, bridges, root canals, dentures, implants
- `cosmetic` - Whitening, veneers, bonding, smile makeover
- `orthodontics` - Braces, Invisalign, retainers
- `surgery` - Extractions, wisdom teeth

### Emergency Responses (`emergencyResponses` object)
- `severe_pain` - Immediate pain relief + call instructions
- `knocked_out_tooth` - CRITICAL time-sensitive instructions
- `broken_tooth` - First aid + scheduling
- `severe_bleeding` - ER guidance if needed
- `abscess_infection` - Warning signs + when to go to ER
- `lost_filling_crown` - Temporary measures

### FAQ Database (`faq` object)
- `visit_frequency` - How often to visit
- `insurance` - Accepted plans
- `payment` - Payment options
- `dental_anxiety` - Comfort options
- `xray_safety` - Radiation concerns
- `root_canal_pain` - Myth busting
- `cleaning_vs_deep_cleaning` - Differences explained
- `after_extraction` - Recovery guide
- `veneer_lifespan` - Durability info
- `whitening_results` - Expectations

## Intent Patterns

The chatbot uses regex patterns to understand user intent:

```javascript
export const intentPatterns = {
  appointment: [
    /\b(appointment|booking|schedule|book|reserve)\b/i,
    /\b(visit|see\s*(the\s*)?(doctor|dentist))\b/i,
  ],
  emergency: [
    /\b(emergency|urgent|hurry)\b/i,
    /\b(severe|terrible)\s*(pain|ache|tooth)/i,
  ],
  // ... more intents
}
```

### Typo Handling

The `normalizeText()` function corrects common typos:
- `apointment` → `appointment`
- `whitning` → `whitening`
- `cleening` → `cleaning`
- `emergancy` → `emergency`

## Appointment Booking Flow

Multi-step flow that collects:
1. **Type** - What kind of appointment
2. **Timing** - Preferred day/time
3. **Contact** - Name, phone, email
4. **Confirm** - Review and submit

Users can say "cancel" at any time to exit the flow.

## Testing Scenarios

Test these queries to verify functionality:

| Query | Expected Response |
|-------|-------------------|
| "I need an appointment" | Starts booking flow |
| "Tell me about teeth whitening" | Detailed whitening info with pricing |
| "How much is a filling?" | Cost range + factors |
| "I have severe tooth pain!" | Emergency response with call instructions |
| "Do you take State Life insurance?" | Yes + list of accepted plans |
| "I'm scared of dentists" | Anxiety comfort options |
| "apointment for tomorow" (typos) | Still understands → booking flow |

## Customization Guide

### Adding a New Service

1. Add to appropriate category in `services`:

```javascript
{
  service: 'New Treatment Name',
  keywords: ['new treatment', 'treatment', 'keyword'],
  description: 'Brief description here.',
  duration: '30-60 minutes',
  cost: 'Rs. 5,000 - 10,000',
  details: 'Detailed explanation for patients...'
}
```

### Adding a New FAQ

1. Add to `faq` object:

```javascript
new_question: {
  keywords: ['keyword1', 'keyword2'],
  answer: `Your detailed answer here with **bold** formatting.`,
  followUp: true
}
```

### Adding a New Intent

1. Add pattern to `intentPatterns`:

```javascript
myNewIntent: [
  /\b(keyword1|keyword2)\b/i,
  /\bphrase to match\b/i
]
```

2. Handle in `generateResponse()` switch statement:

```javascript
case 'myNewIntent':
  return "Your response here"
```

## Conversation Context

The chatbot maintains context in state:

```javascript
const [context, setContext] = useState({
  lastIntent: null,          // What user asked about last
  lastTopic: null,           // Specific topic discussed
  appointmentFlow: {         // Booking progress
    active: false,
    step: null,
    data: {}
  },
  messageCount: 0            // Messages in session
})
```

This enables:
- Follow-up question handling ("yes" after service info → start booking)
- Continuing appointment flow across messages
- Context-aware suggestions

## Styling

Uses Tailwind CSS with website's design tokens:
- `luxury-gold` (#d4af37) - Primary accent
- `luxury-black` (#0a0a0a) - Dark backgrounds
- `luxury-cream` (#faf9f6) - Light backgrounds
- `primary` (#2a9d8f) - User message bubbles
- `font-serif` - Playfair Display for headings

## Session Storage

Data persisted during session:
- `chatbot_messages` - Message history
- `chatbot_context` - Conversation state

Cleared when:
- Browser tab closes
- User clicks clear button
- `sessionStorage.clear()` called

## Troubleshooting

### Chatbot not responding
- Check browser console for errors
- Verify all imports in ChatbotWidget.jsx
- Ensure ChatbotConfig.js has valid syntax

### Wrong intent matched
- Check intent priority (emergencies first)
- Add more specific keywords
- Test with `normalizeText()` output

### Appointment flow stuck
- User can say "cancel" to exit
- Clear chat resets state
- Check `context.appointmentFlow` state

### Styling issues
- Verify Tailwind config has luxury colors
- Check for CSS conflicts
- Ensure proper z-index (z-50)

## Future Improvements

- [ ] API integration for real appointment booking
- [ ] Multi-language support (Urdu)
- [ ] Voice input/output
- [ ] Analytics tracking
- [ ] Email transcript
- [ ] Rich media responses (images/videos)
- [ ] Machine learning-based intent matching

## Performance

- No external AI API calls (runs client-side)
- Lazy-loaded with main bundle
- Smooth 60fps animations
- Response time < 100ms
- Session storage for persistence

---

Built for Dr. Ahmed Dental Care | Matches website design perfectly
