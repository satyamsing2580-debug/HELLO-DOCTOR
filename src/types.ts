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

export interface GeoLocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  locationName?: string;
  subDistrict?: string;
  district?: string;
  isVerified: boolean;
  verifiedAt?: number;
}

export interface PaymentDetails {
  status: 'PAID' | 'PENDING' | 'AT_COUNTER' | 'COD' | 'PAY_ON_VISIT' | 'PAY_AT_LAB';
  method: string;
  gateway?: 'Reception Desk' | 'Hospital Counter' | 'Cash on Delivery' | 'Clinic Desk';
  transactionId?: string;
  amount: number;
  paidAt?: number;
  instructions?: string;
  statusLabel?: string;
}

export interface Appointment {
  id: string;
  userId?: string;
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
  paymentStatus?: string; // e.g. "Confirmed - Pay Cash at Counter"
  bookedAt: number;
  confirmedAt?: number;
  cancelledAt?: number;
  acknowledgedByAdmin?: boolean;
  symptomBrief?: string;
  location?: GeoLocationData;
  payment?: PaymentDetails;
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
  userId?: string;
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
  status: 'Pending' | 'Confirmed' | 'Sample Collected' | 'Report Generated' | 'Completed' | 'Cancelled';
  bookedAt: number;
  location?: GeoLocationData;
  payment?: PaymentDetails;
}

export interface FamilyDependant {
  id: string;
  name: string;
  relationship: 'Self' | 'Spouse' | 'Child' | 'Parent' | 'Sibling' | 'Other';
  age?: number | string;
  gender?: 'Male' | 'Female' | 'Other';
  createdAt?: number;
}

export type UserRole = 'patient' | 'admin' | 'compounder';

export interface CompounderSession {
  doctorId: string;
  doctorName: string;
}

export interface HomeVisitBooking {
  id: string;
  userId?: string;
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
  location?: GeoLocationData;
  payment?: PaymentDetails;
}

export interface AppSettings {
  homeVisitFee: number;
  supportPhone: string;
  emergencyPhone: string;
  emergencyHelpline?: string;
}

export interface PatientFeedback {
  id: string;
  patientName: string;
  patientPhone: string;
  appointmentId?: string;
  bookingId?: string;
  tokenNumber?: number;
  doctorId?: string;
  doctorName?: string;
  serviceType: 'OPD Consultation' | 'Doctor Home Visit' | 'Diagnostic Lab Test' | 'General Clinic Care';
  rating: number; // 1 to 5
  doctorRating?: number; // 1 to 5
  waitingTimeRating?: number; // 1 to 5
  staffRating?: number; // 1 to 5
  cleanlinessRating?: number; // 1 to 5
  comments: string;
  createdAt: number;
  adminStatus: 'New' | 'Reviewed' | 'Action Taken';
  adminNotes?: string;
}

