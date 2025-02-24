#!/usr/bin/env node

const http = require('http');

const dancers = [];


const handleRequest = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;

  if (req.method === 'GET' && path === '/api') {
    // GET endpoint
    if (query.id) {
      const dancer = dancers.find(d => d.id === query.id);
      if (dancer) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(dancer));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Dancer not found' }));
      }
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(dancers));
    }
  } else if (req.method === 'POST' && path === '/api') {
    // POST endpoint
    let body = '';
    req.on('data', (data) => {
      body += data;
    });
    req.on('end', () => {
      const params = Object.fromEntries(body.split('&').map((param) => param.split('=')));
      params.id = Date.now().toString(); // Generate a unique ID
      dancers.push(params);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(params));
    });
  } else if (req.method === 'PUT' && path === '/api') {
    // PUT endpoint
    let body = '';
    req.on('data', (data) => {
      body += data;
    });
    req.on('end', () => {
      const params = Object.fromEntries(body.split('&').map((param) => param.split('=')));
      const index = dancers.findIndex(d => d.id === params.id);
      if (index !== -1) {
        dancers[index] = { ...dancers[index], ...params };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(dancers[index]));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Dancer not found' }));
      }
    });
  } else if (req.method === 'DELETE' && path === '/api') {
    // DELETE endpoint
    if (query.id) {
      const index = dancers.findIndex(d => d.id === query.id);
      if (index !== -1) {
        dancers.splice(index, 1);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Dancer deleted' }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Dancer not found' }));
      }
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'ID parameter is required' }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
}

const server = http.createServer(handleRequest)
server.listen(3000)
