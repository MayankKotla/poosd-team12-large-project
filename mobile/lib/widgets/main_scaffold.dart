import 'package:flutter/material.dart';

import '../routes/routes.dart';

/// Shared layout for the three main screens (Shifts View, Open Shifts, Settings).
/// The bottom bar gives the "everything connects to everything" navigation
/// from the flow chart.
class MainScaffold extends StatelessWidget {
  final int currentIndex;
  final String title;
  final Widget body;
  final List<Widget>? actions;

  const MainScaffold({
    super.key,
    required this.currentIndex,
    required this.title,
    required this.body,
    this.actions,
  });

  void _onTap(BuildContext context, int index) {
    if (index == currentIndex) return;
    Navigator.of(context).pushReplacementNamed(Routes.mainTabs[index]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        automaticallyImplyLeading: false,
        actions: actions,
      ),
      body: SafeArea(child: body),
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: (index) => _onTap(context, index),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.calendar_month_outlined),
            selectedIcon: Icon(Icons.calendar_month),
            label: 'My Shifts',
          ),
          NavigationDestination(
            icon: Icon(Icons.swap_horiz_outlined),
            selectedIcon: Icon(Icons.swap_horiz),
            label: 'Open Shifts',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings),
            label: 'Settings',
          ),
        ],
      ),
    );
  }
}
