import 'package:flutter/material.dart';
import '../constants/colors.dart';

class FinstaqTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: FinstaqColors.primaryBlue,
      scaffoldBackgroundColor: FinstaqColors.lightBg,
      cardColor: FinstaqColors.lightCard,
      colorScheme: ColorScheme.light(
        primary: FinstaqColors.primaryBlue,
        secondary: FinstaqColors.indigoAccent,
        surface: FinstaqColors.lightCard,
        background: FinstaqColors.lightBg,
        error: FinstaqColors.debitRed,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: FinstaqColors.lightTextPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.5,
        ),
        iconTheme: IconThemeData(color: FinstaqColors.lightTextPrimary),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: FinstaqColors.primaryBlue,
      scaffoldBackgroundColor: FinstaqColors.darkBg,
      cardColor: FinstaqColors.darkCard,
      colorScheme: ColorScheme.dark(
        primary: FinstaqColors.primaryBlue,
        secondary: FinstaqColors.indigoAccent,
        surface: FinstaqColors.darkCard,
        background: FinstaqColors.darkBg,
        error: FinstaqColors.debitRed,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: FinstaqColors.darkCard,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: FinstaqColors.darkTextPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.5,
        ),
        iconTheme: IconThemeData(color: FinstaqColors.darkTextPrimary),
      ),
    );
  }
}