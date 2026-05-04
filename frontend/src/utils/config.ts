import { Regulation201862DocumentFixture } from 'maestro-shared/test/documentFixtures';

const config = {
  apiEndpoint: import.meta.env.VITE_API_URL,
  satelliteStyle: import.meta.env.VITE_SATELLITE_STYLE,
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL,
  websiteUrl: import.meta.env.VITE_WEBSITE_URL,
  sentryDns: import.meta.env.VITE_SENTRY_FRONTEND_DNS,
  isReviewApp: import.meta.env.VITE_REVIEW_APP === 'true',
  documents: {
    regulation201862:
      import.meta.env.VITE_DOCUMENT_REGULATION_2018_62 ??
      Regulation201862DocumentFixture.id
  }
};

export default config;
