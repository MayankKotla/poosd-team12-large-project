import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import 'config.dart';
import 'global_data.dart';

/// Error shown to the user. [statusCode] is null for network problems.
class ApiException implements Exception {
  final String message;
  final int? statusCode;

  const ApiException(this.message, {this.statusCode});

  bool get isUnauthorized => statusCode == 401;

  @override
  String toString() => message;
}

/// Thin wrapper around `http` that sends JSON and attaches the JWT.
/// Returns the decoded JSON (a Map or a List, depending on the endpoint).
class ApiClient {
  static Map<String, String> _headers() {
    final headers = <String, String>{
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    final token = GlobalData.token;
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  static Uri _uri(String path) => Uri.parse('${Config.baseUrl}$path');

  static Future<dynamic> get(String path) {
    return _send(() => http.get(_uri(path), headers: _headers()));
  }

  static Future<dynamic> post(String path, [Map<String, dynamic>? body]) {
    return _send(
      () => http.post(
        _uri(path),
        headers: _headers(),
        body: jsonEncode(body ?? <String, dynamic>{}),
      ),
    );
  }

  static Future<dynamic> _send(Future<http.Response> Function() request) async {
    http.Response response;
    try {
      response = await request().timeout(Config.requestTimeout);
    } on TimeoutException {
      throw const ApiException('The server took too long to respond.');
    } catch (_) {
      throw const ApiException(
        'Could not reach the server. Check your connection.',
      );
    }
    return _handle(response);
  }

  static dynamic _handle(http.Response response) {
    dynamic data;
    if (response.body.isNotEmpty) {
      try {
        data = jsonDecode(response.body);
      } on FormatException {
        // Non-JSON body (e.g. an HTML error page); fall through.
      }
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data ?? <String, dynamic>{};
    }

    String? message;
    if (data is Map) {
      message = (data['error'] ?? data['message'])?.toString();
    }
    throw ApiException(
      message ?? 'Request failed (${response.statusCode}).',
      statusCode: response.statusCode,
    );
  }
}
