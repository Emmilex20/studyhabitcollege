// src/types/index.ts (or create a new types.ts if you prefer)
export type FacultyMember = {
  id: string;
  name: string;
  title: string;
  department: string;
  bio: string;
  imageUrl: string;
  email?: string; // Optional email
  phone?: string; // Optional phone
  // Add more fields as needed, e.g., research interests, publications
};

// src/types/index.ts

export interface UserInfo {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  token: string;
}

export interface AdminDashboardData {
  totalUsers: number;
  activeCourses: number;
  enrolledStudents: number;
}

export interface TeacherDashboardData {
  myActiveCourses: number;
  studentsTaught: number;
}

export interface StudentDashboardData {
  enrolledCourses: number;
  gpa: number;
  letterGrade: string;
  upcomingDeadlines: { title: string; course: string; dueDate: string }[];
}

// The definitive Course interface
export interface Course {
  _id: string;
  name: string;
  code: string;
  description?: string;
  yearLevel: string[];
  academicYear?: string;
  term?: string[]; // <-- Make 'term' OPTIONAL here if it can be undefined from API
  teacher?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string; // Assuming this is part of the Course object
}