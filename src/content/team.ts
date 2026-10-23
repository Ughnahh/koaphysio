/**
 * Team profiles. PLACEHOLDER COPY: bios, qualifications and interests must be
 * supplied and approved by Alyssa and Alma (AHPRA advertising guidelines apply).
 */
export interface TeamMember {
  id: string;
  slug: string;
  name: string;
  role: string;
  initials: string;
  bio: string[];
  interests: string[];
  /** e.g. AHPRA registration, degrees — to be supplied by the practitioner. */
  credentials: string;
}

export const team: TeamMember[] = [
  {
    id: "prac-alyssa",
    slug: "alyssa",
    name: "Alyssa",
    role: "Physiotherapist & Co-founder",
    initials: "A",
    bio: [
      "Alyssa works with people at every stage of recovery, from sudden injuries to longer-term pain that has been building for years.",
      "Her sessions focus on understanding how you move day to day, explaining what she finds in plain language, and building a plan you can keep up at home.",
    ],
    interests: ["Musculoskeletal injuries", "Post-operative rehabilitation", "Return to sport"],
    credentials: "Qualifications and AHPRA registration to be confirmed",
  },
  {
    id: "prac-alma",
    slug: "alma",
    name: "Alma",
    role: "Physiotherapist & Co-founder",
    initials: "A",
    bio: [
      "Alma has a particular interest in helping older adults stay strong, steady and independent in the places they live.",
      "She works closely with families, carers and aged care teams so that progress in a session carries over into everyday life.",
    ],
    interests: ["Aged care physiotherapy", "Balance and falls prevention", "Strength and conditioning"],
    credentials: "Qualifications and AHPRA registration to be confirmed",
  },
];

export function getTeamMember(id: string): TeamMember | undefined {
  return team.find((m) => m.id === id);
}
