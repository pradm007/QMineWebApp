var express = require('express');
var router = express.Router();

var mineService = require('../services/mineService.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/status', (req, res, next) => {
  res.send("OK");
});

router.post('/qmine/invoke', async (req, res, next) => {
  res.json(await mineService.invokeMine(req));
});

router.get('/qmine/status/request/:requestID', async (req, res, next) => {
  res.send( await mineService.status(req.params.requestId));
});

router.get('/qmine/getresult/request/:requestID', async (req, res, next) => {
  res.json(await mineService.result(req.params.requestId));
});

module.exports = router;
