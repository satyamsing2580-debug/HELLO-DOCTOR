import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Plus, Trash2, Edit2, Eye, EyeOff, Check, 
  ExternalLink, ArrowRight, Layout, AlertCircle
} from 'lucide-react';
import { PromoBanner } from '../../types';
import { realtimeDb } from '../../services/realtimeDb';

export const AdminBannersCMS: React.FC = () => {
  const [banners, setBanners] = useState<PromoBanner[]>(() => realtimeDb.getPromoBanners());
  const [isCreating, setIsCreating] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('SPECIAL OFFER');
  const [type, setType] = useState<'banner' | 'ticker'>('banner');
  const [gradientFrom, setGradientFrom] = useState('from-sky-600');
  const [gradientTo, setGradientTo] = useState('to-blue-700');
  const [linkTab, setLinkTab] = useState<'home' | 'bookings' | 'labtests'>('home');
  const [buttonText, setButtonText] = useState('Explore Now');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    return realtimeDb.subscribePromoBanners((list) => {
      setBanners(list);
    });
  }, []);

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setBadge('SPECIAL OFFER');
    setType('banner');
    setGradientFrom('from-sky-600');
    setGradientTo('to-blue-700');
    setLinkTab('home');
    setButtonText('Explore Now');
    setIsActive(true);
    setIsCreating(false);
    setEditingBanner(null);
  };

  const handleStartEdit = (b: PromoBanner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setBadge(b.badge || 'OFFER');
    setType(b.type);
    setGradientFrom(b.gradientFrom || 'from-sky-600');
    setGradientTo(b.gradientTo || 'to-blue-700');
    setLinkTab(b.linkTab || 'home');
    setButtonText(b.buttonText || 'Explore');
    setIsActive(b.isActive);
    setIsCreating(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingBanner) {
      await realtimeDb.updatePromoBanner(editingBanner.id, {
        title: title.trim(),
        subtitle: subtitle.trim(),
        badge: badge.trim(),
        type,
        gradientFrom,
        gradientTo,
        linkTab,
        buttonText: buttonText.trim(),
        isActive
      });
    } else {
      await realtimeDb.addPromoBanner({
        title: title.trim(),
        subtitle: subtitle.trim(),
        badge: badge.trim(),
        type,
        gradientFrom,
        gradientTo,
        linkTab,
        buttonText: buttonText.trim(),
        isActive,
        priority: banners.length + 1
      });
    }

    resetForm();
  };

  const handleToggleActive = async (b: PromoBanner) => {
    await realtimeDb.updatePromoBanner(b.id, { isActive: !b.isActive });
  };

  const handleDelete = async (b: PromoBanner) => {
    if (window.confirm(`Delete promotional banner "${b.title}"?`)) {
      await realtimeDb.deletePromoBanner(b.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Promotional Banners & Tickers CMS</span>
          </h3>
          <p className="text-xs text-slate-500">
            {banners.length} Active Platform Promotions & Announcements
          </p>
        </div>

        {!isCreating && (
          <button
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Banner</span>
          </button>
        )}
      </div>

      {/* Create / Edit Form */}
      {isCreating && (
        <form onSubmit={handleSave} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-md space-y-3.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-bold text-slate-900">
              {editingBanner ? 'Edit Promotional Banner' : 'Create New Promotional Banner / Ticker'}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Display Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'banner' | 'ticker')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="banner">Homepage Card Banner</option>
                <option value="ticker">Top Announcement Ticker</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tag / Badge</label>
              <input
                type="text"
                placeholder="e.g. SPECIAL OFFER, LIVE OPD"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Headline / Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Flat ₹100 OFF on Full Body Health Checkup"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          {type === 'banner' && (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtitle / Details</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Available across Sadar Hospital Gopalganj & Siwan clinics."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Action Tab</label>
                  <select
                    value={linkTab}
                    onChange={(e) => setLinkTab(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="home">Home (OPD Doctors)</option>
                    <option value="labtests">Lab Tests Catalog</option>
                    <option value="bookings">My Bookings</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Button CTA Text</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Card Theme Gradient</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGradientFrom('from-sky-600');
                      setGradientTo('to-blue-700');
                    }}
                    className={`h-7 flex-1 rounded-lg bg-gradient-to-r from-sky-600 to-blue-700 ${gradientFrom === 'from-sky-600' ? 'ring-2 ring-sky-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setGradientFrom('from-teal-600');
                      setGradientTo('to-emerald-700');
                    }}
                    className={`h-7 flex-1 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-700 ${gradientFrom === 'from-teal-600' ? 'ring-2 ring-teal-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setGradientFrom('from-purple-600');
                      setGradientTo('to-indigo-700');
                    }}
                    className={`h-7 flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-700 ${gradientFrom === 'from-purple-600' ? 'ring-2 ring-purple-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setGradientFrom('from-rose-600');
                      setGradientTo('to-red-700');
                    }}
                    className={`h-7 flex-1 rounded-lg bg-gradient-to-r from-rose-600 to-red-700 ${gradientFrom === 'from-rose-600' ? 'ring-2 ring-rose-500' : ''}`}
                  />
                </div>
              </div>
            </>
          )}

          {/* Live Preview Card */}
          <div className="pt-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Live Preview</label>
            {type === 'banner' ? (
              <div className={`p-4 rounded-2xl bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white shadow-md space-y-1`}>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 border border-white/30 inline-block">
                  {badge}
                </span>
                <h4 className="font-extrabold text-xs">{title || 'Headline Here'}</h4>
                <p className="text-[10px] text-white/80">{subtitle || 'Short description here'}</p>
                <div className="pt-2">
                  <span className="inline-flex items-center text-[10px] font-bold bg-white text-slate-900 px-3 py-1 rounded-xl shadow-xs">
                    {buttonText} →
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-amber-500 text-slate-900 text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-xs">
                <span>⚡ {title || 'Live Ticker Announcement'}</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center space-x-2">
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md"
            >
              {editingBanner ? 'Save Changes' : 'Publish Banner'}
            </button>
          </div>
        </form>
      )}

      {/* List of Existing Banners */}
      <div className="space-y-2.5">
        {banners.map((b) => (
          <div
            key={b.id}
            className={`p-3.5 rounded-2xl border transition-all ${
              b.isActive
                ? 'bg-white border-slate-200/90 shadow-2xs'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                    {b.type}
                  </span>
                  {b.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      {b.badge}
                    </span>
                  )}
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      b.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {b.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <h4 className="font-extrabold text-xs text-slate-900 mt-1">{b.title}</h4>
                {b.subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{b.subtitle}</p>}
                {b.linkTab && (
                  <p className="text-[10px] text-sky-600 font-semibold mt-1">
                    Redirects to: {b.linkTab.toUpperCase()}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={() => handleToggleActive(b)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    b.isActive
                      ? 'text-emerald-700 hover:bg-emerald-50'
                      : 'text-slate-400 hover:bg-slate-200'
                  }`}
                  title={b.isActive ? 'Disable' : 'Enable'}
                >
                  {b.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleStartEdit(b)}
                  className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg cursor-pointer"
                  title="Edit Banner"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(b)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  title="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No active banners. Click &ldquo;New Banner&rdquo; to create your first promotion.
          </div>
        )}
      </div>
    </div>
  );
};
