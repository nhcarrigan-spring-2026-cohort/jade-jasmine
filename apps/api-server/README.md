some general instructions on how to get the api server up and running

1- make sure you have docker running (if you haven't installed it, please do that first)
2- run `npm install` in the root of the repo
3- if you don't have an .env file in /apps/api-server, then copy the sample.env and rename it to .env
4- modify the values relevant to you (the SESSION_SECRET for eg or the PGPASSWORD)
5- run `cd ~/jade-jasmine/apps/api-server` to move to the api-server path
6- run `npm run dev` to start the postgreSQL service and the server
7- a message should show up about the server listening on the port (you can now navigate to `http://localhost:<port>` and it should produce some json)
