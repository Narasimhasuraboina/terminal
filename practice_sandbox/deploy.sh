#!/bin/bash
echo "Deploying application..."
npm run build
sudo systemctl restart nginx
echo "Deployment complete!"
