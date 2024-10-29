FROM node:alpine AS development

RUN apk add --no-cache tzdata
ENV TZ=Europe/London
RUN cp /usr/share/zoneinfo/Europe/London /etc/localtime && \
    echo "Europe/London" > /etc/timezone

WORKDIR /usr/src/app

COPY package.json ./
# COPY pnpm-lock.yaml ./
COPY tsconfig.json ./
COPY nest-cli.json nest-cli.json

RUN npm install -g pnpm

RUN pnpm install

COPY apps/events apps/events
COPY libs libs

RUN npm run build events

FROM node:alpine AS production

RUN apk add --no-cache tzdata
ENV TZ=Europe/London
RUN cp /usr/share/zoneinfo/Europe/London /etc/localtime && \
    echo "Europe/London" > /etc/timezone

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json ./
# COPY pnpm-lock.yaml .

RUN npm install -g pnpm

RUN pnpm install --only=production

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/events/main"]