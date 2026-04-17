/**
 * Expo Config Plugin — iOS Home Screen Widget
 *
 * This plugin modifies the Xcode project during `npx expo prebuild` to:
 *   1. Add the App Group entitlement to the main app target
 *   2. Create a Widget Extension target (SkillyWidget)
 *   3. Copy SwiftUI widget source files into the extension
 *   4. Register the SkillyWidgetModule native module in the main app
 *
 * Compatible with Expo SDK 55, managed workflow, EAS builds.
 */
const {
  withXcodeProject,
  withEntitlementsPlist,
  withInfoPlist,
  withDangerousMod,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const APP_GROUP = 'group.com.olimartel6.skilly';
const WIDGET_TARGET_NAME = 'SkillyWidgetExtension';
const WIDGET_BUNDLE_ID = 'com.olimartel6.skilly.widget';
const DEPLOYMENT_TARGET = '16.0';

// ─── 1. Add App Group to main app entitlements ───

function withAppGroupEntitlement(config) {
  return withEntitlementsPlist(config, (mod) => {
    const entitlements = mod.modResults;
    if (!entitlements['com.apple.security.application-groups']) {
      entitlements['com.apple.security.application-groups'] = [];
    }
    const groups = entitlements['com.apple.security.application-groups'];
    if (!groups.includes(APP_GROUP)) {
      groups.push(APP_GROUP);
    }
    return mod;
  });
}

// ─── 2. Copy widget Swift sources + create extension folder ───

function withWidgetFiles(config) {
  return withDangerousMod(config, [
    'ios',
    async (mod) => {
      const iosDir = path.join(mod.modRequest.projectRoot, 'ios');
      const widgetDir = path.join(iosDir, WIDGET_TARGET_NAME);

      if (!fs.existsSync(widgetDir)) {
        fs.mkdirSync(widgetDir, { recursive: true });
      }

      // Copy SwiftUI widget file
      const pluginWidgetDir = path.join(mod.modRequest.projectRoot, 'plugins', 'widget');

      const filesToCopy = ['SkillyWidget.swift'];
      for (const file of filesToCopy) {
        const src = path.join(pluginWidgetDir, file);
        const dest = path.join(widgetDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      }

      // Create Info.plist for the widget extension
      const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>en</string>
  <key>CFBundleDisplayName</key>
  <string>Skilly</string>
  <key>CFBundleExecutable</key>
  <string>$(EXECUTABLE_NAME)</string>
  <key>CFBundleIdentifier</key>
  <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>$(PRODUCT_NAME)</string>
  <key>CFBundlePackageType</key>
  <string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
  <key>CFBundleShortVersionString</key>
  <string>$(MARKETING_VERSION)</string>
  <key>CFBundleVersion</key>
  <string>$(CURRENT_PROJECT_VERSION)</string>
  <key>NSExtension</key>
  <dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.widgetkit-extension</string>
  </dict>
</dict>
</plist>`;
      fs.writeFileSync(path.join(widgetDir, 'Info.plist'), infoPlist);

      // Create entitlements for widget extension (App Group)
      const widgetEntitlements = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.application-groups</key>
  <array>
    <string>${APP_GROUP}</string>
  </array>
</dict>
</plist>`;
      fs.writeFileSync(
        path.join(widgetDir, `${WIDGET_TARGET_NAME}.entitlements`),
        widgetEntitlements
      );

      // Copy native module files into the main app ios/ folder
      const nativeModuleFiles = ['SkillyWidgetModule.swift', 'SkillyWidgetModule.m'];
      for (const file of nativeModuleFiles) {
        const src = path.join(pluginWidgetDir, file);
        // Place in the main app source directory
        const appName = mod.modRequest.projectName || 'SkillForge';
        const destDir = path.join(iosDir, appName);
        if (fs.existsSync(destDir) && fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(destDir, file));
        }
      }

      return mod;
    },
  ]);
}

// ─── 3. Add Widget Extension target to Xcode project ───

function withWidgetTarget(config) {
  return withXcodeProject(config, (mod) => {
    const project = mod.modResults;
    const appName = mod.modRequest.projectName || 'SkillForge';

    // Check if widget target already exists
    const targets = project.hash?.project?.objects?.PBXNativeTarget || {};
    for (const key of Object.keys(targets)) {
      if (typeof targets[key] === 'object' && targets[key].name === WIDGET_TARGET_NAME) {
        // Already added — skip
        return mod;
      }
    }

    // Add the widget extension target
    const widgetTarget = project.addTarget(
      WIDGET_TARGET_NAME,
      'app_extension',
      WIDGET_TARGET_NAME,
      WIDGET_BUNDLE_ID
    );

    if (!widgetTarget) {
      console.warn('[withWidget] Failed to add widget target');
      return mod;
    }

    // Add build phase for sources
    const sourceBuildPhase = project.addBuildPhase(
      [],
      'PBXSourcesBuildPhase',
      'Sources',
      widgetTarget.uuid
    );

    // Add build phase for frameworks
    project.addBuildPhase(
      [],
      'PBXFrameworksBuildPhase',
      'Frameworks',
      widgetTarget.uuid
    );

    // Add the widget group
    const widgetGroupKey = project.pbxCreateGroup(WIDGET_TARGET_NAME, WIDGET_TARGET_NAME);

    // Add Swift source file to widget target
    const swiftFile = project.addFile(
      `${WIDGET_TARGET_NAME}/SkillyWidget.swift`,
      widgetGroupKey,
      { target: widgetTarget.uuid, lastKnownFileType: 'sourcecode.swift' }
    );

    // Add Info.plist reference
    project.addFile(
      `${WIDGET_TARGET_NAME}/Info.plist`,
      widgetGroupKey,
      { lastKnownFileType: 'text.plist.xml' }
    );

    // Add entitlements reference
    project.addFile(
      `${WIDGET_TARGET_NAME}/${WIDGET_TARGET_NAME}.entitlements`,
      widgetGroupKey,
      { lastKnownFileType: 'text.plist.entitlements' }
    );

    // Add the widget group to the main project group
    const mainGroupKey = project.getFirstProject().firstProject.mainGroup;
    project.addToPbxGroup(widgetGroupKey, mainGroupKey);

    // Configure build settings for the widget target
    const configurations = project.pbxXCBuildConfigurationSection();
    for (const key of Object.keys(configurations)) {
      const config = configurations[key];
      if (typeof config !== 'object') continue;
      if (!config.buildSettings) continue;

      // Find build configurations that belong to the widget target
      const configList = project.hash?.project?.objects?.XCConfigurationList || {};
      for (const listKey of Object.keys(configList)) {
        const list = configList[listKey];
        if (typeof list !== 'object' || !list.buildConfigurations) continue;

        const isWidgetConfigList = list.buildConfigurations.some(
          (ref) => ref.value === key
        );

        if (isWidgetConfigList) {
          // Check if this config list belongs to our widget target
          const nativeTargets = project.hash?.project?.objects?.PBXNativeTarget || {};
          for (const tKey of Object.keys(nativeTargets)) {
            const t = nativeTargets[tKey];
            if (typeof t === 'object' && t.name === WIDGET_TARGET_NAME && t.buildConfigurationList === listKey) {
              config.buildSettings.PRODUCT_BUNDLE_IDENTIFIER = `"${WIDGET_BUNDLE_ID}"`;
              config.buildSettings.INFOPLIST_FILE = `"${WIDGET_TARGET_NAME}/Info.plist"`;
              config.buildSettings.CODE_SIGN_ENTITLEMENTS = `"${WIDGET_TARGET_NAME}/${WIDGET_TARGET_NAME}.entitlements"`;
              config.buildSettings.SWIFT_VERSION = '"5.0"';
              config.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = DEPLOYMENT_TARGET;
              config.buildSettings.TARGETED_DEVICE_FAMILY = '"1"'; // iPhone only
              config.buildSettings.MARKETING_VERSION = '"1.0"';
              config.buildSettings.CURRENT_PROJECT_VERSION = '"1"';
              config.buildSettings.GENERATE_INFOPLIST_FILE = 'YES';
              config.buildSettings.ASSETCATALOG_COMPILER_WIDGET_BACKGROUND_COLOR_NAME = '"WidgetBackground"';
              config.buildSettings.SKIP_INSTALL = 'YES';
              config.buildSettings.LD_RUNPATH_SEARCH_PATHS = '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"';
            }
          }
        }
      }
    }

    // Add WidgetKit and SwiftUI frameworks
    project.addFramework('WidgetKit.framework', {
      target: widgetTarget.uuid,
      link: true,
    });
    project.addFramework('SwiftUI.framework', {
      target: widgetTarget.uuid,
      link: true,
    });

    // Embed the widget extension in the main app
    const embedPhase = project.addBuildPhase(
      [],
      'PBXCopyFilesBuildPhase',
      'Embed App Extensions',
      project.getFirstTarget().uuid,
      'app_extension'
    );

    if (embedPhase) {
      // Set the dstSubfolderSpec to 13 (PlugIns folder)
      const phases = project.hash?.project?.objects?.PBXCopyFilesBuildPhase || {};
      for (const phaseKey of Object.keys(phases)) {
        const phase = phases[phaseKey];
        if (typeof phase === 'object' && phase.name === '"Embed App Extensions"') {
          phase.dstSubfolderSpec = 13;
        }
      }
    }

    // Add native module files to main target
    const mainTargetUuid = project.getFirstTarget().uuid;
    const appGroupKey = project.findPBXGroupKey({ name: appName }) || mainGroupKey;

    const nativeModuleFiles = ['SkillyWidgetModule.swift', 'SkillyWidgetModule.m'];
    for (const file of nativeModuleFiles) {
      const filePath = `${appName}/${file}`;
      project.addFile(filePath, appGroupKey, {
        target: mainTargetUuid,
        lastKnownFileType: file.endsWith('.swift') ? 'sourcecode.swift' : 'sourcecode.c.objc',
      });
    }

    return mod;
  });
}

// ─── Plugin Entry Point ───

function withSkillyWidget(config) {
  config = withAppGroupEntitlement(config);
  config = withWidgetFiles(config);
  config = withWidgetTarget(config);
  return config;
}

module.exports = withSkillyWidget;
