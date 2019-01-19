export class InvalidCallbackError extends Error {
  constructor(eventName) {
    super();
    this.message = `"${eventName}" is not a valid callback.`
  }
}

export class InvalidBotTokenError extends Error {
  constructor(token) {
    super();
    this.message = `Bot access token "${token}" is not valid`
  }
}

export class ClientCreateError extends Error {
  constructor(error) {
    super(error);
    this.message = `Unable to create client: ${error.message}`
  }
}

export class ClientNotCreatedError extends Error {
  constructor(error) {
    super(error);
    this.message = 'Client is not created'
  }
}

export class ClientFetchError extends Error {
  constructor(update) {
    super();
    this.message = JSON.stringify(update)
  }
}
