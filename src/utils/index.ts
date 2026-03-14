const deg2rad = (deg: number) => deg * (Math.PI / 180);

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 3958.8;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const formatUSPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 1) return digits.length === 1 ? '+1 ' : '';

  let formatted = '+1 ';
  const mainDigits = digits.startsWith('1') ? digits.slice(1) : digits;

  if (mainDigits.length > 0) formatted += '(' + mainDigits.slice(0, 3);
  if (mainDigits.length >= 3) formatted += ') ';
  if (mainDigits.length > 3) formatted += mainDigits.slice(3, 6);
  if (mainDigits.length >= 6) formatted += '-';
  if (mainDigits.length > 6) formatted += mainDigits.slice(6, 10);

  return formatted;
};

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const getAssetUrl = (url: string): string => {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = (typeof window !== 'undefined' && (window as unknown as { CELLTECH_BOOKING_URL?: string }).CELLTECH_BOOKING_URL) || '';
  const path = url.startsWith('/') ? url.slice(1) : url;
  return base ? `${base.replace(/\/$/, '')}/${path}` : `/${path}`;
};

export const isValidUSPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 11 || (digits.length === 10 && !phone.startsWith('+1'));
};
