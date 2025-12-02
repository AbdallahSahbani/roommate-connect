import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8 text-foreground">Terms of Service</h1>
        
        <div className="prose prose-slate max-w-none space-y-6 text-foreground/80">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Roomates, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Use of Service</h2>
            <p>
              Roomates provides a platform for connecting renters with roommates and landlords with properties. You agree to use 
              our service only for lawful purposes and in accordance with these Terms.
            </p>
            <p className="mt-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Use the service for any illegal or unauthorized purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Infringe on the rights of others</li>
              <li>Transmit any harmful or malicious code</li>
              <li>Attempt to gain unauthorized access to the service</li>
              <li>Use the service to harass, abuse, or harm another person</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. User Accounts</h2>
            <p>
              To use certain features of our service, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Updating your information to keep it current</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Verification and Background Checks</h2>
            <p>
              Roomates offers identity verification, income verification, and background check services. By using these services, 
              you authorize us to obtain and verify information about you. However, we do not guarantee the accuracy of all 
              information provided by users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Subscriptions and Payments</h2>
            <p>
              Certain features of Roomates require a paid subscription. By subscribing, you agree to pay all fees associated 
              with your subscription plan. Subscriptions automatically renew unless cancelled before the renewal date.
            </p>
            <p className="mt-4">
              We offer a trial period for new users. Trial periods automatically convert to paid subscriptions unless cancelled 
              before the trial ends.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Property Listings</h2>
            <p>
              Landlords are responsible for the accuracy of their property listings. Roomates does not guarantee the availability, 
              condition, or legality of any listed property. We recommend conducting your own due diligence before entering into 
              any rental agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. User Content</h2>
            <p>
              You retain ownership of any content you submit to Roomates. However, by posting content, you grant us a 
              non-exclusive, worldwide, royalty-free license to use, display, and distribute your content in connection with 
              our service.
            </p>
            <p className="mt-4">
              You represent that you have all necessary rights to any content you post and that your content does not violate 
              any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Disclaimer of Warranties</h2>
            <p>
              Roomates is provided "as is" without warranties of any kind, either express or implied. We do not warrant that 
              the service will be uninterrupted, secure, or error-free. We do not guarantee the results that may be obtained 
              from using the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Roomates shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, 
              or any loss of data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Roomates, its affiliates, and their respective officers, directors, 
              employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising 
              from your use of the service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time, with or without notice, for any reason, 
              including violation of these Terms. You may terminate your account at any time through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of California, without 
              regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">13. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting 
              the updated Terms on our website. Your continued use of the service after changes constitutes acceptance of the 
              modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">14. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="mt-2">
              Email: legal@roomates.com<br />
              Address: San Francisco, CA
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-8">
            Last Updated: December 2, 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
