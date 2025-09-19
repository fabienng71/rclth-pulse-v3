import { ChannelInfo } from '@/types/leadCenter';

// Channel mapping based on the user's channel table
export const CHANNEL_MAPPING: Record<string, ChannelInfo> = {
  'HTL-FIV': {
    code: 'HTL-FIV',
    name: 'Hotel - Five Star',
    description: 'Premium hotels requiring high-end ingredients',
    category: 'hotel'
  },
  'HTL-FOR': {
    code: 'HTL-FOR',
    name: 'Hotel - Four Star', 
    description: 'Mid-range hotels with quality ingredient needs',
    category: 'hotel'
  },
  'HTL-LES': {
    code: 'HTL-LES',
    name: 'Hotel - Three Star or Less',
    description: 'Budget hotels with basic ingredient requirements',
    category: 'hotel'
  },
  'RES-FRA': {
    code: 'RES-FRA',
    name: 'Restaurant - French',
    description: 'French restaurants requiring premium ingredients',
    category: 'restaurant'
  },
  'RES-ITA': {
    code: 'RES-ITA',
    name: 'Restaurant - Italian',
    description: 'Italian restaurants focusing on authentic ingredients',
    category: 'restaurant'
  },
  'RES-JPN': {
    code: 'RES-JPN',
    name: 'Restaurant - Japanese',
    description: 'Japanese restaurants with specialized ingredient needs',
    category: 'restaurant'
  },
  'RES-SHO': {
    code: 'RES-SHO',
    name: 'Restaurant - Steak House',
    description: 'Steak houses needing meat-related ingredients',
    category: 'restaurant'
  },
  'RET-BPA': {
    code: 'RET-BPA',
    name: 'Retail - Bakery/Pastry',
    description: 'Bakeries and pastry shops requiring baking ingredients',
    category: 'retail'
  },
  'RET-ICE': {
    code: 'RET-ICE',
    name: 'Retail - Ice Cream',
    description: 'Ice cream shops needing dairy and flavor ingredients',
    category: 'retail'
  },
  'RET-SMK': {
    code: 'RET-SMK',
    name: 'Retail - Supermarket',
    description: 'Supermarkets with bulk ingredient requirements',
    category: 'retail'
  },
  'OTH-BPC': {
    code: 'OTH-BPC',
    name: 'Other - Beverage/Coffee',
    description: 'Coffee shops and beverage companies',
    category: 'other'
  },
  'OTH-DST': {
    code: 'OTH-DST',
    name: 'Other - Distributor',
    description: 'Food ingredient distributors',
    category: 'other'
  },
  'OTH-IND': {
    code: 'OTH-IND',
    name: 'Other - Industrial',
    description: 'Industrial food manufacturers',
    category: 'other'
  },
  'OTH-CAE': {
    code: 'OTH-CAE',
    name: 'Other - Catering',
    description: 'Catering companies with bulk needs',
    category: 'other'
  }
};

// Get channel info by code
export const getChannelInfo = (code: string): ChannelInfo | null => {
  return CHANNEL_MAPPING[code] || null;
};

// Get channel badge color by category
export const getChannelBadgeColor = (category: string): string => {
  switch (category) {
    case 'hotel': return 'bg-blue-100 text-blue-800';
    case 'restaurant': return 'bg-green-100 text-green-800';
    case 'retail': return 'bg-purple-100 text-purple-800';
    case 'other': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Get compatibility color
export const getCompatibilityColor = (level: 'high' | 'medium' | 'low'): string => {
  switch (level) {
    case 'high': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Food ingredients sales stages
export const FOOD_INGREDIENTS_SALES_STAGES = [
  { value: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-800' },
  { value: 'meeting_scheduled', label: 'Meeting Scheduled', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'samples_sent', label: 'Samples Sent', color: 'bg-purple-100 text-purple-800' },
  { value: 'samples_followed_up', label: 'Samples Follow-up', color: 'bg-pink-100 text-pink-800' },
  { value: 'negotiating', label: 'Negotiating', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'closed_won', label: 'Closed Won', color: 'bg-green-100 text-green-800' },
  { value: 'closed_lost', label: 'Closed Lost', color: 'bg-red-100 text-red-800' }
];

// Get sales stage info
export const getSalesStageInfo = (stage: string) => {
  return FOOD_INGREDIENTS_SALES_STAGES.find(s => s.value === stage) || 
         { value: stage, label: stage, color: 'bg-gray-100 text-gray-800' };
};