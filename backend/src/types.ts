export interface Scholarship {
  id: string;
  name: string;
  type: 'Medical' | 'Engineering' | 'Degree' | 'Diploma' | 'ITI';
  description: string;
  amount: number;
  eligibility: {
    minimumMarks: number;
    maximumIncome: number;
    ageLimit?: number;
    courseYear?: string;
  };
  benefits: string[];
  deadline: string;
  documentsRequired: string[];
  icon: string;
}

export interface Application {
  id: string;
  scholarshipId: string;
  userId?: number;
  studentName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address?: string;
  nationality?: string;
  category: string;
  marks: number;
  gpa?: number;
  familyIncome: number;
  course: string;
  degree?: string;
  yearOfStudy?: string;
  fieldOfStudy?: string;
  graduationDate?: string;
  institution: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
  reviewerNotes?: string;
  installmentPlan?: boolean;
  installmentAmount?: number;
  installmentDuration?: number;
  scholarshipAmount?: number;
}
