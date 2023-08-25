FROM node:20 AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

FROM gcr.io/distroless/nodejs20-debian11
COPY --from=build /usr/src/app /usr/src/app
WORKDIR /usr/src/app
USER 1000
CMD ["server.js"]