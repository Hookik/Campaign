/**
 * Pricing Plans Component
 * Displays subscription tiers with comparison and upgrade CTAs
 */

'use client';

import React, { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import type { SubscriptionPlan } from '@/types';

interface PricingPlansProps {
  token: string;
}

export default function PricingPlans({ token }: PricingPlansProps) {
  const { plans, currentPlan, subscribe, loading } = useSubscription(token);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [subscribing, setSubscribing] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency', currency: 'NGN', minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubscribe = async (planSlug: string) => {
    setSubscribing(planSlug);
    try {
      await subscribe(planSlug, billingCycle);
    } catch (err) {
      console.error('Subscribe failed:', err);
    } finally {
      setSubscribing(null);
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    if (billingCycle === 'annual' && plan.price_annual) {
      return plan.price_annual / 12;
    }
    return plan.price_monthly;
  };

  const getSavingsPercent = (plan: SubscriptionPlan) => {
    if (!plan.price_annual || !plan.price_monthly) return 0;
    const annualMonthly = plan.price_annual / 12;
    return Math.round((1 - annualMonthly / plan.price_monthly) * 100);
  };

  if (loading) {
    return <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => <div key={i} className="h-[500px] bg-gray-100 rounded-xl" />)}
    </div>;
  }

  const planColors: Record<string, { border: string; bg: string; btn: string; badge: string }> = {
    free: { border: 'border-gray-200', bg: 'bg-white', btn: 'bg-gray-100 text-gray-700 hover:bg-gray-200', badge: '' },
    pro: { border: 'border-purple-300', bg: 'bg-white', btn: 'btn-primary', badge: 'bg-[#5F28A5]' },
    pro_plus: { border: 'border-yellow-300', bg: 'bg-gradient-to-b from-yellow-50 to-white', btn: 'bg-yellow-500 text-white hover:bg-yellow-600', badge: 'bg-yellow-500' },
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="text-gray-500 mt-2">Unlock premium features and earn more with Hookik</p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className={`w-12 h-6 rounded-full relative transition-colors ${billingCycle === 'annual' ? 'bg-[#5F28A5]' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-400'}`}>
            Annual <span className="text-green-600 font-semibold">Save 20%</span>
          </span>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const colors = planColors[plan.slug] || planColors.free;
          const isCurrent = currentPlan === plan.slug;
          const isPopular = plan.slug === 'pro';
          const price = getPrice(plan);
          const savings = getSavingsPercent(plan);

          return (
            <div key={plan.id} className={`relative rounded-2xl border-2 ${colors.border} ${colors.bg} p-6 flex flex-col ${isPopular ? 'shadow-lg scale-105' : ''}`}>
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`${colors.badge} text-white text-xs font-bold px-4 py-1 rounded-full`}>
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {price === 0 ? 'Free' : formatCurrency(price)}
                  </span>
                  {price > 0 && <span className="text-gray-400 text-sm">/month</span>}
                </div>
                {billingCycle === 'annual' && savings > 0 && (
                  <p className="text-green-600 text-sm font-medium mt-1">
                    Save {savings}% — billed {formatCurrency(plan.price_annual!)} / year
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features?.map((feature) => {
                  const included = feature.feature_value !== 'false';
                  return (
                    <li key={feature.id} className="flex items-start gap-2">
                      {included ? (
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={`text-sm ${included ? 'text-gray-700' : 'text-gray-400'}`}>
                        {feature.feature_label}
                        {feature.feature_value !== 'true' && feature.feature_value !== 'false' && (
                          <span className="text-gray-400 ml-1">({feature.feature_value})</span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* CTA */}
              {isCurrent ? (
                <button disabled className="w-full py-3 rounded-xl font-semibold bg-gray-100 text-gray-500 cursor-not-allowed">
                  Current Plan
                </button>
              ) : plan.slug === 'free' ? (
                <button disabled className="w-full py-3 rounded-xl font-semibold bg-gray-100 text-gray-400 cursor-not-allowed">
                  Free Forever
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.slug)}
                  disabled={subscribing === plan.slug}
                  className={`w-full py-3 rounded-xl font-semibold transition ${colors.btn} disabled:opacity-50`}
                >
                  {subscribing === plan.slug ? 'Processing...' : `Upgrade to ${plan.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
