import Foundation
/**
  Swift interface for interaction with TDLib via JSON-serialized objects.
  Can be used to easily integrate TDLib with any programming language which supports calling C functions
  and is able to work with JSON.

  The JSON serialization of TDLib API objects is straightforward: all API objects are represented as JSON objects with
  the same keys as the API object field names. The object type name is stored in the special field "@type", which is
  optional in places where a type is uniquely determined by the context.
  Bool object fields are stored as Booleans in JSON. int32, int53 and double fields are stored as Numbers.
  int64 and string fields are stored as Strings. bytes fields are base64 encoded and then stored as String.
  vectors are stored as Arrays.
  The main TDLib interface is asynchronous. To match requests with a corresponding response a field "@extra" can
  be added to the request object. The corresponding response will have an "@extra" field with exactly the same value.

  A TDLib client instance should be created through td_json_client_create.
  Requests then can be sent using td_json_client_send from any thread.
  New updates and request responses can be received through td_json_client_receive from any thread. This function
  shouldn't be called simultaneously from two different threads. Also note that all updates and request responses
  should be applied in the order they were received to ensure consistency.
  Given this information, it's advisable to call this function from a dedicated thread.
  Some service TDLib requests can be executed synchronously from any thread by using td_json_client_execute.
  The TDLib client instance can be destroyed via td_json_client_destroy.
 */
@objcMembers public class TDJSON: NSObject {
    typealias Client = UnsafeMutableRawPointer
    @objc public let client = td_json_client_create()!
    @objc let tdlibMainLoop = DispatchQueue(label: "TDLib")
    @objc let tdlibQueryQueue = DispatchQueue(label: "TDLibQuery")
    var queryF = Dictionary<Int64, (Dictionary<String,Any>)->()>()
    var updateF: ((Dictionary<String,Any>)->())?
    var queryId: Int64 = 0

    @objc public func queryAsync(query: [String: Any], f: ((Dictionary<String,Any>)->())? = nil) {
        tdlibQueryQueue.async {
            var newQuery = query

            if f != nil {
                let nextQueryId = self.queryId + 1
                newQuery["@extra"] = nextQueryId
                self.queryF[nextQueryId] = f
                self.queryId = nextQueryId
            }
            td_json_client_send(self.client, to_json(newQuery))
        }
    }

    @objc public func querySync(query: [String: Any]) -> Dictionary<String,Any> {
        let semaphore = DispatchSemaphore(value:0)
        var result = Dictionary<String,Any>()
        queryAsync(query: query) {
            result = $0
            semaphore.signal()
        }
        semaphore.wait()
        return result
    }

    @objc public func run(updateHandler: @escaping (Dictionary<String,Any>)->()) {
        updateF = updateHandler
        tdlibMainLoop.async { [weak self] in
            while (true) {
                if let s = self {
                    if let res = td_json_client_receive(s.client, 10) {
                        let event = String(cString: res)
                        s.queryResultAsync(event)
                    }
                } else {
                    break
                }
            }
        }
    }

    @objc public func run(client: UnsafeMutableRawPointer, timeout: TimeInterval) -> String? {
        if let response = td_json_client_receive(client, timeout) {
            return String(cString: response)
        }
        return nil
    }

    @objc public func destroy() {
        td_json_client_destroy(self.client);
    }

    private func queryResultAsync(_ result: String) {
        tdlibQueryQueue.async {
            let json = try? JSONSerialization.jsonObject(with: result.data(using: .utf8)!, options:[])
            if let dictionary = json as? [String:Any] {
                if let extra = dictionary["@extra"] as? Int64 {
                    let index = self.queryF.index(forKey: extra)!
                    self.queryF[index].value(dictionary)
                    self.queryF.remove(at: index)
                } else {
                    self.updateF!(dictionary)
                }
            }
        }
    }
}

func to_json(_ obj: Any) -> String {
    do {
        let obj = try JSONSerialization.data(withJSONObject: obj)
        return String(data: obj, encoding: .utf8)!
    } catch {
        return ""
    }
}
