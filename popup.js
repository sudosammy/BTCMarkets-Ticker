/*
@sudosammy
*/
function apiCall(coin, callback) {
  var apiURL = 'https://api.btcmarkets.net/market/' + encodeURIComponent(coin) + '/AUD/tick';

  var x = new XMLHttpRequest();
  x.open('GET', apiURL);
  x.responseType = 'json';

  x.onload = function() {
    // Expected output
    // {"bestBid":457.0,"bestAsk":464.0,"lastPrice":462.99,"currency":"AUD","instrument":"ETH","timestamp":1497185273,"volume24h":4859.2036}
    var response = x.response;

    // Handle errors from BTC Markets
    if (!response) {
      callback('No response :(');
      return;
    }

    callback('$' + response.lastPrice + ' ' + response.currency, coin);
  }

  x.onerror = function() {
    callback('Network error :(');
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
  var table = document.getElementById('coins_table');

  for (var i = 0; i < coins.length; i++) {
    var row = table.insertRow(i+1);

    var c1 = row.insertCell(0);
    c1.textContent = coins[i]; // set first column as coin name e.g. BTC

    var c2 = row.insertCell(1);
    c2.id = coins[i]; // set id of second column as coin name

    apiCall(coins[i], writeWords); // get coin value
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // TODO get values from Chrome storage of which cryptocurrencies to load
  // user can hide/unhide them to add/remove them from chrome storage :thumbsup:
  var coinsObj = ['BTC', 'ETH', 'LTC']; // For now though, we'll load them like this

  populateTable(coinsObj);

  // Refresh on 'Update' click
  document.getElementById('upd').addEventListener('click', function() {
    location.reload();
  });
});
