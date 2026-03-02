import nodemailer from "nodemailer"
import type { Transporter } from "nodemailer"

function extractEmailAddress(value?: string): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  const match = trimmed.match(/<([^>]+)>/)
  return (match?.[1] || trimmed).trim()
}

function getMailAuthUser(): string | undefined {
  return process.env.MAIL_USER || extractEmailAddress(process.env.MAIL_FROM)
}

function getMailAuthPass(): string | undefined {
  return process.env.MAIL_PASS || process.env.MAIL_PASSWORD
}

// Initialize transporter
const transporterConfig = process.env.MAIL_HOST
  ? {
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || "587", 10),
      secure: process.env.MAIL_SECURE === "true",
      auth: {
        user: getMailAuthUser(),
        pass: getMailAuthPass(),
      },
    }
  : {
      service: process.env.MAIL_SERVICE || "gmail",
      auth: {
        user: getMailAuthUser(),
        pass: getMailAuthPass(),
      },
    }

const transporter: Transporter = nodemailer.createTransport(transporterConfig)

// Test connection on startup
transporter.verify((error: Error | null, success: boolean) => {
  if (error) {
    console.error("❌ Email service error:", error.message)
  } else if (success) {
    console.log("✅ Email service ready!")
  }
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface SendEmailResult {
  success: boolean
  error?: string
  errorCode?: string
}

export async function sendEmailDetailed(options: EmailOptions): Promise<SendEmailResult> {
  try {
    const mailFrom = process.env.MAIL_FROM
    const mailUser = getMailAuthUser()
    const mailPass = getMailAuthPass()

    if (!mailFrom || !mailUser || !mailPass) {
      console.error("❌ Email credentials missing:")
      console.error("   MAIL_FROM:", mailFrom ? "✓ Set" : "✗ Missing")
      console.error("   MAIL_USER:", mailUser ? "✓ Set" : "✗ Missing")
      console.error("   MAIL_PASS/MAIL_PASSWORD:", mailPass ? "✓ Set" : "✗ Missing")
      return {
        success: false,
        error: "Mail configuration missing. Set MAIL_FROM, MAIL_USER (or valid MAIL_FROM), and MAIL_PASS (or MAIL_PASSWORD).",
        errorCode: "MAIL_CONFIG_MISSING",
      }
    }

    console.log(`📧 Sending email to: ${options.to}`)
    
    const info = await transporter.sendMail({
      from: mailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`)
    return { success: true }
  } catch (error) {
    const err = error as NodeJS.ErrnoException & { response?: string; code?: string }
    console.error("❌ Error sending email:")
    console.error("   Error:", err?.message || String(error))
    if (err?.response) {
      console.error("   Response:", err.response)
    }

    const responseText = err?.response || ""
    const authFailed = responseText.includes("BadCredentials") || responseText.includes("Username and Password not accepted")

    return {
      success: false,
      error: authFailed
        ? "SMTP authentication failed. For Gmail, use a 16-character App Password and set MAIL_USER to your Gmail address."
        : err?.message || "Failed to send email",
      errorCode: authFailed ? "MAIL_AUTH_FAILED" : err?.code || "MAIL_SEND_FAILED",
    }
  }
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const result = await sendEmailDetailed(options)
  return result.success
}

export function getPasswordResetEmailHTML(
  resetLink: string,
  userType: "client" | "admin"
): string {
  const title = userType === "admin" ? "Admin" : "Account"
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9fafb;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .button {
          display: inline-block;
          background-color: #667eea;
          color: white;
          padding: 12px 30px;
          border-radius: 6px;
          text-decoration: none;
          margin: 20px 0;
          font-weight: 600;
        }
        .button:hover {
          background-color: #5568d3;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #666;
        }
        .warning {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 12px;
          margin: 20px 0;
          border-radius: 4px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your ${title} Password</h1>
          <p>Pooja Enterprise</p>
        </div>
        
        <div class="content">
          <p>Hello,</p>
          
          <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
          
          <p>To reset your password, click the button below:</p>
          
          <center>
            <a href="${resetLink}" class="button">Reset Password</a>
          </center>
          
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-size: 12px;">
            ${resetLink}
          </p>
          
          <div class="warning">
            <strong>⏱️ This link expires in 1 hour.</strong> If it expires, you can request a new one by visiting the forgot password page.
          </div>
          
          <p>For security reasons, we never send passwords via email. Never share this link with anyone.</p>
          
          <div class="footer">
            <p>© 2024 Pooja Enterprise. All rights reserved.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getPasswordResetEmailText(
  resetLink: string,
  userType: "client" | "admin"
): string {
  const title = userType === "admin" ? "Admin" : "Account"
  
  return `
Reset Your ${title} Password

Hello,

We received a request to reset your password. If you didn't make this request, you can ignore this email.

To reset your password, visit this link:
${resetLink}

This link expires in 1 hour. If it expires, you can request a new one by visiting the forgot password page.

For security reasons, we never send passwords via email. Never share this link with anyone.

© 2024 Pooja Enterprise. All rights reserved.
If you have any questions, please contact our support team.
  `
}
