export type SocialLink = {
  href: string;
  label: string;
};

export type CompanyDetails = {
  name: string;
  email: string;
  phone: string;
  socialLinks: SocialLink[];
};

export const companyDetails: CompanyDetails = {
  name: "TEKADIUS",
  email: "contact@tekadius.com",
  phone: "+234 814 209 9365",
  socialLinks: [
    {
      href: "https://www.linkedin.com/company/tekadius",
      label: "LinkedIn",
    },
    { href: "https://www.instagram.com/tekadius", label: "Instagram" },
    { href: "https://www.tiktok.com/@tekadius", label: "Tiktok" },
  ],
};
