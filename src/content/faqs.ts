/**
 * FAQs. PLACEHOLDER COPY: fees, rebates, funding and policies must be
 * confirmed by the client before launch.
 */
export interface FaqGroup {
  id: string;
  title: string;
  items: { q: string; a: string }[];
}

export const faqGroups: FaqGroup[] = [
  {
    id: "booking",
    title: "Booking & appointments",
    items: [
      {
        q: "Do I need a referral to see a physiotherapist?",
        a: "No. You can book directly without a referral. If you're using a GP care plan, DVA or another funding program, you may need a referral for that funding to apply.",
      },
      {
        q: "How does online booking work?",
        a: "Choose a service, practitioner and time, then send your request. Your request is reviewed by our team and you'll receive an email once it's confirmed. Your appointment isn't booked until you receive that confirmation.",
      },
      {
        q: "How long will it take to confirm my request?",
        a: "We aim to respond within one business day. If we can't confirm your requested time, we'll suggest an alternative.",
      },
      {
        q: "How long is an appointment?",
        a: "Most appointments are 45 to 60 minutes. The booking page shows the length of each service.",
      },
      {
        q: "What is your cancellation policy?",
        a: "Please let us know as early as possible if you need to cancel or reschedule. Our full cancellation policy will be confirmed here.",
      },
    ],
  },
  {
    id: "visits",
    title: "Your visit",
    items: [
      {
        q: "What should I bring?",
        a: "Any relevant scans, reports or referral letters, a list of current medications, and comfortable clothing that lets us see the area being treated.",
      },
      {
        q: "What happens at the first appointment?",
        a: "We'll talk through your history and goals, assess how you move, explain what we find and agree on a plan together.",
      },
      {
        q: "Can a family member or carer attend?",
        a: "Absolutely. Family members and carers are welcome, and are often a big help with home programs.",
      },
    ],
  },
  {
    id: "home-visits",
    title: "Home visits",
    items: [
      {
        q: "Which areas do you visit?",
        a: "We visit a defined set of suburbs. You can check your suburb on our Home Visits page or when booking.",
      },
      {
        q: "Do I need any equipment at home?",
        a: "No. We bring what we need. A clear space to move and a stable chair are helpful.",
      },
      {
        q: "Is there an extra fee for home visits?",
        a: "Home visit fees will be listed here once confirmed.",
      },
    ],
  },
  {
    id: "fees",
    title: "Fees & funding",
    items: [
      {
        q: "Can I claim with private health insurance?",
        a: "If your extras cover includes physiotherapy, you may be able to claim a rebate. Check with your insurer for your level of cover.",
      },
      {
        q: "Do you accept Medicare, DVA, NDIS or aged care funding?",
        a: "Accepted funding programs will be confirmed here. Please contact us if you have questions about your situation.",
      },
    ],
  },
];
