import { useState } from 'react';
import { ConfigProvider, theme } from 'antd';
import SurveyForm from './components/SurveyForm';
import './App.css';

function App() {
  const [campaignId] = useState<string | null>(() => {
    // Extract campaign ID from URL path like /campaign/gFs29rKJ95XXeBkaL6hsEmN5QnRTZXVOYUVIUzFLdi9saFhLb3c9PQ==
    const path = window.location.pathname;
    const match = path.match(/\/campaign\/([^/]+)/);
    return match ? match[1] : null;
  });
  console.log('Extracted campaignId:', campaignId);

  if (!campaignId) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f0f2f5' 
      }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <h2>Invalid Survey Link</h2>
          <p>Please use the link provided in your QR code.</p>
        </div>
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#446388',
          borderRadius: 6,
          fontFamily: 'Gotham, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <SurveyForm campaignId={campaignId} />
    </ConfigProvider>
  );
}

export default App;
