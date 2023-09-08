#!/bin/bash

# Install bandit
echo "Installing bandit"
pip install bandit

echo "Scanning Python files"
if [ "$FULL_CHECK" = true ]; then
    # Run scanner on the whole project
    bandit -r . -f json -o ./scanner/tmp/result/__bandit__.json
else
    # Run scanner on changed files only
    bandit -r $(echo "$MODIFIED_FILES" | grep '\.py$') -f json -o ./scanner/tmp/result/__bandit__.json
fi
