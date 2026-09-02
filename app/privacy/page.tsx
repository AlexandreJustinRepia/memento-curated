"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="container mx-auto px-6 max-w-3xl py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Last updated: September 2, 2026
          </p>

          <div className="mt-10 space-y-8 text-sm leading-7 text-zinc-300">
            <section>
              <h2 className="text-lg font-semibold text-white">
                1. Introduction
              </h2>
              <p>
                Memento Curated (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy
                and is committed to protecting your personal data in accordance
                with the <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong> and
                its implementing rules and regulations. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your
                information when you visit our website or place an order.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">
                2. Information We Collect
              </h2>
              <p>We may collect the following personal information:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  <strong>Identity data:</strong> name, email address, delivery
                  address, contact number
                </li>
                <li>
                  <strong>Order data:</strong> products purchased, order totals,
                  payment method, delivery instructions
                </li>
                <li>
                  <strong>Technical data:</strong> IP address, browser type,
                  device information, cookies and usage data
                </li>
                <li>
                  <strong>Communication data:</strong> messages or inquiries you
                  send to us
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">
                3. Purpose of Collection
              </h2>
              <p>
                We collect and process your personal data for the following
                legitimate purposes:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>To process and fulfill your orders</li>
                <li>To send order confirmations, updates, and receipts</li>
                <li>To respond to your inquiries and provide customer support</li>
                <li>To improve our products, services, and website experience</li>
                <li>To comply with legal and regulatory obligations</li>
                <li>To detect and prevent fraud or unauthorized transactions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">
                4. Data Sharing and Disclosure
              </h2>
              <p>
                We do not sell, trade, or rent your personal data to third
                parties. We may share your information only with:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  <strong>Service providers:</strong> delivery partners,
                  payment processors, and email service providers who assist in
                  fulfilling orders
                </li>
                <li>
                  <strong>Legal authorities:</strong> when required by law or
                  to protect our rights and safety
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">
                5. Data Retention
              </h2>
              <p>
                We retain your personal data only for as long as necessary to
                fulfill the purposes outlined in this policy, unless a longer
                retention period is required or permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">
                6. Your Rights Under RA 10173
              </h2>
              <p>
                As a data subject under the Data Privacy Act of 2012, you have
                the right to:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Be informed about the collection and use of your data</li>
                <li>Access your personal data held by us</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Erase or block your data under certain circumstances</li>
                <li>Object to the processing of your data</li>
                <li>File a complaint with the National Privacy Commission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">
                7. Security Measures
              </h2>
              <p>
                We implement reasonable administrative, technical, and physical
                safeguards to protect your personal data from unauthorized
                access, alteration, disclosure, or destruction. However, no
                method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">
                8. Cookies
              </h2>
              <p>
                Our website may use cookies and similar tracking technologies to
                enhance your browsing experience. You can disable cookies through
                your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">
                9. Children&apos;s Privacy
              </h2>
              <p>
                Our services are not directed to individuals under the age of 18.
                We do not knowingly collect personal data from children.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">
                10. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. The updated
                version will be indicated by an updated &quot;Last updated&quot; date. We
                encourage you to review this page periodically.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">
                11. Contact Us
              </h2>
              <p>
                If you have questions or concerns about this Privacy Policy or
                your personal data, please contact us at{" "}
                <a
                  href="mailto:mementocurated.ph@gmail.com"
                  className="text-gold-400 underline"
                >
                  mementocurated.ph@gmail.com
                </a>
                .
              </p>
            </section>
          </div>

          <div className="mt-12">
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:border-gold-400/40 hover:text-gold-400"
            >
              ← Back to store
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
