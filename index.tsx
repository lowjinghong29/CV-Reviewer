import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n'; // Import the i18n configuration
import { OnboardingProvider } from './onboarding/OnboardingContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <React.Suspense fallback="Loading...">
      <OnboardingProvider>
        <App />
      </OnboardingProvider>
    </React.Suspense>
  </React.StrictMode>
);