import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Textarea } from './ui/textarea';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

/**
 * CancellationSurveyModal Component
 *
 * Displays a survey modal when users attempt to cancel their subscription.
 * Integrates with the Cancellation Surveys & Offers for WooCommerce Subscriptions plugin.
 *
 * Features:
 * - Survey questions with selectable options
 * - Optional text feedback
 * - Discount offer presentation (if applicable)
 * - Handles both "cancel anyway" and "take discount" flows
 */
const CancellationSurveyModal = ({
  open,
  onClose,
  surveyData,
  subscriptionId,
  onCancelComplete,
  onDiscountAccepted,
}) => {
  const [currentStep, setCurrentStep] = useState('survey'); // 'survey' | 'discount' | 'processing'
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [showTextArea, setShowTextArea] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setCurrentStep('survey');
      setSelectedAnswer(null);
      setTextAnswer('');
      setShowTextArea(false);
      setError(null);
      setIsProcessing(false);
    }
  }, [open]);

  // Handle survey item selection
  const handleSurveyItemClick = (item) => {
    setSelectedAnswer(item.slug);
    setShowTextArea(item.textAnswerEnabled);
    setError(null);
  };

  // Validate survey before continuing
  const validateSurvey = () => {
    if (!selectedAnswer) {
      setError('Please select a reason for cancellation');
      return false;
    }

    if (surveyData.survey.textAnswerRequired && showTextArea) {
      const minLength = surveyData.survey.textAnswerMinLength || 5;
      if (textAnswer.length < minLength) {
        setError(`Please provide at least ${minLength} characters of feedback`);
        return false;
      }
    }

    return true;
  };

  // Handle continue from survey
  const handleContinue = () => {
    if (!validateSurvey()) {
      return;
    }

    // Check if we should show discount offer
    const selectedItem = surveyData.survey.items.find(item => item.slug === selectedAnswer);

    if (surveyData.discountOffer.enabled && selectedItem?.discountOfferEnabled) {
      setCurrentStep('discount');
    } else {
      // No discount offer, proceed directly to cancellation
      handleCancelSubscription();
    }
  };

  // Handle taking the discount offer
  const handleTakeDiscount = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(
        `${window.samsaraMyAccount.apiUrl}samsara/v1/subscriptions/${subscriptionId}/take-discount-offer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': window.samsaraMyAccount.nonce,
          },
          credentials: 'include',
          body: JSON.stringify({
            offerId: surveyData.offerId,
            surveyAnswer: selectedAnswer,
            surveyText: textAnswer,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to apply discount offer');
      }

      // Discount applied successfully
      if (onDiscountAccepted) {
        onDiscountAccepted(data);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to apply discount offer');
      setIsProcessing(false);
    }
  };

  // Handle canceling the subscription
  const handleCancelSubscription = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(
        `${window.samsaraMyAccount.apiUrl}samsara/v1/subscriptions/${subscriptionId}/cancel-with-survey`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': window.samsaraMyAccount.nonce,
          },
          credentials: 'include',
          body: JSON.stringify({
            offerId: surveyData.offerId,
            surveyAnswer: selectedAnswer,
            surveyText: textAnswer,
            endDate: null, // Let backend handle the date
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel subscription');
      }

      // Cancellation successful
      if (onCancelComplete) {
        onCancelComplete(data);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to cancel subscription');
      setIsProcessing(false);
    }
  };

  // Don't render if no survey data
  if (!surveyData || !surveyData.hasOffer) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]" data-testid="cancellation-survey-modal">
        {/* Survey Step */}
        {currentStep === 'survey' && surveyData.survey.enabled && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">
                {surveyData.survey.title || 'Before you go...'}
              </DialogTitle>
              <DialogDescription className="text-center pt-2">
                <div dangerouslySetInnerHTML={{ __html: surveyData.survey.description }} />
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Error Alert */}
              {error && (
                <Alert className="border-red-500 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 ml-2">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Survey Items */}
              <div className="space-y-2">
                {surveyData.survey.items.map((item) => (
                  <div
                    key={item.slug}
                    onClick={() => handleSurveyItemClick(item)}
                    className={`
                      flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${selectedAnswer === item.slug
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                      }
                    `}
                    data-testid={`survey-item-${item.slug}`}
                  >
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${selectedAnswer === item.slug
                        ? 'border-emerald-600 bg-emerald-600'
                        : 'border-stone-400'
                      }
                    `}>
                      {selectedAnswer === item.slug && (
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-stone-900">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Text Answer */}
              {showTextArea && (
                <div className="pt-2">
                  <Textarea
                    placeholder="Please provide more details..."
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    minLength={surveyData.survey.textAnswerMinLength}
                    maxLength={surveyData.survey.textAnswerMaxLength}
                    rows={3}
                    className="w-full"
                    data-testid="survey-text-answer"
                  />
                  {surveyData.survey.textAnswerRequired && (
                    <p className="text-xs text-stone-600 mt-1 flex justify-between">
                      <span>
                        Required (minimum {surveyData.survey.textAnswerMinLength} characters)
                      </span>
                      <span>
                        {textAnswer.length} / {surveyData.survey.textAnswerMaxLength}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Survey Actions */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleContinue}
                disabled={!selectedAnswer || isProcessing}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                data-testid="survey-continue-btn"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isProcessing}
                className="w-full"
                data-testid="survey-dismiss-btn"
              >
                Never mind, I've changed my mind
              </Button>
            </div>
          </>
        )}

        {/* Discount Offer Step */}
        {currentStep === 'discount' && surveyData.discountOffer.enabled && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">
                {surveyData.discountOffer.title || 'Wait! We have an offer for you'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Error Alert */}
              {error && (
                <Alert className="border-red-500 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 ml-2">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-center">
                <div dangerouslySetInnerHTML={{ __html: surveyData.discountOffer.description }} />
              </div>
            </div>

            {/* Discount Actions */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleTakeDiscount}
                disabled={isProcessing}
                className="w-full bg-samsara-gold hover:bg-samsara-gold/90 text-samsara-black"
                data-testid="take-discount-btn"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  surveyData.discountOffer.applyButtonLabel || 'Accept Offer'
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={handleCancelSubscription}
                disabled={isProcessing}
                className="w-full text-red-600 hover:text-red-700"
                data-testid="decline-discount-btn"
              >
                {surveyData.discountOffer.cancelButtonLabel || 'No thanks, cancel my subscription'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CancellationSurveyModal;
