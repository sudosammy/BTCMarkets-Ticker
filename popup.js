/*
@sudosammy
*/
var permittedCoins = {
  'activeCoins': {
    'BTC': 1,
    'LTC': 1,
    'ETH': 1,
    'ETC': 1,
    'XRP': 1
  }
};

function apiCall(coinName) {
  var apiURL = 'https://api.btcmarkets.net/market/' + encodeURIComponent(coinName) + '/AUD/tick';
  var x = new XMLHttpRequest();
  x.open('GET', apiURL);
  x.responseType = 'json';

  x.onload = function() {
    // Expected output
    // {"bestBid":457.0,"bestAsk":464.0,"lastPrice":462.99,"currency":"AUD","instrument":"ETH","timestamp":1497185273,"volume24h":4859.2036}
    var response = x.response;

    // Handle errors from BTC Markets
    if (!response) {
      writeWords('No response from API');
      return;
    }
    // Coin doesn't exist error
    if (response.lastPrice == 'undefined') {
      writeWords(coinName + ' didn\'t return from API');
      return;
    }

    writeWords('$' + response.lastPrice + ' ' + response.currency, coinName);
  }

  x.onerror = function() {
    writeWords('Network error');
  };

  x.send();
}

function writeWords(text, id) {
  if (!id) {
    var id = 'general';
  }
  document.getElementById(id).textContent = text;
}

function populateTable(coins) {
  var table = document.getElementById('coins-table');
  var rowCount = 0;

  for (var key in coins['activeCoins']) {
    if (coins['activeCoins'][key] == 1) {
      ++rowCount;
      var row = table.insertRow(rowCount);

      var c1 = row.insertCell(0);
      c1.innerHTML = '<img src="images/close.png" />'; // set first column as close icon
      c1.id = 'remove-' + key; // set ID after being escaped

      var c2 = row.insertCell(1);
      c2.textContent = key; // set second column as coin name e.g. BTC

      var c3 = row.insertCell(2);
      c3.id = key; // set id of third column as coin name

      apiCall(key); // get coin value

      // Hide button & activate remove button
      document.querySelector('[id="add-' + key + '"]').style.display = 'none';
      buttonListener('-', key);

    } else {
      // Show button and activate add button
      document.querySelector('[id="add-' + key + '"]').style.display = 'inline-block';
      buttonListener('+', key);
    }
  }
}

function refreshTable(coinObj) {
  var table = document.getElementById('coins-table');
  while (table.rows.length > 1) {
    table.deleteRow(1);
  }
  populateTable(coinObj);
}

function buildStore() {
  chrome.storage.sync.set(permittedCoins, function() {
    console.log('Default list saved.');
    getStore(populateTable);
  });
}

function checkStore(coinObj) {
  if (chrome.runtime.lastError) {
    console.log(chrome.runtime.lastError);
    buildStore(); // storage error, try to create the default

  } else if (!coinObj || Object.getOwnPropertyNames(coinObj).length === 0) {
    buildStore(); // storage not set, create default

  } else {
    // Check storage is up-to-date with permittedCoins
    for (var key in permittedCoins['activeCoins']) {
      if (typeof coinObj['activeCoins'][key] == 'undefined') {
        modCoin('+', key); // use modCoin to add new coin(s)
      }
    }
    populateTable(coinObj); // storage set, build the table with it
  }
}

function getStore(callback) {
  chrome.storage.sync.get('activeCoins', callback);
}

function modCoin(mod, coin) {
  // Check coin is valid by comparing against master list
  if (typeof permittedCoins['activeCoins'][coin] == 'undefined') {
    writeWords(coin + ' not listed on BTC Markets');
    return;
  }

  getStore(function(coinObj) {
    // Edit activeCoins to add/remove coin
    if (mod === '+') {
      coinObj['activeCoins'][coin] = 1;
    } else {
      coinObj['activeCoins'][coin] = 0;
    }

    // Update storage and refresh the table
    chrome.storage.sync.set(coinObj, function() {
      console.log(mod + coin);
      refreshTable(coinObj);
    })
  });
}

function defaultCoins() {
  chrome.storage.sync.remove('activeCoins');
  location.reload();
}

function buttonListener(mod, coinName) {
  if (mod === '+') {
    var targetId = 'add';
  } else {
    var targetId = 'remove';
  }
  // Button handler
  document.getElementById(targetId + '-' + coinName).addEventListener('click', function() {
    modCoin(mod, coinName);
  });
}

// Start here
document.addEventListener('DOMContentLoaded', function() {
  // Load Chrome storage
  getStore(checkStore);

  // Refresh on 'Update' click
  document.getElementById('upd').addEventListener('click', function() {
    location.reload();
  });

  // Reset to defaults on 'delete' key press
  document.onkeydown = function(e) {
    if (e.keyCode == 46) {
      defaultCoins();
    }
  }
});
