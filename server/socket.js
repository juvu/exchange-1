function send(socket, data) {
  console.log('send', JSON.stringify(data));
  socket.send(JSON.stringify(data));
}

function subHandle(socket, symbol, extraArgs, data, channel) {
  send(socket, {
    id: data.id || '',
    status: 'ok',
    subbed: `market.${symbol}.${channel}`,
    ts: Date.now(),
  });
}

function unsubHandle(socket, symbol, extraArgs, data) {
  send(socket, {
    id: data.id || '',
    status: 'ok',
    unsubbed: `market.${symbol}.markets`,
    ts: Date.now(),
  });
}

function marketsHandle(socket, symbol, extraArgs, data) {
  subHandle(socket, symbol, extraArgs, data, 'markets');

  send(socket, {
    ch: `market.${symbol}.markets`,
    ts: Date.now(),
    tick: {
      markets: [['ENB', 1, 1], ['ECHO', 0, 2]],
    },
  });
}

function latestHandle(socket, symbol, extraArgs, data) {
  subHandle(socket, symbol, extraArgs, data, 'latest');

  send(socket, {
    ch: `market.${symbol}.latest`,
    ts: Date.now(),
    tick: {
      latest: [0.007, -1.67, 292.08, 269.48, 98794],
    },
  });
}

function ordersHandle(socket, symbol, extraArgs, data) {
  subHandle(socket, symbol, extraArgs, data, 'orders');

  send(socket, {
    ch: `market.${symbol}.orders`,
    ts: Date.now(),
    tick: {
      sell: [[281.96, 0.5, 5.5038]],
      buy: [[282.37, 3.0309, 7.8876]],
    },
  });
}

function dealsHandle(socket, symbol, extraArgs, data) {
  subHandle(socket, symbol, extraArgs, data, 'deals');

  send(socket, {
    ch: `market.${symbol}.deals`,
    ts: Date.now(),
    tick: {
      deals: [[Date.now(), 0, 100, 200], [Date.now(), 1, 50, 221]],
    },
  });
}

function depthHandle(socket, symbol, extraArgs, data) {
  subHandle(socket, symbol, extraArgs, data, 'depth');

  send(socket, {
    ch: `market.${symbol}.depth`,
    ts: Date.now(),
    tick: {
      bids: [[5, 10], [6, 9], [7, 8], [8, 7], [9, 1]],
      asks: [[9, 1], [10, 2], [11, 3], [12, 40], [13, 41.5]],
    },
  });
}

function lineHandle(socket, symbol, extraArgs, data) {
  subHandle(socket, symbol, extraArgs, data, 'line');

  send(socket, {
    ch: `market.${symbol}.line`,
    ts: Date.now(),
    tick: {},
  });
}

module.exports = ws => {
  ws.on('connection', socket => {
    console.log('connected!');
    socket.on('message', text => {
      const data = JSON.parse(text);
      console.log('receive', text);
      if (data.hasOwnProperty('sub')) {
        // 订阅
        const [, symbol, channel, ...extraArgs] = data.sub.split('.');
        switch (channel) {
          case 'markets':
            marketsHandle(socket, symbol, extraArgs, data);
            break;
          case 'latest':
            latestHandle(socket, symbol, extraArgs, data);
            break;
          case 'orders':
            ordersHandle(socket, symbol, extraArgs, data);
            break;
          case 'deals':
            dealsHandle(socket, symbol, extraArgs, data);
            break;
          case 'depth':
            depthHandle(socket, symbol, extraArgs, data);
            break;
          case 'line':
            lineHandle(socket, symbol, extraArgs, data);
            break;
        }
      } else if (data.hasOwnProperty('unsub')) {
        const [, symbol, channel, ...extraArgs] = data.unsub.split('.');
        switch (channel) {
          case 'markets':
          case 'latest':
            unsubHandle(socket, symbol, extraArgs, data);
            break;
        }
      }
    });
  });
};
