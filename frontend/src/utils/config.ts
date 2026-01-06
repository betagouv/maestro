import { Regulation201862DocumentFixture } from 'maestro-shared/test/documentFixtures';

const config = {
  apiEndpoint: import.meta.env.VITE_API_URL,
  satelliteStyle: import.meta.env.VITE_SATELLITE_STYLE,
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL,
  websiteUrl: import.meta.env.VITE_WEBSITE_URL,
  documents: {
    regulation201862:
      import.meta.env.VITE_DOCUMENT_REGULATION_2018_62 ??
      Regulation201862DocumentFixture.id
  }
};

export default config;
