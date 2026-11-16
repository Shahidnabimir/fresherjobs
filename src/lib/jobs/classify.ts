import type { Field, JobType, WorkMode } from "./types";

const FIELD_KEYWORDS: [Field, RegExp][] = [
  ["Creative/Design", /\b(design|designer|ui|ux|graphic|creative|illustrat|video edit|animator)/i],
  ["Tech/IT", /\b(software|developer|engineer(ing)? - ?(software|it)|frontend|backend|full ?stack|data|devops|cloud|qa|tester|it support|programmer|python|java|react|cyber|machine learning|ai)\b/i],
  ["Finance", /\b(financ|account|audit|tax|analyst|bank|investment|credit|ca\b|treasury)/i],
  ["Marketing", /\b(marketing|seo|content|social media|brand|digital|copywrit|pr\b|communications)/i],
  ["Sales", /\b(sales|business development|bde|bda|inside sales|account executive|telecaller)/i],
  ["HR/Operations", /\b(hr|human resources|recruit|talent|operations|supply chain|logistics|admin|payroll|procurement)/i],
  ["Core Engineering", /\b(mechanical|electrical|civil|chemical|production|manufactur|graduate engineer|get\b|plant|electronics)/i],
];

export function classifyField(text: string): Field {
  for (const [field, pattern] of FIELD_KEYWORDS) if (pattern.test(text)) return field;
  return "HR/Operations";
}

export function classifyJobType(title: string, employmentType?: string): JobType {
  const t = `${title} ${employmentType ?? ""}`;
  if (/\bintern(ship)?\b/i.test(t)) return "Internship";
  if (/\b(trainee|graduate program|apprentice|get)\b/i.test(t)) return "Graduate Trainee";
  return "Full-time";
}

export function classifyWorkMode(text: string, isRemote?: boolean): WorkMode {
  if (isRemote || /\bremote\b|work from home|wfh/i.test(text)) return "Remote";
  if (/\bhybrid\b/i.test(text)) return "Hybrid";
  return "On-site";
}
