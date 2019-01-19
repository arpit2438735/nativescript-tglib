# Nativescript Tglib ![apple](https://cdn3.iconfinder.com/data/icons/picons-social/57/16-apple-32.png)

Nativescript Library for building Telegram clients

## Installation

Describe your plugin installation steps. Ideally it would be something like:

```javascript
tns plugin add nativescript-tglib
```

## Features

- Currently support for iOS
- Android coming soon

---

### APIs

tglib provide some useful methods that makes your Telegram app development easier.

Most API classes/methods can be found in the official [TDLib documentation](https://core.telegram.org/tdlib/docs/classes.html).

#### Authorizing an user

```js
const client = new TDJSON({
  apiId: 'YOUR_API_ID',
  apiHash: 'YOUR_API_HASH',
  auth: {
    type: 'user',
    value: 'YOUR_PHONE_NUMBER',
  },
})
```

#### Authorizing a bot

```js
const client = new TDJSON({
  apiId: 'YOUR_API_ID',
  apiHash: 'YOUR_API_HASH',
  auth: {
    type: 'bot',
    value: 'YOUR_BOT_TOKEN',
  },
})
```

#### ![](https://placehold.it/12/efcf39/000?text=+) Low Level APIs


##### `client.ready`


This promise is used for initializing tglib client and connect with Telegram.

```js
await client.ready
```
##### `client.registerCallback(key, callback)` -> Void


This API is provided by tglib, you can use this API to register your function in order to receive callbacks.

The authorization process can be overridden here by registering `td:getInput` callback.

```js
client.registerCallback('td:update', (update) => console.log(update))
client.registerCallback('td:error', (error) => console.error(error))
client.registerCallback('td:getInput', async (args) => {
  const result = await getInputFromUser(args)
  return result
})
```

##### `client.fetch(query)` -> Promise -> Object

This API is provided by tglib, you can use this API to send asynchronous message to Telegram and receive response.

```js
const chats = await client.fetch({
  '@type': 'getChats',
  'offset_order': '9223372036854775807',
  'offset_chat_id': 0,
  'limit': 100,
})
```
## License

Apache License Version 2.0, January 2004
