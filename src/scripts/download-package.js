const request = require('request');
const fs = require('fs');

const url = 'https://github.com/arpit2438735/nativescript-tglib/releases/download/0.0/libtdjson.dylib';
const file = fs.createWriteStream(__dirname +'/../platforms/ios/TDJSON/lib/libtdjson.dylib');
const options = {
  headers: {
      'Accept': 'application/octet-stream',
      'User-Agent': 'request module',
  }
};

return new Promise((resolve, reject) => {
    console.log("Downloading library file...");

    request.get(url, options)
        .on('error', function(err) {
            reject(err)
        }).pipe(file);

    file.on('finish', () => resolve());
});
