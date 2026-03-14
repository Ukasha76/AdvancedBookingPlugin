interface ProgressStepperProps {
  currentStep: number;
  getProgress: () => number;
}

export function ProgressStepper({ currentStep, getProgress }: ProgressStepperProps) {
  return (
    <div className="pt-10 pb-2 px-10 border-b border-gray-100">
      <div className="flex items-center justify-center w-full max-w-lg mx-auto">
        <div className="flex flex-col items-center relative z-10">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300 ${
              currentStep >= 1 ? 'bg-[#e03d27] border-[#e03d27] text-white' : 'bg-white border-gray-300 text-gray-400'
            }`}
          >
            1
          </div>
          <span
            className={`absolute -bottom-6 w-32 text-center text-xs font-semibold ${
              currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            Select device
          </span>
        </div>

        <div className="flex-1 h-1.5 bg-gray-200 mx-2 rounded-full relative overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-[#e03d27] transition-all duration-500 ease-out"
            style={{ width: `${getProgress()}%` }}
          />
        </div>

        <div className="flex flex-col items-center relative z-10">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300 ${
              currentStep >= 2 ? 'bg-[#e03d27] border-[#e03d27] text-white' : 'bg-white border-gray-300 text-gray-400'
            }`}
          >
            2
          </div>
          <span
            className={`absolute -bottom-6 w-32 text-center text-xs font-semibold ${
              currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            Select repair
          </span>
        </div>

        <div className="flex-1 h-1.5 bg-gray-200 mx-2 rounded-full relative overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-[#e03d27] transition-all duration-500 ease-out"
            style={{ width: currentStep > 2 ? '100%' : '0%' }}
          />
        </div>

        <div className="flex flex-col items-center relative z-10">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300 ${
              currentStep >= 3 ? 'bg-[#e03d27] border-[#e03d27] text-white' : 'bg-white border-gray-300 text-gray-400'
            }`}
          >
            3
          </div>
          <span
            className={`absolute -bottom-6 w-32 text-center text-xs font-semibold ${
              currentStep >= 3 ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            Finalize order
          </span>
        </div>
      </div>
    </div>
  );
}
