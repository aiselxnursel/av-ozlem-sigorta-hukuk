/* ============================================================
   SİGORTA HUKUK SİSTEMİ v2 — ANA UYGULAMA MANTIK DOSYASI
   İçtihat Destekli Dilekçe + İcra Kapak Hesabı + Mail Taslakları
   ============================================================ */

// ===================== GLOBAL STATE =====================
let currentStep = 1;
const TOTAL_STEPS = 12;

// 2026 Yılı Güncel Değerler
const CONSTANTS = {
  yasalFaizOrani: 0.24,
  avansFaizOrani: 0.51,
  tcmbReeskont: 0.48,
  tahsilHarci: 0.0455,
  cezaeviHarci: 0.02,
  icraVekaletAsgari: 6700,
  istinafHarci: 2000,
  istinafPostaMasrafi: 500,
  temyizHarci: 3000,
  istinafSuresiAy: 15,
  temyizSuresiAy: 18,
  istinafParasalSinir: 28290,
  temyizParasalSinir: 378880,
  asgariUcretBrut: 26006,
  asgariUcretNet: 22104,
  teknikFaizDefault: 0.018,
};

// ===================== İÇTİHAT VERİTABANI =====================
const ICTIHAT = {
  zamanasimi_defi: {
    kuralKaynagi: 'TBK m. 161; HMK m. 127, m. 141',
    ictihat: 'Yargıtay HGK 2017/17-2710 E., 2021/1045 K.',
    ozet: 'Zamanaşımı def\'i niteliğinde olup hâkim tarafından re\'sen dikkate alınamaz; cevap dilekçesinde süresinde ileri sürülmezse savunmanın genişletilmesi yasağı kapsamında kalır ve kural olarak kaybedilir.'
  },
  zamanasimi_ttk1420: {
    kuralKaynagi: 'TTK m. 1420/1',
    ictihat: 'Yargıtay 17. HD 2019/4521 E., 2020/3642 K.',
    ozet: 'Sigorta sözleşmesinden doğan tüm talepler alacağın muaccel olduğu tarihten itibaren iki yılda; sigorta tazminatı ve sigorta bedeli alacakları ise her hâlde rizikonun gerçekleştiği tarihten itibaren altı yılda zamanaşımına uğrar.'
  },
  zamanasimi_ktk109: {
    kuralKaynagi: 'KTK m. 109/1-2',
    ictihat: 'Yargıtay 17. HD 2018/4685 E., 2020/2154 K.',
    ozet: 'Motorlu araç kazalarından doğan tazminat talepleri, zarar görenin zararı ve tazminat yükümlüsünü öğrendiği tarihten itibaren iki yıl ve her hâlde kaza gününden başlayarak on yıl içinde zamanaşımına uğrar. Dava cezayı gerektiren bir fiilden doğar ve ceza kanunu bu fiil için daha uzun bir zamanaşımı süresi öngörmüş ise tazminat davasında da bu süre uygulanır.'
  },
  zamanasimi_uzamis_ispat: {
    kuralKaynagi: 'KTK m. 109/2; TCK m. 66',
    ictihat: 'Yargıtay 17. HD 2018/4685 E., 2020/2154 K.; Yargıtay 4. HD 2019/1287 E.',
    ozet: 'Uzamış ceza zamanaşımının uygulanabilmesi için eylemin somut olayda suç oluşturduğunun ortaya konulması gerekir. Bu husustaki ispat yükü davacı tarafa aittir. Yalnızca maddi hasarlı kazalarda TCK anlamında bir yaralama veya öldürme suçu oluşmayacağından uzamış ceza zamanaşımı uygulanamaz.'
  },
  zamanasimi_islah: {
    kuralKaynagi: 'HMK m. 176 vd., m. 107',
    ictihat: 'Yargıtay 17. HD 2016/18729 E., 2019/11254 K.',
    ozet: 'Kısmi davada zamanaşımı yalnızca dava edilen kısım için kesilir; ıslahla artırılan kısım yönünden zamanaşımı ıslah tarihine göre hesaplanır. Belirsiz alacak davasında ise talep artırımı ıslah niteliğinde olmadığından zamanaşımı tüm alacak için kesilmiş sayılır.'
  },
  belirsiz_alacak: {
    kuralKaynagi: 'HMK m. 107',
    ictihat: 'Yargıtay HGK 2016/22-1166 E., 2019/1090 K.',
    ozet: 'Belirsiz alacak davası açılabilmesi için alacağın miktarını veya değerini tam ve kesin olarak belirleyebilmesinin davacıdan beklenememesi gerekir. Tazminatın hesabı bilirkişi incelemesini gerektirdiğinden belirsiz alacak davasının açılabileceği kabul edilmekle birlikte, bu nitelendirme somut olayın koşullarına göre değerlendirilmelidir.'
  },
  arabuluculuk: {
    kuralKaynagi: '6325 sayılı Kanun m. 18/A; 7036 sayılı Kanun m. 3; TTK m. 5/A',
    ictihat: 'Yargıtay 11. HD 2020/1845 E., 2021/2367 K.',
    ozet: 'Ticari davalarda ve iş uyuşmazlıklarında arabuluculuk dava şartıdır. Arabuluculuk son tutanağının dava dilekçesine eklenmesi zorunlu olup eksikliği halinde dava şartı yokluğundan davanın usulden reddi gerekir.'
  },
  kusur_muterafik: {
    kuralKaynagi: 'TBK m. 52; KTK m. 86',
    ictihat: 'Yargıtay 17. HD 2015/14287 E., 2018/6421 K.',
    ozet: 'Zarar görenin kusurunun zararın doğumuna veya artmasına etki ettiği hallerde hâkim tazminatı indirebilir veya tamamen kaldırabilir. Emniyet kemeri takılmaması, hız ihlali yapılması, alkollü araç kullanılması gibi haller müterafik kusur kapsamında değerlendirilir ve tazminattan indirim sebebidir.'
  },
  kusur_ktt: {
    kuralKaynagi: 'KTK m. 83-84; Trafik Kazalarında Kaza Tespit Tutanağı Düzenleme Usul ve Esaslarına İlişkin Yönetmelik',
    ictihat: 'Yargıtay 17. HD 2019/6845 E., 2020/4521 K.',
    ozet: 'Kaza tespit tutanağı kesin delil niteliğinde olmayıp aksinin her türlü delille ispatı mümkündür. Bilirkişi incelemesinde KTT\'deki kusur dağılımından farklı bir sonuca ulaşılması mümkündür.'
  },
  maluliyet_atk: {
    kuralKaynagi: '2659 sayılı Adli Tıp Kurumu Kanunu; Çalışma Gücü ve Meslekte Kazanma Gücü Kaybı Oranı Tespit İşlemleri Yönetmeliği',
    ictihat: 'Yargıtay 17. HD 2017/2846 E., 2019/8745 K.',
    ozet: 'Maluliyet oranının tespitinde üniversite hastanesi veya Adli Tıp Kurumu\'ndan rapor alınması, raporlar arasında çelişki bulunması halinde ATK Genel Kurulu\'ndan nihai rapor alınması gerekir. Raporun Çalışma Gücü Kaybı Yönetmeliği hükümlerine uygun düzenlenip düzenlenmediği denetlenmelidir.'
  },
  maluliyet_illiyet: {
    kuralKaynagi: 'TBK m. 51-52',
    ictihat: 'Yargıtay 17. HD 2018/9245 E., 2020/1654 K.',
    ozet: 'Tazminata hükmedilebilmesi için zarar ile olay arasında illiyet bağının bulunması zorunludur. Davacının kaza öncesinden mevcut rahatsızlıkları, maluliyetin tamamının kazaya bağlanmasını engeller; bu durumda oransal bir illiyet değerlendirmesi yapılmalıdır.'
  },
  hesaplama_trh2010: {
    kuralKaynagi: 'Yargıtay İçtihadı Birleştirme Kurulu',
    ictihat: 'Yargıtay 17. HD 2019/5190 E., 2020/6234 K.',
    ozet: 'Tazminat hesaplamasında TRH-2010 (Türkiye Hayat Tablosu) yaşam tablosunun esas alınması, %1,8 teknik faiz oranı uygulanması ve progresif rant yöntemi (1/Kn formülü) ile hesaplama yapılması Yargıtay\'ın yerleşik uygulamasıdır.'
  },
  hesaplama_sgk: {
    kuralKaynagi: 'KTK m. 98; 5510 sayılı Kanun m. 21',
    ictihat: 'Yargıtay 10. HD 2018/7623 E., 2019/8954 K.',
    ozet: 'Sigorta tazminatı hesaplanırken SGK tarafından bağlanan gelirin peşin sermaye değerinin tazminattan düşülmesi zorunludur. Bu mahsup yapılmadan hüküm kurulması bozma nedenidir.'
  },
  hesaplama_gelir: {
    kuralKaynagi: 'TBK m. 51-52',
    ictihat: 'Yargıtay 17. HD 2020/3245 E., 2021/1876 K.',
    ozet: 'Davacının gerçek gelirinin tespitinde vergi kayıtları, SGK hizmet dökümü ve işvereninden alınacak belgeler esas alınmalıdır. Gelirin belgelenmemesi halinde asgari ücret baz alınır. Soyut beyana dayalı gelir tespiti hukuka aykırıdır.'
  },
  police_limit: {
    kuralKaynagi: 'TTK m. 1484; KTK m. 91-93; ZMSS Genel Şartları',
    ictihat: 'Yargıtay 17. HD 2020/1542 E., 2021/3678 K.',
    ozet: 'Sigortacının sorumluluğu poliçe teminat limiti ile sınırlıdır. Teminat limitini aşan kısım yönünden sigortacıya husumet yöneltilemez; bu kısmın sorumlusu zarar veren ve/veya araç işletendir.'
  },
  faiz_baslangic: {
    kuralKaynagi: 'TBK m. 117; KTK m. 98',
    ictihat: 'Yargıtay 17. HD 2018/6912 E., 2020/4523 K.',
    ozet: 'Haksız fiilden doğan tazminat alacaklarında temerrüt, haksız fiilin gerçekleştiği tarihte başlar. Ancak sigortacının sorumluluğu, rizikonun ihbar edildiği veya başvurunun yapıldığı tarihten itibaren başlar. KTK m. 98 uyarınca başvuru tarihinden itibaren 8 iş günlük ödeme süresi öngörülmüştür.'
  },
  manevi_tazminat: {
    kuralKaynagi: 'TBK m. 56',
    ictihat: 'Yargıtay 4. HD 2021/3485 E., 2022/1245 K.',
    ozet: 'Manevi tazminatın belirlenmesinde olayın oluşu, kusur oranı, tarafların sosyal ve ekonomik durumları, yaralanmanın ağırlığı, günün ekonomik koşulları dikkate alınır. Manevi tazminat zenginleşme aracı olmayıp tatmin fonksiyonu ağır basan bir tazminattır.'
  },
  dyk_tazminat: {
    kuralKaynagi: 'TBK m. 53/3; KTK m. 85-90',
    ictihat: 'Yargıtay 4. HD 2020/2785 E., 2021/5467 K.',
    ozet: 'Destekten yoksun kalma tazminatında ölenin yaşı, geliri, destek süresi ve payı, destekten yoksun kalanların yaşı ve bakım ihtiyacı dikkate alınır. Hesaplama TRH-2010 yaşam tablosu ve %1,8 teknik faiz oranı ile yapılmalıdır.'
  },
  teminat_disi: {
    kuralKaynagi: 'ZMSS Genel Şartları; Kasko Sigortası Genel Şartları',
    ictihat: 'Yargıtay 17. HD 2019/8454 E., 2020/7623 K.',
    ozet: 'Poliçe genel ve özel şartlarında sayılan teminat dışı haller kesin olarak belirlenmiştir. Alkollü araç kullanımı, ehliyetsiz sürücü, kasıtlı olay gibi durumlarda sigortacının ödeme yükümlülüğü ortadan kalkar veya rücu hakkı doğar.'
  },
  onceki_odeme: {
    kuralKaynagi: 'TBK m. 100',
    ictihat: 'Yargıtay 17. HD 2018/5436 E., 2019/7823 K.',
    ozet: 'Sigortacı tarafından daha önce yapılmış ödemeler, hükmedilecek tazminattan mahsup edilir. Mahsup yapılmadan tazminata hükmedilmesi mükerrer ödemeye yol açar ve hukuka aykırıdır. Ödeme, TBK m. 100 uyarınca önce faizden, kalan anaparadan düşülür.'
  }
};

// ===================== TRH-2010 BAKİYE ÖMÜR MATRİSİ (KADIN / ERKEK) =====================
const TRH2010_TABLE = {
  0: [72.34, 78.02], 1: [71.95, 77.58], 2: [70.99, 76.62], 3: [70.02, 75.64], 4: [69.04, 74.66],
  5: [68.08, 73.68], 6: [67.10, 72.70], 7: [66.12, 71.72], 8: [65.13, 70.73], 9: [64.15, 69.75],
  10: [63.16, 68.76], 11: [62.17, 67.77], 12: [61.19, 66.78], 13: [60.21, 65.80], 14: [59.23, 64.81],
  15: [58.26, 63.83], 16: [57.29, 62.85], 17: [56.32, 61.87], 18: [55.36, 60.90], 19: [54.40, 59.92],
  20: [53.45, 58.95], 21: [52.50, 57.98], 22: [51.55, 57.01], 23: [50.60, 56.04], 24: [49.65, 55.07],
  25: [48.71, 54.10], 26: [47.76, 53.13], 27: [46.82, 52.16], 28: [45.88, 51.19], 29: [44.93, 50.23],
  30: [43.99, 49.26], 31: [43.05, 48.30], 32: [42.11, 47.33], 33: [41.17, 46.37], 34: [40.23, 45.41],
  35: [39.30, 44.45], 36: [38.36, 43.49], 37: [37.43, 42.53], 38: [36.50, 41.57], 39: [35.57, 40.61],
  40: [34.64, 39.66], 41: [33.72, 38.71], 42: [32.80, 37.76], 43: [31.88, 36.81], 44: [30.96, 35.86],
  45: [30.05, 34.92], 46: [29.14, 33.98], 47: [28.23, 33.04], 48: [27.33, 32.10], 49: [26.43, 31.17],
  50: [25.54, 30.24], 51: [24.65, 29.31], 52: [23.77, 28.39], 53: [22.89, 27.47], 54: [22.02, 26.56],
  55: [21.15, 25.65], 56: [20.30, 24.74], 57: [19.45, 23.84], 58: [18.60, 22.95], 59: [17.77, 22.06],
  60: [16.94, 21.18], 61: [16.13, 20.31], 62: [15.32, 19.44], 63: [14.53, 18.58], 64: [13.75, 17.73],
  65: [12.98, 16.89], 66: [12.22, 16.06], 67: [11.48, 15.23], 68: [10.76, 14.42], 69: [10.05, 13.62],
  70: [9.36, 12.83], 71: [8.69, 12.06], 72: [8.04, 11.30], 73: [7.42, 10.56], 74: [6.82, 9.84],
  75: [6.24, 9.14], 76: [5.69, 8.46], 77: [5.17, 7.80], 78: [4.68, 7.17], 79: [4.22, 6.56],
  80: [3.79, 5.98], 81: [3.39, 5.43], 82: [3.02, 4.91], 83: [2.69, 4.42], 84: [2.39, 3.96],
  85: [2.12, 3.53], 86: [1.88, 3.14], 87: [1.66, 2.78], 88: [1.47, 2.45], 89: [1.30, 2.15],
  90: [1.15, 1.88]
};

function getTRH2010Expectancy(age, gender) {
  const roundedAge = Math.min(Math.max(Math.floor(age || 0), 0), 90);
  const data = TRH2010_TABLE[roundedAge] || [1.0, 1.5];
  return gender === 'kadin' ? data[1] : data[0];
}

// ===================== İÇTİHAT KÜTÜPHANESİ VERİTABANI =====================
const ICTIHAT_LIBRARY = [
  {
    id: 'zamanasimi_ktk109',
    kategori: 'zamanasimi',
    kategoriAdi: 'Zamanaşımı',
    mahkeme: 'Yargıtay 17. Hukuk Dairesi',
    esasKarar: 'E. 2018/4685, K. 2020/2154',
    tarih: '2020',
    baslik: 'KTK m. 109 uyarınca 2 ve 10 Yıllık Zamanaşımı Süreleri',
    ozet: 'Motorlu araç kazalarından doğan tazminat talepleri, zarar görenin zararı ve tazminat yükümlüsünü öğrendiği tarihten itibaren iki yıl ve her hâlde kaza gününden başlayarak on yıl içinde zamanaşımına uğrar.',
    icerik: '2918 sayılı KTK m. 109/1 uyarınca motorlu araç kazalarından doğan tazminat talepleri 2 yıl ve her halde 10 yılda zamanaşımına uğrar. Zarar görenin zararı ve faili öğrenme tarihi esas alınır.',
    etiketler: ['zamanaşımı', 'ktk 109', '2 yıl', '10 yıl', 'trafik kazası']
  },
  {
    id: 'zamanasimi_uzamis',
    kategori: 'zamanasimi',
    kategoriAdi: 'Zamanaşımı',
    mahkeme: 'Yargıtay Hukuk Genel Kurulu',
    esasKarar: 'E. 2017/17-2710, K. 2021/1045',
    tarih: '2021',
    baslik: 'Uzamış Ceza Zamanaşımının İspat Yükü ve Koşulları',
    ozet: 'Uzamış ceza zamanaşımının uygulanabilmesi için eylemin TCK anlamında suç oluşturduğunun davacı tarafından somut delillerle ispatlanması gerekir. Yalnızca maddi hasarlı kazalarda uzamış zamanaşımı uygulanamaz.',
    icerik: 'KTK m. 109/2 gereğince uzamış ceza zamanaşımının uygulanması için olayda cezayı gerektirir bir fiilin varlığı şarttır. Davacı yaralanma veya ölümü ispat edemediği takdirde uzamış zamanaşımından yararlanamaz.',
    etiketler: ['uzamış ceza zamanaşımı', 'tck 66', 'maddi hasar', 'ispat yükü']
  },
  {
    id: 'aktuerya_trh2010',
    kategori: 'aktuerya',
    kategoriAdi: 'Aktüerya & Tazminat',
    mahkeme: 'Yargıtay 17. Hukuk Dairesi',
    esasKarar: 'E. 2019/5190, K. 2020/6234',
    tarih: '2020',
    baslik: 'TRH-2010 Yaşam Tablosu ve %1.8 Teknik Faiz Uygulaması',
    ozet: 'Tazminat hesaplamasında TRH-2010 (Türkiye Hayat Tablosu) yaşam tablosunun esas alınması, %1,8 teknik faiz oranı uygulanması ve progresif rant yöntemi ile hesaplama yapılması Yargıtay\'ın yerleşik ve bağlayıcı içtihadıdır.',
    icerik: 'Yargıtay yerleşik içtihatları uyarınca bedeni zararlara ilişkin tazminat hesaplarında PMF-1931 tablosu yerine TRH-2010 Yaşam Tablosu esas alınmalı ve %1.8 teknik faiz oranı ile iskonto uygulanmalıdır.',
    etiketler: ['trh-2010', 'teknik faiz', '1.8', 'progresif rant', 'bakiye ömür']
  },
  {
    id: 'aktuerya_sgk_mahsup',
    kategori: 'aktuerya',
    kategoriAdi: 'Aktüerya & Tazminat',
    mahkeme: 'Yargıtay 10. Hukuk Dairesi',
    esasKarar: 'E. 2018/7623, K. 2019/8954',
    tarih: '2019',
    baslik: 'SGK Peşin Sermaye Değerinin Tazminattan Mahsubu Zorunluluğu',
    ozet: 'Sigorta tazminatı hesaplanırken SGK tarafından bağlanan gelirin peşin sermaye değerinin tazminattan düşülmesi zorunludur. Mahsup yapılmadan karar verilmesi bozma nedenidir.',
    icerik: '5510 sayılı Kanun m. 21 ve KTK m. 98 uyarınca kurumca bağlanan rücua tabi peşin sermaye değerli gelirlerin tazminattan düşülmesi mükerrer ödemeyi önlemek bakımından zorunludur.',
    etiketler: ['sgk mahsubu', 'peşin sermaye değeri', 'mükerrer ödeme', 'ktk 98']
  },
  {
    id: 'kusur_muterafik',
    kategori: 'kusur',
    kategoriAdi: 'Kusur & Sorumluluk',
    mahkeme: 'Yargıtay 17. Hukuk Dairesi',
    esasKarar: 'E. 2015/14287, K. 2018/6421',
    tarih: '2018',
    baslik: 'Müterafik Kusur İndirimi (TBK m. 52 - Emniyet Kemeri / Kask)',
    ozet: 'Zarar görenin zararın artmasına veya doğmasına kendi kusuruyla sebep olması (emniyet kemeri takmama, kask kullanmama, aşırı hızlı araca binme) tazminattan %20-%50 oranında müterafik kusur indirimi gerektirir.',
    icerik: 'TBK m. 52 uyarınca müterafik kusur (zarar görenin müterafik kusuru) tazminat miktarından indirim yapılması hakkaniyet gereğidir. Kask veya emniyet kemeri takılmaması zararın ağırlaşmasına yol açtığından indirim uygulanmalıdır.',
    etiketler: ['müterafik kusur', 'tbk 52', 'emniyet kemeri', 'kask', 'indirim']
  },
  {
    id: 'maluliyet_atk',
    kategori: 'maluliyet',
    kategoriAdi: 'Maluliyet & Rapor',
    mahkeme: 'Yargıtay 17. Hukuk Dairesi',
    esasKarar: 'E. 2017/2846, K. 2019/8745',
    tarih: '2019',
    baslik: 'ATK Genel Kurulu Nihai Rapor Zorunluluğu',
    ozet: 'Maluliyet raporları arasında çelişki bulunması halinde Adli Tıp Kurumu Genel Kurulu\'ndan nihai rapor alınmalı, raporun kaza tarihindeki mevzuata uygunluğu denetlenmelidir.',
    icerik: 'Maluliyet oranının tespitinde usulüne uygun sağlık kurulu raporu alınması zorunludur. Üniversite ile ATK raporları çeliştiğinde ATK 3. İhtisas veya ATK Genel Kurulu\'ndan çelişki giderici rapor alınmalıdır.',
    etiketler: ['maluliyet', 'adli tıp kurumu', 'atk', 'çelişki', 'yönetmelik']
  },
  {
    id: 'police_limit',
    kategori: 'police',
    kategoriAdi: 'Poliçe & Teminat',
    mahkeme: 'Yargıtay 17. Hukuk Dairesi',
    esasKarar: 'E. 2020/1542, K. 2021/3678',
    tarih: '2021',
    baslik: 'Sigortacının Sorumluluğunun Poliçe Limiti ile Sınırlılığı',
    ozet: 'Sigortacının sorumluluğu poliçedeki azami teminat limiti ile sınırlıdır. Limiti aşan tutar yönünden sigorta şirketinin sorumluluğu bulunmayıp davanın reddi gerekir.',
    icerik: 'KTK m. 91 ve TTK m. 1484 uyarınca sigortacının tazminat yükümlülüğü poliçede kararlaştırılan azami teminat limiti ile sınırlıdır. Limiti aşan kısım için sigortacıya husumet yöneltilemez.',
    etiketler: ['poliçe limiti', 'azami teminat', 'zmss', 'husumet']
  },
  {
    id: 'arabuluculuk_dava_sarti',
    kategori: 'arabuluculuk',
    kategoriAdi: 'Usul & Arabuluculuk',
    mahkeme: 'Yargıtay 11. Hukuk Dairesi',
    esasKarar: 'E. 2020/1845, K. 2021/2367',
    tarih: '2021',
    baslik: 'Dava Şartı Arabuluculuk Son Tutanağı Eksikliği',
    ozet: 'Ticari davalarda arabuluculuk dava şartı olup, son tutanak dava dilekçesine eklenmediği veya eksik olduğu takdirde davanın usulden reddi gerekir.',
    icerik: '6325 sayılı Kanun m. 18/A ve TTK m. 5/A uyarınca arabuluculuk dava şartıdır. Arabuluculuk sürecine katılınmadan açılan davanın esasına girilemez.',
    etiketler: ['arabuluculuk', 'dava şartı', 'usulden red', 'ttk 5/a']
  }
];


// ===================== STEP NAVIGATION =====================
function goToStep(step) {
  if (step < 1 || step > TOTAL_STEPS) return;
  document.getElementById(`step${currentStep}`).classList.remove('active');
  document.querySelectorAll('.progress-step').forEach(s => {
    const sNum = parseInt(s.dataset.step);
    s.classList.remove('active');
    if (sNum < step) s.classList.add('completed');
    else s.classList.remove('completed');
  });
  currentStep = step;
  document.getElementById(`step${currentStep}`).classList.add('active');
  document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('active');
  const pct = (currentStep / TOTAL_STEPS) * 100;
  document.getElementById('progressFill').style.width = pct + '%';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function nextStep() { if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1); }
function prevStep() { if (currentStep > 1) goToStep(currentStep - 1); }

// ===================== TAB SWITCHING =====================
function switchTab(tabId, btn) {
  btn.closest('.card').querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
  btn.closest('.card').querySelectorAll('.tab-btn').forEach(tb => tb.classList.remove('active'));
  document.getElementById(`tab-${tabId}`).classList.add('active');
  btn.classList.add('active');
}

