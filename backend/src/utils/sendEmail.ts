import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendSuccessEmail = async (email: string) => {
  await resend.emails.send({
    from: "SEOTube <onboarding@resend.dev>",
    to: [email],
    subject: "SEO Optimization Completed",
    html: `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <title>SEO Optimization Completed</title>
          <style>
            body { background: #0b0d10; color: #e6eef8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; margin:0; padding:24px; }
            .container { max-width:680px; margin:0 auto; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border:1px solid rgba(255,255,255,0.04); border-radius:12px; padding:28px; }
            .brand { display:flex; align-items:center; gap:12px; }
            h1 { font-size:20px; margin:10px 0 6px; }
            p { margin:8px 0; color:#c7d3e2; }
            .hero { background: linear-gradient(180deg, rgba(0, 0, 0, 0.06), rgba(0, 81, 255, 0.03)); padding:16px; border-radius:10px; margin-top:14px; }
            .btn { display:inline-block; margin-top:14px; padding:10px 16px; border-radius:10px; background:linear-gradient(90deg,#7c5cff,#2563eb); color:white; text-decoration:none; font-weight:600; }
            .footer { margin-top:18px; font-size:13px; color:#97a6b8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand">
              <div>
                <div style="font-weight:700">SEOTube</div>
                <div style="font-size:13px;color:#97a6b8">Automatic SEO optimization</div>
              </div>
            </div>

            <h1>✨ SEO Optimization Complete</h1>

            <div class="hero">
              <p>Good news — we've finished optimizing your YouTube videos. We've applied SEO improvements so your content has a better chance to reach the right viewers.</p>
              <p>This process runs automatically and will continue to improve your channel over time.</p>
              <a class="btn" href="http://localhost:5173/">Open SEOTube</a>
            </div>

            <p class="footer">Thank you for using SEOTube — the team that helps your videos get discovered. If you have any questions, reply to this email and we'll be happy to help.</p>
          </div>
        </body>
      </html>
    `,
  });
};
