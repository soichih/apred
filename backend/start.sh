
#api
pm2 delete apred-api
pm2 start server.js --name apred-api --watch --ignore-watch="*.log test *.sh ui bin example .git"

pm2 save
