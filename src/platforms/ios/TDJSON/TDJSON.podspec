
Pod::Spec.new do |s|
  s.name         = "TDJSON"
  s.version      = "1.0.0"
  s.summary      = "Telegram Database Library in Swift"
  s.authors      = "Arpit Srivastava"
  s.homepage     = "https://github.com/arpit2438735/nativescript-tglib"
  s.source       = { :git => "https://github.com/arpit2438735/nativescript-tglib.git", :tag => s.version }

  s.pod_target_xcconfig = { 'SWIFT_VERSION' => '3.2' }
  s.source_files = 'include/td/telegram/tdjson_export.h','include/td/telegram/td_json_client.h', 'include/td/telegram/td_log.h','TDJSON/*.{h,swift}'
  s.vendored_libraries = 'lib/libtdjson.dylib'
  s.public_header_files = 'include/td/telegram/td_json_client.h', 'include/td/telegram/td_log.h','td/telegram/tdjson_export.h'
  s.requires_arc = true
end
