#!/bin/bash

# Clone the repository if it doesn't exist
if [ ! -d "zero-cost-website" ]; then
  echo "Cloning repository..."
  git clone https://github.com/guilhermefay/zero-cost-website.git
  cd zero-cost-website
else
  echo "Repository already exists. Updating..."
  cd zero-cost-website
  git pull
fi

# Install dependencies using npm
echo "Installing dependencies..."
npm install

# Start the development server
echo "Starting the development server..."
npm run dev
