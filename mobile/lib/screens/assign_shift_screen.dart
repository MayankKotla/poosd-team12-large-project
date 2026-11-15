import 'package:flutter/material.dart';

import '../models/group.dart';
import '../models/shift.dart';
import '../routes/routes.dart';
import '../utils/api_client.dart';
import '../utils/formatters.dart';
import '../utils/shift_service.dart';

/// Admin form: pick a member, a weekday and start / end times.
/// Pops with a confirmation message when the shift was created.
class AssignShiftScreen extends StatefulWidget {
  final Group group;
  final List<GroupMemberInfo> members;

  const AssignShiftScreen({
    super.key,
    required this.group,
    required this.members,
  });

  @override
  State<AssignShiftScreen> createState() => _AssignShiftScreenState();
}

class _AssignShiftScreenState extends State<AssignShiftScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController(text: 'Shift');

  String? _userId;
  String _day = weekdayNames.first;
  TimeOfDay _start = const TimeOfDay(hour: 9, minute: 0);
  TimeOfDay _end = const TimeOfDay(hour: 17, minute: 0);
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _titleController.dispose();
    super.dispose();
  }

  /// The backend stores times as "HH:mm".
  String _hhmm(TimeOfDay t) =>
      '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';

  Future<void> _pickTime({required bool start}) async {
    final picked = await showTimePicker(
      context: context,
      initialTime: start ? _start : _end,
    );
    if (picked == null || !mounted) return;
    setState(() {
      if (start) {
        _start = picked;
      } else {
        _end = picked;
      }
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_hhmm(_start) == _hhmm(_end)) {
      setState(() => _error = 'Start and end time must be different.');
      return;
    }

    setState(() {
      _saving = true;
      _error = null;
    });

    final member = widget.members.firstWhere((m) => m.userId == _userId);
    final title = _titleController.text.trim();

    try {
      await ShiftService.assignShift(
        groupId: widget.group.id,
        userId: member.userId,
        dayOfWeek: _day,
        startTime: _hhmm(_start),
        endTime: _hhmm(_end),
        title: title.isEmpty ? 'Shift' : title,
      );
      if (!mounted) return;
      Navigator.of(context).pop(
        'Shift assigned to ${member.name}: $_day, '
        '${formatRange(_hhmm(_start), _hhmm(_end))}.',
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      if (e.isUnauthorized) {
        Routes.goToLogin(context);
        return;
      }
      setState(() {
        _error = e.message;
        _saving = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Assign Shift')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  widget.group.name,
                  style: theme.textTheme.titleMedium
                      ?.copyWith(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  initialValue: _userId,
                  isExpanded: true,
                  decoration: const InputDecoration(
                    labelText: 'Member',
                    border: OutlineInputBorder(),
                  ),
                  items: [
                    for (final m in widget.members)
                      DropdownMenuItem(value: m.userId, child: Text(m.name)),
                  ],
                  onChanged: (value) => setState(() => _userId = value),
                  validator: (value) =>
                      value == null ? 'Choose who works this shift' : null,
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  initialValue: _day,
                  decoration: const InputDecoration(
                    labelText: 'Day of week',
                    border: OutlineInputBorder(),
                  ),
                  items: [
                    for (final d in weekdayNames)
                      DropdownMenuItem(value: d, child: Text(d)),
                  ],
                  onChanged: (value) => setState(() => _day = value ?? _day),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _pickTime(start: true),
                        icon: const Icon(Icons.schedule),
                        label: Text('Start: ${formatClock(_hhmm(_start))}'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _pickTime(start: false),
                        icon: const Icon(Icons.schedule),
                        label: Text('End: ${formatClock(_hhmm(_end))}'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _titleController,
                  textCapitalization: TextCapitalization.sentences,
                  decoration: const InputDecoration(
                    labelText: 'Title (optional)',
                    hintText: 'e.g. Opening shift',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                if (_error != null) ...[
                  Text(
                    _error!,
                    textAlign: TextAlign.center,
                    style: TextStyle(color: theme.colorScheme.error),
                  ),
                  const SizedBox(height: 12),
                ],
                FilledButton(
                  onPressed: _saving ? null : _submit,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: _saving
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Assign Shift'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
