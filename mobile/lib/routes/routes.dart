import 'package:flutter/material.dart';

import '../screens/groups_screen.dart';
import '../screens/login_screen.dart';
import '../screens/open_shifts_screen.dart';
import '../screens/settings_screen.dart';
import '../screens/shifts_view_screen.dart';
import '../screens/signup_screen.dart';

/// Navigation map. Mirrors the flow chart:
///
///   Login <-> Sign-up
///   Login  -> Shifts View
///   Shifts View <-> Open Shifts <-> Settings <-> Shifts View
///   Settings <-> My Groups
///   Settings -> (log out) -> Login
class Routes {
  static const String login = '/login';
  static const String signup = '/signup';
  static const String shifts = '/shifts';
  static const String openShifts = '/open-shifts';
  static const String settings = '/settings';
  static const String groups = '/groups';

  /// Order matches the bottom navigation bar (see MainScaffold).
  static const List<String> mainTabs = [shifts, openShifts, settings];

  static Map<String, WidgetBuilder> get getRoutes => {
        '/': (context) => const LoginScreen(),
        login: (context) => const LoginScreen(),
        signup: (context) => const SignUpScreen(),
        shifts: (context) => const ShiftsViewScreen(),
        openShifts: (context) => const OpenShiftsScreen(),
        settings: (context) => const SettingsScreen(),
        groups: (context) => const GroupsScreen(),
      };

  /// Clears the navigation stack and returns to the login screen
  /// (used for log out and expired sessions).
  static void goToLogin(BuildContext context) {
    Navigator.of(context).pushNamedAndRemoveUntil(login, (route) => false);
  }
}
