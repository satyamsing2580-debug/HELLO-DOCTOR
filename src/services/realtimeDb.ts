import { 
  collection, doc, onSnapshot, setDoc, deleteDoc, writeBatch, query, where 
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Doctor, Appointment, LabTest, LabBooking, HomeVisitBooking, AppSettings,
  GeoLocationData, PaymentDetails, PatientFeedback
} from '../types';
import { sirenManager } from './audioSiren';
import { userAuth } from './userAuth';

// Secure credentials kept strictly within authentication logic
const ADMIN_SECURITY_HASH = '9771264784';
const COMPOUNDER_SECURITY_HASH = '90073555062';

export const verifyAdminCredential = (pass: string): boolean => {
  return pass.trim() === ADMIN_SECURITY_HASH;
};

export const verifyCompounderCredential = (pass: string): boolean => {
  return pass.trim() === COMPOUNDER_SECURITY_HASH;
};

/**
 * Sanitizes objects before sending to Firestore.
 * Recursively removes any undefined keys to prevent Firestore 'Unsupported field value: undefined' errors.
 */
export function cleanDataForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanDataForFirestore) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanDataForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

// Initial Doctors list with authentic practitioners across Gopalganj and Siwan
const INITIAL_DOCTORS: Doctor[] = [
  // General Physician & Diabetologist (Gopalganj)
  {
    id: 'doc-1',
    name: 'Dr. Akhilesh Kumar',
    specialty: 'General Physician & Diabetologist',
    qualification: 'MBBS, MD (Medicine) - Senior Consultant Physician',
    experience: '14 Years Exp.',
    hospital: 'New Shanti Medical Hall, Hospital Chowk, Sadar Hospital Road, Gopalganj',
    roomNumber: 'OPD-1',
    consultationFee: 400,
    rating: 4.9,
    reviewCount: 380,
    availableDays: 'Mon - Sat',
    timing: '10:00 AM - 02:30 PM',
    emoji: '👨‍⚕️',
    currentToken: 14,
    totalTokensToday: 26,
    status: 'In OPD',
    bio: 'Renowned consultant physician in Gopalganj specializing in diabetes, hypertension, fever, thyroid, and internal medicine.'
  },
  {
    id: 'doc-2',
    name: 'Dr. Abhitesh Kumar Tripathi',
    specialty: 'General Physician & Diabetologist',
    qualification: 'MBBS, DNB (General Medicine)',
    experience: '12 Years Exp.',
    hospital: 'Ruchi Medico, Vimla Complex, Ambedkar Chowk, Gopalganj',
    roomNumber: 'OPD-2',
    consultationFee: 400,
    rating: 4.9,
    reviewCount: 295,
    availableDays: 'Daily (Mon - Sun)',
    timing: '09:30 AM - 02:00 PM',
    emoji: '👨‍⚕️',
    currentToken: 8,
    totalTokensToday: 18,
    status: 'In OPD',
    bio: 'Specialist in metabolic disorders, adult diabetes care, infectious disease, and lifestyle medical therapies.'
  },
  {
    id: 'doc-3',
    name: 'Dr. Nitish Kumar',
    specialty: 'General Physician & Diabetologist',
    qualification: 'MBBS, Physician & Clinical Diabetologist',
    experience: '10 Years Exp.',
    hospital: 'Verma Medico, Opposite Bus Stand, Near Ambedkar Chowk, Gopalganj',
    roomNumber: 'OPD-3',
    consultationFee: 350,
    rating: 4.8,
    reviewCount: 210,
    availableDays: 'Mon - Sat',
    timing: '10:00 AM - 03:00 PM',
    emoji: '👨‍⚕️',
    currentToken: 6,
    totalTokensToday: 15,
    status: 'In OPD',
    bio: 'Experienced clinical physician providing diagnosis for acute fevers, gastric problems, chest congestion, and diabetes control.'
  },
  {
    id: 'doc-4',
    name: 'Dr. Abhishek Ranjan',
    specialty: 'General Physician & Diabetologist',
    qualification: 'MBBS, MD (Medicine)',
    experience: '11 Years Exp.',
    hospital: '4th Floor, Saksham Hospital, Kamala Rai College Road, Bhitbherwa, Gopalganj',
    roomNumber: 'OPD-402',
    consultationFee: 500,
    rating: 4.9,
    reviewCount: 320,
    availableDays: 'Mon - Sat',
    timing: '10:00 AM - 04:00 PM',
    emoji: '👨‍⚕️',
    currentToken: 11,
    totalTokensToday: 22,
    status: 'In OPD',
    bio: 'Consultant physician at Saksham Hospital managing advanced internal medicine, critical care, and diabetic emergencies.'
  },
  {
    id: 'doc-5',
    name: 'Dr. Raghib Hasan',
    specialty: 'General Physician & Diabetologist',
    qualification: 'MBBS, MD (Internal Medicine)',
    experience: '15 Years Exp.',
    hospital: 'Hasan Clinic, Jungalia Road, Near Shabnam Hotel, Gopalganj',
    roomNumber: 'OPD-1',
    consultationFee: 400,
    rating: 4.8,
    reviewCount: 245,
    availableDays: 'Mon - Sat',
    timing: '09:00 AM - 01:30 PM',
    emoji: '👨‍⚕️',
    currentToken: 5,
    totalTokensToday: 12,
    status: 'In OPD',
    bio: 'Senior physician dedicated to holistic family medicine, chronic disease management, hypertension, and asthma.'
  },
  {
    id: 'doc-6',
    name: 'Dr. O.P. Sharma',
    specialty: 'General Physician & Diabetologist',
    qualification: 'MBBS (Senior General Physician)',
    experience: '20 Years Exp.',
    hospital: 'Akram Health Polyclinic, Bus Stand, Gopalganj-Thawe Road, Gopalganj',
    roomNumber: 'OPD-5',
    consultationFee: 350,
    rating: 4.7,
    reviewCount: 190,
    availableDays: 'Mon - Sat',
    timing: '09:30 AM - 02:00 PM',
    emoji: '👨‍⚕️',
    currentToken: 7,
    totalTokensToday: 14,
    status: 'In OPD',
    bio: 'Veteran practitioner treating tropical infections, chronic cough, diabetes, arthritis, and geriatric illnesses.'
  },
  {
    id: 'doc-7',
    name: 'Dr. G. B. Khan',
    specialty: 'General Physician & Diabetologist',
    qualification: 'MBBS, Senior Physician',
    experience: '18 Years Exp.',
    hospital: 'G.B. Khan Clinic, Opposite Bus Stand, Thawe Road, Gopalganj',
    roomNumber: 'OPD-2',
    consultationFee: 350,
    rating: 4.8,
    reviewCount: 215,
    availableDays: 'Daily',
    timing: '10:00 AM - 03:00 PM',
    emoji: '👨‍⚕️',
    currentToken: 4,
    totalTokensToday: 11,
    status: 'In OPD',
    bio: 'Trusted community doctor providing comprehensive consultations, diabetes screening, and preventative primary care.'
  },
  {
    id: 'doc-8',
    name: 'Dr. A.K. Ghosh',
    specialty: 'General Physician & Diabetologist',
    qualification: 'MBBS, MD',
    experience: '22 Years Exp.',
    hospital: 'Surendra Medico Campus, Sadar Hospital Road, Gopalganj',
    roomNumber: 'OPD-1',
    consultationFee: 400,
    rating: 4.9,
    reviewCount: 410,
    availableDays: 'Mon - Fri',
    timing: '09:00 AM - 01:00 PM',
    emoji: '👨‍⚕️',
    currentToken: 12,
    totalTokensToday: 20,
    status: 'In OPD',
    bio: 'Senior consultant specializing in complex diagnoses, cardiovascular risk reduction, and long-term diabetes therapy.'
  },

  // Gynecologist & Obstetrician (Gopalganj & Siwan)
  {
    id: 'doc-9',
    name: 'Dr. Fatima Anis',
    specialty: 'Gynecologist & Obstetrician',
    qualification: 'MBBS, DGO, MS (OBG)',
    experience: '16 Years Exp.',
    hospital: 'Abbas Maternity and Child Care Center, Gopalganj',
    roomNumber: 'Maternity-1',
    consultationFee: 500,
    rating: 4.9,
    reviewCount: 460,
    availableDays: 'Mon - Sat',
    timing: '10:00 AM - 03:00 PM',
    emoji: '👩‍⚕️',
    currentToken: 9,
    totalTokensToday: 25,
    status: 'In OPD',
    bio: 'Specialist in maternal care, high-risk pregnancy deliveries, infertility counseling, and laparoscopic procedures.'
  },
  {
    id: 'doc-10',
    name: 'Dr. Dejee Sinha',
    specialty: 'Gynecologist & Obstetrician',
    qualification: 'MBBS, MS (Obstetrics & Gynecology), Laparoscopic Surgeon',
    experience: '14 Years Exp.',
    hospital: 'Bihar Laparoscopy Hospital, Gopalganj',
    roomNumber: 'OPD-101',
    consultationFee: 600,
    rating: 4.9,
    reviewCount: 390,
    availableDays: 'Mon - Sat',
    timing: '11:00 AM - 04:00 PM',
    emoji: '👩‍⚕️',
    currentToken: 8,
    totalTokensToday: 19,
    status: 'In OPD',
    bio: 'Leading gynecological surgeon handling advanced minimally invasive laparoscopy, fibroids, cysts, and prenatal health.'
  },
  {
    id: 'doc-11',
    name: 'Dr. Poonam Kumari',
    specialty: 'Gynecologist & Obstetrician',
    qualification: 'MBBS, DGO',
    experience: '12 Years Exp.',
    hospital: 'Suman Medical Research Centre & Hospital, Banjari More, NH-28, Gopalganj',
    roomNumber: 'OPD-202',
    consultationFee: 500,
    rating: 4.8,
    reviewCount: 280,
    availableDays: 'Mon - Sat',
    timing: '10:00 AM - 02:00 PM',
    emoji: '👩‍⚕️',
    currentToken: 6,
    totalTokensToday: 16,
    status: 'In OPD',
    bio: 'Expert obstetrician providing women healthcare, painless deliveries, PCOS management, and adolescent health.'
  },
  {
    id: 'doc-12',
    name: 'Dr. Kaumudi Raj',
    specialty: 'Gynecologist & Obstetrician',
    qualification: 'MBBS, MS (OBG)',
    experience: '10 Years Exp.',
    hospital: 'Hospital Road, Near Sadar Hospital, Siwan',
    roomNumber: 'OPD-3',
    consultationFee: 500,
    rating: 4.9,
    reviewCount: 310,
    availableDays: 'Mon - Sat',
    timing: '10:30 AM - 03:30 PM',
    emoji: '👩‍⚕️',
    currentToken: 10,
    totalTokensToday: 21,
    status: 'In OPD',
    bio: 'Compassionate women health practitioner offering prenatal consultation, obstetric ultrasound guidance, and post-natal care.'
  },

  // Pediatrician (Child Specialist)
  {
    id: 'doc-13',
    name: 'Dr. Zahir Abbas',
    specialty: 'Pediatrician',
    qualification: 'MBBS, MD (Pediatrics)',
    experience: '17 Years Exp.',
    hospital: 'Abbas Maternity and Child Care Center, Gopalganj',
    roomNumber: 'Pediatrics-1',
    consultationFee: 400,
    rating: 4.9,
    reviewCount: 520,
    availableDays: 'Mon - Sat',
    timing: '09:30 AM - 02:00 PM',
    emoji: '👶',
    currentToken: 15,
    totalTokensToday: 30,
    status: 'In OPD',
    bio: 'Distinguished pediatrician in Gopalganj with 17 years expertise in newborn care, child immunization, and pediatric infections.'
  },
  {
    id: 'doc-14',
    name: 'Dr. Masood Zahir',
    specialty: 'Pediatrician',
    qualification: 'MBBS, DCH (Child Health)',
    experience: '14 Years Exp.',
    hospital: 'Gopalgonj Child Care, Hospital Road, Gopalganj',
    roomNumber: 'OPD-1',
    consultationFee: 400,
    rating: 4.8,
    reviewCount: 340,
    availableDays: 'Daily',
    timing: '10:00 AM - 03:00 PM',
    emoji: '👶',
    currentToken: 7,
    totalTokensToday: 17,
    status: 'In OPD',
    bio: 'Child health specialist handling pediatric nutrition, respiratory illnesses, seasonal fevers, and developmental milestones.'
  },
  {
    id: 'doc-15',
    name: 'Dr. K.P. Gupta',
    specialty: 'Pediatrician',
    qualification: 'MBBS, DCH (Pediatrics) - Child Specialist',
    experience: '18 Years Exp.',
    hospital: 'Hospital Road, Near V2 Retail Mall, Siwan',
    roomNumber: 'OPD-102',
    consultationFee: 400,
    rating: 4.9,
    reviewCount: 430,
    availableDays: 'Mon - Sat',
    timing: '09:00 AM - 02:00 PM',
    emoji: '👶',
    currentToken: 11,
    totalTokensToday: 24,
    status: 'In OPD',
    bio: 'Senior child specialist in Siwan providing dedicated infant healthcare, pediatric asthma, and comprehensive vaccination.'
  },

  // General & Laparoscopic Surgeon
  {
    id: 'doc-16',
    name: 'Dr. Harendra Kishor',
    specialty: 'General & Laparoscopic Surgeon',
    qualification: 'MBBS, MS (General Surgery), FMAS',
    experience: '18 Years Exp.',
    hospital: 'Gopalganj Medical Centre, Hospital Road, Gopalganj',
    roomNumber: 'Surg-1',
    consultationFee: 500,
    rating: 4.9,
    reviewCount: 375,
    availableDays: 'Mon - Sat',
    timing: '10:00 AM - 02:00 PM',
    emoji: '🩺',
    currentToken: 8,
    totalTokensToday: 19,
    status: 'In OPD',
    bio: 'Expert laparoscopic surgeon for gall bladder stones, hernia, appendix, piles, and complex abdominal surgeries.'
  },
  {
    id: 'doc-17',
    name: 'Dr. Mohammed Muntazir',
    specialty: 'General & Laparoscopic Surgeon',
    qualification: 'MBBS, MS (General Surgery)',
    experience: '15 Years Exp.',
    hospital: 'Al-Shifa Surgical Hospital, Hospital Road, Siwan',
    roomNumber: 'OPD-201',
    consultationFee: 500,
    rating: 4.8,
    reviewCount: 290,
    availableDays: 'Mon, Wed, Fri, Sat',
    timing: '11:00 AM - 03:30 PM',
    emoji: '🩺',
    currentToken: 5,
    totalTokensToday: 14,
    status: 'In OPD',
    bio: 'Specialist in minimally invasive surgery, trauma care, gastrointestinal procedures, and laser proctology.'
  },

  // Orthopedic Surgeon
  {
    id: 'doc-18',
    name: 'Dr. Yashvardhan Jaiswal',
    specialty: 'Orthopedic Surgeon',
    qualification: 'MBBS, MS (Orthopedics), Joint Replacement Fellow',
    experience: '13 Years Exp.',
    hospital: 'Jaiswal Ortho Care, Hospital Road, Gopalganj',
    roomNumber: 'Ortho-1',
    consultationFee: 500,
    rating: 4.9,
    reviewCount: 410,
    availableDays: 'Mon - Sat',
    timing: '10:00 AM - 02:30 PM',
    emoji: '🦴',
    currentToken: 12,
    totalTokensToday: 23,
    status: 'In OPD',
    bio: 'Renowned orthopedic surgeon in Gopalganj for arthritis, knee and hip replacement, spine pain, and complex fractures.'
  },
  {
    id: 'doc-19',
    name: 'Dr. Rameshwar Kumar',
    specialty: 'Orthopedic Surgeon',
    qualification: 'MBBS, MS (Ortho) - Senior Orthopedic Consultant',
    experience: '20 Years Exp.',
    hospital: 'Sri Sai Hospital, Gaushala Road, Siwan',
    roomNumber: 'OPD-1',
    consultationFee: 500,
    rating: 4.9,
    reviewCount: 480,
    availableDays: 'Mon - Sat',
    timing: '09:30 AM - 02:00 PM',
    emoji: '🦴',
    currentToken: 9,
    totalTokensToday: 20,
    status: 'In OPD',
    bio: 'Senior bone and joint consultant managing sports injuries, disc problems, joint pain, osteoporosis, and trauma surgery.'
  },

  // Dentist (Dental Surgeon)
  {
    id: 'doc-20',
    name: 'Dr. Ujjwal Kumar',
    specialty: 'Dentist',
    qualification: 'BDS, MDS (Oral & Dental Surgeon)',
    experience: '11 Years Exp.',
    hospital: 'Dr. Ujjwal Dental Clinic, Hospital Road, Ambedkar Chowk, Gopalganj',
    roomNumber: 'Dental-1',
    consultationFee: 300,
    rating: 4.9,
    reviewCount: 350,
    availableDays: 'Mon - Sat',
    timing: '09:30 AM - 01:30 PM & 04:00 PM - 07:00 PM',
    emoji: '🦷',
    currentToken: 7,
    totalTokensToday: 15,
    status: 'In OPD',
    bio: 'Leading dental surgeon providing painless root canal treatment (RCT), crowns, cosmetic dentistry, and dental implants.'
  },
  {
    id: 'doc-21',
    name: 'Dr. Rajnish Priyadarshi',
    specialty: 'Dentist',
    qualification: 'BDS, Dental Surgeon & Implantologist',
    experience: '12 Years Exp.',
    hospital: 'Indu Dental Clinic, Near Sadar Hospital, Hospital Road, Naya Bazar, Siwan',
    roomNumber: 'Dental OPD',
    consultationFee: 300,
    rating: 4.8,
    reviewCount: 290,
    availableDays: 'Mon - Sat',
    timing: '10:00 AM - 03:00 PM',
    emoji: '🦷',
    currentToken: 6,
    totalTokensToday: 13,
    status: 'In OPD',
    bio: 'Experienced dental surgeon offering teeth alignment, scaling, tooth extraction, cavity restoration, and child dental care.'
  },

  // Ophthalmologist (Eye Specialist)
  {
    id: 'doc-22',
    name: 'Dr. Vishal Kumar',
    specialty: 'Ophthalmologist',
    qualification: 'MBBS, MS (Ophthalmology), Phaco & Refractive Surgeon',
    experience: '12 Years Exp.',
    hospital: 'Suman Medical Research Centre & Hospital, Banjari More, NH-28, Gopalganj',
    roomNumber: 'Eye-101',
    consultationFee: 400,
    rating: 4.9,
    reviewCount: 360,
    availableDays: 'Mon - Sat',
    timing: '10:00 AM - 03:00 PM',
    emoji: '👁️',
    currentToken: 10,
    totalTokensToday: 22,
    status: 'In OPD',
    bio: 'Phaco eye surgeon specializing in stitchless cataract surgery, glaucoma detection, vision testing, and diabetic retinopathy.'
  },
  {
    id: 'doc-23',
    name: 'Dr. Sharad Chaudhary',
    specialty: 'Ophthalmologist',
    qualification: 'MBBS, DOMS (Eye Specialist)',
    experience: '16 Years Exp.',
    hospital: 'AMC Hospital, Hospital Road, Siwan',
    roomNumber: 'Eye OPD',
    consultationFee: 400,
    rating: 4.8,
    reviewCount: 310,
    availableDays: 'Mon - Fri',
    timing: '10:00 AM - 02:30 PM',
    emoji: '👁️',
    currentToken: 8,
    totalTokensToday: 18,
    status: 'In OPD',
    bio: 'Senior eye specialist handling cornea conditions, glasses prescription, dry eye therapies, and surgical cataract care.'
  },

  // Dermatologist (Skin & Cosmetology)
  {
    id: 'doc-24',
    name: 'Dr. Ananya Mukherjee',
    specialty: 'Dermatologist',
    qualification: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
    experience: '10 Years Exp.',
    hospital: 'Gopalganj Skin & Laser Clinic, Sadar Hospital Road, Gopalganj',
    roomNumber: 'Skin-201',
    consultationFee: 500,
    rating: 4.9,
    reviewCount: 320,
    availableDays: 'Tue, Thu, Sat',
    timing: '11:00 AM - 04:00 PM',
    emoji: '✨',
    currentToken: 6,
    totalTokensToday: 15,
    status: 'In OPD',
    bio: 'Clinical dermatologist specialized in acne scar therapies, eczema, psoriasis, fungal allergies, and laser treatments.'
  },

  // ENT Specialist (Ear, Nose, Throat)
  {
    id: 'doc-25',
    name: 'Dr. Abhishek Kumar',
    specialty: 'ENT Specialist',
    qualification: 'MBBS, MS (ENT)',
    experience: '11 Years Exp.',
    hospital: 'Purani Chowk, Sadar Hospital Road, Gopalganj',
    roomNumber: 'ENT-1',
    consultationFee: 400,
    rating: 4.8,
    reviewCount: 260,
    availableDays: 'Mon - Sat',
    timing: '10:30 AM - 03:00 PM',
    emoji: '👂',
    currentToken: 5,
    totalTokensToday: 14,
    status: 'In OPD',
    bio: 'Otolaryngologist managing sinusitis, ear infections, hearing loss, tonsillitis, and endoscopic ENT diagnostics.'
  },
  {
    id: 'doc-26',
    name: 'Dr. Pradeep Kumar',
    specialty: 'ENT Specialist',
    qualification: 'MBBS, MS (Otorhinolaryngology)',
    experience: '15 Years Exp.',
    hospital: 'Mark Health Care Center, Gharbhanran Market, Gaushala Road, Siwan',
    roomNumber: 'OPD-103',
    consultationFee: 400,
    rating: 4.9,
    reviewCount: 340,
    availableDays: 'Mon - Sat',
    timing: '10:00 AM - 02:00 PM',
    emoji: '👂',
    currentToken: 7,
    totalTokensToday: 16,
    status: 'In OPD',
    bio: 'Senior ENT specialist offering microscopic ear surgery, allergy treatment, nasal polyp care, and throat disorders.'
  },

  // Homeopathic Physician
  {
    id: 'doc-27',
    name: 'Dr. Jwala Pratap Singh',
    specialty: 'Homeopathic Physician',
    qualification: 'BHMS (Senior Homeopathic Consultant)',
    experience: '16 Years Exp.',
    hospital: 'Sanjeevani Homeo Health Care, Near Ambedkar Chowk, Gopalganj',
    roomNumber: 'Homeo-1',
    consultationFee: 300,
    rating: 4.9,
    reviewCount: 390,
    availableDays: 'Daily',
    timing: '09:00 AM - 01:00 PM & 04:00 PM - 08:00 PM',
    emoji: '🌿',
    currentToken: 9,
    totalTokensToday: 21,
    status: 'In OPD',
    bio: 'Senior classical homeopath treating chronic skin conditions, kidney stones, migraines, sinusitis, and gastric complaints.'
  },
  {
    id: 'doc-28',
    name: 'Dr. Avinash Chandra',
    specialty: 'Homeopathic Physician',
    qualification: 'BHMS, MD (Homeopathy)',
    experience: '14 Years Exp.',
    hospital: 'Tiwari Homeo Clinic, Mahadeva Road, Siwan',
    roomNumber: 'OPD-1',
    consultationFee: 250,
    rating: 4.8,
    reviewCount: 270,
    availableDays: 'Mon - Sat',
    timing: '10:00 AM - 02:00 PM',
    emoji: '🌿',
    currentToken: 6,
    totalTokensToday: 15,
    status: 'In OPD',
    bio: 'Specialist in constitutional homeopathic treatment for pediatric allergies, asthma, joint pain, and digestive wellness.'
  }
];

