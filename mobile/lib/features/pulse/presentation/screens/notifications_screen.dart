import 'dart:async';

import 'package:flutter/material.dart';
import '../../../../core/constants/colors.dart';
import '../../../../services/api_service.dart';

class NotificationBell extends StatefulWidget {
  const NotificationBell({super.key});

  @override
  State<NotificationBell> createState() => _NotificationBellState();
}

class _NotificationBellState extends State<NotificationBell> {
  Timer? _timer;
  int _unread = 0;

  @override
  void initState() {
    super.initState();
    _refresh();
    _timer = Timer.periodic(const Duration(seconds: 8), (_) => _refresh());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _refresh() async {
    try {
      final data = await ApiService.getData('/communication/notifications?limit=50');
      final count = data is Map ? (data['unreadCount'] as num?)?.toInt() ?? 0 : 0;
      if (mounted) setState(() => _unread = count);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return IconButton(
      tooltip: 'Notifications',
      onPressed: () async {
        await Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen()));
        _refresh();
      },
      icon: Stack(
        clipBehavior: Clip.none,
        children: [
          const Icon(Icons.notifications_outlined),
          if (_unread > 0)
            Positioned(
              right: -1,
              top: -1,
              child: Container(
                width: 9,
                height: 9,
                decoration: BoxDecoration(
                  color: const Color(0xFFEF4444),
                  shape: BoxShape.circle,
                  border: Border.all(color: Theme.of(context).appBarTheme.backgroundColor ?? Theme.of(context).scaffoldBackgroundColor, width: 1.5),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  Timer? _timer;
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _items = [];

  @override
  void initState() {
    super.initState();
    _load();
    _timer = Timer.periodic(const Duration(seconds: 8), (_) => _load(silent: true));
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _cardTitle(String raw) {
    final text = raw.trim();
    final head = text.split(':').first.trim();
    return head.isEmpty ? text : head;
  }

  Future<void> _load({bool silent = false}) async {
    if (!silent && mounted) {
      setState(() {
        _loading = true;
        _error = null;
      });
    }
    try {
      final data = await ApiService.getData('/communication/notifications?limit=50');
      final list = data is Map ? data['notifications'] : null;
      if (!mounted) return;
      setState(() {
        _items = list is List ? list.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList() : [];
        _loading = false;
        _error = null;
      });
    } catch (e) {
      if (!mounted || silent) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _markRead(Map<String, dynamic> item) async {
    if (item['isRead'] == true) return;
    final id = item['id']?.toString();
    if (id == null || id.isEmpty) return;
    try {
      await ApiService.patchData('/communication/notifications/${Uri.encodeComponent(id)}/read');
      if (!mounted) return;
      setState(() {
        for (final row in _items) {
          if (row['id']?.toString() == id) row['isRead'] = true;
        }
      });
    } catch (_) {}
  }

  Future<void> _markAll() async {
    try {
      await ApiService.postData('/communication/notifications/read-all', {});
      if (!mounted) return;
      setState(() {
        for (final item in _items) {
          item['isRead'] = true;
        }
      });
    } catch (_) {}
  }

  Future<void> _open(Map<String, dynamic> item) async {
    await _markRead(item);
    if (!mounted) return;
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => _NotificationDetailScreen(item: item)),
    );
    _load(silent: true);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          if (_items.isNotEmpty)
            TextButton(onPressed: _markAll, child: const Text('Mark all read')),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(_error!, textAlign: TextAlign.center),
                        TextButton(onPressed: _load, child: const Text('Retry')),
                      ],
                    ),
                  ),
                )
              : _items.isEmpty
                  ? const Center(child: Padding(padding: EdgeInsets.all(32), child: Text('No notifications for this company.', textAlign: TextAlign.center)))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _items.length,
                      itemBuilder: (context, index) {
                        final item = _items[index];
                        final read = item['isRead'] == true;
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Material(
                            color: isDark ? FinstaqColors.darkCard : Colors.white,
                            borderRadius: BorderRadius.circular(14),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(14),
                              onTap: () => _open(item),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: isDark ? FinstaqColors.darkBorder : FinstaqColors.lightBorder),
                                ),
                                child: Row(
                                  children: [
                                    if (!read) ...[
                                      Container(
                                        width: 8,
                                        height: 8,
                                        decoration: const BoxDecoration(color: Color(0xFFEF4444), shape: BoxShape.circle),
                                      ),
                                      const SizedBox(width: 10),
                                    ],
                                    Expanded(
                                      child: Text(
                                        _cardTitle((item['title'] ?? 'Notification').toString()),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                                      ),
                                    ),
                                    Icon(Icons.chevron_right, size: 20, color: Colors.grey.shade500),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}

class _NotificationDetailScreen extends StatelessWidget {
  final Map<String, dynamic> item;
  const _NotificationDetailScreen({required this.item});

  @override
  Widget build(BuildContext context) {
    final when = (item['createdAt'] ?? '').toString().replaceFirst('T', ' ').split('.').first;
    return Scaffold(
      appBar: AppBar(title: const Text('Notification')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text((item['title'] ?? 'Notification').toString(), style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, height: 1.25)),
          const SizedBox(height: 8),
          Text('${item['category'] ?? 'SYSTEM'} • $when', style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
          const SizedBox(height: 16),
          Text((item['message'] ?? '').toString(), style: const TextStyle(fontSize: 15, height: 1.45)),
        ],
      ),
    );
  }
}
