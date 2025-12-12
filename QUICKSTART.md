# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and set your API URL (or leave as localhost for development)
# VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Run Development Server
```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 4. Test the Survey Form

Open your browser to:
```
http://localhost:5173/campaign/mock-campaign-123
```

## 🧪 Testing Without a Backend

To test without connecting to a real API:

1. Open `src/utils/api.ts`
2. Temporarily replace the functions with mock implementations:

```typescript
import { mockCampaign } from './mockData';

export const fetchCampaign = async (campaignId: string): Promise<Campaign> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockCampaign;
};

export const submitSurvey = async (submission: SurveySubmission): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Survey submitted:', submission);
};
```

3. Reload the page and test the form!

## 📱 Testing with QR Code

1. Generate a QR code for:
   ```
   http://localhost:5173/campaign/mock-campaign-123
   ```
   
   Use a QR code generator like: https://www.qr-code-generator.com/

2. Scan with your phone to test the mobile experience

## 🏗️ Building for Production

```bash
npm run build
```

Build output will be in the `dist/` folder.

## 📋 What's Included

✅ Survey form with multiple question types
✅ Customer information collection for rewards
✅ Mobile-responsive design
✅ Email and phone validation
✅ Error handling for all scenarios
✅ Metadata capture (browser, device, timestamp)
✅ Ant Design UI components

## 🔑 Key Features to Test

1. **Reward Survey Flow**
   - Fill in contact information
   - Try the "Do not enter contest" option
   - Submit and see reward details

2. **Question Types**
   - Rating (star rating)
   - Yes/No (radio buttons)
   - Multiple Choice (radio options)
   - Text (textarea input)

3. **Validation**
   - Leave required fields empty
   - Enter invalid email
   - Enter invalid phone number

4. **Error States**
   - Test with no campaignId in URL
   - Test inactive campaign (see DEVELOPMENT.md)
   - Test rate limiting (see DEVELOPMENT.md)

## 📚 Next Steps

- Read [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed testing guide
- Read [IMPLEMENTATION.md](./IMPLEMENTATION.md) for technical details
- Read [README.md](./README.md) for full documentation

## 🆘 Troubleshooting

**Problem**: "Invalid survey parameters" message
- **Solution**: Use the correct URL format: `/campaign/mock-campaign-123`

**Problem**: Build fails
- **Solution**: Run `npm install` again and check for errors

**Problem**: Changes not showing up
- **Solution**: Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

## 💡 Pro Tips

1. Use Chrome DevTools Device Toolbar (F12 → Device Icon) to test mobile layouts
2. Check the Network tab to see API calls
3. Use Console to see metadata being captured
4. Test on your actual phone for the real QR code experience

---

**Ready to deploy?** See README.md for deployment instructions.
