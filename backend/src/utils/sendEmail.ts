import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendSuccessEmail = async (email: string, videos: any[], aiUpdates: any[]) => {
  const videoRows = aiUpdates.map(update => {
    const old = videos.find(v => v.videoId === update.videoId) || {};

    return `
      <div style="margin-bottom: 32px; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; background: rgba(255,255,255,0.02);">
        <div style="background: linear-gradient(90deg, #1e1e2e, #11111b); padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.08);">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div style="flex: 1;">
              <span style="font-size: 11px; text-transform: uppercase; color: #7c5cff; font-weight: 700; letter-spacing: 1px;">VIDEO OPTIMIZED</span>
              <h3 style="margin: 4px 0 0; color: #fff; font-size: 16px;">${update.title}</h3>
            </div>
            <div style="margin-left: 16px; text-align: center;">
              <div style="background: #22c55e; color: #000; font-weight: 800; padding: 4px 12px; border-radius: 8px; font-size: 18px;">${update.seoScore}</div>
              <div style="font-size: 9px; color: #9aa4b2; margin-top: 4px; font-weight: 700;">SEO SCORE</div>
            </div>
          </div>
        </div>
        
        <div style="padding: 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="table-layout: fixed;">
            <tr>
              <td width="48%" valign="top" style="padding-right: 2%;">
                <div style="font-size: 11px; color: #f87171; font-weight: 700; margin-bottom: 8px; text-transform: uppercase;">Previous Metadata</div>
                <div style="font-size: 13px; color: #9aa4b2; line-height: 1.5;">
                  <strong>Title:</strong> ${old.title || "N/A"}<br><br>
                  <strong>Desc:</strong> ${old.description ? old.description.substring(0, 100) + "..." : "N/A"}<br><br>
                  <strong>Tags:</strong> ${old.tags ? old.tags.join(", ").substring(0, 80) + "..." : "N/A"}
                </div>
              </td>
              <td width="2%" style="border-left: 1px solid rgba(255,255,255,0.08);"></td>
              <td width="48%" valign="top" style="padding-left: 2%;">
                <div style="font-size: 11px; color: #4ade80; font-weight: 700; margin-bottom: 8px; text-transform: uppercase;">New Optimized Metadata</div>
                <div style="font-size: 13px; color: #e6eef8; line-height: 1.5;">
                  <strong>Title:</strong> ${update.title}<br><br>
                  <strong>Desc:</strong> ${update.description.substring(0, 150)}...<br><br>
                  <strong>Tags:</strong> ${update.tags.join(", ").substring(0, 100)}...
                </div>
              </td>
            </tr>
          </table>
        </div>
      </div>
    `;
  }).join("");

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
        </head>
        <body style="background: #09090b; color: #e6eef8; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px;">
          <div style="max-width: 650px; margin: 0 auto;">
            <!-- Header Section -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -1px;">SEO<span style="color: #ff0000;">Tube</span></h1>
              <p style="color: #9aa4b2; font-size: 16px; margin-top: 8px;">AI-Driven Channel Growth Intelligence</p>
            </div>

            <!-- Hero Section (Creative Update) -->
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #09090b 100%); border: 1px solid rgba(124, 92, 255, 0.3); border-radius: 24px; padding: 50px 40px; margin-bottom: 40px; text-align: center; position: relative; box-shadow: 0 10px 40px -10px rgba(124, 92, 255, 0.2);">
              <div style="position: relative; z-index: 2;">
                <div style="display: inline-block; padding: 8px 16px; background: rgba(124, 92, 255, 0.1); border-radius: 100px; color: #7c5cff; font-size: 12px; font-weight: 800; letter-spacing: 2px; margin-bottom: 20px; border: 1px solid rgba(124, 92, 255, 0.2);">SYSTEM UPDATE</div>
                <h2 style="font-size: 28px; font-weight: 800; margin-bottom: 16px; color: #fff; line-height: 1.2;">Optimization Cycle Complete</h2>
                <p style="color: #c7d3e2; font-size: 17px; line-height: 1.6; margin: 0 auto; max-width: 500px;">
                  We've analyzed your latest performances and deployed high-impact metadata updates to boost your channel's reach. Your videos are now primed for the YouTube algorithm.
                </p>
              </div>
            </div>

            <!-- Report Section -->
            <h2 style="font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 24px; padding-left: 12px; border-left: 4px solid #7c5cff;">SEO Impact Report</h2>
            
            ${videoRows}

            <!-- Footer Section -->
            <div style="text-align: center; margin-top: 48px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 32px;">
              <p style="color: #9aa4b2; font-size: 14px; margin: 0;">Automating your YouTube success, one video at a time.</p>
              <div style="margin-top: 16px; font-size: 12px; color: #4b5563;">
                 © 2026 SEOTube. All rights reserved.<br>
                 You are receiving this because your channel is enrolled in Auto-SEO cycles.
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  });
};


