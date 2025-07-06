import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate comprehensive reports for the dashboard
export const getReportsOverview = async (req: Request, res: Response) => {
  try {
    const { dateRange = 'last30days', assessmentType = 'all', status = 'all' } = req.query;
    
    // Calculate date range filter
    const dateFilter = getDateFilter(dateRange as string);
    
    // Assessment type filter
    const assessmentTypeFilter = assessmentType === 'all' ? {} : { type: assessmentType as string };
    
    // Status filter
    const statusFilter = status === 'all' ? {} : { status: status as string };
    
    // Get assessments data
    const assessmentsData = await prisma.assessment.findMany({
      where: {
        ...assessmentTypeFilter,
        ...statusFilter,
        ...dateFilter
      },
      include: {
        candidates: {
          include: {
            proctoringSession: true
          }
        }
      }
    });
    
    // Get candidates data
    const candidatesData = await prisma.candidate.findMany({
      where: {
        assessment: {
          ...assessmentTypeFilter,
          ...statusFilter,
          ...dateFilter
        }
      },
      include: {
        proctoringSession: true,
        assessment: true
      }
    });
    
    // Calculate metrics
    const totalAssessments = assessmentsData.length;
    const publishedAssessments = assessmentsData.filter(a => a.status === 'published').length;
    const draftAssessments = assessmentsData.filter(a => a.status === 'draft').length;
    const completedAssessments = assessmentsData.filter(a => a.candidates.some(c => c.status === 'submitted')).length;
    
    const totalCandidates = candidatesData.length;
    const activeCandidates = candidatesData.filter(c => c.status === 'started').length;
    const completedCandidates = candidatesData.filter(c => c.status === 'submitted').length;
    const inProgressCandidates = candidatesData.filter(c => c.status === 'in_progress').length;
    
    // Calculate performance metrics
    const submittedCandidates = candidatesData.filter(c => c.status === 'submitted' && c.totalScore !== null);
    const averageScore = submittedCandidates.length > 0 
      ? submittedCandidates.reduce((sum, c) => sum + (c.totalScore || 0), 0) / submittedCandidates.length
      : 0;
    
    const passedCandidates = submittedCandidates.filter(c => (c.totalScore || 0) >= 60);
    const passRate = submittedCandidates.length > 0 
      ? (passedCandidates.length / submittedCandidates.length) * 100
      : 0;
    
    const completionRate = totalCandidates > 0 
      ? (completedCandidates / totalCandidates) * 100
      : 0;
    
    // Calculate average time (in minutes)
    const candidatesWithTime = candidatesData.filter(c => c.startedAt && c.submittedAt);
    const averageTime = candidatesWithTime.length > 0
      ? candidatesWithTime.reduce((sum, c) => {
          const duration = (new Date(c.submittedAt!).getTime() - new Date(c.startedAt!).getTime()) / (1000 * 60);
          return sum + duration;
        }, 0) / candidatesWithTime.length
      : 0;
    
    // Device breakdown - mock data for now (could be enhanced with real device tracking)
    const deviceBreakdown = {
      desktop: 68,
      mobile: 22,
      tablet: 10
    };
    
    // Security metrics from proctoring sessions
    const proctoringData = candidatesData.map(c => c.proctoringSession).filter(Boolean);
    const lowRiskCandidates = proctoringData.filter(p => p!.riskLevel === 'low').length;
    const mediumRiskCandidates = proctoringData.filter(p => p!.riskLevel === 'medium').length;
    const highRiskCandidates = proctoringData.filter(p => p!.riskLevel === 'high').length;
    const totalViolations = proctoringData.reduce((sum, p) => sum + (p?.totalViolations || 0), 0);
    
    // Generate trends data for the last 6 months
    const trendsData = await generateTrendsData(6);
    
    const reportData = {
      assessments: {
        total: totalAssessments,
        published: publishedAssessments,
        draft: draftAssessments,
        completed: completedAssessments
      },
      candidates: {
        total: totalCandidates,
        active: activeCandidates,
        completed: completedCandidates,
        inProgress: inProgressCandidates
      },
      performance: {
        averageScore: Math.round(averageScore * 10) / 10,
        passRate: Math.round(passRate * 10) / 10,
        completionRate: Math.round(completionRate * 10) / 10,
        averageTime: Math.round(averageTime * 10) / 10
      },
      trends: trendsData,
      deviceBreakdown,
      securityMetrics: {
        lowRisk: lowRiskCandidates,
        mediumRisk: mediumRiskCandidates,
        highRisk: highRiskCandidates,
        totalViolations
      }
    };
    
    res.json(reportData);
  } catch (error) {
    console.error('Error generating reports overview:', error);
    res.status(500).json({ error: 'Failed to generate reports overview' });
  }
};

