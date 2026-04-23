/**
 * Campaign Create Form
 * Multi-step wizard for brands to create paid campaigns.
 * Redesigned with better UX: image upload area, clear date pickers,
 * readable requirement selectors, and hybrid product picker.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { brandCampaignApi } from '@/services/campaignService';
import { formatNaira, getPlatformIcon } from '@/lib/demoData';

interface CampaignCreateFormProps {
  token: string;
}

interface ProductItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  image_url: string;
}

type Step = 'basics' | 'budget' | 'products' | 'deliverables' | 'requirements' | 'review';

const DELIVERABLE_TYPES = [
  { value: 'instagram_post', label: 'Instagram Post/Reel', icon: '📸' },
  { value: 'instagram_story', label: 'Instagram Story', icon: '📱' },
  { value: 'tiktok_video', label: 'TikTok Video', icon: '🎵' },
  { value: 'youtube_video', label: 'YouTube Video', icon: '🎬' },
  { value: 'whatsapp_status', label: 'WhatsApp Status', icon: '💬' },
  { value: 'blog_post', label: 'Blog Post', icon: '📝' },
  { value: 'product_review', label: 'Product Review', icon: '⭐' },
  { value: 'unboxing', label: 'Unboxing Video', icon: '📦' },
  { value: 'custom', label: 'Custom', icon: '🎯' },
];

const REQUIREMENT_TYPES = [
  { value: 'niche', label: 'Creator Niche', placeholder: 'e.g. beauty, fashion, tech', hint: 'What niche should creators be in?' },
  { value: 'location', label: 'Location', placeholder: 'e.g. Lagos, Nigeria', hint: 'Where should the creator be based?' },
  { value: 'platform', label: 'Primary Platform', placeholder: 'e.g. Instagram, TikTok', hint: 'Which platform do they mainly post on?' },
  { value: 'follower_min', label: 'Minimum Followers', placeholder: 'e.g. 5000', hint: 'Minimum follower count required' },
  { value: 'follower_max', label: 'Maximum Followers', placeholder: 'e.g. 100000', hint: 'Maximum follower count (for micro-creator focus)' },
  { value: 'engagement_min', label: 'Min Engagement Rate', placeholder: 'e.g. 3', hint: 'Minimum engagement rate (%)' },
  { value: 'content_type', label: 'Content Style', placeholder: 'e.g. lifestyle, comedy', hint: 'What kind of content do they create?' },
  { value: 'custom', label: 'Other Requirement', placeholder: 'Describe your requirement', hint: 'Any other specific requirement' },
];

export default function CampaignCreateForm({ token }: CampaignCreateFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('basics');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  const [availableProducts, setAvailableProducts] = useState<ProductItem[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [coverPreview, setCoverPreview] = useState('');

  const isHybrid = form.campaign_type === 'fee_plus_commission' || form.commission_on_top;

  const steps: Step[] = isHybrid
    ? ['basics', 'budget', 'products', 'deliverables', 'requirements', 'review']
    : ['basics', 'budget', 'deliverables', 'requirements', 'review'];
  const currentStepIndex = steps.indexOf(step);

  const stepLabels: Record<Step, string> = {
    basics: 'Basics',
    budget: 'Budget',
    products: 'Products',
    deliverables: 'Content',
    requirements: 'Targeting',
    review: 'Review',
  };

  const updateForm = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  // Fetch products when entering the products step
  const fetchProducts = useCallback(async (search?: string) => {
    setLoadingProducts(true);
    try {
      const res = await brandCampaignApi.listProducts(token, { search: search || undefined });
      setAvailableProducts((res as any).data?.products || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, [token]);

  useEffect(() => {
    if (step === 'products') fetchProducts();
  }, [step, fetchProducts]);

  const toggleProduct = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');

    try {
      const payload: any = {
        ...form,
        fee_per_creator: form.fee_per_creator ? parseFloat(form.fee_per_creator) : undefined,
        fee_min: form.fee_min ? parseFloat(form.fee_min) : undefined,
        fee_max: form.fee_max ? parseFloat(form.fee_max) : undefined,
        total_budget: form.total_budget ? parseFloat(form.total_budget) : undefined,
        commission_rate: form.commission_rate ? parseFloat(form.commission_rate) : undefined,
        max_creators: form.max_creators ? parseInt(form.max_creators) : undefined,
        application_deadline: form.application_deadline || undefined,
        content_deadline: form.content_deadline || undefined,
        deliverables: deliverables.filter(d => d.title.trim()),
        requirements: requirements.filter(r => r.req_value.trim()),
        product_ids: isHybrid ? selectedProductIds : [],
      };

      // Remove undefined keys so they don't get sent as null
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

      const res = await brandCampaignApi.create(payload, token);
      const campaignId = (res as any).data?.id;
      router.push(campaignId ? `/campaigns/${campaignId}/manage` : '/campaigns');
    } catch (err: any) {
      setError(err.data?.error || err.message || 'Failed to create campaign');
    } finally {
      setSaving(false);
    }
  };

  // Get min date for deadline inputs (today)
  const getMinDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#5F28A5' }}>Create Campaign</h1>
      <p className="text-gray-500 text-sm mb-8">Set up a new paid collaboration for creators</p>

      {/* Step indicator with labels */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <button
              onClick={() => i <= currentStepIndex && setStep(s)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                i === currentStepIndex
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : i < currentStepIndex
                    ? 'bg-green-50 text-green-700 border border-green-100'
                    : 'bg-gray-50 text-gray-400 border border-gray-100'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                i < currentStepIndex ? 'bg-green-500 text-white' : i === currentStepIndex ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {i < currentStepIndex ? '✓' : i + 1}
              </span>
              {stepLabels[s]}
            </button>
            {i < steps.length - 1 && <div className={`w-6 h-0.5 flex-shrink-0 ${i < currentStepIndex ? 'bg-green-300' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* ─── Step: Basics ─── */}
      {step === 'basics' && (
        <div className="space-y-5">
          <div>
            <label className="label">Campaign Title *</label>
            <input type="text" value={form.title} onChange={e => updateForm('title', e.target.value)}
              className="input" placeholder="e.g. Summer Glow Collection Launch" />
          </div>
          <div>
            <label className="label">Campaign Brief</label>
            <textarea value={form.brief} onChange={e => updateForm('brief', e.target.value)} rows={4}
              className="input" placeholder="Describe what you're looking for — the kind of content, your goals, and what makes this campaign exciting for creators..." />
            <p className="text-xs text-gray-400 mt-1">{form.brief.length}/2000 characters</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Campaign Type *</label>
              <select value={form.campaign_type} onChange={e => updateForm('campaign_type', e.target.value)} className="input">
                <option value="fixed_fee">Fixed Fee — Pay per creator</option>
                <option value="fee_plus_commission">Fee + Commission — Hybrid model</option>
                <option value="gifted">Gifted — Product exchange</option>
                <option value="open">Open — Creators set rates</option>
              </select>
            </div>
            <div>
              <label className="label">Visibility</label>
              <select value={form.visibility} onChange={e => updateForm('visibility', e.target.value)} className="input">
                <option value="public">Public — All creators can see</option>
                <option value="premium_only">Premium Only — Pro/Pro+ creators</option>
                <option value="invite_only">Invite Only — Selected creators</option>
              </select>
            </div>
          </div>

          {/* Cover Image Upload Area */}
          <div>
            <label className="label">Cover Image</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-purple-300 transition cursor-pointer relative"
              onClick={() => {
                const url = prompt('Paste the image URL for your campaign cover:');
                if (url) { updateForm('cover_image_url', url); setCoverPreview(url); }
              }}>
              {coverPreview ? (
                <div className="relative">
                  <img src={coverPreview} alt="Cover preview" className="w-full h-32 object-cover rounded-lg" onError={() => setCoverPreview('')} />
                  <button onClick={(e) => { e.stopPropagation(); updateForm('cover_image_url', ''); setCoverPreview(''); }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-xl mx-auto mb-3">🖼️</div>
                  <p className="text-sm font-medium text-gray-700">Click to add a cover image</p>
                  <p className="text-xs text-gray-400 mt-1">Paste an image URL — recommended 1200×600px</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Step: Budget ─── */}
      {step === 'budget' && (
        <div className="space-y-5">
          <div>
            <label className="label">Budget Type</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'flat', label: 'Flat Fee', desc: 'Same fee for each creator', icon: '💵' },
                { value: 'variable', label: 'Range', desc: 'Min-max fee range', icon: '📊' },
                { value: 'total', label: 'Total Budget', desc: 'Split across creators', icon: '💰' },
              ].map(opt => (
                <button key={opt.value} onClick={() => updateForm('budget_type', opt.value)}
                  className={`card-flat p-3 text-left transition ${form.budget_type === opt.value ? 'border-purple-400 bg-purple-50' : 'hover:border-gray-300'}`}>
                  <span className="text-lg block mb-1">{opt.icon}</span>
                  <p className="text-sm font-semibold">{opt.label}</p>
                  <p className="text-xs text-gray-400">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {form.budget_type === 'flat' && (
            <div>
              <label className="label">Fee per Creator (₦)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₦</span>
                <input type="number" value={form.fee_per_creator} onChange={e => updateForm('fee_per_creator', e.target.value)}
                  className="input pl-7" placeholder="50,000" />
              </div>
            </div>
          )}
          {form.budget_type === 'variable' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Min Fee (₦)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₦</span>
                  <input type="number" value={form.fee_min} onChange={e => updateForm('fee_min', e.target.value)} className="input pl-7" placeholder="30,000" />
                </div>
              </div>
              <div>
                <label className="label">Max Fee (₦)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₦</span>
                  <input type="number" value={form.fee_max} onChange={e => updateForm('fee_max', e.target.value)} className="input pl-7" placeholder="80,000" />
                </div>
              </div>
            </div>
          )}
          {form.budget_type === 'total' && (
            <div>
              <label className="label">Total Campaign Budget (₦)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₦</span>
                <input type="number" value={form.total_budget} onChange={e => updateForm('total_budget', e.target.value)} className="input pl-7" placeholder="500,000" />
              </div>
            </div>
          )}

          {/* Hybrid toggle */}
          <div className="card-flat p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.commission_on_top} onChange={e => updateForm('commission_on_top', e.target.checked)} className="w-5 h-5 mt-0.5 rounded text-purple-600" />
              <div>
                <p className="font-semibold text-sm">Enable Hybrid Earnings</p>
                <p className="text-xs text-gray-500">Creators earn the campaign fee PLUS ongoing commission on product sales through their storefront</p>
              </div>
            </label>
            {form.commission_on_top && (
              <div className="mt-3 pl-8">
                <label className="label">Commission Rate (%)</label>
                <div className="relative w-32">
                  <input type="number" value={form.commission_rate} onChange={e => updateForm('commission_rate', e.target.value)}
                    className="input pr-7" placeholder="15" min="1" max="50" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Max Creators</label>
              <input type="number" value={form.max_creators} onChange={e => updateForm('max_creators', e.target.value)}
                className="input" placeholder="e.g. 5" min="1" />
              <p className="text-xs text-gray-400 mt-1">How many creators can join</p>
            </div>
            <div>
              <label className="label">Application Deadline</label>
              <input type="date" value={form.application_deadline ? form.application_deadline.split('T')[0] : ''}
                onChange={e => updateForm('application_deadline', e.target.value ? e.target.value + 'T23:59:00' : '')}
                min={new Date().toISOString().split('T')[0]}
                className="input" />
              <p className="text-xs text-gray-400 mt-1">Leave blank for no deadline</p>
            </div>
          </div>

          <div>
            <label className="label">Content Delivery Deadline</label>
            <input type="date" value={form.content_deadline ? form.content_deadline.split('T')[0] : ''}
              onChange={e => updateForm('content_deadline', e.target.value ? e.target.value + 'T23:59:00' : '')}
              min={new Date().toISOString().split('T')[0]}
              className="input" />
            <p className="text-xs text-gray-400 mt-1">When creators should deliver their content</p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.allow_negotiation} onChange={e => updateForm('allow_negotiation', e.target.checked)} className="w-4 h-4 rounded text-purple-600" />
            <span className="text-sm text-gray-700">Allow creators to propose their own rate</span>
          </label>
        </div>
      )}

      {/* ─── Step: Products (Hybrid Only) ─── */}
      {step === 'products' && (
        <div className="space-y-5">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentC