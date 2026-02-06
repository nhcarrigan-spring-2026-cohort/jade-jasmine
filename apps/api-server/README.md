some general instructions on how to get the api server up and running

1- make sure you have docker running (if you haven't installed it, please do that first)
2- run `npm install` in the root of the repo ~/jade-jasmine
3- run `cd ~/jade-jasmine/apps/api-server` to move to the api-server path
4- if you don't have an .env file in /apps/api-server, then copy the sample.env and rename it to .env
5- modify the values relevant to you (any *_SECRET for eg or the PGPASSWORD)
6- run `npm run dev` to start the postgreSQL service, create the tables, and start the server
7- a message should show up about the server listening on the port (you can now navigate to `http://localhost:<port>` and it should produce some json)
8- you can test the routes by downloading postman and using it to issue http requests <https://www.postman.com/downloads/>
(the list of http requests that we plan to implement are listed in the api.yml file which you can view in vscode by installing the Swagger UI extension and running its viewer)
