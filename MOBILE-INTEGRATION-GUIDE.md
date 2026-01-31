# 📱 Kader Matrisi - Mobil Uygulama Entegrasyon Rehberi

Bu rehber, mevcut React web uygulamanızı mobil uygulamaya dönüştürme ve API entegrasyonlarını yapma adımlarını içerir.

---

## 🎯 Hızlı Başlangıç

### 1. Gerekli Dosyalar

Aşağıdaki dosyalar zaten oluşturuldu:

```
src/
├── config/
│   └── env.ts                    # API anahtarları ve yapılandırma
├── services/
│   ├── kimiApi.ts                # Kimi AI API servisi
│   └── stripePayment.ts          # Stripe ödeme servisi
├── api/
│   └── backend-example.ts        # Backend API örneği
└── ...
```

### 2. .env.local Dosyasını Oluştur

```bash
cp .env.example .env.local
```

Dosyayı doldurun:
```env
VITE_KIMI_API_KEY=sk-your-actual-kimi-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test-your-actual-stripe-key
```

---

## 🔌 API Entegrasyon Satırları

### Kimi API Entegrasyonu

**Dosya:** `src/services/kimiApi.ts`

**Kullanım:** `src/App.tsx`'te aşağıdaki satırları ekleyin:

```typescript
// Satır 1-15: Import'ların altına ekle
import { 
  generateLiveAnalysis, 
  generateLiveLoveAnalysis, 
  generateLiveWealthAnalysis 
} from '@/services/kimiApi';

// Satır 40-45: handlePersonalSubmit fonksiyonunu değiştir
const handlePersonalSubmit = async (data: UserData) => {
  setUserName(`${data.firstName} ${data.lastName}`);
  setAppMode('loading-personal');
  
  // CANLI ANALİZ (Kimi API)
  const liveResult = await generateLiveAnalysis(data);
  if (liveResult.content) {
    console.log('Kimi Analizi:', liveResult.content);
    // Analizi state'e kaydet veya göster
  }
  
  // Yerel hesaplama (yedek)
  const result = calculateNumerology(data);
  setPersonalResult(result);
};

// Satır 55-60: handleLoveSubmit fonksiyonunu değiştir
const handleLoveSubmit = async (user: PartnerData, partner: PartnerData) => {
  setLoveUserName(`${user.firstName} ${user.lastName}`);
  setLovePartnerName(`${partner.firstName} ${partner.lastName}`);
  setAppMode('loading-love');
  
  // CANLI ANALİZ (Kimi API)
  const liveResult = await generateLiveLoveAnalysis(user, partner);
  if (liveResult.content) {
    console.log('Kimi Aşk Analizi:', liveResult.content);
  }
  
  const result = calculateLoveCompatibility(user, partner);
  setLoveResult(result);
};

// Satır 70-75: handleWealthSubmit fonksiyonunu değiştir
const handleWealthSubmit = async (data: BusinessData) => {
  setWealthFounderName(`${data.founderFirstName} ${data.founderLastName}`);
  setWealthCompanyName(data.companyName);
  setAppMode('loading-wealth');
  
  // CANLI ANALİZ (Kimi API)
  const liveResult = await generateLiveWealthAnalysis(data);
  if (liveResult.content) {
    console.log('Kimi İş Analizi:', liveResult.content);
  }
  
  const result = calculateWealthAnalysis(data);
  setWealthResult(result);
};
```

### Stripe Entegrasyonu

**Dosya:** `src/services/stripePayment.ts`

**Kullanım:** `src/components/AnalysisResult.tsx`'te aşağıdaki satırları ekleyin:

```typescript
// Satır 1-10: Import'lara ekle
import { 
  initiatePayment, 
  getPriceInfo, 
  getPaymentTypeForAnalysis 
} from '@/services/stripePayment';

// Satır 45-55: Paywall dialog içinde ödeme fonksiyonu
const handleUnlock = async () => {
  const paymentType = getPaymentTypeForAnalysis('personal');
  const priceInfo = getPriceInfo(paymentType);
  
  // Demo modda direkt aç
  if (isDemoMode()) {
    setShowPaywall(false);
    setSynthesisRevealed(true);
    return;
  }
  
  // Gerçek ödeme
  const session = await initiatePayment(paymentType, 'user_id_here');
  if (session.url) {
    window.location.href = session.url; // Stripe Checkout'a yönlendir
  }
};
```

