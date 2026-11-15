/// "09:00" -> "9:00 AM", "17:30" -> "5:30 PM"
String formatClock(String hhmm) {
  final parts = hhmm.split(':');
  final h = int.tryParse(parts.isNotEmpty ? parts[0] : '') ?? 0;
  final m = parts.length > 1 ? (int.tryParse(parts[1]) ?? 0) : 0;
  final hour = h % 12 == 0 ? 12 : h % 12;
  final suffix = h < 12 ? 'AM' : 'PM';
  return '$hour:${m.toString().padLeft(2, '0')} $suffix';
}

/// "09:00","17:00" -> "9:00 AM - 5:00 PM"
String formatRange(String start, String end) =>
    '${formatClock(start)} - ${formatClock(end)}';
