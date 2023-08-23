#!/bin/bash

# The logic for scanning docker images is a bit complicated.
# We first scan for Dockerfile & docker-compose files to build the images.
# Then we create a local docker registry and pull those images to the register.
# We then use grype to check for images under that repository.

# Install grype
echo "Installing grype"
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin

# Search and build images from Dockerfiles if they have been modified or all dockerfiles if this is a full scan.
# We use the dockerfile path to name the image, we replacing all slashes and force the directory name to be all lowercase.
# We do that because docker doesn't support slashed or uppercase characters for image names.
find . -name 'Dockerfile' -exec sh -c '
for file do
    DIR=$(dirname "$file")
    file=$(echo "$file" | sed "s/^\.\///g")
    TAG_NAME=$(echo "$file" | sed "s/^\.\///g" | sed "s/\//__SLASH__/g" | tr '[:upper:]' '[:lower:]')
    if [ "$FULL_CHECK" = true ] || git diff --name-only HEAD $(git merge-base HEAD remotes/origin/"$BRANCH") | grep -E "Dockerfile$" | grep -Fxq "$file"; then
        echo "Building Docker image in directory: $DIR"
        docker build -t "$TAG_NAME" "$DIR"
    fi
done
' sh {} +

# Get the images
images=$(docker images --format "{{.Repository}}:{{.Tag}}")

echo "Creating a local registry"
docker run -d -p 5000:5000 --restart=always --name registry registry:2

# Loop through each image
for image in $images; do
    case "$image" in
        *dockerfile*|*docker-compose*)
            # Create a valid name for the JSON file
            filename=$(echo "$image" | tr -d '/:' | tr '[:upper:]' '[:lower:]')
            
            # Tag the image
            docker tag $image localhost:5000/$image
            # Push the image to the local registry
            docker push localhost:5000/$image
            # Scan the image with Grype and output results to JSON file
            echo "Scanning $image"
            grype localhost:5000/$image -o json --file ./scanner/tmp/result/__grype__$filename.json

            ;;
    esac
done
