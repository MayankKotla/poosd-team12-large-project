enum GroupRole { admin, member }

/// A member as the backend stores it: just the user's id and role.
class GroupMember {
  final String userId;
  final bool isAdmin;

  const GroupMember({required this.userId, required this.isAdmin});
}

/// A member with a name and email filled in (looked up from GET /users),
/// ready to show in lists and pickers.
class GroupMemberInfo {
  final String userId;
  final String name;
  final String email;
  final bool isAdmin;

  const GroupMemberInfo({
    required this.userId,
    required this.name,
    required this.email,
    required this.isAdmin,
  });
}

class Group {
  final String id;
  final String name;
  final List<GroupMember> members;
  final GroupRole myRole;

  const Group({
    required this.id,
    required this.name,
    required this.members,
    required this.myRole,
  });

  int get memberCount => members.length;

  bool get isAdmin => myRole == GroupRole.admin;

  /// Backend shape (models/Group.js):
  /// { _id, groupName, owner, members: [ { user: "id", role: "admin" | "member" } ] }
  /// [myUserId] is used to find the logged-in user's role in `members`.
  factory Group.fromJson(Map<String, dynamic> json, String? myUserId) {
    final raw = json['members'] is List ? json['members'] as List : const [];
    final members = <GroupMember>[];
    var myRole = GroupRole.member;

    for (final m in raw.whereType<Map>()) {
      final user = m['user'];
      final id =
          (user is Map ? (user['_id'] ?? user['id']) : user)?.toString() ?? '';
      final admin = m['role'] == 'admin';
      members.add(GroupMember(userId: id, isAdmin: admin));
      if (id == myUserId && admin) myRole = GroupRole.admin;
    }

    return Group(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: (json['groupName'] ?? 'Unnamed group').toString(),
      members: members,
      myRole: myRole,
    );
  }
}
