import React from 'react';
import { ChevronLeft, Search, ArrowRight, Smartphone } from 'lucide-react';
import { DEVICE_CATEGORIES, BRANDS } from '../data';
import { getAssetUrl } from '../utils';
import type { DeviceType, Model, Selection } from '../types';

interface DeviceStepProps {
  subStep: number;
  selection: Selection;
  searchQuery: string;
  showCustomInput: { device: boolean; brand: boolean; model: boolean };
  customInputValues: { device: string; brand: string; model: string };
  showOnlyOtherModel: boolean;
  visibleModels: Model[];
  onBack: () => void;
  onDeviceSelect: (id: DeviceType) => void;
  onBrandSelect: (id: string) => void;
  onModelSelect: (model: Model) => void;
  onCustomDeviceSubmit: () => void;
  onCustomBrandSubmit: () => void;
  onCustomModelSubmit: () => void;
  setShowCustomInput: React.Dispatch<React.SetStateAction<{ device: boolean; brand: boolean; model: boolean; repair: boolean }>>;
  setCustomInputValues: React.Dispatch<React.SetStateAction<{ device: string; brand: string; model: string; repair: string }>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export function DeviceStep(props: DeviceStepProps) {
  const {
    subStep,
    selection,
    searchQuery,
    showCustomInput,
    customInputValues,
    showOnlyOtherModel,
    visibleModels,
    onBack,
    onDeviceSelect,
    onBrandSelect,
    onModelSelect,
    onCustomDeviceSubmit,
    onCustomBrandSubmit,
    onCustomModelSubmit,
    setShowCustomInput,
    setCustomInputValues,
    setSearchQuery,
  } = props;

  return (
    <>
      <div className="flex items-center mb-8 relative">
        {subStep > 0 && (
          <button onClick={onBack} className="absolute left-[-20px] top-1 p-2 rounded-full hover:bg-red-50 text-[#e03d27] transition-colors">
            <ChevronLeft className="w-6 h-6" strokeWidth={3} />
          </button>
        )}
        <h1 className="text-3xl font-bold text-gray-800 ml-6">
          {subStep === 0 && 'Which device do you want to repair?'}
          {subStep === 1 && 'Select your brand'}
          {subStep === 2 && 'Which model do you have?'}
        </h1>
      </div>

      {subStep === 0 && (
        <div className="animate-fade-in-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {DEVICE_CATEGORIES.map((device) => (
              <button
                key={device.id}
                onClick={() => onDeviceSelect(device.id)}
                className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-[#e03d27] transition-all duration-300 group"
              >
                <div className="group-hover:text-[#e03d27] transition-colors duration-300">{device.icon}</div>
                <span className="text-sm font-semibold tracking-wider text-gray-500 group-hover:text-gray-800 transition-colors duration-300">{device.label}</span>
              </button>
            ))}
            <button
              onClick={() => setShowCustomInput((p) => ({ ...p, device: !p.device }))}
              className={`flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed ${showCustomInput.device ? 'border-[#e03d27] bg-red-50' : 'border-gray-300'} rounded-xl hover:border-[#e03d27] hover:bg-red-50 transition-all duration-300 group`}
            >
              <b className="text-4xl font-light text-gray-300 group-hover:text-[#e03d27] transition-colors">+</b>
              <span className="text-xs font-bold tracking-widest text-gray-400 group-hover:text-[#e03d27] transition-colors mt-2">OTHER</span>
            </button>
          </div>
          {showCustomInput.device && (
            <div className="mt-8 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Enter device type"
                  value={customInputValues.device}
                  onChange={(e) => setCustomInputValues((p) => ({ ...p, device: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter' && customInputValues.device.trim()) onCustomDeviceSubmit(); }}
                  className="flex-1 p-4 border border-gray-300 rounded-xl focus:border-[#e03d27] focus:ring-0 outline-none transition-colors"
                />
                <button
                  onClick={onCustomDeviceSubmit}
                  disabled={!customInputValues.device.trim()}
                  className="bg-[#e03d27] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#c02e1b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  Next <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {subStep === 1 && selection.deviceType && (
        <div className="animate-fade-in-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(BRANDS[selection.deviceType] || []).map((brand) => (
              <button
                key={brand.id}
                onClick={() => onBrandSelect(brand.id)}
                className="flex flex-col items-center justify-center h-32 px-6 py-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-[#e03d27] transition-all duration-300 grayscale hover:grayscale-0"
              >
                {brand.logo ? (
                  <>
                    <img src={getAssetUrl(brand.logo)} alt={brand.label} className="max-h-12 max-w-full object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; const fb = e.currentTarget.parentElement?.querySelector('.brand-fallback'); if (fb) fb.classList.remove('hidden'); }} />
                    <span className="brand-fallback hidden text-xl font-bold">{brand.label}</span>
                  </>
                ) : (
                  <span className="text-xl font-bold">{brand.label}</span>
                )}
              </button>
            ))}
            <button
              onClick={() => setShowCustomInput((p) => ({ ...p, brand: !p.brand }))}
              className={`flex flex-col items-center justify-center h-32 px-6 py-4 bg-white border-2 border-dashed ${showCustomInput.brand ? 'border-[#e03d27] bg-red-50' : 'border-gray-300'} rounded-xl hover:border-[#e03d27] hover:bg-red-50 transition-all duration-300 group`}
            >
              <b className="text-4xl font-light text-gray-300 group-hover:text-[#e03d27] transition-colors">+</b>
              <span className="text-xs font-bold tracking-widest text-gray-400 group-hover:text-[#e03d27] transition-colors mt-1">OTHER</span>
            </button>
          </div>
          {showCustomInput.brand && (
            <div className="mt-8 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Enter brand name"
                  value={customInputValues.brand}
                  onChange={(e) => setCustomInputValues((p) => ({ ...p, brand: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter' && customInputValues.brand.trim()) onCustomBrandSubmit(); }}
                  className="flex-1 p-4 border border-gray-300 rounded-xl focus:border-[#e03d27] focus:ring-0 outline-none transition-colors"
                />
                <button
                  onClick={onCustomBrandSubmit}
                  disabled={!customInputValues.brand.trim()}
                  className="bg-[#e03d27] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#c02e1b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  Next <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {subStep === 2 && (
        <div className="animate-fade-in-up space-y-8">
          {!showOnlyOtherModel && (
            <>
              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 relative">
                <div className="flex items-center mb-4 text-sm font-medium text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-[#e03d27] mr-2"></div>
                  Type in your <span className="font-bold mx-1">brand, model</span> or <span className="font-bold ml-1">model code</span>.
                </div>
                <div className="relative">
                  <input type="text" placeholder="e.g. iPhone 12 Pro Max" value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-6 pr-14 py-4 rounded-xl border-2 border-gray-200 focus:border-[#e03d27] focus:ring-0 text-lg transition-colors outline-none" />
                  <button className="absolute right-3 top-3 p-2 bg-[#f0f0f0] rounded-lg text-[#e03d27] hover:bg-[#e03d27] hover:text-white transition-colors">
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {visibleModels.map((model) => (
                  <button key={model.id} onClick={() => onModelSelect(model)}
                    className="group flex flex-col items-center p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-xl hover:border-gray-300 transition-all duration-300 relative text-center">
                    <div className="w-full aspect-[4/5] bg-gray-50 rounded-xl mb-4 flex items-center justify-center relative">
                      <Smartphone className="w-16 h-16 text-gray-300 group-hover:scale-110 transition-transform duration-500" strokeWidth={1} />
                    </div>
                    <h4 className="font-bold text-gray-800 group-hover:text-[#e03d27] transition-colors">{model.label}</h4>
                  </button>
                ))}
                <button onClick={() => setShowCustomInput((p) => ({ ...p, model: !p.model }))}
                  className={`group flex flex-col items-center p-4 bg-white border-2 border-dashed ${showCustomInput.model ? 'border-[#e03d27] bg-red-50' : 'border-gray-300'} rounded-2xl hover:border-[#e03d27] hover:bg-red-50 transition-all duration-300 relative text-center min-h-[160px] justify-center`}>
                  <b className={`text-4xl font-light text-gray-300 group-hover:text-[#e03d27] transition-colors ${showCustomInput.model ? 'text-[#e03d27]' : ''}`}>+</b>
                  <h4 className={`font-bold text-gray-500 group-hover:text-[#e03d27] transition-colors text-xs tracking-widest mt-2 ${showCustomInput.model ? 'text-[#e03d27]' : ''}`}>OTHER MODEL</h4>
                </button>
              </div>
            </>
          )}
          {showOnlyOtherModel && (
            <div className="space-y-6">
              <div className="flex items-center mb-4 text-sm font-medium text-gray-700">
                <div className="w-2 h-2 rounded-full bg-[#e03d27] mr-2"></div>
                Enter your <span className="font-bold mx-1">{selection.brand}</span> model.
              </div>
              <button onClick={() => setShowCustomInput((p) => ({ ...p, model: !p.model }))}
                className={`group flex flex-col items-center p-8 bg-white border-2 border-dashed ${showCustomInput.model ? 'border-[#e03d27] bg-red-50' : 'border-gray-300'} rounded-2xl hover:border-[#e03d27] hover:bg-red-50 transition-all duration-300 relative text-center min-h-[160px] justify-center w-full max-w-md mx-auto`}>
                <b className={`text-4xl font-light text-gray-300 group-hover:text-[#e03d27] transition-colors ${showCustomInput.model ? 'text-[#e03d27]' : ''}`}>+</b>
                <h4 className={`font-bold text-gray-500 group-hover:text-[#e03d27] transition-colors text-xs tracking-widest mt-2 ${showCustomInput.model ? 'text-[#e03d27]' : ''}`}>OTHER MODEL</h4>
              </button>
            </div>
          )}
          {(showCustomInput.model || showOnlyOtherModel) && (
            <div className="mt-8 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row gap-4">
                <input type="text" placeholder="Enter specific model" value={customInputValues.model}
                  onChange={(e) => setCustomInputValues((p) => ({ ...p, model: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter' && customInputValues.model.trim()) onCustomModelSubmit(); }}
                  className="flex-1 p-4 border border-gray-300 rounded-xl focus:border-[#e03d27] focus:ring-0 outline-none transition-colors" />
                <button onClick={onCustomModelSubmit} disabled={!customInputValues.model.trim()}
                  className="bg-[#e03d27] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#c02e1b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                  Next <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