---

## 📱 Mobil Dönüşüm Seçenekleri

### Seçenek 1: React Native (Önerilen)

**Avantajları:**
- Gerçek native performans
- App Store / Play Store yayını
- Native özellikler (bildirimler, kamera vb.)

**Kurulum:**

```bash
# 1. React Native projesi oluştur
npx react-native init KaderMatrisiMobile --template react-native-template-typescript

# 2. Gerekli paketleri kur
cd KaderMatrisiMobile
npm install @stripe/stripe-react-native @react-native-async-storage/async-storage

# 3. Web kodlarını taşı
# src/ klasörünün tamamını kopyala

# 4. Dosya uzantılarını değiştir
# .tsx dosyalarını aynen kullan

# 5. React Native'e özel düzenlemeler
```

**Değiştirilecek Dosyalar:**

| Web (React) | Mobil (React Native) |
|-------------|---------------------|
| `div` | `View` |
| `button` | `TouchableOpacity` |
| `input` | `TextInput` |
| `lucide-react` | `react-native-vector-icons` |
| `tailwindcss` | `StyleSheet` |

**Örnek Dönüşüm:**

```tsx
// Web (React)
<div className="gold-border p-4">
  <button onClick={handleClick}>Tıkla</button>
</div>

// Mobil (React Native)
<View style={styles.container}>
  <TouchableOpacity onPress={handleClick}>
    <Text>Tıkla</Text>
  </TouchableOpacity>
</View>

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#D4AF37',
    padding: 16,
  },
});
```

---

### Seçenek 2: Ionic + Capacitor (Hızlı çözüm)

**Avantajları:**
- Mevcut kodu neredeyse değiştirmeden kullan
- Hem web hem mobil tek kod tabanı
- Hızlı geliştirme

**Kurulum:**

```bash
# 1. Ionic CLI kur
npm install -g @ionic/cli

# 2. Mevcut projeye Ionic ekle
cd /mnt/okcomputer/output/app
npm install @ionic/react @capacitor/core @capacitor/android @capacitor/ios

# 3. Capacitor yapılandır
npx cap init KaderMatrisi com.kadermatrisi.app --web-dir dist

# 4. Build al
npm run build

# 5. Mobil platformları ekle
npx cap add android
npx cap add ios

# 6. Sync et
npx cap sync

# 7. Android Studio / Xcode ile aç
npx cap open android
npx cap open ios
```

**Önemli Notlar:**
- Web kodlarınız %90 aynen çalışır
- Stripe için: `@capacitor-community/stripe` kullanın
- Kimi API için: Mevcut `fetch` kodları aynen çalışır

---

### Seçenek 3: PWA (Progressive Web App)

**Avantajları:**
- En kolay çözüm
- App Store onayı gerekmez
- Anında güncelleme

**Kurulum:**

Mevcut proje zaten PWA destekli! Sadece `vite-plugin-pwa` ekleyin:

```bash
npm install vite-plugin-pwa -D
```

`vite.config.ts`:
```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Kader Matrisi',
        short_name: 'KaderMatrisi',
        description: 'Sayıların karanlık dehlizlerinde seni bekleyen gerçekleri keşfet',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
}
```

---

## 💳 Stripe Entegrasyon Detayları

### 1. Stripe Dashboard Ayarları

```
https://dashboard.stripe.com/
```

**Yapılacaklar:**
1. Hesap oluştur
2. Ürünler oluştur:
   - Detaylı Kişisel Analiz: 179₺
   - Karmik İlişki Raporu: 249₺
   - İşletme Numerolojisi: 349₺
   - Tam Paket: 599₺

3. Fiyat ID'lerini kopyala
4. .env.local'e yapıştır

### 2. Webhook Kurulumu

