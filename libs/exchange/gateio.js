import needle from 'needle';
import ObjectsToCsv from 'objects-to-csv';

// https://data.gateapi.io/api2/1/tradeHistory/fida_usdt/1716098974 - последнее число - ордер ID, с которого начинать

const result = await needle('get', 'https://data.gateapi.io/api2/1/tradeHistory/fida_usdt/1716098974');
const trades = result.body.data
  .map((trade) => ({
    tradeId: trade.tradeID,
    datetime: trade.date,
    side: trade.type,
    price: trade.rate,
    amount: trade.amount,
    cost: trade.total,
  }));

console.table(trades);
const csv = new ObjectsToCsv(trades);
await csv.toDisk('./data/trade_gateio.csv');
