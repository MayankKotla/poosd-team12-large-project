import 'package:flutter_test/flutter_test.dart';
import 'package:shiftflow_mobile/models/group.dart';
import 'package:shiftflow_mobile/models/shift.dart';
import 'package:shiftflow_mobile/models/user.dart';
import 'package:shiftflow_mobile/utils/formatters.dart';

void main() {
  group('Shift.fromJson', () {
    test('parses /shifts/mine (group populated, user is an id)', () {
      final shift = Shift.fromJson({
        '_id': 'abc123',
        'group': {'_id': 'g1', 'groupName': 'Demo Cafe'},
        'user': 'u1',
        'dayOfWeek': 'Wednesday',
        'startTime': '09:00',
        'endTime': '17:00',
        'title': 'Shift',
        'status': 'assigned',
      });

      expect(shift.id, 'abc123');
      expect(shift.userId, 'u1');
      expect(shift.groupId, 'g1');
      expect(shift.groupName, 'Demo Cafe');
      expect(shift.dayIndex, 2);
      expect(shift.status, ShiftStatus.scheduled);
    });

    test('parses an up_for_grabs shift with a populated user', () {
      final shift = Shift.fromJson({
        '_id': 's2',
        'group': 'g1',
        'user': {'_id': 'u9', 'firstName': 'Jordan', 'lastName': 'Smith'},
        'dayOfWeek': 'Friday',
        'startTime': '12:00',
        'endTime': '20:00',
        'status': 'up_for_grabs',
      });

      expect(shift.status, ShiftStatus.offered);
      expect(shift.userId, 'u9');
      expect(shift.ownerName, 'Jordan Smith');
      expect(shift.groupId, 'g1');
      expect(shift.title, 'Shift');
    });
  });

  group('Group.fromJson', () {
    final json = {
      '_id': 'g1',
      'groupName': 'Demo Cafe',
      'owner': 'u1',
      'members': [
        {'user': 'u1', 'role': 'admin'},
        {'user': 'u2', 'role': 'member'},
      ],
    };

    test('finds my role as admin', () {
      final g = Group.fromJson(json, 'u1');
      expect(g.name, 'Demo Cafe');
      expect(g.memberCount, 2);
      expect(g.isAdmin, isTrue);
    });

    test('keeps each member id and role', () {
      final g = Group.fromJson(json, 'u1');
      expect(g.members.map((m) => m.userId), ['u1', 'u2']);
      expect(g.members.map((m) => m.isAdmin), [true, false]);
    });

    test('finds my role as member', () {
      expect(Group.fromJson(json, 'u2').isAdmin, isFalse);
    });
  });

  group('User', () {
    test('fullName and initials', () {
      const user = User(
        id: '1',
        firstName: 'Alex',
        lastName: 'Morgan',
        email: 'alex@example.com',
      );
      expect(user.fullName, 'Alex Morgan');
      expect(user.initials, 'AM');
    });
  });

  group('formatters', () {
    test('formatClock', () {
      expect(formatClock('00:05'), '12:05 AM');
      expect(formatClock('09:00'), '9:00 AM');
      expect(formatClock('17:30'), '5:30 PM');
    });

    test('formatRange', () {
      expect(formatRange('09:00', '17:00'), '9:00 AM - 5:00 PM');
    });
  });
}
