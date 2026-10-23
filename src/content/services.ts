/**
 * Service content and booking configuration.
 *
 * PLACEHOLDER COPY pending client review. Avoid outcome guarantees or claims
 * of cure (AHPRA advertising guidelines). Durations are placeholders.
 * In Phase 2, durations/modes move to the database and are managed in admin.
 */
import type { DeliveryMode } from "@/lib/booking/types";

export type ServiceIcon = "runner" | "spine" | "dumbbell" | "seated";

export interface ServiceContent {
  id: string;
  slug: string;
  name: string;
  /** Two-line title used in the homepage feature row. */
  displayLines: [string, string];
  icon: ServiceIcon;
  summary: string;
  intro: string;
  helpsWith: string[];
  whatToExpect: { title: string; body: string }[];
  durationMin: number;
  bufferAfterMin: number;
  modes: DeliveryMode[];
  practitionerIds: string[];
}

export const services: ServiceContent[] = [
  {
    id: "svc-msk",
    slug: "musculoskeletal-physiotherapy",
    name: "Musculoskeletal Physiotherapy",
    displayLines: ["Musculoskeletal", "Physiotherapy"],
    icon: "runner",
    summary: "Assessment and treatment for injuries, pain and movement limitations.",
    intro:
      "Whether it's a recent strain or pain that has crept up over time, we take the time to understand what's going on and build a plan around your goals.",
    helpsWith: [
      "Back and neck pain",
      "Shoulder, hip and knee pain",
      "Sprains and strains",
      "Sporting and work-related injuries",
      "Postural and desk-related discomfort",
      "Tendon problems",
    ],
    whatToExpect: [
      {
        title: "A thorough assessment",
        body: "We talk through your history and goals, then look at how you move to understand what's contributing to your symptoms.",
      },
      {
        title: "A clear explanation",
        body: "You'll leave knowing what we found, what we think is going on, and what the plan is from here.",
      },
      {
        title: "Hands-on care and exercise",
        body: "Treatment may include manual therapy, education and a targeted exercise program you can do at home.",
      },
    ],
    durationMin: 60,
    bufferAfterMin: 15,
    modes: ["clinic", "home"],
    practitionerIds: ["prac-alyssa", "prac-alma"],
  },
  {
    id: "svc-postop",
    slug: "post-operative-rehabilitation",
    name: "Post-Operative Rehabilitation",
    displayLines: ["Post-Operative", "Rehabilitation"],
    icon: "spine",
    summary: "Supported recovery to help you regain strength, movement and independence.",
    intro:
      "Recovering from surgery is a step-by-step process. We work alongside your surgeon's protocol to guide you safely from early mobility back to the activities you enjoy.",
    helpsWith: [
      "Joint replacement (hip, knee, shoulder)",
      "ACL and other ligament reconstruction",
      "Spinal surgery",
      "Fracture recovery",
      "Arthroscopic procedures",
    ],
    whatToExpect: [
      {
        title: "Working with your surgical team",
        body: "We follow your surgeon's guidelines and keep them informed of your progress where appropriate.",
      },
      {
        title: "Staged, measurable goals",
        body: "Each phase of rehab has clear milestones so you can see how you're progressing.",
      },
      {
        title: "Care where you need it",
        body: "Early sessions can take place at home when getting to a clinic is difficult.",
      },
    ],
    durationMin: 60,
    bufferAfterMin: 15,
    modes: ["clinic", "home"],
    practitionerIds: ["prac-alyssa", "prac-alma"],
  },
  {
    id: "svc-strength",
    slug: "strength-and-conditioning",
    name: "Strength & Conditioning",
    displayLines: ["Strength &", "Conditioning"],
    icon: "dumbbell",
    summary: "Build strength, improve function and reduce the risk of future injuries.",
    intro:
      "Strength underpins how we move through every part of life. Our physiotherapy-led programs are tailored to your body, your history and what you want to be able to do.",
    helpsWith: [
      "Returning to the gym or sport after injury",
      "Building general strength and fitness",
      "Managing persistent pain through exercise",
      "Pre-surgery conditioning",
      "Bone health and healthy ageing",
    ],
    whatToExpect: [
      {
        title: "A starting point that suits you",
        body: "We assess your current strength and movement so your program starts at the right level.",
      },
      {
        title: "A program you understand",
        body: "Every exercise has a purpose, and we'll explain it so you can train with confidence.",
      },
      {
        title: "Regular progressions",
        body: "We review and progress your program as you get stronger.",
      },
    ],
    durationMin: 45,
    bufferAfterMin: 15,
    modes: ["clinic", "home"],
    practitionerIds: ["prac-alyssa", "prac-alma"],
  },
  {
    id: "svc-aged",
    slug: "aged-care-physiotherapy",
    name: "Aged Care Physiotherapy",
    displayLines: ["Aged Care", "Physiotherapy"],
    icon: "seated",
    summary: "Individualised care to support mobility, independence and quality of life.",
    intro:
      "We help older adults stay active and confident at home or in residential care, working with families, carers and care teams.",
    helpsWith: [
      "Balance and falls prevention",
      "Mobility and walking confidence",
      "Strength for everyday tasks",
      "Recovery after a hospital stay",
      "Arthritis and joint stiffness",
      "Mobility aid recommendations",
    ],
    whatToExpect: [
      {
        title: "Care in familiar surroundings",
        body: "Sessions usually take place at home or in your residence, where we can see the everyday challenges first-hand.",
      },
      {
        title: "Practical, achievable goals",
        body: "We focus on what matters to you — getting out of a chair, walking to the letterbox, or getting back to the garden.",
      },
      {
        title: "Collaboration with your care team",
        body: "With your consent, we share updates with your GP, family or care provider.",
      },
    ],
    durationMin: 45,
    bufferAfterMin: 15,
    modes: ["home", "clinic"],
    practitionerIds: ["prac-alma", "prac-alyssa"],
  },
];

export function getService(slug: string): ServiceContent | undefined {
  return services.find((s) => s.slug === slug);
}
