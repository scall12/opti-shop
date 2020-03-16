const express = require('express');
const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;

const oidc = require('../okta');
const router = express.Router();

router.post('/data', oidc.ensureAuthenticated(), async (req, res) => {
  await MongoClient.connect(
    process.env.MONGODB_URI,
    { useUnifiedTopology: true },
    async (err, client) => {
      assert.equal(null, err);
      const db = client.db('test');
      const collection = 'adjust-pricing';

      const user = req.session.passport.user.userinfo.sub;
      const {
        item,
        store,
        currency,
        price,
        priceWeight,
        priceWeightSelect
      } = req.body;

      const cursor = await db
        .collection(collection)
        .find({
          user,
          'data.item': item
        })
        .toArray();

      if (cursor.length) {
        // Show message saying the item already exists.
        console.log('Already Exists');
      } else {
        await db.collection(collection).insertOne({
          user,
          data: {
            item,
            store,
            currency,
            price,
            priceWeight,
            priceWeightSelect
          }
        });
      }

      res.redirect('/');

      client.close();
    }
  );
});

module.exports = router;
