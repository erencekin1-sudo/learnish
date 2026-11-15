#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Learnish - K-12 MEB İngilizce Müfredatı ve Yıllık Çerçeve Plan Derleyicisi
1. Sınıftan 12. Sınıfa Kadar Haftalık Planlar, Kazanımlar ve Bağlama (Context Classifier) Motoru
"""

import os
import sys
import re
import json
import zipfile
import xml.etree.ElementTree as ET

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXCEL_PATH = os.path.join(BASE_DIR, 'belgeler', 'İNGİLİZCE (2-8. SINIF) TASLAK YILLIK ÇERÇEVE PLAN.xlsx')
OUTPUT_JS_PATH = os.path.join(BASE_DIR, 'curriculum-data.js')

def log(msg):
    print(f"[Curriculum Builder] {msg}")

def clean_text(s):
    if not s:
        return ''
    return ' '.join(s.split()).strip()

def extract_subthemes_and_focus(content):
    if not content:
        return ''
    m = re.search(r'Sub-Themes?:\s*(.*?)(?=\n\s*(?:Target\s+Vocabulary|Target\s+Grammatical|Functions\b|\*|\Z))', content, re.IGNORECASE | re.DOTALL)
    if m:
        return clean_text(m.group(1))
    lines = [line.strip() for line in content.split('\n') if line.strip()]
    header_lines = []
    for line in lines:
        if line.startswith('—') or line.startswith('-') or '?' in line:
            break
        header_lines.append(line)
        if len(header_lines) >= 2:
            break
    if header_lines:
        return clean_text(' / '.join(header_lines))
    return clean_text(content[:150])

def extract_communicative_functions(content):
    if not content:
        return ''
    m = re.search(r'Functions\s+of\s+the\s+Target\s+Grammatical\s+Structures\s+in\s+Use:\s*(.*?)(?=\n\s*(?:\*|Target\s+Social|\Z))', content, re.IGNORECASE | re.DOTALL)
    if m:
        return clean_text(m.group(1))
    m2 = re.search(r'Target\s+Grammatical\s+Structures\s+in\s+Use:\s*(.*?)(?=\n\s*(?:Functions|\*|\Z))', content, re.IGNORECASE | re.DOTALL)
    if m2:
        return clean_text(m2.group(1))
    lines = [line.strip() for line in content.split('\n') if line.strip()]
    if lines:
        return clean_text(' '.join(lines[:3]))
    return ''

def parse_learning_outcomes(raw):
    if not raw:
        return [], ''
    # Normalize typos e.g. ENG5. -> ENG.5. or ENG. 5. -> ENG.5.
    text = re.sub(r'\bENG\s*(\d+)\.', r'ENG.\1.', raw)
    text = re.sub(r'\bENG\.\s*(\d+)\.', r'ENG.\1.', text)
    pattern = r'((?:ENG\.\d+\.\d+\.[A-Z0-9]+|E\d+\.\d+\.[A-Z0-9]+))\s*[:.]?\s*(.*?)(?=(?:ENG\.\d+\.\d+\.[A-Z0-9]+|E\d+\.\d+\.[A-Z0-9]+|\Z))'
    matches = re.findall(pattern, text, re.DOTALL)
    outcomes_list = []
    headers_to_strip = [
        'Listening', 'Pronunciation', 'Reading', 'Vocabulary', 'Grammar',
        'Writing', 'Speaking', 'Spoken Interaction', 'Spoken Production'
    ]
    for code, desc in matches:
        clean_code = code.strip()
        clean_desc = clean_text(desc)
        for h in headers_to_strip:
            if clean_desc.endswith(' ' + h):
                clean_desc = clean_desc[:-len(' ' + h)].strip()
            elif clean_desc == h:
                clean_desc = ''
        skill = 'General'
        if '.L' in clean_code: skill = 'Listening'
        elif '.P' in clean_code: skill = 'Pronunciation'
        elif '.R' in clean_code: skill = 'Reading'
        elif '.V' in clean_code: skill = 'Vocabulary'
        elif '.G' in clean_code: skill = 'Grammar'
        elif '.W' in clean_code: skill = 'Writing'
        elif '.S' in clean_code or '.SI' in clean_code or '.SP' in clean_code: skill = 'Speaking'
        outcomes_list.append({'code': clean_code, 'skill': skill, 'text': clean_desc})
    
    full_text = ' '.join(f'{item["code"]}. {item["text"]}' for item in outcomes_list) if outcomes_list else clean_text(raw)
    return outcomes_list, full_text

def is_valid_vocab_word(w):
    w = clean_text(w)
    if not w or len(w) < 2 or len(w) > 40:
        return False
    lower = w.lower()
    blacklist = [
        'content frame', 'target', 'vocabulary', 'language chunks', 'functions', 'function',
        'social language', 'phonological', 'learning outcomes', 'revisional', 'expansion',
        'sub-themes', 'sub-theme', 'asking', 'making', 'giving', 'describing', 'talking',
        'expressing', 'identifying', 'telling', 'following', 'accepting', 'refusing', 'apologizing',
        'suggested', 'contexts', 'tasks', 'assignments', 'measurement', 'evaluation',
        'out-of-school', 'learning activities', 'students will', 'listening', 'speaking',
        'reading', 'writing', 'indicators', 'intercurricular', 'expansion objective'
    ]
    if any(b in lower for b in blacklist):
        return False
    if lower.startswith('http') or lower.startswith('unit') or lower.startswith('theme') or lower.startswith('week'):
        return False
    if not re.search(r'[a-zA-Z]', w):
        return False
    return True

def extract_vocab_from_text(text):
    words = []
    if not text:
        return words
    lines = text.split('\n')
    if 'Target Vocabulary' in text or 'Vocabulary for' in text:
        in_vocab = False
        for l in lines:
            if 'Target Vocabulary' in l or 'Vocabulary for' in l:
                in_vocab = True
            elif in_vocab and ('Target Language Chunks' in l or 'Target Social Language' in l or 'Target Phonological' in l or 'Sub-themes:' in l):
                in_vocab = False
            elif in_vocab:
                cleaned = re.sub(r'^(Nouns|Verbs|Adjectives|People in the school|Places in the school|Classroom furniture|Classroom objects|Classroom devices|Basic colours|Numbers|Parts of the body):\s*', '', l.strip())
                for item in re.split(r'[,;]\s*', cleaned):
                    w = re.sub(r'^(a|an|to)\s+', '', item.strip(), flags=re.IGNORECASE)
                    w = re.sub(r'\s*\([^)]*\)', '', w).strip()
                    if is_valid_vocab_word(w):
                        words.append(w.lower())
    else:
        for l in lines:
            l_str = l.strip()
            if re.match(r'^[a-zA-Z\s\'-]+(,\s*-[a-z]+)?$', l_str) and not l_str.startswith('—') and not l_str.endswith('?'):
                w = re.sub(r',\s*-[a-z]+', '', l_str).strip()
                if is_valid_vocab_word(w):
                    words.append(w.lower())
    return list(dict.fromkeys(words))

# Turkish Unit Titles Mapping
UNIT_TITLES_TR = {
    # Grade 1
    (1, 1): "Tanışma ve Selamlaşma",
    (1, 2): "Ailem ve Arkadaşlarım",
    (1, 3): "Renkler ve Gökkuşağı",
    (1, 4): "Sayılar ve Sayma (1-10)",
    (1, 5): "Sınıfım ve Oyuncaklarım",
    (1, 6): "Hayvanlar ve Evcil Dostlar",
    (1, 7): "Vücudum ve Sağlığım",
    (1, 8): "Meyveler ve Atıştırmalıklar",
    (1, 9): "Hareket ve Eylemler",
    (1, 10): "Doğa ve Hava Durumu",
    # Grade 2
    (2, 1): "Okul Yaşamı & Tanışma",
    (2, 2): "Sınıf Yaşamı, Eşyalar & Renkler",
    (2, 3): "Kişisel Yaşam, Vücut & Kıyafetler",
    (2, 4): "Aile Yaşamı & Fiziksel Görünüm",
    (2, 5): "Ev, Odalar & Mahalle",
    (2, 6): "Şehirde Yaşam & Temel Besinler",
    # Grade 3
    (3, 1): "Okul Yaşamı & Aylar",
    (3, 2): "Sınıf Yaşamı & Okul Araçları",
    (3, 3): "Kişisel Yaşam, Duygular & Hava",
    (3, 4): "Aile Yaşamı, Günlük Rutinler & Hobiler",
    (3, 5): "Kır Yaşamı, Çiftlik & Hayvanlar",
    (3, 6): "Şehirde Yaşam & Dışarıda Yemek",
    # Grade 4
    (4, 1): "Sınıf Kuralları & İzin İsteme",
    (4, 2): "Ülkeler ve Milliyetler",
    (4, 3): "Çizgi Film Karakterleri & Yetenekler",
    (4, 4): "Boş Zaman Aktiviteleri & Hobiler",
    (4, 5): "Günüm & Günlük Rutinler",
    (4, 6): "Bilimle Eğlence & Deneyler",
    (4, 7): "Meslekler & Çalışma Alanları",
    (4, 8): "Kıyafetlerim & Mevsimler",
    (4, 9): "Arkadaşlarım & Dış Görünüş",
    (4, 10): "Yiyecekler ve İçecekler",
    # Grade 5
    (5, 1): "Okul Yaşamı, Kulüpler & Ülkeler",
    (5, 2): "Sınıf Yaşamı, Dersler & Ders Programı",
    (5, 3): "Kişisel Yaşam, Rutinler & Sağlık",
    (5, 4): "Aile Yaşamı, Rutinler & Hobiler",
    (5, 5): "Mahalle ve Şehirde Yaşam, Mekanlar",
    (5, 6): "Dünyada Yaşam & Kültür, Restoran",
    (5, 7): "Doğada Yaşam & Vahşi Hayvanlar",
    (5, 8): "Evrende Yaşam, Gezegenler & Tatil",
    # Grade 6
    (6, 1): "Okul Yaşamı, Sorumluluklar & Rutinler",
    (6, 2): "Sınıf Yaşamı, Çalışma & Sayılar (100-500)",
    (6, 3): "Kişisel Yaşam, Karakter & Görünüş",
    (6, 4): "Aile Yaşamı, Meslekler & Ev Tipleri",
    (6, 5): "Mahalle ve Şehirde Yaşam, Festivaller",
    (6, 6): "Dünyada Yaşam, Kültür & Ülkeler",
    (6, 7): "Doğada Yaşam & Çevre Sorunları",
    (6, 8): "Evrende Yaşam, Gezegenler & Gelecek",
    # Grade 7
    (7, 1): "Dış Görünüş ve Kişilik",
    (7, 2): "Spor Dalları ve Rutinler",
    (7, 3): "Biyografiler ve Geçmiş Olaylar",
    (7, 4): "Vahşi Hayvanlar ve Yaşam Alanları",
    (7, 5): "Televizyon ve Medya Programları",
    (7, 6): "Kutlamalar ve Partiler",
    (7, 7): "Gelecek Hayalleri ve Tahminler",
    (7, 8): "Kamu Binaları ve Şehir Yaşamı",
    (7, 9): "Çevre Koruma ve Geri Dönüşüm",
    (7, 10): "Gezegenler ve Güneş Sistemi",
    # Grade 8
    (8, 1): "Arkadaşlık ve Kişisel Özellikler",
    (8, 2): "Gençlik Yaşamı ve Tercihler",
    (8, 3): "Mutfakta ve Yemek Pişirme",
    (8, 4): "Telefonda İletişim",
    (8, 5): "İnternet ve Dijital Dünya",
    (8, 6): "Macera ve Doğa Sporları",
    (8, 7): "Turizm ve Gezi Rehberi",
    (8, 8): "Ev İşleri ve Sorumluluklar",
    (8, 9): "Bilim ve Keşifler",
    (8, 10): "Doğal Afetler ve Çevre",
    # Grade 9
    (9, 1): "Yurt Dışında Eğitim & Tanışma",
    (9, 2): "Çevrem & Yaşam Alanım",
    (9, 3): "Filmler & Sinema Dünyası",
    (9, 4): "Doğada İnsan & Yaşam",
    (9, 5): "İlham Veren Kişilikler & Biyografiler",
    (9, 6): "Kültür Köprüleri & Gelenekler",
    (9, 7): "Dünya Mirası & Tarihi Eserler",
    (9, 8): "Acil Durumlar & Sağlık",
    (9, 9): "Davetler & Kutlamalar",
    (9, 10): "Televizyon & Sosyal Medya",
    # Grade 10
    (10, 1): "Lise Yaşamı & Çalışma Alışkanlıkları",
    (10, 2): "Gelecek Planları & Hedefler",
    (10, 3): "Efsanevi Figürler & Tarih",
    (10, 4): "Gelenekler & Kültürel Değerler",
    (10, 5): "Seyahat & Keşif",
    (10, 6): "Faydalı İpuçları & Yaşam Becerileri",
    (10, 7): "Dünya Mutfakları & Festivaller",
    (10, 8): "Dijital Çağ & Teknoloji",
    (10, 9): "Modern Çağın Kahramanları",
    (10, 10): "Alışveriş & Tüketici Alışkanlıkları",
    # Grade 11
    (11, 1): "Geleceğin Meslekleri & Kariyer",
    (11, 2): "Hobiler, Yetenekler & Sanat",
    (11, 3): "Zor Zamanlar & Dayanıklılık",
    (11, 4): "Büyük Başarılar & Yaşam Öyküleri",
    (11, 5): "Geçmişe Yolculuk & Nostalji",
    (11, 6): "Empati, Yardımlaşma & Gönüllülük",
    (11, 7): "Türkiye'nin Değerleri & Coğrafyası",
    (11, 8): "Spor & Sağlıklı Yaşam",
    (11, 9): "Dostluk & Sosyal İlişkiler",
    (11, 10): "Etik, Değerler & Toplumsal Normlar",
    # Grade 12
    (12, 1): "Müzik & Sanatsal İfade",
    (12, 2): "Dostluk & İnsan İlişkileri",
    (12, 3): "İnsan Hakları & Küresel Vatandaşlık",
    (12, 4): "Gelecek Teknolojileri & Yapay Zeka",
    (12, 5): "Psikoloji & Zihinsel Sağlık",
    (12, 6): "İyilik, Dayanışma & Toplum",
    (12, 7): "Haberler, Medya & Gazetecilik",
    (12, 8): "Yenilenebilir Enerji & Çevre",
    (12, 9): "Teknoloji, İnovasyon & Siber Güvenlik",
    (12, 10): "Nezaket & Protokol Kuralları"
}

# Semantic Keywords for Unit Classification Engine ("Bağlama Motoru")
UNIT_KEYWORDS = {
    # Grade 1
    (1, 1): ['hello', 'hi', 'goodbye', 'bye', 'morning', 'afternoon', 'evening', 'night', 'name', 'friend', 'meet', 'greet', 'welcome'],
    (1, 2): ['family', 'mother', 'father', 'brother', 'sister', 'baby', 'grandmother', 'grandfather', 'parents', 'kid', 'child'],
    (1, 3): ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'grey', 'color', 'rainbow'],
    (1, 4): ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'number', 'count', 'how many'],
    (1, 5): ['pencil', 'pen', 'book', 'bag', 'desk', 'chair', 'ball', 'doll', 'car', 'train', 'toy', 'play', 'box'],
    (1, 6): ['cat', 'dog', 'bird', 'fish', 'rabbit', 'cow', 'horse', 'sheep', 'duck', 'chicken', 'pet', 'animal'],
    (1, 7): ['head', 'eye', 'nose', 'mouth', 'ear', 'hair', 'face', 'hand', 'arm', 'leg', 'foot', 'feet', 'finger', 'body'],
    (1, 8): ['apple', 'banana', 'orange', 'strawberry', 'milk', 'water', 'juice', 'bread', 'cheese', 'egg', 'eat', 'drink', 'food'],
    (1, 9): ['jump', 'run', 'walk', 'stop', 'sing', 'dance', 'listen', 'look', 'sit', 'stand', 'open', 'close', 'clap'],
    (1, 10): ['sun', 'sunny', 'rain', 'rainy', 'cloud', 'cloudy', 'wind', 'windy', 'tree', 'flower', 'sky', 'star', 'hot', 'cold'],
    # Grade 2
    (2, 1): ['teacher', 'pupil', 'principal', 'headmaster', 'canteen', 'library', 'playground', 'garden', 'school', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    (2, 2): ['desk', 'chair', 'blackboard', 'whiteboard', 'smartboard', 'eraser', 'rubber', 'notebook', 'crayon', 'scissors', 'glue', 'ruler', 'sharpener'],
    (2, 3): ['body', 'arm', 'leg', 'hand', 'foot', 'eyes', 'ears', 'clothes', 'shirt', 't-shirt', 'pants', 'trousers', 'skirt', 'dress', 'shoes'],
    (2, 4): ['mother', 'father', 'sister', 'brother', 'grandmother', 'grandfather', 'family', 'tall', 'short', 'young', 'old'],
    (2, 5): ['house', 'home', 'room', 'bedroom', 'living room', 'kitchen', 'bathroom', 'garden', 'furniture', 'bed', 'sofa', 'table'],
    (2, 6): ['city', 'street', 'park', 'shop', 'food', 'meal', 'breakfast', 'lunch', 'dinner', 'bread', 'cheese', 'soup', 'salad'],
    # Grade 3
    (3, 1): ['classmate', 'librarian', 'school nurse', 'janitor', 'months', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
    (3, 2): ['classroom', 'instruction', 'listen', 'quiet', 'repeat', 'pencil case', 'marker', 'tablet', 'computer'],
    (3, 3): ['feelings', 'happy', 'sad', 'angry', 'surprised', 'tired', 'sunny', 'windy', 'snowy', 'rainy', 'weather', 'jacket', 'coat', 'boots'],
    (3, 4): ['routine', 'wake up', 'breakfast', 'wash', 'brush', 'teeth', 'hobby', 'painting', 'reading', 'swimming', 'cycling'],
    (3, 5): ['countryside', 'farm', 'barn', 'tractor', 'cow', 'horse', 'sheep', 'goat', 'donkey', 'rooster', 'hen', 'feed', 'farm animals'],
    (3, 6): ['restaurant', 'cafe', 'order', 'menu', 'waiter', 'pizza', 'pasta', 'burger', 'drink', 'water', 'juice', 'dessert'],
    # Grade 4
    (4, 1): ['permission', 'may i', 'can i', 'come in', 'go out', 'open the door', 'close the window', 'quiet', 'ruler', 'pencil sharpener', 'eraser'],
    (4, 2): ['nationality', 'country', 'turkey', 'turkish', 'germany', 'german', 'britain', 'british', 'japan', 'japanese', 'russia', 'russian', 'flag', 'north', 'south', 'east', 'west'],
    (4, 3): ['cartoon', 'character', 'ability', 'can', 'jump', 'fly', 'climb', 'swim', 'ride a bike', 'play the guitar', 'superhero', 'power'],
    (4, 4): ['free time', 'hobby', 'like', 'dislike', 'play chess', 'table tennis', 'reading comics', 'flying a kite', 'coloring', 'marbles'],
    (4, 5): ['daily routine', 'wake up', 'get dressed', 'have breakfast', 'go to school', 'do homework', 'o clock', 'morning', 'afternoon', 'evening', 'night'],
    (4, 6): ['science', 'scientist', 'experiment', 'lab', 'plant', 'water', 'cut', 'fold', 'freeze', 'melt', 'mix', 'brush', 'cup'],
    (4, 7): ['job', 'profession', 'doctor', 'nurse', 'teacher', 'vet', 'fireman', 'policeman', 'pilot', 'chef', 'farmer', 'actor', 'hospital', 'clinic'],
    (4, 8): ['clothes', 'weather', 'winter', 'summer', 'spring', 'autumn', 'fall', 'boot', 'dress', 'glove', 'hat', 'skirt', 'sock', 'sunglasses', 'umbrella'],
    (4, 9): ['friend', 'appearance', 'hair', 'curly', 'straight', 'wavy', 'blonde', 'dark', 'beard', 'moustache', 'handsome', 'beautiful', 'tall', 'short', 'slim'],
    (4, 10): ['food', 'drink', 'hungry', 'thirsty', 'sandwich', 'cupcake', 'honey', 'olive', 'butter', 'lemonade', 'yoghurt', 'bread', 'tea', 'coffee'],
    # Grade 5
    (5, 1): ['school life', 'department', 'gate', 'uniform', 'lab', 'sports field', 'secretary', 'coach', 'drama club', 'music club', 'art club', 'celebration'],
    (5, 2): ['classroom rules', 'subject', 'maths', 'science', 'social studies', 'physical education', 'timetable', 'schedule', 'break time'],
    (5, 3): ['personal life', 'healthy', 'illness', 'cough', 'fever', 'headache', 'stomachache', 'medicine', 'rest', 'vitamin', 'body parts'],
    (5, 4): ['family life', 'chores', 'hobby', 'cooking', 'gardening', 'repairing', 'routine', 'weekdays', 'weekend'],
    (5, 5): ['neighbourhood', 'city', 'bakery', 'pharmacy', 'library', 'cinema', 'mosque', 'museum', 'bank', 'post office', 'directions', 'straight', 'turn left', 'turn right'],
    (5, 6): ['world', 'culture', 'traditional food', 'recipe', 'festival', 'national costume', 'cuisine', 'famous dish'],
    (5, 7): ['nature', 'wild animals', 'lion', 'tiger', 'elephant', 'giraffe', 'habitat', 'forest', 'jungle', 'ocean', 'desert', 'protect animals'],
    (5, 8): ['universe', 'future', 'planet', 'earth', 'mars', 'holiday', 'space travel', 'spacecraft', 'future life', 'prediction'],
    # Grade 6
    (6, 1): ['school routines', 'national anthem', 'ceremony', 'leader', 'manner', 'guide', 'flag', 'parade', 'responsibility'],
    (6, 2): ['study routines', 'learning activity', 'hundred', 'two hundred', 'five hundred', 'project', 'assignment', 'presentation'],
    (6, 3): ['appearance', 'personality', 'generous', 'polite', 'rude', 'kind', 'hardworking', 'lazy', 'character', 'clothing style'],
    (6, 4): ['family jobs', 'workplace', 'office', 'factory', 'architect', 'mechanic', 'dentist', 'engineer', 'salary', 'career'],
    (6, 5): ['city life', 'festival', 'sports event', 'music festival', 'transportation', 'bus', 'train', 'subway', 'ferry', 'traffic'],
    (6, 6): ['world cultures', 'international', 'language', 'spanish', 'french', 'german', 'arabic', 'global', 'customs', 'celebrations'],
    (6, 7): ['environment', 'pollution', 'air pollution', 'water pollution', 'climate change', 'global warming', 'recycle', 'plant trees', 'save water'],
    (6, 8): ['universe', 'solar system', 'future technology', 'space station', 'robot', 'artificial intelligence', 'future inventions'],
    # Grade 7
    (7, 1): ['appearance', 'personality', 'attractive', 'cute', 'easy-going', 'generous', 'honest', 'outgoing', 'plump', 'punctual', 'selfish', 'slim', 'smart', 'stubborn'],
    (7, 2): ['sports', 'routine', 'indoor', 'outdoor', 'medal', 'spectator', 'train', 'score a goal', 'win', 'lose', 'jogging', 'swimming', 'skating', 'diet'],
    (7, 3): ['biography', 'past events', 'born', 'die', 'graduate', 'award', 'prize', 'grow up', 'move', 'invent', 'achievement', 'famous person'],
    (7, 4): ['wild animals', 'attack', 'birds', 'eagle', 'falcon', 'hawk', 'owl', 'cage', 'desert', 'enormous', 'extinct', 'habitat', 'hunt', 'jungle', 'mammals', 'dolphin', 'elephant', 'giraffe', 'lion', 'shark', 'tiger', 'poison', 'prey', 'reptiles', 'crocodile', 'snake', 'survive'],
    (7, 5): ['television', 'channel', 'commercial', 'director', 'discussion', 'documentary', 'news', 'quiz show', 'reality show', 'series', 'sitcom', 'soap opera', 'talk show', 'remote control'],
    (7, 6): ['celebration', 'party', 'arrange', 'attend', 'beverage', 'decorate', 'balloon', 'fancy dress', 'guest', 'host', 'invitation card', 'invite', 'wrap a present'],
    (7, 7): ['dreams', 'future predictions', 'career', 'university', 'marriage', 'predict', 'guess', 'imagine', 'peaceful world', 'travel space', 'successful'],
    (7, 8): ['public buildings', 'amusement park', 'art gallery', 'bakery', 'chemist', 'pharmacy', 'city hall', 'coffee shop', 'department store', 'fire station', 'movie theater', 'municipality', 'police station', 'shopping mall'],
    (7, 9): ['environment', 'balance of nature', 'climate', 'eco-friendly', 'global warming', 'greenhouse effect', 'nature', 'protect', 'pollute', 'pollution', 'recycle', 'renewable energy', 'solar energy', 'wind energy', 'waste'],
    (7, 10): ['planets', 'solar system', 'astronomy', 'atmosphere', 'evidence', 'explore', 'galaxy', 'gravity', 'meteor', 'moon', 'observe', 'orbit', 'planet', 'satellite', 'space shuttle', 'universe', 'surface of mars'],
    # Grade 8 (LGS)
    (8, 1): ['friendship', 'buddy', 'mate', 'best friend', 'count on', 'back up', 'support', 'trust', 'honest', 'generous', 'loyal', 'share secrets', 'laid-back', 'reliable', 'argue', 'apologize'],
    (8, 2): ['teen life', 'teenager', 'music concert', 'camping', 'fashion', 'trendy', 'unbearable', 'fond of', 'keen on', 'prefer', 'routine', 'lifestyle'],
    (8, 3): ['in the kitchen', 'cooking', 'recipe', 'ingredient', 'bake', 'boil', 'fry', 'grill', 'roast', 'steam', 'chop', 'dice', 'slice', 'peel', 'grate', 'stir', 'pour', 'pan', 'pot', 'bowl', 'delicious', 'spicy', 'sweet', 'sour', 'salty', 'bitter'],
    (8, 4): ['on the phone', 'phone call', 'speak to', 'hold on', 'hang up', 'call back', 'leave a message', 'available', 'engaged', 'busy', 'connect', 'extension', 'communication'],
    (8, 5): ['the internet', 'online', 'browser', 'download', 'upload', 'website', 'account', 'password', 'log in', 'attachment', 'social media', 'search engine', 'wireless', 'comment', 'post'],
    (8, 6): ['adventures', 'adventure sports', 'extreme sports', 'rafting', 'paragliding', 'bungee jumping', 'skydiving', 'scuba diving', 'caving', 'helmet', 'adrenaline', 'perilous', 'challenging', 'courage'],
    (8, 7): ['tourism', 'tourist', 'historic site', 'architecture', 'all-inclusive', 'bed and breakfast', 'resort', 'attraction', 'destination', 'countryside', 'urban', 'rural', 'ancient', 'fascinating', 'monument'],
    (8, 8): ['chores', 'housework', 'do the laundry', 'wash dishes', 'dishwasher', 'take out garbage', 'tidy up', 'make the bed', 'clean up', 'iron', 'vacuum', 'dust', 'sweep', 'responsibility', 'obligation'],
    (8, 9): ['science', 'scientific', 'experiment', 'scientist', 'invent', 'invention', 'discover', 'discovery', 'lab', 'laboratory', 'test tube', 'high-tech', 'cell', 'vaccination', 'cure', 'process', 'result'],
    (8, 10): ['natural forces', 'natural disasters', 'avalanche', 'drought', 'earthquake', 'erosion', 'flood', 'global warming', 'hurricane', 'landslide', 'tornado', 'tsunami', 'volcano', 'destruction', 'survivor', 'rescue'],
    # Grade 9
    (9, 1): ['studying abroad', 'overseas', 'international student', 'campus', 'dormitory', 'scholarship', 'visa', 'passport', 'exchange program', 'foreign language'],
    (9, 2): ['my environment', 'neighbourhood', 'apartment', 'rent', 'directions', 'suburb', 'residential', 'balcony', 'district', 'landmark'],
    (9, 3): ['movies', 'cinema', 'film', 'genre', 'director', 'soundtrack', 'plot', 'acting', 'blockbuster', 'premiere', 'scene', 'character'],
    (9, 4): ['human in nature', 'outdoor', 'trekking', 'camping', 'wildlife', 'campfire', 'hiking trail', 'flora', 'fauna', 'mountain', 'survival'],
    (9, 5): ['inspirational people', 'role model', 'biography', 'achieve', 'pioneer', 'inventor', 'nobel prize', 'determination', 'perseverance', 'legacy'],
    (9, 6): ['bridging cultures', 'multicultural', 'tradition', 'customs', 'hospitality', 'folklore', 'ceremony', 'cultural diversity', 'costume'],
    (9, 7): ['world heritage', 'unesco', 'ancient wonder', 'pyramid', 'monument', 'ruins', 'archaeological', 'civilization', 'historical landmark'],
    (9, 8): ['emergency', 'health', 'first aid', 'ambulance', 'paramedic', 'injury', 'prescription', 'symptom', 'remedy', 'treatment', 'hospital', 'patient'],
    (9, 9): ['invitations', 'celebrations', 'party', 'gathering', 'anniversary', 'reception', 'toast', 'ceremony', 'rsvp', 'organize', 'festivity'],
    (9, 10): ['television', 'social media', 'broadcasting', 'digital influencer', 'follower', 'content creator', 'media ethics', 'streaming', 'audience'],
    # Grade 10
    (10, 1): ['school life', 'high school', 'syllabus', 'curriculum', 'study habits', 'attendance', 'extracurricular', 'counselor', 'discipline', 'exam period'],
    (10, 2): ['plans', 'future ambition', 'career goal', 'prospective', 'intention', 'aspiration', 'higher education', 'vocation', 'pathway'],
    (10, 3): ['legendary figures', 'mythology', 'epic', 'warrior', 'conqueror', 'empire', 'historical chronicle', 'saga', 'heroic deed'],
    (10, 4): ['traditions', 'cultural values', 'ancestral', 'folk dance', 'ceremonial', 'wedding customs', 'heritage', 'handicraft', 'national festival'],
    (10, 5): ['travel', 'voyage', 'journey', 'itinerary', 'boarding pass', 'flight booking', 'luggage', 'customs declaration', 'cruise', 'excursion'],
    (10, 6): ['helpful tips', 'practical advice', 'guidelines', 'household repair', 'diy', 'troubleshooting', 'safety rules', 'recommendations'],
    (10, 7): ['food and festivals', 'culinary', 'gastronomy', 'gourmet', 'world cuisine', 'harvest festival', 'street food', 'cooking techniques'],
    (10, 8): ['digital era', 'cybersecurity', 'artificial intelligence', 'virtual reality', 'algorithm', 'smart devices', 'automation', 'cloud computing'],
    (10, 9): ['modern heroes', 'altruism', 'courageous', 'philanthropy', 'bravery', 'first responder', 'lifesaver', 'humanitarian', 'selfless'],
    (10, 10): ['shopping', 'consumerism', 'discount', 'receipt', 'bargain', 'cashier', 'fitting room', 'clothing size', 'refund', 'warranty'],
    # Grade 11
    (11, 1): ['future jobs', 'emerging careers', 'data analyst', 'ai specialist', 'biotechnologist', 'freelancer', 'job interview', 'curriculum vitae', 'salary package'],
    (11, 2): ['hobbies and skills', 'craftsmanship', 'pottery', 'photography', 'martial arts', 'creative writing', 'artistic expression', 'talent'],
    (11, 3): ['hard times', 'resilience', 'adversity', 'economic struggle', 'famine', 'great depression', 'endurance', 'overcoming obstacles'],
    (11, 4): ['what a life', 'memoir', 'remarkable life', 'lifetime achievement', 'breakthrough', 'triumph', 'distinguished career', 'autobiography'],
    (11, 5): ['back to the past', 'nostalgia', 'historical era', 'retrospective', 'antiquity', 'renaissance', 'vintage', 'reminiscence'],
    (11, 6): ['open your heart', 'empathy', 'volunteering', 'charitable foundation', 'donation', 'homeless shelter', 'solidarity', 'generosity'],
    (11, 7): ['facts about turkey', 'anatolian civilization', 'cappadocia', 'pamukkale', 'bosphorus', 'ephesus', 'natural beauties', 'cultural wealth'],
    (11, 8): ['sports', 'athletics', 'olympic games', 'marathon', 'championship', 'sportsmanship', 'physical fitness', 'tournament trophy'],
    (11, 9): ['my friends', 'interpersonal relationships', 'confidant', 'mutual trust', 'reconciliation', 'deep connection', 'loyalty'],
    (11, 10): ['values and norms', 'ethics', 'moral principles', 'civic duty', 'social etiquette', 'integrity', 'tolerance', 'human dignity'],
    # Grade 12 (YDT)
    (12, 1): ['music', 'musical composition', 'symphony', 'orchestra', 'acoustic', 'harmony', 'improvisation', 'music therapy', 'genre'],
    (12, 2): ['friendship', 'camaraderie', 'long-lasting bonds', 'emotional support', 'dependability', 'solidarity', 'conflict resolution'],
    (12, 3): ['human rights', 'universal declaration', 'fundamental rights', 'equality', 'justice', 'freedom of expression', 'rule of law', 'global citizen'],
    (12, 4): ['coming soon', 'futuristic society', 'nanotechnology', 'cyborg', 'space colonization', 'singularity', 'quantum computing'],
    (12, 5): ['psychology', 'cognitive psychology', 'mental wellness', 'subconscious mind', 'emotional intelligence', 'psychotherapy', 'stress management'],
    (12, 6): ['favors', 'benevolence', 'community service', 'mutual aid', 'kindness', 'philanthropic deeds', 'civic contribution'],
    (12, 7): ['news stories', 'journalistic integrity', 'press freedom', 'media literacy', 'investigative reporting', 'fake news', 'broadcasting'],
    (12, 8): ['alternative energy', 'renewable energy', 'solar panel', 'wind turbine', 'geothermal', 'sustainability', 'carbon neutrality', 'green economy'],
    (12, 9): ['technology', 'technological breakthrough', 'patents', 'biotechnology', 'telecommunication', 'semiconductor', 'digital transformation'],
    (12, 10): ['manners', 'diplomatic protocol', 'formal decorum', 'social grace', 'etiquette', 'courtesy', 'intercultural respect']
}

GRADE_METADATA = {
    1: {"name": "1. Sınıf", "stage": "İlkokul", "stageTr": "İlkokul (1-4)", "cefr": "Pre-A1", "hours": 2, "badge": "1. SINIF"},
    2: {"name": "2. Sınıf", "stage": "İlkokul", "stageTr": "İlkokul (1-4)", "cefr": "A1", "hours": 2, "badge": "2. SINIF"},
    3: {"name": "3. Sınıf", "stage": "İlkokul", "stageTr": "İlkokul (1-4)", "cefr": "A1", "hours": 2, "badge": "3. SINIF"},
    4: {"name": "4. Sınıf", "stage": "İlkokul", "stageTr": "İlkokul (1-4)", "cefr": "A1-A2", "hours": 2, "badge": "4. SINIF"},
    5: {"name": "5. Sınıf (Maarif)", "stage": "Ortaokul", "stageTr": "Ortaokul (5-8 / LGS)", "cefr": "A1-A2", "hours": 3, "badge": "5. SINIF"},
    6: {"name": "6. Sınıf (Maarif)", "stage": "Ortaokul", "stageTr": "Ortaokul (5-8 / LGS)", "cefr": "A2", "hours": 3, "badge": "6. SINIF"},
    7: {"name": "7. Sınıf", "stage": "Ortaokul", "stageTr": "Ortaokul (5-8 / LGS)", "cefr": "A2", "hours": 4, "badge": "7. SINIF"},
    8: {"name": "8. Sınıf (LGS)", "stage": "Ortaokul", "stageTr": "Ortaokul (5-8 / LGS)", "cefr": "A2-B1", "hours": 4, "badge": "8. SINIF"},
    9: {"name": "9. Sınıf", "stage": "Lise", "stageTr": "Lise (9-12 / YDT)", "cefr": "A2.2-B1.1", "hours": 4, "badge": "9. SINIF"},
    10: {"name": "10. Sınıf", "stage": "Lise", "stageTr": "Lise (9-12 / YDT)", "cefr": "B1.1-B1.2", "hours": 4, "badge": "10. SINIF"},
    11: {"name": "11. Sınıf", "stage": "Lise", "stageTr": "Lise (9-12 / YDT)", "cefr": "B1.2-B2.1", "hours": 4, "badge": "11. SINIF"},
    12: {"name": "12. Sınıf (YDT)", "stage": "Lise", "stageTr": "Lise (9-12 / YDT)", "cefr": "B2.1-B2.2", "hours": 4, "badge": "12. SINIF"}
}

# 36-Week Standard Academic Calendar Schedule Generator
def generate_standard_calendar(grade_num, units):
    weeks = []
    week_templates = [
        # 1. Dönem
        (1, "Eylül", "14-18 September", "Orientation & Uyum", "15 Temmuz Demokrasi ve Milli Birlik Günü"),
        (2, "Eylül", "21-25 September", "", "26 Eylül Türk Dil Bayramı"),
        (3, "Eylül", "28 September - 2 October", "", ""),
        (4, "Ekim", "5-9 October", "", ""),
        (5, "Ekim", "12-16 October", "", ""),
        (6, "Ekim", "19-23 October", "", ""),
        (7, "Ekim", "26-30 October", "", "29 Ekim Cumhuriyet Bayramı"),
        (8, "Kasım", "2-6 November", "", ""),
        (9, "Kasım", "9-13 November", "", "10 Kasım Atatürk'ü Anma Günü"),
        (10, "Kasım", "16-20 November", "", "1. Ara Tatil & Pekiştirme"),
        (11, "Kasım", "23-27 November", "", "24 Kasım Öğretmenler Günü"),
        (12, "Aralık", "30 November - 4 December", "", ""),
        (13, "Aralık", "7-11 December", "", ""),
        (14, "Aralık", "14-18 December", "", ""),
        (15, "Aralık", "21-25 December", "", ""),
        (16, "Aralık", "28 December - 1 January", "", "1 Ocak Yılbaşı Tatili"),
        (17, "Ocak", "4-8 January", "", ""),
        (18, "Ocak", "11-15 January", "", "1. Dönem Sonu & Karne"),
        # 2. Dönem
        (19, "Şubat", "8-12 February", "", "2. Dönem Başlangıcı"),
        (20, "Şubat", "15-19 February", "", ""),
        (21, "Şubat", "22-26 February", "", ""),
        (22, "Mart", "1-5 March", "", ""),
        (23, "Mart", "8-12 March", "", "12 Mart İstiklal Marşı'nın Kabulü"),
        (24, "Mart", "15-19 March", "", "18 Mart Çanakkale Zaferi"),
        (25, "Mart", "22-26 March", "", ""),
        (26, "Mart", "29 March - 2 April", "", ""),
        (27, "Nisan", "5-9 April", "", ""),
        (28, "Nisan", "12-16 April", "", "2. Ara Tatil"),
        (29, "Nisan", "19-23 April", "", "23 Nisan Ulusal Egemenlik ve Çocuk Bayramı"),
        (30, "Nisan", "26-30 April", "", ""),
        (31, "Mayıs", "3-7 May", "", "1 Mayıs Emek ve Dayanışma Günü"),
        (32, "Mayıs", "10-14 May", "", ""),
        (33, "Mayıs", "17-21 May", "", "19 Mayıs Atatürk'ü Anma Gençlik ve Spor Bayramı"),
        (34, "Mayıs", "24-28 May", "", ""),
        (35, "Haziran", "31 May - 4 June", "", ""),
        (36, "Haziran", "7-11 June", "Yıl Sonu Değerlendirme & Tekrar", "Yıl Sonu Kapanış")
    ]
    
    num_units = len(units)
    for idx, (wn, m, d, default_focus, imp) in enumerate(week_templates):
        u_idx = min(num_units - 1, int((idx / 36.0) * num_units))
        target_unit = units[u_idx]
        u_num = target_unit['unitNum']
        u_title = target_unit['title']
        focus = default_focus or target_unit['subThemes'] or target_unit['title']
        vocab = target_unit['targetVocab']
        slice_start = (idx % 3) * 6
        weekly_words = vocab[slice_start:slice_start + 8] if vocab else target_unit['semanticKeywords'][:8]

        weeks.append({
            'weekNum': wn,
            'month': m,
            'dates': d,
            'hours': GRADE_METADATA[grade_num]['hours'],
            'unitNum': u_num,
            'unitTitle': u_title,
            'focus': focus[:160],
            'targetWords': weekly_words,
            'importantDays': imp
        })
    return weeks

def build_full_curriculum_registry():
    log("Tüm 1-12 sınıf müfredat veritabanı inşa ediliyor...")
    
    excel_data = {}
    with zipfile.ZipFile(EXCEL_PATH, 'r') as z:
        sst_xml = z.read('xl/sharedStrings.xml')
        sst = ET.fromstring(sst_xml)
        ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        strings = [''.join([t.text or '' for t in si.findall('.//ns:t', ns)]) for si in sst.findall('.//ns:si', ns)]

        sheet_specs = [
            (2, 'xl/worksheets/sheet1.xml', 'tymm'),
            (3, 'xl/worksheets/sheet2.xml', 'tymm'),
            (4, 'xl/worksheets/sheet3.xml', 'standard'),
            (5, 'xl/worksheets/sheet4.xml', 'tymm'),
            (6, 'xl/worksheets/sheet5.xml', 'tymm'),
            (7, 'xl/worksheets/sheet6.xml', 'standard'),
            (8, 'xl/worksheets/sheet7.xml', 'standard'),
        ]

        for grade_num, sheet_xml_path, mode in sheet_specs:
            root = ET.fromstring(z.read(sheet_xml_path))
            weeks = []
            units_map = {}
            last_month = ''
            last_theme = ''
            last_content = ''
            last_outcomes = ''

            for r in root.findall('.//ns:row', ns)[2:]:
                row_dict = {}
                for c in r.findall('ns:c', ns):
                    v = c.find('ns:v', ns)
                    t = c.attrib.get('t')
                    val = strings[int(v.text)] if v is not None and v.text is not None and t == 's' else (v.text if v is not None else '')
                    col = ''.join(filter(str.isalpha, c.attrib.get('r', '')))
                    row_dict[col] = val.strip()

                month = row_dict.get('A') or last_month
                if row_dict.get('A'):
                    last_month = row_dict.get('A')

                raw_week = row_dict.get('B', '')
                if not raw_week or raw_week.strip().upper() == 'WEEK':
                    continue

                week_match = re.search(r'Week\s*(\d+)[:\s]*(.*)', raw_week, re.IGNORECASE | re.DOTALL)
                week_num = int(week_match.group(1)) if week_match else len(weeks) + 1
                date_range = week_match.group(2).strip() if week_match else raw_week.strip()
                date_range = clean_text(date_range)

                theme_raw = row_dict.get('D') or last_theme
                if row_dict.get('D'):
                    last_theme = row_dict.get('D')

                content = row_dict.get('E') or last_content
                if row_dict.get('E'):
                    last_content = row_dict.get('E')

                outcomes = row_dict.get('F') or last_outcomes
                if row_dict.get('F'):
                    last_outcomes = row_dict.get('F')

                raw_hours = row_dict.get('C', '')
                try:
                    hours = int(raw_hours)
                except (ValueError, TypeError):
                    hours = GRADE_METADATA[grade_num]['hours']
                important_days = clean_text(row_dict.get('L' if mode == 'tymm' else 'I', ''))

                clean_theme = clean_text(theme_raw)
                unit_num = 1
                unit_title = clean_theme

                if mode == 'tymm':
                    m_th = re.search(r'THEME\s*(\d+)[:\s]*(.*)', clean_theme, re.IGNORECASE)
                    if m_th:
                        unit_num = int(m_th.group(1))
                        unit_title = clean_text(m_th.group(2)) or f"THEME {unit_num}"
                    elif 'ORIENTATION' in clean_theme.upper():
                        unit_num = 1
                        unit_title = 'ORIENTATION'
                    elif 'REVISION' in clean_theme.upper():
                        unit_num = 1
                        unit_title = 'REVISION'
                else:
                    m_un = re.search(r'^(\d+)\s+(.*)', clean_theme)
                    if m_un:
                        unit_num = int(m_un.group(1))
                        unit_title = clean_text(m_un.group(2))

                vocab_list = extract_vocab_from_text(content)
                clean_subthemes = extract_subthemes_and_focus(content)
                clean_functions = extract_communicative_functions(content)
                parsed_outcomes, full_outcomes_text = parse_learning_outcomes(outcomes)

                if unit_num not in units_map:
                    units_map[unit_num] = {
                        'unitNum': unit_num,
                        'code': f"THEME {unit_num}" if mode == 'tymm' else f"UNIT {unit_num}",
                        'title': unit_title.upper(),
                        'titleTr': UNIT_TITLES_TR.get((grade_num, unit_num), unit_title),
                        'subThemes': clean_subthemes or unit_title.upper(),
                        'functions': clean_functions or f"Functions for {unit_title.upper()}",
                        'outcomes': full_outcomes_text or f"Learning outcomes for {unit_title.upper()}",
                        'outcomesList': parsed_outcomes,
                        'targetVocab': [],
                        'semanticKeywords': UNIT_KEYWORDS.get((grade_num, unit_num), [])
                    }
                elif not units_map[unit_num].get('outcomesList') and parsed_outcomes:
                    units_map[unit_num]['outcomesList'] = parsed_outcomes
                    units_map[unit_num]['outcomes'] = full_outcomes_text

                units_map[unit_num]['targetVocab'].extend(vocab_list)
                units_map[unit_num]['targetVocab'] = list(dict.fromkeys(units_map[unit_num]['targetVocab']))

                weeks.append({
                    'weekNum': week_num,
                    'month': month.capitalize(),
                    'dates': date_range,
                    'hours': hours,
                    'unitNum': unit_num,
                    'unitTitle': unit_title.upper(),
                    'focus': clean_subthemes or unit_title.upper(),
                    'targetWords': vocab_list[:10],
                    'importantDays': important_days
                })

            excel_data[grade_num] = {
                'units': list(units_map.values()),
                'calendar': weeks
            }

    full_registry = {}

    for g_num in range(1, 13):
        meta = GRADE_METADATA[g_num]

        if g_num in excel_data:
            g_units = excel_data[g_num]['units']
            g_calendar = excel_data[g_num]['calendar']
        else:
            g_units = []
            for u_num in range(1, 11):
                tr_title = UNIT_TITLES_TR.get((g_num, u_num), f"Ünite {u_num}")
                kw = UNIT_KEYWORDS.get((g_num, u_num), [])
                
                en_titles_grade1 = [
                    "HELLO & GREETINGS", "MY FAMILY & FRIENDS", "COLORS & RAINBOW",
                    "NUMBERS 1-10", "CLASSROOM & TOYS", "ANIMALS & PETS",
                    "MY BODY", "FRUITS & SNACKS", "ACTION & MOVEMENT", "NATURE & WEATHER"
                ]
                en_titles_grade9 = [
                    "STUDYING ABROAD", "MY ENVIRONMENT", "MOVIES", "HUMAN IN NATURE",
                    "INSPIRATIONAL PEOPLE", "BRIDGING CULTURES", "WORLD HERITAGE",
                    "EMERGENCY AND HEALTH", "INVITATIONS AND CELEBRATIONS", "TELEVISION AND SOCIAL MEDIA"
                ]
                en_titles_grade10 = [
                    "SCHOOL LIFE", "PLANS", "LEGENDARY FIGURES", "TRADITIONS",
                    "TRAVEL", "HELPFUL TIPS", "FOOD AND FESTIVALS", "DIGITAL ERA",
                    "MODERN HEROES AND HEROINES", "SHOPPING"
                ]
                en_titles_grade11 = [
                    "FUTURE JOBS", "HOBBIES AND SKILLS", "HARD TIMES", "WHAT A LIFE!",
                    "BACK TO THE PAST", "OPEN YOUR HEART", "FACTS ABOUT TURKEY",
                    "SPORTS", "MY FRIENDS", "VALUES AND NORMS"
                ]
                en_titles_grade12 = [
                    "MUSIC", "FRIENDSHIP", "HUMAN RIGHTS", "COMING SOON",
                    "PSYCHOLOGY", "FAVORS", "NEWS STORIES", "ALTERNATIVE ENERGY",
                    "TECHNOLOGY", "MANNERS"
                ]

                if g_num == 1: en_title = en_titles_grade1[u_num - 1]
                elif g_num == 9: en_title = en_titles_grade9[u_num - 1]
                elif g_num == 10: en_title = en_titles_grade10[u_num - 1]
                elif g_num == 11: en_title = en_titles_grade11[u_num - 1]
                elif g_num == 12: en_title = en_titles_grade12[u_num - 1]

                g_units.append({
                    'unitNum': u_num,
                    'code': f"THEME {u_num}" if g_num in (2, 3, 5, 6) else f"UNIT {u_num}",
                    'title': en_title,
                    'titleTr': tr_title,
                    'subThemes': f"{en_title} • {tr_title}",
                    'functions': f"Communicative functions and language patterns for {en_title}",
                    'outcomes': f"ENG.{g_num}.{u_num} Learning outcomes and skills for {en_title}",
                    'outcomesList': [{
                        'code': f"ENG.{g_num}.{u_num}",
                        'skill': 'General',
                        'text': f"Learning outcomes and communicative skills for {en_title}"
                    }],
                    'targetVocab': kw[:15],
                    'semanticKeywords': kw
                })

            g_calendar = generate_standard_calendar(g_num, g_units)

        for u in g_units:
            u_kw = UNIT_KEYWORDS.get((g_num, u['unitNum']), [])
            for k in u_kw:
                if k.lower() not in [w.lower() for w in u['targetVocab']]:
                    u['targetVocab'].append(k.lower())
            u['semanticKeywords'] = list(dict.fromkeys(u_kw + [w.lower() for w in u['targetVocab'][:15]]))

        full_registry[g_num] = {
            'grade': g_num,
            'name': meta['name'],
            'stage': meta['stage'],
            'stageTr': meta['stageTr'],
            'cefr': meta['cefr'],
            'hours': meta['hours'],
            'badge': meta['badge'],
            'units': g_units,
            'calendar': g_calendar
        }

    return full_registry

def generate_curriculum_javascript(registry):
    log("curriculum-data.js derleniyor...")

    canonical_index = {}
    for g_num, g_data in registry.items():
        for u in g_data['units']:
            for w in u['targetVocab']:
                w_clean = w.lower().strip()
                if len(w_clean) > 1 and w_clean not in canonical_index:
                    canonical_index[w_clean] = {
                        'grade': g_num,
                        'gradeName': g_data['name'],
                        'unitNum': u['unitNum'],
                        'unitTitle': u['title'],
                        'unitTitleTr': u['titleTr'],
                        'code': u['code']
                    }

    registry_json = json.dumps(registry, ensure_ascii=False, separators=(',', ':'))
    canonical_index_json = json.dumps(canonical_index, ensure_ascii=False, separators=(',', ':'))

    js_code = f"""/**
 * Learnish - K-12 MEB İngilizce Müfredatı ve Bağlama (Curriculum Context Classifier) Motoru
 * Kapsam: 1. Sınıftan 12. Sınıfa Kadar Haftalık Planlar, Kazanımlar ve Akıllı Ünite Sınıflandırıcısı
 * Lisans: MEB Çerçeve Planı & The Oxford 5000 Entegrasyonu
 */