// Get performance analytics
export const getPerformanceAnalytics = async (req: Request, res: Response) => {
  try {
    const { dateRange = 'last30days', assessmentType = 'all' } = req.query;
    
    const dateFilter = getDateFilter(dateRange as string);
    const assessmentTypeFilter = assessmentType === 'all' ? {} : { type: assessmentType as string };
    
    // Get top performers
    const topPerformers = await prisma.candidate.findMany({
      where: {
        status: 'submitted',
        totalScore: { not: null },
        assessment: {
          ...assessmentTypeFilter,
          ...dateFilter
        }
      },
      orderBy: {
        totalScore: 'desc'
      },
      take: 5,
      include: {
        assessment: true
      }
    });
    
    // Get score distribution
    const allScores = await prisma.candidate.findMany({
      where: {
        status: 'submitted',
        totalScore: { not: null },
        assessment: {
          ...assessmentTypeFilter,
          ...dateFilter
        }
      },
      select: {
        totalScore: true
      }
    });
    
    const scoreRanges = [
      { range: '90-100%', count: 0, percentage: 0 },
      { range: '80-89%', count: 0, percentage: 0 },
      { range: '70-79%', count: 0, percentage: 0 },
      { range: '60-69%', count: 0, percentage: 0 },
      { range: 'Below 60%', count: 0, percentage: 0 }
    ];
    
    allScores.forEach(({ totalScore }) => {
      const score = totalScore || 0;
      if (score >= 90) scoreRanges[0].count++;
      else if (score >= 80) scoreRanges[1].count++;
      else if (score >= 70) scoreRanges[2].count++;
      else if (score >= 60) scoreRanges[3].count++;
      else scoreRanges[4].count++;
    });
    
    const totalScores = allScores.length;
    scoreRanges.forEach(range => {
      range.percentage = totalScores > 0 ? Math.round((range.count / totalScores) * 100) : 0;
    });
    
    // Time analytics
    const candidatesWithTime = await prisma.candidate.findMany({
      where: {
        status: 'submitted',
        startedAt: { not: null },
        submittedAt: { not: null },
        assessment: {
          ...assessmentTypeFilter,
          ...dateFilter
        }
      },
      select: {
        startedAt: true,
        submittedAt: true
      }
    });
    
    const completionTimes = candidatesWithTime.map(c => {
      const duration = (new Date(c.submittedAt!).getTime() - new Date(c.startedAt!).getTime()) / (1000 * 60);
      return duration;
    });
    
    const averageTime = completionTimes.length > 0
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
      : 0;
    
    const fastestTime = completionTimes.length > 0 ? Math.min(...completionTimes) : 0;
    const slowestTime = completionTimes.length > 0 ? Math.max(...completionTimes) : 0;
    
    const under30MinCount = completionTimes.filter(time => time < 30).length;
    const under30MinPercentage = completionTimes.length > 0 
      ? Math.round((under30MinCount / completionTimes.length) * 100)
      : 0;
    
    res.json({
      topPerformers: topPerformers.map(p => ({
        name: p.name,
        score: p.totalScore,
        assessment: p.assessment.title
      })),
      scoreRanges,
      timeAnalytics: {
        averageTime: Math.round(averageTime * 10) / 10,
        fastestTime: Math.round(fastestTime * 10) / 10,
        slowestTime: Math.round(slowestTime * 10) / 10,
        under30MinPercentage
      }
    });
  } catch (error) {
    console.error('Error generating performance analytics:', error);
    res.status(500).json({ error: 'Failed to generate performance analytics' });
  }
};

