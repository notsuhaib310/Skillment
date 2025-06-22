import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';

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
    };

    return templates[templateName] || '';
  }

  private getWelcomeTemplate(data: UserRegistrationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Skillment</title>
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
            background: linear-gradient(135deg, #0f0f23 0%, #1e293b 100%);
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
          
          .welcome-message {
            margin-bottom: 30px;
          }
          
          .welcome-message h2 {
            font-size: 24px;
            font-weight: 600;
            color: #0f0f23;
            margin-bottom: 16px;
          }
          
          .welcome-message p {
            font-size: 16px;
            color: #475569;
            margin-bottom: 16px;
          }
          
          .account-details {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            border: 1px solid #e2e8f0;
          }
          
          .account-details h3 {
            font-size: 18px;
            font-weight: 600;
            color: #0f0f23;
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
            border-bottom: 1px solid #e2e8f0;
          }
          
          .detail-row:last-child {
            border-bottom: none;
          }
          
          .detail-label {
            font-weight: 500;
            color: #64748b;
          }
          
          .detail-value {
            font-weight: 600;
            color: #0f0f23;
          }
          
          .features-list {
            margin: 24px 0;
          }
          
          .features-list h3 {
            font-size: 18px;
            font-weight: 600;
            color: #0f0f23;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .features-list ul {
            list-style: none;
            padding: 0;
          }
          
          .features-list li {
            padding: 12px 0;
            border-bottom: 1px solid #f1f5f9;
            display: flex;
            align-items: center;
            gap: 12px;
            color: #475569;
          }
          
          .features-list li:last-child {
            border-bottom: none;
          }
          
          .features-list li::before {
            content: '✓';
            color: #10b981;
            font-weight: bold;
            font-size: 16px;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #0f0f23 0%, #1e293b 100%);
            color: #ffffff;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            margin: 24px 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
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
            
            .account-details {
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
            <h1>🎉 Welcome to Skillment</h1>
            <p>Your ${data.organizationName} account is ready!</p>
          </div>
          
          <div class="content">
            <div class="welcome-message">
              <h2>Hello ${data.firstName} ${data.lastName},</h2>
              <p>Welcome to Skillment! Your account has been successfully created and you're now ready to start managing your assessments and team.</p>
            </div>
            
            <div class="account-details">
              <h3>📋 Account Details</h3>
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
            </div>
            
            <div class="features-list">
              <h3>🚀 What you can do now:</h3>
              <ul>
                <li>Create and manage assessments</li>
                <li>Invite participants and team members</li>
                <li>Track results and analytics</li>
                <li>Access AI-powered tools</li>
              </ul>
            </div>
            
            <a href="${data.loginUrl}" class="cta-button">Login to Dashboard</a>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
              If you have any questions, feel free to reach out to our support team.
            </p>
          </div>
          
          <div class="footer">
            <p>© 2024 Skillment. All rights reserved.</p>
            <p>This email was sent to ${data.email}</p>
          </div>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          
          .invitation-message {
            margin-bottom: 30px;
          }
          
          .invitation-message h2 {
            font-size: 24px;
            font-weight: 600;
            color: #0f0f23;
            margin-bottom: 16px;
          }
          
          .invitation-message p {
            font-size: 16px;
            color: #475569;
            margin-bottom: 16px;
          }
          
          .invitation-details {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            border: 1px solid #93c5fd;
          }
          
          .invitation-details h3 {
            font-size: 18px;
            font-weight: 600;
            color: #1e40af;
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
            border-bottom: 1px solid #bfdbfe;
          }
          
          .detail-row:last-child {
            border-bottom: none;
          }
          
          .detail-label {
            font-weight: 500;
            color: #1e40af;
          }
          
          .detail-value {
            font-weight: 600;
            color: #0f0f23;
          }
          
          .permissions-list {
            margin: 24px 0;
          }
          
          .permissions-list h3 {
            font-size: 18px;
            font-weight: 600;
            color: #0f0f23;
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
            border-bottom: 1px solid #f1f5f9;
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            margin: 24px 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
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

  // Public methods
  async sendWelcomeEmail(data: UserRegistrationData): Promise<boolean> {
    const html = this.getEmailTemplate('welcome', data);
    return this.sendEmail({
      to: data.email,
      subject: `Welcome to Skillment - Your ${data.organizationName} account is ready!`,
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
}

export const emailService = new EmailService(); 