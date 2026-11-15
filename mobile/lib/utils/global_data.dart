import '../models/user.dart';

/// Session data shared across screens (same idea as GlobalData in the class guide,
/// but we keep the JWT and a User object instead of the plain-text password).
class GlobalData {
  static String? token;
  static User? user;

  static bool get isLoggedIn => token != null && user != null;

  static void clear() {
    token = null;
    user = null;
  }
}
