FROM node:10.16.0-alpine

WORKDIR /home/node
COPY ./ .
RUN rm -rf node_modules
RUN echo 'http://dl-3.alpinelinux.org/alpine/edge/testing' >> /etc/apk/repositories \
    && apk add --no-cache --virtual .build-deps \
        python \
        make \
        g++ \
        py-pip \
        bash \
    && pip install --upgrade pip \
    && npm ci \
    && npm prune --production \
    && rm -rf test \
    && rm -rf deployment

EXPOSE 3000
USER node

CMD ["npm", "start"]