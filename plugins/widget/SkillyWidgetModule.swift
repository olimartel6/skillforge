import Foundation
import WidgetKit

/// Native module exposed to React Native for reloading widget timelines.
/// Registered by the config plugin via a bridging setup.
@objc(SkillyWidgetModule)
class SkillyWidgetModule: NSObject {

    @objc
    static func requiresMainQueueSetup() -> Bool { false }

    @objc
    func reloadAllTimelines() {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
    }
}
