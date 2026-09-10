import React from 'react';
import { ShieldAlert, Heart, Phone, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              </div>
              <span className="font-bold text-stone-900 tracking-tight">HEATSAFE</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              "Know the heat. Protect yourself." An easy-to-understand extreme heat early-warning and human heat-stress awareness system. Designed for ordinary citizens, elderly family members, and outdoor workers.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">
              Emergency Hotlines (India)
            </h4>
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="font-medium text-stone-900">108</span> — Emergency Ambulance & Heatstroke
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-stone-700 shrink-0" />
                <span className="font-medium text-stone-900">112</span> — National Emergency Services
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-stone-700 shrink-0" />
                <span className="font-medium text-stone-900">1070 / 1077</span> — State Disaster Management
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">
              Scientific Standards
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed mb-2">
              Heat risk categories adhere to the National Disaster Management Authority (NDMA) Heat Wave Action Guidelines and the IMD Heat Index standards.
            </p>
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500">
              <span>Smart India Hackathon Initiative</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
          <div>
            © {new Date().getFullYear()} HEATSAFE Project. Educational and public welfare prototype.
          </div>
          <div className="text-stone-400">
            Powered by OpenStreetMap & Open-Meteo
          </div>
        </div>
      </div>
    </footer>
  );
};
