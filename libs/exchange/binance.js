import 'dotenv/config';
import needle from 'needle';
import crypto from 'crypto';

/* SIGNED (TRADE, USER_DATA, AND MARGIN) Endpoint security
SIGNED endpoints require an additional parameter, signature, to be sent in the query string or request body.
Endpoints use HMAC SHA256 signatures. The HMAC SHA256 signature is a keyed HMAC SHA256 operation. Use your secretKey as the key and totalParams as the value for the HMAC operation.
The signature is not case sensitive.
totalParams is defined as the query string concatenated with the request body. */

class Binance {
  #apiKey = process.env.BINANCE_ACCESS_KEY;
  #apiSecret = process.env.BINANCE_SECRET_KEY;

  #getSignature(queryString) {
    return crypto
      .createHmac('sha256', this.#apiSecret)
      .update(queryString)
      .digest('hex');
  }

  async getDepositSymbols() {
    // Weight(IP): 10, Limit: 12000 (weigth) per minute, or 1200 requests / min
    const endPointUrl = 'https://api.binance.com/sapi/v1/capital/config/getall';
    const queryString = `timestamp=${Date.now()}`;
    const signature = this.#getSignature(queryString);
    const url = `${endPointUrl}?${queryString}&signature=${signature}`;
    const options = {
      headers: {
        'X-MBX-APIKEY': this.#apiKey,
      },
      compressed: true,
    };
    const response = await needle('get', url, options);
    // console.log(response.headers['x-sapi-used-ip-weight-1m']);
    return response.headers['x-sapi-used-ip-weight-1m'];
    // const symbols = response.body.map((coin) => coin.coin);
    // return symbols;
  }
}

const binance = new Binance();

const timeStart = Date.now();
let count = 0;

async function doRecursion(i) {
  // await binance.getDepositSymbols().then((weigth) => console.log(`${i} done`, weigth));
  await binance.getDepositSymbols();
  count += 1;
  if (count === 1000) {
    console.log(`Выполнено 1000 запросов за ${(Date.now() - timeStart) / 1000} сек`);
  }
  setTimeout(doRecursion, 0, i);
}

for (let i = 1; i <= 10; i += 1) {
  doRecursion(i);
}
// doRecursion();
// await binance.getDepositSymbols();
