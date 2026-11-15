import 'package:flutter/material.dart';

import '../models/shift.dart';
import '../routes/routes.dart';
import '../utils/api_client.dart';
import '../utils/formatters.dart';
import '../utils/shift_service.dart';
import '../widgets/main_scaffold.dart';
import '../widgets/shift_card.dart';

/// "Open Shifts" in the flow chart: shifts coworkers put up for grabs.
class OpenShiftsScreen extends StatefulWidget {
  const OpenShiftsScreen({super.key});

  @override
  State<OpenShiftsScreen> createState() => _OpenShiftsScreenState();
}

class _OpenShiftsScreenState extends State<OpenShiftsScreen> {
  List<Shift> _shifts = [];
  bool _loading = true;
  String? _error;
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
      final shifts = await ShiftService.getOpenShifts();
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

  Future<void> _claim(Shift shift) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Claim this shift?'),
        content: Text(
          '${shift.dayOfWeek}\n${formatRange(shift.startTime, shift.endTime)}',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Claim'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    setState(() => _busyShiftId = shift.id);
    try {
      await ShiftService.claimShift(shift.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${shift.dayOfWeek} shift claimed!')),
      );
      await _load(showSpinner: false);
      if (!mounted) return;
      setState(() => _busyShiftId = null);
    } on ApiException catch (e) {
      if (!mounted) return;
      // e.g. someone else claimed it first: show why, then refresh the list.
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.message)));
      if (e.isUnauthorized) {
        Routes.goToLogin(context);
        return;
      }
      await _load(showSpinner: false);
      if (!mounted) return;
      setState(() => _busyShiftId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    return MainScaffold(
      currentIndex: 1,
      title: 'Open Shifts',
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
          if (_shifts.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 64),
              child: Text(
                'No open shifts right now.\nPull down to refresh.',
                textAlign: TextAlign.center,
              ),
            )
          else
            for (final shift in _shifts)
              ShiftCard(
                shift: shift,
                showStatus: false,
                actionLabel: 'Claim Shift',
                busy: _busyShiftId == shift.id,
                onAction: _busyShiftId == null ? () => _claim(shift) : null,
              ),
        ],
      ),
    );
  }
}
