export type AudienceType = 'student' | 'school' | 'corporate';

export type ServiceType = 'latex' | 'ppt' | 'word';

export interface ServiceDetail {
  id: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  basePrice: number;
  unitName: string; // e.g. "page", "slide", "milestone"
  pricePerUnit: number;
  features: string[];
  deliverables: string[];
  estimatedDays: number;
}

export interface OrderAttachment {
  name: string;
  size: string;
  type: string;
}

export type OrderStatus = 'pending_payment' | 'received' | 'in_progress' | 'review' | 'completed';

export interface Order {
  id: string; // e.g., "TRACK-STU-7493"
  audience: AudienceType;
  serviceType: ServiceType;
  title: string;
  description: string;
  pageCount: number;
  urgency: 'standard' | 'express' | 'rush';
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  deliveryDate: string;
  customerName: string;
  customerEmail: string;
  attachments: OrderAttachment[];
  timeline: {
    status: OrderStatus;
    title: string;
    description: string;
    timestamp: string;
    completed: boolean;
  }[];
  // mock links for previewing/downloading
  deliverableLinks?: {
    label: string;
    url: string;
    icon: string;
  }[];
}

export interface Testimonial {
  id: string;
  name: string;
  company?: string;
  rating: number;
  review: string;
  createdAt: string;
  isVerified?: boolean;
}

