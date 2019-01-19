
declare class TDJSON extends NSObject {

    static alloc(): TDJSON; // inherited from NSObject

    static new(): TDJSON; // inherited from NSObject

    readonly client: interop.Pointer | interop.Reference<any>;

    destroy(): void;

    queryAsyncWithQueryF(query: NSDictionary<string, any>, f: (p1: NSDictionary<string, any>) => void): void;

    querySyncWithQuery(query: NSDictionary<string, any>): NSDictionary<string, any>;

    runWithUpdateHandler(updateHandler: (p1: NSDictionary<string, any>) => void): void;
}

declare var TDJSONVersionNumber: number;

declare var TDJSONVersionString: interop.Reference<number>;

declare function td_json_client_create(): interop.Pointer | interop.Reference<any>;

declare function td_json_client_destroy(client: interop.Pointer | interop.Reference<any>): void;

declare function td_json_client_execute(client: interop.Pointer | interop.Reference<any>, request: string): string;

declare function td_json_client_receive(client: interop.Pointer | interop.Reference<any>, timeout: number): string;

declare function td_json_client_send(client: interop.Pointer | interop.Reference<any>, request: string): void;

declare function td_set_log_fatal_error_callback(callback: interop.FunctionReference<(p1: string) => void>): void;

declare function td_set_log_file_path(file_path: string): number;

declare function td_set_log_max_file_size(max_file_size: number): void;

declare function td_set_log_verbosity_level(new_verbosity_level: number): void;

declare interface Options {
    apiId?: string;
    apiHash?: string;
    auth?: {
        type?: string;
        value?: string;
    };
    verbosityLevel: number;
    tdlibParameters?: {
        enable_storage_optimizer:boolean;
        use_message_database: boolean;
        use_secret_chats: boolean;
        system_language_code: string;
        application_version: string;
        device_model: string;
    };
}
