import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

interface InviteTeamMemberRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  permissions?: {
    manageAssessments?: boolean;
    viewCandidates?: boolean;
    manageCandidates?: boolean;
    viewReports?: boolean;
    manageTeam?: boolean;
  };
}

interface UpdateTeamMemberRequest {
  role?: string;
  permissions?: {
    manageAssessments?: boolean;
    viewCandidates?: boolean;
    manageCandidates?: boolean;
    viewReports?: boolean;
    manageTeam?: boolean;
  };
  status?: string;
}

export const getTeamMembers = async (req: Request, res: Response) => {
  try {
    const orgId = req.orgId;
    if (!orgId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Organization access required' 
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const status = req.query.status as string || '';
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: orgId
    };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' as const } },
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [teamMembers, total] = await Promise.all([
      prisma.teamMember.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' as const },
        include: {
          invitedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.teamMember.count({ where }),
    ]);

    // Transform team members to include additional fields
    const transformedTeamMembers = teamMembers.map(member => ({
      ...member,
      fullName: `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'N/A',
      invitedByName: `${member.invitedByUser.firstName} ${member.invitedByUser.lastName}`,
      permissions: member.permissions as any,
    }));

    return res.status(200).json({
      success: true,
      data: {
        teamMembers: transformedTeamMembers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const inviteTeamMember = async (req: Request, res: Response) => {
  try {
    const orgId = req.orgId;
    const userId = req.user?.id;
    
    if (!orgId || !userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Organization access required' 
      });
    }

    const { 
      email, 
      firstName, 
      lastName, 
      role = 'member',
      permissions = {}
    } = req.body as InviteTeamMemberRequest;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
    }

    // Check if team member already exists in this organization
    const existingMember = await prisma.teamMember.findFirst({
      where: { 
        email,
        organizationId: orgId
      },
    });

    if (existingMember) {
      return res.status(400).json({ 
        success: false, 
        error: 'Team member with this email already exists in your organization' 
      });
    }

    // Check if user is already a member of the organization
    const existingUser = await prisma.user.findFirst({
      where: { 
        email,
        orgId: orgId
      },
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'User with this email is already a member of your organization' 
      });
    }

    // Create team member invitation
    const teamMember = await prisma.teamMember.create({
      data: {
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        role,
        permissions: permissions as any,
        invitedBy: userId,
        organizationId: orgId,
        status: 'pending',
      },
      include: {
        invitedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send invitation email here
    // For now, just return success

    return res.status(201).json({
      success: true,
      data: {
        ...teamMember,
        fullName: `${teamMember.firstName || ''} ${teamMember.lastName || ''}`.trim() || 'N/A',
        invitedByName: `${teamMember.invitedByUser.firstName} ${teamMember.invitedByUser.lastName}`,
        permissions: teamMember.permissions as any,
      },
      message: 'Team member invitation sent successfully',
    });
  } catch (error: any) {
    console.error('Error inviting team member:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateTeamMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = req.orgId;
    
    if (!orgId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Organization access required' 
      });
    }

    const { role, permissions, status } = req.body as UpdateTeamMemberRequest;

    // Check if team member exists and belongs to the organization
    const existingMember = await prisma.teamMember.findFirst({
      where: { 
        id,
        organizationId: orgId
      }
    });

    if (!existingMember) {
      return res.status(404).json({ 
        success: false, 
        error: 'Team member not found' 
      });
    }

    // Update team member
    const updatedMember = await prisma.teamMember.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(permissions && { permissions: permissions as any }),
        ...(status && { status }),
        updatedAt: new Date(),
      },
      include: {
        invitedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        ...updatedMember,
        fullName: `${updatedMember.firstName || ''} ${updatedMember.lastName || ''}`.trim() || 'N/A',
        invitedByName: `${updatedMember.invitedByUser.firstName} ${updatedMember.invitedByUser.lastName}`,
        permissions: updatedMember.permissions as any,
      },
      message: 'Team member updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating team member:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const removeTeamMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = req.orgId;
    
    if (!orgId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Organization access required' 
      });
    }

    // Check if team member exists and belongs to the organization
    const existingMember = await prisma.teamMember.findFirst({
      where: { 
        id,
        organizationId: orgId
      }
    });

    if (!existingMember) {
      return res.status(404).json({ 
        success: false, 
        error: 'Team member not found' 
      });
    }

    // Delete team member
    await prisma.teamMember.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Team member removed successfully',
    });
  } catch (error: any) {
    console.error('Error removing team member:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getTeamMemberById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = req.orgId;
    
    if (!orgId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Organization access required' 
      });
    }

    const teamMember = await prisma.teamMember.findFirst({
      where: { 
        id,
        organizationId: orgId
      },
      include: {
        invitedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!teamMember) {
      return res.status(404).json({ 
        success: false, 
        error: 'Team member not found' 
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...teamMember,
        fullName: `${teamMember.firstName || ''} ${teamMember.lastName || ''}`.trim() || 'N/A',
        invitedByName: `${teamMember.invitedByUser.firstName} ${teamMember.invitedByUser.lastName}`,
        permissions: teamMember.permissions as any,
      },
    });
  } catch (error: any) {
    console.error('Error fetching team member:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}; 