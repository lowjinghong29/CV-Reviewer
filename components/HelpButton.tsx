import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, X, BookOpen, BarChart2 } from 'lucide-react';
import { useOnboarding } from '../onboarding/OnboardingContext';
import InfoModal from './InfoModal';

const HelpButton: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { startTour } = useOnboarding();

  const handleRestartTour = (tourName: 'upload' | 'review') => {
    setIsOpen(false);
    startTour(tourName);
  };
  
  const handleOpenScoreInfo = () => {
    setIsOpen(false);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40">
        <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <div className="absolute bottom-16 right-0 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-3">
             <h4 className="font-semibold text-gray-200 text-sm px-2 pb-2 border-b border-gray-700">{t('help.menuTitle')}</h4>
             <ul className="mt-2 space-y-1">
                <li>
                    <button onClick={() => handleRestartTour('upload')} className="w-full text-left flex items-center p-2 rounded-md text-gray-300 hover:bg-gray-700 text-sm">
                        <BookOpen size={16} className="mr-2 text-blue-400"/> {t('help.restartUploadTour')}
                    </button>
                </li>
                <li>
                    <button onClick={() => handleRestartTour('review')} className="w-full text-left flex items-center p-2 rounded-md text-gray-300 hover:bg-gray-700 text-sm">
                        <BookOpen size={16} className="mr-2 text-blue-400"/> {t('help.restartReviewTour')}
                    </button>
                </li>
                <li>
                    <button onClick={handleOpenScoreInfo} className="w-full text-left flex items-center p-2 rounded-md text-gray-300 hover:bg-gray-700 text-sm">
                        <BarChart2 size={16} className="mr-2 text-blue-400"/> {t('help.scoreInfo')}
                    </button>
                </li>
             </ul>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
          aria-label={t('help.tooltip')}
        >
          {isOpen ? <X size={28} /> : <HelpCircle size={28} />}
        </button>
      </div>
      
      <InfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('help.scoreInfoModalTitle')}
      >
        <div className="text-gray-300 space-y-2" dangerouslySetInnerHTML={{ __html: t('help.scoreInfoModalContent') }} />
      </InfoModal>
    </>
  );
};

export default HelpButton;