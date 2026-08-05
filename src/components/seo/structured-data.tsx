type StructuredDataProps = {
    siteUrl: string;
  
    siteName: string;
    description: string;
  
    logo?: string;
    image?: string;
  
    telephone?: string;
    email?: string;
  
    streetAddress?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    pinterest?: string;
    googleBusiness?: string;
  };
  
  export function StructuredData({
    siteUrl,
    siteName,
    description,
    logo,
    image,
    telephone,
    email,
    streetAddress,
    postalCode,
    city,
    country,
  
    instagram,
    facebook,
    tiktok,
    pinterest,
    googleBusiness,
  }: StructuredDataProps) {
    const sameAs = [
      instagram,
      facebook,
      tiktok,
      pinterest,
      googleBusiness,
    ].filter(Boolean);
  
    const data = {
      "@context": "https://schema.org",
  
      "@graph": [
        {
          "@type": "BeautySalon",
  
          "@id": `${siteUrl}/#business`,
  
          name: siteName,
  
          url: siteUrl,
  
          image:
            // logoUrl/socialShareImageUrl valent "" tant que
            // l'admin n'a rien configuré : ?? ne se déclenche
            // jamais sur une chaîne vide, contrairement à ||.
            image ||
            `${siteUrl}/og-image.jpg`,

          logo:
            logo ||
            `${siteUrl}/logo.png`,
  
          description,
  
          priceRange: "€€",
  
          telephone,
  
          email,
  
          currenciesAccepted: "EUR",
  
          paymentAccepted: [
            "PayPal",
            "Cash",
            "Card",
          ],
  
          address: {
            "@type": "PostalAddress",
  
            streetAddress,
  
            postalCode,
  
            addressLocality: city,
  
            addressCountry:
              country || "FR",
          },
  
          sameAs,
  
          areaServed: {
            "@type": "Country",
            name: "France",
          },
        },
  
        {
          "@type": "Organization",
  
          "@id": `${siteUrl}/#organization`,
  
          name: siteName,
  
          url: siteUrl,

          logo:
            logo ||
            `${siteUrl}/logo.png`,

          sameAs,
        },
  
        {
          "@type": "WebSite",
  
          "@id": `${siteUrl}/#website`,
  
          url: siteUrl,
  
          name: siteName,
  
          inLanguage: "fr-FR",
  
          publisher: {
            "@id": `${siteUrl}/#organization`,
          },
        },
      ],
    };
  
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data),
        }}
      />
    );
  }