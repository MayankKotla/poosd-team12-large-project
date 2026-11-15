import 'package:flutter/material.dart';

import '../models/shift.dart';
import '../utils/formatters.dart';

/// One shift as a card. Used by both My Shifts (Offer / Cancel Offer)
/// and Open Shifts (Claim).
class ShiftCard extends StatelessWidget {
  final Shift shift;
  final String actionLabel;
  final VoidCallback? onAction;
  final bool busy;
  final bool showStatus;

  const ShiftCard({
    super.key,
    required this.shift,
    required this.actionLabel,
    required this.onAction,
    this.busy = false,
    this.showStatus = true,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final offered = shift.status == ShiftStatus.offered;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        shift.dayOfWeek,
                        style: theme.textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 4),
                      Text(formatRange(shift.startTime, shift.endTime)),
                      if (shift.ownerName != null) ...[
                        const SizedBox(height: 8),
                        Text(
                          'Offered by: ${shift.ownerName}',
                          style: theme.textTheme.bodySmall,
                        ),
                      ],
                      if (shift.groupName != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          shift.groupName!,
                          style: theme.textTheme.bodySmall,
                        ),
                      ],
                    ],
                  ),
                ),
                if (showStatus)
                  Chip(
                    label: Text(offered ? 'Offered' : 'Scheduled'),
                    backgroundColor: offered
                        ? Colors.amber.shade100
                        : Colors.green.shade100,
                    side: BorderSide.none,
                    visualDensity: VisualDensity.compact,
                  ),
              ],
            ),
            const SizedBox(height: 12),
            Align(
              alignment: Alignment.centerRight,
              child: busy
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : (offered && showStatus
                      ? OutlinedButton(
                          onPressed: onAction,
                          child: Text(actionLabel),
                        )
                      : FilledButton(
                          onPressed: onAction,
                          child: Text(actionLabel),
                        )),
            ),
          ],
        ),
      ),
    );
  }
}
