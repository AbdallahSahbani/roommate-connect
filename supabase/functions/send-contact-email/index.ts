const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Contact email function invoked");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactEmailRequest = await req.json();
    
    console.log("Sending contact email from:", email);

    // Send confirmation email to user
    const userEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Roomates <onboarding@resend.dev>",
        to: [email],
        subject: "We received your message!",
        html: `
          <h1>Thank you for contacting us, ${name}!</h1>
          <p>We have received your message about: <strong>${subject}</strong></p>
          <p>We'll get back to you within 24 hours.</p>
          <p>Your message:</p>
          <blockquote>${message}</blockquote>
          <p>Best regards,<br>The Roomates Team</p>
        `,
      }),
    });

    if (!userEmailResponse.ok) {
      const errorData = await userEmailResponse.json();
      throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
    }

    const userEmailData = await userEmailResponse.json();
    console.log("User confirmation email sent:", userEmailData);

    // Send notification to admin (update with your admin email)
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Roomates <onboarding@resend.dev>",
        to: ["support@roomates.com"], // Update this with your actual admin email
        subject: `New Contact Form: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      }),
    });

    if (!adminEmailResponse.ok) {
      console.error("Failed to send admin notification");
    } else {
      const adminEmailData = await adminEmailResponse.json();
      console.log("Admin notification email sent:", adminEmailData);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

Deno.serve(handler);