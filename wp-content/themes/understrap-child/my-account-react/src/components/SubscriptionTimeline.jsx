import React from 'react';
import { CheckCircle2, Circle, Lock, Calendar } from 'lucide-react';

/**
 * SubscriptionTimeline Component
 * Visual timeline showing payment progress, cancellation window, and rolling cycle
 */
const SubscriptionTimeline = ({ eligibility, subscription }) => {
  if (!eligibility) return null;

  const { current, rules, window, cancelable } = eligibility;
  const { payment_count } = current;
  const { minimum_period, rolling_cycle } = rules;

  // Limit total payments shown to avoid overcrowding
  // Show either: minimum + 3 buffer, or up to 15 payments max (whichever is smaller)
  const maxPaymentsToShow = 15;
  const idealPaymentsToShow = minimum_period + 3;
  const totalPaymentsToShow = Math.min(idealPaymentsToShow, maxPaymentsToShow);

  // Determine cancellation window positions
  const windowStartPayment = minimum_period;
  const windowEndPayment = rolling_cycle || minimum_period;

  // Generate payment nodes
  const paymentNodes = [];
  for (let i = 1; i <= totalPaymentsToShow; i++) {
    const isCompleted = i <= payment_count;
    const isCurrent = i === payment_count + 1; // Next upcoming payment after current
    const isInWindow = i >= windowStartPayment && i <= windowEndPayment;
    const isCycleLock = rolling_cycle && i === rolling_cycle + 1 && i <= totalPaymentsToShow;

    paymentNodes.push({
      number: i,
      isCompleted,
      isCurrent,
      isInWindow,
      isCycleLock,
    });
  }

  // Calculate if currently in cancellation window
  const inCancellationWindow = cancelable && payment_count >= minimum_period;

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-stone-900">Payment Timeline</h4>
        <div className="text-sm text-stone-600">
          {payment_count} of {minimum_period} minimum payments completed
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="relative py-8 overflow-x-auto">
        <div className="relative min-w-max px-4">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-stone-200 -translate-y-1/2" />

          {/* Cancellation Window Highlight */}
          {window?.start && (
            <div
              className={`absolute top-1/2 h-2 -translate-y-1/2 rounded ${
                inCancellationWindow ? 'bg-emerald-500' : 'bg-amber-500'
              } opacity-30`}
              style={{
                left: `${((windowStartPayment - 0.5) / totalPaymentsToShow) * 100}%`,
                width: `${((windowEndPayment - windowStartPayment) / totalPaymentsToShow) * 100}%`,
              }}
            />
          )}

          {/* Payment Nodes */}
          <div className="relative flex items-center gap-4 md:gap-8">
            {paymentNodes.map((node) => (
              <div key={node.number} className="flex flex-col items-center min-w-[60px]">
                {/* Node Icon */}
                <div className="relative z-10 mb-2">
                  {node.isCycleLock ? (
                    <div className="w-10 h-10 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-red-600" />
                    </div>
                  ) : node.isCompleted ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                  ) : node.isCurrent ? (
                    <div className="w-12 h-12 rounded-full bg-blue-100 border-4 border-blue-500 flex items-center justify-center animate-pulse">
                      <div className="w-3 h-3 rounded-full bg-blue-600" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-stone-100 border-2 border-stone-300 flex items-center justify-center">
                      <Circle className="w-5 h-5 text-stone-400" />
                    </div>
                  )}
                </div>

                {/* Node Label */}
                <div className="text-center w-full">
                  <div className={`text-xs font-medium whitespace-nowrap ${
                    node.isCompleted ? 'text-emerald-700' :
                    node.isCurrent ? 'text-blue-700' :
                    node.isCycleLock ? 'text-red-700' :
                    'text-stone-500'
                  }`}>
                    {node.isCycleLock ? 'Cycle Resets' : `#${node.number}`}
                  </div>
                  {node.isCurrent && (
                    <div className="text-[10px] font-bold text-white bg-blue-600 rounded px-1 py-0.5 mt-1 whitespace-nowrap">
                      NEXT
                    </div>
                  )}
                  {node.number === windowStartPayment && window?.start && !node.isCurrent && (
                    <div className="text-[10px] text-amber-700 mt-1 font-semibold whitespace-nowrap">Opens</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cancellation Window Info */}
      {window?.start && (
        <div className={`p-4 rounded-lg border ${
          inCancellationWindow
            ? 'bg-emerald-50 border-emerald-500'
            : 'bg-amber-50 border-amber-500'
        }`}>
          <div className="flex items-start gap-3">
            <Calendar className={`w-5 h-5 mt-0.5 ${
              inCancellationWindow ? 'text-emerald-600' : 'text-amber-600'
            }`} />
            <div className="flex-1">
              <div className={`font-semibold mb-1 ${
                inCancellationWindow ? 'text-emerald-900' : 'text-amber-900'
              }`}>
                {inCancellationWindow ? '✓ Cancellation Window Active' : 'Cancellation Window'}
              </div>
              <div className={`text-sm ${
                inCancellationWindow ? 'text-emerald-800' : 'text-amber-800'
              }`}>
                {window.start}
                {window.end ? ` to ${window.end}` : ' onwards'}
              </div>
              {!inCancellationWindow && (
                <div className="text-xs text-amber-700 mt-2">
                  Cancellation will be available after you complete {minimum_period} payments
                </div>
              )}
              {rolling_cycle && rolling_cycle === minimum_period && (
                <div className="text-xs mt-2 text-stone-600">
                  ⚠️ Rolling {rolling_cycle}-payment cycle: Window closes when next payment locks you in for another {rolling_cycle} payments
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-stone-600 pt-2 border-t border-stone-200">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500" />
          <span>Current Position</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 text-stone-400" />
          <span>Upcoming</span>
        </div>
        {rolling_cycle && (
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-600" />
            <span>Cycle Lock</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionTimeline;
