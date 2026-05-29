import Script from 'next/script'

interface SEOJsonLdProps {
  type: 'WebSite' | 'Organization' | 'Product' | 'SoftwareApplication'
  data: any
}

export function SEOJsonLd({ type, data }: SEOJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  }

  return (
    <Script
      id={`json-ld-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function WebsiteJsonLd() {
  const data = {
    name: 'Comandero',
    url: 'https://www.comanderoweb.shop',
    description: 'Complete restaurant management system with orders, tables, reservations, staff management, inventory, and detailed reports.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.comanderoweb.shop/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return <SEOJsonLd type="WebSite" data={data} />
}

export function OrganizationJsonLd() {
  const data = {
    name: 'Comandero',
    url: 'https://www.comanderoweb.shop',
    logo: 'https://www.comanderoweb.shop/icons/icon-512x512.png',
    description: 'Complete restaurant management system with orders, tables, reservations, staff management, inventory, and detailed reports.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+55-48-99620-9954',
      contactType: 'customer service',
      email: 'contato@polaristudio.com.br',
      availableLanguage: ['English', 'Spanish', 'Portuguese'],
    },
    sameAs: [
      'https://www.facebook.com/comandero',
      'https://www.twitter.com/comandero',
      'https://www.linkedin.com/company/comandero',
    ],
  }

  return <SEOJsonLd type="Organization" data={data} />
}

export function SoftwareApplicationJsonLd() {
  const data = {
    name: 'Comandero',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    featureList: [
      'Order Management',
      'Table Management',
      'Reservations',
      'Staff Management',
      'Inventory Control',
      'Reports & Analytics',
    ],
  }

  return <SEOJsonLd type="SoftwareApplication" data={data} />
}
