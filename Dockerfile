FROM node:20.5.1 as build-gui
WORKDIR /usr/src/app
COPY ./gui/package*.json ./
RUN npm install
COPY ./gui .
RUN npm run build
RUN mkdir scanner
COPY ./scanner ./scanner
RUN tar -czf build/scanner.tar.gz scanner

##########

FROM node:20 AS build-api
WORKDIR /usr/src/app

COPY ./api/package*.json ./
RUN npm install

COPY --from=build-gui /usr/src/app/build ./ui
COPY ./api .

##########

FROM gcr.io/distroless/nodejs20-debian11
COPY --from=build-api /usr/src/app /usr/src/app


WORKDIR /usr/src/app
USER 1000
CMD ["server.js"]