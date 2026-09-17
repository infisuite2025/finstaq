/**
 * Utility to convert numbers to Indian Rupee Words format
 * Example: 154280 => "Rupees One Lakh Fifty-Four Thousand Two Hundred Eighty Only"
 */

const ones = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const tens = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function convertTwoDigits(num: number): string {
  if (num < 20) return ones[num];
  const ten = Math.floor(num / 10);
  const one = num % 10;
  return tens[ten] + (one ? ' ' + ones[one] : '');
}

function convertThreeDigits(num: number): string {
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  let str = '';
  if (hundred) {
    str += ones[hundred] + ' Hundred';
  }
  if (remainder) {
    str += (str ? ' ' : '') + convertTwoDigits(remainder);
  }
  return str;
}

export function numberToIndianWords(amount: number): string {
  if (!amount || isNaN(amount) || amount === 0) return 'Rupees Zero Only';

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const integerPart = Math.floor(absAmount);
  const decimalPart = Math.round((absAmount - integerPart) * 100);

  // Indian format chunking: Crores, Lakhs, Thousands, Hundreds
  const crore = Math.floor(integerPart / 10000000);
  const croreRemainder = integerPart % 10000000;
  const lakh = Math.floor(croreRemainder / 100000);
  const lakhRemainder = croreRemainder % 100000;
  const thousand = Math.floor(lakhRemainder / 1000);
  const hundredAndBelow = lakhRemainder % 1000;

  const parts: string[] = [];

  if (crore) {
    parts.push(convertThreeDigits(crore) + ' Crore');
  }
  if (lakh) {
    parts.push(convertTwoDigits(lakh) + ' Lakh');
  }
  if (thousand) {
    parts.push(convertTwoDigits(thousand) + ' Thousand');
  }
  if (hundredAndBelow) {
    parts.push(convertThreeDigits(hundredAndBelow));
  }

  let words = 'Rupees ' + parts.join(' ');

  if (decimalPart > 0) {
    words += ' and ' + convertTwoDigits(decimalPart) + ' Paise';
  }

  words += ' Only';

  return (isNegative ? 'Minus ' : '') + words;
}
