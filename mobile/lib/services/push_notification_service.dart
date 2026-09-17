import 'package:flutter/material.dart';

class InAppPushNotification {
  final String id;
  final String title;
  final String message;
  final String category; // 'approval', 'upi', 'pdc', 'compliance', 'system'
  final String priority; // 'urgent', 'high', 'medium', 'low'
  final DateTime timestamp;
  bool isRead;
  final String? routeId;

  InAppPushNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.category,
    required this.priority,
    required this.timestamp,
    this.isRead = false,
    this.routeId,
  });
}

class PushNotificationService extends ChangeNotifier {
  static final PushNotificationService _instance = PushNotificationService._internal();
  factory PushNotificationService() => _instance;
  PushNotificationService._internal() {
    _initSampleNotifications();
  }

  final List<InAppPushNotification> _notifications = [];
  List<InAppPushNotification> get notifications => List.unmodifiable(_notifications);

  int get unreadCount => _notifications.where((n) => !n.isRead).length;

  void _initSampleNotifications() {
    _notifications.addAll([
      InAppPushNotification(
        id: 'notif-001',
        title: '🚨 High-Value Payout Pending Approval',
        message: 'Payment #PAY-2026-089 of ₹6,50,000 to Tata Steel requires your 4-Eyes signoff.',
        category: 'approval',
        priority: 'urgent',
        timestamp: DateTime.now().subtract(const Duration(minutes: 8)),
        routeId: 'approvals',
      ),
      InAppPushNotification(
        id: 'notif-002',
        title: '💰 UPI Instant Payment Received',
        message: '₹45,000 credited to HDFC Bank from Apex Retail via UPI VPA apex@icici.',
        category: 'upi',
        priority: 'high',
        timestamp: DateTime.now().subtract(const Duration(minutes: 25)),
        routeId: 'upi',
      ),
      InAppPushNotification(
        id: 'notif-003',
        title: '⏰ PDC Cheque Due Today',
        message: 'Cheque #884210 of ₹2,10,000 for Larsen & Toubro matures today at HDFC Bank.',
        category: 'pdc',
        priority: 'high',
        timestamp: DateTime.now().subtract(const Duration(hours: 2)),
        routeId: 'pdc',
      ),
      InAppPushNotification(
        id: 'notif-004',
        title: '🛡️ TCS 206C(1H) Threshold Alert',
        message: 'Party Bharat Heavy Electricals turnover crossed ₹50 Lakhs. TCS is now applicable @ 0.1%.',
        category: 'compliance',
        priority: 'medium',
        timestamp: DateTime.now().subtract(const Duration(hours: 5)),
        routeId: 'tcs',
      ),
    ]);
  }

  void markAsRead(String id) {
    final idx = _notifications.indexWhere((n) => n.id == id);
    if (idx != -1) {
      _notifications[idx].isRead = true;
      notifyListeners();
    }
  }

  void markAllAsRead() {
    for (var n in _notifications) {
      n.isRead = true;
    }
    notifyListeners();
  }

  void simulateIncomingPush(String title, String message, String category) {
    _notifications.insert(
      0,
      InAppPushNotification(
        id: 'notif-${DateTime.now().millisecondsSinceEpoch}',
        title: title,
        message: message,
        category: category,
        priority: 'urgent',
        timestamp: DateTime.now(),
        routeId: category == 'approval' ? 'approvals' : 'pulse',
      ),
    );
    notifyListeners();
  }
}
