import { Observable } from 'tns-core-modules/data/observable';
import { Tglib } from 'nativescript-tglib';

export class HelloWorldModel extends Observable {
  private client: Tglib;

  constructor() {
    super();

    this.client = new Tglib({
      apiId: '620631',
      apiHash: '3a2faa69b28b3ca7d2f284a67fbc328c'
    });

    this.client.registerCallback('td:update', (update) => console.log(update));
    this.client.registerCallback('td:error', (error) => console.error(error));


    this.fetch();
  }

  async fetch() {
    await this.client.ready;

    const chats = await this.client.fetch({
      '@type': 'getChats',
      'offset_order': '9223372036854775807',
      'offset_chat_id': 0,
      'limit': 100,
    });

    console.log(chats);
  }
}
