import '../models/shift.dart';
import 'api_client.dart';
import 'config.dart';
import 'global_data.dart';

/// Shift operations. Matches backend/routes/shifts.js (all need the JWT):
///   GET  /shifts/mine          -> [Schedule]  (group populated with groupName)
///   GET  /shifts/open          -> [Schedule]  (up_for_grabs in my groups; user is just an id)
///   POST /shifts/:id/release   -> {message}   put my shift up for grabs
///   POST /shifts/:id/claim     -> Schedule    claim someone's offered shift
///   POST /shifts               -> Schedule    admin assigns a shift to a group member
///
/// NOT in the backend yet (needs a teammate to add, see README):
///   POST /shifts/:id/unrelease -> take my offered shift back
class ShiftService {
  // ---- mock state (only used when Config.useMockData is true) -------------
  static final List<Shift> _mockMine = [
    const Shift(id: 'm1', userId: 'u1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00', groupName: 'Demo Cafe'),
    const Shift(id: 'm2', userId: 'u1', dayOfWeek: 'Wednesday', startTime: '10:00', endTime: '18:00', groupName: 'Demo Cafe'),
    const Shift(id: 'm3', userId: 'u1', dayOfWeek: 'Friday', startTime: '08:00', endTime: '16:00', groupName: 'Demo Cafe'),
  ];

  static final List<Shift> _mockOpen = [
    const Shift(id: 'o1', userId: 'u2', ownerName: 'Jordan Smith', dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '17:00', groupName: 'Demo Cafe', status: ShiftStatus.offered),
    const Shift(id: 'o2', userId: 'u3', ownerName: 'Taylor Johnson', dayOfWeek: 'Thursday', startTime: '12:00', endTime: '20:00', groupName: 'Demo Cafe', status: ShiftStatus.offered),
    const Shift(id: 'o3', userId: 'u4', ownerName: 'Sam Rivera', dayOfWeek: 'Saturday', startTime: '08:00', endTime: '16:00', groupName: 'Demo Cafe', status: ShiftStatus.offered),
  ];

  static Future<void> _fakeDelay() =>
      Future<void>.delayed(const Duration(milliseconds: 400));

  static List<Shift> _parseList(dynamic raw) {
    if (raw is! List) return [];
    return raw.whereType<Map<String, dynamic>>().map(Shift.fromJson).toList();
  }

  static void _sort(List<Shift> shifts) {
    shifts.sort((a, b) {
      final byDay = a.dayIndex.compareTo(b.dayIndex);
      return byDay != 0 ? byDay : a.startTime.compareTo(b.startTime);
    });
  }

  /// Optional lookups used to show names; a failure here must not break the screen
  /// (except an expired login, which should send the user back to Login).
  static Future<dynamic> _optionalGet(String path) async {
    try {
      return await ApiClient.get(path);
    } on ApiException catch (e) {
      if (e.isUnauthorized) rethrow;
      return null;
    }
  }

  // ---- public API ---------------------------------------------------------

  static Future<List<Shift>> getMyShifts() async {
    if (Config.useMockData) {
      await _fakeDelay();
      final list = List<Shift>.of(_mockMine);
      _sort(list);
      return list;
    }
    final shifts = _parseList(await ApiClient.get('/shifts/mine'));
    _sort(shifts);
    return shifts;
  }

  static Future<List<Shift>> getOpenShifts() async {
    if (Config.useMockData) {
      await _fakeDelay();
      final list = List<Shift>.of(_mockOpen);
      _sort(list);
      return list;
    }

    final myId = GlobalData.user?.id;
    // /shifts/open also returns my own offered shifts; hide those.
    final shifts = _parseList(await ApiClient.get('/shifts/open'))
        .where((s) => s.userId != myId)
        .toList();

    // The open list only has ids, so look up names (best effort).
    final users = await _optionalGet('/users');
    final groups = await _optionalGet('/groups');
    final userNames = <String, String>{};
    if (users is List) {
      for (final u in users.whereType<Map>()) {
        userNames[(u['_id'] ?? '').toString()] =
            '${u['firstName'] ?? ''} ${u['lastName'] ?? ''}'.trim();
      }
    }
    final groupNames = <String, String>{};
    if (groups is List) {
      for (final g in groups.whereType<Map>()) {
        groupNames[(g['_id'] ?? '').toString()] =
            (g['groupName'] ?? '').toString();
      }
    }

    final result = shifts
        .map((s) => s.copyWith(
              ownerName: userNames[s.userId],
              groupName: groupNames[s.groupId],
            ))
        .toList();
    _sort(result);
    return result;
  }

  static Future<void> offerShift(String shiftId) async {
    if (Config.useMockData) {
      await _fakeDelay();
      _setMockStatus(shiftId, ShiftStatus.offered);
      return;
    }
    await ApiClient.post('/shifts/$shiftId/release');
  }

  static Future<void> cancelOffer(String shiftId) async {
    if (Config.useMockData) {
      await _fakeDelay();
      _setMockStatus(shiftId, ShiftStatus.scheduled);
      return;
    }
    await ApiClient.post('/shifts/$shiftId/unrelease');
  }

  static Future<void> claimShift(String shiftId) async {
    if (Config.useMockData) {
      await _fakeDelay();
      final index = _mockOpen.indexWhere((s) => s.id == shiftId);
      if (index == -1) {
        throw const ApiException('Shift no longer available');
      }
      final claimed = _mockOpen.removeAt(index);
      _mockMine.add(Shift(
        id: claimed.id,
        userId: 'u1',
        dayOfWeek: claimed.dayOfWeek,
        startTime: claimed.startTime,
        endTime: claimed.endTime,
        groupName: claimed.groupName,
      ));
      return;
    }
    await ApiClient.post('/shifts/$shiftId/claim');
  }

  /// Admin only. Times are "HH:mm"; dayOfWeek is "Monday".."Sunday".
  static Future<void> assignShift({
    required String groupId,
    required String userId,
    required String dayOfWeek,
    required String startTime,
    required String endTime,
    required String title,
  }) async {
    if (Config.useMockData) {
      await _fakeDelay();
      // Only shifts for the logged-in mock user show up in "My Shifts".
      if (userId == (GlobalData.user?.id ?? 'u1')) {
        _mockMine.add(Shift(
          id: 'm${_mockMine.length + 1}',
          userId: userId,
          dayOfWeek: dayOfWeek,
          startTime: startTime,
          endTime: endTime,
          title: title,
          groupName: 'Demo Cafe',
        ));
      }
      return;
    }
    await ApiClient.post('/shifts', {
      'groupId': groupId,
      'userId': userId,
      'dayOfWeek': dayOfWeek,
      'startTime': startTime,
      'endTime': endTime,
      'title': title,
    });
  }

  static void _setMockStatus(String shiftId, ShiftStatus status) {
    final index = _mockMine.indexWhere((s) => s.id == shiftId);
    if (index != -1) {
      _mockMine[index] = _mockMine[index].copyWith(status: status);
    }
  }
}
