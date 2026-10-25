/**
 * ============================================================================
 * 5. SINIF İNGİLİZCE - MAARİF MODELİ GÜNLÜK KELİME BOTU (GOOGLE APPS SCRIPT)
 * ============================================================================
 * Gönderici : Erenlearn@gmail.com (Bu scripti Erenlearn hesabı ile açtığınızda)
 * Alıcı     : Erencekin1@gmail.com
 * Zamanlama : Her sabah saat 06:00 - 07:00 arası (Google Cloud zamanlayıcısı ile)
 * ============================================================================
 */

// YAPILANDIRMA AYARLARI
const ALICI_EPOSTA = "Erencekin1@gmail.com";
const GUNLUK_KELIME_SAYISI = 10;
const UNITE_ADI = "Ünite 1: School Life (Okul Hayatı)";

// 1. ÜNİTE KELİME VE KALIP LİSTESİ (114 ÖĞE)
const KELIMELER = [
  {
    "no": 1,
    "cat": "People at School (Okuldaki Kişiler)",
    "en": "art teacher",
    "tr": "resim öğretmeni",
    "desc": "Meslek / Kişi"
  },
  {
    "no": 2,
    "cat": "People at School (Okuldaki Kişiler)",
    "en": "assistant",
    "tr": "yardımcı personel",
    "desc": "Meslek / Kişi"
  },
  {
    "no": 3,
    "cat": "People at School (Okuldaki Kişiler)",
    "en": "assistant to the headmaster",
    "tr": "müdür yardımcısı",
    "desc": "Meslek / Kişi"
  },
  {
    "no": 4,
    "cat": "People at School (Okuldaki Kişiler)",
    "en": "classmate",
    "tr": "sınıf arkadaşı",
    "desc": "Kişi"
  },
  {
    "no": 5,
    "cat": "People at School (Okuldaki Kişiler)",
    "en": "cleaner",
    "tr": "hizmetli / temizlik görevlisi",
    "desc": "Meslek / Kişi"
  },
  {
    "no": 6,
    "cat": "People at School (Okuldaki Kişiler)",
    "en": "coach",
    "tr": "antrenör",
    "desc": "Meslek / Kişi"
  },
  {
    "no": 7,
    "cat": "People at School (Okuldaki Kişiler)",
    "en": "computer teacher",
    "tr": "bilgisayar öğretmeni",
    "desc": "Meslek / Kişi"
  },
  {
    "no": 8,
    "cat": "People at School (Okuldaki Kişiler)",
    "en": "English teacher",
    "tr": "İngilizce öğretmeni",
    "desc": "Meslek / Kişi"
  },
  {
    "no": 9,
    "cat": "People at School (Okuldaki Kişiler)",
    "en": "headmaster",
    "tr": "müdür (erkek)",
    "desc": "Meslek / Kişi"
  },
  {
    "no": 10,
    "cat": "People at School (Okuldaki Kişiler)",
    "en": "headmistress",
    "tr": "müdür (kadın)",
    "desc": "Meslek / Kişi"
  },
  {
    "no": 11,
    "cat": "People at School (Okuldaki Kişiler)",
    "en": "librarian",
    "tr": "kütüphaneci",
    "desc": "Meslek / Kişi"
  },
  {
    "no": 12,
    "cat": "People at School (Okuldaki Kişiler)",
    "en": "music teacher",
    "tr": "müzik öğretmeni",
    "desc": "Meslek / Kişi"
  },
  {
    "no": 13,
    "cat": "People at School (Okuldaki Kişiler)",
    "en": "P.E. teacher",
    "tr": "beden eğitimi öğretmeni",
    "desc": "Meslek / Kişi"
  },
  {
    "no": 14,
    "cat": "People at School (Okuldaki Kişiler)",
    "en": "principal",
    "tr": "okul müdürü",
    "desc": "Meslek / Kişi"
  },
  {
    "no": 15,
    "cat": "People at School (Okuldaki Kişiler)",
    "en": "school nurse",
    "tr": "okul hemşiresi",
    "desc": "Meslek / Kişi"
  },
  {
    "no": 16,
    "cat": "People at School (Okuldaki Kişiler)",
    "en": "science teacher",
    "tr": "fen bilimleri öğretmeni",
    "desc": "Meslek / Kişi"
  },
  {
    "no": 17,
    "cat": "People at School (Okuldaki Kişiler)",
    "en": "secretary",
    "tr": "sekreter",
    "desc": "Meslek / Kişi"
  },
  {
    "no": 18,
    "cat": "People at School (Okuldaki Kişiler)",
    "en": "security guard",
    "tr": "güvenlik görevlisi",
    "desc": "Meslek / Kişi"
  },
  {
    "no": 19,
    "cat": "People at School (Okuldaki Kişiler)",
    "en": "student",
    "tr": "öğrenci",
    "desc": "Kişi"
  },
  {
    "no": 20,
    "cat": "People at School (Okuldaki Kişiler)",
    "en": "teacher",
    "tr": "öğretmen",
    "desc": "Meslek / Kişi"
  },
  {
    "no": 21,
    "cat": "Places at School (Okuldaki Yerler)",
    "en": "administration department",
    "tr": "idari bölüm",
    "desc": "Yer / Mekân"
  },
  {
    "no": 22,
    "cat": "Places at School (Okuldaki Yerler)",
    "en": "canteen",
    "tr": "kantin",
    "desc": "Yer / Mekân"
  },
  {
    "no": 23,
    "cat": "Places at School (Okuldaki Yerler)",
    "en": "classroom",
    "tr": "sınıf",
    "desc": "Yer / Mekân"
  },
  {
    "no": 24,
    "cat": "Places at School (Okuldaki Yerler)",
    "en": "conference hall",
    "tr": "konferans salonu",
    "desc": "Yer / Mekân"
  },
  {
    "no": 25,
    "cat": "Places at School (Okuldaki Yerler)",
    "en": "corridor",
    "tr": "koridor",
    "desc": "Yer / Mekân"
  },
  {
    "no": 26,
    "cat": "Places at School (Okuldaki Yerler)",
    "en": "department",
    "tr": "bölüm",
    "desc": "Yer / Mekân"
  },
  {
    "no": 27,
    "cat": "Places at School (Okuldaki Yerler)",
    "en": "garden",
    "tr": "bahçe",
    "desc": "Yer / Mekân"
  },
  {
    "no": 28,
    "cat": "Places at School (Okuldaki Yerler)",
    "en": "gate",
    "tr": "giriş kapısı",
    "desc": "Yer / Nesne"
  },
  {
    "no": 29,
    "cat": "Places at School (Okuldaki Yerler)",
    "en": "gym",
    "tr": "spor salonu",
    "desc": "Yer / Mekân"
  },
  {
    "no": 30,
    "cat": "Places at School (Okuldaki Yerler)",
    "en": "lab / science lab",
    "tr": "fen laboratuvarı",
    "desc": "Yer / Mekân"
  },
  {
    "no": 31,
    "cat": "Places at School (Okuldaki Yerler)",
    "en": "library",
    "tr": "kütüphane",
    "desc": "Yer / Mekân"
  },
  {
    "no": 32,
    "cat": "Places at School (Okuldaki Yerler)",
    "en": "lunch hall / lunchroom",
    "tr": "yemekhane",
    "desc": "Yer / Mekân"
  },
  {
    "no": 33,
    "cat": "Places at School (Okuldaki Yerler)",
    "en": "noticeboard",
    "tr": "duyuru panosu",
    "desc": "Eşya / Nesne"
  },
  {
    "no": 34,
    "cat": "Places at School (Okuldaki Yerler)",
    "en": "playground",
    "tr": "oyun alanı / bahçesi",
    "desc": "Yer / Mekân"
  },
  {
    "no": 35,
    "cat": "Places at School (Okuldaki Yerler)",
    "en": "sports field",
    "tr": "spor sahası",
    "desc": "Yer / Mekân"
  },
  {
    "no": 36,
    "cat": "Places at School (Okuldaki Yerler)",
    "en": "teachers' room",
    "tr": "öğretmenler odası",
    "desc": "Yer / Mekân"
  },
  {
    "no": 37,
    "cat": "School Clubs (Okul Kulüpleri)",
    "en": "art club",
    "tr": "resim / sanat kulübü",
    "desc": "Kulüp"
  },
  {
    "no": 38,
    "cat": "School Clubs (Okul Kulüpleri)",
    "en": "ballet club",
    "tr": "bale kulübü",
    "desc": "Kulüp"
  },
  {
    "no": 39,
    "cat": "School Clubs (Okul Kulüpleri)",
    "en": "chess club",
    "tr": "satranç kulübü",
    "desc": "Kulüp"
  },
  {
    "no": 40,
    "cat": "School Clubs (Okul Kulüpleri)",
    "en": "drama club",
    "tr": "tiyatro kulübü",
    "desc": "Kulüp"
  },
  {
    "no": 41,
    "cat": "School Clubs (Okul Kulüpleri)",
    "en": "environment club",
    "tr": "çevre kulübü",
    "desc": "Kulüp"
  },
  {
    "no": 42,
    "cat": "School Clubs (Okul Kulüpleri)",
    "en": "film club",
    "tr": "film / sinema kulübü",
    "desc": "Kulüp"
  },
  {
    "no": 43,
    "cat": "School Clubs (Okul Kulüpleri)",
    "en": "folk-dance club",
    "tr": "halk oyunları kulübü",
    "desc": "Kulüp"
  },
  {
    "no": 44,
    "cat": "School Clubs (Okul Kulüpleri)",
    "en": "math(s) club",
    "tr": "matematik kulübü",
    "desc": "Kulüp"
  },
  {
    "no": 45,
    "cat": "School Clubs (Okul Kulüpleri)",
    "en": "music club",
    "tr": "müzik kulübü",
    "desc": "Kulüp"
  },
  {
    "no": 46,
    "cat": "School Clubs (Okul Kulüpleri)",
    "en": "origami club",
    "tr": "origami kulübü",
    "desc": "Kulüp"
  },
  {
    "no": 47,
    "cat": "School Clubs (Okul Kulüpleri)",
    "en": "science club",
    "tr": "fen / bilim kulübü",
    "desc": "Kulüp"
  },
  {
    "no": 48,
    "cat": "School Clubs (Okul Kulüpleri)",
    "en": "sports club",
    "tr": "spor kulübü",
    "desc": "Kulüp"
  },
  {
    "no": 49,
    "cat": "School Clubs (Okul Kulüpleri)",
    "en": "technology club",
    "tr": "teknoloji kulübü",
    "desc": "Kulüp"
  },
  {
    "no": 50,
    "cat": "Countries (Ülkeler)",
    "en": "Argentina",
    "tr": "Arjantin",
    "desc": "Ülke"
  },
  {
    "no": 51,
    "cat": "Countries (Ülkeler)",
    "en": "Australia",
    "tr": "Avustralya",
    "desc": "Ülke"
  },
  {
    "no": 52,
    "cat": "Countries (Ülkeler)",
    "en": "Azerbaijan",
    "tr": "Azerbaycan",
    "desc": "Ülke"
  },
  {
    "no": 53,
    "cat": "Countries (Ülkeler)",
    "en": "Brazil",
    "tr": "Brezilya",
    "desc": "Ülke"
  },
  {
    "no": 54,
    "cat": "Countries (Ülkeler)",
    "en": "Canada",
    "tr": "Kanada",
    "desc": "Ülke"
  },
  {
    "no": 55,
    "cat": "Countries (Ülkeler)",
    "en": "China",
    "tr": "Çin",
    "desc": "Ülke"
  },
  {
    "no": 56,
    "cat": "Countries (Ülkeler)",
    "en": "Egypt",
    "tr": "Mısır",
    "desc": "Ülke"
  },
  {
    "no": 57,
    "cat": "Countries (Ülkeler)",
    "en": "England",
    "tr": "İngiltere",
    "desc": "Ülke"
  },
  {
    "no": 58,
    "cat": "Countries (Ülkeler)",
    "en": "France",
    "tr": "Fransa",
    "desc": "Ülke"
  },
  {
    "no": 59,
    "cat": "Countries (Ülkeler)",
    "en": "Germany",
    "tr": "Almanya",
    "desc": "Ülke"
  },
  {
    "no": 60,
    "cat": "Countries (Ülkeler)",
    "en": "Greece",
    "tr": "Yunanistan",
    "desc": "Ülke"
  },
  {
    "no": 61,
    "cat": "Countries (Ülkeler)",
    "en": "Italy",
    "tr": "İtalya",
    "desc": "Ülke"
  },
  {
    "no": 62,
    "cat": "Countries (Ülkeler)",
    "en": "Japan",
    "tr": "Japonya",
    "desc": "Ülke"
  },
  {
    "no": 63,
    "cat": "Countries (Ülkeler)",
    "en": "Kazakhstan",
    "tr": "Kazakistan",
    "desc": "Ülke"
  },
  {
    "no": 64,
    "cat": "Countries (Ülkeler)",
    "en": "Kyrgyzstan",
    "tr": "Kırgızistan",
    "desc": "Ülke"
  },
  {
    "no": 65,
    "cat": "Countries (Ülkeler)",
    "en": "Mexico",
    "tr": "Meksika",
    "desc": "Ülke"
  },
  {
    "no": 66,
    "cat": "Countries (Ülkeler)",
    "en": "Russia",
    "tr": "Rusya",
    "desc": "Ülke"
  },
  {
    "no": 67,
    "cat": "Countries (Ülkeler)",
    "en": "Scotland",
    "tr": "İskoçya",
    "desc": "Ülke"
  },
  {
    "no": 68,
    "cat": "Countries (Ülkeler)",
    "en": "Singapore",
    "tr": "Singapur",
    "desc": "Ülke"
  },
  {
    "no": 69,
    "cat": "Countries (Ülkeler)",
    "en": "South Africa",
    "tr": "Güney Afrika",
    "desc": "Ülke"
  },
  {
    "no": 70,
    "cat": "Countries (Ülkeler)",
    "en": "South Korea",
    "tr": "Güney Kore",
    "desc": "Ülke"
  },
  {
    "no": 71,
    "cat": "Countries (Ülkeler)",
    "en": "Spain",
    "tr": "İspanya",
    "desc": "Ülke"
  },
  {
    "no": 72,
    "cat": "Countries (Ülkeler)",
    "en": "Thailand",
    "tr": "Tayland",
    "desc": "Ülke"
  },
  {
    "no": 73,
    "cat": "Countries (Ülkeler)",
    "en": "The Turkish Republic of Northern Cyprus",
    "tr": "Kuzey Kıbrıs Türk Cumhuriyeti",
    "desc": "Ülke"
  },
  {
    "no": 74,
    "cat": "Countries (Ülkeler)",
    "en": "The United Kingdom (UK) (England, Scotland, Northern Ireland, Wales)",
    "tr": "Birleşik Krallık (İngiltere, İskoçya, Kuzey İrlanda, Galler)",
    "desc": "Ülke"
  },
  {
    "no": 75,
    "cat": "Countries (Ülkeler)",
    "en": "The United States of America (USA)",
    "tr": "Amerika Birleşik Devletleri (ABD)",
    "desc": "Ülke"
  },
  {
    "no": 76,
    "cat": "Countries (Ülkeler)",
    "en": "Turkmenistan",
    "tr": "Türkmenistan",
    "desc": "Ülke"
  },
  {
    "no": 77,
    "cat": "Countries (Ülkeler)",
    "en": "Türkiye",
    "tr": "Türkiye",
    "desc": "Ülke"
  },
  {
    "no": 78,
    "cat": "Countries (Ülkeler)",
    "en": "Uzbekistan",
    "tr": "Özbekistan",
    "desc": "Ülke"
  },
  {
    "no": 79,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Be on time.",
    "tr": "Zamanında gel.",
    "desc": "Kural / Emir Cümlesi"
  },
  {
    "no": 80,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Be quiet.",
    "tr": "Sessiz ol.",
    "desc": "Kural / Emir Cümlesi"
  },
  {
    "no": 81,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Clean the board.",
    "tr": "Tahtayı temizle.",
    "desc": "Kural / Emir Cümlesi"
  },
  {
    "no": 82,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Do your homework.",
    "tr": "Ödevini yap.",
    "desc": "Kural / Emir Cümlesi"
  },
  {
    "no": 83,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Follow / Obey the rules.",
    "tr": "Kurallara uy.",
    "desc": "Kural / Emir Cümlesi"
  },
  {
    "no": 84,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Keep common areas clean.",
    "tr": "Ortak alanları temiz tut!",
    "desc": "Kural / Emir Cümlesi"
  },
  {
    "no": 85,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Keep your classroom clean.",
    "tr": "Sınıfını temiz tut!",
    "desc": "Kural / Emir Cümlesi"
  },
  {
    "no": 86,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Line up.",
    "tr": "Sıraya gir.",
    "desc": "Kural / Emir Cümlesi"
  },
  {
    "no": 87,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Listen to the teacher.",
    "tr": "Öğretmeni dinle.",
    "desc": "Kural / Emir Cümlesi"
  },
  {
    "no": 88,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Play safe.",
    "tr": "Dikkatli / güvenli oyna!",
    "desc": "Kural / Emir Cümlesi"
  },
  {
    "no": 89,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Raise your hand.",
    "tr": "Elini kaldır.",
    "desc": "Kural / Emir Cümlesi"
  },
  {
    "no": 90,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Respect your friends.",
    "tr": "Arkadaşlarına saygı göster.",
    "desc": "Kural / Emir Cümlesi"
  },
  {
    "no": 91,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Wear your uniform / Wear your school uniform.",
    "tr": "Okul üniformanı giy.",
    "desc": "Kural / Emir Cümlesi"
  },
  {
    "no": 92,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Work in groups.",
    "tr": "Grup çalışması yap.",
    "desc": "Kural / Emir Cümlesi"
  },
  {
    "no": 93,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Don't be late.",
    "tr": "Geç kalma.",
    "desc": "Kural / Yasak"
  },
  {
    "no": 94,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Don't be late for lessons and activities.",
    "tr": "Derslere ve aktivitelere geç kalma!",
    "desc": "Kural / Yasak"
  },
  {
    "no": 95,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Don't be rude.",
    "tr": "Kaba olma.",
    "desc": "Kural / Yasak"
  },
  {
    "no": 96,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Don't eat in class.",
    "tr": "Sınıfta yemek yeme.",
    "desc": "Kural / Yasak"
  },
  {
    "no": 97,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Don't fight.",
    "tr": "Kavga etme.",
    "desc": "Kural / Yasak"
  },
  {
    "no": 98,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Don't make noise / Don't make a noise.",
    "tr": "Gürültü yapma.",
    "desc": "Kural / Yasak"
  },
  {
    "no": 99,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Don't run in the classroom.",
    "tr": "Sınıfta koşma!",
    "desc": "Kural / Yasak"
  },
  {
    "no": 100,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Don't run in the corridors.",
    "tr": "Koridorda koşma.",
    "desc": "Kural / Yasak"
  },
  {
    "no": 101,
    "cat": "School Rules (Okul Kuralları)",
    "en": "Don't shout.",
    "tr": "Bağırma.",
    "desc": "Kural / Yasak"
  },
  {
    "no": 102,
    "cat": "National & Religious Days (Bayramlar)",
    "en": "15 July Democracy and National Unity Day",
    "tr": "15 Temmuz Demokrasi ve Millî Birlik Günü",
    "desc": "Millî Bayram / Gün"
  },
  {
    "no": 103,
    "cat": "National & Religious Days (Bayramlar)",
    "en": "Commemoration of Atatürk, Youth and Sports Day (19 May)",
    "tr": "19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı",
    "desc": "Millî Bayram"
  },
  {
    "no": 104,
    "cat": "National & Religious Days (Bayramlar)",
    "en": "National Sovereignty and Children's Day (23 April)",
    "tr": "23 Nisan Ulusal Egemenlik ve Çocuk Bayramı",
    "desc": "Millî Bayram"
  },
  {
    "no": 105,
    "cat": "National & Religious Days (Bayramlar)",
    "en": "Republic Day (29 October)",
    "tr": "29 Ekim Cumhuriyet Bayramı",
    "desc": "Millî Bayram"
  },
  {
    "no": 106,
    "cat": "National & Religious Days (Bayramlar)",
    "en": "Victory Day (30 August)",
    "tr": "30 Ağustos Zafer Bayramı",
    "desc": "Millî Bayram"
  },
  {
    "no": 107,
    "cat": "National & Religious Days (Bayramlar)",
    "en": "Eid al-Fitr",
    "tr": "Ramazan Bayramı",
    "desc": "Dinî Bayram"
  },
  {
    "no": 108,
    "cat": "National & Religious Days (Bayramlar)",
    "en": "Eid al-Adha",
    "tr": "Kurban Bayramı",
    "desc": "Dinî Bayram"
  },
  {
    "no": 109,
    "cat": "Important Expressions (Önemli İfadeler & Soru-Cevap)",
    "en": "Where is she from? — She is from Türkiye.",
    "tr": "O nereli? — O Türkiyeli.",
    "desc": "Soru & Cevap"
  },
  {
    "no": 110,
    "cat": "Important Expressions (Önemli İfadeler & Soru-Cevap)",
    "en": "What is your favourite school club? — It is environment club.",
    "tr": "En sevdiğin okul kulübü ne? — Çevre kulübü.",
    "desc": "Soru & Cevap"
  },
  {
    "no": 111,
    "cat": "Important Expressions (Önemli İfadeler & Soru-Cevap)",
    "en": "Do you like playing the guitar? — Yes, I do.",
    "tr": "Gitar çalmayı sever misin? — Evet, severim.",
    "desc": "Soru & Cevap"
  },
  {
    "no": 112,
    "cat": "Important Expressions (Önemli İfadeler & Soru-Cevap)",
    "en": "Where is the coach? — He is in the sports field.",
    "tr": "Antrenör nerede? — O, spor alanında.",
    "desc": "Soru & Cevap"
  },
  {
    "no": 113,
    "cat": "Important Expressions (Önemli İfadeler & Soru-Cevap)",
    "en": "What can't you do in Singapore? — I can't chew gum in public.",
    "tr": "Singapur'da ne yapamazsın? — Halka açık yerlerde sakız çiğneyemem.",
    "desc": "Soru & Cevap"
  },
  {
    "no": 114,
    "cat": "Important Expressions (Önemli İfadeler & Soru-Cevap)",
    "en": "What are the rules in your school? — I must wear my uniform.",
    "tr": "Okulundaki kurallar ne? — Üniformamı giymeliyim.",
    "desc": "Soru & Cevap"
  }
];

