import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import type {
  CreateAssessmentInput,
  UpdateAssessmentInput,
  AssessmentListFilters,
  AssessmentStatus,
  AssessmentStats,
  AssessmentType,
  CreateQuestionInput,
  MCQQuestionData,
  CodingQuestionData,
  AIGenerationMetadata,
} from '../types/assessment';

const prisma = new PrismaClient();

// Validation functions
const validateAssessmentData = (data: CreateAssessmentInput) => {
  const errors = [];

  if (!data.title?.trim()) errors.push('Title is required');
  if (!data.type) errors.push('Assessment type is required');
  if (!data.duration || data.duration < 1) errors.push('Duration must be at least 1 minute');
  if (!data.totalMarks || data.totalMarks < 1) errors.push('Total marks must be at least 1');
  if (data.passingMarks && data.passingMarks > data.totalMarks) {
    errors.push('Passing marks cannot exceed total marks');
  }
  if (data.attemptLimit && data.attemptLimit < 1) errors.push('Attempt limit must be at least 1');

  return errors;
};

const validateQuestionData = (question: CreateQuestionInput, index: number) => {
  const errors = [];
  const prefix = `Question ${index + 1}:`;

  if (!question.question?.trim()) errors.push(`${prefix} Question text is required`);
  if (!question.type) errors.push(`${prefix} Question type is required`);
  if (!question.marks || question.marks < 1) errors.push(`${prefix} Marks must be at least 1`);

  // MCQ specific validation
  if (question.type === 'multiple_choice' && question.mcqData) {
    const mcqData = question.mcqData as MCQQuestionData;
    if (!mcqData.options || mcqData.options.length < 2) {
      errors.push(`${prefix} MCQ must have at least 2 options`);
    } else {
      const hasCorrectAnswer = mcqData.options.some(opt => opt.isCorrect);
      if (!hasCorrectAnswer) {
        errors.push(`${prefix} MCQ must have at least one correct answer`);
      }
      
      // Check for empty options
      const emptyOptions = mcqData.options.filter(opt => !opt.text?.trim());
      if (emptyOptions.length > 0) {
        errors.push(`${prefix} All MCQ options must have text`);
      }
    }
  }

  // Coding specific validation
  if (question.type === 'coding' && question.codingData) {
    const codingData = question.codingData as CodingQuestionData;
    if (!codingData.title?.trim()) errors.push(`${prefix} Coding question title is required`);
    if (!codingData.description?.trim()) errors.push(`${prefix} Coding question description is required`);
    if (!codingData.languages || codingData.languages.length === 0) {
      errors.push(`${prefix} At least one programming language must be selected`);
    }
    if (!codingData.testCases || codingData.testCases.length === 0) {
      errors.push(`${prefix} At least one test case is required`);
    } else {
      // Validate test cases
      codingData.testCases.forEach((testCase, tcIndex) => {
        if (!testCase.input?.trim() && !testCase.expectedOutput?.trim()) {
          errors.push(`${prefix} Test case ${tcIndex + 1} must have input and expected output`);
        }
      });
    }
  }

  return errors;
};

