#!/bin/bash

# Fix package.json type issue and run Homey app
echo "Fixing package.json type issue..."

# Remove type: module from .homeybuild/package.json if it exists
if [ -f ".homeybuild/package.json" ]; then
    sed -i 's/"type": "module"/"type": "commonjs"/' .homeybuild/package.json
    echo "Fixed .homeybuild/package.json"
fi

echo "Starting Homey app..."
homey app run