/**
 * 1. HER SABAH 06:00 - 07:00 ARASINDA ÇALIŞACAK ANA FONKSİYON
 */
function gunlukGonder() {
  const props = PropertiesService.getScriptProperties();
  let lastIndex = parseInt(props.getProperty("LAST_INDEX") || "0", 10);
  let cycle = parseInt(props.getProperty("CYCLE") || "1", 10);
  
  const totalWords = KELIMELER.length;
  const totalDays = Math.ceil(totalWords / GUNLUK_KELIME_SAYISI);

  // Ünite tamamlandıysa başa sar
  if (lastIndex >= totalWords) {
    lastIndex = 0;
    cycle += 1;
    props.setProperty("CYCLE", cycle.toString());
  }

  const endIndex = Math.min(lastIndex + GUNLUK_KELIME_SAYISI, totalWords);
  const selectedWords = KELIMELER.slice(lastIndex, endIndex);
  const dayNo = Math.floor(lastIndex / GUNLUK_KELIME_SAYISI) + 1;
  const progressPercent = Math.min(100, Math.round((endIndex / totalWords) * 100));

  const subject = "🇬🇧 Günün İngilizce Kelimeleri | " + UNITE_ADI + " (Gün " + dayNo + "/" + totalDays + ")";
  const htmlBody = olusturHtmlBulten(selectedWords, dayNo, totalDays, progressPercent, cycle);
  const plainBody = olusturDuzMetin(selectedWords, dayNo, totalDays);

  GmailApp.sendEmail(ALICI_EPOSTA, subject, plainBody, {
    name: "Kelime Botu (Maarif Modeli)",
    htmlBody: htmlBody
  });

  // İlerlemeyi kaydet
  props.setProperty("LAST_INDEX", endIndex.toString());
  props.setProperty("LAST_SENT_DATE", new Date().toISOString().slice(0, 10));
  
  Logger.log("BAŞARILI: Gün " + dayNo + " gönderildi. Yeni indeks: " + endIndex + " / " + totalWords);
}

