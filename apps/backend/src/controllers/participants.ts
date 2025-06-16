import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getParticipants = async (_req: Request, res: Response) => {
  try {
    const participants = await prisma.participant.findMany();
    return res.status(200).json({ success: true, participants });
  } catch (error: any) {
    console.error('Error fetching participants:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const addParticipant = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, tags, location } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required.' });
    }

    const newParticipant = await prisma.participant.create({
      data: {
        name,
        email,
        phone,
        tags: tags || [],
        location,
      },
    });

    return res.status(201).json({ success: true, participant: newParticipant });
  } catch (error: any) {
    console.error('Error adding participant:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getParticipantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const participant = await prisma.participant.findUnique({
      where: { id },
      include: {
        assessmentHistory: true,
        activityLogs: true,
      },
    });

    if (!participant) {
      return res.status(404).json({ success: false, error: 'Participant not found.' });
    }

    return res.status(200).json({ success: true, participant });
  } catch (error: any) {
    console.error('Error fetching participant by ID:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}; 