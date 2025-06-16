"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParticipantById = exports.addParticipant = exports.getParticipants = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getParticipants = async (_req, res) => {
    try {
        const participants = await prisma.participant.findMany();
        return res.status(200).json({ success: true, participants });
    }
    catch (error) {
        console.error('Error fetching participants:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
exports.getParticipants = getParticipants;
const addParticipant = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error adding participant:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
exports.addParticipant = addParticipant;
const getParticipantById = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching participant by ID:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
exports.getParticipantById = getParticipantById;
//# sourceMappingURL=participants.js.map