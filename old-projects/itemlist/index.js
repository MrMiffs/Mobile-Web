#!/usr/bin/env node

const http = require('http');

const items = [];

const handleRequest = (req, res) => {
  const [path, query] = req.url.split('?');

  if (path == '/api') {
    if (req.method == 'POST') {
      // Handle Add Item form submission
      let body = '';
      req.on('data', (data) => {
        body += data;
      });
      req.on('end', () => {
        try {
          const params = Object.fromEntries(body.split('&').map(
            (param) => param.split('=')
          ));
          if (!params.name || !params.x || !params.y) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Missing required parameters" }));
            return;
          }
          if (isNaN(parseInt(params.x)) || isNaN(parseInt(params.y))) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "x and y must be integers" }));
            return;
          }
          params.x = parseInt(params.x);
          params.y = parseInt(params.y);
          params.id = Date.now().toString(); // Generate a unique ID
          items.push(params);
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify(params));
        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid request body" }));
        }
      });
    } else if (req.method == 'GET') {
      // Handle GET requests (return all items)
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(items));
    } else if (req.method == 'DELETE') {
      // Handle DELETE requests
      const id = query.split('=')[1]; // Extract the ID from the query string
      const index = items.findIndex(item => item.id == id);
      if (index !== -1) {
        items.splice(index, 1); // Remove the item
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Item deleted" }));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Item not found" }));
      }
    } else {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method not allowed" }));
    }
  } else if (path == '/api/search') {
    if (req.method == 'POST') {
      // Handle Search Item form submission
      let body = '';
      req.on('data', (data) => {
        body += data;
      });
      req.on('end', () => {
        try {
          const params = Object.fromEntries(body.split('&').map(
            (param) => param.split('=')
          ));

          // Filter items based on search parameters
          const searchResults = items.filter(item => {
            return (
              (!params.name || item.name == params.name) && // Match "name" if provided
              (!params.x || item.x == params.x) &&       // Match "x" if provided
              (!params.y || item.y == params.y)          // Match "y" if provided
            );
          });

          if (Object.keys(params).length > 0 && searchResults.length == 0) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "No matching items found" }));
            return;
          }
          
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
