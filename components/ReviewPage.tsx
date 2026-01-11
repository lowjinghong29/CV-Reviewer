import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CvReview } from '../types';
import CvFeedbackCard from './CvFeedbackCard';
import { rewriteCv } from '../services/apiService';
import { generatePdfFromImprovedCv } from '../services/pdfService';
import Spinner from './Spinner';
import { useOnboarding } from '../onboarding/OnboardingContext';
import { Download, ArrowLeft, Lightbulb, ThumbsUp, ThumbsDown, ChevronDown } from 'lucide-react';

interface ReviewPageProps {
  reviewData: CvReview;
  cvText: string;
  onBack: () => void;
}

const AccordionCard: React.FC<{
  title: string;
  items: string[];
  icon: React.ReactNode;
}> = ({ title, items, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  if (!items || items.length === 0) return null;

  return (
    <div className="bg-gray-800/60 rounded-lg border border-gray-700 transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center">
            <div className="mr-3">{icon}</div>
            <h4 className="text-lg font-semibold capitalize text-gray-100">{t(`review.sections.${title}`, { defaultValue: title })}</h4>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-700/50">
          <ul className="space-y-2 mt-3">
            {items.map((item, index) => (
              <li key={index} className="flex items-start">
                <Lightbulb className="w-4 h-4 text-blue-400 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};


const ReviewPage: React.FC<ReviewPageProps> = ({ reviewData, cvText, onBack }) => {
  const { t, i18n } = useTranslation();
  const [targetRole, setTargetRole] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { startTour } = useOnboarding();

  useEffect(() => {
    const hasCompletedReviewTour = localStorage.getItem('reviewTourCompleted');
    if (hasCompletedReviewTour !== 'true') {
      setTimeout(() => startTour('review'), 500);
    }
  }, [startTour]);

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const improvedCv = await rewriteCv({ cvText, targetRole, language: i18n.language });
      await generatePdfFromImprovedCv(improvedCv);
    } catch (err: any) {
      setError(err.message || t('errors.pdfGenerationFailed'));
    } finally {
      setIsGenerating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'border-green-400 text-green-300';
    if (score >= 60) return 'border-yellow-400 text-yellow-300';
    return 'border-red-400 text-red-300';
  };
  
  const getScoreCategory = (score: number) => {
    if (score >= 85) return <span className="font-bold text-green-400">{t('review.score.strong')}</span>;
    if (score >= 60) return <span className="font-bold text-yellow-400">{t('review.score.good')}</span>;
    return <span className="font-bold text-red-400">{t('review.score.needsWork')}</span>;
  };

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center text-blue-400 hover:text-blue-300 mb-6 font-semibold transition-colors duration-300">
        <ArrowLeft className="mr-2" /> {t('review.backButton')}
      </button>

      <div className="space-y-8">
        {/* Score and Summary */}
        <div className="bg-gray-700/50 p-6 rounded-xl border border-gray-600 shadow-lg" data-onboarding="review-score-summary">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-bold text-gray-100">{t('review.title')}</h2>
                <p className="text-gray-400 mt-1">
                    {t('review.summaryPrefix')} {getScoreCategory(reviewData.score)} {t('review.summarySuffix')}
                </p>
                <p className="mt-4 text-gray-300">{reviewData.overallSummary}</p>
            </div>
            <div className="flex-shrink-0">
                <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center border-4 ${getScoreColor(reviewData.score)} bg-gray-800/50`}>
                    <p className="text-5xl font-bold">{reviewData.score}</p>
                    <p className="text-sm text-gray-400">{t('review.score.outOf100')}</p>
                </div>
            </div>
          </div>
        </div>
        
        {/* Strengths and Weaknesses */}
        <div className="grid md:grid-cols-2 gap-8">
          <CvFeedbackCard title={t('review.strengthsTitle')} items={reviewData.strengths} icon={<ThumbsUp className="text-green-400" />} description={t('review.strengthsDescription')} />
          <div data-onboarding="review-weaknesses">
            <CvFeedbackCard title={t('review.weaknessesTitle')} items={reviewData.weaknesses} icon={<ThumbsDown className="text-red-400" />} description={t('review.weaknessesDescription')}/>
          </div>
        </div>

        {/* Section-specific Feedback */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-center text-gray-200">{t('review.sectionAnalysisTitle')}</h3>
          <p className="text-center text-gray-400 mb-6 max-w-2xl mx-auto">{t('review.sectionAnalysisDescription')}</p>
          <div className="space-y-3">
              {Object.entries(reviewData.sectionFeedback).map(([section, feedback]) =>
                  (Array.isArray(feedback) && feedback.length > 0) && 
                  <AccordionCard key={section} title={section} items={feedback} icon={<Lightbulb className="text-yellow-400"/>} />
              )}
          </div>
        </div>
        
        {/* Generate PDF section */}
        <div className="bg-gray-700/50 p-6 rounded-xl border border-gray-600 mt-8 text-center shadow-lg" data-onboarding="review-generate-pdf">
            <h3 className="text-2xl font-bold mb-2">{t('review.generate.title')}</h3>
            <p className="text-gray-400 mb-4">{t('review.generate.description')}</p>
            <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder={t('review.generate.placeholder')}
                className="w-full max-w-md mx-auto p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors mb-4"
            />
            <button
                onClick={handleGeneratePdf}
                disabled={isGenerating}
                className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center w-full max-w-md mx-auto shadow-lg"
            >
                {isGenerating ? <><Spinner /><span className="ml-2">{t('review.generate.loading')}</span></> : <><Download className="mr-2" /> {t('review.generate.button')}</>}
            </button>
            {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
