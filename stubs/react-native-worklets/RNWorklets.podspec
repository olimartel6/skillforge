Pod::Spec.new do |s|
  s.name         = "RNWorklets"
  s.version      = "0.7.0"
  s.summary      = "Worklets stub for Reanimated"
  s.homepage     = "https://github.com/software-mansion/react-native-reanimated"
  s.license      = "MIT"
  s.author       = "stub"
  s.source       = { :path => "." }
  s.platforms    = { :ios => "15.1" }
  s.source_files = "ios/**/*.{h,m,mm,cpp}"
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }
end