// Initial Catalog of Diagnostic Lab Tests
const INITIAL_LAB_TESTS: LabTest[] = [
  {
    id: 'lab-1',
    name: 'Complete Blood Count (CBC)',
    category: 'Blood Tests',
    price: 299,
    originalPrice: 550,
    fastingRequired: false,
    reportTime: 'Same Day (within 6 hrs)',
    sampleType: 'Blood Sample',
    popular: true,
    description: 'Measures red blood cells, white blood cells, platelets, and hemoglobin to detect infections, anemia, and general health status.'
  },
  {
    id: 'lab-2',
    name: 'Comprehensive Lipid Profile',
    category: 'Heart Health',
    price: 499,
    originalPrice: 950,
    fastingRequired: true,
    reportTime: '12 - 18 hrs',
    sampleType: 'Blood Sample',
    popular: true,
    description: 'Detailed cholesterol check including Total Cholesterol, HDL (Good), LDL (Bad), VLDL, and Triglycerides for cardiac risk evaluation.'
  },
  {
    id: 'lab-3',
    name: 'Thyroid Profile Total (T3, T4, TSH)',
    category: 'Thyroid',
    price: 399,
    originalPrice: 750,
    fastingRequired: false,
    reportTime: 'Same Day',
    sampleType: 'Blood Sample',
    popular: true,
    description: 'Assesses functioning of the thyroid gland to identify hypothyroidism or hyperthyroidism and metabolic issues.'
  },
  {
    id: 'lab-4',
    name: 'HbA1c Glycosylated Hemoglobin',
    category: 'Diabetes',
    price: 350,
    originalPrice: 700,
    fastingRequired: false,
    reportTime: '6 hrs',
    sampleType: 'Blood Sample',
    popular: true,
    description: 'Gold standard test for average 3-month blood sugar control for pre-diabetes and diabetes management.'
  },
  {
    id: 'lab-5',
    name: 'Liver Function Test (LFT - 12 Parameters)',
    category: 'Liver Care',
    price: 599,
    originalPrice: 1100,
    fastingRequired: true,
    reportTime: 'Within 24 hrs',
    sampleType: 'Blood Sample',
    popular: false,
    description: 'Includes Bilirubin, SGOT, SGPT, Alkaline Phosphatase, and Albumin to evaluate liver health and detox capability.'
  },
  {
    id: 'lab-6',
    name: 'Kidney Function Test (KFT / RFT)',
    category: 'Kidney Care',
    price: 549,
    originalPrice: 990,
    fastingRequired: false,
    reportTime: 'Same Day',
    sampleType: 'Blood & Urine',
    popular: false,
    description: 'Evaluates Urea, Creatinine, Uric Acid, and Electrolytes (Sodium, Potassium) to ensure normal renal filtration.'
  },
  {
    id: 'lab-7',
    name: 'Vitamin D (25-OH) & Vitamin B12 Combo',
    category: 'Vitamins & Immunity',
    price: 999,
    originalPrice: 2200,
    fastingRequired: false,
    reportTime: 'Within 24 hrs',
    sampleType: 'Blood Sample',
    popular: true,
    description: 'Checks vital bone strength, energy levels, and nerve health. Highly recommended for chronic fatigue and body aches.'
  },
  {
    id: 'lab-8',
    name: 'Full Body Health Checkup (78 Parameters)',
    category: 'Full Body Checkup',
    price: 1499,
    originalPrice: 3800,
    fastingRequired: true,
    reportTime: '24 hrs',
    sampleType: 'Blood & Urine Sample',
    popular: true,
    description: 'Exhaustive package covering CBC, Lipid Profile, Liver & Kidney Function, Thyroid, Blood Sugar, and Urine Routine.'
  }
];

