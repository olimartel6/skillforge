import WidgetKit
import SwiftUI

// MARK: - Shared Data

struct SkillyWidgetData {
    let currentStreak: Int
    let longestStreak: Int
    let dailyXp: Int
    let dailyXpGoal: Int
    let level: Int
    let totalXp: Int
    let selectedSkill: String?
    let lastUpdated: String?

    static let placeholder = SkillyWidgetData(
        currentStreak: 5, longestStreak: 12,
        dailyXp: 65, dailyXpGoal: 100,
        level: 3, totalXp: 1250,
        selectedSkill: "Trading", lastUpdated: nil
    )

    static func load() -> SkillyWidgetData {
        guard let defaults = UserDefaults(suiteName: "group.com.olimartel6.skilly"),
              let jsonString = defaults.string(forKey: "widget_data"),
              let data = jsonString.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else { return .placeholder }

        return SkillyWidgetData(
            currentStreak: json["currentStreak"] as? Int ?? 0,
            longestStreak: json["longestStreak"] as? Int ?? 0,
            dailyXp: json["dailyXp"] as? Int ?? 0,
            dailyXpGoal: json["dailyXpGoal"] as? Int ?? 100,
            level: json["level"] as? Int ?? 1,
            totalXp: json["totalXp"] as? Int ?? 0,
            selectedSkill: json["selectedSkill"] as? String,
            lastUpdated: json["lastUpdated"] as? String
        )
    }
}

// MARK: - Timeline

struct SkillyEntry: TimelineEntry {
    let date: Date
    let data: SkillyWidgetData
}

struct SkillyProvider: TimelineProvider {
    func placeholder(in context: Context) -> SkillyEntry {
        SkillyEntry(date: Date(), data: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (SkillyEntry) -> Void) {
        completion(SkillyEntry(date: Date(), data: SkillyWidgetData.load()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SkillyEntry>) -> Void) {
        let entry = SkillyEntry(date: Date(), data: SkillyWidgetData.load())
        // Refresh every 30 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }
}

// MARK: - Colors

extension Color {
    static let skillyBg = Color(red: 10/255, green: 10/255, blue: 11/255)
    static let skillyOrange = Color(red: 255/255, green: 107/255, blue: 53/255)
    static let skillyOrangeDark = Color(red: 255/255, green: 61/255, blue: 0/255)
    static let skillyPurple = Color(red: 108/255, green: 99/255, blue: 255/255)
    static let skillyGreen = Color(red: 52/255, green: 211/255, blue: 153/255)
    static let skillyTextSecondary = Color(red: 136/255, green: 136/255, blue: 136/255)
    static let skillyCardBg = Color.white.opacity(0.05)
}

// MARK: - Small Widget

struct SkillySmallView: View {
    let data: SkillyWidgetData

    var xpProgress: Double {
        guard data.dailyXpGoal > 0 else { return 0 }
        return min(Double(data.dailyXp) / Double(data.dailyXpGoal), 1.0)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Header: streak
            HStack(spacing: 4) {
                Text("🔥")
                    .font(.system(size: 20))
                Text("\(data.currentStreak)")
                    .font(.system(size: 24, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                Spacer()
                Text("Lv.\(data.level)")
                    .font(.system(size: 13, weight: .semibold, design: .rounded))
                    .foregroundColor(.skillyOrange)
            }

            Text("day streak")
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(.skillyTextSecondary)

            Spacer()

            // XP Progress bar
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("\(data.dailyXp)/\(data.dailyXpGoal) XP")
                        .font(.system(size: 11, weight: .semibold, design: .rounded))
                        .foregroundColor(.white)
                    Spacer()
                    if xpProgress >= 1.0 {
                        Text("✓")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.skillyGreen)
                    }
                }

                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule()
                            .fill(Color.white.opacity(0.1))
                            .frame(height: 6)

                        Capsule()
                            .fill(
                                LinearGradient(
                                    colors: [.skillyOrange, .skillyOrangeDark],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .frame(width: max(geo.size.width * xpProgress, 4), height: 6)
                    }
                }
                .frame(height: 6)
            }
        }
        .padding(14)
        .widgetURL(URL(string: "skilly://home"))
    }
}

// MARK: - Medium Widget

struct SkillyMediumView: View {
    let data: SkillyWidgetData