const processQuestionData = (question: CreateQuestionInput) => {
  console.log(`Processing question: ${question.question?.substring(0, 50)}...`);
  console.log(`Question type: ${question.type}`);
  console.log(`Has mcqData: ${!!question.mcqData}`);
  console.log(`Has options: ${!!question.options}`);
  
  const processedQuestion: any = {
    question: question.question,
    type: question.type,
    marks: question.marks,
    order: question.order,
    hints: question.hints || [],
    explanation: question.explanation || '',
    difficulty: question.difficulty || 'medium',
    tags: question.tags || [],
  };

  // Process MCQ data - handle both mcqData and legacy options
  if (question.type === 'multiple_choice') {
    if (question.mcqData && question.mcqData.options) {
      // New format with mcqData
      console.log('Using mcqData format with options:', question.mcqData.options.length);
      processedQuestion.mcqData = question.mcqData;
      processedQuestion.options = question.mcqData.options;
      processedQuestion.correctAnswer = question.mcqData.options
        .filter(opt => opt.isCorrect)
        .map(opt => opt.id);
    } else if (question.options && Array.isArray(question.options)) {
      // Legacy format or fallback
      console.log('Using legacy options format with options:', question.options.length);
      const mcqData = {
        question: question.question || '',
        options: question.options,
        explanation: question.explanation || '',
        multipleCorrect: false
      };
      processedQuestion.mcqData = mcqData;
      processedQuestion.options = question.options;
      processedQuestion.correctAnswer = question.options
        .filter((opt: any) => opt.isCorrect)
        .map((opt: any) => opt.id);
    } else {
      // No options found - this is the problem!
      console.error('❌ MCQ question has no options data!');
      console.error('Question data:', JSON.stringify(question, null, 2));
      
      // Create default options to prevent breaking
      const defaultOptions = [
        { id: 'opt1', text: 'Option A', isCorrect: true },
        { id: 'opt2', text: 'Option B', isCorrect: false },
        { id: 'opt3', text: 'Option C', isCorrect: false },
        { id: 'opt4', text: 'Option D', isCorrect: false }
      ];
      
      const mcqData = {
        question: question.question || '',
        options: defaultOptions,
        explanation: 'Default options - please update this question',
        multipleCorrect: false
      };
      
      processedQuestion.mcqData = mcqData;
      processedQuestion.options = defaultOptions;
      processedQuestion.correctAnswer = ['opt1'];
      
      console.log('⚠️ Created default options for MCQ question');
    }
  }

  // Process coding data
  if (question.type === 'coding' && question.codingData) {
    processedQuestion.codingData = question.codingData;
    processedQuestion.question = question.codingData.title; // Use title as question text for coding
  }

  // Process AI metadata
  if (question.aiMetadata) {
    processedQuestion.aiMetadata = question.aiMetadata;
  }

  console.log(`Final processed question - Type: ${processedQuestion.type}, Has mcqData: ${!!processedQuestion.mcqData}, Has options: ${!!processedQuestion.options}`);
  
  return processedQuestion;
};

// Helper function to build where clause for assessment listing
const buildAssessmentWhere = (filters: AssessmentListFilters) => {
  const where: any = {};

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { tags: { hasSome: [filters.search] } },
    ];
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.createdById) {
    where.createdById = filters.createdById;
  }

  return where;
};

