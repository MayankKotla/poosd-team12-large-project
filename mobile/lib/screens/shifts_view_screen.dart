import 'package:flutter/material.dart';

import '../models/shift.dart';
import '../routes/routes.dart';
import '../utils/api_client.dart';
import '../utils/formatters.dart';
import '../utils/shift_service.dart';
import '../widgets/main_scaffold.dart';
import '../widgets/shift_card.dart';

/// "Shifts View" in the flow chart: the user's own shifts, as a list or a
/// weekly view. Each shift can be put up for grabs (offered).
///
/// The backend stores weekly repeating shifts (day of week + times), so the
/// "calendar" nice-to-have is a Monday-Sunday week view rather than a month.
class ShiftsViewScreen extends StatefulWidget {
  const ShiftsViewScreen({super.key});

  @override
  State<ShiftsViewScreen> createState() => _ShiftsViewScreenState();
}

class _ShiftsViewScreenState extends State<ShiftsViewScreen> {
  List<Shift> _shifts = [];
  bool _loading = true;
  String? _error;
  bool _weekView = false;
  String? _busyShiftId;

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _handleError(ApiException e) {
    if (e.isUnauthorized) {
      Routes.goToLogin(context);
      return;
    }
    setState(() {
      _error = e.message;
      _loading = false;
      _busyShiftId = null;
    });
  }

  Future<void> _load({bool showSpinner = true}) async {
    if (showSpinner) setState(() => _loading = true);
    try {
      final shifts = await ShiftService.getMyShifts();
      if (!mounted) return;
      setState(() {
        _shifts = shifts;
        _error = null;
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      _handleError(e);
    }
  }

  Future<void> _toggleOffer(Shift shift) async {
    setState(() => _busyShiftId = shift.id);
    try {
      if (shift.status == ShiftStatus.offered) {
        await ShiftService.cancelOffer(shift.id);
      } else {
        await ShiftService.offerShift(shift.id);
      }
      if (!mounted) return;
      await _load(showSpinner: false);
      if (!mounted) return;
      setState(() => _busyShiftId = null);
    } on ApiException catch (e) {
      if (!mounted) return;
      // Show the reason but keep the list on screen.
      if (e.isUnauthorized) {
        Routes.goToLogin(context);
        return;
      }
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.message)));
      setState(() => _busyShiftId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    return MainScaffold(
      currentIndex: 0,
      title: 'My Shifts',
      body: _buildBody(),
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

    return RefreshIndicator(
      onRefresh: () => _load(showSpinner: false),
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          SegmentedButton<bool>(
            segments: const [
              ButtonSegment(
                value: false,
                label: Text('List'),
                icon: Icon(Icons.view_list),
              ),
              ButtonSegment(
                value: true,
                label: Text('Week'),
                icon: Icon(Icons.calendar_view_week),
              ),
            ],
            selected: {_weekView},
            onSelectionChanged: (selection) =>
                setState(() => _weekView = selection.first),
          ),
          const SizedBox(height: 16),
          if (_shifts.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 48),
              child: Text(
                'No shifts assigned yet.\nAsk your group admin to add you.',
                textAlign: TextAlign.center,
              ),
            )
          else if (_weekView)
            _buildWeek()
          else
            for (final shift in _shifts)
              ShiftCard(
                shift: shift,
                actionLabel: shift.status == ShiftStatus.offered
                    ? 'Cancel Offer'
                    : 'Offer Shift',
                busy: _busyShiftId == shift.id,
                onAction: _busyShiftId == null ? () => _toggleOffer(shift) : null,
              ),
        ],
      ),
    );
  }

  /// Monday..Sunday rows with that day's shifts; today is highlighted.
  Widget _buildWeek() {
    final theme = Theme.of(context);
    final todayIndex = DateTime.now().weekday - 1;

    return Column(
      children: [
        for (var i = 0; i < weekdayNames.length; i++)
          _weekRow(theme, i, i == todayIndex),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _legendDot(theme.colorScheme.primaryContainer, 'Scheduled'),
            const SizedBox(width: 16),
            _legendDot(Colors.amber.shade100, 'Offered'),
          ],
        ),
      ],
    );
  }

  Widget _weekRow(ThemeData theme, int dayIndex, bool isToday) {
    final dayShifts = _shifts.where((s) => s.dayIndex == dayIndex).toList();

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: isToday
          ? RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: theme.colorScheme.primary, width: 2),
            )
          : null,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 48,
              child: Text(
                weekdayNames[dayIndex].substring(0, 3),
                style: theme.textTheme.titleSmall
                    ?.copyWith(fontWeight: FontWeight.bold),
              ),
            ),
            Expanded(
              child: dayShifts.isEmpty
                  ? Text('Off', style: theme.textTheme.bodySmall)
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        for (final s in dayShifts)
                          Container(
                            margin: const EdgeInsets.only(bottom: 4),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: s.status == ShiftStatus.offered
                                  ? Colors.amber.shade100
                                  : theme.colorScheme.primaryContainer,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '${formatRange(s.startTime, s.endTime)}'
                              '${s.status == ShiftStatus.offered ? '  (offered)' : ''}',
                            ),
                          ),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _legendDot(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(3),
            border: Border.all(color: Colors.black26),
          ),
        ),
        const SizedBox(width: 6),
        Text(label, style: Theme.of(context).textTheme.bodySmall),
      ],
    );
  }
}
