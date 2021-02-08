FROM node:12

RUN npm install -g dirty-reprojectors

#patch the d3-geo to include pertorico
RUN ls /usr/local/lib/node_modules/dirty-reprojectors/node_modules/d3-geo/dist/d3-geo.js
ADD d3-geo.js /usr/local/lib/node_modules/dirty-reprojectors/node_modules/d3-geo/dist/d3-geo.js
