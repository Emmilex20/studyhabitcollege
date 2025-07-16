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