// ===================== CONDITIONAL FIELDS =====================
function toggleBedeniFields() {
  const hasarTuru = document.getElementById('hasarTuru').value;
  const isBedeni = ['bedeni', 'karma', 'olumlu'].includes(hasarTuru);
  const uyari = document.getElementById('maluliyetBedeniUyari');
  if (isBedeni) uyari.classList.add('hidden');
  else uyari.classList.remove('hidden');
}
function toggleCezaFields() {
  const ceza = document.getElementById('cezaDosyasi').value;
  const group = document.getElementById('cezaSucVasfiGroup');
  if (['sorusturma', 'kovusturma', 'karar'].includes(ceza)) group.classList.remove('hidden');
  else group.classList.add('hidden');
}
function updateKusur() {
  document.getElementById('kusurOraniDisplay').textContent = `%${document.getElementById('kusurOrani').value}`;
  document.getElementById('davaciKusurDisplay').textContent = `%${document.getElementById('davaciKusur').value}`;
}

// ===================== TAZMINAT HESAPLAMALARI =====================
function calculateTotals() {
  const maddiFields = ['aracHasar', 'degerKaybi', 'kazancKaybi', 'cekiciGideri'];
  let toplamMaddi = 0;
  maddiFields.forEach(id => { toplamMaddi += parseFloat(document.getElementById(id)?.value || 0); });
  const bedeniFields = ['geciciTazminat', 'surekliTazminat', 'bakiciGideri', 'tedaviGideri', 'maneviTazminat', 'destekTazminat'];
  let toplamBedeni = 0;
  bedeniFields.forEach(id => { toplamBedeni += parseFloat(document.getElementById(id)?.value || 0); });
  const genelToplam = toplamMaddi + toplamBedeni;
  const mahsup = parseFloat(document.getElementById('oncekiOdeme')?.value || 0);
  document.getElementById('toplamMaddi').textContent = formatCurrency(toplamMaddi);
  document.getElementById('toplamBedeni').textContent = formatCurrency(toplamBedeni);
  document.getElementById('genelToplam').textContent = formatCurrency(genelToplam);
  document.getElementById('mahsupTutar').textContent = formatCurrency(mahsup);
}

// ===================== TRH-2010 AKTÜERYAL HESAPLAMA SİMÜLATÖRÜ =====================
let lastAktueryaResult = null;

function runAktueryaSimulasyonu() {
  const dogum = document.getElementById('davaciDogumTarihi')?.value;
  const kaza = document.getElementById('kazaTarihi')?.value;
  const cinsiyet = document.getElementById('davaciCinsiyet')?.value || 'erkek';
  const maluliyetOrani = parseFloat(document.getElementById('maluliyetOrani')?.value || 0) / 100;
  const kusurOrani = parseFloat(document.getElementById('kusurOrani')?.value || 100) / 100;
  const asgariUcret = parseFloat(document.getElementById('asgariUcret')?.value || 26006);
  const davaciGelir = parseFloat(document.getElementById('davaciGelir')?.value || asgariUcret);
  const teknikFaiz = parseFloat(document.getElementById('teknikFaiz')?.value || 1.8) / 100;
  const aktifBitis = parseInt(document.getElementById('aktifBitis')?.value || 60);
  const sgkMahsup = parseFloat(document.getElementById('sgkMahsupTutar')?.value || 0);
  const oncekiOdeme = parseFloat(document.getElementById('oncekiOdeme')?.value || 0);

  // Yaş Hesaplama
  let ageAtKaza = 30; // varsayılan
  if (dogum && kaza) {
    const dDate = new Date(dogum);
    const kDate = new Date(kaza);
    ageAtKaza = Math.floor((kDate - dDate) / (365.25 * 86400 * 1000));
  } else if (dogum) {
    ageAtKaza = Math.floor((new Date() - new Date(dogum)) / (365.25 * 86400 * 1000));
  }
  if (isNaN(ageAtKaza) || ageAtKaza < 0) ageAtKaza = 30;

  const bakiyeOmur = getTRH2010Expectancy(ageAtKaza, cinsiyet);
  const vefatYasi = ageAtKaza + bakiyeOmur;
  const aktifYil = Math.max(0, Math.min(aktifBitis, vefatYasi) - ageAtKaza);
  const pasifYil = Math.max(0, vefatYasi - Math.max(ageAtKaza, aktifBitis));
  const toplamYil = Math.ceil(bakiyeOmur);

  let toplamAktifNet = 0;
  let toplamPasifNet = 0;
  let toplamBrut = 0;
  let rowsHtml = '';

  for (let n = 1; n <= toplamYil; n++) {
    const currentAge = ageAtKaza + n;
    const isAktif = currentAge <= aktifBitis;
    const aylikGelir = isAktif ? davaciGelir : asgariUcret;
    const yillikBrut = aylikGelir * 12;
    const iskontoCarpan = 1 / Math.pow(1 + teknikFaiz, n);
    const yillikIskontolu = yillikBrut * iskontoCarpan;
    const netYilTazminat = yillikIskontolu * maluliyetOrani * kusurOrani;

    toplamBrut += yillikIskontolu;
    if (isAktif) toplamAktifNet += netYilTazminat;
    else toplamPasifNet += netYilTazminat;

    if (n <= 15 || n === toplamYil) {
      rowsHtml += `<tr>
        <td>${n}. Yıl (${currentAge} yaş)</td>
        <td><span class="badge ${isAktif ? 'badge-primary' : 'badge-warning'}">${isAktif ? 'Aktif' : 'Pasif'}</span></td>
        <td>${formatCurrency(aylikGelir)}</td>
        <td>%${(iskontoCarpan * 100).toFixed(2)}</td>
        <td>${formatCurrency(yillikBrut)}</td>
        <td><strong>${formatCurrency(netYilTazminat)}</strong></td>
      </tr>`;
    } else if (n === 16) {
      rowsHtml += `<tr><td colspan="6" style="text-align:center; color:#888; font-style:italic;">… Ara Yıllar Hesaplandı (${toplamYil - 16} yıl daha) …</td></tr>`;
    }
  }

  const araToplamNet = toplamAktifNet + toplamPasifNet;
  const netSorumluluk = Math.max(0, araToplamNet - sgkMahsup - oncekiOdeme);

  lastAktueryaResult = {
    ageAtKaza, bakiyeOmur, vefatYasi, aktifYil, pasifYil,
    toplamAktifNet, toplamPasifNet, araToplamNet, sgkMahsup, oncekiOdeme, netSorumluluk
  };

  const html = `
    <div class="aktuerya-summary-grid mt-md">
      <div class="aktuerya-card">
        <span class="aktuerya-card-title">TRH-2010 Bakiye Ömür</span>
        <span class="aktuerya-card-value">${bakiyeOmur.toFixed(2)} Yıl</span>
        <span class="aktuerya-card-sub">Kaza Yaşı: ${ageAtKaza} | Muhtemel Ömür: ${vefatYasi.toFixed(1)}</span>
      </div>
      <div class="aktuerya-card">
        <span class="aktuerya-card-title">Aktif Dönem Tazminatı</span>
        <span class="aktuerya-card-value">${formatCurrency(toplamAktifNet)}</span>
        <span class="aktuerya-card-sub">Süre: ${aktifYil.toFixed(1)} Yıl (Emeklilik: ${aktifBitis} yaş)</span>
      </div>
      <div class="aktuerya-card">
        <span class="aktuerya-card-title">Pasif Dönem Tazminatı</span>
        <span class="aktuerya-card-value">${formatCurrency(toplamPasifNet)}</span>
        <span class="aktuerya-card-sub">Süre: ${pasifYil.toFixed(1)} Yıl (Asgari Ücret)</span>
      </div>
      <div class="aktuerya-card highlight">
        <span class="aktuerya-card-title">Net Sigorta Sorumluluğu</span>
        <span class="aktuerya-card-value text-gold">${formatCurrency(netSorumluluk)}</span>
        <span class="aktuerya-card-sub">Kusur: %${kusurOrani*100} | Maluliyet: %${maluliyetOrani*100}</span>
      </div>
    </div>

    <div class="table-responsive mt-md">
      <table class="aktuerya-table">
        <thead>
          <tr>
            <th>Yıl / Yaş</th>
            <th>Dönem</th>
            <th>Aylık Gelir</th>
            <th>İskonto Çarpanı (%1.8)</th>
            <th>Yıllık Brüt</th>
            <th>Net Tazminat (Kusur & Maluliyet)</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>

    <div class="report-summary-box mt-md">
      <div class="report-field"><span class="report-field-label">Aktif + Pasif Tazminat Toplamı:</span><span class="report-field-value">${formatCurrency(araToplamNet)}</span></div>
      ${sgkMahsup > 0 ? `<div class="report-field"><span class="report-field-label">SGK Peşin Sermaye Değeri Mahsubu:</span><span class="report-field-value text-danger">-${formatCurrency(sgkMahsup)}</span></div>` : ''}
      ${oncekiOdeme > 0 ? `<div class="report-field"><span class="report-field-label">Önceki Sigorta Ödemesi Mahsubu:</span><span class="report-field-value text-danger">-${formatCurrency(oncekiOdeme)}</span></div>` : ''}
      <div class="report-total"><span>HESAPLANAN NİHAİ TAZMİNAT:</span><span class="text-gold">${formatCurrency(netSorumluluk)}</span></div>
    </div>

    <div class="mt-md flex gap-md">
      <button class="btn btn-primary" onclick="applyAktueryaResultToTazminat()">Bu Tutarı Sürekli İş Göremezlik Tazminatına Aktar</button>
    </div>
  `;

  const outputEl = document.getElementById('aktueryaSimulasyonOutput');
  if (outputEl) {
    outputEl.innerHTML = html;
    outputEl.classList.remove('hidden');
  }
  showToast('TRH-2010 Aktüeryal cetveli hesaplandı.', 'success');
}

function applyAktueryaResultToTazminat() {
  if (!lastAktueryaResult) return;
  const inputEl = document.getElementById('surekliTazminat');
  if (inputEl) {
    inputEl.value = lastAktueryaResult.netSorumluluk.toFixed(2);
    calculateTotals();
    showToast(`Sürekli İş Göremezlik Tazminatı ${formatCurrency(lastAktueryaResult.netSorumluluk)} olarak güncellendi.`, 'success');
  }
}

// ===================== İÇTİHAT KÜTÜPHANESİ İŞLEMLERİ =====================
let currentIctihatCategory = 'tumu';

function openIctihatModal() {
  const modal = document.getElementById('ictihatModal');
  if (modal) {
    modal.classList.add('active');
    renderIctihatCards();
  }
}

function closeIctihatModal() {
  const modal = document.getElementById('ictihatModal');
  if (modal) modal.classList.remove('active');
}

function filterIctihatLibrary(category) {
  currentIctihatCategory = category;
  document.querySelectorAll('.ictihat-cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === category);
  });
  renderIctihatCards();
}

