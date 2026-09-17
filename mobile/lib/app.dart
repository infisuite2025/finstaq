import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/widgets/quick_action_sheet.dart';
import 'features/pulse/presentation/screens/pulse_screen.dart';
import 'features/books/presentation/screens/books_screen.dart';
import 'features/upi/presentation/screens/upi_hub_screen.dart';
import 'features/more/presentation/screens/more_screen.dart';

class FinstaqApp extends StatelessWidget {
  const FinstaqApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FINSTAQ Mobile ERP',
      debugShowCheckedModeBanner: false,
      theme: FinstaqTheme.lightTheme,
      darkTheme: FinstaqTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: const MainMobileNavigation(),
    );
  }
}

class MainMobileNavigation extends StatefulWidget {
  const MainMobileNavigation({Key? key}) : super(key: key);

  @override
  State<MainMobileNavigation> createState() => _MainMobileNavigationState();
}

class _MainMobileNavigationState extends State<MainMobileNavigation> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    PulseScreen(),
    BooksScreen(),
    UpiHubScreen(),
    MoreScreen(),
  ];

  void _openQuickActions() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => QuickActionSheet(
        onActionSelected: (actionId) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Triggered action: $actionId')),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
              icon: Icon(Icons.dashboard_outlined, color: _currentIndex == 0 ? const Color(0xFF2563EB) : Colors.grey),
              onPressed: () => setState(() => _currentIndex = 0),
            ),
            IconButton(
              icon: Icon(Icons.receipt_long_outlined, color: _currentIndex == 1 ? const Color(0xFF2563EB) : Colors.grey),
              onPressed: () => setState(() => _currentIndex = 1),
            ),
            const SizedBox(width: 48), // Space for central FAB
            IconButton(
              icon: Icon(Icons.qr_code_scanner, color: _currentIndex == 2 ? const Color(0xFF2563EB) : Colors.grey),
              onPressed: () => setState(() => _currentIndex = 2),
            ),
            IconButton(
              icon: Icon(Icons.widgets_outlined, color: _currentIndex == 3 ? const Color(0xFF2563EB) : Colors.grey),
              onPressed: () => setState(() => _currentIndex = 3),
            ),
          ],
        ),
      ),
    );
  }
}