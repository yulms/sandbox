import needle from 'needle';
import ObjectsToCsv from 'objects-to-csv';

// https://data.gateapi.io/api2/1/tradeHistory/fida_usdt/1716098974 - последнее число - ордер ID, с которого начинать

class Gateio {
  async getTrades(pair, saveToFile) {
    const options = {
      compressed: true,
    };
    // 1748555976;
    const result = await needle('get', `https://data.gateapi.io/api2/1/tradeHistory/${pair.replace('/', '_').toLowerCase()}/1811801689`, options); // '1749382443'
    const trades = result.body.data
      .map((trade) => ({
        tradeId: trade.tradeID,
        datetime: trade.date,
        side: trade.type,
        price: trade.rate,
        amount: trade.amount,
        cost: trade.total,
      }));
    if (saveToFile) {
      const csv = new ObjectsToCsv(trades);
      await csv.toDisk(`./data/trades_gateio_${Date.now()}.csv`);
    }
    return trades;
  }
}

const exchange = new Gateio();
const trades = await exchange.getTrades('BADGER/USDT', false);
console.table(trades);
