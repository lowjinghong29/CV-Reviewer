import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';

type TourName = 'upload' | 'review';

interface OnboardingContextType {
  activeTour: TourName | null;
  stepIndex: number;
  startTour: (tourName: TourName) => void;
  endTour: () => void;
  goToNextStep: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTour, setActiveTour] = useState<TourName | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const startTour = useCallback((tourName: TourName) => {
    setActiveTour(tourName);
    setStepIndex(0);
  }, []);

  const endTour = useCallback(() => {
    if (activeTour) {
      localStorage.setItem(`${activeTour}TourCompleted`, 'true');
    }
    setActiveTour(null);
    setStepIndex(0);
  }, [activeTour]);

  const goToNextStep = useCallback(() => {
    setStepIndex(prev => prev + 1);
  }, []);

  const value = { activeTour, stepIndex, startTour, endTour, goToNextStep };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};