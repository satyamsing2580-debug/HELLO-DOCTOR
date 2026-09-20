export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: string;
  hospital: string;
  roomNumber: string;
  consultationFee: number;
  rating: number;
  reviewCount: number;
  availableDays: string;
  timing: string;
  image?: string;
  emoji: string;
  currentToken: number;
  totalTokensToday: number;
  status: 'Available' | 'In OPD' | 'On Break' | 'Completed';
  bio?: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  roomNumber: string;
  consultationFee: number;
  tokenNumber: number;
  bookingDate: string;
  timeSlot: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  bookedAt: number;
  confirmedAt?: number;
  cancelledAt?: number;
  acknowledgedByAdmin?: boolean;
  symptomBrief?: string;
}

export interface LabTest {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  fastingRequired: boolean;
  reportTime: string;
  description: string;
  sampleType: string;
  popular?: boolean;
}

export interface LabBooking {
  id: string;
  testId: string;
  testName: string;
  category: string;
  price: number;
  bookingType: 'Home Sample Collection' | 'Visit Lab';
  patientName: string;
  patientPhone: string;
  address?: string;
  date: string;
  timeSlot: string;
  status: 'Confirmed' | 'Sample Collected' | 'Report Generated';
  bookedAt: number;
}

export type UserRole = 'patient' | 'admin' | 'compounder';

export interface CompounderSession {
  doctorId: string;
  doctorName: string;
}

export interface MedicineOrder {
  id: string;
  patientName: string;
  patientPhone: string;
  address: string;
  medicinesList: string;
  prescriptionImage?: string;
  deliveryFee: number;
  status: 'Pending' | 'Processing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  orderedAt: number;
  notes?: string;
}

export interface HomeVisitBooking {
  id: string;
  patientName: string;
  patientPhone: string;
  address: string;
  preferredDate: string;
  preferredTime: string;
  specialtyRequired: string;
  symptomBrief?: string;
  assignedDoctorName?: string;
  visitFee: number;
  status: 'Pending' | 'Assigned' | 'Completed' | 'Cancelled';
  bookedAt: number;
}

export interface AppSettings {
  homeVisitFee: number;
  medicineDeliveryFee: number;
  supportPhone: string;
  emergencyPhone: string;
  emergencyHelpline?: string;
}
