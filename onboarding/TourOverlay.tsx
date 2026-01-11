import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from './OnboardingContext';
import { TOUR_STEPS_MAP } from './tourSteps';
import { X } from 'lucide-react';

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const TourOverlay: React.FC = () => {
  const { activeTour, stepIndex, endTour, goToNextStep } = useOnboarding();
  const { t } = useTranslation();
  const [targetRect, setTargetRect] = useState<ElementRect | null>(null);

  const tourSteps = useMemo(() => activeTour ? TOUR_STEPS_MAP[activeTour] : [], [activeTour]);
  const currentStep = tourSteps[stepIndex];

  useEffect(() => {
    if (!currentStep) {
      setTargetRect(null);
      return;
    }

    const updatePosition = () => {
      const element = document.querySelector(currentStep.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentStep]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        endTour();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [endTour]);

  const isLastStep = stepIndex === tourSteps.length - 1;

  if (!activeTour || !currentStep || !targetRect) {
    return null;
  }

  const tooltipTop = targetRect.top + targetRect.height + 15;
  const tooltipLeft = targetRect.left + targetRect.width / 2;

  const handleNext = () => {
    if (isLastStep) {
      endTour();
    } else {
      goToNextStep();
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay with hole */}
      <div
        className="fixed inset-0 bg-black/70 transition-all duration-300"
        style={{
          clipPath: `path("M0,0H${window.innerWidth}V${window.innerHeight}H0V0ZM${targetRect.left - 5},${targetRect.top - 5}H${targetRect.left + targetRect.width + 5}V${targetRect.top + targetRect.height + 5}H${targetRect.left - 5}V${targetRect.top - 5}Z")`,
        }}
      ></div>

      {/* Tooltip */}
      <div
        className="absolute w-80 max-w-[90vw] bg-gray-800 text-white rounded-lg shadow-2xl p-5 border border-gray-600 animate-fade-in"
        style={{
          top: `${tooltipTop}px`,
          left: `${tooltipLeft}px`,
          transform: `translateX(-50%)`,
        }}
      >
        <button onClick={endTour} className="absolute top-2 right-2 text-gray-400 hover:text-white">
          <X size={18} />
        </button>
        <h3 className="font-bold text-lg mb-2 text-blue-300">{t(currentStep.titleKey)}</h3>
        <p className="text-sm text-gray-300 mb-4">{t(currentStep.descriptionKey)}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">{`${stepIndex + 1} / ${tourSteps.length}`}</span>
          <div>
            <button onClick={endTour} className="text-sm text-gray-400 hover:text-white mr-4">{t('onboarding.skip')}</button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              {isLastStep ? t('onboarding.finish') : t('onboarding.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourOverlay;