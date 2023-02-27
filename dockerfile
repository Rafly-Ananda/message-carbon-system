FROM node:14

RUN mkdir /app
ADD . /app
WORKDIR /app
# RUN apt update && apk add tzdata
ENV TZ=Asia/Jakarta

RUN npm install
RUN npm install pm2 -g

RUN npm run-script build
RUN cd /app/dist/

# ENV NODE_OPTIONS=--max_old_space_size=4096
CMD ["pm2-runtime", "./dist/main.js" , "--max-memory-restart 400M"]
# CMD ["npm", "start", "./dist/main.js]