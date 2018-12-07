import express from 'express';
import path from 'path';
import request from 'request';
import config from './config';

const router = express.Router();

// API

router.post('/api/create-payment', (req, res) => {
  // 2. Call /v1/payments/payment to set up the payment
  request.post(`${config.PAYPAL_API}/v1/payments/payment`,
    {
      auth:
      {
        user: config.CLIENT,
        pass: config.SECRET,
      },
      body:
      {
        intent: 'sale',
        payer:
        {
          payment_method: 'paypal',
        },
        transactions: [
          {
            amount:
              {
                total: '65.00',
                currency: 'SGD',
              },
          }],
        redirect_urls:
        {
          return_url: 'https://www.mysite.com',
          cancel_url: '/',
        },
      },
      json: true,
    }, (err, response) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      // 3. Return the payment ID to the client
      res.status(200).json(
        {
          id: response.body.id,
        },
      );
      return null;
    });
});

router.post('/api/execute-payment', (req, res) => {
  // 2. Get the payment ID and the payer ID from the request body.
  const { paymentID, payerID } = req.body;

  // 3. Call /v1/payments/payment/PAY-XXX/execute to finalize the payment.
  request.post(`${config.PAYPAL_API}/v1/payments/payment/${paymentID}/execute`,
    {
      auth:
      {
        user: config.CLIENT,
        pass: config.SECRET,
      },
      body:
      {
        payer_id: payerID,
        transactions: [
          {
            amount:
            {
              total: '10.99',
              currency: 'USD',
            },
          },
        ],
      },
      json: true,
    }, (err, response) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      // 4. Return a success response to the client
      res.status(200).json({
        status: 'success',
      });
      return null;
    });
});

// Pages

router.get('/complete', (req, res) => {
  res.sendFile(path.join(__dirname, 'complete.html'));
});

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'checkout.html'));
});

export default router;
