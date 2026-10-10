FROM node:24-bookworm-slim AS deps
USER node
WORKDIR /home/node/app
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM deps AS source
COPY --chown=node:node . .
RUN npx wxt prepare

FROM source AS build
RUN npm run compile && npm run zip

FROM scratch AS artifact
COPY --from=build /home/node/app/.output/*.zip /
