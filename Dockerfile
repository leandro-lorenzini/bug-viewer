FROM node:20.5.1 as build
RUN apt-get update
WORKDIR /usr/src/app
COPY ./gui/package*.json ./
RUN npm install
COPY ./gui .
RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine-slim
COPY --from=build /usr/src/app/build /usr/share/nginx/html
EXPOSE 443 80
USER nginx
CMD /bin/sh -c "envsubst '\$SERVER_NAME' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && exec nginx -g 'daemon off;'"