function renderIctihatCards() {
  const container = document.getElementById('ictihatListContainer');
  if (!container) return;
  const search = (document.getElementById('ictihatSearchInput')?.value || '').toLowerCase().trim();

  const filtered = ICTIHAT_LIBRARY.filter(item => {
    const matchCat = currentIctihatCategory === 'tumu' || item.kategori === currentIctihatCategory;
    const matchSearch = !search || 
      item.baslik.toLowerCase().includes(search) || 
      item.ozet.toLowerCase().includes(search) || 
      item.esasKarar.toLowerCase().includes(search) || 
      item.etiketler.some(t => t.toLowerCase().includes(search));
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div class="alert alert-info">Arama kriterlerine uygun emsal karar bulunamadı.</div>';
    return;
  }

  let html = '';
  filtered.forEach(item => {
    html += `
      <div class="ictihat-card">
        <div class="ictihat-card-header">
          <div>
            <span class="badge badge-gold">${item.kategoriAdi}</span>
            <span class="ictihat-mahkeme">${item.mahkeme} — ${item.esasKarar} (${item.tarih})</span>
          </div>
          <button class="btn btn-sm btn-primary" onclick="addIctihatToPetition('${item.id}')">Dilekçeye Ekle</button>
        </div>
        <div class="ictihat-card-title">${item.baslik}</div>
        <div class="ictihat-card-ozet">${item.ozet}</div>
        <div class="ictihat-card-tags">
          ${item.etiketler.map(tag => `<span class="ictihat-tag">#${tag}</span>`).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function addIctihatToPetition(ictihatId) {
  const item = ICTIHAT_LIBRARY.find(i => i.id === ictihatId);
  if (!item) return;

  const addition = `\n\n<p><strong>Yargıtay Emsal Kararı (${item.mahkeme} ${item.esasKarar}):</strong><br><em>"${item.ozet}"</em><br>${item.icerik}</p>`;

  const petitionOutput = document.getElementById('petitionOutput');
  const objectionOutput = document.getElementById('objectionOutput');

  if (petitionOutput && petitionOutput.innerHTML) {
    petitionOutput.innerHTML += addition;
  }
  if (objectionOutput && objectionOutput.innerHTML) {
    objectionOutput.innerHTML += addition;
  }

  showToast(`"${item.baslik}" emsal kararı dilekçeye eklendi.`, 'success');
  closeIctihatModal();
}



// ===================== ZAMANASIMI ANALİZİ =====================
function analyzeZamanAsimi() {
  const kazaTarihi = document.getElementById('kazaTarihi').value;
  const davaTarihi = document.getElementById('davaTarihi').value;
  if (!kazaTarihi || !davaTarihi) return;
  const kaza = new Date(kazaTarihi);
  const dava = new Date(davaTarihi);
  const farkGun = Math.floor((dava - kaza) / (1000 * 60 * 60 * 24));
  const farkYil = farkGun / 365.25;
  const cezaDosyasi = document.getElementById('cezaDosyasi').value;
  const sucVasfi = document.getElementById('sucVasfi').value;
  const hasarTuru = document.getElementById('hasarTuru').value;
  let sonuc = '';
  let cls = 'alert-info';
  if (farkYil > 10) {
    sonuc = `<strong>KRİTİK:</strong> Kaza tarihi ile dava tarihi arasında <strong>${farkYil.toFixed(1)} yıl</strong> geçmiş. KTK m. 109/1 uyarınca 10 yıllık üst sınır dolmuş olabilir. Zamanaşımı def'i çok güçlüdür.`;
    cls = 'alert-success';
  } else if (farkYil > 6) {
    sonuc = `Kaza ile dava arasında <strong>${farkYil.toFixed(1)} yıl</strong>. TTK m. 1420 uyarınca 6 yıllık mutlak süre dolmuş olabilir. KTK m. 109 uyarınca 10 yıllık süre devam etmektedir.`;
    cls = 'alert-warning';
  } else if (farkYil > 2) {
    sonuc = `Kaza ile dava arasında <strong>${farkYil.toFixed(1)} yıl</strong>. 2 yıllık kısa zamanaşımı dolmuş olabilir; öğrenme tarihi ve kesen işlemler incelenmelidir.`;
    cls = 'alert-warning';
  } else {
    sonuc = `Kaza ile dava arasında <strong>${farkYil.toFixed(1)} yıl</strong>. Kısa zamanaşımı dolmamış görünmektedir. "Her ihtimale binaen" ileri sürülecektir.`;
    cls = 'alert-info';
  }
  if (['sorusturma', 'kovusturma', 'karar'].includes(cezaDosyasi)) {
    let cezaSuresi = sucVasfi?.includes('oldurme') ? '15 yıl' : '8 yıl';
    sonuc += `<br><br><strong>Uzamış Ceza Zamanaşımı Riski:</strong> KTK m. 109/2 uyarınca TCK m. 66 kapsamında <strong>${cezaSuresi}</strong> ceza zamanaşımı uygulanabilir.`;
  }
  if (cezaDosyasi === 'kyok') sonuc += `<br><br><strong>KYOK:</strong> Uzamış zamanaşımı iddiası zayıflamıştır.`;
  if (hasarTuru === 'maddi') sonuc += `<br><br>Yalnızca maddi hasarlı dosya — uzamış ceza zamanaşımı iddiasına karşı güçlü konumdayız.`;
  const el = document.getElementById('zamanAsimiAnaliz');
  el.classList.remove('hidden', 'alert-info', 'alert-warning', 'alert-success', 'alert-danger');
  el.classList.add(cls);
  document.getElementById('zamanAsimiSonuc').innerHTML = sonuc;
}

// ===================== CEVAP DİLEKÇESİ — İÇTİHAT DESTEKLİ =====================
function generatePetition() {
  const d = getFormData();
  let p = '';

  p += `<h3>${d.mahkeme ? d.mahkeme.toUpperCase() : '… ASLIYE TİCARET MAHKEMESİ'} SAYIN HÂKİMLİĞİ'NE</h3>\n\n`;
  p += `<p><strong>Dosya No:</strong> ${d.esasNo || '…/… E.'}<br><strong>Davalı:</strong> ${d.sigortaSirketi || '… Sigorta A.Ş.'}<br><strong>Vekili:</strong> ${d.davaliVekil || 'Av. …'} (Adres bildirimi ektedir.)<br><strong>Davacı:</strong> ${d.davaciAd || '…'}<br><strong>Vekili:</strong> ${d.davaciVekil || 'Av. …'}<br><strong>Konu:</strong> Davaya karşı cevap dilekçemizin sunulmasından ibarettir.<br><strong>Açıklamalar:</strong></p>\n\n`;

  p += `<p>Sayın Mahkemenize yukarıda esas numarası yazılı dosyada, davacı vekilinin müvekkil şirket aleyhine açmış olduğu haksız ve mesnetsiz davaya karşı, süresi içinde cevaplarımızı aşağıda arz ve izah ediyoruz. Öncelikle usuli itirazlarımızı, akabinde esasa ilişkin savunmalarımızı sunmaktayız. Sair tüm savunma ve itiraz haklarımız saklıdır.</p>\n\n`;

  // ═══════════════ USULİ SAVUNMALAR ═══════════════
  p += `<h3>I. USULİ SAVUNMALARIMIZ</h3>\n\n`;

  // ──── ZAMANASIMI ────
  if (document.getElementById('sZamanasimi').checked) {
    const z = ICTIHAT;
    p += `<h3>A. ZAMANAŞIMI DEF'İ</h3>\n`;
    p += `<p><strong>Hukuki Dayanak:</strong> ${z.zamanasimi_defi.kuralKaynagi}</p>\n`;
    p += `<p>Zamanaşımı, borcu sona erdiren bir def'i olup hâkim tarafından re'sen gözetilemez (TBK m. 161). Def'in süresinde ileri sürülmemesi halinde savunmanın genişletilmesi yasağı (HMK m. 141) devreye girer ve bu savunma kural olarak kaybedilir. Bu nedenle zamanaşımı def'imizi süresinde ve açıkça ileri sürmekteyiz.</p>\n`;

    if (d.policeTuru === 'zmss' || d.policeTuru === 'imm') {
      p += `<p>2918 sayılı Karayolları Trafik Kanunu'nun 109. maddesinin 1. fıkrası uyarınca, motorlu araç kazalarından doğan tazminat talepleri, zarar görenin zararı ve tazminat yükümlüsünü öğrendiği tarihten itibaren <strong>iki yıl</strong> ve her hâlde kaza gününden başlayarak <strong>on yıl</strong> içinde zamanaşımına uğrar. Buna ek olarak, 6102 sayılı Türk Ticaret Kanunu'nun 1420. maddesinin 1. fıkrası uyarınca, sigorta sözleşmesinden doğan bütün istemler, alacağın muaccel olduğu tarihten başlayarak <strong>iki yıl</strong>da zamanaşımına uğrar; sigorta tazminatı ve sigorta bedeli alacakları ise her hâlde rizikonun gerçekleştiği tarihten itibaren <strong>altı yıl</strong>da zamanaşımına uğrar.</p>\n`;
      p += `<p><strong>Yargıtay Uygulaması:</strong> "${z.zamanasimi_ktk109.ictihat}" sayılı kararında; <em>"${z.zamanasimi_ktk109.ozet}"</em> şeklinde hüküm tesis edilmiştir.</p>\n`;
    } else {
      p += `<p>6102 sayılı TTK'nın 1420/1. maddesi uyarınca sigorta sözleşmesinden doğan tüm talepler, alacağın muaccel olduğu tarihten itibaren <strong>iki yıl</strong>da; sigorta tazminatı alacakları ise her hâlde rizikonun gerçekleştiği tarihten itibaren <strong>altı yıl</strong>da zamanaşımına uğrar.</p>\n`;
      p += `<p><strong>Yargıtay Uygulaması:</strong> "${z.zamanasimi_ttk1420.ictihat}" sayılı kararında bu sürelerin kesin nitelikte olduğu ve sigorta tazminatı alacaklarında altı yıllık mutlak sürenin uygulanacağı açıkça hüküm altına alınmıştır.</p>\n`;
    }

    p += `<p><strong>Somut Olaya Uygulanması:</strong> Dava konusu riziko/kaza tarihi <strong>${formatDate(d.kazaTarihi) || '…'}</strong> olup huzurdaki dava <strong>${formatDate(d.davaTarihi) || '…'}</strong> tarihinde açılmıştır. Davacı taraf, zararı ve tazmin yükümlüsünü en geç <strong>${formatDate(d.ktk97Tarihi) || 'müvekkil şirkete başvuru tarihi'}</strong> itibarıyla öğrenmiştir. Bu durumda iki yıllık kısa zamanaşımı süresi dava tarihinden önce dolmuştur. Davacı tarafça zamanaşımını kesen veya durduran herhangi bir sebep ispat edilmedikçe, davanın <strong>zamanaşımı nedeniyle reddi</strong> gerekmektedir.</p>\n`;

    // Agresif varyant — uzamış ceza zamanaşımı çürütmesi
    const variant = d.dilekceVariant || 'temkinli';
    if (variant === 'agresif' || d.cezaDosyasi === 'kyok' || d.hasarTuru === 'maddi') {
      p += `<p><strong>Uzamış Ceza Zamanaşımına İtiraz:</strong> Davacı tarafın KTK m. 109/2'ye dayalı olarak ileri sürebileceği uzamış ceza zamanaşımı iddiasına da peşinen itiraz ediyoruz. ${z.zamanasimi_uzamis_ispat.ictihat} sayılı kararında Yargıtay; <em>"${z.zamanasimi_uzamis_ispat.ozet}"</em> şeklinde hüküm kurmuştur. Somut olayda ${d.cezaDosyasi === 'kyok' ? 'Cumhuriyet Başsavcılığı tarafından kovuşturmaya yer olmadığına dair karar (KYOK) verilmiş olup suç vasfı oluşmamıştır' : d.hasarTuru === 'maddi' ? 'yalnızca maddi hasar meydana gelmiş olup TCK anlamında yaralama veya öldürme suçu oluşmamıştır' : 'suç vasfının somut olayda oluştuğunun ispat yükü davacıya ait olup bu husus henüz ortaya konulamamıştır'}. Bu nedenle uzamış ceza zamanaşımı süresi değil, KTK m. 109/1'deki iki yıllık genel zamanaşımı süresi uygulanmalıdır.</p>\n`;
    }

    p += `<p>Her ihtimale binaen ve sair tüm savunma haklarımız saklı kalmak kaydıyla zamanaşımı def'imizi süresinde ileri sürüyoruz.</p>\n\n`;
  }

  // ──── ARABULUCULUK ────
  if (document.getElementById('sArabuluculuk').checked) {
    const a = ICTIHAT.arabuluculuk;
    p += `<h3>B. DAVA ŞARTI ARABULUCULUK EKSİKLİĞİ</h3>\n`;
    p += `<p><strong>Hukuki Dayanak:</strong> ${a.kuralKaynagi}</p>\n`;
    p += `<p>6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu'nun 18/A maddesi ve Türk Ticaret Kanunu'nun 5/A maddesi uyarınca, konusu bir miktar paranın ödenmesi olan alacak ve tazminat taleplerinde dava açılmadan önce arabulucuya başvurulmuş olması zorunlu dava şartıdır. ${a.ictihat} sayılı kararında Yargıtay; <em>"${a.ozet}"</em> şeklinde hüküm kurmuştur.</p>\n`;
    p += `<p>Davacı tarafın arabuluculuk son tutanağını dosyaya sunup sunmadığının, arabuluculuk sürecinin usulüne uygun tamamlanıp tamamlanmadığının Sayın Mahkemece re'sen denetlenmesini talep ederiz. Dava şartı noksanlığının tespiti halinde HMK m. 115/2 uyarınca davanın usulden reddi gerekmektedir.</p>\n\n`;
  }

  // ──── HUSUMET ────
  if (document.getElementById('sHusumet').checked) {
    p += `<h3>C. HUSUMET İTİRAZI</h3>\n`;
    p += `<p><strong>Hukuki Dayanak:</strong> HMK m. 114/1-d; TTK m. 1473; KTK m. 91-95</p>\n`;
    p += `<p>Müvekkil sigorta şirketinin, davacı tarafın ileri sürdüğü zarar kalemlerinin tamamı yönünden taraf sıfatının (pasif husumet ehliyetinin) bulunup bulunmadığının titizlikle incelenmesini talep ederiz. Sigortacının sorumluluğu poliçe kapsamı, teminat limiti ve sigorta sözleşmesinin genel/özel şartları ile sınırlıdır. Teminat kapsamı dışında kalan talepler yönünden müvekkil şirkete husumet yöneltilemeyeceğini, bu kalemlerin zarar veren ve/veya araç işleteni aleyhine ileri sürülmesi gerektiğini beyan ederiz.</p>\n\n`;
  }

  // ──── DAVA DEĞERİ / BELİRSİZ ALACAK ────
  if (document.getElementById('sDavaDegeri').checked) {
    const b = ICTIHAT.belirsiz_alacak;
    p += `<h3>D. DAVA DEĞERİ VE BELİRSİZ ALACAK NİTELENDİRMESİNE İTİRAZ</h3>\n`;
    p += `<p><strong>Hukuki Dayanak:</strong> ${b.kuralKaynagi}</p>\n`;
    if (d.davaNiteligi === 'belirsiz') {
      p += `<p>Davacı vekili huzurdaki davayı HMK m. 107 kapsamında belirsiz alacak davası olarak açmıştır. Ancak belirsiz alacak davası açılabilmesi için alacağın miktarını ya da değerini tam ve kesin olarak belirleyebilmesinin davacıdan beklenememesi gerekir. Yargıtay HGK'nın ${b.ictihat} sayılı kararında; <em>"${b.ozet}"</em> şeklinde hüküm kurulmuştur.</p>\n`;
      p += `<p>Somut olayda davacı taraf, uğradığını iddia ettiği zararın miktarını dava açmadan önce tespit edebilecek durumdadır. Kaza raporu, onarım faturaları ve tedavi belgeleri davacının elinde bulunmaktadır. Bu durumda davanın gerçekte <strong>kısmi dava</strong> niteliğinde olduğunu, HMK m. 107 koşullarının oluşmadığını ileri sürüyoruz. Nitelendirmenin kısmi dava olarak değiştirilmesi halinde, ${ICTIHAT.zamanasimi_islah.ictihat} sayılı kararda vurgulandığı üzere, ıslahla artırılacak kısım yönünden zamanaşımı def'imizi ayrıca ileri süreceğimizi ve saklı tuttuğumuzu beyan ederiz.</p>\n\n`;
    } else {
      p += `<p>Huzurdaki davanın kısmi dava olarak açıldığını tespit ediyoruz. Yargıtay 17. HD'nin ${ICTIHAT.zamanasimi_islah.ictihat} sayılı kararında belirtildiği üzere, <em>"${ICTIHAT.zamanasimi_islah.ozet}"</em> İleride yapılacak ıslahla artırılacak kısım yönünden tüm savunma haklarımızı ve özellikle zamanaşımı def'imizi saklı tuttuğumuzu beyan ederiz.</p>\n\n`;
    }
  }

  // ──── YETKİ ────
  if (document.getElementById('sYetki').checked) {
    p += `<h3>E. YETKİ İTİRAZI</h3>\n`;
    p += `<p><strong>Hukuki Dayanak:</strong> HMK m. 6, m. 7; KTK m. 110</p>\n`;
    p += `<p>HMK m. 6 uyarınca genel yetkili mahkeme davalının yerleşim yeri mahkemesidir. KTK m. 110 uyarınca kazanın meydana geldiği yer mahkemesi de yetkili olmakla birlikte, bu yetki kesin yetki niteliğinde değildir. Sayın Mahkemenin yetkisine ilişkin itirazlarımızı saklı tutmaktayız.</p>\n\n`;
  }

  // ═══════════════ ESASA İLİŞKİN SAVUNMALAR ═══════════════
  p += `<h3>II. ESASA İLİŞKİN SAVUNMALARIMIZ</h3>\n\n`;

  // ──── KUSUR ────
  if (document.getElementById('sKusur').checked) {
    const k = ICTIHAT.kusur_muterafik;
    p += `<h3>A. KUSUR İTİRAZI VE MÜTERAFİK KUSUR</h3>\n`;
    p += `<p><strong>Hukuki Dayanak:</strong> ${k.kuralKaynagi}; ${ICTIHAT.kusur_ktt.kuralKaynagi}</p>\n`;
    p += `<p>Dava konusu kazanın oluşumunda davacı tarafın da hatası ve kusuru bulunmaktadır. TBK m. 52 uyarınca zarar görenin kusurunun zararın doğumuna ya da artmasına etki ettiği hallerde hâkim, tazminatı indirebilir veya tamamen kaldırabilir. Yargıtay 17. HD'nin ${k.ictihat} sayılı kararında; <em>"${k.ozet}"</em> şeklinde hüküm kurulmuştur.</p>\n`;

    p += `<p>Kaza tespit tutanağı ve ceza dosyasının birlikte değerlendirilmesi neticesinde, sigortalımızın kusur oranının <strong>%${d.kusurOrani || '…'}</strong>'den fazla olmadığı, davacı tarafın müterafik kusurunun ise en az <strong>%${d.davaciKusur || '…'}</strong> oranında olduğu kanaatindeyiz. ${ICTIHAT.kusur_ktt.ictihat} sayılı kararda da vurgulandığı üzere, kaza tespit tutanağı kesin delil niteliğinde olmayıp aksinin her türlü delille ispatı mümkündür.</p>\n`;

    // Kusur itiraz noktaları
    const kusurItirazlar = [];
    if (document.getElementById('kttHata').checked) kusurItirazlar.push('Kaza Tespit Tutanağı\'nda usul ve esasa ilişkin hatalar bulunmakta olup tutanaktaki kusur dağılımı gerçeği yansıtmamaktadır. KTT\'nin tutulma şekli ve içeriği Yönetmelik hükümlerine aykırıdır');
    if (document.getElementById('tanikTutarsiz').checked) kusurItirazlar.push('Dosyadaki tanık beyanları birbiriyle çelişmekte olup tanık anlatımlarının yeniden değerlendirilmesi gerekmektedir');
    if (document.getElementById('kameraKaydi').checked) kusurItirazlar.push('MOBESE / güvenlik kamera kaydı mevcut olup bu kayıtların incelenmesi neticesinde gerçek kusur dağılımının ortaya çıkacağı kanaatindeyiz');
    if (document.getElementById('alkol').checked) kusurItirazlar.push('Davacıda alkol ve/veya uyuşturucu madde tespit edilmiş olup bu durum TBK m. 52 kapsamında müterafik kusur oranını önemli ölçüde artırmaktadır. Alkollü araç kullanımı ayrıca ZMSS Genel Şartları kapsamında teminat dışı kalma ve rücu sebebidir');
    if (document.getElementById('ehliyetsiz').checked) kusurItirazlar.push('Davacı sürücünün geçerli sürücü belgesi bulunmamakta veya ehliyet sınıfı kullandığı araç türüne uygun değildir. Bu durum hem kusur oranını artırıcı hem de teminat kapsamını daraltıcı niteliktedir');
    if (document.getElementById('emniyet').checked) kusurItirazlar.push('Davacının olay anında emniyet kemeri takmadığı tespit edilmiştir. Yargıtay\'ın yerleşik uygulamasına göre emniyet kemeri takılmaması müterafik kusur kapsamında değerlendirilmekte ve tazminattan %20 ile %30 arasında indirim yapılmaktadır (Yargıtay 17. HD 2015/14287 E.)');
    if (document.getElementById('hizIhlali').checked) kusurItirazlar.push('Kazanın oluşumunda hız ihlalinin etkili olduğu tespit edilmiş olup kusur dağılımının buna göre yeniden değerlendirilmesi gerekmektedir');

    if (kusurItirazlar.length > 0) {
      p += `<p>Özellikle şu hususlar Sayın Mahkemece dikkatle incelenmelidir:</p>\n<p>`;
      kusurItirazlar.forEach((item, i) => { p += `<strong>${i + 1}.</strong> ${item}.\n\n`; });
      p += `</p>\n`;
    }
    if (d.kusurNotlari) p += `<p><strong>Ek Değerlendirme:</strong> ${d.kusurNotlari}</p>\n`;
    p += `<p>Yukarıda belirtilen nedenlerle, kusur oranlarının uzman bilirkişi heyetince yeniden incelenmesini ve davacının müterafik kusurunun tazminattan TBK m. 52 uyarınca tenzilini talep ederiz.</p>\n\n`;
  }

  // ──── TEMİNAT DIŞILIK ────
  if (document.getElementById('sTeminat').checked) {
    const t = ICTIHAT.teminat_disi;
    p += `<h3>B. TEMİNAT DIŞILIK SAVUNMASI</h3>\n`;
    p += `<p><strong>Hukuki Dayanak:</strong> ${t.kuralKaynagi}</p>\n`;
    p += `<p>Poliçenin genel şartları ve özel şartları birlikte değerlendirildiğinde, davacının talep ettiği zarar kalemlerinin tamamının veya bir kısmının teminat kapsamında olmadığı görülmektedir. ${t.ictihat} sayılı Yargıtay kararında; <em>"${t.ozet}"</em> şeklinde hüküm kurulmuştur. Teminat kapsamı dışında kalan talepler yönünden müvekkil sigorta şirketinin herhangi bir sorumluluğu bulunmamaktadır. Bu kalemlerin doğrudan zarar verene ve/veya araç işletenine yöneltilmesi gerekmektedir.</p>\n\n`;
  }

  // ──── POLİÇE LİMİTİ ────
  if (document.getElementById('sPoliceLimit').checked) {
    const pl = ICTIHAT.police_limit;
    p += `<h3>C. POLİÇE LİMİTİ İLE SINIRLI SORUMLULUK</h3>\n`;
    p += `<p><strong>Hukuki Dayanak:</strong> ${pl.kuralKaynagi}</p>\n`;
    p += `<p>TTK m. 1484 ve poliçe özel şartları uyarınca, müvekkil sigorta şirketinin sorumluluğu poliçede yazılı teminat limiti ile sınırlıdır. Poliçe teminat limiti <strong>${d.policeLimiti ? formatCurrency(parseFloat(d.policeLimiti)) : '…'}</strong> olup bu limiti aşan talepler yönünden müvekkil şirkete husumet yöneltilemez. ${pl.ictihat} sayılı Yargıtay kararında; <em>"${pl.ozet}"</em> şeklinde hüküm kurulmuştur. Limit üstü kalan kısmın zarar verenden ve/veya araç işleteninden talep edilmesi gerekmektedir.</p>\n\n`;
  }

  // ──── ÖNCEKİ ÖDEME ────
  if (document.getElementById('sOncekiOdeme').checked && parseFloat(d.oncekiOdeme) > 0) {
    const o = ICTIHAT.onceki_odeme;
    p += `<h3>D. ÖNCEKİ ÖDEME MAHSUBU</h3>\n`;
    p += `<p><strong>Hukuki Dayanak:</strong> ${o.kuralKaynagi}</p>\n`;
    p += `<p>Müvekkil sigorta şirketi tarafından <strong>${formatDate(d.odemeTarihi) || '…'}</strong> tarihinde davacıya/zarar görene <strong>${formatCurrency(parseFloat(d.oncekiOdeme))}</strong> tutarında hasar ödemesi yapılmıştır. ${o.ictihat} sayılı Yargıtay kararında; <em>"${o.ozet}"</em> şeklinde hüküm kurulmuştur. Yapılan bu ödemenin, hükmedilecek tazminattan TBK m. 100 çerçevesinde mahsup edilmesini talep ederiz.</p>\n\n`;
  }

  // ──── MALULİYET ────
  if (document.getElementById('sMaluliyet').checked && ['bedeni', 'karma', 'olumlu'].includes(d.hasarTuru)) {
    const m = ICTIHAT.maluliyet_atk;
    const mi = ICTIHAT.maluliyet_illiyet;
    p += `<h3>E. MALULİYET ORANINA İTİRAZ VE ADLİ TIP KURUMU SEVK TALEBİ</h3>\n`;
    p += `<p><strong>Hukuki Dayanak:</strong> ${m.kuralKaynagi}</p>\n`;
    p += `<p>Davacıya biçilen <strong>%${d.maluliyetOrani || '…'}</strong> oranındaki maluliyet, somut tıbbi bulgularla örtüşmemekte olup fahiştir. ${m.ictihat} sayılı Yargıtay kararında; <em>"${m.ozet}"</em> şeklinde hüküm kurulmuştur.</p>\n`;

    const malItirazlar = [];
    if (document.getElementById('mOranYuksek').checked) malItirazlar.push('Belirlenen maluliyet oranı, yaralanmanın niteliği ve ağırlığı ile orantısız biçimde yüksek tespit edilmiştir. Oranın düşürülmesini talep ediyoruz');
    if (document.getElementById('mYonetmelikHata').checked) malItirazlar.push('Maluliyet tespitinde uygulanan yönetmelik/kriter hatalıdır. Çalışma Gücü ve Meslekte Kazanma Gücü Kaybı Oranı Tespit İşlemleri Yönetmeliği hükümleri esas alınmalıdır');
    if (document.getElementById('mIlliyetBag').checked) malItirazlar.push(`İlliyet bağı sorunu mevcuttur. ${mi.ictihat} sayılı kararda vurgulandığı üzere, davacının kaza öncesinden mevcut rahatsızlıkları bulunmakta olup maluliyetin tamamının kazaya bağlanması hukuka aykırıdır. Oransal illiyet değerlendirmesi yapılmalıdır`);
    if (document.getElementById('mATKSevk').checked) malItirazlar.push('Maluliyet tespitinin Adli Tıp Kurumu (ATK) Başkanlığı tarafından yapılmasını, raporlar arası çelişki halinde ATK Genel Kurulu\'ndan nihai rapor alınmasını talep ediyoruz');
    if (document.getElementById('mTedaviTamamlanmadi').checked) malItirazlar.push('Davacının tedavi süreci henüz tamamlanmadan maluliyet oranı belirlenmiştir. Tedavi tamamlandıktan sonra nihai maluliyet tespiti yapılmalıdır');

    if (malItirazlar.length > 0) {
      p += `<p>Şöyle ki:</p>\n<p>`;
      malItirazlar.forEach((item, i) => { p += `<strong>${i + 1}.</strong> ${item}.\n\n`; });
      p += `</p>\n`;
    }
    p += '\n';
  }


  // ──── KASKO & BRANŞ ÖZEL SAVUNMALARI ────
  if (d.policeTuru === 'kasko') {
    p += `<h3>KASKO POLİÇESİ ÖZEL DEF'İ VE İTİRAZLARIMIZ</h3>\n`;
    if (document.getElementById('kEksikSigorta')?.checked) {
      p += `<p><strong>1. Eksik Sigorta İndirimi (TTK m. 1461):</strong> Poliçede kayıtlı sigorta bedeli, kaza tarihindeki araç emsal piyasa değerinden düşüktür. TTK m. 1461 uyarınca, sigorta bedeli ile sigorta değeri arasındaki orantı kurulmak suretiyle tazminat miktarından orantılı indirim yapılması yasal zorunluluktur.</p>\n`;
    }
    if (document.getElementById('kBeyanIhlali')?.checked) {
      p += `<p><strong>2. Beyan Yükümlülüğü İhlali (TTK m. 1435):</strong> Sigortalı kaza öncesinde veya ihbar esnasında eksik/yanlış beyanda bulunmuştur. TTK m. 1435 gereğince tazminattan indirim veya fesih hakkımız saklıdır.</p>\n`;
    }
    const sovtaj = parseFloat(document.getElementById('sovtajBedeli')?.value || 0);
    if (sovtaj > 0) {
      p += `<p><strong>3. Sovtaj (Hurda) Bedeli Mahsubu:</strong> Pert-total olarak nitelendirilen araçta, davacı sigortalıda kalan sovtaj (hurda) bedeli olan <strong>${formatCurrency(sovtaj)}</strong> tutarının toplam tazminattan mahsubu zorunludur.</p>\n`;
    }
    const tenzili = parseFloat(document.getElementById('tenziliMuafiyet')?.value || 0);
    if (tenzili > 0) {
      p += `<p><strong>4. Tenzili Muafiyet İndirimi:</strong> Kasko poliçesi özel şartları uyarınca her bir hasarda uygulanan <strong>${formatCurrency(tenzili)}</strong> muafiyet tutarının tazminattan düşülmesi gerekmektedir.</p>\n`;
    }
    const eskime = parseFloat(document.getElementById('eskimeIskontosu')?.value || 0);
    if (eskime > 0) {
      p += `<p><strong>5. Eski ile Yeni Farkı (Yıpranma İskontosu):</strong> Onarımda kullanılan yeni parçalar nedeniyle araçta meydana gelen değer artışına karşılık <strong>${formatCurrency(eskime)}</strong> tutarındaki eskime payı mahsup edilmelidir.</p>\n`;
    }
    p += `\n`;
  } else if (d.policeTuru === 'imm') {
    p += `<h3>İMM (İHTİYARİ MALİ MESULİYET) POLİÇESİ SAVUNMASI</h3>\n`;
    p += `<p>Yargıtay 17. Hukuk Dairesi'nin yerleşik içtihatları uyarınca; zarar gören 3. şahıs öncelikle ZMSS (Zorunlu Trafik) poliçe limitini tamamen tüketmek zorundadır. ZMSS poliçe limiti tüketilmeden veya ZMSS sigortacısının sorumluluğu sınırına ulaşılmadan İMM sigortacısından tazminat talep edilemez. Müvekkil şirketin İMM teminatı ancak ZMSS limitini aşan kısım için ve poliçedeki azami İMM limiti dahilinde devreye girer.</p>\n\n`;
  } else if (d.policeTuru === 'isveren_sorumluluk') {
    p += `<h3>İŞVEREN SORUMLULUK SİGORTASI ÖZEL SAVUNMASI</h3>\n`;
    p += `<p><strong>1. 5510 Sayılı Kanun m. 21 SGK Mahsubu:</strong> İş kazası neticesinde SGK tarafından davacıya / hak sahiplerine bağlanan gelirlerin ve yapılan ödemelerin peşin sermaye değerinin işverenin kusur oranına düşen kısımdan mahsubu zorunludur.</p>\n`;
    p += `<p><strong>2. Kaçınılmazlık İlkesi ve İşçinin Ağır Kusuru:</strong> Kaza iş sağlığı kurallarına uyulmasına rağmen kaçınılmazlık nedeniyle gerçekleşmiş olup işverene tam kusur atfedilemez. İşçinin kendi emniyet kurallarını ihlal eden ağır kusuru TBK m. 52 kapsamında tenzil edilmelidir.</p>\n\n`;
  } else if (d.policeTuru === 'maden_fk' || d.policeTuru === 'kfk') {
    p += `<h3>ZORUNLU FERDİ KAZA POLİÇESİ SAVUNMASI</h3>\n`;
    p += `<p>Ferdi Kaza Sigortası Genel Şartları uyarınca sakatlık ve ölüm teminatı maktu nitelikte olup sakatlık derecesi oranında ödenir. Teminat üst sınırını aşan veya teminat dışı kalan taleplerin reddi gerekir.</p>\n\n`;
  }


  // ──── BEDENİ HASAR & DYK & TRAFİK İŞ KAZASI ÖZEL SAVUNMALARI ────
  if (['bedeni', 'karma', 'olumlu'].includes(d.hasarTuru)) {
    p += `<h3>BEDENİ HASAR VE DESTEKTEN YOKSUN KALMA (DYK) ÖZEL DEF'İ VE İTİRAZLARIMIZ</h3>\n`;
    
    const sgkPsd = parseFloat(document.getElementById('sgkPesinSermaye')?.value || 0);
    if (sgkPsd > 0) {
      p += `<p><strong>1. SGK Peşin Sermaye Değeri (PSD) Mahsubu (5510 m. 21):</strong> SGK tarafından davacıya / hak sahiplerine bağlanan gelirin <strong>${formatCurrency(sgkPsd)}</strong> tutarındaki Peşin Sermaye Değeri (PSD), 5510 sayılı Kanun m. 21 ve Yargıtay HGK kararları uyarınca hükmedilecek tazminattan mahsup edilmelidir.</p>\n`;
    }
    
    const yenidenEvlenme = parseFloat(document.getElementById('yenidenEvlenmeOrani')?.value || 0);
    if (yenidenEvlenme > 0) {
      p += `<p><strong>2. Eşin Yeniden Evlenme İhtimali İndirimi:</strong> Sağ kalan eşin yaşı ve çocuk durumu göz önüne alınarak AYİM ve Yargıtay Hukuk Genel Kurulu yaş cetvellerine göre <strong>%${yenidenEvlenme}</strong> oranında yeniden evlenme ihtimali indirimi tazminattan düşülmelidir.</p>\n`;
    }

    const yetistirme = parseFloat(document.getElementById('yetistirmeGideri')?.value || 0);
    if (yetistirme > 0) {
      p += `<p><strong>3. Yetiştirme Gideri Mahsubu:</strong> Vefat eden çocuğun 18 yaşına kadar yapılan bakım ve yetiştirme giderlerinin (<strong>${formatCurrency(yetistirme)}</strong>) destekten yoksun kalma tazminatından tenzili gerekmektedir.</p>\n`;
    }

    const kacinilmazlik = parseFloat(document.getElementById('kacinilmazlikOrani')?.value || 0);
    if (kacinilmazlik > 0) {
      p += `<p><strong>4. İş Kazasında Kaçınılmazlık İndirimi:</strong> Meydana gelen kaza teknik gelişmelere rağmen öngörülemez ve önlenemez nitelikte olup kaza riskinde <strong>%${kacinilmazlik}</strong> oranında kaçınılmazlık payı bulunmaktadır. Sorumluluk bu oran nispetinde indirilmelidir.</p>\n`;
    }
    p += `\n`;
  }

  // ──── HESAPLAMA İTİRAZI ────
  if (document.getElementById('sHesaplama').checked) {
    const h = ICTIHAT.hesaplama_trh2010;
    const sg = ICTIHAT.hesaplama_sgk;
    const gl = ICTIHAT.hesaplama_gelir;
    p += `<h3>F. TAZMİNAT HESAPLAMASI İTİRAZI VE AKTÜERYA DEĞERLENDİRMESİ</h3>\n`;
    p += `<p><strong>Hukuki Dayanak:</strong> TBK m. 51-52; ${h.kuralKaynagi}</p>\n`;
    p += `<p>Davacı tarafın talep ettiği tazminat miktarına ve hesaplama yöntemine itiraz ediyoruz. ${h.ictihat} sayılı Yargıtay kararında; <em>"${h.ozet}"</em> şeklinde hüküm kurulmuştur.</p>\n`;
    p += `<p>Hesaplamanın aşağıdaki parametrelerle yapılmasını talep ederiz:</p>\n`;
    p += `<p><strong>a)</strong> Yaşam tablosu olarak <strong>TRH-2010</strong> (Türkiye Hayat Tablosu) esas alınmalıdır.\n<strong>b)</strong> Teknik faiz oranı <strong>%1,8</strong> olarak uygulanmalıdır.\n<strong>c)</strong> Hesaplama <strong>progresif rant yöntemi (1/Kn formülü)</strong> ile yapılmalıdır.\n<strong>d)</strong> Aktif dönem (emeklilik yaşına kadar) ve pasif dönem (emeklilikten PMF yaşam süresinin sonuna kadar) ayrımı yapılmalı; pasif dönemde asgari ücret esas alınmalıdır.\n<strong>e)</strong> ${sg.ictihat} sayılı kararda belirtildiği üzere, SGK tarafından bağlanan gelirin peşin sermaye değeri tazminattan mahsup edilmelidir.\n<strong>f)</strong> ${gl.ictihat} sayılı kararda vurgulandığı üzere, davacının gerçek geliri vergi kayıtları ve SGK hizmet dökümü ile belgelenmeli; belgelenmemesi halinde asgari ücret baz alınmalıdır.</p>\n`;

    const hesapItirazlar = [];
    if (document.getElementById('iGelirHata')?.checked) hesapItirazlar.push('Davacının gelir tespiti hatalıdır. Gerçek geliri belgelenmemiş, soyut beyana dayalı fahiş bir gelir esas alınmıştır');
    if (document.getElementById('iPmfHata')?.checked) hesapItirazlar.push('PMF yaşam tablosu hatalı uygulanmıştır. Güncel Yargıtay uygulamasına göre TRH-2010 yaşam tablosu esas alınmalıdır');
    if (document.getElementById('iMukerrer')?.checked) hesapItirazlar.push('Mükerrer hesaplama yapılmış, aynı zarar kalemi birden fazla kez tazminata dahil edilmiştir');
    if (document.getElementById('iSgkMahsup')?.checked) hesapItirazlar.push('SGK tarafından davacıya bağlanan gelirin/ödemelerin peşin sermaye değeri mahsup edilmemiş veya hatalı mahsup edilmiştir');
    if (document.getElementById('iLimitAsim')?.checked) hesapItirazlar.push('Hesaplanan tutar poliçe teminat limitini aşmaktadır. Müvekkil şirketin sorumluluğu poliçe limiti ile sınırlıdır');
    if (document.getElementById('iTenzilHata')?.checked) hesapItirazlar.push('Müvekkil şirket tarafından yapılan önceki ödemeler hesaplamada tenzil edilmemiştir');
    if (document.getElementById('iAktifPasif')?.checked) hesapItirazlar.push('Aktif/pasif dönem ayrımı yapılmamış veya hatalı yapılmıştır');
    if (document.getElementById('iFaizHata')?.checked) hesapItirazlar.push('Teknik faiz oranı yanlış uygulanmıştır; %1,8 yerine farklı bir oran esas alınmıştır');

    if (hesapItirazlar.length > 0) {
      p += `<p><strong>Özellikle şu hesaplama hatalarına dikkat çekmek isteriz:</strong></p>\n<p>`;
      hesapItirazlar.forEach((item, i) => { p += `<strong>${i + 1}.</strong> ${item}.\n\n`; });
      p += `</p>\n\n`;
    }
  }

  // ──── FAİZ ────
  if (document.getElementById('sFaiz').checked) {
    const f = ICTIHAT.faiz_baslangic;
    p += `<h3>G. FAİZ TÜRÜ VE BAŞLANGIÇ TARİHİ İTİRAZI</h3>\n`;
    p += `<p><strong>Hukuki Dayanak:</strong> ${f.kuralKaynagi}</p>\n`;
    p += `<p>Davacının faiz taleplerine itiraz ediyoruz. ${f.ictihat} sayılı Yargıtay kararında; <em>"${f.ozet}"</em> şeklinde hüküm kurulmuştur.</p>\n`;
    p += `<p>Faizin dava tarihinden itibaren ve <strong>yasal faiz oranı</strong> üzerinden işletilmesini talep ederiz. Dava tarihinden önceki döneme faiz yürütülmesi hukuka aykırıdır. Davacının avans faizi, ticari faiz veya kaza tarihinden itibaren faiz talebi yerinde değildir. Sigortacının temerrüdü, ancak KTK m. 98 uyarınca başvuru tarihinden itibaren 8 iş günlük ödeme süresinin geçmesinden sonra başlayabilir.</p>\n\n`;
  }

  // ═══════════════ DELİL LİSTESİ ═══════════════
  p += `<h3>III. DELİLLERİMİZ</h3>\n`;
  p += `<p>1. Sigorta poliçesi sureti ve ekleri, genel ve özel şartlar\n2. Hasar dosyası (başvuru, inceleme, ödeme kayıtları)\n3. Kaza Tespit Tutanağı\n4. Ödeme dekontları, makbuzlar ve ibraname (varsa)\n5. Ceza soruşturma/kovuşturma dosyası (celbini talep ediyoruz)\n6. Bilirkişi incelemesi (kusur, aktüerya, maluliyet)\n7. Adli Tıp Kurumu raporu (sevk talebimiz mevcuttur)\n8. SGK hizmet dökümü ve gelir bağlama kararı\n9. Tanık (isim ve adresleri ayrıca bildirilecektir)\n10. Emsal Yargıtay kararları\n11. Yemin\n12. Sair her türlü yasal delil (karşı tarafın delillerine karşı delil sunma hakkımız saklıdır)</p>\n\n`;

  // ═══════════════ SONUÇ ═══════════════
  p += `<h3>SONUÇ VE İSTEM</h3>\n`;
  p += `<p>Yukarıda arz ve izah olunan nedenlerle ve Sayın Mahkemenizce re'sen gözetilecek hususlar da dikkate alınarak;</p>\n`;
  p += `<p><strong>Öncelikle;</strong> usuli itirazlarımızın kabulü ile davanın zamanaşımı ve/veya dava şartı noksanlığı nedeniyle <strong>usulden reddine</strong>,</p>\n`;
  p += `<p><strong>Bu kabul edilmediği takdirde;</strong></p>\n`;
  p += `<p>1. Haksız ve mesnetsiz davanın esastan <strong>reddine</strong>,\n2. Kabul anlamına gelmemek kaydıyla; tazminat hesaplamasının yukarıda belirtilen parametrelerle (TRH-2010, %1,8 teknik faiz, progresif rant) yeniden yapılmasına, müterafik kusur indirimi uygulanmasına, önceki ödemelerin ve SGK gelirinin mahsup edilmesine, poliçe limiti ile sınırlı sorumluluk ilkesinin gözetilmesine,\n3. Faizin dava tarihinden itibaren ve yasal faiz oranı üzerinden işletilmesine,\n4. Yargılama giderleri ve vekâlet ücretinin davacı tarafa yükletilmesine\n\nkarar verilmesini saygıyla arz ve talep ederiz. ${formatDate(new Date().toISOString().split('T')[0])}</p>\n`;
  p += `<p style="text-align: right; margin-top: 30px;"><strong>Davalı ${d.sigortaSirketi || '… Sigorta A.Ş.'} Vekili</strong><br>${d.davaliVekil || 'Av. …'}</p>`;

  // Ekrana yazdır
  const output = document.getElementById('petitionOutput');
  output.innerHTML = p;
  output.classList.remove('hidden');
  document.getElementById('petitionActions').classList.remove('hidden');
  document.getElementById('petitionActions').style.display = 'flex';
  showToast('İçtihat destekli cevap dilekçesi oluşturuldu.', 'success');
}

// ===================== BİLİRKİŞİ RAPORU İTİRAZI =====================
function generateObjection() {
  const d = getFormData();
  const raporTuru = document.getElementById('raporTuru').value;
  const raporTarihi = document.getElementById('raporTarihi').value;
  const raporToplam = parseFloat(document.getElementById('raporToplam').value || 0);
  const ekGerekce = document.getElementById('ekItirazGerekce').value;
  let o = '';

  o += `<h3>${d.mahkeme ? d.mahkeme.toUpperCase() : '… MAHKEMESİ'} SAYIN HÂKİMLİĞİ'NE</h3>\n\n`;
  o += `<p><strong>Dosya No:</strong> ${d.esasNo || '…/… E.'}<br><strong>Davalı:</strong> ${d.sigortaSirketi || '… Sigorta A.Ş.'} <strong>Vekili:</strong> ${d.davaliVekil || 'Av. …'}<br><strong>Konu:</strong> ${formatDate(raporTarihi) || '…'} tarihli bilirkişi raporuna karşı itiraz dilekçemizdir.</p>\n\n`;
  o += `<p>Sayın Mahkemenize sunulan bilirkişi raporunu kabul etmiyoruz. HMK m. 281 uyarınca yasal süremiz içinde itiraz gerekçelerimizi aşağıda arz ederiz. HMK m. 266 uyarınca bilirkişi, hukuki konularda görüş bildiremez; bilirkişi raporundaki hukuki nitelendirmelere itibar edilmemelidir.</p>\n\n`;

  if (raporTuru === 'kusur') {
    o += `<h3>KUSUR BİLİRKİŞİ RAPORUNA İTİRAZLARIMIZ</h3>\n`;
    o += `<p><strong>1. Kusur Oranı Hatalıdır:</strong> Bilirkişi raporunda sigortalımıza biçilen kusur oranı fahiştir. ${ICTIHAT.kusur_ktt.ictihat} sayılı Yargıtay kararında belirtildiği üzere, kaza tespit tutanağı kesin delil niteliğinde olmayıp aksinin her türlü delille ispatı mümkündür. Kaza tespit tutanağı, MOBESE kayıtları, tanık beyanları ve ceza dosyası birlikte değerlendirildiğinde sigortalımızın kusur oranının %${d.kusurOrani || '…'}'i geçmediği açıkça anlaşılmaktadır.</p>\n`;
    o += `<p><strong>2. Müterafik Kusur:</strong> Davacının müterafik kusuru yeterince dikkate alınmamıştır. TBK m. 52 uyarınca ${document.getElementById('emniyet').checked ? 'emniyet kemeri takmaması, ' : ''}${document.getElementById('hizIhlali').checked ? 'hız ihlali yapması, ' : ''}${document.getElementById('alkol').checked ? 'alkollü araç kullanması, ' : ''}davacının tazminattan indirim yapılmasını gerektiren müterafik kusur halleridir.</p>\n`;
    o += `<p><strong>3. Yeni Bilirkişi Talebi:</strong> Yukarıda belirtilen nedenlerle bilirkişi raporunun hükme esas alınmamasını, kusur dağılımının yeniden ve farklı bir bilirkişi heyetince incelenmesini talep ederiz.</p>\n\n`;
  } else if (raporTuru === 'aktuerya') {
    const h = ICTIHAT.hesaplama_trh2010;
    o += `<h3>AKTÜERYA BİLİRKİŞİ RAPORUNA İTİRAZLARIMIZ</h3>\n`;
    o += `<p><strong>1. Hesaplanan Tutar Fahiştir:</strong> Raporda hesaplanan toplam tutar <strong>${formatCurrency(raporToplam)}</strong> olup bu miktar somut olayla orantısız şekilde yüksektir.</p>\n`;
    o += `<p><strong>2. Hesaplama Yöntemi:</strong> ${h.ictihat} sayılı kararda belirtildiği üzere, hesaplamanın TRH-2010 yaşam tablosu, %1,8 teknik faiz oranı ve progresif rant yöntemi ile yapılması gerekmektedir. Raporda bu parametrelerin doğru uygulanıp uygulanmadığı kontrol edilmelidir.</p>\n`;
    if (document.getElementById('iGelirHata')?.checked) o += `<p><strong>3. Gelir Tespiti:</strong> ${ICTIHAT.hesaplama_gelir.ictihat} sayılı kararda vurgulandığı üzere, davacının gerçek gelirinin vergi kayıtları ve SGK hizmet dökümü ile belgelenmesi gerekmektedir. Raporda soyut beyana dayalı fahiş gelir esas alınmıştır.</p>\n`;
    if (document.getElementById('iSgkMahsup')?.checked) o += `<p><strong>4. SGK Mahsubu:</strong> ${ICTIHAT.hesaplama_sgk.ictihat} sayılı karara göre SGK tarafından bağlanan gelirin peşin sermaye değerinin tazminattan düşülmesi zorunludur. Bu mahsup yapılmamış veya hatalı yapılmıştır.</p>\n`;
    if (document.getElementById('iTenzilHata')?.checked) o += `<p><strong>5. Önceki Ödeme:</strong> Müvekkil şirketçe yapılan ${formatCurrency(parseFloat(d.oncekiOdeme || 0))} tutarındaki ödeme tenzil edilmemiştir.</p>\n`;
    if (document.getElementById('iLimitAsim')?.checked) o += `<p><strong>6. Poliçe Limiti:</strong> Hesaplanan tutar poliçe teminat limitini (${d.policeLimiti ? formatCurrency(parseFloat(d.policeLimiti)) : '…'}) aşmaktadır. Müvekkil şirketin sorumluluğu poliçe limiti ile sınırlıdır.</p>\n`;
    o += `<p>Raporun hükme esas alınmamasını ve hesaplamanın yukarıdaki parametrelerle yeniden yapılmasını talep ederiz.</p>\n\n`;
  } else if (raporTuru === 'maluliyet') {
    const m = ICTIHAT.maluliyet_atk;
    o += `<h3>MALULİYET RAPORUNA İTİRAZLARIMIZ</h3>\n`;
    o += `<p><strong>1. Maluliyet Oranı Fahiştir:</strong> Davacıya biçilen %${d.maluliyetOrani || '…'} oranındaki maluliyet, somut tıbbi bulgularla örtüşmemektedir.</p>\n`;
    o += `<p><strong>2. Yargıtay Uygulaması:</strong> ${m.ictihat} sayılı kararda; <em>"${m.ozet}"</em> şeklinde hüküm kurulmuştur.</p>\n`;
    if (document.getElementById('mYonetmelikHata')?.checked) o += `<p><strong>3. Yönetmelik:</strong> Raporda uygulanan kriter hatalıdır. Çalışma Gücü Kaybı Tespit Yönetmeliği esas alınmalıdır.</p>\n`;
    if (document.getElementById('mIlliyetBag')?.checked) o += `<p><strong>4. İlliyet Bağı:</strong> ${ICTIHAT.maluliyet_illiyet.ictihat} sayılı kararda belirtildiği üzere, kaza öncesi mevcut rahatsızlıklar dikkate alınmamış olup oransal illiyet değerlendirmesi yapılmalıdır.</p>\n`;
    o += `<p><strong>ATK Sevk Talebi:</strong> Maluliyet tespitinin Adli Tıp Kurumu Başkanlığı tarafından, Çalışma Gücü Kaybı Yönetmeliği hükümlerine uygun biçimde yeniden yapılmasını talep ediyoruz.</p>\n\n`;
  } else if (raporTuru === 'deger_kaybi') {
    o += `<h3>DEĞER KAYBI RAPORUNA İTİRAZLARIMIZ</h3>\n`;
    o += `<p><strong>1.</strong> Raporda belirlenen değer kaybı miktarı fahiştir. Aracın markası, modeli, yaşı, kilometresi, hasar geçmişi ve onarım kalitesi birlikte değerlendirilmeden gerçekçi bir değer kaybı hesaplaması yapılmamıştır.</p>\n`;
    o += `<p><strong>2.</strong> Değer kaybı hesaplamasında aracın ikinci el piyasa değeri, onarım sonrası satılabilirlik durumu ve hasar bölgesinin aracın hangi kısmında olduğu dikkate alınmalıdır. Yapısal hasarla kozmetik hasar arasında önemli fark gözetilmelidir.</p>\n`;
    o += `<p><strong>3.</strong> Yeniden bilirkişi incelemesi yaptırılmasını talep ederiz.</p>\n\n`;
  }

  if (ekGerekce) { o += `<h3>EK İTİRAZ GEREKÇELERİMİZ</h3>\n<p>${ekGerekce}</p>\n\n`; }

  o += `<h3>SONUÇ VE İSTEM</h3>\n`;
  o += `<p>Yukarıda arz ve izah olunan nedenlerle;\n1. Bilirkişi raporunun hükme esas alınmamasına,\n2. Yeniden ve farklı bilirkişi heyetinden rapor alınmasına${raporTuru === 'maluliyet' ? ',\n3. Davacının ATK Başkanlığına sevk edilmesine' : ''}\nkarar verilmesini saygıyla arz ve talep ederiz.</p>\n`;
  o += `<p style="text-align: right;"><strong>Davalı Vekili</strong><br>${d.davaliVekil || 'Av. …'}</p>`;

  document.getElementById('objectionOutput').innerHTML = o;
  document.getElementById('objectionOutput').classList.remove('hidden');
  document.getElementById('objectionActions').classList.remove('hidden');
  document.getElementById('objectionActions').style.display = 'flex';
  showToast('İtiraz dilekçesi oluşturuldu.', 'success');
}

// ===================== KARAR ANALİZİ =====================
function analyzeDecision() {
  const hukumAnapara = parseFloat(document.getElementById('hukumAnapara')?.value || 0);
  const hukumManevi = parseFloat(document.getElementById('hukumManevi')?.value || 0);
  const toplamHukum = hukumAnapara + hukumManevi;
  const faizTuru = document.getElementById('faizTuru')?.value || 'yasal';
  const yargilamaGiderleri = parseFloat(document.getElementById('yargilamaGiderleri')?.value || 0);
  const karsiVekaletUcreti = parseFloat(document.getElementById('karsiVekaletUcreti')?.value || 0);
  const retVekaletUcreti = parseFloat(document.getElementById('retVekaletUcreti')?.value || 0);
  const kararTebligTarihi = document.getElementById('kararTebligTarihi')?.value;
  const kararMahkeme = document.getElementById('kararMahkeme')?.value;
  const kararSonucu = document.getElementById('kararSonucu')?.value;

  let faizOrani = faizTuru === 'avans' ? CONSTANTS.avansFaizOrani : faizTuru === 'tcmb' ? CONSTANTS.tcmbReeskont : CONSTANTS.yasalFaizOrani;
  const kanunYolu = kararMahkeme === 'bam' ? 'TEMYİZ' : 'İSTİNAF';
  const parasalSinir = kararMahkeme === 'bam' ? CONSTANTS.temyizParasalSinir : CONSTANTS.istinafParasalSinir;
  const kanunYoluAcik = toplamHukum > parasalSinir;
  const istinafSuresiAy = kararMahkeme === 'bam' ? CONSTANTS.temyizSuresiAy : CONSTANTS.istinafSuresiAy;

  let sonGun = '';
  if (kararTebligTarihi) { const s = new Date(kararTebligTarihi); s.setDate(s.getDate() + 14); sonGun = s.toLocaleDateString('tr-TR'); }

  const gerekceler = [];
  if (document.getElementById('kZamanAsimiDegerlendirilmemis')?.checked) gerekceler.push('Zamanaşımı def\'i değerlendirilmemiş (güçlü)');
  if (document.getElementById('kKusurHatasi')?.checked) gerekceler.push('Kusur oranı hatalı');
  if (document.getElementById('kHesaplamaHatasi')?.checked) gerekceler.push('Hesaplama hatası');
  if (document.getElementById('kMaluliyetHatasi')?.checked) gerekceler.push('Maluliyet hatası');
  if (document.getElementById('kTeminatDisi')?.checked) gerekceler.push('Teminat dışı kalem');
  if (document.getElementById('kLimitAsimi')?.checked) gerekceler.push('Poliçe limiti aşımı');

  let riskScore = 50;
  riskScore -= gerekceler.length * 8;
  if (document.getElementById('kZamanAsimiDegerlendirilmemis')?.checked) riskScore -= 10;
  if (!kanunYoluAcik) riskScore += 20;
  riskScore = Math.max(10, Math.min(90, riskScore));

  let riskLevel, riskColor;
  if (riskScore < 30) { riskLevel = 'DÜŞÜK'; riskColor = 'var(--success)'; }
  else if (riskScore < 50) { riskLevel = 'ORTA'; riskColor = 'var(--warning)'; }
  else if (riskScore < 70) { riskLevel = 'YÜKSEK'; riskColor = 'var(--danger)'; }
  else { riskLevel = 'ÇOK YÜKSEK'; riskColor = '#ff4444'; }

  const ekFaiz = toplamHukum * faizOrani * (istinafSuresiAy / 12);
  const bugunBorc = toplamHukum + yargilamaGiderleri + karsiVekaletUcreti;
  const kaybetmeIcra = (toplamHukum + ekFaiz) * (1 + CONSTANTS.tahsilHarci + CONSTANTS.cezaeviHarci) + yargilamaGiderleri + karsiVekaletUcreti + CONSTANTS.icraVekaletAsgari;

  const circumference = 2 * Math.PI * 50;
  const dashOffset = circumference - (riskScore / 100) * circumference;

  let html = '';
    html += `<div class="alert ${kanunYoluAcik ? 'alert-info' : 'alert-warning'}"><div class="alert-icon">${kanunYoluAcik ? '+' : '!'}</div><div><strong>${kanunYolu} PARASAL SINIR:</strong> Hükmedilen: <strong>${formatCurrency(toplamHukum)}</strong> | Sinir: <strong>${formatCurrency(parasalSinir)}</strong><br>${kanunYoluAcik ? `${kanunYolu} yoluna <strong>açıktır</strong>. Son başvuru: <strong>${sonGun || '—'}</strong>` : `Karar <strong>kesindir</strong>, ${kanunYolu.toLowerCase()} yolu kapalıdır.`}</div></div>`;

  if (gerekceler.length > 0) {
        html += `<div class="alert alert-success"><div class="alert-icon">+</div><div><strong>${kanunYolu} Gerekçeleri (${gerekceler.length}):</strong><br>${gerekceler.map((g, i) => `${i + 1}. ${g}`).join('<br>')}</div></div>`;
  }

  html += `<div class="risk-indicator"><div class="risk-gauge"><svg viewBox="0 0 120 120"><circle class="risk-gauge-bg" cx="60" cy="60" r="50"/><circle class="risk-gauge-fill" cx="60" cy="60" r="50" stroke="${riskColor}" stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"/></svg><div class="risk-gauge-label"><div class="risk-gauge-value" style="color:${riskColor}">${riskScore}</div><div class="risk-gauge-text">Risk</div></div></div><div class="risk-details"><h3>Risk: <span style="color:${riskColor}">${riskLevel}</span></h3><p>${riskScore < 40 ? `Güçlü gerekçeler mevcut. <strong>${kanunYolu} başvurusu önerilir.</strong>` : riskScore < 60 ? `Gerekçeler mevcut ancak sınırlı. Şirketin ticari değerlendirmesine bırakılmalıdır.` : `Gerekçeler zayıf, ek faiz riski yüksek. <strong>Doğrudan ödeme</strong> değerlendirilmelidir.`}</p></div></div>`;

  html += `<div class="scenario-cards"><div class="scenario-card ${riskScore >= 50 ? 'recommended' : 'risk-low'}"><div class="scenario-card-title">${riskScore >= 50 ? '[Tavsiye] ' : ''}Doğrudan Ödeme</div><div class="scenario-card-amount text-success">${formatCurrency(bugunBorc)}</div><ul class="scenario-card-details"><li><span>Anapara + Manevi</span><span>${formatCurrency(toplamHukum)}</span></li><li><span>Yargılama Gid.</span><span>${formatCurrency(yargilamaGiderleri)}</span></li><li><span>Karşı Vekalet</span><span>${formatCurrency(karsiVekaletUcreti)}</span></li></ul></div>`;
  html += `<div class="scenario-card risk-high"><div class="scenario-card-title">${kanunYolu} + Kaybetme</div><div class="scenario-card-amount text-danger">${formatCurrency(kaybetmeIcra)}</div><ul class="scenario-card-details"><li><span>~${istinafSuresiAy} ay ek faiz</span><span>${formatCurrency(ekFaiz)}</span></li><li><span>İcra Harçları</span><span>${formatCurrency((toplamHukum + ekFaiz) * (CONSTANTS.tahsilHarci + CONSTANTS.cezaeviHarci))}</span></li></ul></div>`;
  html += `<div class="scenario-card ${riskScore < 50 ? 'recommended' : ''}"><div class="scenario-card-title">${riskScore < 50 ? '[Tavsiye] ' : ''}${kanunYolu} + Kazanma</div><div class="scenario-card-amount text-gold">${formatCurrency(CONSTANTS.istinafHarci + CONSTANTS.istinafPostaMasrafi)}</div><ul class="scenario-card-details"><li><span>Masraflar</span><span>${formatCurrency(CONSTANTS.istinafHarci + CONSTANTS.istinafPostaMasrafi)}</span></li><li><span>Tasarruf</span><span class="text-success">${formatCurrency(bugunBorc)}</span></li></ul></div></div>`;

  document.getElementById('decisionAnalysis').innerHTML = html;
  document.getElementById('decisionAnalysis').classList.remove('hidden');
  showToast('Karar analizi tamamlandı.', 'success');
}

// ===================== MALİ RİSK RAPORU =====================
function generateReport() {
  const d = getFormData();
  const hukumAnapara = parseFloat(document.getElementById('hukumAnapara')?.value || 0);
  const hukumManevi = parseFloat(document.getElementById('hukumManevi')?.value || 0);
  const toplamHukum = hukumAnapara + hukumManevi;
  const faizTuru = document.getElementById('faizTuru')?.value || 'yasal';
  const yargilamaGiderleri = parseFloat(document.getElementById('yargilamaGiderleri')?.value || 0);
  const karsiVekaletUcreti = parseFloat(document.getElementById('karsiVekaletUcreti')?.value || 0);
  const faizBaslangic = document.getElementById('faizBaslangic')?.value;
  const kararMahkeme = document.getElementById('kararMahkeme')?.value || 'ilk_derece';
  const oncekiOdeme = parseFloat(d.oncekiOdeme || 0);

  let faizOrani = faizTuru === 'avans' ? CONSTANTS.avansFaizOrani : faizTuru === 'tcmb' ? CONSTANTS.tcmbReeskont : CONSTANTS.yasalFaizOrani;
  let faizAdi = faizTuru === 'avans' ? 'Avans Faizi (%51)' : faizTuru === 'tcmb' ? 'TCMB Reeskont (%48)' : 'Yasal Faiz (%24)';

  let islemisGun = 0;
  if (faizBaslangic) { islemisGun = Math.floor((new Date() - new Date(faizBaslangic)) / 86400000); }
  const islemisFaiz = toplamHukum * faizOrani * (islemisGun / 365);
  const kanunYolu = kararMahkeme === 'bam' ? 'TEMYİZ' : 'İSTİNAF';
  const istinafSuresiAy = kararMahkeme === 'bam' ? CONSTANTS.temyizSuresiAy : CONSTANTS.istinafSuresiAy;

  document.getElementById('raporDosyaNo').textContent = `Dosya No: ${d.dosyaNo || '—'} | Esas: ${d.esasNo || '—'}`;
  document.getElementById('raporTarih').textContent = `Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`;

  const policeTuruMap = { zmss: 'ZMSS (Trafik)', kasko: 'Kasko', imm: 'İMM', kfk: 'KFK' };
  const hasarTuruMap = { maddi: 'Maddi Hasar', bedeni: 'Bedeni Hasar', karma: 'Karma', olumlu: 'Ölümlü' };

  // A
  let ozet = '';
  ozet += field('Dosya Numarası', d.dosyaNo) + field('Mahkeme', d.mahkeme) + field('Esas No', d.esasNo);
  ozet += field('Poliçe Türü', policeTuruMap[d.policeTuru] || '—') + field('Hasar Türü', hasarTuruMap[d.hasarTuru] || '—');
  ozet += field('Davacı', d.davaciAd) + field('Sigorta Şirketi', d.sigortaSirketi);
  ozet += field('Kaza Tarihi', formatDate(d.kazaTarihi)) + field('Dava Tarihi', formatDate(d.davaTarihi));
  ozet += field('Poliçe Limiti', d.policeLimiti ? formatCurrency(parseFloat(d.policeLimiti)) : '—');
  ozet += field('Kusur Oranı', `%${d.kusurOrani}`);
  document.getElementById('raporDosyaOzeti').innerHTML = ozet;

  // B
  const mevcutBorc = toplamHukum + islemisFaiz + yargilamaGiderleri + karsiVekaletUcreti - oncekiOdeme;
  let borcHtml = field('Hükmedilen Anapara', formatCurrency(hukumAnapara));
  if (hukumManevi > 0) borcHtml += field('Manevi Tazminat', formatCurrency(hukumManevi));
  borcHtml += field('Faiz Türü', faizAdi) + field(`İşlemiş Faiz (${islemisGun} gün)`, formatCurrency(islemisFaiz));
  borcHtml += field('Yargılama Giderleri', formatCurrency(yargilamaGiderleri)) + field('Karşı Vekalet Ücreti', formatCurrency(karsiVekaletUcreti));
  if (oncekiOdeme > 0) borcHtml += field('Önceki Ödeme Mahsubu', `<span class="text-success">-${formatCurrency(oncekiOdeme)}</span>`);
  borcHtml += `<div class="report-total"><span>MEVCUT TOPLAM BORÇ</span><span class="report-field-value">${formatCurrency(mevcutBorc)}</span></div>`;
  document.getElementById('raporBorcYuku').innerHTML = borcHtml;

  // C
  const ekFaiz = toplamHukum * faizOrani * (istinafSuresiAy / 12);
  const anaparaFaiz = toplamHukum + islemisFaiz + ekFaiz;
  const tahsilH = anaparaFaiz * CONSTANTS.tahsilHarci;
  const cezaeviH = anaparaFaiz * CONSTANTS.cezaeviHarci;
  const enKotuToplam = anaparaFaiz + tahsilH + cezaeviH + yargilamaGiderleri + karsiVekaletUcreti + CONSTANTS.icraVekaletAsgari - oncekiOdeme;
  let enKotuHtml = field('Anapara + Manevi', formatCurrency(toplamHukum));
  enKotuHtml += field('Toplam Faiz', formatCurrency(islemisFaiz + ekFaiz));
  enKotuHtml += field(`  ↳ Bugüne kadar (${islemisGun} gün)`, formatCurrency(islemisFaiz));
  enKotuHtml += field(`  ↳ ${kanunYolu} süresince (~${istinafSuresiAy} ay)`, formatCurrency(ekFaiz));
  enKotuHtml += field('Tahsil Harcı (%4,55)', formatCurrency(tahsilH)) + field('Cezaevi Harcı (%2)', formatCurrency(cezaeviH));
  enKotuHtml += field('Yargılama + Vekalet', formatCurrency(yargilamaGiderleri + karsiVekaletUcreti));
  enKotuHtml += field('İcra Vekalet Ücreti', formatCurrency(CONSTANTS.icraVekaletAsgari));
  if (oncekiOdeme > 0) enKotuHtml += field('Ödeme Mahsubu', `<span class="text-success">-${formatCurrency(oncekiOdeme)}</span>`);
  const katlanma = mevcutBorc > 0 ? ((enKotuToplam / mevcutBorc) * 100 - 100).toFixed(1) : 0;
  enKotuHtml += `<div class="report-total"><span>EN KÖTÜ SENARYO</span><span class="report-field-value" style="color:var(--danger)">${formatCurrency(enKotuToplam)}</span></div>`;
  enKotuHtml += `<div class="alert alert-danger mt-md"><div class="alert-icon">!</div><div>Maliyet artışı: <strong>%${katlanma}</strong></div></div>`;
  document.getElementById('raporEnKotu').innerHTML = enKotuHtml;

  // D
  const istinafMaliyet = (kararMahkeme === 'bam' ? CONSTANTS.temyizHarci : CONSTANTS.istinafHarci) + CONSTANTS.istinafPostaMasrafi;
  let istHtml = field(`${kanunYolu} Masrafı`, formatCurrency(istinafMaliyet));
  istHtml += field('Tahmini Süre', `~${istinafSuresiAy} ay`);
  istHtml += field('Eklenecek Faiz', `<span class="text-danger">${formatCurrency(ekFaiz)}</span>`);
  istHtml += field('Başarı → Tasarruf', `<span class="text-success">${formatCurrency(mevcutBorc)}</span>`);
  istHtml += field('Başarısızlık → Ek Maliyet', `<span class="text-danger">${formatCurrency(enKotuToplam - mevcutBorc + istinafMaliyet)}</span>`);
  document.getElementById('raporIstinaf').innerHTML = istHtml;

  // E
  const icraHarcTasarrufu = tahsilH + cezaeviH + CONSTANTS.icraVekaletAsgari;
  let odemeHtml = field('Anapara + Faiz + Giderler', formatCurrency(toplamHukum + islemisFaiz + yargilamaGiderleri + karsiVekaletUcreti));
  if (oncekiOdeme > 0) odemeHtml += field('Ödeme Mahsubu', `<span class="text-success">-${formatCurrency(oncekiOdeme)}</span>`);
  odemeHtml += `<div class="report-total"><span>DOĞRUDAN ÖDEME</span><span class="report-field-value" style="color:var(--success)">${formatCurrency(mevcutBorc)}</span></div>`;
  odemeHtml += `<div class="alert alert-success mt-md"><div class="alert-icon">+</div><div>İcra masraflarından <strong>${formatCurrency(icraHarcTasarrufu)}</strong> + ${istinafSuresiAy} ay faizden <strong>${formatCurrency(ekFaiz)}</strong> tasarruf.</div></div>`;
  document.getElementById('raporOdeme').innerHTML = odemeHtml;

  // F
  let tablo = `<div class="table-wrapper"><table><thead><tr><th>Senaryo</th><th>Maliyet</th><th>Risk</th><th>Süre</th></tr></thead><tbody>`;
  tablo += `<tr><td>Doğrudan Ödeme</td><td><strong>${formatCurrency(mevcutBorc)}</strong></td><td><span class="badge badge-success">Düşük</span></td><td>Hemen</td></tr>`;
  tablo += `<tr><td>${kanunYolu} + Kazanma</td><td><strong>${formatCurrency(istinafMaliyet)}</strong></td><td><span class="badge badge-info">—</span></td><td>~${istinafSuresiAy} ay</td></tr>`;
  tablo += `<tr class="row-highlight"><td>${kanunYolu} + Kaybetme</td><td><strong>${formatCurrency(enKotuToplam + istinafMaliyet)}</strong></td><td><span class="badge badge-danger">Yüksek</span></td><td>~${istinafSuresiAy} ay</td></tr>`;
  tablo += `</tbody></table></div>`;
  document.getElementById('raporKarsilastirma').innerHTML = tablo;

  // G
  document.getElementById('raporTavsiye').innerHTML = `<p>Detaylı risk analizi için <strong>Adım 9 — Karar Analizi</strong> bölümünü kullanınız. ${kanunYolu} gerekçeleri ve risk skoru bu bölümde hesaplanmaktadır.</p>`;

  showToast('Mali Risk Raporu oluşturuldu.', 'success');
}

// ===================== TARİHSEL FAİZ ORANLARI VERİTABANI =====================
// Kaynak: TCMB, 3095 sayılı Kanun, TTK m. 1530
const FAIZ_ORANLARI = {
  yasal: [
    // { baslangic, bitis, oran } — yıllık oran (ondalık)
    { baslangic: '2017-01-01', bitis: '2019-06-30', oran: 0.09 },
    { baslangic: '2019-07-01', bitis: '2021-12-31', oran: 0.09 },
    { baslangic: '2022-01-01', bitis: '2023-05-31', oran: 0.09 },
    { baslangic: '2023-06-01', bitis: '2023-12-31', oran: 0.15 },
    { baslangic: '2024-01-01', bitis: '2099-12-31', oran: 0.24 },
  ],
  avans: [
    { baslangic: '2017-01-01', bitis: '2017-12-31', oran: 0.1875 },
    { baslangic: '2018-01-01', bitis: '2018-12-31', oran: 0.1975 },
    { baslangic: '2019-01-01', bitis: '2019-06-30', oran: 0.2775 },
    { baslangic: '2019-07-01', bitis: '2019-12-31', oran: 0.2225 },
    { baslangic: '2020-01-01', bitis: '2020-06-30', oran: 0.1575 },
    { baslangic: '2020-07-01', bitis: '2020-12-31', oran: 0.1675 },
    { baslangic: '2021-01-01', bitis: '2021-06-30', oran: 0.1825 },
    { baslangic: '2021-07-01', bitis: '2021-12-31', oran: 0.1825 },
    { baslangic: '2022-01-01', bitis: '2022-06-30', oran: 0.1825 },
    { baslangic: '2022-07-01', bitis: '2022-12-31', oran: 0.1825 },
    { baslangic: '2023-01-01', bitis: '2023-06-30', oran: 0.2025 },
    { baslangic: '2023-07-01', bitis: '2023-12-31', oran: 0.3475 },
    { baslangic: '2024-01-01', bitis: '2099-12-31', oran: 0.51 },
  ]
};

// AAÜT 2026 İcra Vekalet Ücreti Hesaplama
function hesaplaIcraVekalet(toplamAlacak, takipTuru) {
  // AAÜT Üçüncü Kısım - İcra ve İflas Müdürlükleri ile İcra Mahkemelerinde
  // Takip edilen alacak miktarına göre nispi vekalet ücreti hesaplanır
  // Minimum ücret 2026: 6.700 TL (icra takibi)
  const asgari = 6700;
  let hesaplanan = 0;

  if (toplamAlacak <= 0) return asgari;

  // AAÜT nispi hesaplama (yaklaşık 2026 tarifesi)
  if (toplamAlacak <= 55000) {
    hesaplanan = toplamAlacak * 0.12;
  } else if (toplamAlacak <= 120000) {
    hesaplanan = 6600 + (toplamAlacak - 55000) * 0.11;
  } else if (toplamAlacak <= 350000) {
    hesaplanan = 13750 + (toplamAlacak - 120000) * 0.08;
  } else if (toplamAlacak <= 900000) {
    hesaplanan = 32150 + (toplamAlacak - 350000) * 0.06;
  } else if (toplamAlacak <= 2000000) {
    hesaplanan = 65150 + (toplamAlacak - 900000) * 0.04;
  } else {
    hesaplanan = 109150 + (toplamAlacak - 2000000) * 0.02;
  }

  return Math.max(hesaplanan, asgari);
}

// Tarihsel Faiz Hesaplama — başlangıç/bitiş arasında dönemlere bölerek hesaplar
function hesaplaOtomatikFaiz(anapara, baslangicStr, bitisStr, faizTuru) {
  const rates = FAIZ_ORANLARI[faizTuru] || FAIZ_ORANLARI.yasal;
  const baslangic = new Date(baslangicStr);
  const bitis = new Date(bitisStr);
  if (bitis <= baslangic || anapara <= 0) return { toplamFaiz: 0, donemler: [] };

  let donemler = [];
  let toplamFaiz = 0;

  rates.forEach(rate => {
    const rateStart = new Date(rate.baslangic);
    const rateEnd = new Date(rate.bitis);

    // Bu dönem ile talep edilen aralığın kesişimi
    const donemBaslangic = new Date(Math.max(baslangic.getTime(), rateStart.getTime()));
    const donemBitis = new Date(Math.min(bitis.getTime(), rateEnd.getTime()));

    if (donemBitis > donemBaslangic) {
      const gun = Math.floor((donemBitis - donemBaslangic) / 86400000);
      const faiz = anapara * rate.oran * (gun / 365);
      toplamFaiz += faiz;
      donemler.push({
        baslangic: donemBaslangic.toISOString().split('T')[0],
        bitis: donemBitis.toISOString().split('T')[0],
        gun,
        oran: (rate.oran * 100).toFixed(2),
        anapara,
        faiz
      });
    }
  });

  return { toplamFaiz, donemler };
}

function addKismiOdeme() {
  const container = document.getElementById('kismiOdemeler');
  const row = document.createElement('div');
  row.className = 'form-grid form-grid-3 mt-sm kismi-odeme-row';
  row.innerHTML = `<div class="form-group"><label class="form-label">Ödeme Tarihi</label><input type="date" class="form-input kismi-tarih"></div><div class="form-group"><label class="form-label">Ödeme Tutarı (TL)</label><input type="number" class="form-input kismi-tutar" placeholder="0,00" step="0.01"></div><div class="form-group" style="display:flex;align-items:flex-end;"><button class="btn btn-danger btn-sm" onclick="removeKismiOdeme(this)" style="margin-bottom:4px;">Sil</button></div>`;
  container.appendChild(row);
}
function removeKismiOdeme(btn) { btn.closest('.kismi-odeme-row').remove(); }

function calculateIcraKapak() {
  const anapara = parseFloat(document.getElementById('icraAnapara')?.value || 0);
  const manevi = parseFloat(document.getElementById('icraManevi')?.value || 0);
  const toplamAnapara = anapara + manevi;
  const odemeTarihi = document.getElementById('odemeTarihiIcra')?.value;
  const faizBaslangic = document.getElementById('icraFaizBaslangic')?.value;
  const faizTuru = document.getElementById('icraFaizTuru')?.value || 'yasal';
  const hacizDurumu = document.getElementById('hacizDurumu')?.value || 'yok';
  const takipTuru = document.getElementById('takipTuru')?.value || 'ilamli';

  if (!odemeTarihi || !faizBaslangic || toplamAnapara <= 0) {
    showToast('Anapara, faiz başlangıç tarihi ve ödeme tarihi giriniz.', 'error');
    return;
  }

  // ──── 1. OTOMATİK FAİZ HESAPLAMA ────
  const faizSonuc = hesaplaOtomatikFaiz(toplamAnapara, faizBaslangic, odemeTarihi, faizTuru);
  const toplamFaiz = faizSonuc.toplamFaiz;
  const faizDonemler = faizSonuc.donemler;

  // ──── 2. KISMI ÖDEMELER ────
  const kismiRows = document.querySelectorAll('.kismi-odeme-row');
  let toplamKismiOdeme = 0;
  let kismiDetay = [];
  kismiRows.forEach(row => {
    const tarih = row.querySelector('.kismi-tarih')?.value;
    const tutar = parseFloat(row.querySelector('.kismi-tutar')?.value || 0);
    if (tarih && tutar > 0) { toplamKismiOdeme += tutar; kismiDetay.push({ tarih: formatDate(tarih), tutar }); }
  });

  // ──── 3. OTOMATİK HARÇ HESAPLAMA ────
  // Tahsil harcı: %4,55 (tam ödeme) / %2,27 (dosya kapanmadan ödeme)
  // Cezaevi yapı harcı: %2
  const tahsilOran = 0.0455;
  const cezaeviOran = 0.02;
  const harcMatrahi = Math.max(0, toplamAnapara + toplamFaiz - toplamKismiOdeme);
  const tahsilHarci = harcMatrahi * tahsilOran;
  const cezaeviHarci = harcMatrahi * cezaeviOran;
  // Peşin harç (binde 68,31 x anapara, zaten takip açılırken yatırıldı)
  const pesinHarc = toplamAnapara * 0.06831;
  const netHarc = Math.max(0, tahsilHarci + cezaeviHarci - pesinHarc);

  // ──── 4. OTOMATİK VEKALET ÜCRETİ ────
  const icraVekalet = hesaplaIcraVekalet(harcMatrahi, takipTuru);
  const kararVekalet = parseFloat(document.getElementById('icraKararVekalet')?.value || 0);

  // ──── 5. MASRAFLAR ────
  const yargilamaGid = parseFloat(document.getElementById('icraYargilamaGideri')?.value || 0);
  const tebligatM = parseFloat(document.getElementById('icraTebligatMasraf')?.value || 0);
  const digerM = parseFloat(document.getElementById('icraDigerMasraf')?.value || 0);
  // Haciz durumuna göre ek masraf
  let hacizMasrafi = 0;
  if (hacizDurumu === 'var') hacizMasrafi = 1500; // Ortalama haciz masrafı
  if (hacizDurumu === 'muhafaza') hacizMasrafi = 4500; // Haciz + muhafaza + yediemin
  const toplamMasraf = tebligatM + digerM + hacizMasrafi;

  // ──── 6. TOPLAM KAPAK ────
  const toplamKapak = toplamAnapara + toplamFaiz + netHarc + kararVekalet + icraVekalet + yargilamaGid + toplamMasraf - toplamKismiOdeme;

  // ──── 7. ÇIKTI OLUŞTUR (EMOJİSİZ) ────
  const faizTuruAdi = faizTuru === 'avans' ? 'Avans Faizi (Ticari)' : 'Yasal Faiz';
  let html = `<div class="report-container"><div class="report-header"><h2>İCRA KAPAK HESABI</h2><div class="report-meta">${document.getElementById('icraMudurlugu')?.value || '—'} — Dosya: ${document.getElementById('icraDosyaNo')?.value || '—'}<br>Alacaklı: ${document.getElementById('icraAlacakli')?.value || '—'} | Borçlu: ${document.getElementById('icraBorclu')?.value || '—'}<br>Hesap Tarihi: ${formatDate(odemeTarihi)}</div></div>`;

  // A — Asıl Alacak
  html += `<div class="report-section"><div class="report-section-title">A. Asıl Alacak</div>`;
  html += field('Anapara (Maddi Tazminat)', formatCurrency(anapara));
  if (manevi > 0) html += field('Manevi Tazminat', formatCurrency(manevi));
  html += `<div class="report-total"><span>TOPLAM ASIL ALACAK</span><span class="report-field-value">${formatCurrency(toplamAnapara)}</span></div></div>`;

  // B — Faiz Hesabı
  html += `<div class="report-section"><div class="report-section-title">B. İşlemiş Faiz Hesabı (${faizTuruAdi})</div>`;
  html += field('Faiz Başlangıç Tarihi', formatDate(faizBaslangic));
  html += field('Hesap (Ödeme) Tarihi', formatDate(odemeTarihi));
  if (faizDonemler.length > 0) {
    html += `<div class="table-wrapper mt-md"><table><thead><tr><th>Dönem</th><th>Gün</th><th>Yıllık Oran</th><th>Anapara</th><th>Faiz Tutarı</th></tr></thead><tbody>`;
    faizDonemler.forEach(fd => {
      html += `<tr><td>${formatDate(fd.baslangic)} — ${formatDate(fd.bitis)}</td><td>${fd.gun}</td><td>%${fd.oran}</td><td>${formatCurrency(fd.anapara)}</td><td>${formatCurrency(fd.faiz)}</td></tr>`;
    });
    html += `</tbody></table></div>`;
    html += `<div class="form-hint mt-sm">Faiz oranları, ilgili dönemlerdeki resmi oranlar esas alınarak otomatik hesaplanmıştır.</div>`;
  }
  html += `<div class="report-total"><span>TOPLAM İŞLEMİŞ FAİZ</span><span class="report-field-value">${formatCurrency(toplamFaiz)}</span></div></div>`;

  // C — Harçlar
  html += `<div class="report-section"><div class="report-section-title">C. Harçlar</div>`;
  html += field('Harç Matrahı (Anapara + Faiz)', formatCurrency(harcMatrahi));
  html += field('Tahsil Harcı (%4,55)', formatCurrency(tahsilHarci));
  html += field('Cezaevi Yapı Harcı (%2)', formatCurrency(cezaeviHarci));
  html += field('Peşin Harç Mahsubu (binde 68,31)', `<span class="text-success">-${formatCurrency(pesinHarc)}</span>`);
  html += `<div class="report-total"><span>NET HARÇ</span><span class="report-field-value">${formatCurrency(netHarc)}</span></div></div>`;

  // D — Vekalet Ücreti
  html += `<div class="report-section"><div class="report-section-title">D. Vekalet Ücreti</div>`;
  if (kararVekalet > 0) html += field('Karar Vekalet Ücreti', formatCurrency(kararVekalet));
  html += field('İcra Vekalet Ücreti (AAÜT)', formatCurrency(icraVekalet));
  html += `<div class="form-hint">İcra vekalet ücreti, ${formatCurrency(harcMatrahi)} tutarındaki takip konusu alacak üzerinden 2026 AAÜT tarifesine göre otomatik hesaplanmıştır.</div></div>`;

  // E — Yargılama Giderleri ve Masraflar
  html += `<div class="report-section"><div class="report-section-title">E. Yargılama Giderleri ve Masraflar</div>`;
  if (yargilamaGid > 0) html += field('Yargılama Giderleri', formatCurrency(yargilamaGid));
  if (tebligatM > 0) html += field('Tebligat Masrafı', formatCurrency(tebligatM));
  if (hacizMasrafi > 0) html += field(`Haciz Masrafı (${hacizDurumu === 'muhafaza' ? 'Haciz + Muhafaza + Yediemin' : 'Haciz'})`, formatCurrency(hacizMasrafi));
  if (digerM > 0) html += field('Diğer Masraflar', formatCurrency(digerM));
  const toplamGiderMasraf = yargilamaGid + toplamMasraf;
  if (toplamGiderMasraf > 0) html += `<div class="report-total"><span>TOPLAM GİDER VE MASRAF</span><span class="report-field-value">${formatCurrency(toplamGiderMasraf)}</span></div>`;
  html += `</div>`;

  // F — Kısmi Ödemeler
  if (kismiDetay.length > 0) {
    html += `<div class="report-section"><div class="report-section-title">F. Kısmi Ödemeler / Mahsuplar (TBK m. 100)</div>`;
    kismiDetay.forEach(k => { html += field(`Ödeme: ${k.tarih}`, `<span class="text-success">-${formatCurrency(k.tutar)}</span>`); });
    html += `<div class="report-total"><span>TOPLAM MAHSUP</span><span class="report-field-value text-success">-${formatCurrency(toplamKismiOdeme)}</span></div></div>`;
  }

  // G — KAPAK
  html += `<div class="report-section">`;
  html += `<div class="table-wrapper mt-md"><table><thead><tr><th>Kalem</th><th style="text-align:right">Tutar</th></tr></thead><tbody>`;
  html += `<tr><td>Asıl Alacak (Anapara + Manevi)</td><td style="text-align:right">${formatCurrency(toplamAnapara)}</td></tr>`;
  html += `<tr><td>İşlemiş Faiz (${faizTuruAdi})</td><td style="text-align:right">${formatCurrency(toplamFaiz)}</td></tr>`;
  html += `<tr><td>Harçlar (Tahsil + Cezaevi - Peşin Harç)</td><td style="text-align:right">${formatCurrency(netHarc)}</td></tr>`;
  if (kararVekalet > 0) html += `<tr><td>Karar Vekalet Ücreti</td><td style="text-align:right">${formatCurrency(kararVekalet)}</td></tr>`;
  html += `<tr><td>İcra Vekalet Ücreti (AAÜT)</td><td style="text-align:right">${formatCurrency(icraVekalet)}</td></tr>`;
  if (yargilamaGid > 0) html += `<tr><td>Yargılama Giderleri</td><td style="text-align:right">${formatCurrency(yargilamaGid)}</td></tr>`;
  if (toplamMasraf > 0) html += `<tr><td>Masraflar (Tebligat + Haciz + Diğer)</td><td style="text-align:right">${formatCurrency(toplamMasraf)}</td></tr>`;
  if (toplamKismiOdeme > 0) html += `<tr><td>Kısmi Ödemeler (Mahsup)</td><td style="text-align:right; color:var(--success)">-${formatCurrency(toplamKismiOdeme)}</td></tr>`;
  html += `</tbody></table></div>`;
  html += `<div class="report-total" style="font-size:1.3rem; padding: 20px 0; margin-top: var(--space-md);"><span>TOPLAM KAPAK HESABI (${formatDate(odemeTarihi)} itibarıyla)</span><span class="report-field-value" style="color:var(--gold); font-size:1.5rem;">${formatCurrency(toplamKapak)}</span></div>`;
  html += `</div></div>`;

  document.getElementById('icraKapakOutput').innerHTML = html;
  document.getElementById('icraKapakOutput').classList.remove('hidden');
  document.getElementById('icraKapakActions').classList.remove('hidden');
  document.getElementById('icraKapakActions').style.display = 'flex';
  showToast('İcra kapak hesabı tamamlandı.', 'success');
}

// ===================== KURUMSAL MAİL TASLAKLARI =====================
function generateEmail() {
  const d = getFormData();
  const mailTuru = document.getElementById('mailTuru')?.value;
  const alici = document.getElementById('mailAlici')?.value || 'Sayın İlgili';
  const gonderen = document.getElementById('mailGonderen')?.value || d.davaliVekil || 'Av. …';
  const buro = document.getElementById('mailBuro')?.value || '… Hukuk Bürosu';
  const ekNot = document.getElementById('mailEkNot')?.value;

  if (!mailTuru) { showToast('Mail türü seçiniz.', 'error'); return; }

  const policeTuruMap = { zmss: 'ZMSS (Trafik)', kasko: 'Kasko', imm: 'İMM', kfk: 'KFK' };
  const hasarTuruMap = { maddi: 'Maddi Hasar', bedeni: 'Bedeni Hasar', karma: 'Karma (Maddi + Bedeni)', olumlu: 'Ölümlü' };
  const tarih = new Date().toLocaleDateString('tr-TR');
  const ref = `Dosya No: ${d.dosyaNo || '…'} | Esas: ${d.esasNo || '…'} | Mahkeme: ${d.mahkeme || '…'}`;

  let konu = '', govde = '';

  switch (mailTuru) {
    case 'atanma':
      konu = `Yeni Dosya Atanma Bildirimi — ${d.dosyaNo || '…'}`;
      govde = `<p>${alici},</p>\n<p>Ofisimize atanan aşağıda bilgileri yer alan yeni dosya hakkında sizi bilgilendirmek isteriz.</p>\n<p><strong>Dosya Referans:</strong> ${ref}<br><strong>Poliçe Türü:</strong> ${policeTuruMap[d.policeTuru] || '…'}<br><strong>Hasar Türü:</strong> ${hasarTuruMap[d.hasarTuru] || '…'}<br><strong>Davacı:</strong> ${d.davaciAd || '…'}<br><strong>Kaza Tarihi:</strong> ${formatDate(d.kazaTarihi) || '…'}<br><strong>Dava Tarihi:</strong> ${formatDate(d.davaTarihi) || '…'}<br><strong>Dava Değeri:</strong> ${d.davaDegeri ? formatCurrency(parseFloat(d.davaDegeri)) : '…'}</p>\n<p>Dosyanın ilk incelemesini tamamladıktan sonra detaylı hukuki görüşümüzü ayrıca ileteceğiz. Cevap dilekçesi yasal süresi içinde hazırlanarak mahkemeye sunulacaktır.</p>\n<p>Dosyayla ilgili hasar dosyanızda mevcut olan tüm belgelerin (poliçe sureti, kaza tespit tutanağı, hasar fotoğrafları, ödeme dekontları, yazışmalar) tarafımıza iletilmesini rica ederiz.</p>`;
      break;

    case 'ilk_inceleme':
      konu = `İlk İnceleme ve Hukuki Görüş Raporu — ${d.dosyaNo || '…'}`;
      govde = `<p>${alici},</p>\n<p>Tarafımıza atanan yukarıda referans numarası yazılı dosyanın ilk incelemesini tamamlamış bulunmaktayız. Hukuki değerlendirmemiz aşağıda arz edilmektedir.</p>\n<p><strong>DOSYA BİLGİLERİ:</strong><br>${ref}<br>Poliçe: ${policeTuruMap[d.policeTuru] || '…'} | Hasar: ${hasarTuruMap[d.hasarTuru] || '…'}<br>Davacı: ${d.davaciAd || '…'} | Kaza: ${formatDate(d.kazaTarihi) || '…'}<br>Poliçe Limiti: ${d.policeLimiti ? formatCurrency(parseFloat(d.policeLimiti)) : '…'}</p>\n`;
      govde += `<p><strong>HUKUKİ DEĞERLENDİRME:</strong></p>\n<p><strong>1. Zamanaşımı Analizi:</strong> Kaza tarihi ile dava tarihi arasındaki süre incelenmiş olup, zamanaşımı def'i cevap dilekçesinde süresinde ileri sürülecektir. ${d.cezaDosyasi !== 'yok' && d.cezaDosyasi !== 'kyok' ? 'Ceza dosyası mevcut olup uzamış ceza zamanaşımı riski değerlendirilmektedir.' : 'Uzamış ceza zamanaşımı riski düşük görünmektedir.'}</p>\n`;
      govde += `<p><strong>2. Kusur Durumu:</strong> Ön değerlendirmemize göre sigortalımızın kusur oranı %${d.kusurOrani || '…'} olup davacının müterafik kusuru %${d.davaciKusur || '…'} oranındadır.</p>\n`;
      if (['bedeni', 'karma', 'olumlu'].includes(d.hasarTuru)) {
        govde += `<p><strong>3. Maluliyet Durumu:</strong> Dosya bedeni hasarlı olup, maluliyet oranının tespiti yargılama sürecinde ayrıca değerlendirilecektir. ATK sevk talebi ileri sürülecektir.</p>\n`;
      }
      govde += `<p><strong>Savunma Stratejisi:</strong> Cevap dilekçesinde zamanaşımı def'i, kusur itirazı, hesaplama itirazı, poliçe limiti savunması ve ${parseFloat(d.oncekiOdeme || 0) > 0 ? `${formatCurrency(parseFloat(d.oncekiOdeme))} tutarındaki önceki ödemenin mahsubu` : 'sair usuli ve esasa ilişkin savunmalar'} ileri sürülecektir.</p>`;
      break;

    case 'cevap_bilgi':
      konu = `Cevap Dilekçesi Sunuldu — ${d.dosyaNo || '…'}`;
      govde = `<p>${alici},</p>\n<p>${ref} dosyasına ilişkin cevap dilekçemiz yasal süresi içinde ${d.mahkeme || '…'}'ne sunulmuştur.</p>\n<p><strong>İleri Sürülen Başlıca Savunmalar:</strong></p>\n<p>1. Zamanaşımı def'i (TTK m. 1420 / KTK m. 109)\n2. Kusur itirazı ve müterafik kusur (TBK m. 52)\n3. Poliçe limiti ile sınırlı sorumluluk\n4. Tazminat hesaplama yöntemi itirazı\n5. Faiz türü ve başlangıç tarihi itirazı\n${parseFloat(d.oncekiOdeme || 0) > 0 ? '6. Önceki ödemenin mahsubu talebi\n' : ''}</p>\n<p>Dosyanın seyri ve duruşma tarihleri hakkında sizi düzenli olarak bilgilendireceğiz.</p>`;
      break;

    case 'karar_bildirim':
      konu = `Mahkeme Kararı Bildirimi ve Hukuki Görüş — ${d.dosyaNo || '…'}`;
      const hukumAnapara = parseFloat(document.getElementById('hukumAnapara')?.value || 0);
      const hukumManevi = parseFloat(document.getElementById('hukumManevi')?.value || 0);
      const toplamHukum = hukumAnapara + hukumManevi;
      const kararSonucu = document.getElementById('kararSonucu')?.value;
      const kararSonucuAdi = kararSonucu === 'kabul' ? 'Davanın KABULÜ' : kararSonucu === 'kismi_kabul' ? 'Kısmen KABUL / Kısmen RET' : 'Davanın REDDİ';
      govde = `<p>${alici},</p>\n<p>${ref} dosyasında ${d.mahkeme || '…'} tarafından karar verilmiş olup, kararın detayları ve hukuki görüşümüz aşağıda arz edilmektedir.</p>\n<p><strong>KARAR DETAYLARI:</strong><br>Karar Sonucu: <strong>${kararSonucuAdi}</strong><br>Hükmedilen Anapara: <strong>${formatCurrency(hukumAnapara)}</strong><br>${hukumManevi > 0 ? `Manevi Tazminat: <strong>${formatCurrency(hukumManevi)}</strong><br>` : ''}Toplam: <strong>${formatCurrency(toplamHukum)}</strong><br>Yargılama Giderleri: ${formatCurrency(parseFloat(document.getElementById('yargilamaGiderleri')?.value || 0))}<br>Karşı Vekalet: ${formatCurrency(parseFloat(document.getElementById('karsiVekaletUcreti')?.value || 0))}</p>\n`;
      govde += `<p><strong>HUKUKİ DEĞERLENDİRME VE TAVSİYE:</strong></p>\n<p>Kararın detaylı analizi yapılmıştır. İstinaf/temyiz başvurusu yapılıp yapılmaması ve doğrudan ödeme seçeneği hakkındaki mali risk analizimiz ekte/ayrıca sunulacaktır. Kanun yolu başvuru süresi tebliğden itibaren <strong>2 haftadır</strong>. Talimatınızı süre içinde bekliyoruz.</p>`;
      break;

    case 'istinaf_tavsiye':
      konu = `İstinaf/Temyiz Başvurusu Tavsiyesi — ${d.dosyaNo || '…'}`;
      govde = `<p>${alici},</p>\n<p>${ref} dosyasında verilen kararın incelenmesi neticesinde, <strong>istinaf/temyiz başvurusu yapılmasını</strong> tavsiye etmekteyiz.</p>\n<p><strong>BAŞVURU GEREKÇELERİ:</strong></p>\n<p>1. Süresinde ileri sürülen savunmalarımızın kararda yeterince değerlendirilmediği kanaatindeyiz.\n2. Kusur oranı ve/veya tazminat hesaplamasında esaslı hatalar bulunmaktadır.\n3. İstinaf/temyiz başarısı halinde önemli miktarda tasarruf sağlanacaktır.</p>\n<p><strong>RİSK DEĞERLENDİRMESİ:</strong> Başvuru masrafları ve süre içinde işleyecek ek faiz riski göz önüne alınmıştır. Başarı halinde tasarruf, başarısızlık halinde ek maliyet detayları mali risk raporumuzda sunulmaktadır.</p>\n<p>Talimatınızı süre içinde (tebliğden itibaren 2 hafta) bekliyoruz.</p>`;
      break;

    case 'odeme_tavsiye':
      konu = `Doğrudan Ödeme Tavsiyesi — ${d.dosyaNo || '…'}`;
      govde = `<p>${alici},</p>\n<p>${ref} dosyasında verilen kararın detaylı incelemesi ve mali risk analizi sonucunda, <strong>doğrudan ödeme yapılmasını</strong> tavsiye etmekteyiz.</p>\n<p><strong>TAVSİYE GEREKÇELERİ:</strong></p>\n<p>1. İstinaf/temyiz gerekçeleri sınırlı olup başarı olasılığı düşük değerlendirilmiştir.\n2. Kanun yolu sürecinde işleyecek ek faiz borcun önemli ölçüde artmasına neden olacaktır.\n3. İcra aşamasına geçilmesi halinde tahsil harcı (%4,55), cezaevi yapı harcı (%2) ve icra vekalet ücreti gibi ek maliyetler doğacaktır.\n4. Doğrudan ödeme ile bu ek maliyetlerden tamamen tasarruf sağlanacaktır.</p>\n<p>Ödeme yapılması yönünde talimatınızı bekliyoruz.</p>`;
      break;

    case 'icra_bildirim':
      konu = `İcra Takibi Tebliği Bildirimi — ${d.dosyaNo || '…'}`;
      govde = `<p>${alici},</p>\n<p>${ref} dosyasına ilişkin olarak davacı/alacaklı vekili tarafından müvekkil şirket aleyhine <strong>icra takibi</strong> başlatılmıştır. Takip bilgileri aşağıdadır:</p>\n<p><strong>İcra Müdürlüğü:</strong> ${document.getElementById('icraMudurlugu')?.value || '…'}<br><strong>İcra Dosya No:</strong> ${document.getElementById('icraDosyaNo')?.value || '…'}<br><strong>Takip Tarihi:</strong> ${formatDate(document.getElementById('takipTarihi')?.value) || '…'}<br><strong>Takip Türü:</strong> ${document.getElementById('takipTuru')?.value === 'ilamli' ? 'İlamlı İcra' : 'İlamsız İcra'}</p>\n<p>İcra dosyasının ödeme listesini hazırlayarak tarafınıza ayrıca ileteceğiz. Ödeme talimatınızı bekliyoruz.</p>`;
      break;

    case 'odeme_listesi':
      konu = `Ödeme Listesi — ${d.dosyaNo || '…'}`;
      govde = `<p>${alici},</p>\n<p>${ref} dosyasına ilişkin icra dosyasının ödeme listesini ekte/aşağıda bilgilerinize sunmaktayız.</p>\n<p><strong>İcra Dosyası:</strong> ${document.getElementById('icraMudurlugu')?.value || '…'} — ${document.getElementById('icraDosyaNo')?.value || '…'}</p>\n<p>İcra kapak hesabı detayları ve ödenmesi gereken toplam tutar sistemimiz üzerinden hesaplanmıştır. Lütfen <strong>İcra Kapak Hesabı</strong> çıktısını inceleyiniz.</p>\n<p>Ödeme talimatınızı ivedilikle bekliyoruz. Gecikme halinde ek faiz ve masraflar doğacağını hatırlatmak isteriz.</p>`;
      break;

    case 'dyk_rapor':
      konu = `Destekten Yoksun Kalma Tazminatı Dosya Raporu — ${d.dosyaNo || '…'}`;
      govde = `<p>${alici},</p>\n<p>${ref} dosyası, trafik kazası sonucu vefat eden kişinin yakınları tarafından açılan <strong>destekten yoksun kalma (DYK) tazminatı</strong> davasına ilişkindir.</p>\n<p><strong>DOSYA BİLGİLERİ:</strong><br>Davacı(lar): ${d.davaciAd || '…'}<br>Poliçe: ${policeTuruMap[d.policeTuru] || '…'}<br>Kaza Tarihi: ${formatDate(d.kazaTarihi) || '…'}<br>Poliçe Limiti: ${d.policeLimiti ? formatCurrency(parseFloat(d.policeLimiti)) : '…'}</p>\n`;
      govde += `<p><strong>HUKUKİ DEĞERLENDİRME:</strong></p>\n<p>Destekten yoksun kalma tazminatı, TBK m. 53/3 uyarınca ölenin desteğinden yoksun kalan kişilerin zararını karşılamaya yönelik bir tazminattır. Hesaplamada ölenin yaşı, geliri, destek süresi, destekten yoksun kalanların yaşı ve bakım ihtiyacı dikkate alınır.</p>\n<p><strong>Savunma Stratejimiz:</strong>\n1. Kusur oranı itirazı\n2. Destek payı ve destek süresinin gerçekçi belirlenmesi talebi\n3. Ölenin gerçek gelirinin belgelenmesi talebi\n4. TRH-2010 yaşam tablosu ve %1,8 teknik faiz ile hesaplama talebi\n5. SGK ölüm gelirinin/aylığının peşin sermaye değerinin mahsubu\n6. Poliçe limiti savunması</p>`;
      break;

    case 'surekli_isgoremezlik':
      konu = `Sürekli İş Göremezlik Tazminatı Dosya Raporu — ${d.dosyaNo || '…'}`;
      govde = `<p>${alici},</p>\n<p>${ref} dosyası, trafik kazası sonucu yaralanan davacının <strong>sürekli iş göremezlik (maluliyet) tazminatı</strong> talebine ilişkindir.</p>\n<p><strong>DOSYA BİLGİLERİ:</strong><br>Davacı: ${d.davaciAd || '…'}<br>Maluliyet Oranı: %${d.maluliyetOrani || '…'}<br>Rapor Kaynağı: ${document.getElementById('raporKaynagi')?.value === 'atk' ? 'Adli Tıp Kurumu' : document.getElementById('raporKaynagi')?.value === 'universite' ? 'Üniversite Hastanesi' : '…'}</p>\n`;
      govde += `<p><strong>HUKUKİ DEĞERLENDİRME:</strong></p>\n<p>Maluliyet oranının yüksek belirlendiği kanaatindeyiz. ATK'ya sevk talebi ileri sürülecektir. Tazminat hesaplamasında aktif/pasif dönem ayrımı, TRH-2010 tablosu, %1,8 teknik faiz ve davacının gerçek gelirinin tespiti talep edilecektir.</p>`;
      break;

    case 'rucuen':
      konu = `Rücuen Tazminat Dosyası Raporu — ${d.dosyaNo || '…'}`;
      govde = `<p>${alici},</p>\n<p>${ref} dosyası, <strong>rücuen tazminat</strong> davasına ilişkin olup aşağıda hukuki değerlendirmemiz sunulmaktadır.</p>\n<p>Rücu koşullarının oluşup oluşmadığı, rücu kapsamı ve zamanaşımı sürelerinin ayrı bir değerlendirmeye tabi olduğu dikkate alınmalıdır. TTK m. 1472 ve KTK m. 95 hükümleri çerçevesinde savunma stratejimiz belirlenecektir.</p>`;
      break;

    case 'bilirkisi_degerlendirme':
      konu = `Bilirkişi Raporu Değerlendirmesi — ${d.dosyaNo || '…'}`;
      govde = `<p>${alici},</p>\n<p>${ref} dosyasında bilirkişi raporu tebliğ olunmuştur. Raporun incelenmesi neticesinde değerlendirmemiz aşağıdadır.</p>\n<p>Rapora yasal süremiz içinde itiraz dilekçesi sunulacaktır. İtiraz gerekçelerimiz ve detaylı değerlendirme ayrıca hazırlanmaktadır.</p>`;
      break;

    case 'islah_bildirim':
      konu = `Islah Bildirimi — ${d.dosyaNo || '…'}`;
      govde = `<p>${alici},</p>\n<p>${ref} dosyasında davacı vekili tarafından <strong>ıslah dilekçesi</strong> sunulmuştur.</p>\n<p>Islahla artırılan kısım yönünden zamanaşımı def'imizi süresinde ileri süreceğiz. Belirsiz alacak / kısmi dava nitelendirmesine itirazımız da ayrıca ileri sürülecektir.</p>`;
      break;

    case 'kapanis':
      konu = `Dosya Kapanış Bildirimi — ${d.dosyaNo || '…'}`;
      govde = `<p>${alici},</p>\n<p>${ref} dosyası sonuçlanmış olup dosya kapanış bilgilerini aşağıda bilgilerinize sunmaktayız.</p>\n<p>Dosyayla ilgili tüm süreçler tamamlanmıştır. Arşiv ve raporlama işlemleriniz için gerekli belgeleri dosyamızda muhafaza etmekteyiz.</p>`;
      break;

    default:
      govde = `<p>${alici},</p>\n<p>${ref} dosyasına ilişkin bilgilendirmedir.</p>`;
  }

  // Ek not
  if (ekNot) govde += `\n<p><strong>Ek Not:</strong> ${ekNot}</p>`;

  // Kapanış
  govde += `\n<p>Bilgilerinize sunar, gereğini saygılarımızla arz ederiz.</p>\n<p><strong>Saygılarımızla,</strong><br>${gonderen}<br>${buro}<br><em>Tarih: ${tarih}</em></p>`;

  // Çıktı
  let html = `<h3>Konu: ${konu}</h3>\n${govde}`;
  document.getElementById('emailOutput').innerHTML = html;
  document.getElementById('emailOutput').classList.remove('hidden');
  document.getElementById('emailActions').classList.remove('hidden');
  document.getElementById('emailActions').style.display = 'flex';
  showToast('Mail taslağı oluşturuldu.', 'success');
}

// ===================== UTILITY FUNCTIONS =====================
function getFormData() {
  const ids = ['dosyaNo','mahkeme','esasNo','policeTuru','hasarTuru','davaTuru','davaNiteligi','davaDegeri','davaciAd','davaciTC','davaciVekil','davaciDogumTarihi','davaciMeslek','davaciGelir','sigortaSirketi','policeNo','sigortaliAd','surucuAd','plaka','kazaTarihi','davaTarihi','tebligTarihi','policeBaslangic','policeBitis','policeLimiti','ktk97Tarihi','tahkimTarihi','oncekiOdeme','odemeTarihi','cezaDosyasi','sucVasfi','kusurOrani','davaciKusur','kusurTuru','bilirkisiKusur','maluliyetOrani','raporKaynagi','davaliVekil','dilekceVariant','kusurNotlari'];
  const data = {};
  ids.forEach(id => { const el = document.getElementById(id); data[id] = el ? el.value : ''; });
  return data;
}

function formatCurrency(amount) {
  if (isNaN(amount) || amount === null) return '₺0,00';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 }).format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function field(label, value) {
  return `<div class="report-field"><span class="report-field-label">${label}</span><span class="report-field-value">${value || '—'}</span></div>`;
}

// ===================== COPY / PRINT =====================
function copyPetition() { navigator.clipboard.writeText(document.getElementById('petitionOutput').innerText).then(() => showToast('Kopyalandı.', 'success')); }
function copyObjection() { navigator.clipboard.writeText(document.getElementById('objectionOutput').innerText).then(() => showToast('Kopyalandı.', 'success')); }
function copyReport() { navigator.clipboard.writeText(document.getElementById('reportContent').innerText).then(() => showToast('Kopyalandı.', 'success')); }
function copyIcraKapak() { navigator.clipboard.writeText(document.getElementById('icraKapakOutput').innerText).then(() => showToast('Kopyalandı.', 'success')); }
function copyEmail() { navigator.clipboard.writeText(document.getElementById('emailOutput').innerText).then(() => showToast('Kopyalandı.', 'success')); }

function printPetition() { printContent(document.getElementById('petitionOutput').innerHTML, 'Cevap Dilekçesi'); }
function printIcraKapak() { printContent(document.getElementById('icraKapakOutput').innerHTML, 'İcra Kapak Hesabı'); }
function printEmail() { printContent(document.getElementById('emailOutput').innerHTML, 'Mail Taslağı'); }
function printReport() { printContent(document.getElementById('reportContent').innerHTML, 'Mali Risk Raporu'); }

function printContent(html, title) {
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:'Inter',Arial,sans-serif;color:#1a1a1a;padding:40px;line-height:1.8;font-size:12pt}h3{margin:20px 0 10px;color:#333;border-bottom:1px solid #ddd;padding-bottom:5px}p{margin-bottom:10px;text-align:justify}table{width:100%;border-collapse:collapse;margin:15px 0}th,td{padding:8px 12px;border:1px solid #ddd;text-align:left;font-size:11pt}th{background:#f5f5f5;font-weight:600}.report-field{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dotted #ddd}.report-total{display:flex;justify-content:space-between;padding:12px 0;border-top:2px solid #333;font-weight:700;font-size:14pt;margin-top:8px}.report-section-title{font-size:13pt;font-weight:600;color:#8b6914;margin:20px 0 10px;padding-bottom:5px;border-bottom:1px solid #8b6914}.report-header{text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #333}.alert{padding:12px;border:1px solid #ddd;border-radius:6px;margin:10px 0;background:#f9f9f9}.badge{padding:2px 8px;border:1px solid #999;font-size:9pt;border-radius:10px}.text-success{color:#1a8a4a}.text-danger{color:#c0392b}.text-gold{color:#8b6914}@page{margin:2cm}</style></head><body>${html}</body></html>`);
  w.document.close(); w.print();
}

// ===================== STORAGE =====================
function saveToStorage() {
  const d = getFormData();
  const key = `sigorta_dosya_${d.dosyaNo || 'unnamed'}`;
  localStorage.setItem(key, JSON.stringify(d));
  localStorage.setItem('sigorta_last_dosya', key);
  showToast(`Dosya "${d.dosyaNo || 'İsimsiz'}" kaydedildi.`, 'success');
}

function loadFromStorage() {
  const lastKey = localStorage.getItem('sigorta_last_dosya');
  if (!lastKey) { showToast('Kayıtlı dosya bulunamadı.', 'error'); return; }
  const data = JSON.parse(localStorage.getItem(lastKey));
  if (!data) { showToast('Dosya yüklenemedi.', 'error'); return; }
  Object.keys(data).forEach(key => { const el = document.getElementById(key); if (el) el.value = data[key]; });
  updateKusur(); calculateTotals(); toggleBedeniFields(); toggleCezaFields();
  document.getElementById('maluliyetDisplay').textContent = `%${data.maluliyetOrani || 0}`;
  showToast(`Dosya "${data.dosyaNo || 'İsimsiz'}" yüklendi.`, 'success');
}

function resetForm() {
  if (!confirm('Tüm veriler sıfırlanacak. Emin misiniz?')) return;
  document.querySelectorAll('input, select, textarea').forEach(el => {
    if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
    else if (el.type === 'range') el.value = el.defaultValue;
    else el.value = '';
  });
  document.getElementById('teknikFaiz').value = '1.8';
  document.getElementById('aktifBitis').value = '60';
  document.getElementById('pasifBitis').value = '75';
  document.getElementById('asgariUcret').value = '26006';
  ['sZamanasimi','sArabuluculuk','sDavaDegeri','sKusur','sPoliceLimit','sOncekiOdeme','sHesaplama','sFaiz'].forEach(id => { const el = document.getElementById(id); if (el) el.checked = true; });
  updateKusur(); calculateTotals(); goToStep(1);
  showToast('Form sıfırlandı.', 'success');
}





// ===================== SİGORTA HUKUKU AKADEMİSİ & DOKTRİN KÜRSÜSÜ =====================
const ACADEMY_DATA = {
  ilkeler: [
    {
      title: "1. Tazminat İlkesi (Indemnity Principle & Zenginleşme Yasağı)",
      badge: "Temel Doktrin İlkesi",
      content: `
        <p><strong>Akademik İnceleme:</strong> Tazminat ilkesi, zarar sigortalarının (maddi ve bedeni) en temel direğidir. TTK m. 1460 ve TBK m. 50 hükümleri uyarınca; sigorta tazminatı hiçbir şekilde sigortalının / zarar görenin uğradığı gerçek zararı aşamaz. Sigorta, bir zenginleşme veya kazanç sağlama aracı haline getirilemez.</p>
        <p><strong>Dilekçe ve Savunma Stratejisine Yansıması:</strong> Cevap dilekçesinde ve rapor itirazlarında bu ilke; <em>"Eski ile Yeni Farkı Mahsubu"</em>, <em>"Sovtaj (Hurda) Mahsubu"</em>, <em>"Mükerrer Tazminat Yasağı"</em> ve <em>"SGK Peşin Sermaye Değeri İndirimi"</em> savunmalarının teorik omurgasını oluşturur. Zarar görenin kaza öncesi durumundan daha zengin bir konuma getirilmesi hukuken imkânsızdır.</p>
        <p><strong>Doktrinsel Görüşler & Mevzuat:</strong> TTK m. 1459, 1460, 1461 (Eksik Sigorta), 1462 (Aşkın Sigorta); Prof. Dr. Rayegân Kender, Prof. Dr. Samim Ünan.</p>
      `
    },
    {
      title: "2. Azami İyiniyet İlkesi (Uberrimae Fidei / Utmost Good Faith)",
      badge: "Temel Doktrin İlkesi",
      content: `
        <p><strong>Akademik İnceleme:</strong> Sigorta sözleşmeleri, diğer borç ilişkilerine kıyasla çok daha yüksek seviyede bir karşılıklı dürüstlük ve iyiniyet gerektirir (TMK m. 2 / TTK m. 1435). Sigortacı, riski kabul ederken ve primi belirlerken tamamen sigorta ettirenin beyanına güvenmek zorundadır (Bilgi Asimetrisi).</p>
        <p><strong>Dilekçe ve Savunma Stratejisine Yansıması:</strong> TTK m. 1435 - 1444 uyarınca sigortalının sözleşme yapılırken veya riziko gerçekleştikten sonra eksik, yanlış veya hileli beyanda bulunması durumunda; sigorta şirketinin sözleşmeden cayma, tazminatı ödemeden kaçınma veya tazminattan orantılı indirim yapma hakkının hukuki dayanağıdır.</p>
        <p><strong>Doktrinsel Görüşler & Mevzuat:</strong> TTK m. 1435, 1439, 1444; Prof. Dr. Hüseyin Ülgen, Doç. Dr. Ecehan Yeşilova Aras.</p>
      `
    },
    {
      title: "3. Sigortalanabilir Menfaat İlkesi (Insurable Interest)",
      badge: "Temel Doktrin İlkesi",
      content: `
        <p><strong>Akademik İnceleme:</strong> Sigorta sözleşmesinin geçerli olabilmesi için sigorta ettirenin riziko konusu değer üzerinde para ile ölçülebilir meşru bir hukuki menfaatinin bulunması şarttır (TTK m. 1408). Menfaatin yokluğu halinde sigorta sözleşmesi doğrudan hükümsüzdür.</p>
        <p><strong>Dilekçe ve Savunma Stratejisine Yansıması:</strong> Aracın maliki olmayan veya aracı işletme yetkisi / meşru menfaati bulunmayan kişilerin açtığı davalarda "Aktif Dava Ehliyeti Yokluğu / Menfaat Şartı Noksanlığı" nedeniyle davanın usulden reddi talebimizin temel dayanağıdır.</p>
        <p><strong>Doktrinsel Görüşler & Mevzuat:</strong> TTK m. 1408, 1453, 1454; Prof. Dr. Kemal Şenocak.</p>
      `
    },
    {
      title: "4. Riziko ve İlliyet Bağı İlkesi (Principle of Proximate Cause)",
      badge: "Temel Doktrin İlkesi",
      content: `
        <p><strong>Akademik İnceleme:</strong> Sigortacının tazminat ödeme borcunun doğabilmesi için, meydana gelen zararın doğrudan poliçede teminat altına alınan rizikonun gerçekleşmesi neticesinde doğmuş olması (Uygun İlliyet Bağı) şarttır.</p>
        <p><strong>Dilekçe ve Savunma Stratejisine Yansıması:</strong> Alkollü araç kullanımı, ehliyetsiz sürüş veya ağır kusur savunmalarında; zararın münhasıran bu sebeplerden doğup doğmadığının (illiyet bağı testi) Yargıtay Hukuk Genel Kurulu kriterlerine göre sorgulanmasıdır.</p>
        <p><strong>Doktrinsel Görüşler & Mevzuat:</strong> TBK m. 49, 51; Prof. Dr. Fikret Eren.</p>
      `
    },
    {
      title: "5. Halefiyet ve Rücu İlkesi (Subrogation Principle)",
      badge: "Temel Doktrin İlkesi",
      content: `
        <p><strong>Akademik İnceleme:</strong> TTK m. 1472 uyarınca sigortacı, tazminatı ödediğinde hukuken sigortalısının halefi olur ve sigortalının 3. kişilere karşı sahip olduğu dava/takip haklarını kazanır. Bu ilke, zarar görenin hem sigortacıdan hem de kusurlu 3. kişiden çifte tazminat almasını engeller.</p>
        <p><strong>Dilekçe ve Savunma Stratejisine Yansıması:</strong> Rücuen tazminat davalarında sigorta şirketinin davacı sıfatıyla 3. kişilere veya kendi sigortalısına (ağır kusur/alkol durumunda) başvurmasının ana hukuki mekanizmasıdır.</p>
        <p><strong>Doktrinsel Görüşler & Mevzuat:</strong> TTK m. 1472, KTK m. 95.</p>
      `
    },
    {
      title: "6. Zararı Önleme ve Azaltma Yükümlülüğü (Duty to Mitigate)",
      badge: "Temel Doktrin İlkesi",
      content: `
        <p><strong>Akademik İnceleme:</strong> TTK m. 1448 uyarınca sigortalı veya zarar gören, riziko gerçekleştiğinde zararı önlemek veya genişlemesini engellemek için makul tedbirleri almakla yükümlüdür.</p>
        <p><strong>Dilekçe ve Savunma Stratejisine Yansıması:</strong> Araç onarımında makul olmayan ikame araç süresi talepleri veya gereksiz tıbbi harcamalara karşı TBK m. 52 ve TTK m. 1448 uyarınca tazminat indirimi talebimizin teorik dayanağıdır.</p>
      `
    }
  ],
  tezler: [
    {
      title: "1. Sigortacılıkta Yapay Zekâ ve Algoritmik Risk Skorlamasının Hukuki Sorumluluğu ve Şeffaflığı",
      badge: "Özgün Tez Konusu (Yapay Zekâ & Hukuk)",
      content: `
        <p><strong>Problem Tanımı:</strong> Sigorta şirketleri aktüeryal risk kabulü, prim belirlenmesi ve otomatik hasar ihbar tasfiyesinde yapay zekâ algoritmalarını yoğun olarak kullanmaktadır. Ancak algoritmik ayrımcılık ve Kara Kutu (Black Box) kararlarının hukuki denetimi belirsizdir.</p>
        <p><strong>Doktrinsel İnceleme Alanı:</strong> KVKK m. 11, AB Yapay Zekâ Yasası (AI Act) ve TTK m. 1435 çerçevesinde algoritmik risk skorlamasının yargısal denetimi ve sigorta şirketinin kusursuz sorumluluğu.</p>
        <p><strong>Önerilen Tez Hipotezi:</strong> <em>"Sigortacılıkta yapay zekâ karar sistemlerinin ürettiği hatalı risk ve reddiyat kararlarında sigorta şirketinin sorumluluğu adam çalıştıranın sorumluluğu (TBK m. 66) kıyasıyla düzenlenmelidir."</em></p>
      `
    },
    {
      title: "2. Sigorta Şirketleri Yönünden Dava Dışı Doğrudan İnfaz Protokollerinin İbraname Rejimi (TBK m. 420) Karşısındaki Geçerliliği",
      badge: "Özgün Tez Konusu (Hasar Tasfiyesi)",
      content: `
        <p><strong>Problem Tanımı:</strong> Sigorta şirketleri dava açılmadan önce zarar görenlerle anlaşarak (dava dışı doğrudan tasfiye) sulh ve ibraname imzalamaktadır. Ancak 2 yıl sonra açılan davalarda TBK m. 420 (makbuz niteliği) gerekçe gösterilerek ibranameler geçersiz sayılmaktadır.</p>
        <p><strong>Doktrinsel İnceleme Alanı:</strong> TBK m. 132 (İbra) ve TBK m. 420 ile KTK m. 111/2 arasındaki özel kanun-genel kanun çatışması. Sigorta şirketinin mali öngörülebilirliği yönünden ibranamelerin kesin hükümsüzlük şartları.</p>
        <p><strong>Önerilen Tez Hipotezi:</strong> <em>"KTK m. 111/2 uyarınca 2 yıllık hak düşürücü süre içinde açılmayan iptal davalarında, sigorta ibranameleri TBK m. 420 kısıtlamasından muaf tutularak kesin ibra sebebi sayılmalıdır."</em></p>
      `
    },
    {
      title: "3. Siber Risk Poliçelerinde Ransomware (Fidye Yazılımı) Ödemelerinin Teminat Dışılığı ve 'Ağır İhmal' Sınırı",
      badge: "Özgün Tez Konusu (Siber Hukuk)",
      content: `
        <p><strong>Problem Tanımı:</strong> Kurumsal şirketlere yönelik siber saldırılarda fidye yazılımları (Ransomware) için ödenen paraların veya veri kaybı zararlarının Siber Sorumluluk Sigortaları kapsamında teminat alınıp alınamayacağı konusu Türkiye'de bakirdir.</p>
        <p><strong>Doktrinsel İnceleme Alanı:</strong> Siber güvenlik önlemlerinin yetersizliği "Ağır İhmal" sayılır mı? Kamu düzenine aykırılık gerekçesiyle fidye ödemeleri sigorta teminatı dışı tutulabilir mi?</p>
        <p><strong>Önerilen Tez Hipotezi:</strong> <em>"Fidye ödemeleri suç gelirlerinin aklanması riski taşıdığından kamu düzenine aykırıdır; ancak siber veri kurtarma masrafları TTK m. 1448 zararı azaltma borcu kapsamında sigortacıca ödenmelidir."</em></p>
      `
    },
    {
      title: "4. İklim Değişikliği ve Doğal Afetlerde 'Parametrik Sigorta Sözleşmeleri'nin Türk Ticaret Kanunu m. 1401 Karşısındaki Hukuki Niteliği",
      badge: "Özgün Tez Konusu (İklim & Finans)",
      content: `
        <p><strong>Problem Tanımı:</strong> Parametrik sigortalar, eksper incelemesi olmaksızın belirli bir endeks (örneğin deprem büyüklüğü > 7.0 veya yağış > 100mm) gerçekleştiğinde otomatik maktu ödeme yapan yeni nesil sözleşmelerdir.</p>
        <p><strong>Doktrinsel İnceleme Alanı:</strong> Somut zarar ispatı aranmayan parametrik sigortaların TTK m. 1401 sigorta tanımı ve tazminat ilkesi (zenginleşme yasağı) ile uyumu.</p>
        <p><strong>Önerilen Tez Hipotezi:</strong> <em>"Parametrik sigortalar somut zarar sigortası ile meblağ sigortası arasında sui generis (kendine özgü) bir finansal teminat sözleşmesi niteliğindedir."</em></p>
      `
    },
    {
      title: "5. Rücu Hukukunda Zamanaşımı Çatışmaları: TTK m. 1482 ile KTK m. 109 ve TCK Uzamış Ceza Zamanaşımı Gerilimi",
      badge: "Özgün Tez Konusu (Zamanaşımı & Maliye)",
      content: `
        <p><strong>Problem Tanımı:</strong> Sigortacının kendi sigortalısına veya 3. kişilere rücu davalarında zamanaşımı başlangıcı (tazminatın ödenme tarihi mi, olay tarihi mi?) ve uzamış ceza zamanaşımının rücu davalarına etkisi doktrinde tartışmalıdır.</p>
        <p><strong>Doktrinsel İnceleme Alanı:</strong> Sigorta şirketlerinin bilançolarında karşılaştırılabilir teknik karşılık ayırmasını zorlaştıran rücu zamanaşımı belirsizliklerinin giderilmesi.</p>
      `
    },
    {
      title: "6. Sigorta Hukukunda 'Ahlaki Riziko' (Moral Hazard) ve Danışıklı Hasar İhbarlarında İspat Standartları",
      badge: "Özgün Tez Konusu (Usul & İspat)",
      content: `
        <p><strong>Problem Tanımı:</strong> Şüpheli/hileli kaza ihbarlarında sigorta şirketinin "kaza danışıklıdır / sahtedir" iddiasında ispat yükü (HMK m. 190) ve ceza soruşturmalarının hukuk davasına etkisi (TBK m. 74).</p>
      `
    }
  ]
};

let currentAcademyCat = 'ilkeler';

function openAcademyModal() {
  document.getElementById('academyModal').classList.add('active');
  renderAcademyContent('ilkeler');
}

function closeAcademyModal() {
  document.getElementById('academyModal').classList.remove('active');
}

function filterAcademy(cat) {
  currentAcademyCat = cat;
  document.querySelectorAll('#academyModal .ictihat-cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-acadcat') === cat);
  });
  renderAcademyContent(cat);
}

