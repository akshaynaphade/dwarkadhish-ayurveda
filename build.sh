#!/usr/bin/env bash
# exit on error
set -o errexit


mkdir -p public


cp index.html admin.html style.css public/
cp -r images public/ 

# Process main.js
sed -e "s|__FIREBASE_API_KEY__|$FIREBASE_API_KEY|g" \
    -e "s|__FIREBASE_AUTH_DOMAIN__|$FIREBASE_AUTH_DOMAIN|g" \
    -e "s|__FIREBASE_PROJECT_ID__|$FIREBASE_PROJECT_ID|g" \
    -e "s|__FIREBASE_STORAGE_BUCKET__|$FIREBASE_STORAGE_BUCKET|g" \
    -e "s|__FIREBASE_MESSAGING_SENDER_ID__|$FIREBASE_MESSAGING_SENDER_ID|g" \
    -e "s|__FIREBASE_APP_ID__|$FIREBASE_APP_ID|g" \
    -e "s|__FIREBASE_MEASUREMENT_ID__|$FIREBASE_MEASUREMENT_ID|g" \
    main.js > public/main.js

# Process admin.js
sed -e "s|__FIREBASE_API_KEY__|$FIREBASE_API_KEY|g" \
    -e "s|__FIREBASE_AUTH_DOMAIN__|$FIREBASE_AUTH_DOMAIN|g" \
    -e "s|__FIREBASE_PROJECT_ID__|$FIREBASE_PROJECT_ID|g" \
    -e "s|__FIREBASE_STORAGE_BUCKET__|$FIREBASE_STORAGE_BUCKET|g" \
    -e "s|__FIREBASE_MESSAGING_SENDER_ID__|$FIREBASE_MESSAGING_SENDER_ID|g" \
    -e "s|__FIREBASE_APP_ID__|$FIREBASE_APP_ID|g" \
    -e "s|__FIREBASE_MEASUREMENT_ID__|$FIREBASE_MEASUREMENT_ID|g" \
    admin.js > public/admin.js

echo "Build finished. Files are in the 'public' directory."