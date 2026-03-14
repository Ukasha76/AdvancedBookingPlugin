import type React from 'react';

export type DeviceType = 'smartphone' | 'tablet' | 'ipad' | 'watch' | 'desktop' | 'laptop';

export interface DeviceCategory {
  id: DeviceType;
  label: string;
  icon: React.ReactNode;
}

export interface Brand {
  id: string;
  label: string;
  logo: string;
}

export interface Model {
  id: string;
  label: string;
  image?: string;
}

export interface Repair {
  id: string;
  title: string;
  duration: string;
  description: string;
  icon: React.ReactNode;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  link: string;
  distance: string;
  image?: string;
  lat?: number;
  lng?: number;
  distanceValue?: number;
  hours: Record<number, { open: number; close: number }>;
}

export interface Selection {
  deviceType: DeviceType | string | null;
  brand: string | null;
  model: Model | null;
  repair: string | null;
}
