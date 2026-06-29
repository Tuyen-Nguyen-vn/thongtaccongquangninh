import { business, faqs, serviceAreas, services } from './data.js';

const pageUrl = business.pageUrl;
const heroImage = `${business.website}/wp-content/plugins/ttcqn-qn-service-landing/assets/images/hero-xe-hut-be-phot-quang-ninh.jpg`;

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${pageUrl}#localbusiness`,
  name: business.name,
  url: pageUrl,
  image: heroImage,
  telephone: business.hotline,
  email: business.email,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Hạ Long',
    addressRegion: 'Quảng Ninh',
    addressCountry: 'VN',
  },
  areaServed: serviceAreas.map((area) => ({
    '@type': 'AdministrativeArea',
    name: area === 'Hoành Bồ' ? 'Hoành Bồ, Hạ Long' : `${area}, Quảng Ninh`,
  })),
  openingHours: 'Mo-Su 00:00-23:59',
  priceRange: 'Liên hệ báo giá',
  serviceType: ['Thông tắc cống', 'Thông tắc bồn cầu', 'Hút bể phốt', 'Xử lý mùi hôi'],
};

export const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${pageUrl}#service`,
  name: 'Thông tắc cống, hút bể phốt tại Quảng Ninh',
  serviceType: services.map((service) => service.title),
  provider: {
    '@id': `${pageUrl}#localbusiness`,
  },
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Quảng Ninh',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Dịch vụ môi trường Quảng Ninh',
    itemListElement: services.map((service) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: service.title,
        description: service.description,
      },
    })),
  },
};

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${pageUrl}#faq`,
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  '@id': `${pageUrl}#breadcrumb`,
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Trang chủ',
      item: business.website,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Dịch vụ Quảng Ninh',
      item: `${business.website}/dich-vu/`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Thông tắc cống, hút bể phốt tại Quảng Ninh',
      item: pageUrl,
    },
  ],
};

export const allSchemas = [localBusinessSchema, serviceSchema, faqSchema, breadcrumbSchema];
