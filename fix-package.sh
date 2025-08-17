#!/bin/bash

# Fix package.json type issue for Homey app
echo "Fixing package.json type issue..."

# Remove type: module from .homeybuild/package.json if it exists
if [ -f ".homeybuild/package.json" ]; then
    sed -i 's/"type": "module"/"type": "commonjs"/' .homeybuild/package.json
    echo "Fixed .homeybuild/package.json"
fi

# Also fix the main package.json to ensure it has commonjs
if [ -f "package.json" ]; then
    # Remove any existing type line
    sed -i '/"type":/d' package.json
    
    # Add type: commonjs after the private line
    sed -i '/"private": true,/a\  "type": "commonjs",' package.json
    echo "Fixed main package.json"
fi

echo "Package.json fix completed!"
