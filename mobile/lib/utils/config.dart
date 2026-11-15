/// App-wide settings.
///
/// Override at run time without editing code:
///   flutter run --dart-define=USE_MOCK=false \
///               --dart-define=API_BASE_URL=http://10.0.2.2:5000/api
class Config {
  /// true  = no network, uses fake data in the services (UI development).
  /// false = talks to the real backend at [baseUrl].
  static const bool useMockData =
      bool.fromEnvironment('USE_MOCK', defaultValue: true);

  /// 10.0.2.2 is how the Android emulator reaches your computer's localhost.
  /// iOS simulator can use http://localhost:5000/api.
  /// Replace with the deployed server URL once the team has one.
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:5000/api',
  );

  static const Duration requestTimeout = Duration(seconds: 15);
}