/**
 * 2. TEST VE ÖNİZLEME FONKSİYONU (İlerlemeyi kaydetmez)
 */
function testGonder() {
  const totalWords = KELIMELER.length;
  const totalDays = Math.ceil(totalWords / GUNLUK_KELIME_SAYISI);
  const selectedWords = KELIMELER.slice(0, GUNLUK_KELIME_SAYISI);
  
  const subject = "[TEST/ÖNİZLEME] 🇬🇧 Günün İngilizce Kelimeleri | " + UNITE_ADI;
  const htmlBody = olusturHtmlBulten(selectedWords, 1, totalDays, 9, 1);
  const plainBody = olusturDuzMetin(selectedWords, 1, totalDays);

  GmailApp.sendEmail(ALICI_EPOSTA, subject, plainBody, {
    name: "Kelime Botu (Maarif Modeli)",
    htmlBody: htmlBody
  });
  
  Logger.log("Test e-postası başarıyla gönderildi!");
}

/**
 * 3. OTOMATİK ZAMANLAYICIYI KURAN FONKSİYON (HER SABAH 06:00 - 07:00 ARASI)
 */
function zamanlayiciyiKur() {
  // Eski tetikleyicileri temizle
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "gunlukGonder") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Her sabah saat 06:00 - 07:00 arasında otomatik çalışacak tetikleyici kur
  ScriptApp.newTrigger("gunlukGonder")
    .timeBased()
    .atHour(6)
    .everyDays(1)
    .create();

  Logger.log("✅ Zamanlayıcı başarıyla kuruldu! Her sabah 06:00-07:00 arasında otomatik gönderilecek.");
}

