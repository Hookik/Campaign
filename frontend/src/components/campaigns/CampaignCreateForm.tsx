/**
 * Campaign Create Form
 * Multi-step campaign creation wizard for brands
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { brandCampaignApi } from '@/services/campaignService';

interface CampaignCreateFormProps {
  token: string;
}

type Step = 'basics' | 'budget' | 'deliverables' | 'requirements' | 'review';

export default function CampaignCreateForm({ token }: CampaignCreateFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('basics');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [form, setForm] = useState({
    title: '',
    brief: '',
    campaign_type: 'fixed_fee' as string,
    visibility: 'public' as string,
    budget_type: 'flat' as string,
    fee_per_creator: '',
    fee_min: '',
    fee_max: '',
    total_budget: '',
    commission_on_top: false,
    commission_rate: '',
    max_creators: '',
    application_deadline: '',
    content_deadline: '',
    allow_negotiation: false,
    require_pro: false,
    require_pro_plus: false,
    cover_image_url: '',
  });

  const [deliverables, setDeliverables] = useState([
    { title: '', description: '', deliverable_type: 'instagram_post', quantity: 1 },
  ]);

  const [requirements, setRequirements] = useState([
    { req_type: 'niche', req_value: '', is_required: true },
  ]);

  const steps: Step[] = ['basics', 'budget', 'deliverables', 'requirements', 'review'];
  const currentStepIndex = steps.indexOf(step);

  const updateForm = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const addDeliverable = () => setDeliverables(prev => [...prev, { title: '', description: '', deliverable_type: 'instagram_post', quantity: 1 }]);
  const removeDeliverable = (i: number) => setDeliverables(prev => prev.filter((_, idx) => idx !== i));
  const updateDeliverable = (i: number, key: string, value: any) => {
    setDeliverables(prev => prev.map((d, idx) => idx === i ? { ...d, [key]: value } : d));
  };

  const addRequirement = () => setRequirements(prev => [...prev, { req_type: 'niche', req_value: '', is_required: true }]);
  const removeRequirement = (i: number) => setRequirements(prev => prev.filter((_, idx) => idx !== i));
  const updateRequirement = (i: number, key: string, value: any) => {
    setRequirements(prev => prev.map((r, idx) => idx === i ? { ...r, [key]: value } : r));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');

    try {
      const payload: any = {
        ...form,
        fee_per_creator: form.fee_per_creator ? parseFloat(form.fee_per_creator) : null,
        fee_min: form.fee_min ? parseFloat(form.fee_min) : null,
        fee_max: form.fee_max ? parseFloat(form.fee_max) : null,
        total_budget: form.total_budget ? parseFloat(form.total_budget) : null,
        commission_rate: form.commission_rate ? parseFloat(form.commission_rate) : null,
        max_creators: form.max_creators ? parseInt(form.max_creators) : null,
        application_deadline: form.application_deadline || null,
        content_deadline: form.content_deadline || null,
        deliverables: deliverables.filter(d => d.title.trim()),
        requirements: requirements.filter(r => r.req_value.trim()),
      };

      const res = await brandCampaignApi.create(payload, token);
      router.push(`/campaigns/manage`);
    } catch (err: any) {
      setError(err.data?.error || err.message || 'Failed to create campaign');
    } finally {
      setSaving(false);
    }
  };

  const deliverableTypes = [
    'instagram_post', 'instagram_story', 'tiktok_video',
    'youtube_video', 'whatsapp_status', 'blog_post',
    'product_review', 'unboxing', 'custom',
  ];

  const reqTypes = [
    'niche', 'location', 'platform', 'follower_min',
    'follower_max', 'engagement_min', 'content_type', 'custom',
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Campaign</h1>
      <p className="text-gray-500 mb-8">Set up a new paid collaboration for creators</p>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <button
              onClick={() => i <= currentStepIndex && setStep(s)}
              className={`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center transition
                ${i <= currentStepIndex ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'}
              `}
            >
              {i + 1}
            </button>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 ${i < currentStepIndex ? 'bg-purple-600' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step: Basics */}
      {step === 'basics' && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title *</label>
            <input type="text" value={form.title} onChange={e => updateForm('title', e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="e.g. Summer Fashion Launch" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brief / Description</label>
            <textarea value={form.brief} onChange={e => updateForm('brief', e.target.value)} rows={4}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="Describe what you're looking for..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type *</label>
              <select value={form.campaign_type} onChange={e => updateForm('campaign_type', e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg">
                <option value="fixed_fee">Fixed Fee</option>
                <option value="fee_plus_commission">Fee + Commission</option>
                <option value="gifted">Gifted</option>
                <option value="open">Open</option>
                <option value="invite_only">Invite Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
              <select value={form.visibility} onChange={e => updateForm('visibility', e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg">
                <option value="public">Public</option>
                <option value="premium_only">Premium Creators Only</option>
                <option value="invite_only">Invite Only</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
            <input type="url" value={form.cover_image_url} onChange={e => updateForm('cover_image_url', e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg" placeholder="https://..." />
          </div>
        </div>
      )}

      {/* Step: Budget */}
      {step === 'budget' && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Type</label>
            <select value={form.budget_type} onChange={e => updateForm('budget_type', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg">
              <option value="flat">Flat (per creator)</option>
              <option value="variable">Variable (range)</option>
              <option value="total">Total campaign budget</option>
            </select>
          </div>
          {form.budget_type === 'flat' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee per Creator (NGN)</label>
              <input type="number" value={form.fee_per_creator} onChange={e => updateForm('fee_per_creator', e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg" placeholder="e.g. 50000" />
            </div>
          )}
          {form.budget_type === 'variable' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Fee (NGN)</label>
                <input type="number" value={form.fee_min} onChange={e => updateForm('fee_min', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Fee (NGN)</label>
                <input type="number" value={form.fee_max} onChange={e => updateForm('fee_max', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" />
              </div>
            </div>
          )}
          {form.budget_type === 'total' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget (NGN)</label>
              <input type="number" value={form.total_budget} onChange={e => updateForm('total_budget', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" />
            </div>
          )}
          <div className="flex items-center gap-3">
            <input type="checkbox" id="commission_on_top" checked={form.commission_on_top} onChange={e => updateForm('commission_on_top', e.target.checked)} className="w-4 h-4 text-purple-600 rounded" />
            <label htmlFor="commission_on_top" className="text-sm text-gray-700">Also offer affiliate commission on sales</label>
          </div>
          {form.commission_on_top && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate (%)</label>
              <input type="number" value={form.commission_rate} onChange={e => updateForm('commission_rate', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" placeholder="e.g. 10" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Creators</label>
              <input type="number" value={form.max_creators} onChange={e => updateForm('max_creators', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
              <input type="datetime-local" value={form.application_deadline} onChange={e => updateForm('application_deadline', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content Deadline</label>
            <input type="datetime-local" value={form.content_deadline} onChange={e => updateForm('content_deadline', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={form.allow_negotiation} onChange={e => updateForm('allow_negotiation', e.target.checked)} className="w-4 h-4 text-purple-600 rounded" />
            <label className="text-sm text-gray-700">Allow creators to propose their own rate</label>
          </div>
        </div>
      )}

      {/* Step: Deliverables */}
      {step === 'deliverables' && (
        <div className="space-y-5">
          <p className="text-sm text-gray-500">Define what creators need to deliver</p>
          {deliverables.map((del, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 space-y-3 relative">
              {deliverables.length > 1 && (
                <button onClick={() => removeDeliverable(i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-sm">Remove</button>
              )}
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={del.title} onChange={e => updateDeliverable(i, 'title', e.target.value)}
                  placeholder="Deliverable title" className="px-3 py-2 border rounded-lg text-sm" />
                <select value={del.deliverable_type} onChange={e => updateDeliverable(i, 'deliverable_type', e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
                  {deliverableTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <textarea value={del.description} onChange={e => updateDeliverable(i, 'description', e.target.value)}
                placeholder="Description (optional)" rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <div>
                <label className="text-xs text-gray-500">Quantity</label>
                <input type="number" value={del.quantity} min={1} onChange={e => updateDeliverable(i, 'quantity', parseInt(e.target.value))}
                  className="w-20 px-3 py-2 border rounded-lg text-sm ml-2" />
              </div>
            </div>
          ))}
          <button onClick={addDeliverable} className="text-purple-600 text-sm font-semibold hover:underline">+ Add deliverable</button>
        </div>
      )}

      {/* Step: Requirements */}
      {step === 'requirements' && (
        <div className="space-y-5">
          <p className="text-sm text-gray-500">Set eligibility requirements for creators</p>
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={form.require_pro} onChange={e => updateForm('require_pro', e.target.checked)} className="w-4 h-4 text-purple-600 rounded" />
            <label className="text-sm text-gray-700">Require Pro subscription</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={form.require_pro_plus} onChange={e => updateForm('require_pro_plus', e.target.checked)} className="w-4 h-4 text-purple-600 rounded" />
            <label className="text-sm text-gray-700">Require Pro+ subscription (elite)</label>
          </div>
          {requirements.map((req, i) => (
            <div key={i} className="flex items-center gap-3">
              <select value={req.req_type} onChange={e => updateRequirement(i, 'req_type', e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
                {reqTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
              <input type="text" value={req.req_value} onChange={e => updateRequirement(i, 'req_value', e.target.value)}
                placeholder="Value" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
              <label className="flex items-center gap-1 text-xs text-gray-500">
                <input type="checkbox" checked={req.is_required} onChange={e => updateRequirement(i, 'is_required', e.target.checked)} className="w-3.5 h-3.5" />
                Required
              </label>
              {requirements.length > 1 && (
                <button onClick={() => removeRequirement(i)} className="text-red-400 hover:text-red-600 text-sm">×</button>
              )}
            </div>
          ))}
          <button onClick={addRequirement} className="text-purple-600 text-sm font-semibold hover:underline">+ Add requirement</button>
        </div>
      )}

      {/* Step: Review */}
      {step === 'review' && (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-gray-900">{form.title || '(Untitled)'}</h3>
            <p className="text-sm text-gray-500">{form.brief}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-400">Type:</span> <span className="capitalize">{form.campaign_type.replace(/_/g, ' ')}</span></div>
              <div><span className="text-gray-400">Visibility:</span> <span className="capitalize">{form.visibility.replace(/_/g, ' ')}</span></div>
              <div><span className="text-gray-400">Budget:</span> {form.fee_per_creator || form.total_budget || 'Variable'} NGN</div>
              <div><span className="text-gray-400">Max Creators:</span> {form.max_creators || 'Unlimited'}</div>
            </div>
            {deliverables.filter(d => d.title).length > 0 && (
              <div>
                <span className="text-gray-400 text-sm">Deliverables:</span>
                <ul className="mt-1 space-y-1">
                  {deliverables.filter(d => d.title).map((d, i) => (
                    <li key={i} className="text-sm text-gray-700">• {d.quantity}x {d.title} ({d.deliverable_type.replace(/_/g, ' ')})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <button
          onClick={() => setStep(steps[currentStepIndex - 1])}
          disabled={currentStepIndex === 0}
          className="px-6 py-2.5 border rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          Back
        </button>

        {step === 'review' ? (
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-8 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Campaign'}
          </button>
        ) : (
          <button
            onClick={() => setStep(steps[currentStepIndex + 1])}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
