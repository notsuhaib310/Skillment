import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { uploadToBlob, deleteBlob } from '../utils/azure-storage';
import { z } from 'zod';

declare global {
  namespace Express {
    interface Request {
      orgName?: string;
    }
  }
}

const prisma = new PrismaClient();

// Validation schema for organization update
const updateOrgSchema = z.object({
  name: z.string().min(2).regex(/^[a-zA-Z0-9-]+$/, 'Organization name can only contain letters, numbers, and hyphens'),
  type: z.string().optional(),
  size: z.string().optional(),
});

export class OrganizationController {
  // Get organization details
  async getOrganization(req: Request, res: Response) {
    try {
      const { orgName } = req.params;

      console.log('Get org - Request orgName:', orgName);
      console.log('Get org - User orgName:', req.orgName);

      // Find organization with case-insensitive name match
      const organization = await prisma.organization.findFirst({
        where: {
          name: {
            equals: orgName,
            mode: 'insensitive',
          },
        },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      });

      if (!organization) {
        console.error('Organization not found:', orgName);
        return res.status(404).json({ error: 'Organization not found' });
      }

      // Ensure we return the correct case from the database
      if (organization.name !== orgName) {
        console.log('Organization name case mismatch:', { 
          requested: orgName, 
          actual: organization.name 
        });
      }

      return res.json(organization);
    } catch (error) {
      console.error('Error fetching organization:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update organization details
  async updateOrganization(req: Request, res: Response) {
    try {
      const { orgName } = req.params;
      const validatedData = updateOrgSchema.parse(req.body);

      console.log('Update org - Request orgName:', orgName);
      console.log('Update org - User orgName:', req.orgName);
      console.log('Update org - Request body:', req.body);

      // Verify user's organization matches the requested organization
      if (!req.orgName || req.orgName.toLowerCase() !== orgName.toLowerCase()) {
        console.error('Unauthorized update attempt:', { 
          requestedOrg: orgName, 
          userOrg: req.orgName,
          userId: req.user?.id 
        });
        return res.status(403).json({ error: 'Unauthorized to update this organization' });
      }

      // Check if new name is taken (if name is being changed)
      if (validatedData.name !== orgName) {
        const existingOrg = await prisma.organization.findUnique({
          where: { name: validatedData.name },
        });

        if (existingOrg) {
          return res.status(400).json({ error: 'Organization name is already taken' });
        }
      }

      const organization = await prisma.organization.update({
        where: { name: orgName },
        data: validatedData,
      });

      return res.json(organization);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error('Error updating organization:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Upload organization logo
  async uploadLogo(req: Request, res: Response) {
    try {
      const { orgName } = req.params;
      const file = req.file;

      console.log('Upload logo - Request orgName:', orgName);
      console.log('Upload logo - User orgName:', req.orgName);

      if (!file) {
        console.error('No file uploaded for org:', orgName);
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Verify user's organization matches the requested organization
      if (!req.orgName || req.orgName.toLowerCase() !== orgName.toLowerCase()) {
        console.error('Unauthorized logo upload attempt:', { 
          requestedOrg: orgName, 
          userOrg: req.orgName,
          userId: req.user?.id 
        });
        return res.status(403).json({ error: 'Unauthorized to update this organization' });
      }

      // Get current organization with case-insensitive match
      const organization = await prisma.organization.findFirst({
        where: {
          name: {
            equals: orgName,
            mode: 'insensitive',
          },
        },
      });

      if (!organization) {
        console.error('Organization not found for logo upload:', orgName);
        return res.status(404).json({ error: 'Organization not found' });
      }

      // Delete old logo if exists
      if (organization.logo) {
        await deleteBlob(organization.logo);
      }

      // Upload new logo
      const logoUrl = await uploadToBlob(file);

      // Update organization with new logo URL using the exact name from database
      const updatedOrg = await prisma.organization.update({
        where: { id: organization.id }, // Use ID to avoid case sensitivity issues
        data: { logo: logoUrl },
      });
      
      console.log('Logo updated for organization:', organization.name);

      return res.json(updatedOrg);
    } catch (error) {
      console.error('Error uploading logo:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
} 