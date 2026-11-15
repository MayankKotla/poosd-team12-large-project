import '../models/user.dart';
import 'api_client.dart';
import 'config.dart';
import 'global_data.dart';

/// Login / sign-up / logout.
///
/// Matches backend/routes/auth.js:
///   POST /auth/register         {firstName,lastName,email,password}  -> {message}
///   POST /auth/login            {email,password} -> {token, user:{id,firstName,lastName,email}}
///                               403 + {error} if the email is not verified yet
///   POST /auth/forgot-password  {email}          -> {message}
class AuthService {
  static Future<void> login(String email, String password) async {
    if (Config.useMockData) {
      await Future<void>.delayed(const Duration(milliseconds: 500));
      if (!email.contains('@') || password.isEmpty) {
        throw const ApiException('Incorrect email or password.');
      }
      GlobalData.token = 'mock-token';
      GlobalData.user = User(
        id: 'u1',
        firstName: 'Alex',
        lastName: 'Morgan',
        email: email,
      );
      return;
    }

    final res = await ApiClient.post('/auth/login', {
      'email': email,
      'password': password,
    });
    if (res is! Map<String, dynamic>) {
      throw const ApiException('Unexpected response from the server.');
    }
    final token = res['token'];
    final userJson = res['user'];
    if (token is! String || userJson is! Map<String, dynamic>) {
      throw const ApiException('Unexpected response from the server.');
    }
    GlobalData.token = token;
    GlobalData.user = User.fromJson(userJson);
  }

  /// Returns the message to show the user (e.g. "check your email").
  static Future<String> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
  }) async {
    if (Config.useMockData) {
      await Future<void>.delayed(const Duration(milliseconds: 500));
      return 'Account created! Check your email to verify it, then log in.';
    }

    final res = await ApiClient.post('/auth/register', {
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'password': password,
    });
    return (res is Map ? res['message']?.toString() : null) ??
        'Account created! Check your email to verify it, then log in.';
  }

  static Future<String> forgotPassword(String email) async {
    if (Config.useMockData) {
      await Future<void>.delayed(const Duration(milliseconds: 400));
      return 'If that email has an account, a reset link is on its way.';
    }
    final res = await ApiClient.post('/auth/forgot-password', {'email': email});
    return (res is Map ? res['message']?.toString() : null) ??
        'If that email has an account, a reset link is on its way.';
  }

  static void logout() {
    GlobalData.clear();
  }
}
