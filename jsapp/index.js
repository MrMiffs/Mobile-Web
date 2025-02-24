#!/usr/bin/env node

const http = require('http');

const dancers = [];

const handleRequest = (req, res) => {
  const [path, query] = req.url.split('?');

  if (path === '/api') {
    if (req.method === 'POST') {
      // Handle Add Dancer form submission
      let body = '';
      req.on('data', (data) => {
        body += data;
      });
      req.on('end', () => {
        try {
          const params = Object.fromEntries(body.split('&').map(
            (param) => param.split('=')
          ));
          if (!params.who || !params.x || !params.y) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Missing required parameters" }));
            return;
          }
          params.id = Date.now().toString(); // Generate a unique ID
          dancers.push(params);
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify(params));
        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid request body" }));
        }
      });
    } else if (req.method === 'GET') {
      // Handle GET requests (return all dancers)
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(dancers));
    } else if (req.method === 'DELETE') {
      // Handle DELETE requests
      const id = query.split('=')[1]; // Extract the ID from the query string
      const index = dancers.findIndex(dancer => dancer.id === id);
      if (index !== -1) {
        dancers.splice(index, 1); // Remove the dancer
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Dancer deleted" }));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Dancer not found" }));
      }
    } else {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method not allowed" }));
    }
  } else if (path === '/api/search') {
    if (req.method === 'POST') {
      // Handle Search Dancer form submission
      let body = '';
      req.on('data', (data) => {
        body += data;
      });
      req.on('end', () => {
        try {
          const params = Object.fromEntries(body.split('&').map(
            (param) => param.split('=')
          ));

          // Filter dancers based on search parameters
          const searchResults = dancers.filter(dancer => {
            return (
              (!params.who || dancer.who === params.who) && // Match "who" if provided
              (!params.x || dancer.x === params.x) &&       // Match "x" if provided
              (!params.y || dancer.y === params.y)          // Match "y" if provided
            );
          });

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(searchResults));
        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid request body" }));
        }
      });
    } else {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method not allowed" }));
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Endpoint not found" }));
  }
};

const server = http.createServer(handleRequest);
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
