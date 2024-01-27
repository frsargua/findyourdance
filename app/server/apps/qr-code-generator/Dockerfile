FROM node:alpine As development

WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json ./
COPY nest-cli.json nest-cli.json

RUN npm install -g pnpm

RUN pnpm install

COPY apps/qr-code-generator apps/qr-code-generator
COPY libs libs

RUN npm run build qr-code-generator

FROM node:alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json ./
# COPY pnpm-lock.yaml .

RUN npm install -g pnpm

RUN pnpm install --only=production

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/qr-code-generator/main"]