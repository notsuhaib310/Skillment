import { Assessment, Candidate, Question, AssessmentAnalytics } from '@prisma/client';

export type AssessmentType = 'mcq' | 'coding' | 'proctored' | 'hybrid';
export type QuestionType = 'multiple_choice' | 'coding' | 'text';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AssessmentStatus = 'draft' | 'live' | 'archived';
export type CandidateStatus = 'invited' | 'started' | 'submitted' | 'evaluated';

export interface CreateAssessmentInput {
  title: string;
  description?: string;
  type: AssessmentType;
  duration: number;
  totalMarks: number;
  totalQuestions: number;
  attemptLimit?: number;
  showResults?: boolean;
  enableProctoring?: boolean;
  randomizeQuestions?: boolean;
  tags?: string[];
  createdById: string;
}

export interface UpdateAssessmentInput extends Partial<CreateAssessmentInput> {
  status?: AssessmentStatus;
}

export interface CreateQuestionInput {
  question: string;
  type: QuestionType;
  options?: any[];
  correctAnswer?: any;
  marks: number;
  order: number;
  hints?: string[];
  explanation?: string;
  difficulty?: Difficulty;
  tags?: string[];
}

export interface UpdateQuestionInput extends Partial<CreateQuestionInput> {}

export interface CreateCandidateInput {
  name: string;
  email: string;
  assessmentId: string;
  userId?: string;
}

export interface UpdateCandidateInput {
  status?: CandidateStatus;
  score?: number;
  timeSpent?: number;
  answers?: any;
  startedAt?: Date;
  submittedAt?: Date;
}

export interface AssessmentWithRelations extends Assessment {
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  questions?: Question[];
  candidates?: Candidate[];
  analytics?: AssessmentAnalytics | null;
}

export interface AssessmentListFilters {
  search?: string;
  status?: AssessmentStatus;
  type?: AssessmentType;
  createdById?: string;
  page?: number;
  limit?: number;
}

export interface AssessmentStats {
  totalAssessments: number;
  liveAssessments: number;
  draftAssessments: number;
  totalCandidates: number;
  averageScore: number;
}
