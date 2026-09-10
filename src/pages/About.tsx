import React from 'react';
import { ShieldAlert, AlertTriangle, HeartPulse, CheckCircle2, PhoneCall, HelpCircle } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10">
      {/* Intro Header */}
      <div className="border-b border-stone-200 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200/70 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-3">
          Smart India Hackathon Project
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
          About HEATSAFE
        </h1>
        <p className="text-lg text-stone-600 mt-2 font-normal">
          "Know the heat. Protect yourself." — Extreme heat early-warning designed for ordinary people, elderly citizens, and community workers.
        </p>
      </div>

      {/* Core Mission */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <span>The Core Problem</span>
        </h2>
        <p className="text-stone-700 text-base leading-relaxed">
          Traditional weather apps show 25 different complicated meteorological numbers: barometric pressure, dew point, UV index, wind gusts, and cloud cover percentages. For an elderly grandparent planning their grocery walk, or an outdoor construction laborer, this information is confusing and unhelpful.
        </p>
        <p className="text-stone-700 text-base leading-relaxed">
          <strong className="font-semibold text-stone-900">HEATSAFE</strong> strips away the engineering jargon to answer one single life-or-death question in under 5 seconds:
          <span className="block mt-2 text-lg font-bold text-stone-900 bg-stone-100 p-3 rounded-xl border border-stone-200">
            "Is it safe for me to be outside right now?"
          </span>
        </p>
      </section>

      {/* Why Feels-Like & Humidity Matter */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-stone-700" />
          <span>Deterministic Thermal Stress Engine</span>
        </h2>
        <p className="text-stone-700 text-base leading-relaxed">
          The human body cools itself primarily through <strong className="text-stone-900">sweat evaporation</strong>. When ambient humidity is high, sweat cannot evaporate efficiently into the air. This causes heat to build up inside the body even when standard thermometers show moderate readings.
        </p>
        <p className="text-stone-700 text-base leading-relaxed">
          HEATSAFE calculates an experimental, deterministic <strong className="text-stone-900">Heat Stress Score (0–100)</strong> using a transparent weighted formula:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center text-xs">
          <div className="p-3 bg-stone-100 rounded-xl border border-stone-200">
            <div className="font-black text-stone-900 text-base">40%</div>
            <div className="text-stone-600 mt-0.5">Temperature</div>
          </div>
          <div className="p-3 bg-stone-100 rounded-xl border border-stone-200">
            <div className="font-black text-stone-900 text-base">25%</div>
            <div className="text-stone-600 mt-0.5">Humidity</div>
          </div>
          <div className="p-3 bg-stone-100 rounded-xl border border-stone-200">
            <div className="font-black text-stone-900 text-base">20%</div>
            <div className="text-stone-600 mt-0.5">Apparent Temp</div>
          </div>
          <div className="p-3 bg-stone-100 rounded-xl border border-stone-200">
            <div className="font-black text-stone-900 text-base">10%</div>
            <div className="text-stone-600 mt-0.5">UV Index</div>
          </div>
          <div className="p-3 bg-stone-100 rounded-xl border border-stone-200">
            <div className="font-black text-stone-900 text-base">5%</div>
            <div className="text-stone-600 mt-0.5">Wind Cooling</div>
          </div>
        </div>
        <p className="text-xs text-stone-500 italic">
          Disclaimer: This is an experimental educational indicator designed to raise heat health awareness. It is not an official government index. No AI model is used in computing this score; it is strictly deterministic.
        </p>
      </section>

      {/* Critical Medical Difference: Heat Exhaustion vs Heat Stroke */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-rose-600" />
          <span>Know the Warning Signs: Heat Exhaustion vs Heat Stroke</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          {/* Heat Exhaustion Card */}
          <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-amber-900 text-base">Heat Exhaustion</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                Move to shade & cool down
              </span>
            </div>
            <ul className="space-y-2 text-sm text-stone-700 mt-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Heavy, profuse sweating</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Cold, pale, or clammy skin</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Fast, weak pulse</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Nausea, vomiting, or muscle cramps</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Dizziness and weakness</span>
              </li>
            </ul>
          </div>

          {/* Heat Stroke Card */}
          <div className="p-5 rounded-xl border border-rose-200 bg-rose-50/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-rose-900 text-base">Heat Stroke (Medical Emergency)</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-200 text-rose-900">
                Call 108 Immediately
              </span>
            </div>
            <ul className="space-y-2 text-sm text-stone-700 mt-3">
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>Extremely high body temperature (above 103°F / 39.5°C)</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>Hot, red, dry or damp skin with <strong>NO sweating</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>Rapid, strong, pounding pulse</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>Confusion, slurred speech, or delirium</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>Loss of consciousness or seizures</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Emergency Helpline Section */}
      <section className="p-6 rounded-2xl bg-stone-900 text-stone-100 space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-amber-400" />
          <span>India Emergency Numbers & Public Services</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-stone-800/90 border border-stone-700">
            <div className="text-2xl font-black text-amber-400">108</div>
            <div className="text-xs font-semibold text-white mt-0.5">Ambulance Service</div>
            <p className="text-[11px] text-stone-400 mt-1">
              For acute heat stroke, unconsciousness, or severe heat illness.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-800/90 border border-stone-700">
            <div className="text-2xl font-black text-amber-400">112</div>
            <div className="text-xs font-semibold text-white mt-0.5">National All-in-One Helpline</div>
            <p className="text-[11px] text-stone-400 mt-1">
              Integrated emergency response throughout all Indian states.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-800/90 border border-stone-700">
            <div className="text-2xl font-black text-amber-400">1070</div>
            <div className="text-xs font-semibold text-white mt-0.5">Disaster Management Relief</div>
            <p className="text-[11px] text-stone-400 mt-1">
              State-level emergency relief and severe weather advisories.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
