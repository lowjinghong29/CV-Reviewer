import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppMode, CvReview } from './types';
import UploadPage from './components/UploadPage';
import ReviewPage from './components/ReviewPage';
import LanguageSwitcher from './components/LanguageSwitcher';
import HelpButton from './components/HelpButton';
import TourOverlay from './onboarding/TourOverlay';
import LegalModal from './components/LegalModal';
import { useOnboarding } from './onboarding/OnboardingContext';
import { uploadAndReviewCv, analyzeImage } from './services/apiService';
import { FileUp, Search, Download } from 'lucide-react';
import privacyPolicyMd from './legal/privacy-policy.md?raw';
import termsOfUseMd from './legal/terms-of-use.md?raw';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<AppMode>('cv');
  const [view, setView] = useState<'upload' | 'review'>('upload');
  const [cvText, setCvText] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<CvReview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [imageAnalysisResult, setImageAnalysisResult] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysisError, setImageAnalysisError] = useState<string | null>(null);
  
  const [legalModalContent, setLegalModalContent] = useState<{ title: string; content: string } | null>(null);

  const { startTour } = useOnboarding();

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('uploadTourCompleted');
    if (hasCompletedOnboarding !== 'true') {
      setTimeout(() => startTour('upload'), 500);
    }
  }, [startTour]);


  const handleCvUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setReviewData(null);
    setCvText(null);
    try {
      const result = await uploadAndReviewCv(file, i18n.language);
      setCvText(result.cvText);
      setReviewData(result.review);
      setView('review');
    } catch (err: any) {
      setError(err.message || t('errors.unknownCvError'));
    } finally {
      setIsLoading(false);
    }
  }, [t, i18n.language]);
  
  const handleImageAnalysis = useCallback(async (file: File, prompt: string) => {
    setIsAnalyzingImage(true);
    setImageAnalysisError(null);
    setImageAnalysisResult(null);
    try {
        if (!prompt) {
            throw new Error(t('errors.promptRequired'));
        }
        const base64String = await fileToBase64(file);
        const result = await analyzeImage(prompt, base64String, file.type);
        setImageAnalysisResult(result);
    } catch (err: any) {
        setImageAnalysisError(err.message || t('errors.unknownImageError'));
    } finally {
        setIsAnalyzingImage(false);
    }
  }, [t]);


  const handleBackToUpload = () => {
    setView('upload');
    setReviewData(null);
    setCvText(null);
    setError(null);
  };

  const showLegalDoc = (doc: 'privacy' | 'terms') => {
    if (doc === 'privacy') {
        setLegalModalContent({ title: t('footer.privacy'), content: privacyPolicyMd });
    } else {
        setLegalModalContent({ title: t('footer.terms'), content: termsOfUseMd });
    }
  };

  const Step = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex-1 text-center px-2">
        <div className="flex items-center justify-center bg-gray-700 w-12 h-12 rounded-full mx-auto mb-2 border-2 border-blue-400/50">
            {icon}
        </div>
        <h3 className="font-semibold text-sm text-gray-200">{title}</h3>
        <p className="text-xs text-gray-400">{description}</p>
    </div>
  );

  return (
    <>
      <TourOverlay />
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl mx-auto">
          <header className="text-center mb-8 relative">
            <div className="absolute top-0 right-0">
               <LanguageSwitcher />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 pt-10 sm:pt-0">
              {t('app.title')}
            </h1>
            <p className="text-lg text-gray-400 mt-2">
              {t('app.tagline')}
            </p>
          </header>
          
          <div className="w-full max-w-2xl mx-auto mb-8">
              <div className="flex items-start justify-center">
                  <Step icon={<FileUp size={24} className="text-blue-300" />} title={t('steps.upload.title')} description={t('steps.upload.description')} />
                  <div className="flex-1 border-t-2 border-dashed border-gray-600 mt-6"></div>
                  <Step icon={<Search size={24} className="text-blue-300" />} title={t('steps.review.title')} description={t('steps.review.description')} />
                  <div className="flex-1 border-t-2 border-dashed border-gray-600 mt-6"></div>
                  <Step icon={<Download size={24} className="text-blue-300" />} title={t('steps.improve.title')} description={t('steps.improve.description')} />
              </div>
          </div>

          <main className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700">
            <div className="flex justify-center border-b border-gray-700 mb-6">
              <button
                onClick={() => setMode('cv')}
                className={`px-4 py-2 text-lg font-semibold transition-colors duration-300 ${mode === 'cv' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
              >
                {t('modes.cv')}
              </button>
              <button
                onClick={() => setMode('image')}
                className={`px-4 py-2 text-lg font-semibold transition-colors duration-300 ${mode === 'image' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
              >
                {t('modes.image')}
              </button>
            </div>

            {view === 'upload' ? (
              <UploadPage
                mode={mode}
                onCvUpload={handleCvUpload}
                onImageAnalyze={handleImageAnalysis}
                isLoading={isLoading || isAnalyzingImage}
                error={mode === 'cv' ? error : imageAnalysisError}
                imageAnalysisResult={imageAnalysisResult}
              />
            ) : (
              reviewData && cvText && (
                <ReviewPage
                  reviewData={reviewData}
                  cvText={cvText}
                  onBack={handleBackToUpload}
                />
              )
            )}
          </main>
           <footer className="text-center mt-8 text-gray-500 text-sm">
                <p>{t('footer.poweredBy')}</p>
                <div className="mt-2 space-x-4">
                    <button onClick={() => showLegalDoc('privacy')} className="hover:text-gray-300 underline transition-colors">
                        {t('footer.privacy')}
                    </button>
                    <button onClick={() => showLegalDoc('terms')} className="hover:text-gray-300 underline transition-colors">
                        {t('footer.terms')}
                    </button>
                </div>
          </footer>
        </div>
      </div>
      <HelpButton />
      {legalModalContent && (
        <LegalModal
            isOpen={!!legalModalContent}
            onClose={() => setLegalModalContent(null)}
            title={legalModalContent.title}
            content={legalModalContent.content}
        />
      )}
    </>
  );
};

export default App;