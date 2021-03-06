const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const oidc = require('../okta');
const router = express.Router();

router.post('/view-all', oidc.ensureAuthenticated(), async (req, res) => {
  await MongoClient.connect(
    process.env.MONGODB_URI,
    { useUnifiedTopology: true },
    async (err, client) => {
      assert.equal(null, err);
      const db = client.db('test');

      const user = req.session.passport.user.userinfo.sub;
      const cursor = await db
        .collection('test')
        .find({
          user
        })
        .toArray();

      res.render('index', { cursor });
      client.close();
    }
  );
});

module.exports = router;
