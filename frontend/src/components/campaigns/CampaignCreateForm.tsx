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

          {/* Cover Image Upload */}
          <div>
            <label className="label">Cover Image</label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer relative ${coverPreview ? 'border-purple-300 bg-purple-50/30' : 'border-gray-200 hover:border-purple-300'}`}
              onClick={() => document.getElementById('cover-upload')?.click()}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-purple-400', 'bg-purple-50'); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove('border-purple-400', 'bg-purple-50'); }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-purple-400', 'bg-purple-50');
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const dataUrl = ev.target?.result as string;
                    setCoverPreview(dataUrl);
                    updateForm('cover_image_url', dataUrl);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            >
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const dataUrl = ev.target?.result as string;
                      setCoverPreview(dataUrl);
                      updateForm('cover_image_url', dataUrl);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {coverPreview ? (
                <div className="relative">
                  <img src={coverPreview} alt="Cover preview" className="w-full h-40 object-cover rounded-lg" />
                  <button onClick={(e) => { e.stopPropagation(); updateForm('cover_image_url', ''); setCoverPreview(''); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow-md hover:bg-red-600 transition">✕</button>
                  <p className="text-xs text-gray-400 mt-2">Click or drag to replace</p>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB — recommended 1200×600px</p>
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
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              <span className="font-semibold text-green-800">Hybrid Earnings Mode</span>
            </div>
            <p className="text-sm text-green-700">
              Select products from your catalog. When a creator is accepted, these products are automatically added
              to their Hookik storefront. They earn the campaign fee <strong>plus</strong> ongoing {form.commission_rate || '...'}% commission on every sale.
            </p>
          </div>

          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search your products..." value={productSearch}
              onChange={(e) => { setProductSearch(e.target.value); fetchProducts(e.target.value); }}
              className="input pl-10" />
          </div>

          {selectedProductIds.length > 0 && (
            <p className="text-sm font-medium" style={{ color: '#5F28A5' }}>
              {selectedProductIds.length} product{selectedProductIds.length > 1 ? 's' : ''} selected
            </p>
          )}

          {loadingProducts ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-24 rounded-lg" />)}
            </div>
          ) : availableProducts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <div className="text-3xl mb-3">📦</div>
              <p className="font-semibold text-gray-700 mb-1">No products found</p>
              <p className="text-sm text-gray-500">Add products to your catalog first</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {availableProducts.map((product) => {
                const selected = selectedProductIds.includes(product.id);
                return (
                  <button key={product.id} onClick={() => toggleProduct(product.id)}
                    className={`card-flat p-3 flex items-center gap-3 text-left transition ${selected ? 'border-purple-400 bg-purple-50' : 'hover:border-gray-300'}`}>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
                      {selected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm">📦</div>}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-gray-400">{formatNaira(product.price)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Step: Deliverables ─── */}
      {step === 'deliverables' && (
        <div className="space-y-5">
          <div>
            <h3 className="font-semibold mb-1">What should creators deliver?</h3>
            <p className="text-sm text-gray-500 mb-4">Define the content pieces you need from each creator</p>
          </div>

          {deliverables.map((del, i) => (
            <div key={i} className="card-flat p-4 relative">
              {deliverables.length > 1 && (
                <button onClick={() => setDeliverables(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="label">Title</label>
                  <input type="text" value={del.title}
                    onChange={e => setDeliverables(prev => prev.map((d, idx) => idx === i ? { ...d, title: e.target.value } : d))}
                    className="input" placeholder="e.g. Product Review Reel" />
                </div>
                <div>
                  <label className="label">Content Type</label>
                  <select value={del.deliverable_type}
                    onChange={e => setDeliverables(prev => prev.map((d, idx) => idx === i ? { ...d, deliverable_type: e.target.value } : d))}
                    className="input">
                    {DELIVERABLE_TYPES.map(dt => (
                      <option key={dt.value} value={dt.value}>{dt.icon} {dt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="label">Description (optional)</label>
                  <input type="text" value={del.description}
                    onChange={e => setDeliverables(prev => prev.map((d, idx) => idx === i ? { ...d, description: e.target.value } : d))}
                    className="input" placeholder="Brief instructions for the creator" />
                </div>
                <div>
                  <label className="label">Quantity</label>
                  <input type="number" value={del.quantity} min={1}
                    onChange={e => setDeliverables(prev => prev.map((d, idx) => idx === i ? { ...d, quantity: parseInt(e.target.value) || 1 } : d))}
                    className="input" />
                </div>
              </div>
            </div>
          ))}

          <button onClick={() => setDeliverables(prev => [...prev, { title: '', description: '', deliverable_type: 'instagram_post', quantity: 1 }])}
            className="btn-outline w-full">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Another Deliverable
          </button>
        </div>
      )}

      {/* ─── Step: Requirements (Targeting) ─── */}
      {step === 'requirements' && (
        <div className="space-y-5">
          <div>
            <h3 className="font-semibold mb-1">Who should apply?</h3>
            <p className="text-sm text-gray-500 mb-4">Set requirements to attract the right creators for your campaign</p>
          </div>

          {/* Creator Requirements */}
          {requirements.map((req, i) => {
            const typeInfo = REQUIREMENT_TYPES.find(rt => rt.value === req.req_type) || REQUIREMENT_TYPES[0];
            return (
              <div key={i} className="card-flat p-4 relative">
                {requirements.length > 1 && (
                  <button onClick={() => setRequirements(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <label className="label">Requirement Type</label>
                    <select value={req.req_type}
                      onChange={e => setRequirements(prev => prev.map((r, idx) => idx === i ? { ...r, req_type: e.target.value } : r))}
                      className="input">
                      {REQUIREMENT_TYPES.map(rt => (
                        <option key={rt.value} value={rt.value}>{rt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">{typeInfo.label} Value</label>
                    <input type="text" value={req.req_value}
                      onChange={e => setRequirements(prev => prev.map((r, idx) => idx === i ? { ...r, req_value: e.target.value } : r))}
                      className="input" placeholder={typeInfo.placeholder} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">{typeInfo.hint}</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={req.is_required}
                      onChange={e => setRequirements(prev => prev.map((r, idx) => idx === i ? { ...r, is_required: e.target.checked } : r))}
                      className="w-3.5 h-3.5 rounded text-purple-600" />
                    <span className="text-xs font-medium text-gray-500">Required</span>
                  </label>
                </div>
              </div>
            );
          })}

          <button onClick={() => setRequirements(prev => [...prev, { req_type: 'niche', req_value: '', is_required: true }])}
            className="btn-outline w-full">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Requirement
          </button>
        </div>
      )}

      {/* ─── Step: Review ─── */}
      {step === 'review' && (
        <div className="space-y-4">
          <div className="card-flat p-6">
            <h2 className="text-xl font-bold mb-1">{form.title || 'Untitled Campaign'}</h2>
            <p className="text-gray-500 text-sm mb-4">{form.brief || 'No brief provided'}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-sm"><span className="text-gray-500">Type:</span> <strong className="capitalize">{form.campaign_type.replace(/_/g, ' ')}</strong></div>
              <div className="text-sm"><span className="text-gray-500">Visibility:</span> <strong className="capitalize">{form.visibility}</strong></div>
              <div className="text-sm"><span className="text-gray-500">Budget:</span> <strong>{form.fee_per_creator ? formatNaira(parseFloat(form.fee_per_creator)) : form.fee_min ? `${formatNaira(parseFloat(form.fee_min))} - ${formatNaira(parseFloat(form.fee_max || '0'))}` : form.total_budget ? formatNaira(parseFloat(form.total_budget)) : '—'}</strong></div>
              <div className="text-sm"><span className="text-gray-500">Max Creators:</span> <strong>{form.max_creators || '—'}</strong></div>
            </div>

            {isHybrid && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  <span className="font-semibold text-green-800 text-sm">Hybrid Campaign</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Creators earn campaign fee + {form.commission_rate || '0'}% ongoing affiliate commission on {selectedProductIds.length} linked product{selectedProductIds.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {deliverables.filter(d => d.title.trim()).length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Deliverables:</p>
                {deliverables.filter(d => d.title.trim()).map((d, i) => (
                  <p key={i} className="text-sm">{getPlatformIcon(d.deliverable_type)} {d.quantity}x {d.title}</p>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}
        </div>
      )}

      {/* ─── Navigation ─── */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <button
          onClick={() => currentStepIndex > 0 && setStep(steps[currentStepIndex - 1])}
          disabled={currentStepIndex === 0}
          className={`btn-outline ${currentStepIndex === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          Back
        </button>

        {step === 'review' ? (
          <button onClick={handleSubmit} disabled={saving} className="btn-primary btn-lg">
            {saving ? 'Creating...' : 'Create Campaign'}
          </button>
        ) : (
          <button onClick={() => setStep(steps[currentStepIndex + 1])} className="btn-primary">
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
