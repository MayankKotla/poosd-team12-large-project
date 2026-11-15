import 'package:flutter/material.dart';

import '../models/group.dart';
import '../models/user.dart';
import '../routes/routes.dart';
import '../utils/api_client.dart';
import '../utils/global_data.dart';
import '../utils/group_service.dart';
import 'assign_shift_screen.dart';

/// One group: its members, plus admin actions (Add Member, Assign Shift).
/// Opened by tapping a card on My Groups.
class GroupDetailsScreen extends StatefulWidget {
  final Group group;

  const GroupDetailsScreen({super.key, required this.group});

  @override
  State<GroupDetailsScreen> createState() => _GroupDetailsScreenState();
}

class _GroupDetailsScreenState extends State<GroupDetailsScreen> {
  late Group _group;
  Map<String, User> _directory = {};
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _group = widget.group;
    _load();
  }

  Future<void> _load({bool showSpinner = true}) async {
    if (showSpinner) setState(() => _loading = true);
    try {
      final groups = await GroupService.getMyGroups();
      var directory = <String, User>{};
      try {
        directory = await GroupService.getUserDirectory();
      } on ApiException catch (e) {
        // Names are a nice-to-have; only an expired login is fatal.
        if (e.isUnauthorized) rethrow;
      }
      if (!mounted) return;
      final matches = groups.where((g) => g.id == _group.id);
      setState(() {
        if (matches.isNotEmpty) _group = matches.first;
        _directory = directory;
        _error = null;
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      if (e.isUnauthorized) {
        Routes.goToLogin(context);
        return;
      }
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  List<GroupMemberInfo> get _members {
    final list = _group.members.map((m) {
      final user = _directory[m.userId];
      final name = user?.fullName ?? '';
      return GroupMemberInfo(
        userId: m.userId,
        name: name.isEmpty ? 'Unknown user' : name,
        email: user?.email ?? '',
        isAdmin: m.isAdmin,
      );
    }).toList();
    list.sort((a, b) {
      if (a.isAdmin != b.isAdmin) return a.isAdmin ? -1 : 1;
      return a.name.toLowerCase().compareTo(b.name.toLowerCase());
    });
    return list;
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _addMember() async {
    final result = await showDialog<_NewMember>(
      context: context,
      builder: (context) => const _AddMemberDialog(),
    );
    if (result == null || !mounted) return;

    try {
      await GroupService.addMember(_group.id, result.email, admin: result.admin);
      if (!mounted) return;
      _showMessage('${result.email} added to ${_group.name}.');
      await _load(showSpinner: false);
    } on ApiException catch (e) {
      if (!mounted) return;
      if (e.isUnauthorized) {
        Routes.goToLogin(context);
        return;
      }
      _showMessage(e.message);
    }
  }

  Future<void> _assignShift() async {
    final message = await Navigator.of(context).push<String>(
      MaterialPageRoute(
        builder: (context) =>
            AssignShiftScreen(group: _group, members: _members),
      ),
    );
    if (message != null && mounted) _showMessage(message);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_group.name)),
      body: SafeArea(child: _buildBody()),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(_error!, textAlign: TextAlign.center),
              const SizedBox(height: 12),
              FilledButton(onPressed: _load, child: const Text('Retry')),
            ],
          ),
        ),
      );
    }

    final theme = Theme.of(context);
    final members = _members;
    final myId = GlobalData.user?.id;

    return RefreshIndicator(
      onRefresh: () => _load(showSpinner: false),
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          if (_group.isAdmin) ...[
            Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    onPressed: _addMember,
                    icon: const Icon(Icons.person_add),
                    label: const Text('Add Member'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: FilledButton.tonalIcon(
                    onPressed: _assignShift,
                    icon: const Icon(Icons.event_available),
                    label: const Text('Assign Shift'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
          ],
          Text(
            'Members (${members.length})',
            style: theme.textTheme.titleMedium
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          for (final m in members)
            Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: CircleAvatar(
                  child: Text(m.name.isNotEmpty ? m.name[0].toUpperCase() : '?'),
                ),
                title: Text(m.userId == myId ? '${m.name} (you)' : m.name),
                subtitle: m.email.isEmpty ? null : Text(m.email),
                trailing: Chip(
                  label: Text(m.isAdmin ? 'Admin' : 'Member'),
                  backgroundColor:
                      m.isAdmin ? Colors.blue.shade100 : Colors.grey.shade200,
                  side: BorderSide.none,
                  visualDensity: VisualDensity.compact,
                ),
              ),
            ),
          if (!_group.isAdmin)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                'Only group admins can add members or assign shifts.',
                style: theme.textTheme.bodySmall,
              ),
            ),
        ],
      ),
    );
  }
}

class _NewMember {
  final String email;
  final bool admin;

  const _NewMember(this.email, this.admin);
}

/// Asks for the new member's email (they must already have an account).
class _AddMemberDialog extends StatefulWidget {
  const _AddMemberDialog();

  @override
  State<_AddMemberDialog> createState() => _AddMemberDialogState();
}

class _AddMemberDialogState extends State<_AddMemberDialog> {
  final _formKey = GlobalKey<FormState>();
  final _controller = TextEditingController();
  bool _admin = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    Navigator.of(context).pop(_NewMember(_controller.text.trim(), _admin));
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Member'),
      content: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextFormField(
              controller: _controller,
              autofocus: true,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: 'Email address',
                helperText: 'They need a ShiftFlow account first.',
                border: OutlineInputBorder(),
              ),
              validator: (value) => (value == null || !value.trim().contains('@'))
                  ? 'Enter a valid email'
                  : null,
            ),
            const SizedBox(height: 8),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Make admin'),
              value: _admin,
              onChanged: (value) => setState(() => _admin = value),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        FilledButton(onPressed: _submit, child: const Text('Add')),
      ],
    );
  }
}