export const createAssessment = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { questions = [], ...assessmentData } = req.body;

    // Authentication check
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required to create assessment' });
    }
    if (!req.user.orgId) {
      return res.status(400).json({ error: 'User must belong to an organization to create an assessment' });
    }

    // Validate assessment data
    const assessmentErrors = validateAssessmentData(assessmentData);
    if (assessmentErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: assessmentErrors 
      });
    }

    // Validate questions data
    const questionErrors = [];
    questions.forEach((question: CreateQuestionInput, index: number) => {
      const errors = validateQuestionData(question, index);
      questionErrors.push(...errors);
    });

    if (questionErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Question validation failed', 
        details: questionErrors 
      });
    }

    const creatorId = req.user.id;

    // Create assessment with enhanced data
    const assessment = await prisma.assessment.create({
      data: {
        title: assessmentData.title,
        description: assessmentData.description || '',
        instructions: assessmentData.instructions || '',
        type: assessmentData.type,
        duration: assessmentData.duration,
        totalMarks: assessmentData.totalMarks,
        passingMarks: assessmentData.passingMarks || 60,
        totalQuestions: questions.length,
        attemptLimit: assessmentData.attemptLimit || 1,
        showResults: assessmentData.showResults ?? true,
        showCorrectAnswers: assessmentData.showCorrectAnswers ?? false,
        enableProctoring: assessmentData.enableProctoring || false,
        randomizeQuestions: assessmentData.randomizeQuestions || false,
        randomizeOptions: assessmentData.randomizeOptions || false,
        allowBackNavigation: assessmentData.allowBackNavigation ?? true,
        timeWarnings: assessmentData.timeWarnings ?? true,
        autoSubmit: assessmentData.autoSubmit ?? true,
        warningTimes: assessmentData.warningTimes,
        // Proctoring settings
        webcamMonitoring: assessmentData.webcamMonitoring || false,
        screenRecording: assessmentData.screenRecording || false,
        tabSwitchDetection: assessmentData.tabSwitchDetection || false,
        copyPasteDetection: assessmentData.copyPasteDetection || false,
        rightClickDisable: assessmentData.rightClickDisable || false,
        fullscreenMode: assessmentData.fullscreenMode || false,
        idVerification: assessmentData.idVerification || false,
        environmentCheck: assessmentData.environmentCheck || false,
        suspiciousActivityThreshold: assessmentData.suspiciousActivityThreshold,
        warningBeforeFlagging: assessmentData.warningBeforeFlagging ?? true,
        videoQuality: assessmentData.videoQuality,
        recordingFrequency: assessmentData.recordingFrequency,
        dataRetention: assessmentData.dataRetention,
        autoDeleteAfter: assessmentData.autoDeleteAfter,
        tags: assessmentData.tags || [],
        status: 'draft',
        createdBy: { connect: { id: creatorId } },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Bulk create questions with enhanced data
    let createdQuestions = [];
    if (questions.length > 0) {
      createdQuestions = await Promise.all(
        questions.map(async (q: CreateQuestionInput, idx: number) => {
          const processedQuestion = processQuestionData(q);
          return await prisma.question.create({
            data: {
              ...processedQuestion,
              assessmentId: assessment.id,
              order: q.order ?? idx + 1,
            },
          });
        })
      );
    }

    // Create analytics entry
    await prisma.assessmentAnalytics.create({
      data: {
        assessmentId: assessment.id,
        totalCandidates: 0,
        completedCandidates: 0,
        averageScore: 0,
        completionRate: 0,
      },
    });

    console.log('Assessment created successfully:', assessment.id);
    
    return res.status(201).json({ 
      ...assessment, 
      questions: createdQuestions,
      message: 'Assessment created successfully'
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return res.status(500).json({ 
      error: 'Failed to create assessment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAssessmentById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const assessment = await prisma.assessment.findFirst({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        questions: {
          orderBy: { order: 'asc' }
        },
        analytics: true,
        candidates: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            score: true,
            timeSpent: true,
            submittedAt: true,
            startedAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            candidates: true,
          },
        },
      },
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    return res.json(assessment);
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return res.status(500).json({ error: 'Failed to fetch assessment' });
  }
};

export const getAssessments = async (req: Request, res: Response) => {
  try {
    // Get organization ID from authenticated user (optional)
    const orgId = req.orgId;
    console.log('getAssessments orgId:', orgId);
    
    // Build where clause for organization filtering
    let where = buildAssessmentWhere({
      search: req.query.search as string,
      status: req.query.status as AssessmentStatus,
      type: req.query.type as AssessmentType,
    });
    
    if (orgId) {
      where = {
        ...where,
        createdBy: { orgId },
      };
    }
    
    console.log('getAssessments where:', JSON.stringify(where));
    
    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            orgId: true,
          },
        },
        questions: {
          select: {
            id: true,
            type: true,
            marks: true,
            difficulty: true,
          }
        },
        analytics: true,
        _count: {
          select: {
            candidates: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    console.log('getAssessments found:', assessments.length);
    
    return res.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return res.status(500).json({ error: 'Failed to fetch assessments' });
  }
};

export const updateAssessment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { questions, ...data }: UpdateAssessmentInput & { questions?: CreateQuestionInput[] } = req.body;

    // Get organization ID from authenticated user
    const orgId = req.orgId;
    if (!orgId) {
      return res.status(401).json({ error: 'Organization access required' });
    }

    // First check if assessment exists and belongs to user's organization
    const existingAssessment = await prisma.assessment.findFirst({
      where: { 
        id,
        createdBy: {
          orgId: orgId
        }
      }
    });

    if (!existingAssessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Validate data if provided
    if (data.title || data.type || data.duration || data.totalMarks) {
      const validationData = { ...existingAssessment, ...data } as CreateAssessmentInput;
      const assessmentErrors = validateAssessmentData(validationData);
      
      if (assessmentErrors.length > 0) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: assessmentErrors 
        });
      }
    }

    // Update assessment
    const assessment = await prisma.assessment.update({
      where: { id },
      data: {
        ...data,
        totalQuestions: questions ? questions.length : undefined,
        updatedAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Update questions if provided
    if (questions) {
      // Validate questions
      const questionErrors = [];
      questions.forEach((question: CreateQuestionInput, index: number) => {
        const errors = validateQuestionData(question, index);
        questionErrors.push(...errors);
      });

      if (questionErrors.length > 0) {
        return res.status(400).json({ 
          error: 'Question validation failed', 
          details: questionErrors 
        });
      }

      // Delete existing questions and create new ones
      await prisma.question.deleteMany({
        where: { assessmentId: id }
      });

      const createdQuestions = await Promise.all(
        questions.map(async (q: CreateQuestionInput, idx: number) => {
          const processedQuestion = processQuestionData(q);
          return await prisma.question.create({
            data: {
              ...processedQuestion,
              assessmentId: id,
              order: q.order ?? idx + 1,
            },
          });
        })
      );

      return res.json({ ...assessment, questions: createdQuestions });
    }

    return res.json(assessment);
  } catch (error) {
    console.error('Error updating assessment:', error);
    return res.status(500).json({ error: 'Failed to update assessment' });
  }
};

export const deleteAssessment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get organization ID from authenticated user
    const orgId = req.orgId;
    if (!orgId) {
      return res.status(401).json({ error: 'Organization access required' });
    }

    // First check if assessment exists and belongs to user's organization
    const existingAssessment = await prisma.assessment.findFirst({
      where: { 
        id,
        createdBy: {
          orgId: orgId
        }
      }
    });

    if (!existingAssessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    await prisma.assessment.delete({
      where: { id },
    });

    return res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return res.status(500).json({ error: 'Failed to delete assessment' });
  }
};

