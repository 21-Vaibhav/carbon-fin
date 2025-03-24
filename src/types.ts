import { Seniority } from "@prisma/client";

export interface CreateStudentDTO {
  name: string;
  dateOfBirth: string;
  aadharNumber: string;
}

export interface UpdateStudentDTO {
  name?: string;
  dateOfBirth?: string;
  aadharNumber?: string;
}

export interface CreateProfessorDTO {
  name: string;
  seniority: Seniority;
  aadharNumber: string;
}

export interface UpdateProfessorDTO {
  name?: string;
  seniority?: Seniority;
  aadharNumber?: string;
}

export interface AssignProctorshipDTO {
  studentId: string;
}

export interface CreateLibraryMembershipDTO {
  issueDate: string;
  expiryDate: string;
}

export interface UpdateLibraryMembershipDTO {
  issueDate?: string;
  expiryDate?: string;
}
