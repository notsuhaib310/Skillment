import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import type { 
  CandidateAssessmentView, 
  CandidateQuestionView, 
  AssessmentSubmission,
  MCQQuestionData,
  CodingQuestionData 
} from '../types/assessment';
import { authenticate } from '../middleware/authenticate';

const router = Router();
const prisma = new PrismaClient();

// Public: List assigned assessments for login
router.get('/assessments', async (req, res) => {
  try {
    const { email, userId } = req.query;
    const where: any = {};
    if (email) where.email = email;
    if (userId) where.userId = userId;
    
    const candidates = await prisma.candidate.findMany({
      where,
      include: { assessment: { include: { questions: true } } },
      orderBy: { createdAt: 'desc' },
    });
    
    return res.json(candidates);
  } catch (error) {
    console.error('Error in assessments route:', error);
    return res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// Public: Submit assessment answers (candidates don't use admin auth)
router.post('/:assessmentId/candidate/:candidateId/submit', async (req, res) => {
  try {
    const { assessmentId, candidateId } = req.params;
    const submissionData: AssessmentSubmission = req.body;

    // Find credential first using external candidateId
    const credential = await prisma.credential.findFirst({
      where: { candidateId: candidateId }
    });

    if (!credential) {
      return res.status(404).json({ error: 'Candidate credentials not found' });
    }

    // Find candidate using email from credential
    const candidate = await prisma.candidate.findFirst({
      where: {
        email: credential.email,
        assessmentId: assessmentId
      },
      include: {
        assessment: {
          include: {
            questions: true
          }
        }
      }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found or not assigned to this assessment' });
    }

    if (candidate.status === 'submitted') {
      return res.status(400).json({ error: 'Assessment already submitted' });
    }

    // Calculate score based on answers
    let totalScore = 0;
    const assessment = candidate.assessment;
    
    for (const answer of submissionData.answers) {
      const question = assessment.questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      // Score MCQ questions
      if (question.type === 'multiple_choice' && question.mcqData) {
        const mcqData = question.mcqData as unknown as MCQQuestionData;
        const correctOptions = mcqData.options
          .filter(opt => opt.isCorrect)
          .map(opt => opt.id);
        
        const candidateAnswers = Array.isArray(answer.answer) ? answer.answer : [answer.answer];
        
        if (mcqData.multipleCorrect) {
          // For multiple correct, check if all correct answers are selected and no wrong ones
          const isCorrect = correctOptions.length === candidateAnswers.length &&
            correctOptions.every(id => candidateAnswers.includes(id)) &&
            candidateAnswers.every(id => correctOptions.includes(id));
          
          if (isCorrect) {
            totalScore += question.marks;
          }
        } else {
          // For single correct, check if the selected answer is correct
          if (candidateAnswers.length === 1 && correctOptions.includes(candidateAnswers[0])) {
            totalScore += question.marks;
          }
        }
      }
      
      // For coding questions, manual evaluation needed (score = 0 for now)
      // This would typically involve running the code against test cases
    }

    // Update candidate with submission data
    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidate.id }, // Use the internal database ID for update
      data: {
        status: 'submitted',
        submittedAt: new Date(),
        timeSpent: submissionData.totalTimeSpent,
        score: totalScore,
        answers: submissionData.answers as any
      }
    });

    // Update assessment analytics
    await updateAssessmentAnalytics(assessmentId);

    return res.json({
      message: 'Assessment submitted successfully',
      candidate: updatedCandidate,
      score: totalScore,
      totalMarks: assessment.totalMarks,
      percentage: Math.round((totalScore / assessment.totalMarks) * 100)
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return res.status(500).json({ error: 'Failed to submit assessment' });
  }
});

// Protected: All other candidate assessment routes
router.use(authenticate);

// Get assessment for candidate with proper question formatting
router.get('/:assessmentId/candidate/:candidateId', async (req, res) => {
  try {
    const { assessmentId, candidateId } = req.params;

    // Find credential first using external candidateId
    const credential = await prisma.credential.findFirst({
      where: { candidateId: candidateId }
    });

    if (!credential) {
      return res.status(404).json({ error: 'Candidate credentials not found' });
    }

    // Find candidate using email from credential
    const candidate = await prisma.candidate.findFirst({
      where: {
        email: credential.email,
        assessmentId: assessmentId
      }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found or not assigned to this assessment' });
    }

    // Get assessment with questions
    const assessment = await prisma.assessment.findFirst({
      where: { id: assessmentId },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Format assessment for candidate view
    const candidateAssessment: CandidateAssessmentView = {
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      instructions: assessment.instructions,
      duration: assessment.duration,
      totalQuestions: assessment.totalQuestions,
      allowBackNavigation: assessment.allowBackNavigation,
      timeWarnings: assessment.timeWarnings,
      showResults: assessment.showResults,
      showCorrectAnswers: assessment.showCorrectAnswers,
      questions: assessment.questions.map((q): CandidateQuestionView => {
        const baseQuestion: CandidateQuestionView = {
          id: q.id,
          question: q.question,
          type: q.type as any,
          marks: q.marks,
          order: q.order,
          hints: q.hints,
        };

        // Add MCQ specific data
        if (q.type === 'multiple_choice' && q.mcqData) {
          const mcqData = q.mcqData as unknown as MCQQuestionData;
          baseQuestion.options = mcqData.options.map(opt => ({
            id: opt.id,
            text: opt.text
          }));
          baseQuestion.multipleCorrect = mcqData.multipleCorrect;
        }

        // Add coding specific data
        if (q.type === 'coding' && q.codingData) {
          const codingData = q.codingData as unknown as CodingQuestionData;
          baseQuestion.question = codingData.description; // Use description as main question
          baseQuestion.languages = codingData.languages;
          baseQuestion.starterCode = codingData.starterCode;
          baseQuestion.timeLimit = codingData.timeLimit;
          baseQuestion.memoryLimit = codingData.memoryLimit;
          baseQuestion.publicTestCases = codingData.testCases
            .filter(tc => tc.isPublic)
            .map(tc => ({
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              explanation: tc.explanation
            }));
        }

        return baseQuestion;
      })
    };

    return res.json({
      assessment: candidateAssessment,
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        status: candidate.status,
        startedAt: candidate.startedAt,
        timeSpent: candidate.timeSpent
      }
    });
  } catch (error) {
    console.error('Error fetching candidate assessment:', error);
    return res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

// Start assessment for candidate
router.post('/:assessmentId/candidate/:candidateId/start', async (req, res) => {
  try {
    const { assessmentId, candidateId } = req.params;

    // Find credential first using external candidateId
    const credential = await prisma.credential.findFirst({
      where: { candidateId: candidateId }
    });

    if (!credential) {
      return res.status(404).json({ error: 'Candidate credentials not found' });
    }

    // Find candidate using email from credential
    const candidate = await prisma.candidate.findFirst({
      where: {
        email: credential.email,
        assessmentId: assessmentId
      }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found or not assigned to this assessment' });
    }

    // Check if candidate has already started or completed
    if (candidate.status === 'submitted') {
      return res.status(400).json({ error: 'Assessment already submitted' });
    }

    // Update candidate status to started
    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidate.id }, // Use the internal database ID for update
      data: {
        status: 'started',
        startedAt: candidate.startedAt || new Date(), // Don't override if already started
      }
    });

    return res.json({
      message: 'Assessment started successfully',
      candidate: updatedCandidate,
      startedAt: updatedCandidate.startedAt
    });
  } catch (error) {
    console.error('Error starting assessment:', error);
    return res.status(500).json({ error: 'Failed to start assessment' });
  }
});

// Save answers (auto-save functionality)
router.post('/:assessmentId/candidate/:candidateId/save', async (req, res) => {
  try {
    const { assessmentId, candidateId } = req.params;
    const { answers, timeSpent } = req.body;

    // Find credential first using external candidateId
    const credential = await prisma.credential.findFirst({
      where: { candidateId: candidateId }
    });

    if (!credential) {
      return res.status(404).json({ error: 'Candidate credentials not found' });
    }

    // Find candidate using email from credential
    const candidate = await prisma.candidate.findFirst({
      where: {
        email: credential.email,
        assessmentId: assessmentId
      }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found or not assigned to this assessment' });
    }

    // Update candidate with current answers and time spent
    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidate.id }, // Use the internal database ID for update
      data: {
        answers: answers as any,
        timeSpent: timeSpent,
        updatedAt: new Date()
      }
    });

    return res.json({ message: 'Answers saved successfully' });
  } catch (error) {
    console.error('Error saving answers:', error);
    return res.status(500).json({ error: 'Failed to save answers' });
  }
});

// Get candidate's current progress
router.get('/:assessmentId/candidate/:candidateId/progress', async (req, res) => {
  try {
    const { assessmentId, candidateId } = req.params;

    // Find credential first using external candidateId
    const credential = await prisma.credential.findFirst({
      where: { candidateId: candidateId }
    });

    if (!credential) {
      return res.status(404).json({ error: 'Candidate credentials not found' });
    }

    // Find candidate using email from credential
    const candidate = await prisma.candidate.findFirst({
      where: {
        email: credential.email,
        assessmentId: assessmentId
      },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            duration: true,
            totalQuestions: true,
            totalMarks: true
          }
        }
      }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Calculate remaining time
    let remainingTime = null;
    if (candidate.startedAt) {
      const elapsedMinutes = Math.floor(
        (new Date().getTime() - candidate.startedAt.getTime()) / (1000 * 60)
      );
      remainingTime = Math.max(0, candidate.assessment.duration - elapsedMinutes);
    }

    return res.json({
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        status: candidate.status,
        startedAt: candidate.startedAt,
        submittedAt: candidate.submittedAt,
        timeSpent: candidate.timeSpent,
        score: candidate.score,
        answers: candidate.answers
      },
      assessment: candidate.assessment,
      remainingTime: remainingTime,
      isExpired: remainingTime === 0
    });
  } catch (error) {
    console.error('Error fetching candidate progress:', error);
    return res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Helper function to update assessment analytics
async function updateAssessmentAnalytics(assessmentId: string) {
  try {
    const candidates = await prisma.candidate.findMany({
      where: { assessmentId },
      select: {
        status: true,
        score: true
      }
    });

    const totalCandidates = candidates.length;
    const completedCandidates = candidates.filter(c => c.status === 'submitted').length;
    const scores = candidates.filter(c => c.score !== null).map(c => c.score!);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const completionRate = totalCandidates > 0 ? (completedCandidates / totalCandidates) * 100 : 0;

    await prisma.assessmentAnalytics.upsert({
      where: { assessmentId },
      update: {
        totalCandidates,
        completedCandidates,
        averageScore,
        completionRate,
        updatedAt: new Date()
      },
      create: {
        assessmentId,
        totalCandidates,
        completedCandidates,
        averageScore,
        completionRate
      }
    });
  } catch (error) {
    console.error('Error updating assessment analytics:', error);
  }
}

export default router; 