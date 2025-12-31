import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendSuccessEmail = async (email: string) => {
  await resend.emails.send({
    from: "SEOTube <onboarding@resend.dev>",
    to: [email],
    subject: "SEO Optimization Completed",
    html: `
      <p>Your YouTube videos have been successfully SEO optimized.</p>
      <p>This was done automatically by SEOTube.</p>
    `,
  });
};
