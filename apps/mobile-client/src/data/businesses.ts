import { BusinessItem } from '../types/superApp';

export const mockBusinessesData: BusinessItem[] = [
  {
    id: 'biz-cafetruck',
    name: 'CafeTruck Central',
    categoryId: 'cat-food',
    description: 'Café de especialidad, panadería y combos para oficina.',
    rating: 4.8,
    etaMinutes: 25,
    distanceKm: 1.6,
    bannerUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200',
    products: [
      { id: 'prod-latte', businessId: 'biz-cafetruck', name: 'Latte Vainilla', price: 4.5, available: true },
      { id: 'prod-croissant', businessId: 'biz-cafetruck', name: 'Croissant mantequilla', price: 3.2, available: true },
      { id: 'prod-combo', businessId: 'biz-cafetruck', name: 'Combo desayuno', price: 8.9, available: true },
    ],
  },
  {
    id: 'biz-green',
    name: 'Green Bowl',
    categoryId: 'cat-services',
    description: 'Bowls, jugos y opciones saludables.',
    rating: 4.6,
    etaMinutes: 30,
    distanceKm: 2.1,
    bannerUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200',
    products: [
      { id: 'prod-bowl', businessId: 'biz-green', name: 'Bowl Mediterráneo', price: 9.5, available: true },
      { id: 'prod-jugo', businessId: 'biz-green', name: 'Jugo verde', price: 3.8, available: true },
    ],
  },
];
