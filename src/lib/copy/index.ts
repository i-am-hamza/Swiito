export const COPY = {
  nav: {
    browse: "Browse",
    howItWorks: "How it works",
    about: "About",
    listProperty: "List your property",
    signIn: "Owner login",
    logoAlt: "Swiito",
  },

  hero: {
    headline: "Find your next home in Ranchi.",
    subheadline: "Verified properties. Real photos. One number to call.",
    searchLocality: "Any locality",
    searchType: "Property type",
    searchBudget: "Budget",
    searchCta: "Search",
    trust: [
      "Every listing verified by our team",
      "No listing goes live unchecked",
      "Your details stay private",
    ],
  },

  featured: {
    heading: "Featured Properties",
    viewAll: "View all",
  },

  locality: {
    heading: "Browse by Locality",
    allLocalities: "All localities",
    comingSoon: "Coming soon",
    listingsSuffix: "listings",
  },

  howItWorks: {
    heading: "How it works",
    tabs: {
      tenants: "For Tenants",
      owners: "For Owners",
    },
    tenantSteps: [
      {
        step: "1",
        title: "Search by locality",
        body: "Browse verified listings across Hindpiri, Lalpur, Kanke, Bariatu and more.",
      },
      {
        step: "2",
        title: "Leave your details",
        body: "Fill in your name and mobile number on any listing — no account needed.",
      },
      {
        step: "3",
        title: "Get our number and call",
        body: "We instantly share Swiito's broker number. One call, real people, real answers.",
      },
    ],
    ownerSteps: [
      {
        step: "1",
        title: "Create an account",
        body: "Register as an owner — it's free and takes under a minute.",
      },
      {
        step: "2",
        title: "Post with photos",
        body: "Add your listing with real photos, honest details, and your preferred tenant.",
      },
      {
        step: "3",
        title: "We verify and publish",
        body: "Our team checks every listing before it goes live. Your number is never shown.",
      },
    ],
  },

  whySwiito: {
    heading: "Why Swiito",
  },

  ownerBand: {
    heading: "Own a property in Ranchi? List it free.",
    points: [
      "Free to list — no commission, no hidden fees",
      "We verify every enquiry before it reaches you",
      "Your number is never shown on the site",
    ],
    primaryCta: "List your property",
    secondaryCta: "Chat on WhatsApp",
  },

  recentlyAdded: {
    heading: "Recently Added",
    viewAll: "View all",
  },

  faq: {
    heading: "Frequently asked questions",
    viewAll: "View all FAQs",
  },

  footer: {
    tagline: "Verified properties. One number to call.",
    nav: [
      { label: "Browse listings", href: "/properties" },
      { label: "How it works", href: "/how-it-works" },
      { label: "About Swiito", href: "/about" },
      { label: "List your property", href: "/sign-up?role=owner" },
    ],
    localities: [
      { label: "Hindpiri", href: "/properties?locality=hindpiri" },
      { label: "Lalpur", href: "/properties?locality=lalpur" },
      { label: "Kanke", href: "/properties?locality=kanke" },
      { label: "Bariatu", href: "/properties?locality=bariatu" },
    ],
    legal: [
      { label: "Privacy policy", href: "/legal/privacy" },
      { label: "Terms of use", href: "/legal/terms" },
      { label: "Grievance", href: "/legal/grievance" },
    ],
    instagram: "https://www.instagram.com/city_vlogs7/",
    brokerLabel: "Broker contact",
    brokerNumber: "+91 74884 59279",
    copyright: `© ${new Date().getFullYear()} Swiito. All rights reserved.`,
  },

  whatsapp: {
    href: "https://wa.me/917488459279?text=Hi%20Swiito%2C%20I%27m%20looking%20for%20a%20place%20in%20Ranchi",
    ariaLabel: "Chat with Swiito on WhatsApp",
  },

  propertyCard: {
    verified: "Verified",
    scoreLabelPrefix: "Score",
    rentSuffix: "/mo",
    bedLabel: "bed",
    bathLabel: "bath",
    areaLabel: "sq ft",
  },

  search: {
    localityOptions: [
      { value: "", label: "Any locality" },
      { value: "hindpiri", label: "Hindpiri" },
      { value: "lalpur", label: "Lalpur" },
      { value: "kanke", label: "Kanke" },
      { value: "bariatu", label: "Bariatu" },
    ],
    typeOptions: [
      { value: "", label: "Any type" },
      { value: "flat", label: "Flat" },
      { value: "room", label: "Room" },
      { value: "independent_house", label: "Independent house" },
      { value: "pg", label: "PG / Hostel" },
      { value: "shop", label: "Shop" },
      { value: "office", label: "Office" },
      { value: "plot", label: "Plot" },
    ],
    budgetOptions: [
      { value: "", label: "Any budget" },
      { value: "5000", label: "Under ₹5,000" },
      { value: "10000", label: "₹5,000 – ₹10,000" },
      { value: "20000", label: "₹10,000 – ₹20,000" },
      { value: "30000", label: "₹20,000 – ₹30,000" },
      { value: "99999", label: "Above ₹30,000" },
    ],
  },
} as const;
