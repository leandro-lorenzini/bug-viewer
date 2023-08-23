#!/bin/bash

# Install bandit
echo "Installing bandit"
pip install bandit

echo "Scanning Python files"
if [ "$FULL_CHECK" = true ]; then
    # Run scanner on the whole project
    bandit -r . -f json > ./scanner/tmp/result/__bandit__.json
else
    # Run scanner on changed files only
    bandit -r $(git diff --name-only HEAD $(git merge-base HEAD remotes/origin/$BRANCH) | grep '\.py$') -f json > ./scanner/tmp/result/__bandit__.json
fi