function renderAcademyContent(cat) {
  const container = document.getElementById('academyContentContainer');
  if (cat === 'notlar') {
    const savedNotes = localStorage.getItem('sigorta_akademik_notlar') || '';
    container.innerHTML = `
      <div class="card" style="background:var(--bg-tertiary);">
        <h3 style="color:var(--gold); margin-bottom:12px;">✍️ Kişisel Akademik Araştırma Not Defteri</h3>
        <p class="form-hint mb-md">Yüksek lisans araştırmalarınız, tez fikirleriniz ve doktrinsel notlarınız için kişisel çalışma alanınız. Notlarınız otomatik kaydedilir.</p>
        <textarea class="form-textarea" id="academicNoteText" style="height:350px; font-family:monospace; line-height:1.6;" placeholder="Yüksek lisans tez başlığı fikirleriniz, okuduğunuz makale özetleri veya doktrinsel notlarınızı buraya yazabilirsiniz...">${savedNotes}</textarea>
        <div class="mt-md" style="display:flex; justify-content:flex-end;">
          <button class="btn btn-primary" onclick="saveAcademyNotes()">Notları Kaydet</button>
        </div>
      </div>
    `;
    return;
  }

  const items = ACADEMY_DATA[cat] || [];
  let html = '';
  items.forEach(item => {
    html += `
      <div class="ictihat-card">
        <div class="ictihat-card-header">
          <span class="ictihat-tag" style="background:rgba(77, 166, 255, 0.15); color:var(--info); font-weight:600;">${item.badge}</span>
          <h4 style="margin:8px 0; color:var(--gold); font-size:1.1rem;">${item.title}</h4>
        </div>
        <div class="ictihat-card-body" style="font-size:0.95rem; line-height:1.7;">
          ${item.content}
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function saveAcademyNotes() {
  const val = document.getElementById('academicNoteText')?.value || '';
  localStorage.setItem('sigorta_akademik_notlar', val);
  showToast('Akademik notlarınız başarıyla kaydedildi.', 'success');
}

// ===================== SİGORTA VEKİLİ EL KİTABI & REHBERLER =====================
const HANDBOOK_DATA = {
  bedeni: [
    {
      title: "👑 Tazminat Hukukunun Kraliçesi: Bedeni Hasar, DYK & Maluliyet Rehberi",
      badge: "Kraliçe Modül",
      content: `
        <p><strong>1. Sürekli İş Göremezlik (Maluliyet) Esasları:</strong> TBK m. 54 uyarınca bedensel zarara uğrayan kişinin çalışma gücü kaybı oranında tazminat isteme hakkı vardır. Maluliyet tespitinin kaza tarihindeki yürürlükteki mevzuata (Erişkinler İçin Engellilik Değerlendirmesi Hakkında Yönetmelik / ATK Kriterleri) uygun yapılması şarttır.</p>
        <p><strong>2. Destekten Yoksun Kalma Tazminatı (DYK - TBK m. 53/3):</strong> Ölenin yardımından mahrum kalan yakınlarının uğradığı zarardır. Destek payları dağıtımında: Eş %50, Çocuklar %25'er pay alır; ölen çocuk bekar ise Anne %25, Baba %25 destek payı alır.</p>
        <p><strong>3. Eşin Yeniden Evlenme İhtimali İndirimi:</strong> Eşin vefatı sonrasında yeniden evlenme olasılığı AYİM / Yargıtay HGK yaş cetvellerine göre belirlenir. Sağ kalan eşin yaşı gençleştikçe ve çocuk sayısı azaldıkça yeniden evlenme ihtimali indirimi (örneğin %10 - %50 arası) tazminattan düşülür.</p>
        <p><strong>4. SGK Peşin Sermaye Değeri (PSD) Mahsubu:</strong> 5510 sayılı Kanun m. 21 çerçevesinde SGK tarafından hak sahiplerine bağlanan ölüm aylığının / sürekli iş göremezlik gelirinin peşin sermaye değeri sigortacının/işverenin sorumluluk oranında tazminattan mahsup edilir.</p>
        <p><strong>5. Bakıcı Gideri (TBK m. 54):</strong> Başkasının bakımına muhtaç hale gelen ağır malullerde brüt/net asgari ücret üzerinden bakıcı gideri hesaplanır. Ancak evde aile fertlerince bakılsa dahi bakıcı gideri tazminatına hükmedilir.</p>
      `
    }
  ],

  kasko: [
    {
      title: "Kasko Sigortası Genel Şartları & Temel Esaslar",
      badge: "Kasko Hukuku",
      content: `
        <p><strong>1. Teminat Türleri:</strong> Kasko poliçeleri Dar, Kasko, Genişletilmiş ve Tam Kasko olmak üzere 4 ana gruba ayrılır. Çarpma, çarptırılma, devrilme, yanma ve çalınma temel teminatlardır.</p>
        <p><strong>2. Eksik Sigorta (TTK m. 1461):</strong> Poliçede yazılı sigorta bedeli, kaza tarihindeki gerçek sigorta değerinden az ise eksik sigorta mevcuttur. Hasar tazminatı <code>(Sigorta Bedeli / Sigorta Değeri) * Hasar Tutarı</code> formülü ile orantılı indirime tabi tutulur.</p>
        <p><strong>3. Beyan Yükümlülüğü İhlali (TTK m. 1435 - 1444):</strong> Sözleşme yapılırken veya riziko gerçekleştiğinde sigortalı tarafından kasten veya ihmalen yalan beyanda bulunulması halinde sigortacı tazminattan indirim yapabilir veya sözleşmeden cayabilir.</p>
        <p><strong>4. Sovtaj (Hurda) Mahsubu:</strong> Pert-total kabul edilen araçlarda sigortalı aracı hurda haliyle teslim almayı tercih ederse, sovtaj (ihale/piyasa hurda) bedeli toplam araç rayicinden düşülür.</p>
        <p><strong>5. Alkollü Kullanım Yargıtay HGK Kararları:</strong> Yargıtay Hukuk Genel Kurulu'nun yerleşik içtihatlarına göre sırf alkollü olmak kaskoda tazminatı reddetmek için yeterli değildir. Kazanın münhasıran (sırf) alkolün etkisiyle gerçekleştiğinin ve illiyet bağının sigortacı tarafından ispatlanması gerekir.</p>
      `
    },
    {
      title: "İMM (İhtiyari Mali Mesuliyet) Poliçesi Savunma Rehberi",
      badge: "İMM Hukuku",
      content: `
        <p><strong>1. ZMSS Limitinin Önceliği İlkesi:</strong> Zarar gören 3. şahıs öncelikle ZMSS (Zorunlu Trafik) poliçe limitini tüketmek zorundadır. ZMSS limiti tüketilmeden İMM sigortacısına başvurulamaz (Yargıtay 17. HD).</p>
        <p><strong>2. Kasko İçi İMM vs Müstakil İMM:</strong> Kasko poliçesinde ek teminat olarak yer alan İMM teminatı ile müstakil İMM poliçesi aynı hükümlere tabidir. Poliçedeki şahıs başı / kaza başı İMM limiti aşılamaz.</p>
        <p><strong>3. Manevi Tazminat Kapsamı:</strong> İMM poliçesinde manevi tazminat teminatı açıkça poliçede yazılı ve primi ödenmişse teminat altındadır. Aksi halde İMM'den manevi tazminat istenemez.</p>
      `
    }
  ],
  isveren: [
    {
      title: "İşveren Sorumluluk Sigortası & SGK Rücu Rehberi",
      badge: "İş Hukuku & SGK",
      content: `
        <p><strong>1. Teminat Kapsamı:</strong> İşyerinde meydana gelen iş kazaları ve meslek hastalıkları nedeniyle işverene terettüp eden hukuki sorumlulukları teminat altına alır.</p>
        <p><strong>2. 5510 Sayılı Kanun m. 21 SGK Peşin Sermaye Değeri Mahsubu:</strong> SGK tarafından iş kazası geçiren işçiye veya hak sahiplerine bağlanan gelirlerin peşin sermaye değeri, işverenin kusuru oranında tazminattan düşülür.</p>
        <p><strong>3. İşverenin Ağır Kusuru veya Kasten Sebebiyeti:</strong> İşverenin iş sağlığı ve güvenliği önlemlerini almaması neticesinde ağır kusurlu olması durumunda poliçedeki muafiyet ve rücu şartları incelenmelidir.</p>
        <p><strong>4. Kaçınılmazlık İlkesi:</strong> İş kazasının gelişen teknolojiye rağmen önlenemez nitelikte olması (kaçınılmazlık) durumunda kusur dağılımı %50-%50 veya orantılı bölünür, işverene %100 kusur yüklenemez.</p>
      `
    }
  ],
  maden: [
    {
      title: "Maden Ferdi Kaza ve Koltuk Ferdi Kaza Rehberi",
      badge: "Özel Branşlar",
      content: `
        <p><strong>1. Zorunlu Maden Çalışanları Ferdi Kaza Sigortası:</strong> Yeraltı ve yerüstü madencilik faaliyetlerinde çalışanların uğradığı kazalarda maktu (sabit) sakatlık ve ölüm teminatı ödenir.</p>
        <p><strong>2. Koltuk Ferdi Kaza Sigortası (KFK):</strong> Karayolu şehirlerarası veya uluslararası yolcu taşımacılığında otobüs/araç içindeki yolcuların kaza sonucu ölümü veya sakatlığı halinde teminat ödenir.</p>
        <p><strong>3. Kesinti Yapılamazlık ve Teminat Maktu Yapısı:</strong> Ferdi kaza sigortaları meblağ sigortası niteliğinde olduğundan, sakatlık derecesi oranında doğrudan poliçe teminatı ödenir; SGK ödemeleri sakatlık teminatından düşülemez (kusursuz teminat).</p>
      `
    }
  ],
  sovtaj: [
    {
      title: "Sovtaj, Muafiyet & Eksik Sigorta Hesaplama Rehberi",
      badge: "Aktüerya & Hesap",
      content: `
        <p><strong>1. Sovtaj Bedeli Tespiti:</strong> Hasarlı aracın ihale usulü veya ekspertiz kanalıyla belirlenen hurda piyasa değeridir. Hak sahibine araç hurdasının bırakılması halinde sovtaj bedeli tazminattan düşülür.</p>
        <p><strong>2. Tenzili Muafiyet (Deductible):</strong> Sigortalının her bir hasarda üstlenmeyi taahhüt ettiği maktu veya oransal (ör %2 veya 5.000 TL) muafiyet tutarı tazminat ödemesinden doğrudan mahsup edilir.</p>
        <p><strong>3. Eski ile Yeni Farkı (Yıpranma / Iskonto):</strong> Hasar gören aracın yaşı ve yıpranma durumu göz önüne alınarak yeni yedek parça takılması halinde oluşan değer artışı (eskime iskontosu) tazminattan düşülür.</p>
      `
    }
  ],
  icra: [
    {
      title: "İcra Risk, Hata Analizcisi & Operasyonel Rehber",
      badge: "İcra & İnfaz",
      content: `
        <p><strong>1. Mükerrer Takip Riski:</strong> Hem mahkeme davası devam ederken hem icra takibi başlatılması veya çifte icra takibi açılması durumunda derhal DERHAT İTİRAZ ve mükerrerlik def'i sunulmalıdır.</p>
        <p><strong>2. Poliçe Limiti Aşan İcra Emri:</strong> İcra müdürlüğü takibe geçerken poliçe limitini aşan meblağ için sigorta şirketine icra emri gönderemez. Hatalı icra emrine karşı İcra Hukuk Mahkemesi'nde 7 gün içinde ŞİKAYET yoluna gidilmelidir (İİK m. 16).</p>
        <p><strong>3. Hatalı Faiz Başlangıcı ve Oranı:</strong> Sigorta şirketinin temerrüdü başvuru + 8 iş günü veya dava tarihidir. Olay tarihinden itibaren ticari faiz istenmesi halinde icra takibine kısmi itiraz sunulmalıdır.</p>
        <p><strong>4. İİK m. 40 İcranın İadesi:</strong> Üst mahkemece kararın bozulması halinde ödenmiş olan para alacaklıdan icra müdürlüğü muhtırası ile tahsil edilerek sigorta şirketine iade ettirilir.</p>
      `
    }
  ]
};

let currentHandbookCat = 'kasko';

function openHandbookModal() {
  document.getElementById('handbookModal').classList.add('active');
  renderHandbookContent('kasko');
}

function closeHandbookModal() {
  document.getElementById('handbookModal').classList.remove('active');
}

function filterHandbook(cat) {
  currentHandbookCat = cat;
  document.querySelectorAll('#handbookModal .ictihat-cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-hbcat') === cat);
  });
  renderHandbookContent(cat);
}

function renderHandbookContent(cat) {
  const container = document.getElementById('handbookContentContainer');
  const items = HANDBOOK_DATA[cat] || [];
  let html = '';
  items.forEach(item => {
    html += `
      <div class="ictihat-card">
        <div class="ictihat-card-header">
          <span class="ictihat-tag">${item.badge}</span>
          <h4 style="margin:8px 0; color:var(--gold);">${item.title}</h4>
        </div>
        <div class="ictihat-card-body" style="font-size:0.95rem; line-height:1.6;">
          ${item.content}
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

// ===================== İCRA İADE DİLEKÇESİ (İİK m. 40) =====================
function generateIadeDilekcesi() {
  const d = getFormData();
  const icraMudurlugu = document.getElementById('icraMudurlugu')?.value || '… İCRA MÜDÜRLÜĞÜ';
  const icraDosyaNo = document.getElementById('icraDosyaNo')?.value || '…/… E.';
  const iadeGerekcesi = document.getElementById('iadeGerekcesi')?.value;
  const iadeTutar = parseFloat(document.getElementById('iadeTutar')?.value || 0);

  let p = `<h3>${icraMudurlugu.toUpperCase()}'NE</h3>\n\n`;
  p += `<p><strong>Dosya No:</strong> ${icraDosyaNo}<br><strong>Borçlu (İade İsteyen):</strong> ${d.sigortaSirketi || '… Sigorta A.Ş.'} <strong>Vekili:</strong> ${d.davaliVekil || 'Av. …'}<br><strong>Alacaklı:</strong> ${document.getElementById('icraAlacakli')?.value || '…'}<br><strong>Konu:</strong> İİK m. 40 uyarınca alacaklı tarafa rızaen/cebren ödenen fuzuli tutarın iadesi için muhtıra çıkarılması talebimizdir.</p>\n\n`;
  p += `<h3>AÇIKLAMALAR</h3>\n`;
  p += `<p>1. Yukarıda esas numarası yazılı müdürlüğünüz dosyasından borçlu müvekkil sigorta şirketi tarafından alacaklı tarafa <strong>${formatCurrency(iadeTutar)}</strong> tutarında ödeme yapılmıştır / tahsilat gerçekleştirilmiştir.</p>\n`;

  if (iadeGerekcesi === 'bozma') {
    p += `<p>2. İcra takibine dayanak mahkeme ilamı, üst mahkeme (Bölge Adliye Mahkemesi / Yargıtay) tarafından <strong>BOZULARAK</strong> davanın reddine / kararın kaldırılmasına karar verilmiştir. İİK m. 40 uyarınca, <em>"Bir ilamın bölge adliye mahkemesince kaldırılması veya Yargıtayca bozulması icra muamelelerini olduğu yerde durdurur... Karar kesinleştiğinde alacaklıya ödenen para borçluya iade olunur."</em></p>\n`;
  } else if (iadeGerekcesi === 'mukerrer') {
    p += `<p>2. Müvekkil sigorta şirketi tarafından takip öncesinde/esnasında mükerrer olarak yapılmış olan ödeme nedeniyle dosyaya fuzuli tahsilat yapılmıştır.</p>\n`;
  } else if (iadeGerekcesi === 'limit_asim') {
    p += `<p>2. Borçlu müvekkil sigorta şirketinin sorumluluğu ZMSS poliçe limiti ile sınırlı olmasına rağmen icra müdürlüğünce poliçe limiti üzerinde hatalı tahsilat yapılmıştır.</p>\n`;
  } else {
    p += `<p>2. Müdürlüğünüzce yapılan kapak hesabındaki hata neticesinde alacaklı tarafa fazla ödeme yapıldığı tespit edilmiştir.</p>\n`;
  }

  p += `<p>3. Yukarıda açıklanan nedenlerle, borçlu müvekkil şirkete iadesi gereken <strong>${formatCurrency(iadeTutar)}</strong> tutarın iadesi için alacaklı tarafa 7 günlük iade muhtırası çıkarılmasını saygılarımla arz ve talep ederim.</p>\n\n`;
  p += `<p style="text-align: right;"><strong>Borçlu Sigorta Şirketi Vekili</strong><br>${d.davaliVekil || 'Av. …'}</p>`;

  const out = document.getElementById('iadeDilekceOutput');
  out.innerHTML = p;
  out.classList.remove('hidden');
  showToast('Fazla Ödeme İade Dilekçesi oluşturuldu.', 'success');
}

// ===================== HACİZ FEK DİLEKÇESİ =====================
function generateHacizFekDilekcesi() {
  const d = getFormData();
  const icraMudurlugu = document.getElementById('icraMudurlugu')?.value || '… İCRA MÜDÜRLÜĞÜ';
  const icraDosyaNo = document.getElementById('icraDosyaNo')?.value || '…/… E.';
  const hacizFekTuru = document.getElementById('hacizFekTuru')?.value;
  const fekDayanagi = document.getElementById('fekDayanagi')?.value;
  const hacizDetayBilgi = document.getElementById('hacizDetayBilgi')?.value || '…';

  let p = `<h3>${icraMudurlugu.toUpperCase()}'NE</h3>\n\n`;
  p += `<p><strong>Dosya No:</strong> ${icraDosyaNo}<br><strong>Borçlu:</strong> ${d.sigortaSirketi || '… Sigorta A.Ş.'} <strong>Vekili:</strong> ${d.davaliVekil || 'Av. …'}<br><strong>Konu:</strong> Borçlu müvekkil şirket üzerindeki hacizlerin fekki (kaldırılması) talebidir.</p>\n\n`;
  p += `<h3>AÇIKLAMALAR</h3>\n`;
  p += `<p>Müdürlüğünüz dosyasından borçlu müvekkil sigorta şirketi aleyhine uygulanmış olan hacizlerin kaldırılması gerekmektedir.</p>\n`;

  if (fekDayanagi === 'tam_odeme') {
    p += `<p>1. Müdürlüğünüz icra dosyası kapsamındaki kapak borcunun tamamı <strong>bakiye borç kalmaksızın ödenmiş ve dosya infazen kapatılmıştır</strong>.</p>\n`;
  } else if (fekDayanagi === 'teminat') {
    p += `<p>1. Kararın tehiri icra (tehir-i icra / icrayı durdurma) kararı getirilmesi amacıyla dosya borcunun tamamını karşılar miktarda <strong>kesin banka teminat mektubu / nakit teminat</strong> müdürlüğünüz dosyasına sunulmuştur.</p>\n`;
  } else {
    p += `<p>1. Alacaklı taraf vekili ile haricen anlaşılmış olup haricen tahsil beyanında bulunulmuştur.</p>\n`;
  }

  if (hacizFekTuru === 'banka') {
    p += `<p>2. Müvekkil şirketin hak sahibi olduğu banka hesaplarına konulan <strong>89/1 hacizlerinin ve blokajların derhal fekkine</strong>, ilgili bankalara haciz fek yazısı yazılmasına karar verilmesini talep ederiz. (İlgili Banka: ${hacizDetayBilgi})</p>\n`;
  } else if (hacizFekTuru === 'arac') {
    p += `<p>2. Müvekkil şirket adına kayıtlı <strong>${hacizDetayBilgi}</strong> plakalı motorlu araç üzerindeki haczin UYAP / EGM sistemi üzerinden fekkine karar verilmesini talep ederiz.</p>\n`;
  } else if (hacizFekTuru === 'tasinmaz') {
    p += `<p>2. Müvekkil şirket adına kayıtlı <strong>${hacizDetayBilgi}</strong> taşınmaz üzerindeki haczin ilgili Tapu Müdürlüğü'ne fek yazısı yazılarak kaldırılmasına karar verilmesini talep ederiz.</p>\n`;
  } else {
    p += `<p>2. Müvekkil şirket aleyhine konulmuş tüm banka, araç, taşınmaz ve 3. şahıs hacizlerinin <strong>tamamen FEKKİNE</strong> karar verilmesini saygıyla arz ve talep ederiz.</p>\n`;
  }

  p += `<p style="text-align: right;"><strong>Borçlu Sigorta Şirketi Vekili</strong><br>${d.davaliVekil || 'Av. …'}</p>`;

  const out = document.getElementById('hacizFekOutput');
  out.innerHTML = p;
  out.classList.remove('hidden');
  showToast('Haciz Fek Dilekçesi oluşturuldu.', 'success');
}

// ===================== STOPAJ / KDV & İNFAZ DİLEKÇESİ =====================
function generateInfazDilekcesi() {
  const d = getFormData();
  const icraMudurlugu = document.getElementById('icraMudurlugu')?.value || '… İCRA MÜDÜRLÜĞÜ';
  const icraDosyaNo = document.getElementById('icraDosyaNo')?.value || '…/… E.';
  const vekalet = parseFloat(document.getElementById('infazVekaletUcreti')?.value || 0);
  const stopaj = vekalet * 0.20;
  document.getElementById('infazStopajTutar').value = stopaj.toFixed(2);

  let p = `<h3>${icraMudurlugu.toUpperCase()}'NE</h3>\n\n`;
  p += `<p><strong>Dosya No:</strong> ${icraDosyaNo}<br><strong>Borçlu:</strong> ${d.sigortaSirketi || '… Sigorta A.Ş.'} <strong>Vekili:</strong> ${d.davaliVekil || 'Av. …'}<br><strong>Konu:</strong> Vekalet ücreti Gelir Vergisi Stopajı (%20) beyanı, ödeme dekontu ve dosyanın İNFAZEN KAPATILMASI talebidir.</p>\n\n`;
  p += `<h3>AÇIKLAMALAR</h3>\n`;
  p += `<p>1. Yukarıda esas numarası yazılı dosyanız borcunun tamamı müvekkil sigorta şirketi tarafından müdürlüğünüz hesabına ödenmiştir.</p>\n`;
  p += `<p>2. GVK m. 94 ve Vergi Usul Kanunu genel tebliğleri uyarınca; kurumlar vergisi mükellefi olan borçlu sigorta şirketi tarafından alacaklı vekiline ödenen icra vekalet ücreti üzerinden <strong>%20 oranında (${formatCurrency(stopaj)}) Gelir Vergisi Stopaj Kesintisi</strong> yapılarak vergi dairesine yatırılacaktır.</p>\n`;
  p += `<p>3. Dosya borcu tamamen tasfiye edilmiş olduğundan, dosyanın <strong>İNFAZEN KAPATILMASINA</strong> ve işlemden kaldırılmasına karar verilmesini saygıyla talep ederiz.</p>\n\n`;
  p += `<p style="text-align: right;"><strong>Borçlu Sigorta Şirketi Vekili</strong><br>${d.davaliVekil || 'Av. …'}</p>`;

  const out = document.getElementById('infazDilekceOutput');
  out.innerHTML = p;
  out.classList.remove('hidden');
  showToast('İnfaz ve Stopaj Dilekçesi oluşturuldu.', 'success');
}

// ===================== İCRA RİSK & HATA ANALİZİ =====================
function runIcraRiskAnalizi() {
  const d = getFormData();
  const policeLimiti = parseFloat(d.policeLimiti || 0);
  const icraAnapara = parseFloat(document.getElementById('icraAnapara')?.value || 0);
  const faizBaslangic = document.getElementById('icraFaizBaslangic')?.value;
  const kazaTarihi = d.kazaTarihi;
  const faizTuru = document.getElementById('icraFaizTuru')?.value;

  let risks = [];

  if (policeLimiti > 0 && icraAnapara > policeLimiti) {
    risks.push({
      level: 'danger',
      title: 'ZMSS POLİÇE LİMİTİ AŞIMI RİSKİ',
      text: `İcra takibindeki anapara alacağı (${formatCurrency(icraAnapara)}), poliçe teminat limitini (${formatCurrency(policeLimiti)}) aşmaktadır. Sigorta şirketinin sorumluluğu limiti aşamaz. Derhal icra takibine ve icra emrine limit yönünden itiraz/şikayet edilmelidir.`
    });
  }

  if (faizBaslangic && kazaTarihi && faizBaslangic === kazaTarihi && d.policeTuru === 'zmss') {
    risks.push({
      level: 'warning',
      title: 'HATALI FAİZ BAŞLANGIÇ TARİHİ RİSKİ',
      text: `Alacaklı taraf faizi kaza tarihinden itibaren başlatmıştır. ZMSS sigortacısının temerrüdü KTK m. 98 uyarınca başvuru + 8 iş günü süresinin dolmasıyla doğar. Dava/başvuru öncesi döneme faiz yürütülmesine itiraz edilmelidir.`
    });
  }

  if (faizTuru === 'avans' && d.policeTuru === 'zmss' && d.hasarTuru === 'bedeni') {
    risks.push({
      level: 'warning',
      title: 'FAİZ TÜRÜ İTİRAZI (YASAL vs AVANS)',
      text: `Bedeni hasarlarda ve şahıs kazalarında avans (ticari) faizi istenemez; yasal faiz uygulanmalıdır. İcra takibindeki faiz türüne itiraz edilmelidir.`
    });
  }

  let html = `<div class="report-section-title">İCRA MÜDÜRLÜĞÜ HATA VE RİSK ANALİZ RAPORU</div>`;
  if (risks.length === 0) {
    html += `<div class="alert alert-success"><div class="alert-icon">✓</div><div>İcra dosya parametrelerinde kritik bir usul veya poliçe limiti hatası tespit edilmedi. Dosya rutin takibe uygundur.</div></div>`;
  } else {
    risks.forEach(r => {
      html += `<div class="alert alert-${r.level}"><div class="alert-icon">!</div><div><strong>${r.title}:</strong><br>${r.text}</div></div>`;
    });
  }

  const out = document.getElementById('icraRiskOutput');
  out.innerHTML = html;
  out.classList.remove('hidden');
  showToast('İcra risk ve hata analizi tamamlandı.', 'success');
}

// ===================== TOAST =====================
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100px)'; toast.style.transition = '0.3s ease'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ===================== INIT =====================


// ===================== YAPAY ZEKÂ HUKUK ASİSTANI ENGINE =====================
let aiChatHistory = [
  {
    role: 'assistant',
    text: '<p>Merhaba Sayın Meslektaşım. Ben <strong>Sigorta Hukuku Yapay Zekâ Asistanınızım</strong>.</p><p>Sigorta şirketi vekilliğiniz kapsamındaki poliçe savunmaları, içtihatlar, bedeni/maddi tazminat hesapları, icra riskleri veya sisteme girdiğiniz aktif dosya hakkında bana dilediğiniz soruyu sorabilirsiniz.</p>'
  }
];

function openAiChatModal() {
  document.getElementById('aiChatModal').classList.add('active');
  renderAiMessages();
}

function closeAiChatModal() {
  document.getElementById('aiChatModal').classList.remove('active');
}

function clearAiChat() {
  aiChatHistory = [
    {
      role: 'assistant',
      text: '<p>Sohbet geçmişi sıfırlandı. Yeni sorunuzu yöneltebilirsiniz.</p>'
    }
  ];
  renderAiMessages();
}

function sendQuickPrompt(promptText) {
  document.getElementById('aiChatInput').value = promptText;
  sendAiMessage();
}

function renderAiMessages() {
  const container = document.getElementById('aiChatMessages');
  if (!container) return;

  let html = '';
  aiChatHistory.forEach(msg => {
    const isUser = msg.role === 'user';
    html += `
      <div class="ai-msg-bubble ${isUser ? 'ai-msg-user' : 'ai-msg-assistant'}">
        ${isUser ? `<div style="font-weight:600; margin-bottom:4px; font-size:0.8rem; opacity:0.8;">Siz (Avukat)</div>${escapeHtml(msg.text)}` : `<div style="font-weight:700; color:var(--gold); margin-bottom:6px; font-size:0.82rem;">🤖 AI Hukuk Asistanı</div>${msg.text}`}
      </div>
    `;
  });
  container.innerHTML = html;
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function sendAiMessage() {
  const inputEl = document.getElementById('aiChatInput');
  const query = inputEl.value.trim();
  if (!query) return;

  // Add User Message
  aiChatHistory.push({ role: 'user', text: query });
  inputEl.value = '';
  renderAiMessages();

  // Simulate AI Thinking & Answer Generation
  const container = document.getElementById('aiChatMessages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'ai-msg-bubble ai-msg-assistant';
  typingDiv.id = 'aiTypingIndicator';
  typingDiv.innerHTML = `<span style="color:var(--text-muted);"><em>AI Hukuk Asistanı inceliyor ve yanıt hazırlıyor...</em></span>`;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;

  setTimeout(() => {
    const typing = document.getElementById('aiTypingIndicator');
    if (typing) typing.remove();

    const responseText = processAiQuery(query);
    aiChatHistory.push({ role: 'assistant', text: responseText });
    renderAiMessages();
  }, 600);
}

function processAiQuery(query) {
  const q = query.toLowerCase();
  const d = getFormData();
  const hasDosya = Boolean(d.dosyaNo || d.mahkeme || d.kazaTarihi);

  // 1. Aktif Dosya / Risk / Zamanaşımı Sorusu
  if (q.includes('aktif dosya') || q.includes('şu anki dosya') || q.includes('bu dosya') || q.includes('risk analizi')) {
    if (!hasDosya) {
      return `<p>Şu an formda girilmiş aktif bir dosya verisi bulunmuyor. Form adımlarına (Dosya No, Kaza Tarihi, Dava Tarihi, Poliçe Limiti vb.) bilgileri girdiğinizde bu dosya hakkında canlı hukuki ve mali risk analizi yapabilirim.</p>`;
    }

    let resp = `<p><strong>Açık Dosya Analiz Raporu (${d.dosyaNo || 'İsimsiz Dosya'}):</strong></p>`;
    resp += `<ul>`;
    resp += `<li><strong>Mahkeme / Esas:</strong> ${d.mahkeme || 'Belirtilmedi'} / ${d.esasNo || '—'}</li>`;
    resp += `<li><strong>Poliçe & Hasar Türü:</strong> ${d.policeTuru ? d.policeTuru.toUpperCase() : 'ZMSS'} | ${d.hasarTuru ? d.hasarTuru.toUpperCase() : 'Maddi'}</li>`;
    resp += `<li><strong>Kaza Tarihi:</strong> ${formatDate(d.kazaTarihi) || '—'} | <strong>Dava Tarihi:</strong> ${formatDate(d.davaTarihi) || '—'}</li>`;
    resp += `<li><strong>Poliçe Teminat Limiti:</strong> ${d.policeLimiti ? formatCurrency(parseFloat(d.policeLimiti)) : 'Girilmedi'}</li>`;
    resp += `<li><strong>Kusur Dağılımı:</strong> Sigortalı %${d.kusurOrani || 50} | Davacı %${d.davaciKusur || 50}</li>`;
    resp += `</ul>`;

    // Zamanaşımı kontrolü
    if (d.kazaTarihi && d.davaTarihi) {
      const kaza = new Date(d.kazaTarihi);
      const dava = new Date(d.davaTarihi);
      const farkYil = (dava - kaza) / (1000 * 60 * 60 * 24 * 365.25);
      if (farkYil > 2) {
        resp += `<p><strong>⏱ Zamanaşımı Uyarı:</strong> Kaza ile dava tarihi arasında <strong>${farkYil.toFixed(1)} yıl</strong> bulunmaktadır. KTK m. 109 uyarınca 2 yıllık zamanaşımı dolmuş görünmektedir. Ceza dosyası yoksa <strong>derhal zamanaşımı def'i ileri sürülmelidir</strong>.</p>`;
      } else {
        resp += `<p><strong>⏱ Zamanaşımı Durumu:</strong> Kaza ile dava arası ${farkYil.toFixed(1)} yıl olup 2 yıllık zamanaşımı süresi içinde dava açılmıştır.</p>`;
      }
    }

    resp += `<p><strong>Tavsiye Edilen Savunma Stratejisi:</strong> Cevap dilekçesinde poliçe limiti (${d.policeLimiti ? formatCurrency(parseFloat(d.policeLimiti)) : 'limit içi'}) sınırlandırılması, %${d.davaciKusur || 50} müterafik kusur tenzili (TBK m. 52) ve varsa önceki ödemelerin mahsubu talep edilmelidir.</p>`;
    return resp;
  }

  // 2. Kasko / Alkol / İlliyet Bağı
  if (q.includes('kasko') || q.includes('alkol') || q.includes('illiyet')) {
    return `
      <p><strong>Kasko Sigortasında Alkollü Kullanım ve Yargıtay İlliyet Bağı İlkesi:</strong></p>
      <p><strong>1. Münhasıran Alkol Etkisi Şartı:</strong> Yargıtay Hukuk Genel Kurulu'nun yerleşik kararlarına göre, sırf sürücünün alkollü olması kaskoda tazminatı reddetmek için yeterli değildir. Kazanın <em>münhasıran (sırf)</em> alkolün etkisi altında gerçekleştiğinin sigortacı tarafından ispatlanması gerekir.</p>
      <p><strong>2. İspat Yükü Sigortacıdadır:</strong> Nörolojik veya fiziki engel, yol kusuru, karşı tarafın %100 kusuru veya hava şartları kazaya etki etmişse illiyet bağı kesilir ve kasko teminatı geçerli olur.</p>
      <p><strong>3. Eksik Sigorta & Muafiyet:</strong> Kasko dosyalarında TTK m. 1461 eksik sigorta indirimi ve poliçedeki tenzili muafiyet tutarları mutlaka hesaplamadan düşülmelidir.</p>
    `;
  }

  // 3. Destekten Yoksun Kalma (DYK) / Bedeni Hasar / Evlenme İndirimi
  if (q.includes('destek') || q.includes('dyk') || q.includes('evlenme') || q.includes('bedeni') || q.includes('maluliyet')) {
    return `
      <p><strong>👑 Bedeni Hasar ve Destekten Yoksun Kalma (DYK) Hesap Esasları:</strong></p>
      <p><strong>1. Destek Payları Dağıtımı:</strong> Evli ve çocuklu merhumda Eş %50, Çocuklar %25'er pay alır. Bekar ve vefat eden gençlerde Anne %25, Baba %25 destek payı hakkına sahiptir.</p>
      <p><strong>2. Eşin Yeniden Evlenme İhtimali İndirimi:</strong> Sağ kalan dul eşin yaşı gençleştikçe ve çocuk sayısı azaldıkça Yargıtay ve AYİM cetvellerine göre %10 ile %50 arasında evlenme indirimi tazminattan düşülür.</p>
      <p><strong>3. SGK Peşin Sermaye Değeri Mahsubu:</strong> 5510 m. 21 uyarınca SGK'nın bağladığı ölüm aylığı / sürekli iş göremezlik geliri PSD'si tazminattan mahsup edilmelidir.</p>
      <p><strong>4. Aktüerya Parametreleri:</strong> TRH-2010 yaşam tablosu, %1,8 teknik faiz ve progresif rant yöntemi (1/Kn formülü) uygulanmalıdır.</p>
    `;
  }

  // 4. İcra / Fazla Ödeme İadesi İİK 40 / Haciz Fekki
  if (q.includes('icra') || q.includes('iade') || q.includes('haciz') || q.includes('iik 40') || q.includes('stopaj')) {
    return `
      <p><strong>İcra & İnfaz Yönetimi Usul Kuralları:</strong></p>
      <p><strong>1. İİK m. 40 İcranın İadesi:</strong> İstinaf veya Temyiz incelemesinde yerel mahkeme kararı bozulup dava reddedilirse, icra dosyasına ödenen tüm tazminat ve masraflar alacaklıdan 7 günlük muhtıra çıkarılarak iade alınır.</p>
      <p><strong>2. Haciz Fekki (Banka/Araç/Taşınmaz):</strong> Dosya borcu ödendiğinde veya icrayı durdurma teminat mektubu sunulduğunda 89/1 banka blokajları ve araç hacizleri derhal kaldırılmalıdır.</p>
      <p><strong>3. SMM %20 Stopaj Kesintisi:</strong> Karşı taraf vekalet ücreti ödenirken %20 Gelir Vergisi Stopajı kesilerek vergi dairesine beyan edilir ve icra dosyası infazen kapatılır.</p>
    `;
  }

  // 5. Temel İlkeler & Doktrin
  if (q.includes('ilke') || q.includes('zenginleşme') || q.includes('tazminat ilkesi') || q.includes('doktrin')) {
    return `
      <p><strong>Sigorta Hukukuna Hâkim Olan Temel Doktrin İlkeleri:</strong></p>
      <p><strong>1. Tazminat İlkesi (Indemnity Principle):</strong> TTK m. 1460 ve TBK m. 50 uyarınca sigorta tazminatı gerçek zararı aşamaz. Sigorta zenginleşme aracı olamaz.</p>
      <p><strong>2. Azami İyiniyet (Uberrimae Fidei):</strong> TTK m. 1435 beyan yükümlülüğü uyarınca sigortalı gerçeğe uygun beyanda bulunmak zorundadır.</p>
      <p><strong>3. Halefiyet ve Rücu (TTK m. 1472):</strong> Sigortacı tazminatı ödediğinde halef olur ve 3. kişilere rücu eder; çifte tazminat yasaktır.</p>
    `;
  }

  // General Insurance Defense Response
  return `
    <p>Sorunuz sigorta şirketi vekilliği perspektifiyle değerlendirilmiştir.</p>
    <p>Sigorta hukukunda temel prensip; poliçe şartları, TTK m. 1401-1520 hükümleri ve Yargıtay Hukuk Genel Kurulu kararları çerçevesinde <strong>gerçek zararın poliçe limiti içinde tazmini</strong>dir.</p>
    <p>Aktif dosyanızla ilgili net hesaplama veya dilekçe taslağı almak isterseniz sol menüdeki adımları doldurup <strong>"Aktif dosya risk analizi"</strong> butonuna tıklayabilirsiniz.</p>
  `;
}

document.addEventListener('DOMContentLoaded', () => { toggleCezaFields(); toggleBedeniFields(); calculateTotals(); updateKusur(); });
