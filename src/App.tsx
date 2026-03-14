import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowRight,
  MapPin,
  Store,
  CheckCircle2,
} from 'lucide-react';

import { useBookingFlow } from './hooks/useBookingFlow';
import { ProgressStepper } from './components/ProgressStepper';
import { DeviceStep } from './components/DeviceStep';
import { RepairStep } from './components/RepairStep';
import { LOCATIONS, REPAIRS } from './data';
import { calculateDistance } from './utils';
import { formatUSPhoneNumber, isValidEmail, isValidUSPhone } from './utils';

function App() {
  const flow = useBookingFlow();

  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(LOCATIONS[0].id);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    notes: '',
    type: 'private' as 'private' | 'business',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sortedLocations, setSortedLocations] = useState(LOCATIONS);
  const [isLocating, setIsLocating] = useState(false);
  const [isDistanceSorted, setIsDistanceSorted] = useState(false);

  useEffect(() => {
    setSelectedTime(null);
  }, [selectedLocationId, selectedDate]);

  const getProgress = useCallback(() => {
    if (flow.currentStep > 1) return 100;
    if (flow.subStep === 0) return 0;
    if (flow.subStep === 1) return 50;
    if (flow.subStep === 2) return 80;
    return 100;
  }, [flow.currentStep, flow.subStep]);

  const sortLocationsByCoords = useCallback((lat: number, lng: number) => {
    const locationsWithDistance = LOCATIONS.map((loc) => {
      if (loc.lat != null && loc.lng != null) {
        const dist = calculateDistance(lat, lng, loc.lat, loc.lng);
        return { ...loc, distance: `${dist.toFixed(1)} miles`, distanceValue: dist };
      }
      return { ...loc, distanceValue: Infinity };
    }).sort((a, b) => (a.distanceValue ?? 0) - (b.distanceValue ?? 0));
    setSortedLocations(locationsWithDistance);
    setSelectedLocationId(locationsWithDistance[0].id);
    setIsDistanceSorted(true);
  }, []);

  const handleGeoLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        sortLocationsByCoords(pos.coords.latitude, pos.coords.longitude);
        setIsLocating(false);
      },
      (err) => {
        console.error('Error getting location:', err);
        alert('Unable to retrieve your location. Please check your browser permissions.');
        setIsLocating(false);
      }
    );
  }, [sortLocationsByCoords]);

  const handleAddressSearch = useCallback(
    async (query: string) => {
    const q = query.trim();
    if (!q) return;
    setIsLocating(true);
    try {
      const isZip = /^\d{5}$/.test(q);
        const url = isZip
          ? `https://nominatim.openstreetmap.org/search?format=json&postalcode=${q}&countrycodes=us&limit=1`
          : `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              q.toLowerCase().includes('texas') || q.toLowerCase().includes('tx') ? q : `${q}, Texas, USA`
            )}&limit=1`;
        const res = await fetch(url);
        const data = await res.json();
        if (data?.[0]) {
          sortLocationsByCoords(parseFloat(data[0].lat), parseFloat(data[0].lon));
      } else if (!isZip) {
          const fallback = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`
          );
          const fallbackData = await fallback.json();
          if (fallbackData?.[0]) {
          sortLocationsByCoords(parseFloat(fallbackData[0].lat), parseFloat(fallbackData[0].lon));
        }
      }
      } catch (err) {
        console.error('Geocoding error:', err);
    } finally {
      setIsLocating(false);
    }
    },
    [sortLocationsByCoords]
  );

  const getAjaxUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('ajax_url') || '';
  }, []);

  const handleConfirmBooking = useCallback(async () => {
    const errors: string[] = [];
    if (!selectedLocationId) errors.push('Please select a location');
    if (!selectedDate) errors.push('Please select a date');
    if (!selectedTime) errors.push('Please select a time');
    if (!userDetails.firstName?.trim()) errors.push('First name is required');
    if (!userDetails.lastName?.trim()) errors.push('Last name is required');
    if (!userDetails.phone?.trim()) errors.push('Phone number is required');
    else if (!isValidUSPhone(userDetails.phone)) errors.push('Please enter a valid US phone number');
    if (!userDetails.email?.trim()) errors.push('Email is required');
    else if (!isValidEmail(userDetails.email)) errors.push('Please enter a valid email address');
    if (!acceptedTerms) errors.push('Please accept the terms & conditions');

    if (errors.length > 0) {
      setToast({ message: errors.join('\n'), type: 'error' });
      setTimeout(() => setToast(null), 5000);
      return;
    }

    const loc = LOCATIONS.find((l) => l.id === selectedLocationId);
    const repairTitle = REPAIRS.find((r) => r.id === flow.selection.repair)?.title || flow.customInputValues.repair;
    const formattedDate = selectedDate
      ? (() => {
          const [y, m, d] = selectedDate.split('-').map(Number);
          return new Date(y, m - 1, d).toLocaleDateString('en-US', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
          });
        })()
      : '';

    const ajaxUrl = getAjaxUrl();
    if (ajaxUrl) {
      setIsSubmitting(true);
      try {
        const payload = new URLSearchParams();
        payload.append('action', 'celltech_booking_submit');
        payload.append('firstName', userDetails.firstName.trim());
        payload.append('lastName', userDetails.lastName.trim());
        payload.append('email', userDetails.email.trim());
        payload.append('phone', userDetails.phone.trim());
        payload.append('notes', userDetails.notes.trim());
        payload.append('device', flow.selection.deviceType || '');
        payload.append('brand', flow.selection.brand || '');
        payload.append('model', flow.selection.model?.label || flow.customInputValues.model || '');
        payload.append('repair', repairTitle);
        payload.append('location', loc?.name || '');
        payload.append('date', formattedDate);
        payload.append('time', selectedTime || '');

        const res = await fetch(ajaxUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: payload,
        });
        const data = await res.json();

        if (data.success) {
          setSubmitted(true);
        } else {
          setToast({
            message: data.data?.message || 'Failed to submit. Please try again.',
            type: 'error',
          });
          setTimeout(() => setToast(null), 5000);
        }
      } catch (err) {
        console.error('Booking submit error:', err);
        setToast({
          message: 'Failed to submit. Please try again or contact us directly.',
          type: 'error',
        });
        setTimeout(() => setToast(null), 5000);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // No WordPress – demo mode
      setSubmitted(true);
    }
  }, [
    flow.selection,
    flow.customInputValues.repair,
    flow.customInputValues.model,
    selectedLocationId,
    selectedDate,
    selectedTime,
    userDetails,
    acceptedTerms,
    getAjaxUrl,
  ]);

  const visibleLocations = useMemo(() => {
    if (isDistanceSorted) return sortedLocations;
    const q = locationSearchQuery.toLowerCase().trim();
    if (!q) return sortedLocations;
    return sortedLocations.filter((loc) => {
      const name = loc.name.toLowerCase();
      const addr = loc.address.toLowerCase();
      if (name.includes(q) || addr.includes(q)) return true;
      if (q === 'texas' && (addr.includes('tx') || addr.includes('texas'))) return true;
      return false;
    });
  }, [sortedLocations, isDistanceSorted, locationSearchQuery]);

  const visibleModels = useMemo(
    () => flow.getVisibleModels(flow.searchQuery),
    [flow.getVisibleModels, flow.searchQuery, flow.selection.deviceType, flow.selection.brand]
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 font-sans text-slate-800 relative">
      {toast && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4 px-6 py-4 bg-red-600 text-white rounded-xl shadow-2xl border border-red-700 animate-fade-in-up"
          role="alert"
        >
          <p className="font-bold text-sm mb-2">Please complete the following:</p>
          <ul className="list-disc list-inside text-sm space-y-1 pr-8">
            {toast.message.split('\n').map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
                    <button
            onClick={() => setToast(null)}
            className="absolute top-2 right-2 text-white/80 hover:text-white text-xl leading-none"
            aria-label="Close"
                    >
            ×
                    </button>
                    </div>
                  )}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        <ProgressStepper currentStep={flow.currentStep} getProgress={getProgress} />

        <div className="flex-1 p-8 sm:p-12">
          {flow.currentStep === 1 && (
            <DeviceStep
              subStep={flow.subStep}
              selection={flow.selection}
              searchQuery={flow.searchQuery}
              showCustomInput={flow.showCustomInput}
              customInputValues={flow.customInputValues}
              showOnlyOtherModel={flow.showOnlyOtherModel}
              visibleModels={visibleModels}
              onBack={flow.goBack}
              onDeviceSelect={flow.handleDeviceSelect}
              onBrandSelect={flow.handleBrandSelect}
              onModelSelect={flow.handleModelSelect}
              onCustomDeviceSubmit={flow.handleCustomDeviceSubmit}
              onCustomBrandSubmit={flow.handleCustomBrandSubmit}
              onCustomModelSubmit={flow.handleCustomModelSubmit}
              setShowCustomInput={flow.setShowCustomInput}
              setCustomInputValues={flow.setCustomInputValues}
              setSearchQuery={flow.setSearchQuery}
            />
          )}

          {flow.currentStep === 2 && (
            <RepairStep
              selection={flow.selection}
              showCustomInput={flow.showCustomInput}
              customInputValues={flow.customInputValues}
              onBack={() => flow.setCurrentStep(1)}
              onRepairSelect={flow.handleRepairSelect}
              onCustomRepairSubmit={flow.handleCustomRepairSubmit}
              setShowCustomInput={flow.setShowCustomInput}
              setCustomInputValues={flow.setCustomInputValues}
            />
          )}

          {flow.currentStep === 3 && (
            <div className="animate-fade-in-up">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking confirmed!</h2>
                  <p className="text-gray-600 mb-6 max-w-md">
                    Thank you, {userDetails.firstName}. We've received your request and will contact you at {userDetails.email} to confirm your appointment.
                  </p>
                  <p className="text-sm text-gray-500">We'll see you there!</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-8 px-8 py-3 bg-[#e03d27] hover:bg-[#c02e1b] text-white font-bold rounded-xl transition-colors"
                  >
                    Book another
                  </button>
                </div>
              ) : (
              <>
              <div className="flex items-center mb-8">
                <button
                  onClick={() => flow.setCurrentStep(2)}
                  className="mr-4 p-2 rounded-full hover:bg-red-50 text-[#e03d27] transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" strokeWidth={3} />
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Finalize booking</h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center">
                        <div className="p-3 bg-red-50 rounded-2xl mr-4">
                          <Store className="w-6 h-6 text-[#e03d27]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">Come by our store</h3>
                          <p className="text-xs text-green-600 font-bold uppercase tracking-wider">
                            Done while you are waiting
                          </p>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full border-2 border-[#e03d27] bg-[#e03d27] flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center border-b border-gray-100 pb-2">
                        <div className="w-2 h-2 rounded-full bg-[#e03d27] mr-2"></div>
                        <span className="text-sm font-bold text-gray-700">Select location</span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={handleGeoLocation}
                          disabled={isLocating}
                          className={`flex items-center justify-center px-4 py-3 rounded-xl font-bold text-sm border border-red-100 transition-all hover:bg-red-100 ${
                            isLocating ? 'bg-gray-100 text-gray-400' : 'bg-red-50 text-[#e03d27]'
                          }`}
                        >
                          <MapPin className={`w-4 h-4 mr-2 ${isLocating ? 'animate-bounce' : ''}`} />
                          {isLocating ? 'Locating...' : 'Current location'}
                        </button>
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder="Search location or enter zip code"
                            value={locationSearchQuery}
                            onChange={(e) => {
                              const val = e.target.value;
                              setLocationSearchQuery(val);
                              if (/^\d{5}$/.test(val.trim())) handleAddressSearch(val.trim());
                              if (!val.trim()) {
                                setIsDistanceSorted(false);
                                setSortedLocations(LOCATIONS);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddressSearch(locationSearchQuery);
                            }}
                            className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:border-[#e03d27] focus:ring-0 outline-none text-sm transition-all"
                          />
                          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <button
                            onClick={() => handleAddressSearch(locationSearchQuery)}
                            disabled={isLocating}
                            className={`absolute right-2 top-1.5 p-2 rounded-lg transition-colors ${
                              isLocating ? 'text-gray-300' : 'text-gray-400 hover:text-[#e03d27] hover:bg-red-50'
                            }`}
                            title="Search nearest location"
                          >
                            <ArrowRight className={`w-4 h-4 ${isLocating ? 'animate-pulse' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {visibleLocations.map((loc) => (
                          <div
                            key={loc.id}
                            onClick={() => setSelectedLocationId(loc.id)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group ${
                              selectedLocationId === loc.id
                                ? 'border-[#e03d27] bg-red-50 ring-2 ring-[#e03d27] ring-offset-2 shadow-[0_0_20px_rgba(224,61,39,0.2)]'
                                : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-bold text-gray-800 text-sm group-hover:text-[#e03d27] transition-colors">
                                  {loc.name}
                                </h4>
                                <p className="text-xs font-bold text-[#e03d27] mt-0.5">{loc.phone}</p>
                              </div>
                              <div className="bg-[#e03d27] text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                                {loc.distance}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed mb-3">
                              {loc.description}, {loc.address}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-[#e03d27] mr-2"></div>
                            <span className="text-sm font-bold text-gray-700">Select date</span>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-1 rounded-full border border-gray-200 hover:bg-gray-50">
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button className="p-1 rounded-full border border-gray-200 hover:bg-gray-50">
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                          {[...Array(14)].map((_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() + i);
                            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                            const dayNum = date.getDate().toString().padStart(2, '0');
                            const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
                            const isSelected = selectedDate === dateStr;
                            return (
                              <button
                                key={i}
                                onClick={() => setSelectedDate(dateStr)}
                                className={`flex flex-col items-center min-w-[64px] py-3 rounded-2xl border-2 transition-all ${
                                  isSelected ? 'border-[#e03d27] bg-red-50' : 'border-gray-100 bg-white hover:border-gray-200'
                                }`}
                              >
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-widest ${
                                    isSelected ? 'text-[#e03d27]' : 'text-gray-400'
                                  }`}
                                >
                                  {dayName}
                                </span>
                                <span className={`text-lg font-bold ${isSelected ? 'text-[#e03d27]' : 'text-gray-700'}`}>
                                  {dayNum}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-[#e03d27] mr-2"></div>
                            <span className="text-sm font-bold text-gray-700">Select time</span>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-1 rounded-full border border-gray-200 hover:bg-gray-50">
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button className="p-1 rounded-full border border-gray-200 hover:bg-gray-50">
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {!selectedDate ? (
                          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center text-sm text-gray-500 italic">
                            Select a date first to see available times
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-3">
                            {(() => {
                              const selectedLoc = LOCATIONS.find((l) => l.id === selectedLocationId);
                              if (!selectedLoc || !selectedDate) return null;
                              const [year, month, day] = selectedDate.split('-').map(Number);
                              const localDate = new Date(year, month - 1, day);
                              const dayOfWeek = localDate.getDay();
                              const dayHours = selectedLoc.hours[dayOfWeek];
                              if (!dayHours)
                                return (
                                  <p className="col-span-3 text-center text-xs text-gray-400">
                                    Closed on this day
                                  </p>
                                );
                              const slots: string[] = [];
                              const now = new Date();
                              const isToday = localDate.toDateString() === now.toDateString();
                              const currentMinutes = now.getHours() * 60 + now.getMinutes();
                              for (let m = dayHours.open; m < dayHours.close; m += 30) {
                                if (isToday && m <= currentMinutes + 30) continue;
                                const hours = Math.floor(m / 60);
                                const mins = m % 60;
                                slots.push(
                                  `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
                                );
                              }
                              if (slots.length === 0)
                                return (
                                  <p className="col-span-3 text-center text-xs text-gray-400">
                                    No slots available for the remainder of today
                                  </p>
                                );
                              return slots.map((timeStr) => (
                                <button
                                  key={timeStr}
                                  onClick={() => setSelectedTime(timeStr)}
                                  className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                                    selectedTime === timeStr
                                      ? 'border-[#e03d27] bg-red-50 text-[#e03d27]'
                                      : 'border-gray-100 bg-white hover:border-gray-200 text-gray-600'
                                  }`}
                                >
                                  {timeStr}
                                </button>
                              ));
                            })()}
                          </div>
                        )}
                        {selectedDate && (
                          <div className="p-4 bg-[#f8fafc] rounded-xl border border-blue-50 text-center">
                            <p className="text-[11px] font-bold text-[#3498db] uppercase tracking-widest">
                              There are no more timeslots available for today
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-white border border-gray-200 rounded-3xl p-6 relative overflow-hidden shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">
                        Repair Summary
                      </h4>
                      <span className="text-gray-400 text-[9px] font-medium uppercase tracking-widest text-right">
                        Come by our store
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex-1 pr-4">
                        <h4 className="text-xl font-bold text-gray-800 leading-tight">
                          {flow.selection.brand} {flow.selection.model?.label}
                        </h4>
                        <p className="text-[#e03d27] font-bold text-xs mt-1 uppercase tracking-wider">
                          {REPAIRS.find((r) => r.id === flow.selection.repair)?.title ||
                            flow.customInputValues.repair}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[#e03d27] font-bold text-[10px] mb-1 uppercase tracking-wider">
                          Appointment on
                        </p>
                        <p className="text-gray-800 font-bold text-sm">
                          {selectedDate
                            ? (() => {
                                const [y, m, d] = selectedDate.split('-').map(Number);
                                return new Date(y, m - 1, d).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  day: '2-digit',
                                  month: '2-digit',
                                });
                              })()
                            : 'Not set'}
                        </p>
                        {selectedTime && (
                          <p className="text-[#e03d27] font-black text-lg -mt-1">{selectedTime}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2 px-1 group-focus-within:text-[#e03d27] transition-colors">
                          First Name *
                        </label>
                        <input
                          type="text"
                          className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:border-[#e03d27] focus:ring-4 focus:ring-red-50 outline-none transition-all font-medium text-gray-800"
                          placeholder="John"
                          value={userDetails.firstName}
                          onChange={(e) =>
                            setUserDetails((p) => ({ ...p, firstName: e.target.value }))
                          }
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2 px-1 group-focus-within:text-[#e03d27] transition-colors">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:border-[#e03d27] focus:ring-4 focus:ring-red-50 outline-none transition-all font-medium text-gray-800"
                          placeholder="Doe"
                          value={userDetails.lastName}
                          onChange={(e) =>
                            setUserDetails((p) => ({ ...p, lastName: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2 px-1 group-focus-within:text-[#e03d27] transition-colors">
                          Phone *
                        </label>
                        <input
                          type="text"
                          className={`w-full px-5 py-4 bg-white border rounded-2xl focus:border-[#e03d27] focus:ring-4 focus:ring-red-50 outline-none transition-all font-medium text-gray-800 ${
                            userDetails.phone && !isValidUSPhone(userDetails.phone)
                              ? 'border-red-300'
                              : 'border-gray-200'
                          }`}
                          placeholder="+1 (000) 000-0000"
                          value={userDetails.phone}
                          onChange={(e) => {
                            const formatted = formatUSPhoneNumber(e.target.value);
                            if (formatted.length <= 17) {
                              setUserDetails((p) => ({ ...p, phone: formatted }));
                            }
                          }}
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2 px-1 group-focus-within:text-[#e03d27] transition-colors">
                          Email *
                        </label>
                        <input
                          type="email"
                          className={`w-full px-5 py-4 bg-white border rounded-2xl focus:border-[#e03d27] focus:ring-4 focus:ring-red-50 outline-none transition-all font-medium text-gray-800 ${
                            userDetails.email && !isValidEmail(userDetails.email)
                              ? 'border-red-300'
                              : 'border-gray-200'
                          }`}
                          placeholder="john@example.com"
                          value={userDetails.email}
                          onChange={(e) =>
                            setUserDetails((p) => ({ ...p, email: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-2 px-1 group-focus-within:text-[#e03d27] transition-colors">
                        Notes
                      </label>
                      <textarea
                        className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:border-[#e03d27] focus:ring-4 focus:ring-red-50 outline-none transition-all font-medium text-gray-800 min-h-[120px]"
                        placeholder="Any additional information..."
                        value={userDetails.notes}
                        onChange={(e) =>
                          setUserDetails((p) => ({ ...p, notes: e.target.value }))
                        }
                      />
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-red-50/30 rounded-2xl border border-red-50/50">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-[#e03d27] focus:ring-[#e03d27]"
                      />
                      <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed font-medium">
                        I accept the{' '}
                        <a href="#" className="text-[#e03d27] font-bold underline">
                          terms & conditions
                        </a>{' '}
                        and I have read the privacy policy regarding the collection and use of my
                        personal data.
                      </label>
                    </div>
                    <button
                      onClick={handleConfirmBooking}
                      disabled={isSubmitting}
                      className="w-full group bg-[#e03d27] hover:bg-[#c02e1b] disabled:opacity-70 disabled:cursor-not-allowed text-white py-5 rounded-[16px] font-black text-lg tracking-[2px] uppercase shadow-xl hover:shadow-red-200/50 transition-all flex items-center justify-center relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center">
                        {isSubmitting ? 'Sending...' : 'Confirm Booking'}
                        {!isSubmitting && <ChevronRight className="ml-2 w-6 h-6 transform group-hover:translate-x-1 transition-transform" />}
                      </span>
                      <div className="absolute top-0 right-0 h-full w-12 bg-white/10 skew-x-[30deg] translate-x-12 group-hover:translate-x-[-400%] transition-all duration-700"></div>
                    </button>
                    <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 hover:text-gray-600 transition-colors cursor-pointer">
                      You can cancel anytime
                    </p>
                  </div>
                </div>
              </div>
              </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
