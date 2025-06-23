import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Add a question to an assessment
const addQuestion = async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const data = req.body;
    // Optionally: check org/user permissions here
    const question = await prisma.question.create({
      data: {
        ...data,
        assessmentId,
      },
    });
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