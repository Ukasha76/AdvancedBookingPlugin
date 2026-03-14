import React from 'react';
import { ChevronLeft, ArrowRight, HelpCircle } from 'lucide-react';
import { REPAIRS } from '../data';
import type { Selection } from '../types';

interface RepairStepProps {
  selection: Selection;
  showCustomInput: { repair: boolean };
  customInputValues: { repair: string };
  onBack: () => void;
  onRepairSelect: (id: string) => void;
  onCustomRepairSubmit: () => void;
  setShowCustomInput: React.Dispatch<
    React.SetStateAction<{ device: boolean; brand: boolean; model: boolean; repair: boolean }>
  >;
  setCustomInputValues: React.Dispatch<
    React.SetStateAction<{ device: string; brand: string; model: string; repair: string }>
  >;
}

export function RepairStep({
  selection,
  showCustomInput,
  customInputValues,
  onBack,
  onRepairSelect,
  onCustomRepairSubmit,
  setShowCustomInput,
  setCustomInputValues,
}: RepairStepProps) {
  return (
    <div className="animate-fade-in-up space-y-10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 rounded-full hover:bg-red-50 text-[#e03d27] transition-colors"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={3} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-[#e03d27] pl-4">
            What's wrong with your {selection.model?.label || 'device'}?
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REPAIRS.map((repair) => (
          <button
            key={repair.id}
            onClick={() => onRepairSelect(repair.id)}
            className="flex flex-col p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-[#e03d27] transition-all duration-300 group text-left relative"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-red-50 transition-colors">
                {repair.icon}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#e03d27] transition-colors">
                  {repair.title}
                </h3>
                <span className="text-[10px] font-bold text-[#3498db] tracking-widest uppercase">
                  {repair.duration}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed pr-4">{repair.description}</p>
          </button>
        ))}

        <button
          onClick={() => setShowCustomInput((prev) => ({ ...prev, repair: !prev.repair }))}
          className={`flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed ${
            showCustomInput.repair ? 'border-[#e03d27] bg-red-50' : 'border-gray-300'
          } rounded-2xl hover:border-[#e03d27] hover:bg-red-50 transition-all duration-300 group`}
        >
          <b className="text-5xl font-light text-gray-300 group-hover:text-[#e03d27]">+</b>
          <h4 className="font-bold text-gray-500 group-hover:text-[#e03d27] text-sm tracking-widest uppercase mt-2">
            OTHER ISSUE
          </h4>
        </button>
      </div>

      {showCustomInput.repair && (
        <div className="mt-8 animate-fade-in-up">
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-[#e03d27]" />
              Tell us more about the issue
            </h3>
            <textarea
              placeholder="Please describe the repair you need..."
              value={customInputValues.repair}
              onChange={(e) => setCustomInputValues((prev) => ({ ...prev, repair: e.target.value }))}
              className="w-full p-4 border border-gray-300 rounded-xl focus:border-[#e03d27] focus:ring-0 outline-none transition-colors min-h-[120px] bg-white text-gray-700"
            />
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={onCustomRepairSubmit}
              disabled={!customInputValues.repair.trim()}
              className="bg-red-500 text-white px-12 py-4 rounded-[16px] font-bold hover:bg-red-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center text-lg tracking-widest uppercase"
            >
              NEXT <ArrowRight className="ml-2 w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
