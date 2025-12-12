# Development Guide

## Local Development Setup

### Testing Without Backend

For local development and testing without a backend API, you can modify the `api.ts` file to use mock data:

1. Open `src/utils/api.ts`
2. Import the mock data:
   ```typescript
   import { mockCampaign } from './mockData';
   ```

3. Replace the `fetchCampaign` function:
   ```typescript
   export const fetchCampaign = async (campaignId: string): Promise<Campaign> => {
     // Simulate network delay
     await new Promise(resolve => setTimeout(resolve, 500));
     
     // Return mock data
     return mockCampaign;
   };
   ```

4. Replace the `submitSurvey` function:
   ```typescript
   export const submitSurvey = async (submission: SurveySubmission): Promise<void> => {
     // Simulate network delay
     await new Promise(resolve => setTimeout(resolve, 1000));
     
     // Log submission data
     console.log('Survey submitted:', submission);
     
     // Simulate successful submission
     return Promise.resolve();
   };
   ```

### Testing Different Scenarios

#### Test Inactive Campaign
```typescript
import { mockInactiveCampaign } from './mockData';
return mockInactiveCampaign;
```

#### Test Non-Reward Survey
```typescript
import { mockNonRewardCampaign } from './mockData';
return mockNonRewardCampaign;
```

#### Test Rate Limiting Error
```typescript
export const submitSurvey = async (submission: SurveySubmission): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  throw {
    response: {
      status: 429,
    }
  };
};
```

#### Test Already Submitted Error
```typescript
export const submitSurvey = async (submission: SurveySubmission): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  throw {
    response: {
      status: 400,
      data: {
        code: 'ALREADY_SUBMITTED'
      }
    }
  };
};
```

## URL Path for Testing

During development, test the app with different URL paths:

### With Campaign ID
```
http://localhost:5173/campaign/mock-campaign-123
```

### With Base64 Encoded Campaign ID
```
http://localhost:5173/campaign/gFs29rKJ95XXeBkaL6hsEmN5QnRTZXVOYUVIUzFLdi9saFhLb3c9PQ==
```

### Missing Campaign ID (Error State)
```
http://localhost:5173/
```

## Component Testing

### Testing Customer Information Form

1. **With Contest Entry**:
   - Fill in Name, Email, Phone
   - Verify validation for:
     - Empty fields
     - Invalid email format
     - Invalid phone number format

2. **Without Contest Entry**:
   - Check "Do not enter contest"
   - Verify fields are not required
   - Submit should work without contact info

### Testing Survey Questions

1. **Rating Questions**: Click stars to rate
2. **Yes/No Questions**: Select radio buttons
3. **Multiple Choice**: Select from options
4. **Text Questions**: Type responses

### Testing Validations

- Try submitting without answering required questions
- Verify error messages appear
- Check that form highlights missing fields

## Browser Testing

Test on different browsers and devices:

### Desktop Browsers
- Chrome
- Firefox
- Edge
- Safari

### Mobile Devices
- iOS Safari
- Android Chrome
- Mobile responsive view in DevTools

## Network Testing

### Simulate Slow Network
In Chrome DevTools:
1. Open DevTools (F12)
2. Go to Network tab
3. Change throttling to "Slow 3G" or "Fast 3G"
4. Test loading states and error handling

### Simulate Offline
1. In DevTools Network tab, select "Offline"
2. Verify error handling when API is unreachable

## Debugging

### Enable Verbose Logging

Add console logs to track flow:

```typescript
// In SurveyForm.tsx
useEffect(() => {
  console.log('Campaign ID:', campaignId);
  loadCampaign();
}, [loadCampaign]);

const handleSubmit = async (values: Record<string, string | number>) => {
  console.log('Form values:', values);
  // ... rest of code
};
```

### View Captured Metadata

```typescript
// In handleSubmit
const metadata = captureMetadata();
console.log('Captured metadata:', metadata);
```

## Code Quality

### Run Linter
```bash
npm run lint
```

### Fix Linting Issues
Many issues can be auto-fixed:
```bash
npx eslint . --fix
```

### Type Check
```bash
npx tsc --noEmit
```

## Building for Production

### Create Production Build
```bash
npm run build
```

### Preview Production Build Locally
```bash
npm run preview
```

### Check Build Size
After building, check `dist/` folder size. The build should be optimized and small.

## Environment Variables

For different environments:

### Development (.env.development)
```
VITE_API_BASE_URL=http://localhost:3000/api
```

### Staging (.env.staging)
```
VITE_API_BASE_URL=https://api-staging.guestconnect.byod.ai/api
```

### Production (.env.production)
```
VITE_API_BASE_URL=https://api.guestconnect.byod.ai/api
```

## Troubleshooting

### Common Issues

#### Issue: "Invalid survey parameters"
- **Cause**: Missing campaignId in URL path
- **Solution**: Use the correct URL format: `/campaign/your-id`

#### Issue: CORS errors
- **Cause**: API not allowing requests from your origin
- **Solution**: Configure CORS on backend or use proxy in vite.config.ts

#### Issue: White screen on load
- **Cause**: JavaScript error
- **Solution**: Check browser console for errors

#### Issue: Form not submitting
- **Cause**: Validation errors or network issues
- **Solution**: Check console for errors, verify all required fields

## Best Practices

1. **Always test on mobile devices** - Most users will access via QR code on phones
2. **Test with real QR codes** - Use a QR code generator to test the full flow
3. **Verify metadata capture** - Check that browser/device detection works correctly
4. **Test error states** - Don't just test the happy path
5. **Check accessibility** - Use keyboard navigation, test with screen readers
