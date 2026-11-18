#!/bin/sh
# Run a command with secrets from 1Password when available.
# usage: scripts/with-env.sh <command> [args...]
#
# Locally, config/.env.1password holds op:// references and `op run` resolves them
# before the command starts. In CI/Azure the command runs as-is and reads the
# App Service settings instead.
ENV_FILE=config/.env.1password

if [ -f "$ENV_FILE" ] && [ -z "$WEBSITE_SITE_NAME" ]; then # WEBSITE_SITE_NAME is set on Azure
	if command -v op >/dev/null 2>&1; then
		exec op run --env-file="$ENV_FILE" -- "$@"
	fi
	echo "warning: $ENV_FILE needs the 1Password CLI (op), which isn't installed" >&2
fi
exec "$@"
