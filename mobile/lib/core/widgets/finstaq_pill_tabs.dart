import 'package:flutter/material.dart';
import '../constants/colors.dart';

class PillTabItem {
  final String id;
  final String label;
  final IconData? icon;
  final int? count;

  PillTabItem({
    required this.id,
    required this.label,
    this.icon,
    this.count,
  });
}

class FinstaqPillTabs extends StatelessWidget {
  final List<PillTabItem> tabs;
  final String selectedTabId;
  final ValueChanged<String> onTabSelected;

  const FinstaqPillTabs({
    Key? key,
    required this.tabs,
    required this.selectedTabId,
    required this.onTabSelected,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: tabs.map((tab) {
          final isSelected = tab.id == selectedTabId;

          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeOutCubic,
              decoration: BoxDecoration(
                color: isSelected
                    ? FinstaqColors.primaryBlue
                    : isDark
                        ? FinstaqColors.darkPillInactive
                        : FinstaqColors.lightPillInactive,
                borderRadius: BorderRadius.circular(100),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: FinstaqColors.primaryBlue.withOpacity(0.3),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        )
                      ]
                    : null,
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  borderRadius: BorderRadius.circular(100),
                  onTap: () => onTabSelected(tab.id),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 9,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (tab.icon != null) ...[
                          Icon(
                            tab.icon,
                            size: 15,
                            color: isSelected
                                ? Colors.white
                                : isDark
                                    ? FinstaqColors.darkTextSecondary
                                    : FinstaqColors.lightTextSecondary,
                          ),
                          const SizedBox(width: 6),
                        ],
                        Text(
                          tab.label,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: isSelected
                                ? FontWeight.w700
                                : FontWeight.w600,
                            color: isSelected
                                ? Colors.white
                                : isDark
                                    ? FinstaqColors.darkTextPrimary
                                    : FinstaqColors.lightTextSecondary,
                          ),
                        ),
                        if (tab.count != null && tab.count! > 0) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? Colors.white.withOpacity(0.25)
                                  : isDark
                                      ? const Color(0xFF334155)
                                      : const Color(0xFFE2E8F0),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '${tab.count}',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: isSelected
                                    ? Colors.white
                                    : isDark
                                        ? FinstaqColors.darkTextSecondary
                                        : FinstaqColors.lightTextSecondary,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}