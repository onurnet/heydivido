// data/dummyData.ts - Example dummy data
export const dummyUser: User = {
  name: 'Onur',
  gezginNo: '#GZ847291',
  location: 'Istanbul, TR'
};

export const dummySummary: UserSummary = {
  totalExpenses: 2847.5,
  pendingReceivables: 485.25,
  currency: 'TRY'
};

export const dummyEvents: Event[] = [
  {
    id: '1',
    name: 'Cappadocia Adventure',
    location: 'Nevşehir, Turkey',
    participantCount: 4,
    icon: 'fas fa-mountain',
    currency: 'TRY'
  },
  {
    id: '2',
    name: 'Weekend Dinner',
    location: 'Istanbul, Turkey',
    participantCount: 6,
    icon: 'fas fa-utensils',
    currency: 'TRY'
  },
  {
    id: '3',
    name: 'Paris Trip',
    location: 'Paris, France',
    participantCount: 3,
    icon: 'fas fa-plane',
    currency: 'EUR'
  }
];

export const dummyExpenses: Expense[] = [
  {
    id: '1',
    description: 'Hot Air Balloon Tour',
    eventName: 'Cappadocia Adventure',
    amount: 850.0,
    currency: 'TRY',
    place: 'Royal Balloon',
    date: 'June 8, 2025',
    category: 'entertainment'
  },
  {
    id: '2',
    description: 'Hotel Accommodation',
    eventName: 'Cappadocia Adventure',
    amount: 480.0,
    currency: 'TRY',
    place: 'Cave Hotel Deluxe',
    date: 'June 7, 2025',
    category: 'accommodation'
  },
  {
    id: '3',
    description: 'Traditional Dinner',
    eventName: 'Weekend Dinner',
    amount: 290.5,
    currency: 'TRY',
    place: 'Nusr-Et Steakhouse',
    date: 'June 5, 2025',
    category: 'food'
  },
  {
    id: '4',
    description: 'Taxi to Airport',
    eventName: 'Paris Trip',
    amount: 45.2,
    currency: 'EUR',
    place: 'Charles de Gaulle',
    date: 'June 3, 2025',
    category: 'transport'
  },
  {
    id: '5',
    description: 'Museum Tickets',
    eventName: 'Paris Trip',
    amount: 51.0,
    currency: 'EUR',
    place: 'Louvre Museum',
    date: 'June 2, 2025',
    category: 'entertainment'
  }
];
