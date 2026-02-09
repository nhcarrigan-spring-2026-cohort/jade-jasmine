some general instructions on how to get the api server up and running

1- make sure you have docker running (if you haven't installed it, please do that first)
2- run `npm install` in the root of the repo ~/jade-jasmine
3- run `cd ~/jade-jasmine/apps/api-server` to move to the api-server path
4- if you don't have an .env file in /apps/api-server, then copy the sample.env and rename it to .env
5- modify the values relevant to you (any *_SECRET for eg or the PGPASSWORD)
6- run `npm run clean-n-dev` to start the postgreSQL service, create & seed the tables, and start the server
(if you want to run the server without reseeding the tables because you want to preserve some data you stored there, use `npm run dev`)
7- a message should show up about the server listening on the port (you can now navigate to `http://localhost:<port>` and it should produce some json)
8- you can test the routes by downloading postman and using it to issue http requests <https://www.postman.com/downloads/>
(the list of http requests that we plan to implement are listed in the ~/jade-jasmine/docs/api.yml file which you can view in vscode by installing the Swagger UI extension and running its viewer)

PostgreSQL details:
- if you want to get into the db shell so you can examing the tables or their contents run `npm run db:shell` from the api-server root path
- if you need to make a change to the seeding data, update the json files, go to the api-server/db/seed-files dir to find them all.
- if you want to create a new query to use in the API js code, add it to userQueries.js if it is related to user data. Otherwise use the appropriate module.
- if you need to change the table definitions themselves in sql, find the file called setup-tables.sql and modify the create statements there.
- if you need to add a new route, determine which root prefix it belongs to and find the relevant router and controller modules to modify.