import { Assessment, Candidate, Question, AssessmentAnalytics } from '@prisma/client';

export type AssessmentType = 'mcq' | 'coding' | 'proctored' | 'hybrid';
export type QuestionType = 'multiple_choice' | 'coding' | 'text';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AssessmentStatus = 'draft' | 'live' | 'archived';
export type CandidateStatus = 'invited' | 'started' | 'submitted' | 'evaluated';

// Enhanced Question Types
export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  explanation?: string;
}

export interface StarterCode {
  [language: string]: string;
}

export interface MCQQuestionData {
  question: string;
  options: MCQOption[];
  explanation?: string;
  multipleCorrect: boolean;
}

export interface CodingQuestionData {
  title: string;
  description: string;
  timeLimit: number;
  memoryLimit: number;
  languages: string[];
  starterCode: StarterCode;
  testCases: TestCase[];
}

// AI Enhancement Data
export interface AIGenerationMetadata {
  isAIGenerated: boolean;
  prompt?: string;
  topic?: string;
  generationTime?: Date;
  enhancementType?: 'explanation' | 'difficulty' | 'testcases' | 'complete';
  model?: string;
}

// Comprehensive Assessment Input
export interface CreateAssessmentInput {
  title: string;
  description?: string;
  instructions?: string;
  type: AssessmentType;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  totalQuestions: number;
  attemptLimit?: number;
  showResults?: boolean;
  showCorrectAnswers?: boolean;
  enableProctoring?: boolean;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  allowBackNavigation?: boolean;
  timeWarnings?: boolean;
  autoSubmit?: boolean;
  warningTimes?: string;
  // Proctoring Configuration
  webcamMonitoring?: boolean;
  screenRecording?: boolean;
  tabSwitchDetection?: boolean;
  copyPasteDetection?: boolean;
  rightClickDisable?: boolean;
  fullscreenMode?: boolean;
  idVerification?: boolean;
  environmentCheck?: boolean;
  suspiciousActivityThreshold?: number;
  warningBeforeFlagging?: boolean;
  videoQuality?: string;
  recordingFrequency?: string;
  dataRetention?: string;
  autoDeleteAfter?: string;
  tags?: string[];
  createdById: string;
  // Questions data
  questions?: CreateQuestionInput[];
}

export interface UpdateAssessmentInput extends Partial<CreateAssessmentInput> {
  status?: AssessmentStatus;
}

// Enhanced Question Input
export interface CreateQuestionInput {
  question: string;
  type: QuestionType;
  marks: number;
  order: number;
  hints?: string[];
  explanation?: string;
  difficulty?: Difficulty;
  tags?: string[];
  // MCQ specific data
  mcqData?: MCQQuestionData;
  // Coding specific data  
  codingData?: CodingQuestionData;
  // AI metadata
  aiMetadata?: AIGenerationMetadata;
  // Generic options/correctAnswer for backward compatibility
  options?: any[];
  correctAnswer?: any;
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
  questions?: QuestionWithEnhancedData[];
  candidates?: Candidate[];
  analytics?: AssessmentAnalytics | null;
}

export interface QuestionWithEnhancedData extends Question {
  mcqData?: MCQQuestionData;
  codingData?: CodingQuestionData;
  aiMetadata?: AIGenerationMetadata;
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

// Candidate Panel Types
export interface CandidateAssessmentView {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  duration: number;
  totalQuestions: number;
  allowBackNavigation: boolean;
  timeWarnings: boolean;
  showResults: boolean;
  showCorrectAnswers: boolean;
  questions: CandidateQuestionView[];
}

export interface CandidateQuestionView {
  id: string;
  question: string;
  type: QuestionType;
  marks: number;
  order: number;
  hints?: string[];
  // MCQ specific
  options?: Array<{ id: string; text: string }>;
  multipleCorrect?: boolean;
  // Coding specific
  languages?: string[];
  starterCode?: StarterCode;
  timeLimit?: number;
  memoryLimit?: number;
  publicTestCases?: Array<{ input: string; expectedOutput: string; explanation?: string }>;
}

export interface CandidateAnswerSubmission {
  questionId: string;
  answer: any; // For MCQ: selected option IDs, For coding: { language: string, code: string }
  timeSpent: number;
  attemptCount?: number;
}

export interface AssessmentSubmission {
  assessmentId: string;
  candidateId: string;
  answers: CandidateAnswerSubmission[];
  totalTimeSpent: number;
  submittedAt: Date;
}
