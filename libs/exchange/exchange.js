import ccxt from 'ccxt';
import ObjectsToCsv from 'objects-to-csv';

class Exchange {
  constructor(exchange) {
    this.exchange = exchange;
  }

  static async create(exchangeName) {
    const exchange = new ccxt[exchangeName]();
    await exchange.loadMarkets();
    return new this(exchange);
  }

  async getTrades(pair, sinceDate = Date.now() - 10000, rows = 1000) {
    const since = new Date(sinceDate).getTime();
    const allTrades = await this.exchange.fetchTrades(pair, since, rows);
    const trades = allTrades
      .map((trade) => ({
        datetime: trade.datetime,
        timestamp: trade.timestamp,
        side: trade.side,
        price: trade.price,
        amount: trade.amount,
        cost: trade.cost,
      }));
    const csv = new ObjectsToCsv(trades);
    await csv.toDisk(`./data/trades_${Date.now()}.csv`);
    return trades;
  }
}

const exchange = await Exchange.create('binance');
const trades = await exchange.getTrades('AVAX/USDT');
console.log(trades);