export const sendReminderEmail = async (email: string, ideas: string[]) => {
    const ideaRows = ideas.map(idea => `
      <li style="margin-bottom:10px; list-style: none;">
        <div style="background: linear-gradient(90deg,#0f1724,#071022); border: 1px solid rgba(255,255,255,0.04); padding: 12px 14px; border-radius: 12px; color: #e6eef8;">
          ${idea}
        </div>
      </li>
    `).join("");

    try {
        await resend.emails.send({
            from: "SEOTube <onboarding@resend.dev>",
            to: [email],
            subject: "We miss your content! Here are some ideas 💡",
            html: `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <title>We miss your content!</title>
        </head>
        <body style="background: #09090b; color: #e6eef8; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px;">
          <div style="max-width: 650px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px;">SEO<span style="color: #ff0000;">Tube</span></h1>
              <p style="color: #9aa4b2; font-size: 14px; margin-top: 8px;">AI-Generated Video Ideas to Jumpstart Uploads</p>
            </div>

            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #09090b 100%); border: 1px solid rgba(124, 92, 255, 0.12); border-radius: 20px; padding: 28px; margin-bottom: 28px; text-align: center;">
              <div style="display: inline-block; padding: 6px 12px; background: rgba(124,92,255,0.08); border-radius: 100px; color: #7c5cff; font-size: 12px; font-weight: 800; letter-spacing: 1px; margin-bottom: 12px; border: 1px solid rgba(124,92,255,0.12);">REMINDER</div>
              <h2 style="font-size: 20px; margin: 8px 0 12px; color: #fff;">You haven't uploaded in ${process.env.REMINDER_THRESHOLD_DAYS || 'a while'} days</h2>
              <p style="color: #c7d3e2; font-size: 15px; line-height: 1.6; margin: 0 auto; max-width: 520px;">Consistent uploads help your channel grow. Here are a few AI-generated ideas to help you get back on track.</p>
            </div>

            <h3 style="font-size: 16px; margin-bottom: 12px; color: #fff;">AI Video Ideas</h3>
            <ul style="padding: 0; margin: 0 0 20px 0;">
              ${ideaRows}
            </ul>

            <div style="text-align: center; margin-top: 8px;">
              <a href="${process.env.FRONTEND_BASE || '#'}" style="display: inline-block; text-decoration: none; background: linear-gradient(90deg,#7c5cff,#5b3bff); color: #fff; padding: 12px 20px; border-radius: 10px; font-weight: 700;">Open SEOTube Dashboard</a>
            </div>

            <div style="text-align: center; margin-top: 36px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; color: #9aa4b2; font-size: 13px;">
              <div>Automating your YouTube success, one video at a time.</div>
              <div style="margin-top:8px; font-size:12px; color:#657085;">© 2026 SEOTube. All rights reserved.</div>
            </div>
          </div>
        </body>
      </html>
            `,
        });
    } catch (err) {
        console.error("Failed to send reminder email:", err);
    }
};
