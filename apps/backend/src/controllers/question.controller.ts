import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import type { CreateQuestionInput, MCQQuestionData, CodingQuestionData } from '../types/assessment';

const prisma = new PrismaClient();

// Process question data to ensure proper format
const processQuestionData = (question: CreateQuestionInput) => {
  const processedQuestion: any = {
    question: question.question,
    type: question.type,
    marks: question.marks,
    order: question.order || 1,
    hints: question.hints || [],
    explanation: question.explanation || '',
    difficulty: question.difficulty || 'medium',
    tags: question.tags || [],
  };

  // Process MCQ data
  if (question.type === 'multiple_choice') {
    // Handle both formats: new mcqData and legacy options
    if (question.mcqData) {
      processedQuestion.type = 'multiple_choice'; // Ensure consistent type
      processedQuestion.mcqData = question.mcqData;
      // Also set legacy fields for backward compatibility
      processedQuestion.options = question.mcqData.options;
      processedQuestion.correctAnswer = question.mcqData.options
        .filter((opt: any) => opt.isCorrect)
        .map((opt: any) => opt.id);
    } else if (question.options) {
      // Legacy format - create mcqData from options
      processedQuestion.type = 'multiple_choice';
      const mcqData = {
        question: question.question,
        options: question.options,
        explanation: question.explanation || '',
        multipleCorrect: false // Default to false for legacy questions
      };
      processedQuestion.mcqData = mcqData;
      processedQuestion.options = question.options;
      processedQuestion.correctAnswer = question.options
        .filter((opt: any) => opt.isCorrect)
        .map((opt: any) => opt.id);
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

  return processedQuestion;
};

// Add a question to an assessment
const addQuestion = async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const questionData = req.body;
    
    console.log('Received question data:', JSON.stringify(questionData, null, 2));
    
    // Process the question data properly
    const processedData = processQuestionData(questionData);
    
    console.log('Processed question data:', JSON.stringify(processedData, null, 2));
    
    const question = await prisma.question.create({
      data: {
        ...processedData,
        assessmentId,
      },
    });
    
    console.log('Created question in DB:', JSON.stringify(question, null, 2));
    
    return res.status(201).json(question);
  } catch (error) {
    console.error('Error adding question:', error);
    return res.status(500).json({ error: 'Failed to add question' });
  }
};

// Get all questions for an assessment
const getQuestions = async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const questions = await prisma.question.findMany({
      where: { assessmentId },
      orderBy: { order: 'asc' },
    });
    return res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

// Update a question
const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const question = await prisma.question.update({
      where: { id },
      data: { ...data },
    });
    return res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    return res.status(500).json({ error: 'Failed to update question' });
  }
};

// Delete a question
const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.question.delete({ where: { id } });
    return res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return res.status(500).json({ error: 'Failed to delete question' });
  }
};

export { addQuestion, getQuestions, updateQuestion, deleteQuestion }; 