/**
 * 4. İLERLEMEYİ SIFIRLAMA FONKSİYONU
 */
function ilerlemeyiSifirla() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty("LAST_INDEX", "0");
  props.setProperty("CYCLE", "1");
  Logger.log("İlerleme sıfırlandı. 1. kelimeden başlanacak.");
}

/**
 * HTML BÜLTEN ŞABLONU
 */
function olusturHtmlBulten(words, dayNo, totalDays, progressPercent, cycle) {
  const d = new Date();
  const dateStr = Utilities.formatDate(d, Session.getScriptTimeZone(), "dd.MM.yyyy");

  let wordCards = "";
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    wordCards += `
      <tr>
        <td style="padding: 8px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; border-left: 5px solid #4F46E5; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
            <tr>
              <td style="padding: 16px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size: 11px; font-weight: 700; color: #4F46E5; text-transform: uppercase; letter-spacing: 0.5px;">
                      #` + w.no + ` &nbsp;•&nbsp; <span style="background-color: #EEF2FF; color: #4338CA; padding: 3px 8px; border-radius: 6px;">` + w.cat + `</span>
                    </td>
                    <td align="right" style="font-size: 11px; color: #64748B; font-weight: 500;">
                      ` + w.desc + `
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top: 10px;">
                      <span style="font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
                        ` + w.en + `
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top: 6px;">
                      <span style="font-size: 15px; font-weight: 600; color: #0D9488;">
                        👉 ` + w.tr + `
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }

  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>5. Sınıf İngilizce Günlük Kelimeler</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
      
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 30px 15px;">
        <tr>
          <td align="center">
            
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
              
              <tr>
                <td style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 32px 24px; text-align: center; color: #FFFFFF;">
                  <div style="font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; opacity: 0.9; margin-bottom: 8px;">
                    📚 Türkiye Yüzyılı Maarif Modeli
                  </div>
                  <h1 style="margin: 0; font-size: 24px; font-weight: 800; line-height: 1.3;">
                    5. Sınıf İngilizce Kelime Günlüğü
                  </h1>
                  <div style="margin-top: 6px; font-size: 15px; opacity: 0.95;">
                    Ünite 1: School Life (Okul Hayatı)
                  </div>
                  
                  <div style="margin-top: 18px; display: inline-block; background: rgba(255,255,255,0.18); padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                    📅 ` + dateStr + ` &nbsp;|&nbsp; ☁️ Google Cloud Gönderimi
                  </div>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 24px 24px 12px 24px; background-color: #F1F5F9;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size: 13px; font-weight: 700; color: #1E293B;">
                        📊 Ünite İlerlemesi: <span style="color: #4F46E5;">Gün ` + dayNo + ` / ` + totalDays + `</span>
                        ` + (cycle > 1 ? ` (Döngü ` + cycle + `)` : '') + `
                      </td>
                      <td align="right" style="font-size: 13px; font-weight: 700; color: #4F46E5;">
                        %` + progressPercent + ` Tamamlandı
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding-top: 8px;">
                        <div style="width: 100%; height: 8px; background-color: #CBD5E1; border-radius: 4px; overflow: hidden;">
                          <div style="width: ` + progressPercent + `%; height: 100%; background-color: #4F46E5; border-radius: 4px;"></div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding-top: 8px; font-size: 12px; color: #64748B;">
                        Bugün çalışılacak: <strong>` + words.length + ` Kelime</strong> (Sıra: ` + words[0].no + ` – ` + words[words.length - 1].no + `)
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 16px 20px 24px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ` + wordCards + `
                  </table>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 0 20px 24px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FEF3C7; border: 1px dashed #F59E0B; border-radius: 10px; padding: 14px 18px;">
                    <tr>
                      <td style="font-size: 13px; color: #92400E; line-height: 1.5;">
                        💡 <strong>Öğrenme Tavsiyesi:</strong> Bu kelimeleri gün içinde en az 2 kez sesli olarak tekrar edin ve her biriyle okul hayatına dair kısa birer örnek cümle kurmayı deneyin.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px; text-align: center; font-size: 12px; color: #94A3B8;">
                  <p style="margin: 0 0 6px 0;">Bu e-posta, <strong>Google Cloud (Apps Script)</strong> tarafından bilgisayarınız kapalı olsa bile otomatik iletilmektedir.</p>
                  <p style="margin: 0; font-size: 11px;">İdeal Öğretmenin Maarif Seti • 5. Sınıf İngilizce</p>
                </td>
              </tr>
              
            </table>
            
          </td>
        </tr>
      </table>
      
    </body>
    </html>
  `;
}

/**
 * DÜZ METİN FORMATI (FALLBACK)
 */
function olusturDuzMetin(words, dayNo, totalDays) {
  let lines = [
    "5. SINIF İNGİLİZCE KELİME GÜNLÜĞÜ",
    UNITE_ADI,
    "Gün " + dayNo + " / " + totalDays,
    "========================================",
    ""
  ];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    lines.push("#" + w.no + " [" + w.cat + "] - " + w.desc);
    lines.push("🇬🇧 " + w.en);
    lines.push("🇹🇷 " + w.tr);
    lines.push("------------------------------");
  }
  lines.push("\nGoogle Cloud Otomasyonu ile her sabah otomatik gönderilir.");
  return lines.join("\n");
}
