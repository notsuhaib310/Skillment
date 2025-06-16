import { ApiResponse } from '../utils/api-response';

declare global {
  namespace Express {
    interface Response {
      json(body: any): ApiResponse;
      status(code: number): ApiResponse;
      send(body: any): Response;
    }
  }
} 