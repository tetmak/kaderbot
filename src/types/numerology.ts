// Numeroloji tip tanımlamaları

export interface UserData {
  firstName: string;
  lastName: string;
  birthDate: string;
}

export interface NumerologyResult {
  // Temel sayılar
  expressionNumber: number;      // İfade Sayısı (Kader)
  soulUrgeNumber: number;        // Ruh Güdüsü (İçsel Arzu)
  personalityNumber: number;     // Kişilik (Dış Algı)
  personalYear: number;          // Kişisel Yıl
  lifePathNumber: number;        // Yaşam Yolu
  
  // Detaylı hesaplama adımları
  calculationSteps: {
    firstNameValues: LetterValue[];
    lastNameValues: LetterValue[];
    expressionCalculation: string;
    soulUrgeCalculation: string;
    personalityCalculation: string;
    personalYearCalculation: string;
    lifePathCalculation: string;
  };
  
  // Yorumlar
  interpretations: {
    expression: string;
    soulUrge: string;
    personality: string;
    personalYear: string;
    lifePath: string;
  };
  
  // Sentez
  synthesis: string;
  
  // Did You Mean sorusu
  didYouMean: string;
  
  // Karmik Döngü analizi (Premium)
  karmicCycle: string;
  
  // Geleceğin Gölgesinden Bir Kesit (Premium)
  futureShadow: string;
}

export interface LetterValue {
  letter: string;
  value: number;
}

export interface AnalysisSection {
  title: string;
  number: number;
  calculation: string;
  interpretation: string;
}

// Pitagor harf değerleri
export const PythagoreanValues: Record<string, number> = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
  'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
  'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8,
  'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
  'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6, 'p': 7, 'q': 8, 'r': 9,
  's': 1, 't': 2, 'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8,
  'Ç': 3, 'Ğ': 7, 'İ': 9, 'Ö': 6, 'Ş': 1, 'Ü': 3, 'ç': 3, 'ğ': 7, 'ı': 9, 'ö': 6, 'ş': 1, 'ü': 3
};

// Sesli harfler
export const Vowels = ['A', 'E', 'I', 'O', 'U', 'a', 'e', 'i', 'o', 'u', 'İ', 'ı', 'Ö', 'ö', 'Ü', 'ü'];

// Sessiz harfler
export const Consonants = [
  'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z',
  'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z',
  'Ç', 'ç', 'Ğ', 'ğ', 'Ş', 'ş'
];
