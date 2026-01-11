export interface TourStep {
  targetSelector: string;
  titleKey: string;
  descriptionKey: string;
}

export const UPLOAD_TOUR_STEPS: TourStep[] = [
  {
    targetSelector: '[data-onboarding="upload-area"]',
    titleKey: 'onboarding.upload.step1.title',
    descriptionKey: 'onboarding.upload.step1.description',
  },
  {
    targetSelector: '[data-onboarding="upload-button"]',
    titleKey: 'onboarding.upload.step2.title',
    descriptionKey: 'onboarding.upload.step2.description',
  },
];

export const REVIEW_TOUR_STEPS: TourStep[] = [
  {
    targetSelector: '[data-onboarding="review-score-summary"]',
    titleKey: 'onboarding.review.step1.title',
    descriptionKey: 'onboarding.review.step1.description',
  },
  {
    targetSelector: '[data-onboarding="review-weaknesses"]',
    titleKey: 'onboarding.review.step2.title',
    descriptionKey: 'onboarding.review.step2.description',
  },
  {
    targetSelector: '[data-onboarding="review-generate-pdf"]',
    titleKey: 'onboarding.review.step3.title',
    descriptionKey: 'onboarding.review.step3.description',
  },
];

export const TOUR_STEPS_MAP = {
  upload: UPLOAD_TOUR_STEPS,
  review: REVIEW_TOUR_STEPS,
};