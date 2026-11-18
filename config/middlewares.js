module.exports = ({ env }) => {
	const storage = env('STORAGE_URL') || (env('STORAGE_ACCOUNT') && `https://${env('STORAGE_ACCOUNT')}.blob.core.windows.net`);
	const mediaSrc = ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', ...(storage ? [storage] : [])];

	return [
		'strapi::logger',
		'strapi::errors',
		{
			name: 'strapi::security',
			config: {
				contentSecurityPolicy: {
					useDefaults: true,
					directives: {
						'connect-src': ["'self'", 'https:'],
						'img-src': mediaSrc,
						'media-src': mediaSrc,
						upgradeInsecureRequests: null,
					},
				},
			},
		},
		'strapi::cors',
		'strapi::poweredBy',
		'strapi::query',
		'global::portal-token',
		'strapi::body',
		'strapi::session',
		'strapi::favicon',
		'strapi::public',
	];
};