```bash
# Stripe CLI ile local test
stripe listen --forward-to localhost:3001/api/webhook
```

### 3. Ödeme Akışı

```
1. Kullanıcı "Kilidi Aç" butonuna tıklar
2. Frontend → Backend: /api/create-checkout-session
3. Backend → Stripe: Session oluştur
4. Stripe → Backend: Session URL
5. Backend → Frontend: { sessionId, url }
6. Frontend: window.location.href = url
7. Kullanıcı Stripe Checkout'ta ödeme yapar
8. Stripe → Backend Webhook: payment_success
9. Backend: Kullanıcıya premium erişim ver
10. Kullanıcı success_url'e yönlendirilir
```

---

## 🤖 Kimi API Entegrasyon Detayları

### 1. API Anahtarı Alma

```
https://platform.moonshot.cn/
```

1. Hesap oluştur
2. API Keys bölümünden yeni key oluştur
3. .env.local'e ekle

### 2. Kullanım Limitleri

| Plan | Günlük Limit | Fiyat |
|------|-------------|-------|
| Ücretsiz | 100 istek | $0 |
| Starter | 10,000 istek | $10/ay |
| Pro | Sınırsız | $50/ay |

### 3. Maliyet Hesaplama

```
Ortalama analiz: ~2000 token
Kimi fiyatı: $0.002 / 1K token

Bir analiz maliyeti: 2000 × $0.002 / 1000 = $0.004
Türk Lirası: $0.004 × 35₺ = ~0.14₺

Satış fiyatı: 179₺
Maliyet: 0.14₺
Kâr: 178.86₺ (%99.9)
```

---

## 🔐 Güvenlik Kontrol Listesi

### ✅ Yapılması Gerekenler

- [ ] `.env.local` `.gitignore`'a eklendi
- [ ] API anahtarları asla frontend'e gömülmedi
- [ ] Stripe Secret Key sadece backend'de
- [ ] HTTPS kullanılıyor
- [ ] CORS ayarları yapıldı
- [ ] Rate limiting aktif
- [ ] Input validasyonu var

### ❌ Asla Yapılmayacaklar

```typescript
// YANLIŞ ❌
const API_KEY = 'sk-live-1234567890'; // Kodun içinde!

// DOĞRU ✅
const API_KEY = import.meta.env.VITE_API_KEY; // .env.local'den
```

---

## 📁 Dosya Yapısı Özeti

```
KaderMatrisi/
├── src/
│   ├── config/
│   │   └── env.ts              # API anahtarları
│   ├── services/
│   │   ├── kimiApi.ts          # Kimi AI servisi
│   │   └── stripePayment.ts    # Stripe servisi
│   ├── api/
│   │   └── backend-example.ts  # Backend örneği
│   ├── components/
│   ├── lib/
│   ├── types/
│   └── App.tsx
├── .env.example                # Örnek env dosyası
├── .env.local                  # Gerçek anahtarlar (GIT'E ATMA!)
└── MOBILE-INTEGRATION-GUIDE.md # Bu dosya
```

---

## 🚀 Sonraki Adımlar

1. **API Anahtarlarını Al:**
   - Kimi: https://platform.moonshot.cn/
   - Stripe: https://dashboard.stripe.com/

2. **.env.local Doldur:**
   ```bash
   cp .env.example .env.local
   # Anahtarları yapıştır
   ```

3. **Backend Kur (Opsiyonel):**
   ```bash
   cd backend
   npm install
   npm start
   ```

4. **Mobil Platform Seç:**
   - React Native: En iyi performans
   - Ionic: En hızlı geliştirme
   - PWA: En kolay dağıtım

5. **Test Et:**
   ```bash
   npm run dev      # Web test
   npm run build    # Build al
   npx cap sync     # Mobil sync
   ```

---

## 🆘 Destek

Sorularınız için:
- Kimi API Docs: https://platform.moonshot.cn/docs
- Stripe Docs: https://stripe.com/docs
- React Native: https://reactnative.dev/
- Ionic: https://ionicframework.com/docs

---

**Kader Matrisi, seni bekliyor.** ⚡
