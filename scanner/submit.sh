#!/bin/bash

# Listing files to be uploaded for debug purposes
ls -lh scanner/tmp/result/

# Building curl command
command="curl -f -k --location '$SERVER/api/repository'"
command="$command --form 'token=\"$TOKEN\"'"
command="$command --form 'name=\"$REPOSITORY\"'"
command="$command --form 'ref=\"$REF\"'"
command="$command --form 'head=\"$BRANCH\"'"
command="$command --form 'removePaths=\"$(pwd)\"'"
command="$command --form 'removePaths=\"localhost:5000\"'"

# Submiting the list of changed files
# This is usefull because some scans can only scan the whole project
# even if we only want to scan files that have been modified, in that
# case, the server will exclude findings not related to the modified files.
if [ ! -z "$MODIFIED_FILES" ]; then
    for file in $MODIFIED_FILES; do
        command="$command --form 'modifiedFiles=$file'"
    done
fi

# Submitting the all result files
for file in scanner/tmp/result/*; do
    if [ -f "$file" ]; then
        command="$command --form 'files=@\"$file\"'"
    fi
done

# Create a temporary file to hold the response as we want to display the reponse even in case of error
tempfile=$(mktemp)
# Execute the command, write the body to the temporary file, and capture the status code separately
status_code=$(eval $command -w "%{http_code}" -o $tempfile)

# Read the body from the temporary file and print it
body=$(cat $tempfile)
echo "$body"

# Check if the status code is not 200
# 200 - No serious vulnerabilities
# 207 - Serious vulnerabilities found
# 206 - Error with submission data
if [ "$status_code" -ne 200 ]; then
    echo "Error: Received HTTP status code $status_code"
    exit 1
fi

# Docker images have errors while buiding sometimes, make sure that we warn the users about it.
if [ "$docker_error" = "true" ]; then
    echo "Error: No files containing '__grype__' found in the results directory."
    exit 1
fi