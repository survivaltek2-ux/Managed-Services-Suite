import { useEffect } from "react";

const ORG = {
  name: "Siebert Services",
  legalName: "Siebert Repair Services LLC",
  url: "https://siebertservices.com",
  logo: "https://siebertservices.com/favicon.svg",
  telephone: "+1-866-484-9180",
  email: "support@siebertrservices.com",
  address: {
    streetAddress: "4 Maple Court",
    addressLocality: "Washingtonville",
    addressRegion: "NY",
    postalCode: "10992",
    addressCountry: "US",
  },
  areaServed: [
    "Hudson Valley",
    "Orange County NY",
    "Rockland County NY",
    "Westchester County NY",
    "Dutchess County NY",
    "New York Metro",
  ],
  sameAs: [
    "https://www.linkedin.com/company/siebert-services",
  ],
};

type Crumb = { name: string; url: string };

export type SchemaProps =
  | { type: "Organization" }
  | { type: "LocalBusiness" }
  | { type: "Service"; name: string; description: string; serviceType?: string }
  | { type: "Article"; headline: string; datePublished: string; author?: string; image?: string; description?: string }
  | { type: "FAQPage"; faqs: { question: string; answer: string }[] }
  | { type: "BreadcrumbList"; crumbs: Crumb[] }
  | { type: "WebPage"; name: string; description?: string };

function buildSchema(props: SchemaProps): Record<string, unknown> {
  const base = { "@context": "https://schema.org" };

  switch (props.type) {
    case "Organization":
      return {
        ...base,
        "@type": "Organization",
        name: ORG.name,
        legalName: ORG.legalName,
        url: ORG.url,
        logo: ORG.logo,
        sameAs: ORG.sameAs,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: ORG.telephone,
          contactType: "customer service",
          email: ORG.email,
          areaServed: "US",
          availableLanguage: ["English"],
        },
      };
    case "LocalBusiness":
      return {
        ...base,
        "@type": ["LocalBusiness", "ProfessionalService"],
        name: ORG.name,
        url: ORG.url,
        telephone: ORG.telephone,
        email: ORG.email,
        image: ORG.logo,
        priceRange: "$$",
        address: { "@type": "PostalAddress", ...ORG.address },
        areaServed: ORG.areaServed.map((n) => ({ "@type": "AdministrativeArea", name: n })),
        sameAs: ORG.sameAs,
      };
    case "Service":
      return {
        ...base,
        "@type": "Service",
        name: props.name,
        description: props.description,
        serviceType: props.serviceType ?? props.name,
        provider: { "@type": "Organization", name: ORG.name, url: ORG.url },
        areaServed: ORG.areaServed.map((n) => ({ "@type": "AdministrativeArea", name: n })),
      };
    case "Article":
      return {
        ...base,
        "@type": "Article",
        headline: props.headline,
        datePublished: props.datePublished,
        author: { "@type": "Organization", name: props.author ?? ORG.name },
        image: props.image,
        description: props.description,
        publisher: { "@type": "Organization", name: ORG.name, logo: { "@type": "ImageObject", url: ORG.logo } },
      };
    case "FAQPage":
      return {
        ...base,
        "@type": "FAQPage",
        mainEntity: props.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      };
    case "BreadcrumbList":
      return {
        ...base,
        "@type": "BreadcrumbList",
        itemListElement: props.crumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: c.url,
        })),
      };
    case "WebPage":
      return {
        ...base,
        "@type": "WebPage",
        name: props.name,
        description: props.description,
        url: ORG.url,
      };
  }
}

/**
 * Inject one or more JSON-LD blocks into <head>. Renders nothing.
 * Use a stable `id` so React can clean up between renders.
 */
export function SchemaTag(props: SchemaProps & { id?: string }) {
  const { id, ...schemaProps } = props as SchemaProps & { id?: string };
  const tagId = id || `schema-${schemaProps.type}`;

  useEffect(() => {
    const json = JSON.stringify(buildSchema(schemaProps));
    let el = document.getElementById(tagId) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = tagId;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = json;
    return () => {
      const cur = document.getElementById(tagId);
      if (cur) cur.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagId, JSON.stringify(schemaProps)]);

  return null;
}
