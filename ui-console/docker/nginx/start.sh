#!/bin/sh
# This script substitutes environment variables in the built app before starting nginx

# Replace env vars in the built JavaScript files
for file in /usr/share/nginx/html/assets/*.js; do
  if [ -f "$file" ]; then
    envsubst '$VITE_ARCHITECT_CHAT_ENDPOINT' < "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  fi
done

# Start nginx
nginx -g 'daemon off;'