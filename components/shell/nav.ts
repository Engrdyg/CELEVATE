import {
  Award,
  BarChart3,
  BookOpen,
  Bot,
  ClipboardCheck,
  LayoutDashboard,
  ListChecks,
  Settings,
  Sigma,
  Target,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, description: "Your review at a glance" },
  { href: "/review", label: "My Review", icon: ListChecks, description: "Resume, bookmarks and notes" },
  { href: "/subjects", label: "Subjects", icon: BookOpen, description: "Chapters and lessons" },
  { href: "/practice", label: "Practice Questions", icon: Target, description: "Solve problems with feedback" },
  { href: "/exams", label: "Mock Board Exams", icon: ClipboardCheck, description: "Timed examination practice" },
  { href: "/tutor", label: "AI Tutor", icon: Bot, description: "CELEVATE AI study assistant" },
  { href: "/formulas", label: "Formula Library", icon: Sigma, description: "Searchable engineering formulas" },
  { href: "/progress", label: "My Progress", icon: BarChart3, description: "Performance analytics" },
  { href: "/achievements", label: "Achievements", icon: Award, description: "Milestones and badges" },
  { href: "/settings", label: "Settings", icon: Settings, description: "Profile, appearance and data" },
];

/** Bottom-bar destinations on mobile (the fifth slot is "More"). */
export const MOBILE_PRIMARY = ["/dashboard", "/subjects", "/practice", "/exams"];

export function navFor(pathname: string) {
  return NAV_ITEMS.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"));
}
