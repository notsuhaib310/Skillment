import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Setup nodemailer transporter using env vars
const transporter = nodemailer.createTransport({
  host: process.env.RESEND_SMTP_HOST,
  port: Number(process.env.RESEND_SMTP_PORT),
  auth: {
    user: process.env.RESEND_SMTP_USER,
    pass: process.env.RESEND_SMTP_PASS,
  },
});

const FROM_EMAIL = process.env.FROM_EMAIL || "no-reply@example.com";
const LOGIN_LINK = process.env.CANDIDATE_LOGIN_LINK || "https://candidate.skillment.in/login";

export class EmailController {
  // --- Templates CRUD ---
  async getTemplates(req: Request, res: Response) {
    try {
      const templates = await prisma.emailTemplate.findMany({ orderBy: { updatedAt: "desc" } });
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  }
  async createTemplate(req: Request, res: Response) {
    try {
      const { name, subject, body, createdById } = req.body;
      const template = await prisma.emailTemplate.create({
        data: { name, subject, body, createdById },
      });
      res.status(201).json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to create template" });
    }
  }
  async updateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, subject, body } = req.body;
      const template = await prisma.emailTemplate.update({
        where: { id },
        data: { name, subject, body },
      });
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to update template" });
    }
  }
  async deleteTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.emailTemplate.delete({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete template" });
    }
  }

  // --- Email Logs ---
  async getLogs(req: Request, res: Response) {
    try {
      const logs = await prisma.emailLog.findMany({ orderBy: { createdAt: "desc" } });
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  }
  async getLogDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const log = await prisma.emailLog.findUnique({ where: { id } });
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch log details" });
    }
  }

  // --- Send Email ---
  async sendEmail(req: Request, res: Response) {
    try {
      const { to, subject, body, templateId, assessmentId, candidateIds, data } = req.body;
      let recipients: string[] = [];
      if (candidateIds && candidateIds.length > 0) {
        const candidates = await prisma.candidate.findMany({ where: { id: { in: candidateIds } } });
        recipients = candidates.map(c => c.email);
      } else if (to) {
        recipients = Array.isArray(to) ? to : [to];
      }
      let template = null;
      if (templateId) {
        template = await prisma.emailTemplate.findUnique({ where: { id: templateId } });
      }
      const results = [];
      for (const email of recipients) {
        const renderedBody = template ? this.renderTemplate(template.body, data || {}) : body;
        const renderedSubject = template ? this.renderTemplate(template.subject, data || {}) : subject;
        // 1. Create log entry first to get logId
        const log = await prisma.emailLog.create({
          data: {
            to: email,
            candidateId: null,
            assessmentId: assessmentId || null,
            templateId: templateId || null,
            subject: renderedSubject,
            body: renderedBody,
            status: "sent",
            sentAt: new Date(),
            createdById: req.user?.id || "system",
          },
        });
        // 2. Inject tracking pixel and rewrite links
        let htmlWithTracking = renderedBody;
        // Add open tracking pixel
        htmlWithTracking += `<img src=\"http://localhost:5000/api/email/track/open/${log.id}\" width=\"1\" height=\"1\" style=\"display:none;\" alt=\"\" />`;
        // Rewrite links for click tracking
        htmlWithTracking = htmlWithTracking.replace(/<a\s+([^>]*?)href=["']([^"']+)["']([^>]*)>/gi, (match, pre, href, post) => {
          // Only rewrite http/https links
          if (!href.startsWith('http')) return match;
          const encoded = encodeURIComponent(href);
          return `<a ${pre}href=\"http://localhost:5000/api/email/track/click/${log.id}?redirect=${encoded}\"${post}>`;
        });
        try {
          await transporter.sendMail({
            from: FROM_EMAIL,
            to: email,
            subject: renderedSubject,
            html: htmlWithTracking,
          });
          // Optionally update log with final HTML
          await prisma.emailLog.update({ where: { id: log.id }, data: { body: htmlWithTracking } });
          results.push({ email, status: "sent" });
        } catch (err) {
          await prisma.emailLog.update({ where: { id: log.id }, data: { status: "failed", error: String(err) } });
          results.push({ email, status: "failed", error: String(err) });
        }
      }
      res.json({ results });
    } catch (error) {
      res.status(500).json({ error: "Failed to send email" });
    }
  }

  // --- Save Draft ---
  async saveDraft(req: Request, res: Response) {
    try {
      const { to, subject, body, templateId, assessmentId, candidateIds } = req.body;
      let recipients: string[] = [];
      if (candidateIds && candidateIds.length > 0) {
        const candidates = await prisma.candidate.findMany({ where: { id: { in: candidateIds } } });
        recipients = candidates.map(c => c.email);
      } else if (to) {
        recipients = Array.isArray(to) ? to : [to];
      }
      for (const email of recipients) {
        await prisma.emailLog.create({
          data: {
            to: email,
            candidateId: null,
            assessmentId: assessmentId || null,
            templateId: templateId || null,
            subject,
            body,
            status: "draft",
            createdById: req.user?.id || "system",
          },
        });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save draft" });
    }
  }

  // --- Send Credentials ---
  async sendCredentials(req: Request, res: Response) {
    try {
      const { assessmentId, candidateIds } = req.body;
      // 1. Find all candidates for assessment
      let candidates = [];
      if (candidateIds && candidateIds.length > 0) {
        candidates = await prisma.candidate.findMany({ where: { id: { in: candidateIds } } });
      } else if (assessmentId) {
        candidates = await prisma.candidate.findMany({ where: { assessmentId } });
      } else {
        return res.status(400).json({ error: "No candidates or assessment specified" });
      }
      const results = [];
      for (const candidate of candidates) {
        // 2. Check for credential
        let credential = await prisma.credential.findUnique({ where: { candidateId: candidate.id } });
        let password = "";
        if (!credential) {
          // Generate password
          password = Math.random().toString(36).slice(-10);
          const hash = await bcrypt.hash(password, 10);
          credential = await prisma.credential.create({
            data: {
              candidateId: candidate.id,
              email: candidate.email,
              passwordHash: hash,
            },
          });
        } else {
          // Use existing password (cannot recover, so send placeholder)
          password = "(already set)";
        }
        // 3. Prepare email
        const template = await prisma.emailTemplate.findFirst({
          where: { name: "Send Credentials" },
        });
        const emailData = {
          name: candidate.name,
          email: candidate.email,
          password,
          login_link: LOGIN_LINK,
        };
        const subject = template ? this.renderTemplate(template.subject, emailData) : "Your Skillment Login Credentials";
        const body = template ? this.renderTemplate(template.body, emailData) :
          `<p>Hello ${candidate.name},</p><p>Your login email: <b>${candidate.email}</b><br/>Password: <b>${password}</b><br/><a href="${LOGIN_LINK}">Login here</a></p>`;
        try {
          await transporter.sendMail({
            from: FROM_EMAIL,
            to: candidate.email,
            subject,
            html: body,
          });
          await prisma.emailLog.create({
            data: {
              to: candidate.email,
              candidateId: candidate.id,
              assessmentId: assessmentId || null,
              templateId: template?.id || null,
              subject,
              body,
              status: "sent",
              sentAt: new Date(),
              createdById: req.user?.id || "system",
            },
          });
          results.push({ email: candidate.email, status: "sent" });
        } catch (err) {
          await prisma.emailLog.create({
            data: {
              to: candidate.email,
              candidateId: candidate.id,
              assessmentId: assessmentId || null,
              templateId: template?.id || null,
              subject,
              body,
              status: "failed",
              error: String(err),
              createdById: req.user?.id || "system",
            },
          });
          results.push({ email: candidate.email, status: "failed", error: String(err) });
        }
      }
      res.json({ results });
    } catch (error) {
      res.status(500).json({ error: "Failed to send credentials" });
    }
  }

  // --- Tracking ---
  async trackOpen(req: Request, res: Response) {
    try {
      const { logId } = req.params;
      await prisma.emailLog.update({ where: { id: logId }, data: { openedAt: new Date(), status: "opened" } });
    } catch {}
    // Return 1x1 pixel
    res.set('Content-Type', 'image/png');
    res.send(Buffer.from("iVBORw0KGgo=", "base64"));
  }
  async trackClick(req: Request, res: Response) {
    try {
      const { logId } = req.params;
      await prisma.emailLog.update({ where: { id: logId }, data: { clickedAt: new Date(), status: "clicked" } });
    } catch {}
    res.redirect("https://skillment.in");
  }

  // --- Smart Templating Helper ---
  renderTemplate(template: string, data: Record<string, string>) {
    return template.replace(/\{(.*?)\}/g, (_, key) => data[key] || '');
  }

  // --- Credential Generation Helper ---
  async generateCredential(candidateId: string, email: string) {
    // TODO: Generate password, hash, store in Credential
    return { email, password: "password123" };
  }

  async getMetrics(req: Request, res: Response) {
    try {
      // Aggregate counts
      const [totalSent, delivered, opened, clicked, bounced, unsubscribed, logs] = await Promise.all([
        prisma.emailLog.count({ where: { status: { in: ["sent", "delivered", "opened", "clicked"] } } }),
        prisma.emailLog.count({ where: { status: "delivered" } }),
        prisma.emailLog.count({ where: { status: "opened" } }),
        prisma.emailLog.count({ where: { status: "clicked" } }),
        prisma.emailLog.count({ where: { status: "bounced" } }),
        prisma.emailLog.count({ where: { status: "unsubscribed" } }),
        prisma.emailLog.findMany({ orderBy: { sentAt: "asc" }, take: 500 }),
      ])
      // Time series (by day)
      const timeSeries: Record<string, { sent: number, opened: number, clicked: number }> = {}
      logs.forEach(log => {
        if (!log.sentAt) return
        const date = log.sentAt.toISOString().slice(0, 10)
        if (!timeSeries[date]) timeSeries[date] = { sent: 0, opened: 0, clicked: 0 }
        timeSeries[date].sent++
        if (log.status === "opened") timeSeries[date].opened++
        if (log.status === "clicked") timeSeries[date].clicked++
      })
      const timeSeriesData = Object.entries(timeSeries).map(([date, v]) => ({ date, ...v }))
      res.json({
        totalSent,
        delivered,
        opened,
        clicked,
        bounced,
        unsubscribed,
        timeSeriesData,
      })
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metrics" })
    }
  }
} 