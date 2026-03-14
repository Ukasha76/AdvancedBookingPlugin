import { useState, useCallback } from 'react';
import { MODELS } from '../data';
import { KNOWN_BRANDS, DEVICE_TYPES_WITHOUT_MODEL_LIST } from '../constants';
import type { DeviceType, Model, Selection } from '../types';

export interface UseBookingFlowState {
  currentStep: number;
  subStep: number;
  selection: Selection;
  searchQuery: string;
  showCustomInput: {
    device: boolean;
    brand: boolean;
    model: boolean;
    repair: boolean;
  };
  customInputValues: {
    device: string;
    brand: string;
    model: string;
    repair: string;
  };
}

export interface UseBookingFlowReturn extends UseBookingFlowState {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setShowCustomInput: React.Dispatch<
    React.SetStateAction<{
      device: boolean;
      brand: boolean;
      model: boolean;
      repair: boolean;
    }>
  >;
  setCustomInputValues: React.Dispatch<
    React.SetStateAction<{
      device: string;
      brand: string;
      model: string;
      repair: string;
    }>
  >;
  handleDeviceSelect: (id: DeviceType) => void;
  handleBrandSelect: (id: string) => void;
  handleModelSelect: (model: Model) => void;
  handleRepairSelect: (id: string) => void;
  handleCustomDeviceSubmit: () => void;
  handleCustomBrandSubmit: () => void;
  handleCustomModelSubmit: () => void;
  handleCustomRepairSubmit: () => void;
  goBack: () => void;
  isCustomBrand: boolean;
  showOnlyOtherModel: boolean;
  getVisibleModels: (query: string) => Model[];
}

const initialSelection: Selection = {
  deviceType: null,
  brand: null,
  model: null,
  repair: null,
};

const initialShowCustomInput = {
  device: false,
  brand: false,
  model: false,
  repair: false,
};

const initialCustomInputValues = {
  device: '',
  brand: '',
  model: '',
  repair: '',
};

export function useBookingFlow(): UseBookingFlowReturn {
  const [currentStep, setCurrentStep] = useState(1);
  const [subStep, setSubStep] = useState(0);
  const [selection, setSelection] = useState<Selection>(initialSelection);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(initialShowCustomInput);
  const [customInputValues, setCustomInputValues] = useState(initialCustomInputValues);

  const handleDeviceSelect = useCallback((id: DeviceType) => {
    setSelection((prev) => ({ ...prev, deviceType: id }));
    setSubStep(1);
    setShowCustomInput((prev) => ({ ...prev, device: false }));
  }, []);

  const handleCustomDeviceSubmit = useCallback(() => {
    if (customInputValues.device.trim()) {
      setSelection((prev) => ({ ...prev, deviceType: customInputValues.device }));
      setSubStep(1);
    }
  }, [customInputValues.device]);

  const handleBrandSelect = useCallback((id: string) => {
    const deviceType = selection.deviceType || 'smartphone';
    const isTypeWithNoModelList = DEVICE_TYPES_WITHOUT_MODEL_LIST.includes(deviceType);
    setSelection((prev) => ({ ...prev, brand: id }));
    setSubStep(2);
    setShowCustomInput((prev) => ({
      ...prev,
      brand: false,
      model: isTypeWithNoModelList ? true : false,
    }));
  }, [selection.deviceType]);

  const handleCustomBrandSubmit = useCallback(() => {
    if (customInputValues.brand.trim()) {
      setSelection((prev) => ({ ...prev, brand: customInputValues.brand }));
      setShowCustomInput((prev) => ({ ...prev, model: true }));
      setSubStep(2);
    }
  }, [customInputValues.brand]);

  const handleModelSelect = useCallback((model: Model) => {
    setSelection((prev) => ({ ...prev, model }));
    setCurrentStep(2);
  }, []);

  const handleCustomModelSubmit = useCallback(() => {
    if (customInputValues.model.trim()) {
      setSelection((prev) => ({
        ...prev,
        model: { id: customInputValues.model, label: customInputValues.model },
      }));
      setCurrentStep(2);
    }
  }, [customInputValues.model]);

  const handleRepairSelect = useCallback((id: string) => {
    setSelection((prev) => ({ ...prev, repair: id }));
    setCurrentStep(3);
  }, []);

  const handleCustomRepairSubmit = useCallback(() => {
    if (customInputValues.repair.trim()) {
      setSelection((prev) => ({ ...prev, repair: customInputValues.repair }));
      setCurrentStep(3);
    }
  }, [customInputValues.repair]);

  const goBack = useCallback(() => {
    setSubStep((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const isCustomBrand = selection.brand
    ? selection.deviceType === 'tablet'
      ? !(KNOWN_BRANDS.tablet || []).includes(selection.brand)
      : selection.deviceType === 'ipad'
        ? !(KNOWN_BRANDS.ipad || []).includes(selection.brand)
        : !(KNOWN_BRANDS.smartphone || []).includes(selection.brand)
    : false;

  const showOnlyOtherModel =
    isCustomBrand ||
    (selection.deviceType ? DEVICE_TYPES_WITHOUT_MODEL_LIST.includes(selection.deviceType) : false);

  const getVisibleModels = useCallback(
    (query: string): Model[] => {
      const deviceType = selection.deviceType || 'smartphone';
      const modelKey =
        deviceType === 'tablet'
          ? `${selection.brand}-tablet`
          : deviceType === 'ipad'
            ? `${selection.brand}-ipad`
            : selection.brand || '';
      const brandModels =
        MODELS[modelKey] || MODELS[selection.brand || ''] || MODELS['default'] || [];
      if (!query.trim()) return brandModels;
      return brandModels.filter((m) =>
        m.label.toLowerCase().includes(query.toLowerCase())
      );
    },
    [selection.deviceType, selection.brand]
  );

  return {
    currentStep,
    subStep,
    selection,
    searchQuery,
    showCustomInput,
    customInputValues,
    setCurrentStep,
    setSearchQuery,
    setShowCustomInput,
    setCustomInputValues,
    handleDeviceSelect,
    handleBrandSelect,
    handleModelSelect,
    handleRepairSelect,
    handleCustomDeviceSubmit,
    handleCustomBrandSubmit,
    handleCustomModelSubmit,
    handleCustomRepairSubmit,
    goBack,
    isCustomBrand,
    showOnlyOtherModel,
    getVisibleModels,
  };
}
