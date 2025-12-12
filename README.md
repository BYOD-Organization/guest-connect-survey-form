# Guest Connect Web

An externally-facing survey submission application for BYOD Guest Connect campaigns. This application allows anonymous users to fill out surveys from QR codes without requiring authentication.

## Features

### Survey Submission Flow
- **Anonymous Access**: No authentication required, only QR code parameters
- **Campaign Validation**: Validates campaign is active before displaying survey
- **Reward Surveys**: Optional contest entry with name, email, and phone collection
- **Metadata Capture**: Automatically captures IP address, timestamp, browser, device info
- **Spam Prevention**: 
  - Daily submission limits per campaign
  - IP-based rate limiting (6 submissions per day across organizations)
  - Geographic restrictions (US/Canada only - configured at DevOps level)

### User Experience
- Clean, mobile-responsive UI using Ant Design
- Multiple question types: Rating, Yes/No, Multiple Choice, Text
- Real-time validation for contact information
- Clear error messages for various states:
  - Campaign inactive
  - Already entered today
  - Too many submission attempts
  - Invalid parameters

### Contact Information Collection
For reward surveys, users can:
- Enter contest by providing name, email, and phone
- Opt out of contest to submit feedback anonymously
- View reward details and draw information

## Project Structure

```
src/
├── components/
│   └── SurveyForm.tsx        # Main survey submission component
├── types/
│   └── survey.ts             # TypeScript interfaces
├── utils/
│   ├── api.ts                # API calls
│   └── helpers.ts            # Utility functions
├── App.tsx                   # Main application component
├── main.tsx                  # Application entry point
└── index.css                 # Global styles
```

## Tech Stack

- **React 19** with TypeScript
- **Ant Design** for UI components
- **Axios** for API communication
- **Vite** for build tooling

## Getting Started

### Installation

```bash
npm install
```

### Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the API URL:
```
VITE_API_BASE_URL=https://api.guestconnect.byod.ai/api
```

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

### QR Code URL Format

The application expects the campaign ID in the URL path:

```
https://survey.guestconnect.byod.ai/campaign/<CAMPAIGN_ID>
```

Example:
```
https://survey.guestconnect.byod.ai/campaign/gFs29rKJ95XXeBkaL6hsEmN5QnRTZXVOYUVIUzFLdi9saFhLb3c9PQ==
```

### API Requirements

The backend API should provide the following endpoints:

#### Get Campaign
```
GET /api/campaigns/:campaignId
```

Response:
```json
{
  "id": "campaign-123",
  "title": "Customer Feedback Survey",
  "logoUrl": "https://example.com/logo.png",
  "isActive": true,
  "isRewardSurvey": true,
  "rewardDetailsText": "Thank you for your Feedback, we will draw random names on January 3rd...",
  "disclaimer": "Your privacy is important to us...",
  "allowMultipleEntriesPerDay": false,
  "questions": [
    {
      "id": "q1",
      "type": "rating",
      "question": "How would you rate your experience?",
      "required": true,
      "maxRating": 5
    }
  ]
}
```

#### Submit Survey
```
POST /api/surveys/submit
```

Request Body:
```json
{
  "campaignId": "campaign-123",
  "answers": [
    {
      "questionId": "q1",
      "answer": 5
    }
  ],
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "(555) 123-4567"
  },
  "metadata": {
    "timestamp": "2025-12-02T10:30:00Z",
    "browser": "Chrome",
    "device": "Mobile",
    "userAgent": "Mozilla/5.0..."
  }
}
```

#### Check Daily Submission
```
GET /api/surveys/check-daily/:campaignId/:identifier
```

Response:
```json
{
  "hasSubmittedToday": false
}
```

### Error Handling

The API should return appropriate error codes:

- `404` - Campaign not found
- `429` - Too many attempts (rate limited)
- `400` with `code: 'ALREADY_SUBMITTED'` - User already submitted today

## Data Collection

### Metadata Captured
- IP Address (handled by backend)
- Timestamp
- Browser type
- Device type (Mobile/Tablet/Desktop)
- User Agent string

### Customer Data
For reward surveys (when user opts in):
- Full name
- Email address
- Phone number (US/Canada format)

Customer data is stored in shared customer table with Events, flagged as "Guest Connect" source.

## Security & Rate Limiting

### DevOps Configuration Required
1. **Geographic Restriction**: Restrict subdomain traffic to US and Canada only
2. **Rate Limiting**: Maximum 6 survey submissions per IP per day (production only)
3. **CORS**: Configure allowed origins for API access

### Client-Side Validation
- Email format validation
- Phone number format validation (US/Canada)
- Required field validation
- Duplicate submission prevention

## Deployment Notes

### Subdomain Setup
The application should be deployed to a subdomain (e.g., `survey.guestconnect.byod.ai`)

### Build Optimization
The production build is optimized for:
- Fast initial load
- Mobile responsiveness
- Cross-browser compatibility

## Contributing

When making changes:
1. Follow TypeScript best practices
2. Maintain Ant Design component consistency
3. Test on mobile devices
4. Ensure accessibility standards are met

## License

Proprietary - BYOD.ai
