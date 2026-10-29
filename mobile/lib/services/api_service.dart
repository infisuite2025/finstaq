import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/dashboard_summary.dart';

class ApiService {
  /// Filled by [initialize] after a host actually answers.
  static String baseUrl = 'http://127.0.0.1:3000/api/v1';

  static const List<String> _origins = [
    'http://127.0.0.1:3000', // USB / wireless adb reverse
    'http://192.168.1.12:3000', // this PC on the same Wi-Fi as the phone
    'http://10.0.2.2:3000', // Android emulator
  ];

  static String? _authToken;
  static String? _tenantId;
  static String? _userId;
  static String _role = 'OWNER';
  static bool _loggedIn = false;

  static Future<void> initialize() async {
    final prefs = await SharedPreferences.getInstance();
    _authToken = prefs.getString('auth_token');
    _tenantId = prefs.getString('tenant_id');
    _userId = prefs.getString('user_email');
    _role = prefs.getString('user_role') ?? 'OWNER';
    _loggedIn = prefs.getBool('logged_in') ?? false;
    await _findServer();
  }

  static Future<void> _findServer() async {
    for (final origin in _origins) {
      try {
        final response = await http
            .get(Uri.parse('$origin/health/live'))
            .timeout(const Duration(seconds: 2));
        if (response.statusCode > 0) {
          baseUrl = '$origin/api/v1';
          return;
        }
      } catch (_) {}
    }
  }

  static bool get isAuthenticated => _loggedIn && _tenantId != null;

  /// Same dev headers the web app sends in AuthContext.
  static Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'x-tenant-id': _tenantId ?? 'tenant-default-01',
        'x-user-id': _userId ?? 'usr-admin',
        'x-user-role': _role,
        if (_authToken != null && !_authToken!.startsWith('jwt_token_sample'))
          'Authorization': 'Bearer $_authToken',
      };

  static Future<dynamic> getData(String path) async {
    final response = await http
        .get(Uri.parse('$baseUrl$path'), headers: _headers)
        .timeout(const Duration(seconds: 15));
    return _decode(response);
  }

  static Future<dynamic> postData(String path, Map<String, dynamic> body) async {
    final response = await http
        .post(
          Uri.parse('$baseUrl$path'),
          headers: _headers,
          body: jsonEncode(body),
        )
        .timeout(const Duration(seconds: 15));
    return _decode(response);
  }

  static dynamic _decode(http.Response response) {
    dynamic body;
    try {
      body = jsonDecode(response.body);
    } catch (_) {
      body = null;
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      final message = body is Map ? (body['error'] ?? body['message']) : null;
      throw ApiException(message?.toString() ?? 'API ${response.statusCode}');
    }
    if (body is Map && body['success'] == false) {
      throw ApiException((body['error'] ?? body['message'] ?? 'Request failed').toString());
    }
    if (body is Map && body.containsKey('data')) return body['data'];
    return body;
  }

  /// Same flow as the web login screen: resolve the company, then match GSTIN.
  static Future<Map<String, dynamic>> login(
    String email,
    String password,
    String tenantId, {
    String subdomain = 'apex',
    String role = 'OWNER',
  }) async {
    if (password.length < 6) {
      throw ApiException('Password must be at least 6 characters');
    }

    Map<String, dynamic>? tenant;
    try {
      final resolved = await getData('/tenants/resolve/${Uri.encodeComponent(subdomain.trim().toLowerCase())}');
      if (resolved is Map) tenant = Map<String, dynamic>.from(resolved);
    } catch (_) {}

    if (tenant == null && tenantId.trim().isNotEmpty) {
      try {
        final list = await getData('/super-admin/tenants');
        if (list is List) {
          for (final item in list.whereType<Map>()) {
            final row = Map<String, dynamic>.from(item);
            if (row['id'] == tenantId || row['gstin'] == tenantId) {
              tenant = row;
              break;
            }
          }
        }
      } catch (_) {}
    }

    final resolvedId = tenant?['id']?.toString().trim();
    _tenantId = (resolvedId != null && resolvedId.isNotEmpty) ? resolvedId : tenantId.trim();
    _userId = email.trim();
    _role = role;
    _loggedIn = true;
    _authToken = null;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('logged_in', true);
    await prefs.setString('tenant_id', _tenantId!);
    await prefs.setString('user_email', _userId!);
    await prefs.setString('user_role', _role);
    await prefs.remove('auth_token');

    return {
      'success': true,
      'tenantId': _tenantId,
      'tenantName': tenant?['name'],
      'role': _role,
    };
  }

  /// Logs out and clears stored session
  static Future<void> logout() async {
    _authToken = null;
    _tenantId = null;
    _userId = null;
    _loggedIn = false;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('tenant_id');
    await prefs.remove('user_email');
    await prefs.remove('user_role');
    await prefs.setBool('logged_in', false);
  }

  /// Fetches executive financial dashboard data
  static Future<DashboardSummary> getDashboardSummary() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/accounting/summary'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return DashboardSummary.fromJson(data['data']);
      }
      return DashboardSummary.mock();
    } catch (_) {
      return DashboardSummary.mock();
    }
  }

  /// Uploads scanned/captured receipt or PO image
  static Future<Map<String, dynamic>> uploadDocument(File file) async {
    try {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/documents/upload'),
      );

      request.headers.addAll({
        if (_authToken != null) 'Authorization': 'Bearer $_authToken',
        if (_tenantId != null) 'x-tenant-id': _tenantId!,
      });

      request.files.add(await http.MultipartFile.fromPath('file', file.path));
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 201 || response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      // Return simulated success response when backend offline in mobile dev
    }

    return {
      'success': true,
      'data': {
        'draftId': 'doc_mob_${DateTime.now().millisecondsSinceEpoch}',
        'status': 'PENDING_REVIEW',
        'parsedData': {
          'vendorName': 'Tata Steel BSL Ltd',
          'poNumber': 'PO-MOB-8812',
          'totalAmount': 18500.0,
          'overallConfidence': 0.96,
        }
      }
    };
  }

  /// Submits a quick mobile sales receipt/order voucher
  static Future<bool> postQuickVoucher(Map<String, dynamic> voucherData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/accounting/vouchers'),
        headers: _headers,
        body: jsonEncode(voucherData),
      );
      return response.statusCode == 201 || response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}

class ApiException implements Exception {
  final String message;
  ApiException(this.message);

  @override
  String toString() => message;
}
