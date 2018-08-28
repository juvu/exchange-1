import { eventChannel } from 'redux-saga';
import { put, call, takeEvery } from 'redux-saga/effects';

import * as conn from '../services/connection';
import * as actions from '../actions/exchangeActions';

function createSocketChannel() {
  return eventChannel(emit => {
    conn
      .on('markets', (symbol, extraArgs, data) => {
        const { tick } = data;
        return emit(actions.marketsComplete(tick));
      })
      .on('latest', (symbol, extraArgs, data) => {
        return emit(actions.latestComplete(data.tick.latest));
      })
      .on('orders', (symbol, extraArgs, data) => {
        return emit(actions.ordersComplete(data.tick));
      })
      .on('trades', (symbol, extraArgs, data) => {
        return emit(actions.tradesComplete(data.tick.trades));
      });

    return () => {
      conn.close();
    };
  });
}

function* subscribeMarkets(action) {
  const symbol = action.payload;
  try {
    yield call([conn, 'subscribe'], { sub: `market.${symbol}.markets` });
  } catch (e) {
    console.log(e);
  }
}

function* switchMarkets(action) {
  const symbol = action.payload;
  try {
    yield call([conn, 'switches'], { sub: `market.${symbol}.markets` });
  } catch (e) {
    console.log(e);
  }
}

function* subscribeLatest(action) {
  const [symbol] = action.payload.split('_');
  try {
    yield call([conn, 'subscribe'], { sub: `market.${symbol}.latest` });
  } catch (e) {
    console.log(e);
  }
}

function* subscribeOrders(action) {
  const [symbol] = action.payload.split('_');
  try {
    yield call([conn, 'subscribe'], { sub: `market.${symbol}.orders` });
  } catch (e) {
    console.log(e);
  }
}

function* subscribeTrades(action) {
  const [symbol] = action.payload.split('_');
  try {
    yield call([conn, 'subscribe'], { sub: `market.${symbol}.trades` });
  } catch (e) {
    console.log(e);
  }
}

function* socketResponseHandle(action) {
  yield put(action);
}

export function* watchMarket() {
  yield call(conn.createWebSocketConnection);
  const socketChannel = yield call(createSocketChannel);

  yield takeEvery(socketChannel, socketResponseHandle);
  yield takeEvery('EXCHANGE.SUBSCRIBE_MARKETS', subscribeMarkets);
  yield takeEvery('EXCHANGE.SWITCH_MARKETS', switchMarkets);
  yield takeEvery('EXCHANGE.SUBSCRIBE_LATEST', subscribeLatest);
  yield takeEvery('EXCHANGE.SUBSCRIBE_ORDERS', subscribeOrders);
  yield takeEvery('EXCHANGE.SUBSCRIBE_TRADES', subscribeTrades);
}
