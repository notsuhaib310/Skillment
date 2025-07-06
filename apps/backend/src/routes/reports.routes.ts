import express from 'express';
import {
  getReportsOverview,
  getPerformanceAnalytics,
  getSecurityAnalytics,
  getTrendsData,
  exportReportData
} from '../controllers/reports.controller';

const router = express.Router();

// Get comprehensive reports overview
router.get('/overview', getReportsOverview);

// Get performance analytics
router.get('/performance', getPerformanceAnalytics);

// Get security analytics
router.get('/security', getSecurityAnalytics);

// Get trends data
router.get('/trends', getTrendsData);

// Export report data
router.post('/export', exportReportData);

export default router; 