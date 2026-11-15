enum ShiftStatus { scheduled, offered }

const List<String> weekdayNames = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/// One weekly shift. The backend's Schedule model is a repeating weekly slot
/// (dayOfWeek + "HH:mm" strings), not a calendar date.
class Shift {
  final String id;
  final String userId;
  final String? ownerName;
  final String groupId;
  final String? groupName;
  final String dayOfWeek; // "Monday" .. "Sunday"
  final String startTime; // "09:00"
  final String endTime; // "17:00"
  final String title;
  final ShiftStatus status;

  const Shift({
    required this.id,
    required this.userId,
    this.ownerName,
    this.groupId = '',
    this.groupName,
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    this.title = 'Shift',
    this.status = ShiftStatus.scheduled,
  });

  /// 0 = Monday ... 6 = Sunday (matches DateTime.weekday - 1).
  int get dayIndex {
    final i = weekdayNames.indexOf(dayOfWeek);
    return i < 0 ? 0 : i;
  }

  /// Backend shape (routes/shifts.js):
  /// { _id, group: "id" | {_id, groupName}, user: "id" | {_id, firstName, lastName},
  ///   dayOfWeek, startTime, endTime, title, status: "assigned" | "up_for_grabs" }
  factory Shift.fromJson(Map<String, dynamic> json) {
    final user = json['user'];
    final group = json['group'];
    return Shift(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      userId: _idOf(user),
      ownerName: _nameOf(user),
      groupId: _idOf(group),
      groupName: group is Map ? group['groupName']?.toString() : null,
      dayOfWeek: (json['dayOfWeek'] ?? 'Monday').toString(),
      startTime: (json['startTime'] ?? '00:00').toString(),
      endTime: (json['endTime'] ?? '00:00').toString(),
      title: (json['title'] ?? 'Shift').toString(),
      status: json['status'] == 'up_for_grabs'
          ? ShiftStatus.offered
          : ShiftStatus.scheduled,
    );
  }

  static String _idOf(dynamic value) {
    if (value is Map) return (value['_id'] ?? value['id'] ?? '').toString();
    return (value ?? '').toString();
  }

  static String? _nameOf(dynamic value) {
    if (value is! Map) return null;
    final name = '${value['firstName'] ?? ''} ${value['lastName'] ?? ''}'.trim();
    return name.isEmpty ? null : name;
  }

  Shift copyWith({ShiftStatus? status, String? ownerName, String? groupName}) {
    return Shift(
      id: id,
      userId: userId,
      ownerName: ownerName ?? this.ownerName,
      groupId: groupId,
      groupName: groupName ?? this.groupName,
      dayOfWeek: dayOfWeek,
      startTime: startTime,
      endTime: endTime,
      title: title,
      status: status ?? this.status,
    );
  }
}
