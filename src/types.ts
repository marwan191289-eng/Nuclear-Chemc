export type Role = "admin" | "instructor" | "student" | "parent";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  xp: number;
  level: string;
  badges: string[];
  enrolledCourseIds: string[];
  attendanceRate: number;
  avgQuizScore: number;
}

export interface Course {
  id: string;
  level: string;
  tag: string;
  tagTone: "primary" | "accent";
  title: string;
  titleEn: string;
  desc: string;
  descEn: string;
  duration: string;
  durationEn: string;
  mode: string;
  modeEn?: string;
  price: number;
  lessonsCount: number;
  image: string;
  topics: string[];
  topicsEn?: string[];
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  posterUrl?: string;
  simulationType?: "nucleus" | "decay" | "halflife" | "fission" | "reactor_core" | "dose" | "shielding";
  summary: string;
  keyFormulas: string[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface CountryCode {
  id: string;
  name: string;
  nameEn: string;
  code: string;
  flag: string;
  sample: string;
}

export interface StudyPlan {
  planTitle: string;
  overview: string;
  weeklyRoadmap: {
    weekNumber: number;
    title: string;
    objectives: string[];
    suggestedHours: number;
    spacedRepetitionCards: string[];
  }[];
  recommendedCourses: string[];
  practicalChecklist: string[];
  instructorAdvice: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  dueDays: number;
  lastReviewed?: string;
}

export interface LiveBooking {
  id: string;
  studentName: string;
  date: string;
  timeSlot: string;
  topic: string;
  meetingLink: string;
  status: "confirmed" | "completed" | "cancelled";
}

export interface ChatMessage {
  id: string;
  sender: "student" | "instructor" | "assistant";
  senderName: string;
  text: string;
  timestamp: string;
  fileAttachment?: {
    name: string;
    size: string;
    type: string;
  };
}
