const express = require('express');
const app = express();
app.put('/:id', (req, res) => res.send('matched /:id with id = ' + req.params.id));
app.put('/:id/toggle', (req, res) => res.send('matched /:id/toggle with id = ' + req.params.id));
const request = require('supertest');
request(app).put('/123/toggle').expect(200).then(res => console.log(res.text));