    var xpProgress: Double {
        guard data.dailyXpGoal > 0 else { return 0 }
        return min(Double(data.dailyXp) / Double(data.dailyXpGoal), 1.0)
    }

    var skillDisplayName: String {
        guard let skill = data.selectedSkill, !skill.isEmpty else { return "No skill" }
        return skill.replacingOccurrences(of: "_", with: " ").capitalized
    }

    var body: some View {
        HStack(spacing: 14) {
            // Left: Streak circle
            VStack(spacing: 6) {
                ZStack {
                    Circle()
                        .stroke(Color.white.opacity(0.08), lineWidth: 4)
                        .frame(width: 56, height: 56)
                    Circle()
                        .trim(from: 0, to: xpProgress)
                        .stroke(
                            LinearGradient(
                                colors: [.skillyOrange, .skillyOrangeDark],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            style: StrokeStyle(lineWidth: 4, lineCap: .round)
                        )
                        .frame(width: 56, height: 56)
                        .rotationEffect(.degrees(-90))

                    VStack(spacing: 0) {
                        Text("🔥")
                            .font(.system(size: 16))
                        Text("\(data.currentStreak)")
                            .font(.system(size: 16, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                    }
                }

                Text("streak")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.skillyTextSecondary)
            }

            // Right: Details
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(skillDisplayName)
                        .font(.system(size: 15, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .lineLimit(1)
                    Spacer()
                    Text("Lv.\(data.level)")
                        .font(.system(size: 12, weight: .semibold, design: .rounded))
                        .foregroundColor(.skillyOrange)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(Color.skillyOrange.opacity(0.15))
                        .clipShape(Capsule())
                }

                // XP bar
                VStack(alignment: .leading, spacing: 3) {
                    HStack {
                        Text("Daily XP")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(.skillyTextSecondary)
                        Spacer()
                        Text("\(data.dailyXp)/\(data.dailyXpGoal)")
                            .font(.system(size: 10, weight: .semibold, design: .rounded))
                            .foregroundColor(.white)
                    }

                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            Capsule()
                                .fill(Color.white.opacity(0.1))
                                .frame(height: 5)
                            Capsule()
                                .fill(
                                    LinearGradient(
                                        colors: [.skillyOrange, .skillyOrangeDark],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .frame(width: max(geo.size.width * xpProgress, 3), height: 5)
                        }
                    }
                    .frame(height: 5)
                }

                Spacer(minLength: 0)

                // Bottom row: total XP + tap hint
                HStack {
                    Text("\(data.totalXp) total XP")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.skillyTextSecondary)
                    Spacer()
                    Text("Open Skilly →")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(.skillyOrange)
                }
            }
        }
        .padding(14)
        .widgetURL(URL(string: "skilly://home"))
    }
}

// MARK: - Widget Configuration

struct SkillyWidget: Widget {
    let kind: String = "SkillyWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SkillyProvider()) { entry in
            Group {
                if #available(iOSApplicationExtension 17.0, *) {
                    SkillyWidgetEntryView(entry: entry)
                        .containerBackground(.fill.tertiary, for: .widget)
                } else {
                    SkillyWidgetEntryView(entry: entry)
                        .background(Color.skillyBg)
                }
            }
        }
        .configurationDisplayName("Skilly")
        .description("Track your streak and daily XP progress.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct SkillyWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: SkillyEntry

    var body: some View {
        Group {
            switch family {
            case .systemSmall:
                SkillySmallView(data: entry.data)
            case .systemMedium:
                SkillyMediumView(data: entry.data)
            default:
                SkillySmallView(data: entry.data)
            }
        }
        .background(Color.skillyBg)
    }
}

// MARK: - Widget Bundle Entry

@main
struct SkillyWidgetBundle: WidgetBundle {
    var body: some Widget {
        SkillyWidget()
    }
}
