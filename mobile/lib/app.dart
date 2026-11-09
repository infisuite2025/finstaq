import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/widgets/quick_action_sheet.dart';
import 'features/pulse/presentation/screens/pulse_screen.dart';
import 'features/books/presentation/screens/books_screen.dart';
import 'features/upi/presentation/screens/upi_hub_screen.dart';
import 'features/upi/presentation/screens/upi_scan_screen.dart';
import 'features/more/presentation/screens/api_module_screen.dart';
import 'features/more/presentation/screens/more_screen.dart';
import 'screens/login_screen.dart';
import 'screens/quick_voucher_screen.dart';
import 'services/api_service.dart';

class FinstaqApp extends StatelessWidget {
  const FinstaqApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Infisuite Finance',
      debugShowCheckedModeBanner: false,
      theme: FinstaqTheme.lightTheme,
      darkTheme: FinstaqTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: ApiService.isAuthenticated ? const MainMobileNavigation() : const LoginScreen(),
    );
  }
}

class MainMobileNavigation extends StatefulWidget {
  const MainMobileNavigation({Key? key}) : super(key: key);

  @override
  State<MainMobileNavigation> createState() => _MainMobileNavigationState();
}

class _BooksRefresh extends ChangeNotifier {
  void bump() => notifyListeners();
}

class _MainMobileNavigationState extends State<MainMobileNavigation> {
  int _currentIndex = 0;
  final UpiTabBus _upiTab = UpiTabBus();
  final _BooksRefresh _booksRefresh = _BooksRefresh();
  DateTime _holdNavUntil = DateTime.fromMillisecondsSinceEpoch(0);

  late final List<Widget> _screens = [
    PulseScreen(onOpenUpi: (tab) {
      _upiTab.open(tab);
      _selectTab(2);
    }),
    BooksScreen(refreshTick: _booksRefresh),
    UpiHubScreen(tabRequest: _upiTab),
    const MoreScreen(),
  ];

  void _selectTab(int index) {
    if (DateTime.now().isBefore(_holdNavUntil)) return;
    setState(() => _currentIndex = index);
    if (index == 1) _booksRefresh.bump();
  }

  void _openBooksAfterPost() {
    _holdNavUntil = DateTime.now().add(const Duration(milliseconds: 500));
    setState(() => _currentIndex = 1);
    _booksRefresh.bump();
  }

  void _openQuickActions() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => QuickActionSheet(
        onActionSelected: (actionId) {
          if (actionId == 'upi_qr') {
            _upiTab.open('qr');
            setState(() => _currentIndex = 2);
            return;
          }
          if (actionId == 'upi_scan') {
            Navigator.push<String>(
              context,
              MaterialPageRoute(builder: (_) => const UpiScanScreen()),
            ).then((message) {
              if (message == null || !context.mounted) return;
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
            });
            return;
          }
          if (actionId == 'quick_invoice' || actionId == 'quick_expense') {
            Navigator.push<bool>(
              context,
              MaterialPageRoute(
                builder: (_) => QuickVoucherScreen(
                  defaultType: actionId == 'quick_expense' ? 'PAYMENT' : 'SALES',
                ),
              ),
            ).then((posted) {
              if (posted == true) _openBooksAfterPost();
            });
            return;
          }
          if (actionId == 'stock_scan') {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const ApiModuleScreen(title: 'Stock', path: '/inventory/items'),
              ),
            );
            return;
          }
          if (actionId == 'geo_punch') {
            final now = DateTime.now();
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ApiModuleScreen(
                  title: 'Attendance',
                  path: '/payroll/attendance?month=${now.month}&year=${now.year}',
                ),
              ),
            );
          }
        },
      ),
    );
  }

  @override
  void dispose() {
    _booksRefresh.dispose();
    _upiTab.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _openQuickActions,
        backgroundColor: const Color(0xFF2563EB),
        foregroundColor: Colors.white,
        elevation: 4,
        shape: const CircleBorder(),
        tooltip: 'Quick actions',
        child: const Icon(Icons.add, size: 28),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: BottomAppBar(
        shape: const CircularNotchedRectangle(),
        notchMargin: 8,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            IconButton(
              tooltip: 'Pulse',
              icon: Icon(Icons.home_outlined, color: _currentIndex == 0 ? const Color(0xFF2563EB) : Colors.grey),
              onPressed: () => _selectTab(0),
            ),
            IconButton(
              tooltip: 'Books',
              icon: Icon(Icons.receipt_long_outlined, color: _currentIndex == 1 ? const Color(0xFF2563EB) : Colors.grey),
              onPressed: () => _selectTab(1),
            ),
            const SizedBox(width: 48), // Space for central FAB
            IconButton(
              tooltip: 'UPI',
              icon: Icon(Icons.qr_code_scanner, color: _currentIndex == 2 ? const Color(0xFF2563EB) : Colors.grey),
              onPressed: () => _selectTab(2),
            ),
            IconButton(
              tooltip: 'More',
              icon: Icon(Icons.widgets_outlined, color: _currentIndex == 3 ? const Color(0xFF2563EB) : Colors.grey),
              onPressed: () => _selectTab(3),
            ),
          ],
        ),
      ),
    );
  }
}