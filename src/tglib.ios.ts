/// <reference path="./platforms/ios/TDJSON.d.ts" />
import { knownFolders, Folder, path } from "tns-core-modules/file-system";
import {
    InvalidCallbackError,
    ClientFetchError,
} from './errors';

import {version} from './package.json';

const convertToJSON = (data:NSDictionary<string, any>):JSON => {
    let jsonData = NSJSONSerialization.dataWithJSONObjectOptionsError(data, 0);
    return JSON.parse(NSString.alloc().initWithDataEncoding(jsonData, 4).toString());
};

export class Tglib {
    options: Options = {
        apiId: null,
        apiHash: null,
        auth: {},
        verbosityLevel: 2,
        tdlibParameters: {
            enable_storage_optimizer: true,
            use_message_database: true,
            use_secret_chats: true,
            system_language_code: 'en',
            application_version: '1.0',
            device_model: 'ios',
            system_version: version
        }
    };
    fetching: Object = {};
    callbacks: Object = {
        'td:update': void 0,
        'td:error': void 0
    };
    authFlowPasswordHint:any;
    client:any;
    ready:Promise<any>;

    documents: Folder = <Folder>knownFolders.documents();

    constructor(options:object={}) {
        this.options = {
            ...this.options,
            ...options,
        };

        this.client = new TDJSON();
        this.ready = new Promise((resolve) => {
            // Add some delay to allow telegram get ready. (Issue #20)
            setTimeout(resolve, 500);
        });

        this.loop();
    }

    public registerCallback(key, callback): void {
        const validNames = Object.keys(this.callbacks);
        if (validNames.indexOf(key) < 0) {
            throw new InvalidCallbackError(key);
        }
        if (key === 'td:getInput') {
            const result = callback({}) || {};
            if (typeof result.then !== 'function') {
                throw new InvalidCallbackError(key);
            }
        }
        this.callbacks[key] = callback;
    }

    public destroy() {
        if (this.client) {
            this.client.destroy();
        }
    }

    public async loop() {
        const update = await this.receive();

        if (update) {
            switch (update['@type']) {
                case 'updateAuthorizationState': {
                    await this.handleAuth(update);
                    break;
                }
                case 'error': {
                    await this.handleError(update);
                    break;
                }
                default:
                    await this.handleUpdate(update);
                    break;
            }
        }

        this.loop();
    }

    public async fetch(query) {
        const id = Math.floor((Math.random() * 10) + 1).toString();

        query['@extra'] = id;
        const receiveUpdate = new Promise((resolve, reject) => {
            this.fetching[id] = { resolve, reject };
            setTimeout(() => {
                delete this.fetching[id];
                reject('Query timed out after 15 seconds.')
            }, 1000 * 15)
        });
        await this.send(query);
        return receiveUpdate;
    }

    public send(query):Promise<any> {
        return new Promise((resolve) => {
            let callback = (response):void => {
                if (!response) {
                    return resolve(null);
                }
                resolve(convertToJSON(response));
            };

            return this.client.queryAsyncWithQueryF(query, callback);
        })
    }

    public receive():Promise<any> {
        return new Promise((resolve) => {
            let callback = (response):void => {
                if (!response) {
                    return resolve(null);
                }
                resolve(convertToJSON(response));
            };

            return this.client.runWithUpdateHandler(callback);
        });
    }

    async handleAuth(update) {
        const { auth: { type, value } } = this.options;
        switch (update['authorization_state']['@type']) {
            case 'authorizationStateWaitTdlibParameters': {
                this.send({
                    '@type': 'setTdlibParameters',
                    'parameters': {
                        ...this.options.tdlibParameters,
                        '@type': 'tdlibParameters',
                        'database_directory': path.join(this.documents.path, '__tdjson__', `database`),
                        'files_directory': path.join(this.documents.path, '__tdjson__', 'files'),
                        'api_id': this.options.apiId,
                        'api_hash': this.options.apiHash,
                    },
                });
                break;
            }
            case 'authorizationStateWaitEncryptionKey': {
                this.send({ '@type': 'checkDatabaseEncryptionKey' });
                break;
            }
            case 'authorizationStateWaitPhoneNumber': {
                if (type === 'user') {
                    this.send({
                        '@type': 'setAuthenticationPhoneNumber',
                        'phone_number': value,
                    });
                } else {
                    this.send({
                        '@type': 'checkAuthenticationBotToken',
                        'token': value,
                    });
                }
                break;
            }
            case 'authorizationStateWaitCode': {
                const payload = { '@type': 'checkAuthenticationCode' };
                if (!update['authorization_state']['is_registered']) {
                    payload['first_name'] = await this.callbacks['td:getInput']({
                        type: 'input',
                        string: 'AuthorizationFirstNameInput',
                    })
                }
                payload['code'] = await this.callbacks['td:getInput']({
                    type: 'input',
                    string: 'AuthorizationAuthCodeInput',
                });
                this.send(payload);
                break;
            }
            case 'authorizationStateWaitPassword': {
                this.authFlowPasswordHint = update['authorization_state']['password_hint'];
                const password = await this.callbacks['td:getInput']({
                    type: 'password',
                    string: 'AuthorizationPasswordInput',
                    extras: { hint: this.authFlowPasswordHint },
                });
                this.send({
                    '@type': 'checkAuthenticationPassword',
                    'password': password,
                });
                break;
            }
            case 'authorizationStateReady':
                delete this.authFlowPasswordHint;
                break;
        }
    }

    async handleError(update) {
        const id = update['@extra'];
        if (this.fetching[id]) {
            delete update['@extra'];
            this.fetching[id].reject(new ClientFetchError(update));
            delete this.fetching[id];
            return
        }
        switch (update['message']) {
            case 'PHONE_CODE_EMPTY':
            case 'PHONE_CODE_INVALID': {
                const code = await this.callbacks['td:getInput']({
                    type: 'input',
                    string: 'AuthorizationAuthCodeReInput',
                });
                this.send({
                    '@type': 'checkAuthenticationCode',
                    'code': code,
                });
                break;
            }
            case 'PASSWORD_HASH_INVALID': {
                const password = await this.callbacks['td:getInput']({
                    type: 'password',
                    string: 'AuthorizationPasswordReInput',
                    extras: { hint: this.authFlowPasswordHint },
                });
                this.send({
                    '@type': 'checkAuthenticationPassword',
                    'password': password,
                });
                break;
            }
            case 'ACCESS_TOKEN_INVALID': {
                break;
            }
            default: {
                this.callbacks['td:error'].call(null, update);
            }
        }
    }

    async handleUpdate(update) {
        const id = update['@extra'];

        if (this.fetching[id]) {
            delete update['@extra'];
            this.fetching[id].resolve(update);

            delete this.fetching[id];
            return;
        }

        switch (update['@type']) {
            case 'updateOption': {
                if (update['name'] === 'my_id' && update['value']['@type'] === 'optionValueEmpty') {
                    this.client.destroy();
                    this.client = null;
                    break
                }
                break;
            } default: {
                this.callbacks['td:update'].call(null, update);

            }
        }
    }
}