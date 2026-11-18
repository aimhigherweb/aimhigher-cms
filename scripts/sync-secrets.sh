#!/usr/bin/env bash
# Push secrets from 1Password (AimHigher/aimhigher-cms) to GitHub Actions or the Azure App Service.
# usage: scripts/sync-secrets.sh github|azure [--apply]
#
# Without --apply it only prints what would change (names, never values).
# Values are piped straight from `op read`, so they never land in shell history or the repo.
set -euo pipefail

ITEM='op://AimHigher/aimhigher-cms'
RESOURCE_GROUP='aimhigher'
APP='aimhigher-cms'
NODE_RUNTIME='NODE|24-lts'

# GitHub Actions: only what the deploy workflow uses
GITHUB_FROM_1PASSWORD=(DISCORD_WEBHOOK)
GITHUB_KEEP_PATTERN='^AZUREAPPSERVICE_PUBLISHPROFILE_' # managed by Azure, not 1Password

# Azure App Service settings
AZURE_FROM_1PASSWORD=(
	APP_KEYS API_TOKEN_SALT TRANSFER_TOKEN_SALT ENCRYPTION_KEY ADMIN_JWT_SECRET JWT_SECRET
	DATABASE_CLIENT DATABASE_URL
	STORAGE_ACCOUNT STORAGE_ACCOUNT_KEY STORAGE_CONTAINER_NAME STORAGE_URL
	SENDGRID_API_KEY SENTRY_DSN
)
AZURE_PLAIN=(DATABASE_SSL=true NODE_ENV=production)
# v3 leftovers (MongoDB, Algolia, telemetry)
AZURE_REMOVE=(
	DATABASE_HOST DATABASE_NAME DATABASE_USERNAME DATABASE_PASSWORD DATABASE_PORT DATABASE_SRV
	AUTHENTICATION_DATABASE ALGOLIA_API_KEY ALGOLIA_APP_ID STRAPI_UUID
)

target="${1:-}"
apply=false
[[ "${2:-}" == '--apply' ]] && apply=true

run() { if $apply; then "$@"; fi; }

sync_github() {
	local existing name
	existing=$(gh secret list --json name -q '.[].name')

	for name in "${GITHUB_FROM_1PASSWORD[@]}"; do
		echo "set     $name"
		if $apply; then op read "$ITEM/$name" | gh secret set "$name"; fi
	done

	for name in $existing; do
		[[ " ${GITHUB_FROM_1PASSWORD[*]} " == *" $name "* ]] && continue
		[[ "$name" =~ $GITHUB_KEEP_PATTERN ]] && { echo "keep    $name"; continue; }
		echo "delete  $name"
		run gh secret delete "$name"
	done
}

sync_azure() {
	local existing name file
	existing=$(az webapp config appsettings list -g "$RESOURCE_GROUP" -n "$APP" --query '[].name' -o tsv)

	file=$(mktemp)
	chmod 600 "$file"
	SETTINGS_FILE="$file"
	trap 'rm -f "${SETTINGS_FILE:-}"' EXIT

	{
		echo '['
		local first=true
		for name in "${AZURE_FROM_1PASSWORD[@]}"; do
			echo "set     $name (1Password)" >&2
			if $apply; then
				$first || echo ','
				first=false
				op read "$ITEM/$name" | NAME="$name" node -e '
					let v = ""; process.stdin.on("data", (c) => (v += c)).on("end", () =>
						process.stdout.write(JSON.stringify({ name: process.env.NAME, value: v.replace(/\n$/, ""), slotSetting: false })));'
			fi
		done
		for pair in "${AZURE_PLAIN[@]}"; do
			echo "set     ${pair%%=*}=${pair#*=}" >&2
			if $apply; then
				$first || echo ','
				first=false
				NAME="${pair%%=*}" VALUE="${pair#*=}" node -e 'process.stdout.write(JSON.stringify({ name: process.env.NAME, value: process.env.VALUE, slotSetting: false }))'
			fi
		done
		echo ']'
	} > "$file"

	run az webapp config appsettings set -g "$RESOURCE_GROUP" -n "$APP" --settings "@$file" -o none

	local remove=()
	for name in "${AZURE_REMOVE[@]}"; do
		if grep -qx "$name" <<< "$existing"; then
			echo "delete  $name"
			remove+=("$name")
		fi
	done
	if ((${#remove[@]})); then run az webapp config appsettings delete -g "$RESOURCE_GROUP" -n "$APP" --setting-names "${remove[@]}" -o none; fi

	echo "runtime $(az webapp config show -g "$RESOURCE_GROUP" -n "$APP" --query linuxFxVersion -o tsv) -> $NODE_RUNTIME"
	run az webapp config set -g "$RESOURCE_GROUP" -n "$APP" --linux-fx-version "$NODE_RUNTIME" -o none
}

case "$target" in
	github) sync_github ;;
	azure) sync_azure ;;
	*) echo "usage: $0 github|azure [--apply]" >&2; exit 1 ;;
esac

$apply && echo 'Done.' || echo 'Dry run: nothing changed. Re-run with --apply.'
