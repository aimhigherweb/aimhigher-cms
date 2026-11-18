'use strict';

/**
 * Lets client-portal links authenticate with a Token entry instead of a login.
 *
 * Ported from the v3 users-permissions policy override. A request can pass the
 * token as `?token=<value>` or `Authorization: Bearer <value>`. When the value
 * matches a published Token, the request is treated as that token's user by
 * swapping in a short-lived users-permissions JWT, so the normal role
 * permissions, blocked and email-confirmation checks all still apply.
 * Bearer values that aren't Tokens (i.e. regular JWTs) are left alone.
 */
module.exports = (_config, { strapi }) => async (ctx, next) => {
	if (!ctx.path.startsWith('/api') && !ctx.path.startsWith('/graphql')) {
		return next();
	}

	const queryToken = typeof ctx.query.token === 'string' ? ctx.query.token : undefined;
	const bearer = ctx.get('authorization').match(/^Bearer\s+(\S+)$/i)?.[1];
	const value = queryToken || bearer;

	if (!value) {
		return next();
	}

	const token = await strapi.documents('api::token.token').findFirst({
		filters: { token: { $eq: value } },
		status: 'published',
		populate: { user: { fields: ['id'] } },
	});

	if (queryToken) {
		const { token: _removed, ...query } = ctx.query;
		ctx.query = query;

		if (!token?.user) {
			return ctx.unauthorized(`Invalid token: This token doesn't exist`);
		}
	}

	if (token?.user) {
		const jwt = await strapi
			.plugin('users-permissions')
			.service('jwt')
			.issue({ id: token.user.id }, { expiresIn: '5m' });

		ctx.request.header.authorization = `Bearer ${jwt}`;
	}

	return next();
};
