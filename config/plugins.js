module.exports = ({ env }) => ({
	upload: {
		provider: 'azure-storage',
		providerOptions: {
		  account: env('STORAGE_ACCOUNT'),
		  accountKey: env('STORAGE_ACCOUNT_KEY'),
		  serviceBaseURL: env('STORAGE_URL'),
		  containerName: env('STORAGE_CONTAINER_NAME'),
		  defaultPath: 'assets',
		  maxConcurrent: 10
	}
	},
	email: {
		provider: 'sendgrid',
		providerOptions: {
		  apiKey: env('SENDGRID_API_KEY'),
		},
		settings: {
		  defaultFrom: 'admin@aimhigherweb.design',
		  defaultReplyTo: 'admin@adimhigherweb.design',
		},
	},
  });