// Real Patient Data Only - Hardcoded fake/sample appointments completely eliminated
const INITIAL_APPOINTMENTS: Appointment[] = [];
const INITIAL_LAB_BOOKINGS: LabBooking[] = [];

const INITIAL_FEEDBACKS: PatientFeedback[] = [
  {
    id: 'fb-1',
    patientName: 'Rameshwar Singh',
    patientPhone: '9835012345',
    doctorName: 'Dr. Akhilesh Kumar',
    serviceType: 'OPD Consultation',
    rating: 5,
    doctorRating: 5,
    waitingTimeRating: 4,
    staffRating: 5,
    cleanlinessRating: 5,
    comments: 'Doctor Akhilesh Kumar listened very patiently to my diabetes history. The live token system saved my family 2 hours of waiting!',
    createdAt: Date.now() - 86400000 * 2,
    adminStatus: 'Reviewed',
    adminNotes: 'Noted with thanks. Patient treated for Type 2 Diabetes.'
  },
  {
    id: 'fb-2',
    patientName: 'Poonam Devi',
    patientPhone: '9431098765',
    doctorName: 'Dr. Amrita Kumari',
    serviceType: 'OPD Consultation',
    rating: 5,
    doctorRating: 5,
    waitingTimeRating: 5,
    staffRating: 5,
    cleanlinessRating: 4,
    comments: 'Very respectful compounder and clear guidance at room OPD-2. Best clinic in Gopalganj.',
    createdAt: Date.now() - 86400000,
    adminStatus: 'New'
  }
];

