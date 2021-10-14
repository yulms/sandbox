import 'dotenv/config';
import ccxt from 'ccxt';
import ObjectsToCsv from 'objects-to-csv';

class Exchange {
  constructor(exchangeName, exchange) {
    this.exchangeName = exchangeName;
    this.exchange = exchange;
  }

  static async create(exchangeName, keys) {
    const exchange = new ccxt[exchangeName](keys);
    await exchange.loadMarkets();
    return new this(exchangeName, exchange);
  }

  async getTrades(pair, sinceDate, rows = 3000) {
    console.log(`Получена дата: ${sinceDate}`);
    const since = sinceDate.getTime();
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
    await csv.toDisk(`./data/trades_${this.exchangeName}_${pair.replace('/', '')}_${Date.now()}.csv`);
    return trades;
  }

  async fetchMyTrades(symbol) {
    console.log(symbol);
    // return this.exchange.fetchMyTrades(symbol);
    return this.exchange.fetchOrders(symbol);
  }
}

const apiKeys = {
  apiKey: process.env.BINANCE_ACCESS_KEY,
  secret: process.env.BINANCE_SECRET_KEY,
};

const exchange = await Exchange.create('binance', apiKeys);
const orders = await exchange.fetchMyTrades('BADGER/USDT');
console.log(orders);

// const date = new Date(Date.UTC(2021, 9, 13, 19, 6));
// const trades = await exchange.getTrades('BADGER/USDT', date, 3000);
// console.table(trades);
