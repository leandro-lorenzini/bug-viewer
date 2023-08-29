FROM node:20.5.1 as build
WORKDIR /usr/src/app
COPY ./gui/package*.json ./
RUN npm install
COPY ./gui .
RUN npm run build
RUN mkdir scanner
COPY ./scanner ./scanner
RUN tar -czf scanner.tar.gz scanner

FROM nginxinc/nginx-unprivileged:alpine-slim
COPY --from=build /usr/src/app/build /usr/share/nginx/html
COPY --from=build /usr/src/app/scanner.tar.gz /usr/share/nginx/html/scanner.tar.gz
EXPOSE 443 80
USER nginx
CMD /bin/sh -c "envsubst '\$SERVER_NAME' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && exec nginx -g 'daemon off;'"