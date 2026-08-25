export interface VehicleSpecs {
  seats?: number | string;
  transmission?: string;
  fuel?: string;
  airConditioning?: boolean | string;
  luggage?: number | string;
  drivetrain?: string;
}

export interface Vehicle {
  id: string;
  index: string; // e.g. "01", "02", "03"
  name: string;
  category: string;
  tagline?: string;
  description?: string;
  image: string;
  specs?: VehicleSpecs;
  price?: {
    amount?: number | string;
    period?: string;
  };
  isDemoAsset?: boolean; // Flag identifying visual development placeholders
}