(function () {{
  'use strict';

  // 1. K-12 Tam Müfredat Veritabanı (1. Sınıf - 12. Sınıf)
  const CURRICULUM_DATA = {registry_json};

  // 2. Kanonik Kelime Ters Dizin (O(1) Hızlı Erişim)
  const CANONICAL_VOCAB_INDEX = {canonical_index_json};

  // 3. Semantik Konu Küme Vektörleri (Domain Clusters)
  const DOMAIN_CLUSTERS = [
    {{
      id: 'food_kitchen',
      grades: [{{ g: 8, u: 3 }}, {{ g: 4, u: 10 }}, {{ g: 10, u: 7 }}, {{ g: 2, u: 6 }}],
      keywords: ['kitchen', 'recipe', 'cook', 'bake', 'ingredient', 'meal', 'food', 'dish', 'fry', 'boil', 'taste', 'delicious', 'spice', 'oven', 'pan', 'knife', 'pot', 'chop', 'dice', 'slice', 'peel', 'grate', 'stir', 'pour', 'spicy', 'sweet', 'sour', 'salty', 'bitter', 'snack', 'beverage', 'cuisine', 'gastronomy', 'gourmet']
    }},
    {{
      id: 'natural_disasters_forces',
      grades: [{{ g: 8, u: 10 }}, {{ g: 7, u: 9 }}, {{ g: 12, u: 8 }}, {{ g: 6, u: 7 }}],
      keywords: ['natural', 'force', 'disaster', 'drought', 'earthquake', 'flood', 'avalanche', 'tornado', 'erosion', 'global warming', 'destruction', 'catastrophe', 'hurricane', 'landslide', 'tsunami', 'volcano', 'survivor', 'rescue', 'pollution', 'climate', 'renewable', 'carbon', 'biodiversity', 'ecosystem', 'conservation', 'sustainability']
    }},
    {{
      id: 'space_astronomy',
      grades: [{{ g: 7, u: 10 }}, {{ g: 5, u: 8 }}, {{ g: 12, u: 4 }}],
      keywords: ['planet', 'orbit', 'solar system', 'galaxy', 'space', 'astronaut', 'gravity', 'moon', 'mars', 'satellite', 'universe', 'telescope', 'atmosphere', 'spacecraft', 'meteor', 'futuristic', 'alien', 'shuttle']
    }},
    {{
      id: 'technology_internet',
      grades: [{{ g: 8, u: 5 }}, {{ g: 10, u: 8 }}, {{ g: 12, u: 9 }}],
      keywords: ['internet', 'online', 'download', 'upload', 'browser', 'website', 'account', 'password', 'social media', 'network', 'connect', 'software', 'artificial intelligence', 'algorithm', 'cybersecurity', 'virtual', 'device', 'gadget', 'app', 'digital', 'search engine']
    }},
    {{
      id: 'friendship_relationships',
      grades: [{{ g: 8, u: 1 }}, {{ g: 12, u: 2 }}, {{ g: 11, u: 9 }}, {{ g: 1, u: 2 }}],
      keywords: ['friend', 'friendship', 'buddy', 'mate', 'trust', 'support', 'count on', 'back up', 'loyal', 'secret', 'honest', 'share', 'reliable', 'argue', 'apologize', 'camaraderie', 'companionship', 'reconcile']
    }},
    {{
      id: 'science_experiments',
      grades: [{{ g: 8, u: 9 }}, {{ g: 4, u: 6 }}],
      keywords: ['science', 'scientific', 'experiment', 'scientist', 'invent', 'invention', 'discover', 'discovery', 'lab', 'laboratory', 'test tube', 'high-tech', 'cell', 'vaccine', 'cure', 'formula', 'hypothesis']
    }},
    {{
      id: 'jobs_career',
      grades: [{{ g: 4, u: 7 }}, {{ g: 11, u: 1 }}, {{ g: 6, u: 4 }}],
      keywords: ['job', 'profession', 'career', 'work', 'doctor', 'nurse', 'teacher', 'vet', 'fireman', 'policeman', 'pilot', 'chef', 'farmer', 'architect', 'engineer', 'salary', 'resume', 'interview', 'occupation']
    }},
    {{
      id: 'chores_housework',
      grades: [{{ g: 8, u: 8 }}, {{ g: 4, u: 5 }}],
      keywords: ['chore', 'housework', 'laundry', 'dishes', 'clean', 'tidy', 'iron', 'trash', 'garbage', 'vacuum', 'dust', 'sweep', 'bed', 'dishwasher', 'obligation', 'responsibility']
    }},
    {{
      id: 'tourism_travel',
      grades: [{{ g: 8, u: 7 }}, {{ g: 10, u: 5 }}, {{ g: 9, u: 1 }}],
      keywords: ['tourism', 'travel', 'tourist', 'historic site', 'architecture', 'all-inclusive', 'resort', 'attraction', 'destination', 'monument', 'flight', 'journey', 'luggage', 'passport', 'visa', 'sightseeing', 'itinerary']
    }},
    {{
      id: 'sports_fitness',
      grades: [{{ g: 7, u: 2 }}, {{ g: 11, u: 8 }}, {{ g: 4, u: 4 }}],
      keywords: ['sport', 'sports', 'tournament', 'athlete', 'athletics', 'championship', 'olympic', 'marathon', 'fitness', 'workout', 'stadium', 'medal', 'trophy', 'score', 'match', 'gym', 'jogging', 'swimming', 'skating']
    }},
    {{
      id: 'appearance_personality',
      grades: [{{ g: 7, u: 1 }}, {{ g: 4, u: 9 }}, {{ g: 6, u: 3 }}],
      keywords: ['appearance', 'personality', 'attractive', 'cute', 'generous', 'honest', 'outgoing', 'punctual', 'selfish', 'slim', 'smart', 'stubborn', 'handsome', 'beautiful', 'tall', 'short', 'curly', 'straight', 'blonde', 'beard', 'moustache']
    }},
    {{
      id: 'psychology_mind',
      grades: [{{ g: 12, u: 5 }}],
      keywords: ['psychology', 'subconscious', 'cognition', 'cognitive', 'mental health', 'therapy', 'depression', 'stress', 'mind', 'perception', 'behavior', 'emotional intelligence', 'psychotherapy']
    }},
    {{
      id: 'human_rights_society',
      grades: [{{ g: 12, u: 3 }}, {{ g: 11, u: 10 }}, {{ g: 12, u: 6 }}],
      keywords: ['human rights', 'equality', 'freedom', 'justice', 'citizenship', 'peace', 'dignity', 'law', 'democracy', 'solidarity', 'volunteer', 'ethics', 'morals', 'civic', 'constitution']
    }},
    {{
      id: 'music_arts',
      grades: [{{ g: 12, u: 1 }}, {{ g: 11, u: 2 }}],
      keywords: ['music', 'melody', 'rhythm', 'symphony', 'orchestra', 'acoustic', 'harmony', 'instrument', 'lyrics', 'composer', 'genre', 'art', 'theatre', 'performance']
    }},
    {{
      id: 'school_classroom',
      grades: [{{ g: 2, u: 1 }}, {{ g: 4, u: 1 }}, {{ g: 5, u: 1 }}, {{ g: 10, u: 1 }}, {{ g: 1, u: 5 }}],
      keywords: ['school', 'classroom', 'teacher', 'pupil', 'student', 'pencil', 'pen', 'desk', 'ruler', 'eraser', 'notebook', 'book', 'blackboard', 'rules', 'homework', 'timetable', 'subject', 'exam', 'kindergarten', 'preschool']
    }}
  ];

  // 4. Akıllı Bağlama (Context Classifier) Motoru
  const CURRICULUM_CLASSIFIER = {{
    /**
     * Herhangi bir İngilizce kelimeyi veya kelime nesnesini en uygun 1-12 sınıf ve ünitesine bağlar.
     * @param {{string|object}} wordInput - Kelime dizesi veya WORDS_DATA öğesi
     * @param {{number|null}} gradeFilter - İsteğe bağlı belirli bir sınıf odaklaması (1-12)
     * @returns {{object}} Sınıflandırma sonucu, eşleşen ünite, güven skoru ve pedagojik açıklama
     */
    classify(wordInput, gradeFilter = null) {{
      const wordStr = typeof wordInput === 'string' ? wordInput : (wordInput?.en || '');
      const cleanWord = wordStr.toLowerCase().trim().replace(/[^a-z0-9\\s-]/g, '');
      const cefr = (typeof wordInput === 'object' && wordInput?.cefr) ? wordInput.cefr.toUpperCase() : '';
      const def = (typeof wordInput === 'object' && (wordInput?.definition || wordInput?.desc || wordInput?.tr)) ? (wordInput.definition + ' ' + wordInput.desc + ' ' + wordInput.tr).toLowerCase() : '';

      if (!cleanWord) {{
        return {{
          grade: 5,
          gradeName: '5. Sınıf',
          unitNum: 1,
          unitTitle: 'SCHOOL LIFE',
          unitTitleTr: 'Okul Yaşamı',
          confidence: 0.1,
          matchType: 'fallback',
          rationale: 'Kelime tanımlanamadığı için varsayılan okul bağlamına yönlendirildi.',
          alternateMatches: []
        }};
      }}

      // A. Kanonik Eşleşme (Doğrudan Yıllık Planda Yer Alan Kelime)
      if (CANONICAL_VOCAB_INDEX[cleanWord]) {{
        const canon = CANONICAL_VOCAB_INDEX[cleanWord];
        if (!gradeFilter || canon.grade === gradeFilter) {{
          return {{
            grade: canon.grade,
            gradeName: canon.gradeName,
            unitNum: canon.unitNum,
            unitTitle: canon.unitTitle,
            unitTitleTr: canon.unitTitleTr,
            confidence: 0.99,
            matchType: 'canonical_curriculum',
            rationale: `"${{cleanWord}}" kelimesi doğrudan ${{canon.gradeName}} ${{canon.unitTitle}} (${{canon.unitTitleTr}}) ünitesinin resmi müfredat hedef kelimesidir.`,
            alternateMatches: []
          }};
        }}
      }}

      // B. Semantik Küme Eşleşmesi (Domain Clusters)
      const scoredUnits = [];
      const wordTokens = cleanWord.split(/[\\s-]+/);

      for (const cluster of DOMAIN_CLUSTERS) {{
        let clusterScore = 0;
        for (const kw of cluster.keywords) {{
          if (cleanWord === kw) {{
            clusterScore += 1.0;
          }} else if (cleanWord.length >= 5 && kw.length >= 5 && (cleanWord.startsWith(kw) || kw.startsWith(cleanWord))) {{
            clusterScore += 0.75;
          }} else if (wordTokens.some(tok => tok.length >= 4 && kw.split(/[\\s-]+/).includes(tok))) {{
            clusterScore += 0.6;
          }} else if (def && (def.includes(' ' + kw + ' ') || def.startsWith(kw + ' ') || def.endsWith(' ' + kw))) {{
            clusterScore += 0.35;
          }}
        }}

        if (clusterScore > 0) {{
          for (const target of cluster.grades) {{
            if (gradeFilter && target.g !== gradeFilter) continue;
            const gData = CURRICULUM_DATA[target.g];
            if (!gData) continue;
            const uData = gData.units.find(u => u.unitNum === target.u);
            if (!uData) continue;

            let cefrBonus = 0;
            if (cefr) {{
              if ((cefr === 'A1' || cefr === 'A2') && target.g <= 6) cefrBonus = 0.15;
              else if ((cefr === 'B1' || cefr === 'B2') && target.g >= 7 && target.g <= 10) cefrBonus = 0.15;
              else if (cefr === 'C1' && target.g >= 11) cefrBonus = 0.15;
            }}

            const finalScore = Math.min(0.96, (clusterScore * 0.4) + cefrBonus + (target.g === 8 ? 0.05 : 0));
            scoredUnits.push({{
              grade: target.g,
              gradeName: gData.name,
              unitNum: target.u,
              unitTitle: uData.title,
              unitTitleTr: uData.titleTr,
              score: finalScore,
              rationale: `"${{cleanWord}}" kelimesi ${{cluster.id.replace(/_/g, ' ')}} tematik bağlamı ile ${{gData.name}} ${{uData.title}} (${{uData.titleTr}}) ünitesine bağlanmıştır.`
            }});
          }}
        }}
      }}

      // C. Ünite İçi Kelime Benzerliği Araması
      if (scoredUnits.length === 0) {{
        for (const [gKey, gData] of Object.entries(CURRICULUM_DATA)) {{
          const gNum = parseInt(gKey, 10);
          if (gradeFilter && gNum !== gradeFilter) continue;
          for (const u of gData.units) {{
            let matchCount = 0;
            for (const kw of u.semanticKeywords) {{
              if (cleanWord === kw) {{
                matchCount += 2;
              }} else if (cleanWord.length >= 4 && kw.length >= 4 && (cleanWord.startsWith(kw) || kw.startsWith(cleanWord))) {{
                matchCount += 1;
              }} else if (def && (def.includes(' ' + kw + ' ') || def.startsWith(kw + ' ') || def.endsWith(' ' + kw))) {{
                matchCount += 1;
              }}
            }}
            if (matchCount > 0) {{
              scoredUnits.push({{
                grade: gNum,
                gradeName: gData.name,
                unitNum: u.unitNum,
                unitTitle: u.title,
                unitTitleTr: u.titleTr,
                score: Math.min(0.85, matchCount * 0.25),
                rationale: `"${{cleanWord}}" kelimesi anahtar kavram benzerliğiyle ${{gData.name}} ${{u.title}} (${{u.titleTr}}) ünitesine bağlanmıştır.`
              }});
            }}
          }}
        }}
      }}

      scoredUnits.sort((a, b) => b.score - a.score);

      if (scoredUnits.length > 0) {{
        const best = scoredUnits[0];
        const alternates = scoredUnits.slice(1, 4).map(s => ({{
          grade: s.grade,
          gradeName: s.gradeName,
          unitNum: s.unitNum,
          unitTitle: s.unitTitle,
          unitTitleTr: s.unitTitleTr,
          confidence: Math.round(s.score * 100) / 100
        }}));

        return {{
          grade: best.grade,
          gradeName: best.gradeName,
          unitNum: best.unitNum,
          unitTitle: best.unitTitle,
          unitTitleTr: best.unitTitleTr,
          confidence: Math.round(best.score * 100) / 100,
          matchType: 'semantic_affinity',
          rationale: best.rationale,
          alternateMatches: alternates
        }};
      }}

      let defaultGrade = 5;
      let defaultUnit = 1;
      if (cefr === 'A1') {{ defaultGrade = 2; defaultUnit = 1; }}
      else if (cefr === 'A2') {{ defaultGrade = 5; defaultUnit = 1; }}
      else if (cefr === 'B1') {{ defaultGrade = 8; defaultUnit = 2; }}
      else if (cefr === 'B2' || cefr === 'C1') {{ defaultGrade = 11; defaultUnit = 1; }}
      
      const defGradeData = CURRICULUM_DATA[defaultGrade];
      const defUnitData = defGradeData.units[0];

      return {{
        grade: defaultGrade,
        gradeName: defGradeData.name,
        unitNum: defUnitData.unitNum,
        unitTitle: defUnitData.title,
        unitTitleTr: defUnitData.titleTr,
        confidence: 0.50,
        matchType: 'cefr_heuristic',
        rationale: `"${{cleanWord}}" genel kelime havuzundan CEFR (${{cefr || 'A1-B1'}}) seviyesine göre ${{defGradeData.name}} ${{defUnitData.title}} ünitesiyle ilişkilendirildi.`,
        alternateMatches: []
      }};
    }},

    /**
     * Verilen sınıf ve tarihe göre o haftanın müfredat dersini ve takvim bilgilerini döndürür.
     * @param {{number}} grade - Sınıf numarası (1-12)
     * @param {{Date}} date - İsteğe bağlı tarih nesnesi (varsayılan: bugün)
     * @returns {{object}} Hafta, ünite, ders saatleri ve hedef kelimeler
     */
    getSchedule(grade = 5, date = new Date()) {{
      const gNum = Math.max(1, Math.min(12, parseInt(grade, 10) || 5));
      const gData = CURRICULUM_DATA[gNum] || CURRICULUM_DATA[5];
      const month = date.getMonth() + 1;
      const day = date.getDate();

      let weekIndex = 0;
      if (month === 9) {{
        weekIndex = day < 21 ? 0 : (day < 28 ? 1 : 2);
      }} else if (month === 10) {{
        weekIndex = day < 11 ? 3 : (day < 18 ? 4 : (day < 25 ? 5 : 6));
      }} else if (month === 11) {{
        weekIndex = day <= 7 ? 7 : (day <= 15 ? 8 : (day <= 22 ? 9 : 10));
      }} else if (month === 12) {{
        weekIndex = day <= 7 ? 11 : (day <= 14 ? 12 : (day <= 21 ? 13 : (day <= 28 ? 14 : 15)));
      }} else if (month === 1) {{
        weekIndex = day <= 7 ? 15 : (day <= 14 ? 16 : 17);
      }} else if (month === 2) {{
        weekIndex = day <= 14 ? 18 : (day <= 21 ? 19 : 20);
      }} else if (month === 3) {{
        weekIndex = day <= 7 ? 21 : (day <= 14 ? 22 : (day <= 21 ? 23 : (day <= 28 ? 24 : 25)));
      }} else if (month === 4) {{
        weekIndex = day <= 7 ? 25 : (day <= 14 ? 26 : (day <= 21 ? 27 : 28));
      }} else if (month === 5) {{
        weekIndex = day <= 7 ? 29 : (day <= 14 ? 30 : (day <= 21 ? 31 : (day <= 28 ? 32 : 33)));
      }} else if (month === 6) {{
        weekIndex = day <= 7 ? 34 : 35;
      }} else {{
        weekIndex = 9;
      }}

      weekIndex = Math.min(gData.calendar.length - 1, Math.max(0, weekIndex));
      const activeWeek = gData.calendar[weekIndex] || gData.calendar[0];
      const activeUnit = gData.units.find(u => u.unitNum === activeWeek.unitNum) || gData.units[0];

      return {{
        grade: gNum,
        gradeName: gData.name,
        stage: gData.stage,
        stageTr: gData.stageTr,
        badge: gData.badge,
        weekNum: activeWeek.weekNum,
        month: activeWeek.month,
        dates: activeWeek.dates,
        hours: activeWeek.hours,
        unitNum: activeWeek.unitNum,
        unitCode: activeUnit.code,
        unitTitle: activeUnit.title,
        unitTitleTr: activeUnit.titleTr,
        focus: activeWeek.focus || activeUnit.subThemes || activeUnit.title,
        functions: activeUnit.functions,
        outcomes: activeUnit.outcomes,
        outcomesList: activeUnit.outcomesList || [],
        targetWords: activeWeek.targetWords || activeUnit.targetVocab.slice(0, 10),
        importantDays: activeWeek.importantDays,
        isCurrentWeek: true
      }};
    }},

    /**
     * Belirli bir sınıf ve haftanın takvim kaydını döndürür.
     */
    getWeekByNumber(grade, weekNum) {{
      const gNum = Math.max(1, Math.min(12, parseInt(grade, 10) || 5));
      const gData = CURRICULUM_DATA[gNum] || CURRICULUM_DATA[5];
      const targetW = gData.calendar.find(w => w.weekNum === weekNum) || gData.calendar[0];
      const targetU = gData.units.find(u => u.unitNum === targetW.unitNum) || gData.units[0];

      return {{
        grade: gNum,
        gradeName: gData.name,
        stage: gData.stage,
        stageTr: gData.stageTr,
        badge: gData.badge,
        weekNum: targetW.weekNum,
        month: targetW.month,
        dates: targetW.dates,
        hours: targetW.hours,
        unitNum: targetW.unitNum,
        unitCode: targetU.code,
        unitTitle: targetU.title,
        unitTitleTr: targetU.titleTr,
        focus: targetW.focus || targetU.subThemes || targetU.title,
        functions: targetU.functions,
        outcomes: targetU.outcomes,
        outcomesList: targetU.outcomesList || [],
        targetWords: targetW.targetWords || targetU.targetVocab.slice(0, 10),
        importantDays: targetW.importantDays
      }};
    }}
  }};

  if (typeof window !== 'undefined') {{
    window.CURRICULUM_DATA = CURRICULUM_DATA;
    window.CURRICULUM_CLASSIFIER = CURRICULUM_CLASSIFIER;
  }}
  if (typeof module !== 'undefined' && module.exports) {{
    module.exports = {{ CURRICULUM_DATA, CURRICULUM_CLASSIFIER }};
  }}

}})();
"""

    with open(OUTPUT_JS_PATH, 'w', encoding='utf-8') as f:
        f.write(js_code)
    log(f"✅ {OUTPUT_JS_PATH} dosyası başarıyla üretildi ({len(js_code.encode('utf-8')):,} byte).")

if __name__ == '__main__':
    reg = build_full_curriculum_registry()
    generate_curriculum_javascript(reg)
    log("Tüm K-12 müfredat derleme süreci başarıyla tamamlandı.")
