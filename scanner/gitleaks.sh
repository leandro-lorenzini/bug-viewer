#!/bin/bash

# Because gitleaks doesn't support scanning only specific files, we scan the whole project
# When we send the results to the server, the server will than remove results not related
# to the current pull request (if that's the case of course).

# Install gitleaks
echo "Installing gitleaks"
cd scanner/tmp
wget https://github.com/gitleaks/gitleaks/releases/download/v8.17.0/gitleaks_8.17.0_linux_x64.tar.gz
tar -xf gitleaks_8.17.0_linux_x64.tar.gz
chmod +x gitleaks
mv gitleaks /usr/local/bin/
cd ../../

# Run scanner
echo "Scanning git repository"
gitleaks detect --verbose --baseline-path gitleaks-baseline.json -f json -r ./scanner/tmp/result/__gitleaks__.json
