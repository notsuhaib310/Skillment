import { ApiResponse } from '../utils/api-response';

declare global {
  namespace Express {
    interface Request {
      orgId?: string;
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        orgId?: string;
        orgName?: string;
      };
    }
    
    interface Response {
      json(body: any): ApiResponse;
      status(code: number): ApiResponse;
      send(body: any): Response;
    }
  }
} 