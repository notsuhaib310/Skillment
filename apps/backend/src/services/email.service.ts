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
        from: process.env.FROM_EMAIL || 'no-reply@skillment.in',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
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
  async sendCandidateCredentialEmail(candidate: { id: string, name: string, email: string, assessmentId?: string }, password?: string): Promise<string> {
    // 1. Check for existing credential
    let credential = await prisma.credential.findUnique({ where: { candidateId: candidate.id } });
    let generatedPassword = password;
    if (!credential) {
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
      // If credential exists, do not overwrite password, but send placeholder
      generatedPassword = "(already set)";
    }
    // 2. Fetch template
    const template = await prisma.emailTemplate.findFirst({ where: { name: "Send Credentials" } });
    const LOGIN_LINK = process.env.CANDIDATE_LOGIN_LINK || "https://candidate.skillment.in/login";
    const emailData = {
      name: candidate.name,
      email: candidate.email,
      password: generatedPassword,
      login_link: LOGIN_LINK,
    };
    const renderTemplate = (tpl: string, data: Record<string, string>) => tpl.replace(/\{(.*?)\}/g, (_, key) => data[key] || '');
    const subject = template ? renderTemplate(template.subject, emailData) : "Your Skillment Login Credentials";
    const body = template ? renderTemplate(template.body, emailData) :
      `<p>Hello ${candidate.name},</p><p>Your Candidate ID: <b>${candidate.id}</b><br/>Password: <b>${generatedPassword}</b><br/><a href="${LOGIN_LINK}">Login here</a></p>`;
    // 3. Send email
    await this.sendEmail({
      to: candidate.email,
      subject,
      html: body,
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