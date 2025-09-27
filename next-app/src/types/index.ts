// types/index.ts
export interface Event {
  id: number;
  name: string;
  artist: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  image: string;
  price: number;
  category: EventCategory;
  capacity: number;
  sold: number;
  rarity: EventRarity;
  chainFee: number;
  description: string;
  highlights: string[];
  gallery: string[];
}

export type EventCategory = 'Music' | 'Conference' | 'Art' | 'Sports' | 'Gaming';

export type EventRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Ultra Rare';

export interface AvailabilityStatus {
  status: string;
  color: string;
}

export interface MintingState {
  isLoading: boolean;
  selectedEventId: number | null;
}

export interface CategoryItem {
  name: EventCategory;
  image: string;
  icon: string;
}
