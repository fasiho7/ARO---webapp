import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

const LINKEDIN_URL = "https://www.linkedin.com/in/fasih-zeeshan";
const GITHUB_URL = "https://github.com/fasiho7";
const PHONE_DISPLAY = "+92 334 5324350";
const PHONE_HREF = "tel:+923345324350";

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const socials = [
  { label: "GitHub", href: GITHUB_URL, icon: GitHubIcon },
  { label: "LinkedIn", href: LINKEDIN_URL, icon: LinkedInIcon },
] as const;

const productLinks = [
  { href: "/ai-tutor", label: "AI Tutor" },
  { href: "/roadmaps", label: "Roadmaps" },
  { href: "/coding", label: "Coding Practice" },
  { href: "/progress", label: "Progress" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

const resourceLinks = [
  { href: "/roadmaps", label: "Career paths" },
  { href: "/roadmaps/software-engineer", label: "Software Engineer" },
  { href: "/roadmaps/fullstack-developer", label: "Full-Stack Developer" },
  { href: "/roadmaps/frontend-developer", label: "Frontend Developer" },
  { href: "/coding", label: "Coding Practice" },
] as const;

const companyLinks = [
  { href: "/", label: "About Aro" },
  { href: PHONE_HREF, label: "Contact" },
  { href: "#", label: "Careers" },
  { href: "#", label: "Campus Ambassador" },
] as const;

const legalLinks = [
  { href: "#", label: "Help Center" },
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms of Service" },
  { href: PHONE_HREF, label: "Contact Us" },
] as const;

const linkClass =
  "block min-h-10 py-2 text-sm text-muted transition-colors duration-200 hover:text-teal sm:min-h-0 sm:py-1.5";

function FooterLink({ href, label }: { href: string; label: string }) {
  if (href === "#") {
    return <span className={`${linkClass} cursor-default`}>{label}</span>;
  }
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={linkClass}>
        {label}
      </Link>
    );
  }

  return (
    <a href={href} className={linkClass}>
      {label}
    </a>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <h2 className="display text-[13px] font-semibold tracking-wide text-ink">
        {title}
      </h2>
      <ul className="mt-4">
        {links.map((link) => (
          <li key={link.label}>
            <FooterLink href={link.href} label={link.label} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MarketingFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-black/25 [data-theme=light]:bg-black/[0.03]">
      <div className="mx-auto max-w-[1180px] px-5 pt-14 pb-8 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-4">
            <Logo size={26} />
            <p className="display mt-4 text-sm font-medium text-ink">
              Learn to build software, step by step.
            </p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
              Aro is a learning platform for students and beginner developers to
              learn, practice, and build their path in software development.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-10 items-center justify-center rounded-lg border border-line text-muted transition duration-200 hover:border-teal/35 hover:bg-teal/10 hover:text-teal"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
            <div className="mt-6">
              <p className="text-[11px] font-medium tracking-wide text-muted uppercase">
                Get in touch
              </p>
              <a
                href={PHONE_HREF}
                className="mt-1 inline-block text-sm text-muted transition-colors duration-200 hover:text-teal"
              >
                {PHONE_DISPLAY}
              </a>
            </div>
            <p className="mt-5 text-xs text-muted">
              Built by{" "}
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-200 hover:text-teal"
              >
                Fasih Zeeshan
              </a>
            </p>
          </div>

          <div className="lg:col-span-2">
            <FooterColumn title="Product" links={productLinks} />
          </div>
          <div className="lg:col-span-2">
            <FooterColumn title="Resources" links={resourceLinks} />
          </div>
          <div className="lg:col-span-2">
            <FooterColumn title="Company" links={companyLinks} />
          </div>
          <div className="lg:col-span-2">
            <FooterColumn title="Support & Legal" links={legalLinks} />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Aro. All rights reserved.</p>
          <p>Built for the next generation of developers.</p>
        </div>
      </div>
    </footer>
  );
}
