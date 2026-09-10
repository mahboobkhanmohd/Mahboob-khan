import React, { useState } from 'react';
import { ChevronDown, CloudSun, Droplets, Sun, Thermometer, Wind } from 'lucide-react';

const scoreFactors = [
  { label: 'Temperature', Icon: Thermometer },
  { label: 'Humidity', Icon: Droplets },
  { label: 'Feels-like temperature', Icon: CloudSun },
  { label: 'Wind', Icon: Wind },
  { label: 'UV exposure', Icon: Sun },
];

export const About: React.FC = () => {
  const [showCalculation, setShowCalculation] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
          Understanding heat risk
        </h1>
        <p className="mt-3 text-base leading-relaxed text-stone-600">
          HeatSafe turns a few weather conditions into a simple way to understand today&apos;s heat.
        </p>
      </div>

      <div className="space-y-9">
        <section>
          <h2 className="text-sm font-bold tracking-widest text-stone-500">WHAT IS A HEATWAVE?</h2>
          <p className="mt-2 text-lg leading-relaxed text-stone-800">
            An extended period of unusually hot weather.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold tracking-widest text-stone-500">WHAT IS HEAT STRESS?</h2>
          <p className="mt-2 text-lg leading-relaxed text-stone-800">
            When your body has difficulty cooling itself because of high heat and environmental conditions.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold tracking-widest text-stone-500">HOW DOES HEATSAFE WORK?</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xs">
            {['Weather data', 'Heat analysis', 'Heat Stress Score', 'Simple warning', 'Safety guidance'].map(
              (step, index, steps) => (
                <React.Fragment key={step}>
                  <div className="px-5 py-3.5 text-base font-semibold text-stone-900">{step}</div>
                  {index < steps.length - 1 && (
                    <div className="px-5 text-sm text-stone-400" aria-hidden="true">↓</div>
                  )}
                </React.Fragment>
              )
            )}
          </div>
        </section>

        <section className="border-t border-stone-200 pt-6">
          <button
            type="button"
            onClick={() => setShowCalculation(!showCalculation)}
            aria-expanded={showCalculation}
            className="flex w-full items-center justify-between text-left cursor-pointer"
          >
            <span className="text-lg font-bold text-stone-900">How is the score calculated?</span>
            <ChevronDown
              className={`h-5 w-5 text-stone-500 transition-transform ${showCalculation ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {showCalculation && (
            <div className="mt-4 rounded-xl bg-stone-100 p-4 sm:p-5">
              <p className="text-sm leading-relaxed text-stone-700">
                HeatSafe combines these conditions into an experimental 0–100 indicator:
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {scoreFactors.map(({ label, Icon }) => (
                  <div key={label} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2.5 text-sm text-stone-800">
                    <Icon className="h-4 w-4 text-amber-600" aria-hidden="true" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-stone-600">
                The score is an educational indicator. It does not replace official warnings or medical advice.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-5">
          <p className="text-sm leading-relaxed text-amber-950">
            HeatSafe is an educational research prototype.<br />
            It does not replace official government heatwave warnings<br className="hidden sm:block" />
            or medical advice.
          </p>
        </section>

        <section className="border-t border-stone-200 pt-6 text-sm text-stone-600">
          <h2 className="font-bold text-stone-900">Data sources</h2>
          <p className="mt-2">Weather: Open-Meteo</p>
          <p className="mt-1">Map: OpenStreetMap</p>
        </section>
      </div>
    </div>
  );
};
