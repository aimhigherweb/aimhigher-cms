module.exports = ({ env }) => ({
	'users-permissions': {
		config: {
			jwtSecret: env('JWT_SECRET'),
			// Long-lived JWTs, as in v3. The portal-token middleware relies on this mode.
			jwtManagement: 'legacy-support',
		},
	},
	upload: {
		config: env('STORAGE_ACCOUNT')
			? {
				provider: 'strapi-provider-upload-azure-storage',
				providerOptions: {
					authType: 'default',
					account: env('STORAGE_ACCOUNT'),
					accountKey: env('STORAGE_ACCOUNT_KEY'),
					serviceBaseURL: env('STORAGE_URL'),
					containerName: env('STORAGE_CONTAINER_NAME'),
					defaultPath: 'assets',
				},
			}
			: {}, // no Azure credentials: fall back to local uploads in public/uploads
	},
	email: {
		config: env('SENDGRID_API_KEY')
			? {
				provider: 'sendgrid',
				providerOptions: {
					apiKey: env('SENDGRID_API_KEY'),
				},
				settings: {
					defaultFrom: 'admin@aimhigherweb.design',
					defaultReplyTo: 'admin@aimhigherweb.design',
				},
			}
			: {},
	},
	sentry: {
		enabled: !!env('SENTRY_DSN'),
		config: {
			dsn: env('SENTRY_DSN'),
		},
	},
	// Drag-and-drop ordering in the admin list view, for content types with a `sortOrder` integer.
	'sortable-entries': {
		enabled: true,
	},
	graphql: {
		config: {
			landingPage: false,
			defaultLimit: 25,
			maxLimit: 100,
			depthLimit: 10,
		},
	},
});
