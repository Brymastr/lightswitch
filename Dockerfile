# ---- Base Node ----
FROM node:8 AS base
# install node
RUN apt-get update && apt-get install -y bluetooth bluez libbluetooth-dev libudev-dev
# set working directory
WORKDIR /src
# Set tini as entrypoint
# ENTRYPOINT ["/sbin/tini", "--"]
# copy project file
COPY package.json .

# ---- Dependencies ----
FROM base AS dependencies
# install node packages
RUN npm set progress=false && npm config set depth 0
RUN npm install --only=production --quiet
# copy production node_modules aside
RUN cp -R node_modules prod_node_modules
# install ALL node_modules, including 'devDependencies'
RUN npm install --quiet

# ---- Release ----
FROM base AS release
# copy production node_modules
COPY --from=dependencies /src/prod_node_modules ./node_modules
# copy app sources
COPY . .
# expose port and define CMD
EXPOSE 80
CMD npm run start