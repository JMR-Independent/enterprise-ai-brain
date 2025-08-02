#!/bin/bash

echo "Starting Vite build..."
npx vite build --mode production

if [ $? -eq 0 ]; then
    echo "Build completed successfully!"
else
    echo "Build failed!"
    exit 1
fi