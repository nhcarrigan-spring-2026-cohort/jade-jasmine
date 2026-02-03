some general instructions on how to get the api server up and running

1- make sure you have docker running (if you haven't installed it, please do that first)
2- run `cd ~/jade-jasmine/apps/api-server` to move to the api-server path
3- run `npm install`
4- copy sample.env to .env if you don't have your own .env
5- modify the values relevant to you (the SESSION_SECRET for eg or the PGPASSWORD)
6- run `npm run dev` to start the postgreSQL service and the server
7- a message should show up about the server listening on the port (you can now naviate to `http://localhost:<port>` and it should produce some json)