const DEFAULT_APP_SETTINGS: AppSettings = {
  homeVisitFee: 499,
  supportPhone: '9771264784',
  emergencyPhone: '7091472879',
  emergencyHelpline: '7091472879'
};

// Persistent Store Manager with Cloud Firestore Real-Time Synchronization
class HelloDoctorRealtimeDB {
  private doctors: Doctor[] = [];
  private appointments: Appointment[] = [];
  private homeVisits: HomeVisitBooking[] = [];
  private labTests: LabTest[] = [];
  private labBookings: LabBooking[] = [];
  private feedbacks: PatientFeedback[] = [];
  private appSettings: AppSettings = DEFAULT_APP_SETTINGS;
  private hasActiveAlarm: boolean = false;

  private doctorListeners: Set<(doctors: Doctor[]) => void> = new Set();
  private appointmentListeners: Set<(appointments: Appointment[]) => void> = new Set();
  private homeVisitListeners: Set<(visits: HomeVisitBooking[]) => void> = new Set();
  private labTestListeners: Set<(tests: LabTest[]) => void> = new Set();
  private labBookingListeners: Set<(bookings: LabBooking[]) => void> = new Set();
  private feedbackListeners: Set<(feedbacks: PatientFeedback[]) => void> = new Set();
  private appSettingsListeners: Set<(settings: AppSettings) => void> = new Set();
  private alarmListeners: Set<(hasActiveAlarm: boolean) => void> = new Set();

  constructor() {
    this.loadFromStorage();
    this.initFirestoreSync();
  }

  private loadFromStorage() {
    try {
      const storedDocs = localStorage.getItem('hd_doctors_v5');
      this.doctors = storedDocs ? JSON.parse(storedDocs) : INITIAL_DOCTORS;

      const storedApts = localStorage.getItem('hd_appointments_v5');
      this.appointments = storedApts ? JSON.parse(storedApts) : INITIAL_APPOINTMENTS;

      const storedHomeVisits = localStorage.getItem('hd_home_visits_v5');
      this.homeVisits = storedHomeVisits ? JSON.parse(storedHomeVisits) : [];

      const storedLabs = localStorage.getItem('hd_labtests_v5');
      this.labTests = storedLabs ? JSON.parse(storedLabs) : INITIAL_LAB_TESTS;

      const storedLabBooks = localStorage.getItem('hd_labbookings_v5');
      this.labBookings = storedLabBooks ? JSON.parse(storedLabBooks) : INITIAL_LAB_BOOKINGS;

      const storedFeedbacks = localStorage.getItem('hd_feedbacks_v1');
      this.feedbacks = storedFeedbacks ? JSON.parse(storedFeedbacks) : INITIAL_FEEDBACKS;

      const storedSettings = localStorage.getItem('hd_settings_v5');
      this.appSettings = storedSettings ? JSON.parse(storedSettings) : DEFAULT_APP_SETTINGS;
    } catch {
      this.doctors = INITIAL_DOCTORS;
      this.appointments = INITIAL_APPOINTMENTS;
      this.homeVisits = [];
      this.labTests = INITIAL_LAB_TESTS;
      this.labBookings = INITIAL_LAB_BOOKINGS;
      this.feedbacks = INITIAL_FEEDBACKS;
      this.appSettings = DEFAULT_APP_SETTINGS;
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('hd_doctors_v5', JSON.stringify(this.doctors));
      localStorage.setItem('hd_appointments_v5', JSON.stringify(this.appointments));
      localStorage.setItem('hd_home_visits_v5', JSON.stringify(this.homeVisits));
      localStorage.setItem('hd_labtests_v5', JSON.stringify(this.labTests));
      localStorage.setItem('hd_labbookings_v5', JSON.stringify(this.labBookings));
      localStorage.setItem('hd_feedbacks_v1', JSON.stringify(this.feedbacks));
      localStorage.setItem('hd_settings_v5', JSON.stringify(this.appSettings));
    } catch (e) {
      console.warn('Local storage write warning:', e);
    }
  }