// Get security analytics
export const getSecurityAnalytics = async (req: Request, res: Response) => {
  try {
    const { dateRange = 'last30days', assessmentType = 'all' } = req.query;
    
    const dateFilter = getDateFilter(dateRange as string);
    const assessmentTypeFilter = assessmentType === 'all' ? {} : { type: assessmentType as string };
    
    // Get proctoring events
    const proctoringEvents = await prisma.proctoringEvent.findMany({
      where: {
        candidate: {
          assessment: {
            ...assessmentTypeFilter,
            ...dateFilter
          }
        }
      },
      include: {
        candidate: {
          include: {
            proctoringSession: true
          }
        }
      }
    });
    
    // Get security metrics
    const proctoringData = await prisma.proctoringSession.findMany({
      where: {
        candidate: {
          assessment: {
            ...assessmentTypeFilter,
            ...dateFilter
          }
        }
      }
    });
    
    const lowRisk = proctoringData.filter(p => p.riskLevel === 'low').length;
    const mediumRisk = proctoringData.filter(p => p.riskLevel === 'medium').length;
    const highRisk = proctoringData.filter(p => p.riskLevel === 'high').length;
    const totalViolations = proctoringData.reduce((sum, p) => sum + p.totalViolations, 0);
    
    // Calculate violation breakdown
    const violationBreakdown = [
      { type: 'Tab Switching', count: 0, severity: 'medium' },
      { type: 'Copy/Paste Attempts', count: 0, severity: 'high' },
      { type: 'Multiple Faces Detected', count: 0, severity: 'high' },
      { type: 'Fullscreen Exit', count: 0, severity: 'medium' },
      { type: 'Keyboard Violation', count: 0, severity: 'low' },
      { type: 'Window Blur', count: 0, severity: 'medium' }
    ];
    
    proctoringEvents.forEach(event => {
      switch (event.eventType) {
        case 'tab_switch':
          violationBreakdown[0].count++;
          break;
        case 'copy_paste':
          violationBreakdown[1].count++;
          break;
        case 'multiple_faces':
          violationBreakdown[2].count++;
          break;
        case 'fullscreen_exit':
          violationBreakdown[3].count++;
          break;
        case 'keyboard_violation':
          violationBreakdown[4].count++;
          break;
        case 'window_blur':
          violationBreakdown[5].count++;
          break;
      }
    });
    
    // Calculate success rates
    const totalCandidates = proctoringData.length;
    const successfulSessions = proctoringData.filter(p => p.riskLevel === 'low').length;
    const proctoringSuccessRate = totalCandidates > 0 
      ? Math.round((successfulSessions / totalCandidates) * 100 * 10) / 10
      : 0;
    
    res.json({
      securityMetrics: {
        lowRisk,
        mediumRisk,
        highRisk,
        totalViolations,
        proctoringSuccessRate,
        falsePositiveRate: 2.1 // Mock data for now
      },
      violationBreakdown
    });
  } catch (error) {
    console.error('Error generating security analytics:', error);
    res.status(500).json({ error: 'Failed to generate security analytics' });
  }
};

// Get trends data
export const getTrendsData = async (req: Request, res: Response) => {
  try {
    const { months = 6 } = req.query;
    const trendsData = await generateTrendsData(parseInt(months as string));
    res.json({ trends: trendsData });
  } catch (error) {
    console.error('Error generating trends data:', error);
    res.status(500).json({ error: 'Failed to generate trends data' });
  }
};

// Export report data
export const exportReportData = async (req: Request, res: Response) => {
  try {
    const { reportType, format = 'pdf', dateRange = 'last30days', assessmentType = 'all' } = req.body;
    
    // For now, just return success message
    // In a real implementation, you would generate the actual file
    res.json({
      success: true,
      message: `${reportType} report in ${format} format is being generated`,
      downloadUrl: `/api/reports/download/${Date.now()}.${format}`
    });
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({ error: 'Failed to export report' });
  }
};

// Helper functions
function getDateFilter(dateRange: string) {
  const now = new Date();
  const filter: any = {};
  
  switch (dateRange) {
    case 'last7days':
      filter.createdAt = {
        gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      };
      break;
    case 'last30days':
      filter.createdAt = {
        gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      };
      break;
    case 'last90days':
      filter.createdAt = {
        gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      };
      break;
    case 'last12months':
      filter.createdAt = {
        gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      };
      break;
    default:
      // No filter for 'all' or invalid values
      break;
  }
  
  return filter;
}

async function generateTrendsData(months: number) {
  const trends = [];
  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = months - 1; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const assessments = await prisma.assessment.count({
      where: {
        createdAt: {
          gte: targetDate,
          lt: nextMonth
        }
      }
    });
    
    const candidates = await prisma.candidate.count({
      where: {
        createdAt: {
          gte: targetDate,
          lt: nextMonth
        }
      }
    });
    
    const completedCandidates = await prisma.candidate.findMany({
      where: {
        status: 'submitted',
        totalScore: { not: null },
        submittedAt: {
          gte: targetDate,
          lt: nextMonth
        }
      },
      select: {
        totalScore: true
      }
    });
    
    const averageScore = completedCandidates.length > 0
      ? completedCandidates.reduce((sum, c) => sum + (c.totalScore || 0), 0) / completedCandidates.length
      : 0;
    
    trends.push({
      month: monthNames[targetDate.getMonth()],
      assessments,
      candidates,
      averageScore: Math.round(averageScore * 10) / 10
    });
  }
  
  return trends;
} 