#!/bin/bash

# Install semgrep
echo "Installing semgrep"
pip install semgrep

echo "Scanning files with semgrep"
if [ "$FULL_CHECK" = true ]; then
    semgrep scan . --config ./scanner/semgrep.yml --json > ./scanner/tmp/result/__semgrep__.json
else
    modified_files=$(git diff --name-only HEAD $(git merge-base HEAD remotes/origin/$BRANCH))
    for file in $modified_files; do
        foldername=$(basename "$dir" | sed 's/\//__slash__/g')
        filename=$(basename "$file" | sed 's/\//__slash__/g')
        semgrep scan $file --config --config ./scanner/semgrep.yml --json > "./scanner/tmp/result/__semgrep__${foldername}_${filename}.json"
    done
fi
