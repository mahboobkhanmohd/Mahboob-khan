import React from 'react';
import { Droplets, Clock, Shirt, Home, Heart, Sun, PhoneCall, AlertCircle } from 'lucide-react';
import { VulnerableProfile, AdvisoryItem } from '../types/heat';
import { ADVISORIES_BY_PROFILE } from '../services/mockData';

interface ActionableAdviceProps {
  profile: VulnerableProfile;
  onProfileChange: (profile: VulnerableProfile) => void;
}

export const ActionableAdvice: React.FC<ActionableAdviceProps> = ({
  profile,
  onProfileChange,
}) => {
  const currentAdvisories = ADVISORIES_BY_PROFILE[profile] || ADVISORIES_BY_PROFILE.general;

  const renderIcon = (name: AdvisoryItem['iconName']) => {
    const className = "w-5 h-5 text-stone-700 shrink-0 mt-0.5";
    switch (name) {
      case 'Droplets':
        return <Droplets className={className} />;
      case 'Clock':
        return <Clock className={className} />;
      case 'Shirt':
        return <Shirt className={className} />;
      case 'Home':
        return <Home className={className} />;
      case 'Heart':
        return <Heart className={className} />;
      case 'Sun':
        return <Sun className={className} />;
    }
  };

  const profileOptions: { id: VulnerableProfile; label: string; desc: string }[] = [
    { id: 'general', label: 'General Public', desc: 'Standard guidance' },
    { id: 'elderly', label: 'Elderly & Seniors', desc: 'Ages 60+' },
    { id: 'workers', label: 'Outdoor Workers', desc: 'Labor & Delivery' },
    { id: 'children', label: 'Children & Infants', desc: 'School & Play' },
  ];

  return (
    <section id="actionable-advice-section" className="mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">
            What Should You Do Right Now?
          </h2>
          <p className="text-sm text-stone-600">
            Clear, practical steps to prevent dehydration and heat-related illness.
          </p>
        </div>

        {/* Profile Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-200/70 rounded-xl">
          {profileOptions.map((opt) => (
            <button
              key={opt.id}
              id={`profile-btn-${opt.id}`}
              onClick={() => onProfileChange(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                profile === opt.id
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Essential Steps (Clean, spacious, uncrowded) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentAdvisories.map((item, index) => (
          <div
            key={item.id}
            id={`advisory-item-${item.id}`}
            className="p-5 rounded-xl border border-stone-200 bg-white shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-2.5">
                <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="p-1.5 rounded-lg bg-stone-100">
                  {renderIcon(item.iconName)}
                </span>
              </div>
              <h3 className="font-semibold text-stone-900 text-base leading-snug">
                {item.title}
              </h3>
              <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Assistance Strip */}
      <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
          <div className="text-xs sm:text-sm text-amber-900">
            <span className="font-semibold">Heatstroke Warning Signs:</span> High body temperature (103°F+), rapid pulse, dizziness, nausea, confusion, or no sweating.
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <a
            href="tel:108"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call 108 (Ambulance)</span>
          </a>
          <a
            href="tel:112"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call 112 (Emergency)</span>
          </a>
        </div>
      </div>
    </section>
  );
};