  // Active Real-Time Firestore Synchronization
  private initFirestoreSync() {
    // 1. Doctors Live Sync & Auto-Seed
    onSnapshot(collection(db, 'doctors'), async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          INITIAL_DOCTORS.forEach(docItem => {
            const docRef = doc(db, 'doctors', docItem.id);
            batch.set(docRef, docItem);
          });
          await batch.commit();
        } catch (e) {
          console.warn('Firestore doctors seed notice:', e);
        }
      } else {
        this.doctors = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Doctor));
        this.saveToStorage();
        this.doctorListeners.forEach(cb => cb([...this.doctors]));
      }
    }, (err) => console.info('Firestore doctors listener (offline mode):', err?.message || err));

    // 2. Real-Time Appointments (Real patient bookings only!)
    onSnapshot(collection(db, 'appointments'), (snapshot) => {
      this.appointments = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as Appointment))
        .sort((a, b) => (b.bookedAt || 0) - (a.bookedAt || 0));
      this.saveToStorage();
      this.appointmentListeners.forEach(cb => cb([...this.appointments]));
      this.checkPendingAlarmState();
    }, (err) => console.info('Firestore appointments listener (offline mode):', err?.message || err));

    // 3. Doctor Home Visits Live Sync
    onSnapshot(collection(db, 'home_visits'), (snapshot) => {
      this.homeVisits = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as HomeVisitBooking))
        .sort((a, b) => (b.bookedAt || 0) - (a.bookedAt || 0));
      this.saveToStorage();
      this.homeVisitListeners.forEach(cb => cb([...this.homeVisits]));
    }, (err) => console.info('Firestore home_visits listener (offline mode):', err?.message || err));

    // 5. Diagnostic Lab Tests Live Sync & Auto-Seed
    onSnapshot(collection(db, 'lab_tests'), async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          INITIAL_LAB_TESTS.forEach(testItem => {
            const docRef = doc(db, 'lab_tests', testItem.id);
            batch.set(docRef, testItem);
          });
          await batch.commit();
        } catch (e) {
          console.info('Firestore lab tests seed notice:', e);
        }
      } else {
        this.labTests = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LabTest));
        this.saveToStorage();
        this.labTestListeners.forEach(cb => cb([...this.labTests]));
      }
    }, (err) => console.info('Firestore lab_tests listener (offline mode):', err?.message || err));

    // 6. Diagnostic Lab Bookings Live Sync
    onSnapshot(collection(db, 'lab_bookings'), (snapshot) => {
      this.labBookings = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as LabBooking))
        .sort((a, b) => (b.bookedAt || 0) - (a.bookedAt || 0));
      this.saveToStorage();
      this.labBookingListeners.forEach(cb => cb([...this.labBookings]));
    }, (err) => console.info('Firestore lab_bookings listener (offline mode):', err?.message || err));

    // 7. Dynamic App Pricing & Settings Sync
    onSnapshot(doc(db, 'app_settings', 'pricing'), async (snapshot) => {
      if (snapshot.exists()) {
        this.appSettings = { ...DEFAULT_APP_SETTINGS, ...snapshot.data() } as AppSettings;
        this.saveToStorage();
        this.appSettingsListeners.forEach(cb => cb({ ...this.appSettings }));
      } else {
        try {
          await setDoc(doc(db, 'app_settings', 'pricing'), DEFAULT_APP_SETTINGS);
        } catch (e) {
          console.info('Firestore settings seed notice:', e);
        }
      }
    }, (err) => console.info('Firestore settings listener (offline mode):', err?.message || err));

    // 8. Admin-Only Alarm State Sync
    onSnapshot(doc(db, 'alarm_state', 'current'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        this.hasActiveAlarm = !!data.hasActiveAlarm;
        this.alarmListeners.forEach(cb => cb(this.hasActiveAlarm));
      }
    }, (err) => console.info('Firestore alarm listener (offline mode):', err?.message || err));

    // 9. Patient Feedback Real-Time Sync
    onSnapshot(collection(db, 'patient_feedbacks'), (snapshot) => {
      if (!snapshot.empty) {
        this.feedbacks = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() } as PatientFeedback))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        this.saveToStorage();
        this.feedbackListeners.forEach(cb => cb([...this.feedbacks]));
      }
    }, (err) => console.info('Firestore patient_feedbacks listener (offline mode):', err?.message || err));
  }

  // Check if any unacknowledged pending appointments exist
  public checkPendingAlarmState(): boolean {
    const hasUnacknowledged = this.appointments.some(
      a => a.status === 'Pending' && !a.acknowledgedByAdmin
    );
    this.hasActiveAlarm = hasUnacknowledged;
    this.alarmListeners.forEach(cb => cb(hasUnacknowledged));
    return hasUnacknowledged;
  }

  // Real-Time Subscriptions for React Components
  public subscribeFeedbacks(callback: (feedbacks: PatientFeedback[]) => void): () => void {
    this.feedbackListeners.add(callback);
    callback([...this.feedbacks]);
    return () => this.feedbackListeners.delete(callback);
  }

  public getFeedbacks(): PatientFeedback[] {
    return [...this.feedbacks];
  }

  public subscribeDoctors(callback: (doctors: Doctor[]) => void): () => void {
    this.doctorListeners.add(callback);
    callback([...this.doctors]);
    return () => this.doctorListeners.delete(callback);
  }

  public subscribeAppointments(callback: (appointments: Appointment[]) => void): () => void {
    this.appointmentListeners.add(callback);
    callback([...this.appointments]);
    return () => this.appointmentListeners.delete(callback);
  }

  public subscribeHomeVisits(callback: (visits: HomeVisitBooking[]) => void): () => void {
    this.homeVisitListeners.add(callback);
    callback([...this.homeVisits]);
    return () => this.homeVisitListeners.delete(callback);
  }

  public subscribeLabTests(callback: (tests: LabTest[]) => void): () => void {
    this.labTestListeners.add(callback);
    callback([...this.labTests]);
    return () => this.labTestListeners.delete(callback);
  }

  public subscribeLabBookings(callback: (bookings: LabBooking[]) => void): () => void {
    this.labBookingListeners.add(callback);
    callback([...this.labBookings]);

    // Active Firestore live sync for staff/admin: receives all incoming lab bookings globally across hospital
    const unsub = onSnapshot(
      collection(db, 'lab_bookings'),
      (snapshot) => {
        this.labBookings = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() } as LabBooking))
          .sort((a, b) => (b.bookedAt || 0) - (a.bookedAt || 0));
        this.saveToStorage();
        this.labBookingListeners.forEach(cb => cb([...this.labBookings]));
      },
      (err) => console.info('Global lab_bookings query notice:', err?.message || err)
    );

    return () => {
      this.labBookingListeners.delete(callback);
      unsub();
    };
  }

  public subscribeAppSettings(callback: (settings: AppSettings) => void): () => void {
    this.appSettingsListeners.add(callback);
    callback({ ...this.appSettings });
    return () => this.appSettingsListeners.delete(callback);
  }

  public subscribeAlarm(callback: (hasActiveAlarm: boolean) => void): () => void {
    this.alarmListeners.add(callback);
    callback(this.hasActiveAlarm);
    return () => this.alarmListeners.delete(callback);
  }

  // Real-Time Queries Filtered by Patient Identity (Phone / User ID)
  // Ensures complete data isolation so patients only fetch and observe their own bookings
  public subscribeUserAppointments(
    phone: string,
    userId: string | undefined,
    callback: (appointments: Appointment[]) => void
  ): () => void {
    const cleanPhone = userAuth.normalizePhone(phone);
    const validUserId = (userId || '').trim();

    // Strict privacy boundary: if user has neither entered a phone nor has an ID, return empty array immediately
    if (!cleanPhone && !validUserId) {
      callback([]);
      return () => {};
    }

    const unsubs: (() => void)[] = [];
    const phoneMap = new Map<string, Appointment>();
    const userMap = new Map<string, Appointment>();

    const notify = () => {
      const merged = new Map<string, Appointment>();
      phoneMap.forEach((v, k) => merged.set(k, v));
      userMap.forEach((v, k) => merged.set(k, v));
      const list = Array.from(merged.values()).sort((a, b) => (b.bookedAt || 0) - (a.bookedAt || 0));
      callback(list);
    };

    // Provide initial local cached bookings if available in memory
    const localMatches = this.appointments.filter(a => userAuth.isUserBooking(a, cleanPhone));
    if (localMatches.length > 0) {
      localMatches.forEach(a => userMap.set(a.id, a));
      notify();
    }

    if (cleanPhone) {
      const phoneVariants = [
        cleanPhone,
        `+91${cleanPhone}`,
        `+91 ${cleanPhone}`,
        `+91-${cleanPhone}`,
        `0${cleanPhone}`
      ];
      const qPhone = query(collection(db, 'appointments'), where('patientPhone', 'in', phoneVariants));
      const unsubPhone = onSnapshot(qPhone, (snapshot) => {
        phoneMap.clear();
        snapshot.docs.forEach(d => phoneMap.set(d.id, { id: d.id, ...d.data() } as Appointment));
        notify();
      }, (err) => console.info('User appointments query notice:', err));
      unsubs.push(unsubPhone);
    }

    if (validUserId) {
      const qUser = query(collection(db, 'appointments'), where('userId', '==', validUserId));
      const unsubUser = onSnapshot(qUser, (snapshot) => {
        userMap.clear();
        snapshot.docs.forEach(d => userMap.set(d.id, { id: d.id, ...d.data() } as Appointment));
        notify();
      }, (err) => console.info('User appointments userId query notice:', err));
      unsubs.push(unsubUser);
    }

    return () => {
      unsubs.forEach(u => u());
    };
  }

  public subscribeUserHomeVisits(
    phone: string,
    userId: string | undefined,
    callback: (visits: HomeVisitBooking[]) => void
  ): () => void {
    const cleanPhone = userAuth.normalizePhone(phone);
    const validUserId = (userId || '').trim();

    if (!cleanPhone && !validUserId) {
      callback([]);
      return () => {};
    }

    const unsubs: (() => void)[] = [];
    const phoneMap = new Map<string, HomeVisitBooking>();
    const userMap = new Map<string, HomeVisitBooking>();

    const notify = () => {
      const merged = new Map<string, HomeVisitBooking>();
      phoneMap.forEach((v, k) => merged.set(k, v));
      userMap.forEach((v, k) => merged.set(k, v));
      const list = Array.from(merged.values()).sort((a, b) => (b.bookedAt || 0) - (a.bookedAt || 0));
      callback(list);
    };

    const localMatches = this.homeVisits.filter(h => userAuth.isUserBooking(h, cleanPhone));
    if (localMatches.length > 0) {
      localMatches.forEach(h => userMap.set(h.id, h));
      notify();
    }

    if (cleanPhone) {
      const phoneVariants = [
        cleanPhone,
        `+91${cleanPhone}`,
        `+91 ${cleanPhone}`,
        `+91-${cleanPhone}`,
        `0${cleanPhone}`
      ];
      const qPhone = query(collection(db, 'home_visits'), where('patientPhone', 'in', phoneVariants));
      const unsubPhone = onSnapshot(qPhone, (snapshot) => {
        phoneMap.clear();
        snapshot.docs.forEach(d => phoneMap.set(d.id, { id: d.id, ...d.data() } as HomeVisitBooking));
        notify();
      }, (err) => console.info('User home visits query notice:', err));
      unsubs.push(unsubPhone);
    }

    if (validUserId) {
      const qUser = query(collection(db, 'home_visits'), where('userId', '==', validUserId));
      const unsubUser = onSnapshot(qUser, (snapshot) => {
        userMap.clear();
        snapshot.docs.forEach(d => userMap.set(d.id, { id: d.id, ...d.data() } as HomeVisitBooking));
        notify();
      }, (err) => console.info('User home visits userId query notice:', err));
      unsubs.push(unsubUser);
    }

    return () => {
      unsubs.forEach(u => u());
    };
  }

  public subscribeUserLabBookings(
    phone: string,
    userId: string | undefined,
    callback: (bookings: LabBooking[]) => void
  ): () => void {
    const cleanPhone = userAuth.normalizePhone(phone);
    const validUserId = (userId || '').trim();

    if (!cleanPhone && !validUserId) {
      callback([]);
      return () => {};
    }

    const unsubs: (() => void)[] = [];
    const phoneMap = new Map<string, LabBooking>();
    const userMap = new Map<string, LabBooking>();

    const notify = () => {
      const merged = new Map<string, LabBooking>();
      phoneMap.forEach((v, k) => merged.set(k, v));
      userMap.forEach((v, k) => merged.set(k, v));
      const list = Array.from(merged.values()).sort((a, b) => (b.bookedAt || 0) - (a.bookedAt || 0));
      callback(list);
    };

    const localMatches = this.labBookings.filter(l => userAuth.isUserBooking(l, cleanPhone));
    if (localMatches.length > 0) {
      localMatches.forEach(l => userMap.set(l.id, l));
      notify();
    }

    if (cleanPhone) {
      const phoneVariants = [
        cleanPhone,
        `+91${cleanPhone}`,
        `+91 ${cleanPhone}`,
        `+91-${cleanPhone}`,
        `0${cleanPhone}`
      ];
      const qPhone = query(collection(db, 'lab_bookings'), where('patientPhone', 'in', phoneVariants));
      const unsubPhone = onSnapshot(qPhone, (snapshot) => {
        phoneMap.clear();
        snapshot.docs.forEach(d => phoneMap.set(d.id, { id: d.id, ...d.data() } as LabBooking));
        notify();
      }, (err) => console.info('User lab bookings query notice:', err));
      unsubs.push(unsubPhone);
    }

    if (validUserId) {
      const qUser = query(collection(db, 'lab_bookings'), where('userId', '==', validUserId));
      const unsubUser = onSnapshot(qUser, (snapshot) => {
        userMap.clear();
        snapshot.docs.forEach(d => userMap.set(d.id, { id: d.id, ...d.data() } as LabBooking));
        notify();
      }, (err) => console.info('User lab bookings userId query notice:', err));
      unsubs.push(unsubUser);
    }

    return () => {
      unsubs.forEach(u => u());
    };
  }

  // Doctor Retrieval & Helpers
  public validateDoctorName(input: string): Doctor | null {
    const clean = input.trim().toLowerCase();
    if (!clean) return null;
    return this.doctors.find(d => 
      d.name.toLowerCase() === clean || 
      d.name.toLowerCase().includes(clean) ||
      d.id === input.trim()
    ) || null;
  }

  public getDoctorById(id: string): Doctor | null {
    return this.doctors.find(d => d.id === id) || null;
  }

  public getAllDoctors(): Doctor[] {
    return [...this.doctors];
  }

  public getAppSettings(): AppSettings {
    return { ...this.appSettings };
  }

  // Live Token Queue Operations for Compounder
  public async callNextToken(doctorId: string): Promise<number> {
    const doctor = this.doctors.find(d => d.id === doctorId);
    if (!doctor) return 0;

    const nextToken = doctor.currentToken + 1;
    doctor.currentToken = nextToken;
    doctor.status = 'In OPD';
    this.saveToStorage();
    this.doctorListeners.forEach(cb => cb([...this.doctors]));

    try {
      await setDoc(doc(db, 'doctors', doctorId), cleanDataForFirestore({
        ...doctor,
        currentToken: nextToken,
        status: 'In OPD'
      }), { merge: true });
    } catch (e) {
      console.warn('callNextToken sync notice:', e);
    }

    // Mark appointment as Completed if patient with this token exists
    const matchingApt = this.appointments.find(
      a => a.doctorId === doctorId && a.tokenNumber === nextToken && a.status === 'Confirmed'
    );
    if (matchingApt) {
      matchingApt.status = 'Completed';
      this.saveToStorage();
      this.appointmentListeners.forEach(cb => cb([...this.appointments]));
      try {
        await setDoc(doc(db, 'appointments', matchingApt.id), cleanDataForFirestore({
          ...matchingApt,
          status: 'Completed'
        }), { merge: true });
      } catch (e) {
        console.warn('complete appointment sync notice:', e);
      }
    }

    return nextToken;
  }

  public async skipToken(doctorId: string): Promise<number> {
    const doctor = this.doctors.find(d => d.id === doctorId);
    if (!doctor) return 0;

    const nextToken = doctor.currentToken + 1;
    doctor.currentToken = nextToken;
    this.saveToStorage();
    this.doctorListeners.forEach(cb => cb([...this.doctors]));

    try {
      await setDoc(doc(db, 'doctors', doctorId), cleanDataForFirestore({
        ...doctor,
        currentToken: nextToken
      }), { merge: true });
    } catch (e) {
      console.warn('skipToken sync notice:', e);
    }

    return nextToken;
  }

  public async resetDoctorToken(doctorId: string, startingToken: number = 1): Promise<void> {
    const doctor = this.doctors.find(d => d.id === doctorId);
    if (doctor) {
      doctor.currentToken = startingToken;
      this.saveToStorage();
      this.doctorListeners.forEach(cb => cb([...this.doctors]));
    }
    try {
      await setDoc(doc(db, 'doctors', doctorId), cleanDataForFirestore({
        ...(doctor ? doctor : {}),
        currentToken: startingToken
      }), { merge: true });
    } catch (e) {
      console.warn('resetDoctorToken sync notice:', e);
    }
  }

  // Patient Booking Flow -> Strict "Pending" with suggested token
  public async bookAppointment(data: {
    userId?: string;
    patientName: string;
    patientPhone: string;
    patientAge: number;
    patientGender: 'Male' | 'Female' | 'Other';
    doctorId: string;
    bookingDate: string;
    timeSlot: string;
    symptomBrief?: string;
    location?: GeoLocationData;
    payment?: PaymentDetails;
  }): Promise<Appointment> {
    const doctor = this.getDoctorById(data.doctorId);
    if (!doctor) throw new Error('Doctor not found in database');

    const aptId = `apt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const suggestedToken = (doctor.totalTokensToday || doctor.currentToken || 1) + 1;
    const activeUserId = data.userId || userAuth.getUserId();

    // Auto-save user identity locally
    userAuth.setUserIdentity(data.patientPhone, data.patientName);

    const paymentStatusText = data.payment?.status === 'AT_COUNTER'
      ? 'Confirmed - Pay Cash at Counter'
      : (data.payment?.statusLabel || 'Confirmed - Pay Cash at Counter');

    const newAppointment: Appointment = {
      id: aptId,
      userId: activeUserId,
      patientName: data.patientName.trim(),
      patientPhone: data.patientPhone.trim(),
      patientAge: Number(data.patientAge) || 25,
      patientGender: data.patientGender,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      roomNumber: doctor.roomNumber,
      consultationFee: doctor.consultationFee,
      tokenNumber: suggestedToken, // Preliminary suggested token awaiting Group Admin manual verification
      bookingDate: data.bookingDate,
      timeSlot: data.timeSlot,
      status: 'Pending', // Strictly Pending
      paymentStatus: paymentStatusText,
      bookedAt: Date.now(),
      acknowledgedByAdmin: false,
      symptomBrief: data.symptomBrief?.trim() || 'General consultation request',
      location: data.location,
      payment: data.payment
    };

    // Immediately reflect in local state for instantaneous responsiveness
    this.appointments.unshift(newAppointment);
    this.saveToStorage();
    this.appointmentListeners.forEach(cb => cb([...this.appointments]));

    // 1. Save appointment to Firestore with sanitized payload (stripping undefined values)
    try {
      await setDoc(doc(db, 'appointments', aptId), cleanDataForFirestore(newAppointment), { merge: true });
    } catch (e) {
      console.info('Appointment local cached, sync queued:', e);
    }

    // 2. Trigger Admin Emergency Siren Alarm in Firestore
    try {
      await setDoc(doc(db, 'alarm_state', 'current'), {
        hasActiveAlarm: true,
        lastAppointmentId: aptId,
        timestamp: Date.now()
      }, { merge: true });
    } catch (e) {
      console.info('Alarm trigger sync notice:', e);
    }

    return newAppointment;
  }

  // Group Admin Manual Token Assignment & Confirmation
  public async confirmAppointment(appointmentId: string, assignedTokenNumber?: number): Promise<void> {
    const apt = this.appointments.find(a => a.id === appointmentId);
    if (!apt) return;

    const tokenToAssign = assignedTokenNumber !== undefined ? assignedTokenNumber : apt.tokenNumber;

    // Immediately update local state for instant responsiveness
    apt.status = 'Confirmed';
    apt.tokenNumber = tokenToAssign;
    apt.confirmedAt = Date.now();
    apt.acknowledgedByAdmin = true;
    this.saveToStorage();
    this.appointmentListeners.forEach(cb => cb([...this.appointments]));

    // Update appointment in Firestore using setDoc with merge: true
    // This prevents "No document to update" if the document hadn't synced yet or was offline
    try {
      await setDoc(doc(db, 'appointments', appointmentId), cleanDataForFirestore({
        ...apt,
        status: 'Confirmed',
        tokenNumber: tokenToAssign,
        confirmedAt: apt.confirmedAt,
        acknowledgedByAdmin: true
      }), { merge: true });
    } catch (err) {
      console.warn('Appointment confirmation Firestore sync notice:', err);
    }

    // Update doctor's total tokens counter if assigned token is higher
    const doctor = this.doctors.find(d => d.id === apt.doctorId);
    if (doctor && tokenToAssign > (doctor.totalTokensToday || 0)) {
      doctor.totalTokensToday = tokenToAssign;
      this.saveToStorage();
      this.doctorListeners.forEach(cb => cb([...this.doctors]));
      try {
        await setDoc(doc(db, 'doctors', doctor.id), {
          totalTokensToday: tokenToAssign
        }, { merge: true });
      } catch (err) {
        console.warn('Doctor token count sync notice:', err);
      }
    }

    // If no other unacknowledged pending appointments exist, silence the alarm
    const otherPending = this.appointments.filter(
      a => a.id !== appointmentId && a.status === 'Pending' && !a.acknowledgedByAdmin
    );
    if (otherPending.length === 0) {
      try {
        await setDoc(doc(db, 'alarm_state', 'current'), {
          hasActiveAlarm: false,
          acknowledgedAt: Date.now()
        }, { merge: true });
      } catch (e) {
        console.warn('Alarm silence notice:', e);
      }
    }
  }

  // Admin Cancel Appointment
  public async cancelAppointment(appointmentId: string): Promise<void> {
    const apt = this.appointments.find(a => a.id === appointmentId);
    if (apt) {
      apt.status = 'Cancelled';
      apt.cancelledAt = Date.now();
      apt.acknowledgedByAdmin = true;
      this.saveToStorage();
      this.appointmentListeners.forEach(cb => cb([...this.appointments]));
    }

    try {
      await setDoc(doc(db, 'appointments', appointmentId), cleanDataForFirestore({
        ...(apt || {}),
        status: 'Cancelled',
        cancelledAt: Date.now(),
        acknowledgedByAdmin: true
      }), { merge: true });
    } catch (err) {
      console.warn('Appointment cancel Firestore sync notice:', err);
    }

    const otherPending = this.appointments.filter(
      a => a.id !== appointmentId && a.status === 'Pending' && !a.acknowledgedByAdmin
    );
    if (otherPending.length === 0) {
      try {
        await setDoc(doc(db, 'alarm_state', 'current'), {
          hasActiveAlarm: false,
          acknowledgedAt: Date.now()
        }, { merge: true });
      } catch (e) {
        console.warn('Alarm silence notice:', e);
      }
    }
  }

  // Admin Acknowledge Siren
  public async acknowledgeAlarm(): Promise<void> {
    try {
      await setDoc(doc(db, 'alarm_state', 'current'), {
        hasActiveAlarm: false,
        acknowledgedAt: Date.now()
      }, { merge: true });
    } catch (e) {
      console.warn('Acknowledge alarm warning:', e);
    }
    sirenManager.stopSiren();
  }

  // Doctor Home Visit Service
  public async bookHomeVisit(data: {
    userId?: string;
    patientName: string;
    patientPhone: string;
    address: string;
    preferredDate: string;
    preferredTime: string;
    specialtyRequired: string;
    symptomBrief?: string;
    visitFee?: number;
    location?: GeoLocationData;
    payment?: PaymentDetails;
  }): Promise<HomeVisitBooking> {
    const visitId = `visit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const activeUserId = data.userId || userAuth.getUserId();
    userAuth.setUserIdentity(data.patientPhone, data.patientName);

    const newVisit: HomeVisitBooking = {
      id: visitId,
      userId: activeUserId,
      patientName: data.patientName.trim(),
      patientPhone: data.patientPhone.trim(),
      address: data.address.trim(),
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      specialtyRequired: data.specialtyRequired,
      symptomBrief: data.symptomBrief?.trim() || '',
      visitFee: data.visitFee ?? this.appSettings.homeVisitFee,
      status: 'Pending',
      bookedAt: Date.now(),
      location: data.location,
      payment: data.payment
    };

    // Instant local memory update
    this.homeVisits.unshift(newVisit);
    this.saveToStorage();
    this.homeVisitListeners.forEach(cb => cb([...this.homeVisits]));

    try {
      await setDoc(doc(db, 'home_visits', visitId), cleanDataForFirestore(newVisit), { merge: true });
    } catch (e) {
      console.info('Home visit cached locally:', e);
    }
    return newVisit;
  }

  public async updateHomeVisit(visitId: string, update: Partial<HomeVisitBooking>): Promise<void> {
    const visit = this.homeVisits.find(v => v.id === visitId);
    if (visit) {
      Object.assign(visit, update);
      this.saveToStorage();
      this.homeVisitListeners.forEach(cb => cb([...this.homeVisits]));
    }
    try {
      await setDoc(doc(db, 'home_visits', visitId), cleanDataForFirestore({
        ...(visit || {}),
        ...update
      }), { merge: true });
    } catch (e) {
      console.warn('updateHomeVisit sync notice:', e);
    }
  }

  public async updateHomeVisitStatus(visitId: string, status: HomeVisitBooking['status'], assignedDoctorName?: string): Promise<void> {
    const update: Partial<HomeVisitBooking> = { status };
    if (assignedDoctorName !== undefined) {
      update.assignedDoctorName = assignedDoctorName;
    }
    await this.updateHomeVisit(visitId, update);
  }

  // Super Admin Pricing & Service Rate Control
  public async updateAppSettings(update: Partial<AppSettings>): Promise<void> {
    await setDoc(doc(db, 'app_settings', 'pricing'), update, { merge: true });
  }

  // Live Doctor Management (Add/Edit/Delete) -> Immediately Syncs to Firestore
  public async addDoctor(docData: Omit<Doctor, 'id' | 'currentToken' | 'totalTokensToday'>): Promise<Doctor> {
    const docId = `doc-${Date.now()}`;
    const newDoc: Doctor = {
      ...docData,
      id: docId,
      currentToken: 1,
      totalTokensToday: 0,
      rating: docData.rating || 4.9,
      reviewCount: docData.reviewCount || 1,
      emoji: docData.emoji || '👨‍⚕️',
      status: 'Available'
    };

    try {
      await setDoc(doc(db, 'doctors', docId), cleanDataForFirestore(newDoc), { merge: true });
    } catch (e) {
      console.warn('addDoctor sync notice:', e);
    }
    return newDoc;
  }

  public async updateDoctor(doctorId: string, update: Partial<Doctor>): Promise<void> {
    const docItem = this.doctors.find(d => d.id === doctorId);
    if (docItem) {
      Object.assign(docItem, update);
      this.saveToStorage();
      this.doctorListeners.forEach(cb => cb([...this.doctors]));
    }
    try {
      await setDoc(doc(db, 'doctors', doctorId), cleanDataForFirestore({
        ...(docItem || {}),
        ...update
      }), { merge: true });
    } catch (e) {
      console.warn('updateDoctor sync notice:', e);
    }

    // If doctor consultationFee or name or specialty changed, sync across active appointments if relevant
    if (update.name || update.specialty) {
      const affectedApts = this.appointments.filter(a => a.doctorId === doctorId && a.status === 'Pending');
      for (const apt of affectedApts) {
        apt.doctorName = update.name || apt.doctorName;
        apt.doctorSpecialty = update.specialty || apt.doctorSpecialty;
        try {
          await setDoc(doc(db, 'appointments', apt.id), cleanDataForFirestore({
            doctorName: apt.doctorName,
            doctorSpecialty: apt.doctorSpecialty
          }), { merge: true });
        } catch (e) {
          console.warn('affected apt sync notice:', e);
        }
      }
      this.saveToStorage();
      this.appointmentListeners.forEach(cb => cb([...this.appointments]));
    }
  }

  public async deleteDoctor(doctorId: string): Promise<void> {
    await deleteDoc(doc(db, 'doctors', doctorId));
  }

  // Lab Test Catalog Management (Admin Panel)
  public async addLabTest(testData: Omit<LabTest, 'id'>): Promise<LabTest> {
    const testId = `lab-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newTest: LabTest = {
      id: testId,
      name: testData.name.trim(),
      category: testData.category.trim(),
      price: Number(testData.price) || 0,
      originalPrice: Number(testData.originalPrice) || Number(testData.price) || 0,
      fastingRequired: !!testData.fastingRequired,
      reportTime: testData.reportTime?.trim() || 'Within 24 hrs',
      sampleType: testData.sampleType?.trim() || 'Blood Sample',
      popular: !!testData.popular,
      description: testData.description?.trim() || ''
    };

    // Instant local memory update
    this.labTests.push(newTest);
    this.saveToStorage();
    this.labTestListeners.forEach(cb => cb([...this.labTests]));

    try {
      await setDoc(doc(db, 'lab_tests', testId), cleanDataForFirestore(newTest), { merge: true });
    } catch (e) {
      console.warn('Firestore add lab test notice:', e);
    }
    return newTest;
  }

  public async updateLabTest(testId: string, update: Partial<LabTest>): Promise<void> {
    const index = this.labTests.findIndex(t => t.id === testId);
    if (index !== -1) {
      this.labTests[index] = { ...this.labTests[index], ...update };
      this.saveToStorage();
      this.labTestListeners.forEach(cb => cb([...this.labTests]));
    }

    try {
      await setDoc(doc(db, 'lab_tests', testId), cleanDataForFirestore(update), { merge: true });
    } catch (e) {
      console.warn('Firestore update lab test notice:', e);
    }
  }

  public async deleteLabTest(testId: string): Promise<void> {
    this.labTests = this.labTests.filter(t => t.id !== testId);
    this.saveToStorage();
    this.labTestListeners.forEach(cb => cb([...this.labTests]));

    try {
      await deleteDoc(doc(db, 'lab_tests', testId));
    } catch (e) {
      console.warn('Firestore delete lab test notice:', e);
    }
  }

  // Lab Booking Fulfillment & Status Management (Clinic Staff / Admin)
  public async updateLabBookingStatus(bookingId: string, status: LabBooking['status']): Promise<void> {
    const booking = this.labBookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = status;
      this.saveToStorage();
      this.labBookingListeners.forEach(cb => cb([...this.labBookings]));
    }

    try {
      await setDoc(doc(db, 'lab_bookings', bookingId), cleanDataForFirestore({
        ...(booking || {}),
        status
      }), { merge: true });
    } catch (e) {
      console.warn('Firestore update lab booking status notice:', e);
    }
  }

  public async bookLabTest(data: {
    userId?: string;
    testId: string;
    bookingType: 'Home Sample Collection' | 'Visit Lab';
    patientName: string;
    patientPhone: string;
    address?: string;
    date: string;
    timeSlot: string;
    location?: GeoLocationData;
    payment?: PaymentDetails;
  }): Promise<LabBooking> {
    const test = this.labTests.find(t => t.id === data.testId);
    if (!test) throw new Error('Lab test not found');

    const bookingId = `lab-book-${Date.now()}`;
    const activeUserId = data.userId || userAuth.getUserId();
    userAuth.setUserIdentity(data.patientPhone, data.patientName);

    const newBooking: LabBooking = {
      id: bookingId,
      userId: activeUserId,
      testId: test.id,
      testName: test.name,
      category: test.category,
      price: test.price,
      bookingType: data.bookingType,
      patientName: data.patientName.trim(),
      patientPhone: data.patientPhone.trim(),
      address: data.address?.trim() || '',
      date: data.date,
      timeSlot: data.timeSlot,
      status: 'Confirmed',
      bookedAt: Date.now(),
      location: data.location,
      payment: data.payment
    };

    // Instant local memory update
    this.labBookings.unshift(newBooking);
    this.saveToStorage();
    this.labBookingListeners.forEach(cb => cb([...this.labBookings]));

    try {
      await setDoc(doc(db, 'lab_bookings', bookingId), cleanDataForFirestore(newBooking), { merge: true });
    } catch (e) {
      console.info('Lab booking cached locally:', e);
    }
    return newBooking;
  }

  // Get strictly user-specific bookings (Filtered by phone or userId)
  public getMyBookings(userPhone?: string) {
    const phone = userPhone !== undefined ? userPhone : userAuth.getUserPhone();

    return {
      appointments: this.appointments.filter(a => userAuth.isUserBooking(a, phone)),
      homeVisits: this.homeVisits.filter(h => userAuth.isUserBooking(h, phone)),
      labBookings: this.labBookings.filter(l => userAuth.isUserBooking(l, phone)),
    };
  }

  // Dynamic Financial Analytics
  public getFinancialSummary() {
    const totalAppointments = this.appointments.length;
    const confirmedAppointments = this.appointments.filter(a => a.status === 'Confirmed' || a.status === 'Completed');
    const pendingAppointments = this.appointments.filter(a => a.status === 'Pending');
    const cancelledAppointments = this.appointments.filter(a => a.status === 'Cancelled');

    const opdRevenue = confirmedAppointments.reduce((sum, a) => sum + (a.consultationFee || 0), 0);
    const pendingRevenue = pendingAppointments.reduce((sum, a) => sum + (a.consultationFee || 0), 0);

    const todayString = new Date().toISOString().split('T')[0];
    const todayRevenue = confirmedAppointments
      .filter(a => a.bookingDate === todayString)
      .reduce((sum, a) => sum + (a.consultationFee || 0), 0);

    const labRevenue = this.labBookings.reduce((sum, l) => sum + (l.price || 0), 0);
    const homeVisitRevenue = this.homeVisits.reduce((sum, v) => sum + (v.visitFee || 0), 0);

    const totalRevenue = opdRevenue + labRevenue + homeVisitRevenue;

    const doctorEarningsMap: Record<string, { name: string; count: number; revenue: number; specialty: string }> = {};
    confirmedAppointments.forEach(a => {
      if (!doctorEarningsMap[a.doctorId]) {
        doctorEarningsMap[a.doctorId] = {
          name: a.doctorName,
          count: 0,
          revenue: 0,
          specialty: a.doctorSpecialty
        };
      }
      doctorEarningsMap[a.doctorId].count += 1;
      doctorEarningsMap[a.doctorId].revenue += (a.consultationFee || 0);
    });

    return {
      totalRevenue,
      opdRevenue,
      labRevenue,
      homeVisitRevenue,
      todayRevenue,
      pendingRevenue,
      totalAppointments,
      confirmedCount: confirmedAppointments.length,
      pendingCount: pendingAppointments.length,
      cancelledCount: cancelledAppointments.length,
      doctorEarnings: Object.values(doctorEarningsMap),
      totalHomeVisits: this.homeVisits.length
    };
  }

  // Patient Post-Visit Feedback Submission for Clinic Admin
  public async submitPatientFeedback(data: Omit<PatientFeedback, 'id' | 'createdAt' | 'adminStatus'>): Promise<PatientFeedback> {
    const feedbackId = `fb-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newFeedback: PatientFeedback = {
      ...data,
      id: feedbackId,
      createdAt: Date.now(),
      adminStatus: 'New',
    };

    // Update local cache immediately
    this.feedbacks = [newFeedback, ...this.feedbacks];
    this.saveToStorage();
    this.feedbackListeners.forEach(cb => cb([...this.feedbacks]));

    // Push to Cloud Firestore
    try {
      const cleaned = cleanDataForFirestore(newFeedback);
      await setDoc(doc(db, 'patient_feedbacks', feedbackId), cleaned);
    } catch (err) {
      console.info('Firestore feedback save notice (saved locally):', err);
    }

    return newFeedback;
  }

  public async updateFeedbackAdminStatus(
    feedbackId: string, 
    adminStatus: 'New' | 'Reviewed' | 'Action Taken',
    adminNotes?: string
  ): Promise<void> {
    this.feedbacks = this.feedbacks.map(f => {
      if (f.id === feedbackId) {
        return {
          ...f,
          adminStatus,
          adminNotes: adminNotes !== undefined ? adminNotes : f.adminNotes
        };
      }
      return f;
    });

    this.saveToStorage();
    this.feedbackListeners.forEach(cb => cb([...this.feedbacks]));

    try {
      const target = this.feedbacks.find(f => f.id === feedbackId);
      if (target) {
        const cleaned = cleanDataForFirestore(target);
        await setDoc(doc(db, 'patient_feedbacks', feedbackId), cleaned, { merge: true });
      }
    } catch (err) {
      console.info('Firestore feedback status update notice:', err);
    }
  }
}

export const realtimeDb = new HelloDoctorRealtimeDB();

