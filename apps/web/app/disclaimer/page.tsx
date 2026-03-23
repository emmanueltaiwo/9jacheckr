import type { Metadata } from 'next';
import {
  AlertTriangle,
  BookOpen,
  Code2,
  Database,
  ShieldOff,
  Users,
} from 'lucide-react';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'Disclaimer · 9ja Checkr',
  description:
    'How 9ja Checkr relates to NAFDAC, what our data is for, and important limitations you should know.',
};

const SECTIONS = [
  {
    icon: ShieldOff,
    title: 'Independence & Non-Affiliation',
    id: 'independence',
    body: [
      '9ja Checkr is an independent service. It is not affiliated with, endorsed by, sponsored by, or operated by the National Agency for Food and Drug Administration and Control (NAFDAC) or any governmental authority.',
      'The 9ja Checkr name, brand, and all associated materials are not official NAFDAC materials.',
    ],
  },
  {
    icon: Database,
    title: 'Nature of the Service',
    id: 'nature',
    body: [
      '9ja Checkr provides a data lookup and automation layer that retrieves product registration information from publicly accessible NAFDAC channels and presents it in a structured format — via web interface, API, and messaging platforms.',
      '9ja Checkr does not represent, claim, or operate as an official NAFDAC verification service. It does not issue government-certified results.',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Accuracy & Data Limitations',
    id: 'accuracy',
    body: [
      'The accuracy, completeness, and timeliness of information provided depends on the availability and consistency of publicly accessible NAFDAC data, network and system conditions, and data extraction and parsing processes.',
      'Information may be incomplete, outdated, or inaccurate. 9ja Checkr may cache certain responses to improve performance. Always verify critical information directly with NAFDAC or other official sources.',
    ],
    list: [
      'NAFDAC register availability and consistency',
      'Network and upstream system conditions',
      'Data extraction, parsing, and caching processes',
    ],
  },
  {
    icon: Users,
    title: 'Appropriate Use',
    id: 'use',
    body: [
      '9ja Checkr is intended as a convenience and information tool. It should not be relied upon as the sole source of truth for legal, regulatory, medical, safety, or compliance-related decisions.',
      'Users are strongly advised to independently verify all critical information directly with NAFDAC and to comply with all applicable laws and regulations.',
    ],
  },
  {
    icon: Code2,
    title: 'API & Downstream Usage',
    id: 'api',
    body: [
      'Users integrating 9ja Checkr into their own applications are responsible for clearly communicating to their end users that data is sourced from an independent lookup service and does not constitute an official NAFDAC statement or certification.',
      'API users should ensure their own terms of service appropriately address data reliance, limitations, and liability.',
    ],
  },
  {
    icon: BookOpen,
    title: 'General Information Only',
    id: 'general',
    body: [
      'This document provides general information about 9ja Checkr and how to interpret its outputs. It does not constitute legal, regulatory, or professional advice.',
      'For any regulated, safety-critical, or high-stakes decisions, consult qualified professionals and refer directly to official NAFDAC channels.',
    ],
  },
] as const;

export default function DisclaimerPage() {
  return (
    <div
      className="min-h-dvh w-full min-w-0 overflow-x-hidden"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <SiteNav />

      <main className="relative mx-auto max-w-3xl min-w-0 px-4 pb-24 pt-32 sm:px-6 sm:pt-36">
        {/* Background glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-16 h-[300px] w-[500px] -translate-x-1/2 rounded-full opacity-[0.04] blur-[80px]"
          style={{ background: 'var(--accent)' }}
          aria-hidden
        />

        <div className="relative">
          {/* Page header */}
          <div className="mb-14">
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-medium"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-2)',
                background: 'var(--bg-raised)',
              }}
            >
              <AlertTriangle
                className="h-3 w-3"
                style={{ color: 'var(--accent)' }}
                aria-hidden
              />
              Important — please read
            </div>
            <h1 className="text-[clamp(2rem,5vw,2.8rem)] font-bold leading-[1.08] tracking-[-0.04em] text-foreground">
              Disclaimer &amp;{' '}
              <span style={{ color: 'var(--accent)' }}>Data Source</span>
            </h1>
            <p
              className="mt-4 max-w-xl text-[15px] leading-relaxed"
              style={{ color: 'var(--text-2)' }}
            >
              9ja Checkr is independent: it automates the same public NAFDAC
              registration lookup people use online and may cache responses. It
              is not affiliated with NAFDAC or any government agency. Below is
              what the service is and is not.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-28 rounded-2xl border p-6 sm:p-8"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    background: 'var(--bg-subtle)',
                  }}
                >
                  <div className="mb-4 flex items-start gap-4">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                      style={{
                        borderColor: 'var(--border)',
                        background: 'var(--bg-raised)',
                      }}
                    >
                      <Icon
                        className="h-4.5 w-4.5"
                        strokeWidth={1.75}
                        style={{ color: 'var(--accent)' }}
                        aria-hidden
                      />
                    </div>
                    <h2 className="pt-1 text-[16px] font-semibold text-foreground">
                      {section.title}
                    </h2>
                  </div>

                  <div className="space-y-3 pl-[52px]">
                    {section.body.map((para, i) => (
                      <p
                        key={i}
                        className="text-[14px] leading-relaxed"
                        style={{ color: 'var(--text-2)' }}
                      >
                        {para}
                      </p>
                    ))}
                    {'list' in section && section.list ? (
                      <ul className="mt-2 space-y-1.5">
                        {section.list.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2 text-[13px] leading-relaxed"
                            style={{ color: 'var(--text-2)' }}
                          >
                            <span
                              className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                              style={{ background: 'var(--accent)' }}
                              aria-hidden
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Official link callout */}
          <div
            className="mt-8 flex gap-4 rounded-2xl border p-6"
            style={{
              borderColor: 'rgba(223,255,31,0.2)',
              background: 'rgba(223,255,31,0.03)',
            }}
          >
            <span className="text-xl" aria-hidden>
              💡
            </span>
            <div>
              <p className="text-[14px] font-semibold text-foreground">
                For the official NAFDAC register
              </p>
              <p
                className="mt-1 text-[13px] leading-relaxed"
                style={{ color: 'var(--text-2)' }}
              >
                Visit{' '}
                <a
                  href="https://www.nafdac.gov.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline underline-offset-2 transition-colors hover:text-foreground"
                  style={{ color: 'var(--accent)' }}
                >
                  nafdac.gov.ng
                </a>{' '}
                for official verification, regulatory information, and reporting
                counterfeits or unregistered products.
              </p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
