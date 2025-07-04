import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface UserRegistrationData {
  email: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  loginUrl: string;
  plan: string;
}

interface TeamInvitationData {
  email: string;
  firstName?: string;
  lastName?: string;
  inviterName: string;
  organizationName: string;
  role: string;
  permissions: any;
  invitationUrl: string;
}

interface AdminNotificationData {
  action: string;
  details: any;
  timestamp: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private adminEmail = 'ceo@pronexus.in';

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.RESEND_SMTP_HOST,
      port: parseInt(process.env.RESEND_SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.RESEND_SMTP_USER,
        pass: process.env.RESEND_SMTP_PASS,
      },
    });
  }

  private async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: {
          name: 'Skillment Platform',
          address: process.env.FROM_EMAIL || 'no-reply@skillment.in'
        },
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
        headers: {
          'X-Mailer': 'Skillment Platform v1.0',
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'List-Unsubscribe': '<mailto:unsubscribe@skillment.in>',
          'Message-ID': `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@skillment.in>`,
        },
        // Add proper MIME headers
        messageId: `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@skillment.in>`,
        date: new Date(),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  private getEmailTemplate(templateName: string, data: any): string {
    const templates: { [key: string]: string } = {
      welcome: this.getWelcomeTemplate(data),
      teamInvitation: this.getTeamInvitationTemplate(data),
      adminNotification: this.getAdminNotificationTemplate(data),
      modern: this.getModernTemplate(data),
    };

    return templates[templateName] || '';
  }

  private getModernTemplate(data: any): string {
    const { subject, body, ctaText, ctaUrl } = data;

    // Handle cases where data properties might be undefined
    const safeSubject = subject || 'Notification';
    const safeBody = body || 'No content provided';
    const safeCtaText = ctaText || 'Learn More';
    const safeCtaUrl = ctaUrl || '#';

    // A more robust, professional template with inlined CSS for maximum compatibility.
    return `
    <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Skillment</title>
    <style>
      body {
        margin: 0;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background: #f1f5f9;
        color: #0f172a;
      }
  
      .container {
        max-width: 600px;
        margin: auto;
        background: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
      }
  
      .header {
        background: linear-gradient(135deg, #0f0f23 0%, #1e293b 100%);
        color: #ffffff;
        padding: 40px 30px;
        text-align: center;
        position: relative;
      }
  
      .header h1 {
        margin: 0;
        font-size: 28px;
      }
  
      .header p {
        margin: 10px 0 0;
        font-size: 16px;
        opacity: 0.85;
      }
  
      .content {
        padding: 40px 30px;
      }
  
      .content h2 {
        font-size: 22px;
        margin-bottom: 12px;
        color: #0f172a;
      }
  
      .content p {
        font-size: 16px;
        color: #475569;
        margin-bottom: 20px;
      }
  
      .account-details,
      .features-list {
        background: #f9fafb;
        padding: 20px;
        border-radius: 12px;
        margin: 24px 0;
        border: 1px solid #e2e8f0;
      }
  
      .account-details h3,
      .features-list h3 {
        font-size: 18px;
        margin-bottom: 16px;
        color: #0f172a;
      }
  
      .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        font-size: 15px;
      }
  
      .detail-label {
        color: #64748b;
        font-weight: 500;
      }
  
      .detail-value {
        font-weight: 600;
        color: #0f172a;
      }
  
      .features-list ul {
        padding-left: 20px;
      }
  
      .features-list li {
        margin-bottom: 12px;
        color: #475569;
        list-style-type: '✓ ';
        list-style-position: inside;
      }
  
      .cta-button {
        display: inline-block;
        background: #0f172a;
        color: #ffffff;
        padding: 14px 28px;
        border-radius: 10px;
        text-decoration: none;
        font-size: 16px;
        font-weight: 600;
        margin-top: 16px;
        transition: all 0.2s ease;
      }
  
      .cta-button:hover {
        background: #1e293b;
      }
  
      .footer {
        text-align: center;
        font-size: 14px;
        color: #94a3b8;
        padding: 24px;
        border-top: 1px solid #e2e8f0;
        background: #f8fafc;
      }
  
      @media (max-width: 600px) {
        .content, .header {
          padding: 20px;
        }
  
        .detail-row {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }
  
        .cta-button {
          width: 100%;
          text-align: center;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <header class="header">
        <h1>🎉 Welcome to Skillment</h1>
        <p>Your ${data.organizationName} account is ready!</p>
      </header>
  
      <section class="content">
        <article class="welcome-message">
          <h2>Hello ${data.firstName} ${data.lastName},</h2>
          <p>Welcome to <strong>Skillment</strong>! Your account has been successfully created. You're now ready to start managing assessments and collaborating with your team.</p>
        </article>
  
        <section class="account-details">
          <h3>👤 Your Account</h3>
          <div class="detail-row">
            <span class="detail-label">Organization:</span>
            <span class="detail-value">${data.organizationName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${data.email}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Plan:</span>
            <span class="detail-value">${data.plan}</span>
          </div>
        </section>
  
        <section class="features-list">
          <h3>🚀 What you can do now:</h3>
          <ul>
            <li>Create and manage assessments</li>
            <li>Invite participants and team members</li>
            <li>Track results and analytics</li>
            <li>Access AI-powered tools</li>
          </ul>
        </section>
  
        <a href="${data.loginUrl}" class="cta-button" target="_blank">Login to Dashboard</a>
  
        <p style="font-size: 14px; color: #64748b; margin-top: 24px;">If you need help, our support team is here for you anytime.</p>
      </section>
  
      <footer class="footer">
        <p>© ${new Date().getFullYear()} Skillment. All rights reserved.</p>
        <p>This email was sent to ${data.email}</p>
      </footer>
    </div>
  </body>
  </html>
      `;
    
  }

  private getWelcomeTemplate(data: UserRegistrationData): string {
    return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Skillment</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f1f5f9;
      color: #0f172a;
    }

    .container {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }

    .header {
      background: linear-gradient(135deg, #0f0f23 0%, #1e293b 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
      position: relative;
    }

    .header h1 {
      margin: 0;
      font-size: 28px;
    }

    .header p {
      margin: 10px 0 0;
      font-size: 16px;
      opacity: 0.85;
    }

    .content {
      padding: 40px 30px;
    }

    .content h2 {
      font-size: 22px;
      margin-bottom: 12px;
      color: #0f172a;
    }

    .content p {
      font-size: 16px;
      color: #475569;
      margin-bottom: 20px;
    }

    .account-details,
    .features-list {
      background: #f9fafb;
      padding: 20px;
      border-radius: 12px;
      margin: 24px 0;
      border: 1px solid #e2e8f0;
    }

    .account-details h3,
    .features-list h3 {
      font-size: 18px;
      margin-bottom: 16px;
      color: #0f172a;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 15px;
    }

    .detail-label {
      color: #64748b;
      font-weight: 500;
    }

    .detail-value {
      font-weight: 600;
      color: #0f172a;
    }

    .features-list ul {
      padding-left: 20px;
    }

    .features-list li {
      margin-bottom: 12px;
      color: #475569;
      list-style-type: '✓ ';
      list-style-position: inside;
    }

    .cta-button {
      display: inline-block;
      background: #0f172a;
      color: #ffffff;
      padding: 14px 28px;
      border-radius: 10px;
      text-decoration: none;
      font-size: 16px;
      font-weight: 600;
      margin-top: 16px;
      transition: all 0.2s ease;
    }

    .cta-button:hover {
      background: #1e293b;
    }

    .footer {
      text-align: center;
      font-size: 14px;
      color: #94a3b8;
      padding: 24px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
    }

    @media (max-width: 600px) {
      .content, .header {
        padding: 20px;
      }

      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .cta-button {
        width: 100%;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>🎉 Welcome to Skillment</h1>
      <p>Your ${data.organizationName} account is ready!</p>
    </header>

    <section class="content">
      <article class="welcome-message">
        <h2>Hello ${data.firstName} ${data.lastName},</h2>
        <p>Welcome to <strong>Skillment</strong>! Your account has been successfully created. You're now ready to start managing assessments and collaborating with your team.</p>
      </article>

      <section class="account-details">
        <h3>👤 Your Account</h3>
        <div class="detail-row">
          <span class="detail-label">Organization:</span>
          <span class="detail-value">${data.organizationName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">${data.email}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Plan:</span>
          <span class="detail-value">${data.plan}</span>
        </div>
      </section>

      <section class="features-list">
        <h3>🚀 What you can do now:</h3>
        <ul>
          <li>Create and manage assessments</li>
          <li>Invite participants and team members</li>
          <li>Track results and analytics</li>
          <li>Access AI-powered tools</li>
        </ul>
      </section>

      <a href="${data.loginUrl}" class="cta-button" target="_blank">Login to Dashboard</a>

      <p style="font-size: 14px; color: #64748b; margin-top: 24px;">If you need help, our support team is here for you anytime.</p>
    </section>

    <footer class="footer">
      <p>© ${new Date().getFullYear()} Skillment. All rights reserved.</p>
      <p>This email was sent to ${data.email}</p>
    </footer>
  </div>
</body>
</html>
    `;
  }

  private getTeamInvitationTemplate(data: TeamInvitationData): string {
    // Ensure permissions is an object and handle null/undefined cases
    const permissions = data.permissions || {};
    const permissionsList = Object.entries(permissions)
      .filter(([_, hasPermission]) => hasPermission)
      .map(([permission, _]) => permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
      .join(', ');

    return `
   <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Invitation - Skillment</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #0f172a;
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 25px 30px -10px rgba(0, 0, 0, 0.1);
      border: 1px solid #e0e7ff;
    }

    .header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .header::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.08)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.08)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.08)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.08)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.08)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.3;
    }

    .header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
      position: relative;
      z-index: 1;
    }

    .header p {
      font-size: 16px;
      opacity: 0.95;
      position: relative;
      z-index: 1;
    }

    .content {
      padding: 40px 30px;
      background: #ffffff;
    }

    .invitation-message h2 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #0f172a;
    }

    .invitation-message p {
      font-size: 16px;
      color: #475569;
      margin-bottom: 16px;
    }

    .invitation-details {
      background: linear-gradient(135deg, #dbeafe 0%, #c7d2fe 100%);
      padding: 24px;
      border-radius: 12px;
      border: 1px solid #a5b4fc;
      margin: 24px 0;
    }

    .invitation-details h3 {
      font-size: 18px;
      font-weight: 600;
      color: #4338ca;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #c7d2fe;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-weight: 500;
      color: #4f46e5;
    }

    .detail-value {
      font-weight: 600;
      color: #0f172a;
    }

    .permissions-list h3 {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .permissions-list ul {
      list-style: none;
      padding: 0;
    }

    .permissions-list li {
      padding: 12px 0;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #475569;
    }

    .permissions-list li:last-child {
      border-bottom: none;
    }

    .permissions-list li::before {
      content: '✓';
      color: #10b981;
      font-weight: bold;
      font-size: 16px;
    }

    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #ffffff;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(99, 102, 241, 0.4);
    }

    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 20px rgba(99, 102, 241, 0.25);
    }

    .footer {
      background: #f1f5f9;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }

    .footer p {
      color: #64748b;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .footer p:last-child {
      margin-bottom: 0;
    }

    @media (max-width: 640px) {
      body {
        padding: 10px;
      }

      .container {
        border-radius: 12px;
      }

      .header {
        padding: 30px 20px;
      }

      .header h1 {
        font-size: 28px;
      }

      .content {
        padding: 30px 20px;
      }

      .invitation-details {
        padding: 20px;
      }

      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>👥 Team Invitation</h1>
      <p>You've been invited to join a team on Skillment</p>
    </div>

    <div class="content">
      <div class="invitation-message">
        <h2>Hello ${data.firstName || 'there'},</h2>
        <p><strong>${data.inviterName}</strong> has invited you to join the team at <strong>${data.organizationName}</strong> on Skillment.</p>
      </div>

      <div class="invitation-details">
        <h3>📋 Invitation Details</h3>
        <div class="detail-row">
          <span class="detail-label">Organization:</span>
          <span class="detail-value">${data.organizationName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Role:</span>
          <span class="detail-value">${data.role}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Permissions:</span>
          <span class="detail-value">${permissionsList || 'Basic access'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Invited by:</span>
          <span class="detail-value">${data.inviterName}</span>
        </div>
      </div>

      <div class="permissions-list">
        <h3>🎯 What you'll be able to do:</h3>
        <ul>
          ${permissions.manageAssessments ? '<li>Create and manage assessments</li>' : ''}
          ${permissions.viewCandidates ? '<li>View candidate information</li>' : ''}
          ${permissions.manageCandidates ? '<li>Add and manage candidates</li>' : ''}
          ${permissions.viewReports ? '<li>Access reports and analytics</li>' : ''}
        </ul>
      </div>

      <a href="${data.invitationUrl}" class="cta-button">Accept Invitation</a>

      <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
        If you have any questions, please contact ${data.inviterName} or our support team.
      </p>
    </div>

    <div class="footer">
      <p>© 2024 Skillment. All rights reserved.</p>
      <p>This invitation was sent to ${data.email}</p>
    </div>
  </div>
</body>
</html>

    `;
  }

  private getAdminNotificationTemplate(data: AdminNotificationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Notification - Skillment</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #0f0f23;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 100vh;
            padding: 20px;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border: 1px solid #e2e8f0;
          }
          
          .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: #ffffff;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
          }
          
          .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          
          .content {
            padding: 40px 30px;
            background: #ffffff;
          }
          
          .notification-message {
            margin-bottom: 30px;
          }
          
          .notification-message h2 {
            font-size: 24px;
            font-weight: 600;
            color: #0f0f23;
            margin-bottom: 16px;
          }
          
          .notification-message p {
            font-size: 16px;
            color: #475569;
            margin-bottom: 16px;
          }
          
          .notification-details {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            border: 1px solid #f59e0b;
            border-left: 4px solid #f59e0b;
          }
          
          .notification-details h3 {
            font-size: 18px;
            font-weight: 600;
            color: #92400e;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #fde68a;
          }
          
          .detail-row:last-child {
            border-bottom: none;
          }
          
          .detail-label {
            font-weight: 500;
            color: #92400e;
          }
          
          .detail-value {
            font-weight: 600;
            color: #0f0f23;
          }
          
          .details-json {
            background: #f8fafc;
            padding: 16px;
            border-radius: 8px;
            margin-top: 16px;
            border: 1px solid #e2e8f0;
            overflow-x: auto;
          }
          
          .details-json pre {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 12px;
            color: #475569;
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
          }
          
          .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          
          .footer p {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 8px;
          }
          
          .footer p:last-child {
            margin-bottom: 0;
          }
          
          @media (max-width: 640px) {
            body {
              padding: 10px;
            }
            
            .container {
              border-radius: 12px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .header h1 {
              font-size: 28px;
            }
            
            .content {
              padding: 30px 20px;
            }
            
            .notification-details {
              padding: 20px;
            }
            
            .detail-row {
              flex-direction: column;
              align-items: flex-start;
              gap: 4px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Admin Notification</h1>
            <p>New activity on Skillment platform</p>
          </div>
          
          <div class="content">
            <div class="notification-message">
              <h2>Hello Admin,</h2>
              <p>A new action has been performed on the Skillment platform that requires your attention.</p>
            </div>
            
            <div class="notification-details">
              <h3>📋 Activity Details</h3>
              <div class="detail-row">
                <span class="detail-label">Action:</span>
                <span class="detail-value">${data.action}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Timestamp:</span>
                <span class="detail-value">${data.timestamp}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Details:</span>
              </div>
              <div class="details-json">
                <pre>${JSON.stringify(data.details, null, 2)}</pre>
              </div>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
              Please review this information and take any necessary actions.
            </p>
          </div>
          
          <div class="footer">
            <p>© 2024 Skillment. All rights reserved.</p>
            <p>This notification was sent to ${this.adminEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Sends credentials to a candidate, generates and stores password if needed, logs the email.
   * Returns the password sent.
   */
  async sendCandidateCredentialEmail(
    candidate: { id: string, name: string, email: string, assessmentId?: string }, 
    password?: string, 
    candidateId?: string, 
    assessmentTitle?: string
  ): Promise<string> {
    // 1. Check for existing credential
    let credential = await prisma.credential.findUnique({ where: { candidateId: candidate.id } });
    let generatedPassword = password;
    
    if (!credential) {
      // Create new credential
      generatedPassword = generatedPassword || Math.random().toString(36).slice(-10);
      const hash = await bcrypt.hash(generatedPassword, 10);
      credential = await prisma.credential.create({
        data: {
          candidateId: candidate.id,
          email: candidate.email,
          passwordHash: hash,
        },
      });
    } else {
      // If credential exists and no password provided, generate new one for resending
      if (!password) {
        generatedPassword = Math.random().toString(36).slice(-10);
        const hash = await bcrypt.hash(generatedPassword, 10);
        credential = await prisma.credential.update({
          where: { candidateId: candidate.id },
          data: { passwordHash: hash },
        });
      } else {
        // Use provided password
        generatedPassword = password;
      }
    }
    
    // 2. Fetch template
    const template = await prisma.emailTemplate.findFirst({ where: { name: "Send Credentials" } });
    const LOGIN_LINK = process.env.CANDIDATE_LOGIN_LINK || "http://localhost:3002/login";
    
    const emailData = {
      name: candidate.name,
      email: candidate.email,
      candidateId: candidateId || candidate.id,
      password: generatedPassword,
      assessmentTitle: assessmentTitle || 'Assessment',
      login_link: LOGIN_LINK,
    };
    
    const renderTemplate = (tpl: string, data: Record<string, string>) => 
      tpl.replace(/\{(.*?)\}/g, (_, key) => data[key] || '');
    
    const subject = template ? renderTemplate(template.subject, emailData) : 
      `Assessment Invitation: ${assessmentTitle || 'Your Assessment'} - Skillment Platform`;
    
    const body = template ? renderTemplate(template.body, emailData) : `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="format-detection" content="telephone=no">
        <meta name="x-apple-disable-message-reformatting">
        <title>Assessment Invitation - Skillment</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            background: #f8fafc;
            margin: 0;
            padding: 20px;
            color: #0f172a;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 32px 24px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .header p {
            margin: 8px 0 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .content {
            padding: 32px 24px;
          }
          .content h2 {
            color: #0f172a;
            font-size: 20px;
            margin-bottom: 16px;
            font-weight: 600;
          }
          .content p {
            color: #475569;
            line-height: 1.6;
            margin-bottom: 16px;
            font-size: 16px;
          }
          .credentials {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #e2e8f0;
          }
          .credentials h3 {
            color: #0f172a;
            margin-bottom: 16px;
            font-size: 16px;
            font-weight: 600;
          }
          .credential-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
            align-items: center;
          }
          .credential-item:last-child {
            border-bottom: none;
          }
          .credential-label {
            font-weight: 500;
            color: #64748b;
            font-size: 14px;
          }
          .credential-value {
            font-weight: 600;
            color: #0f172a;
            font-family: 'Courier New', monospace;
            background: #f1f5f9;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 14px;
          }
          .instructions {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
          }
          .instructions h4 {
            color: #92400e;
            margin: 0 0 12px;
            font-size: 16px;
            font-weight: 600;
          }
          .instructions ul {
            margin: 0;
            padding-left: 20px;
            color: #92400e;
          }
          .instructions li {
            margin-bottom: 8px;
            font-size: 14px;
          }
          .cta-button {
            display: inline-block;
            background: #1e40af;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 20px;
            font-size: 16px;
            border: none;
          }
          .footer {
            background: #f8fafc;
            padding: 20px 24px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
          }
          .footer p {
            margin: 4px 0;
          }
          .support-info {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            text-align: center;
          }
          .support-info p {
            margin: 0;
            color: #0369a1;
            font-size: 14px;
          }
          @media (max-width: 600px) {
            .container {
              margin: 10px;
              border-radius: 8px;
            }
            .header, .content {
              padding: 20px 16px;
            }
            .credential-item {
              flex-direction: column;
              align-items: flex-start;
              gap: 4px;
            }
            .cta-button {
              width: 100%;
              text-align: center;
              box-sizing: border-box;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Assessment Invitation</h1>
            <p>Skillment Assessment Platform</p>
          </div>
          
          <div class="content">
            <h2>Hello ${candidate.name},</h2>
            <p>You have been invited to participate in the assessment: <strong>${assessmentTitle || 'Assessment'}</strong></p>
            <p>This is an official invitation from the Skillment assessment platform. Please use the credentials below to access your assessment.</p>
            
            <div class="credentials">
              <h3>Login Credentials</h3>
              <div class="credential-item">
                <span class="credential-label">Candidate ID:</span>
                <span class="credential-value">${candidateId || candidate.id}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">Password:</span>
                <span class="credential-value">${generatedPassword}</span>
              </div>
            </div>
            
            <div class="instructions">
              <h4>Important Instructions</h4>
              <ul>
                <li>Use the credentials above to access the assessment platform</li>
                <li>Ensure you have a stable internet connection before starting</li>
                <li>Complete the assessment in one sitting without interruption</li>
                <li>Camera and microphone access may be required for proctoring</li>
                <li>Contact support if you experience any technical difficulties</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${LOGIN_LINK}" class="cta-button">Access Assessment Portal</a>
            </div>
            
            <div class="support-info">
              <p>Need help? Contact our support team for technical assistance.</p>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Skillment Assessment Platform</strong></p>
            <p>© 2024 Skillment. All rights reserved.</p>
            <p>This invitation was sent to: ${candidate.email}</p>
            <p>If you received this email in error, please ignore it.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // 3. Send email with text version
    const textVersion = `
Assessment Invitation - Skillment Platform

Hello ${candidate.name},

You have been invited to participate in the assessment: ${assessmentTitle || 'Assessment'}

This is an official invitation from the Skillment assessment platform. Please use the credentials below to access your assessment.

LOGIN CREDENTIALS:
Candidate ID: ${candidateId || candidate.id}
Password: ${generatedPassword}

IMPORTANT INSTRUCTIONS:
- Use the credentials above to access the assessment platform
- Ensure you have a stable internet connection before starting
- Complete the assessment in one sitting without interruption
- Camera and microphone access may be required for proctoring
- Contact support if you experience any technical difficulties

ACCESS YOUR ASSESSMENT:
${LOGIN_LINK}

Need help? Contact our support team for technical assistance.

---
Skillment Assessment Platform
© 2024 Skillment. All rights reserved.
This invitation was sent to: ${candidate.email}
If you received this email in error, please ignore it.
    `.trim();

    await this.sendEmail({
      to: candidate.email,
      subject,
      html: body,
      text: textVersion,
    });
    
    // 4. Log email
    await prisma.emailLog.create({
      data: {
        to: candidate.email,
        candidateId: candidate.id,
        assessmentId: candidate.assessmentId || null,
        templateId: template?.id || null,
        subject,
        body,
        status: "sent",
        sentAt: new Date(),
        createdById: "system",
      },
    });
    
    return generatedPassword;
  }

  // Public methods
  async sendWelcomeEmail(data: UserRegistrationData): Promise<boolean> {
    const subject = `Welcome to Skillment, ${data.firstName}!`;
    const html = this.getEmailTemplate('welcome', data);
    return this.sendEmail({
      to: data.email,
      subject,
      html,
    });
  }

  async sendTeamInvitation(data: TeamInvitationData): Promise<boolean> {
    const html = this.getEmailTemplate('teamInvitation', data);
    return this.sendEmail({
      to: data.email,
      subject: `You're invited to join ${data.organizationName} on Skillment`,
      html,
    });
  }

  async sendAdminNotification(data: AdminNotificationData): Promise<boolean> {
    const html = this.getEmailTemplate('adminNotification', data);
    return this.sendEmail({
      to: this.adminEmail,
      subject: `Admin Notification: ${data.action} - Skillment`,
      html,
    });
  }

  async sendUserRegistrationNotification(userData: UserRegistrationData): Promise<boolean> {
    const adminData: AdminNotificationData = {
      action: 'New User Registration',
      details: {
        user: {
          email: userData.email,
          name: `${userData.firstName} ${userData.lastName}`,
          organization: userData.organizationName,
          plan: userData.plan,
        },
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    return this.sendAdminNotification(adminData);
  }

  async sendTeamInvitationNotification(invitationData: TeamInvitationData): Promise<boolean> {
    const adminData: AdminNotificationData = {
      action: 'New Team Invitation',
      details: {
        invitation: {
          invitedEmail: invitationData.email,
          invitedName: `${invitationData.firstName || ''} ${invitationData.lastName || ''}`.trim() || 'N/A',
          organization: invitationData.organizationName,
          role: invitationData.role,
          inviter: invitationData.inviterName,
          permissions: invitationData.permissions || {},
        },
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    return this.sendAdminNotification(adminData);
  }

  /**
   * Sends welcome email to user, then notifies admin. Returns result of both.
   */
  async notifyUserAndAdminOnRegistration(userData: UserRegistrationData): Promise<{ user: boolean; admin: boolean; }> {
    const userResult = await this.sendWelcomeEmail(userData);
    const adminResult = await this.sendUserRegistrationNotification(userData);
    return { user: userResult, admin: adminResult };
  }

  /**
   * Sends team invitation email to user, then notifies admin. Returns result of both.
   */
  async notifyUserAndAdminOnTeamInvitation(invitationData: TeamInvitationData): Promise<{ user: boolean; admin: boolean; }> {
    const userResult = await this.sendTeamInvitation(invitationData);
    const adminResult = await this.sendTeamInvitationNotification(invitationData);
    return { user: userResult, admin: adminResult };
  }

  /**
   * Sends an OTP email to the user.
   */
  async sendOtpEmail(email: string, otp: string): Promise<boolean> {
    const subject = 'Your Skillment Verification Code';
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Skillment Email Verification</title>
    </head>
    <body style="margin:0; padding: 32px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #0f172a;">
    
      <div style="max-width: 480px; margin: auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
    
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0f0f23 0%, #1e293b 100%); color: #ffffff; padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">🔐 Verify Your Email</h1>
          <p style="margin-top: 8px; font-size: 14px; opacity: 0.85;">Welcome to Skillment</p>
        </div>
    
        <!-- Body -->
        <div style="padding: 32px;">
          <p style="font-size: 16px; margin: 0 0 12px;">Hi there,</p>
          <p style="font-size: 16px; color: #475569; margin: 0 0 24px;">Use the code below to verify your email address. This helps keep your account secure.</p>
    
          <div style="font-size: 32px; font-weight: 700; letter-spacing: 10px; color: #0f172a; background: #f1f5f9; padding: 16px; text-align: center; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
            ${otp}
          </div>
    
          <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">This code will expire in 10 minutes. If you did not request this email, you can safely ignore it.</p>
        </div>
    
        <!-- Footer -->
        <div style="text-align: center; padding: 24px; font-size: 12px; color: #9ca3af; background: #f9fafb; border-top: 1px solid #e2e8f0;">
          &copy; ${new Date().getFullYear()} Skillment. All rights reserved.
        </div>
    
      </div>
    
    </body>
    </html>
    `;
    
    return this.sendEmail({ to: email, subject, html });
  }
}

export const emailService = new EmailService(); 