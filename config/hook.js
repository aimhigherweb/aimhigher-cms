module.exports = ({env}) => ({
    settings: {
		// TODO: Add lifecycle callbacks https://github.com/MattieBelt/strapi-hook-algolia#usage
      algolia: {
        enabled: true,
        applicationId: env('ALGOLIA_APP_ID'),
        apiKey: env('ALGOLIA_API_KEY'),
        debug: true,
        prefix: 'cms'
      },
    }
  });