export const getAssessmentStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const orgId = req.orgId;
    const whereClause = orgId ? { createdBy: { orgId } } : {};

    const stats = {
      totalAssessments: 0,
      liveAssessments: 0,
      draftAssessments: 0,
      totalCandidates: 0,
      averageScore: 0,
    }

    const [totalAssessments, liveAssessments, draftAssessments, candidateData] = await Promise.all([
      prisma.assessment.count({ where: whereClause }),
      prisma.assessment.count({ where: { ...whereClause, status: 'live' } }),
      prisma.assessment.count({ where: { ...whereClause, status: 'draft' } }),
      prisma.candidate.aggregate({
        where: orgId ? { assessment: { createdBy: { orgId } } } : {},
        _count: true,
        _avg: { score: true },
      }),
    ])

    stats.totalAssessments = totalAssessments
    stats.liveAssessments = liveAssessments
    stats.draftAssessments = draftAssessments
    stats.totalCandidates = candidateData._count
    stats.averageScore = candidateData._avg.score || 0

    return res.json(stats)
  } catch (error) {
    console.error('Error fetching assessment stats:', error)
    return res.status(500).json({ error: 'Failed to fetch assessment stats' })
  }
}

export const getCandidateCredentialsStatus = async (req: Request, res: Response) => {
  try {
    const { id: assessmentId } = req.params;
    
    // Get all candidates for this assessment
    const candidates = await prisma.candidate.findMany({
      where: { assessmentId },
      select: { id: true, name: true, email: true },
    });
    
    // Get credentials for these candidates
    const credentials = await prisma.credential.findMany({
      where: { candidateId: { in: candidates.map((c) => c.id) } },
      select: { candidateId: true },
    });
    
    // Get email logs for these candidates (sent credentials)
    const logs = await prisma.emailLog.findMany({
      where: {
        candidateId: { in: candidates.map((c) => c.id) },
        status: { in: ["sent", "delivered", "opened", "clicked"] },
      },
      select: { candidateId: true },
    });
    
    const sentIds = new Set(logs.map((l) => l.candidateId));
    
    const result = candidates.map((c) => ({
      candidateId: c.id,
      name: c.name,
      email: c.email,
      credentialSent: sentIds.has(c.id),
    }));
    
    return res.json(result);
  } catch (error) {
    console.error("Error fetching candidate credentials status:", error);
    return res.status(500).json({ error: "Failed to fetch candidate credentials status" });
  }
};
