#!/bin/sh
# Run a command with secrets from 1Password when available.
# usage: scripts/with-env.sh <command> [args...]
#
# Locally, .env holds op:// references and `op run` resolves them before the
# command starts (Strapi's own .env loading never overrides variables that are
# already set). In CI/Azure there is no .env, so the command runs as-is and
# reads the App Service settings instead.
if [ -f .env ] && grep -q 'op://' .env; then
	if command -v op >/dev/null 2>&1; then
		exec op run --env-file=.env -- "$@"
	fi
	echo "warning: .env has op:// references but the 1Password CLI (op) isn't installed" >&2
fi
exec "$@"
