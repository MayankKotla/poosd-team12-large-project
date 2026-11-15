import '../models/group.dart';
import '../models/user.dart';
import 'api_client.dart';
import 'config.dart';
import 'global_data.dart';

/// Group operations. Matches backend/routes/groups.js (JWT required):
///   GET  /groups               -> [Group]   groups I belong to
///   POST /groups               {groupName} -> Group   (I become its admin)
///   POST /groups/:id/members   {email, role} -> {message}   admin only
///   GET  /users                -> [User]    used to turn member ids into names
class GroupService {
  // ---- mock state (only used when Config.useMockData is true) -------------
  static final Map<String, User> _mockDirectory = {
    'u1': const User(id: 'u1', firstName: 'Alex', lastName: 'Morgan', email: 'alex@example.com'),
    'u2': const User(id: 'u2', firstName: 'Jordan', lastName: 'Smith', email: 'jordan@example.com'),
    'u3': const User(id: 'u3', firstName: 'Taylor', lastName: 'Johnson', email: 'taylor@example.com'),
    'u4': const User(id: 'u4', firstName: 'Sam', lastName: 'Rivera', email: 'sam@example.com'),
  };

  static final List<Group> _mockGroups = [
    const Group(
      id: 'g1',
      name: 'Demo Cafe',
      myRole: GroupRole.admin,
      members: [
        GroupMember(userId: 'u1', isAdmin: true),
        GroupMember(userId: 'u2', isAdmin: false),
        GroupMember(userId: 'u3', isAdmin: false),
      ],
    ),
  ];

  static Future<void> _fakeDelay() =>
      Future<void>.delayed(const Duration(milliseconds: 400));

  // ---- public API ---------------------------------------------------------

  static Future<List<Group>> getMyGroups() async {
    if (Config.useMockData) {
      await _fakeDelay();
      return List<Group>.of(_mockGroups);
    }
    final res = await ApiClient.get('/groups');
    if (res is! List) return [];
    final myId = GlobalData.user?.id;
    return res
        .whereType<Map<String, dynamic>>()
        .map((json) => Group.fromJson(json, myId))
        .toList();
  }

  static Future<Group> createGroup(String groupName) async {
    if (Config.useMockData) {
      await _fakeDelay();
      final group = Group(
        id: 'g${_mockGroups.length + 1}',
        name: groupName,
        myRole: GroupRole.admin,
        members: [GroupMember(userId: GlobalData.user?.id ?? 'u1', isAdmin: true)],
      );
      _mockGroups.add(group);
      return group;
    }
    final res = await ApiClient.post('/groups', {'groupName': groupName});
    if (res is! Map<String, dynamic>) {
      throw const ApiException('Unexpected response from the server.');
    }
    return Group.fromJson(res, GlobalData.user?.id);
  }

  /// id -> user, for showing member names and emails.
  static Future<Map<String, User>> getUserDirectory() async {
    if (Config.useMockData) {
      await _fakeDelay();
      return Map<String, User>.of(_mockDirectory);
    }
    final res = await ApiClient.get('/users');
    final directory = <String, User>{};
    if (res is List) {
      for (final json in res.whereType<Map<String, dynamic>>()) {
        final user = User.fromJson(json);
        if (user.id.isNotEmpty) directory[user.id] = user;
      }
    }
    return directory;
  }

  /// Admin adds an existing user (by email) to a group.
  static Future<void> addMember(
    String groupId,
    String email, {
    bool admin = false,
  }) async {
    if (Config.useMockData) {
      await _fakeDelay();
      final target = _mockDirectory.values.where(
        (u) => u.email.toLowerCase() == email.toLowerCase(),
      );
      if (target.isEmpty) {
        throw const ApiException('No user with that email', statusCode: 404);
      }
      final index = _mockGroups.indexWhere((g) => g.id == groupId);
      final group = _mockGroups[index];
      final userId = target.first.id;
      if (group.members.any((m) => m.userId == userId)) {
        throw const ApiException(
          'Not an admin of this group, or user already a member',
          statusCode: 409,
        );
      }
      _mockGroups[index] = Group(
        id: group.id,
        name: group.name,
        myRole: group.myRole,
        members: [...group.members, GroupMember(userId: userId, isAdmin: admin)],
      );
      return;
    }
    await ApiClient.post('/groups/$groupId/members', {
      'email': email,
      'role': admin ? 'admin' : 'member',
    });
  }
}
