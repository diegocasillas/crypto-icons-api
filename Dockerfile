FROM node:14.17.4-slim

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable libxss1 \
      --no-install-recommends \
    && apt-get install -y chromium \
      --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /etc/apt/sources.list.d/google.list/*

WORKDIR /app

COPY . /app/

RUN yarn --production

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8001

EXPOSE 8001
CMD ["yarn", "start"]