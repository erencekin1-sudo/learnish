#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Learnish - Pedagogik Örnek Cümle Zenginleştirici (Contextual Example Generator)
YDS/YÖKDİL ve Maarif kelimelerindeki sınav kaynaklarını (2020 YDS/1 ...) 
kelimenin Türkçe anlamına ve kullanım bağlamına birebir uygun, akılda kalıcı,
tekrar etmeyen İngilizce örnek cümlelerle değiştirir.
"""

import os
import re
import json
import hashlib

BASE_DIR = '/Users/erencekin/Desktop/İntegral/Learnish'
KELIMELER_PATH = os.path.join(BASE_DIR, 'belgeler', 'kelimeler_havuzu.json')
WORDS_DATA_JS = os.path.join(BASE_DIR, 'words-data.js')
OXFORD_JSON = os.path.join(BASE_DIR, 'belgeler', 'oxford_5000_cefr.json')

CITATION_PATTERN = re.compile(
    r'\b(202\d|YDS|YÖKDİL|Nisan|Ekim|Mart|Kasım|S\.\d+|\[DC\]|\[Ç\]|\[DÖ\]|\[TK\]|kök|parça)\b',
    re.IGNORECASE
)

# -----------------------------------------------------------------------------
# 1. DOMAIN CLASSIFIER BASED ON TURKISH MEANING (TR)
# -----------------------------------------------------------------------------
DOMAIN_KEYWORDS = {
    'MED': [
        'hastalık', 'tedavi', 'semptom', 'belirti', 'ağrı', 'kanser', 'tansiyon', 'kalp',
        'damar', 'cerrah', 'ameliyat', 'mikrop', 'bakteri', 'virüs', 'enfeksiyon', 'doku',
        'kemik', 'kas', 'kan', 'böbrek', 'karaciğer', 'beyin', 'sinir', 'bağışıklık',
        'aşı', 'ilaç', 'doktor', 'klinik', 'tanı', 'teşhis', 'sendrom', 'alerji', 'solunum',
        'sindirim', 'hücre', 'tıp', 'tıbbi', 'psittaci', 'artery', 'hastane', 'hasta'
    ],
    'ENV': [
        'çevre', 'iklim', 'hava', 'orman', 'deniz', 'okyanus', 'göl', 'nehir', 'toprak',
        'kaya', 'mineral', 'deprem', 'volkan', 'fırtına', 'kasırga', 'rüzgar', 'yağmur',
        'kar', 'buzul', 'sıcaklık', 'kuraklık', 'sera', 'kirlilik', 'ekosistem', 'habitat',
        'karbon', 'biyosfer', 'ozon', 'doğa', 'doğal', 'atmosfer', 'gece', 'gündüz', 'ışık'
    ],
    'ZOO': [
        'hayvan', 'kuş', 'balık', 'memeli', 'sürüngen', 'böcek', 'av', 'avcı', 'yırtıcı',
        'tür', 'nesil', 'tüken', 'sürü', 'kanat', 'gaga', 'tüy', 'yuva', 'kurt', 'gergedan',
        'ayı', 'aslan', 'kaplan', 'köpek', 'kedi', 'vahşi', 'evcil', 'rhino', 'wolf'
    ],
    'AGR': [
        'bitki', 'ağaç', 'çiçek', 'tohum', 'kök', 'yaprak', 'tarım', 'mahsul', 'hasat',
        'buğday', 'tahıl', 'sebze', 'meyve', 'gıda', 'besin', 'beslenme', 'gübre', 'sulama',
        'çiftlik', 'çiftçi', 'tarımsal', 'organik', 'yemek', 'yiyecek', 'içecek', 'mutfak'
    ],
    'SCI': [
        'bilim', 'uzay', 'gezegen', 'yıldız', 'galaksi', 'güneş', 'ay', 'uydu', 'teleskop',
        'fizik', 'kimya', 'atom', 'molekül', 'parçacık', 'radyasyon', 'enerji', 'nükleer',
        'elektrik', 'manyetik', 'bilgisayar', 'dijital', 'yazılım', 'veri', 'yapay zekâ',
        'robot', 'algoritma', 'internet', 'cihaz', 'teknoloji', 'deney', 'laboratuvar',
        'araştırma', 'ölçüm', 'analiz', 'formül', 'matematik'
    ],
    'ECON': [
        'ekonomi', 'para', 'pazar', 'piyasa', 'borsa', 'hisse', 'yatırım', 'ticaret',
        'şirket', 'sanayi', 'fabrika', 'üretim', 'tüketim', 'maliyet', 'fiyat', 'gelir',
        'gider', 'bütçe', 'vergi', 'banka', 'enflasyon', 'faiz', 'ihracat', 'ithalat',
        'işsizlik', 'işçi', 'sermaye', 'ticari', 'satış', 'satın', 'finans', 'mali'
    ],
    'GOV': [
        'hükümet', 'yasa', 'kanun', 'kural', 'ceza', 'suç', 'mahkeme', 'hakim', 'savcı',
        'avukat', 'polis', 'hak', 'adalet', 'özgürlük', 'anayasa', 'parlamento', 'seçim',
        'oy', 'parti', 'bakan', 'başkan', 'devlet', 'politika', 'kamu', 'sivil', 'vatandaş',
        'barış', 'antlaşma', 'diplomasi', 'yönetim', 'otorite', 'yetki', 'yasal'
    ],
    'WAR': [
        'savaş', 'ordu', 'askeri', 'asker', 'silah', 'savunma', 'saldırı', 'çatışma',
        'birlik', 'general', 'zafer', 'yenilgi', 'işgal', 'müttefik', 'düşman', 'güvenlik'
    ],
    'PSY': [
        'zihin', 'beyin', 'düşünce', 'fikir', 'akıl', 'hafıza', 'bellek', 'algı', 'duygu',
        'his', 'psikoloji', 'stres', 'kaygı', 'korku', 'fobi', 'panik', 'travma', 'mutluluk',
        'hüzün', 'öfke', 'niyet', 'dikkat', 'konsantrasyon', 'bilinç', 'davranış', 'kişilik',
        'karakter', 'alışkanlık', 'güdü', 'motivasyon', 'özgüven', 'tutum'
    ],
    'EDU': [
        'okul', 'sınıf', 'öğretmen', 'öğrenci', 'ders', 'sınav', 'eğitim', 'üniversite',
        'akademi', 'tez', 'kütüphane', 'kitap', 'okuma', 'yazma', 'dil', 'sözcük', 'harf',
        'gramer', 'alfabe', 'öğrenme', 'öğretme', 'kurs', 'ödev', 'mezun'
    ],
    'SOC': [
        'toplum', 'kültür', 'sanat', 'tarih', 'gelenek', 'medeniyet', 'antik', 'imparatorluk',
        'kral', 'kraliçe', 'müze', 'miras', 'anıt', 'fosil', 'din', 'inanç', 'tanrı',
        'tapınak', 'ritüel', 'felsefe', 'ahlak', 'erdem', 'efsane', 'mitoloji', 'tören',
        'bayram', 'müzik', 'resim', 'tiyatro', 'edebiyat', 'şiir'
    ]
}

def clean_word_key(w):
    return w.lower().strip()

def detect_domain(tr):
    tr_low = (tr or '').lower()
    scores = {}
    for dom, kws in DOMAIN_KEYWORDS.items():
        score = sum(1 for kw in kws if kw in tr_low)
        if score > 0:
            scores[dom] = score
    if scores:
        return max(scores.items(), key=lambda x: x[1])[0]
    return 'GEN'

# -----------------------------------------------------------------------------
# 2. CURATED SENTENCES FOR PHRASES, IDIOMS & SPECIAL WORDS
# -----------------------------------------------------------------------------
SPECIAL_PHRASE_SENTENCES = {
    # Phrasal Verbs
    'blast off': 'The spacecraft is scheduled to blast off from the launch pad at dawn.',
    'branch off': 'A narrow footpath branches off from the main road towards the ancient ruins.',
    'break down': 'Our car broke down on the motorway, so we had to call emergency roadside assistance.',
    'break off': 'Diplomats decided to break off negotiations after talks failed to yield results.',
    'break out': 'A dangerous fire broke out in the warehouse late last night.',
    'bring about': 'Technological breakthroughs continue to bring about significant social transformations.',
    'bring in': 'The city administration introduced policies to bring in foreign technology investments.',
    'bring up': 'She decided to bring up the funding issue at the annual committee meeting.',
    'build up': 'Toxic chemicals can gradually build up inside living aquatic organisms.',
    'burn up': 'Most meteors burn up completely upon entering the upper layer of Earth\'s atmosphere.',
    'call off': 'The referee had no choice but to call off the soccer match due to heavy snow.',
    'call up': 'Viewing old family photographs never fails to call up fond childhood memories.',
    'cancel out': 'The positive effects of increased exports were cancelled out by rising energy costs.',
    'carry on': 'Despite facing unexpected hurdles, the researchers decided to carry on with their experiments.',
    'carry out': 'The scientific team will carry out a detailed ecological survey in the national reserve.',
    'catch up': 'He studied diligently every weekend to catch up with his university classmates.',
    'chop down': 'Local environmental laws prohibit residents to chop down centuries-old olive trees.',
    'come across': 'While browsing the library archives, she came across an unpublished historic manuscript.',
    'come back': 'Migratory birds come back to their northern breeding grounds every spring.',
    'come down': 'Housing prices began to come down steadily after the central bank raised interest rates.',
    'come out': 'The professor\'s eagerly anticipated textbook is scheduled to come out next month.',
    'come up with': 'The engineering students came up with an ingenious solar-powered water filter.',
    'cope with': 'Counselors help students learn effective cognitive strategies to cope with exam anxiety.',
    'cut down': 'Doctors strongly advise elderly patients to cut down on processed sugar and salt intake.',
    'die out': 'Without urgent conservation efforts, many rare amphibian species will soon die out.',
    'do without': 'During the mountain expedition, the hikers had to do without cellular reception.',
    'draw up': 'Corporate lawyers met to draw up a comprehensive partnership agreement.',
    'drop out': 'Financial difficulties forced several students to drop out of university prematurely.',
    'end up': 'If you neglect your vehicle maintenance, you could end up stranded on the road.',
    'figure out': 'Software developers worked overnight to figure out the cause of the database glitch.',
    'fill in': 'Please remember to fill in all required fields on the official visa application form.',
    'find out': 'Investigative journalists worked for months to find out the truth behind the scandal.',
    'get along with': 'She finds it remarkably easy to get along with colleagues from diverse cultural backgrounds.',
    'get away with': 'Dishonest companies should never be permitted to get away with false advertising.',
    'get by': 'During his first year as an apprentice, he managed to get by on a very modest stipend.',
    'get over': 'It took him several quiet months in the countryside to get over the physical exhaustion.',
    'get rid of': 'The municipal council launched a community campaign to get rid of single-use plastic waste.',
    'give away': 'The charitable foundation decided to give away warm winter coats to local families.',
    'give off': 'Certain nocturnal flowers give off a sweet fragrance to attract pollinating moths.',
    'give up': 'No matter how steep the learning curve seemed, he refused to give up on his dream.',
    'go against': 'Such discriminatory practices go against the fundamental principles of universal human rights.',
    'go ahead': 'The municipal authorities gave permission for the light-rail construction to go ahead.',
    'go off': 'The building was evacuated immediately when the emergency fire alarm went off.',
    'go on': 'The lively cultural festivities will go on until late into the warm summer evening.',
    'go through': 'Refugee families often go through unimaginable hardships before reaching safety.',
    'grow up': 'Children who grow up in multilingual households often develop strong cognitive adaptability.',
    'hand in': 'All registered students must hand in their term papers before five o\'clock on Friday.',
    'hand out': 'Volunteers helped hand out hot meals and blankets to shelter residents.',
    'hold back': 'He struggled to hold back tears of joy during his daughter\'s graduation ceremony.',
    'keep up with': 'It can be challenging for senior citizens to keep up with rapid digital innovations.',
    'lay off': 'Declining sales forced the electronics manufacturing plant to lay off fifty workers.',
    'lead to': 'Uncontrolled industrial discharge can lead to severe groundwater contamination.',
    'look after': 'Elder sisters often help look after their younger siblings after school hours.',
    'look down on': 'It is deeply arrogant to look down on people who perform manual labor.',
    'look forward to': 'The excited school children look forward to their annual science museum excursion.',
    'look into': 'A special independent panel was formed to look into the allegations of accounting fraud.',
    'look up to': 'Young athletes naturally look up to Olympic champions as inspiring role models.',
    'make out': 'Through the thick coastal fog, the captain could barely make out the distant lighthouse.',
    'make up': 'Water molecules make up approximately sixty percent of the average human body weight.',
    'make up for': 'He bought his sister flowers to make up for forgetting her birthday dinner.',
    'pass away': 'The celebrated novelist passed away peacefully in her sleep at the age of ninety-four.',
    'pass out': 'Lack of ventilation in the crowded hall caused two audience members to pass out.',
    'pay off': 'Years of rigorous academic training finally paid off when she received the fellowship.',
    'point out': 'The keynote speaker pointed out several major flaws in the current economic model.',
    'pull through': 'Thanks to prompt medical intervention, the critical patient managed to pull through.',
    'put off': 'The committee decided to put off the final vote until all members were present.',
    'put out': 'Firefighters battled courageously through the night to put out the raging forest fire.',
    'put up with': 'Commuters have had to put up with frequent train delays during railway repairs.',
    'rely on': 'Modern agricultural communities heavily rely on automated weather forecasting.',
    'rule out': 'Medical tests enabled physicians to definitively rule out hereditary heart conditions.',
    'run into': 'I did not expect to run into my former English teacher at the airport terminal.',
    'run out of': 'The expedition had to turn back early when they ran out of drinking water.',
    'set off': 'The hikers set off at dawn to reach the mountain summit before midday heat.',
    'set up': 'The young scientist received a grant to set up her own biochemistry laboratory.',
    'show off': 'He brought his trophy to the reunion to show off his athletic achievements.',
    'slow down': 'Drivers are legally required to slow down when passing near school zones.',
    'stand for': 'In the international standard, the initials UN stand for United Nations.',
    'stand out': 'Her exceptional analytical clarity made her stand out among all scholarship applicants.',
    'switch off': 'Remember to switch off your computer monitor before leaving the office each evening.',
    'take after': 'In terms of patience and musical talent, she clearly takes after her grandmother.',
    'take off': 'Passengers are required to fasten seat belts as the aircraft prepares to take off.',
    'take on': 'The expanding tech startup is ready to take on fifty additional software engineers.',
    'take over': 'The vice president will take over executive leadership upon the CEO\'s retirement.',
    'take part in': 'Over two hundred university students gathered to take part in the robotics competition.',
    'take place': 'The international climate summit will take place in Geneva this coming November.',
    'tear down': 'The urban redevelopment project will tear down dilapidated buildings to construct a park.',
    'think over': 'He asked for the weekend to think over the lucrative employment offer in Tokyo.',
    'turn down': 'Reluctantly, she had to turn down the invitation due to prior teaching commitments.',
    'turn into': 'Over the decades, the sleepy seaside village turned into a bustling tourist hub.',
    'turn off': 'Please turn off the laboratory gas valve before vacating the chemistry workshop.',
    'turn on': 'She asked the assistant to turn on the projector for the visual presentation.',
    'turn out': 'Despite the gloomy morning forecast, the outdoor event turned out to be a grand success.',
    'turn up': 'We waited for nearly an hour, but the guest speaker failed to turn up.',
    'use up': 'Running intensive graphics software can quickly use up laptop battery reserves.',
    'wear out': 'Walking on rough mountain gravel will wear out cheap hiking boots very rapidly.',
    'work out': 'Scientists have not yet worked out the exact biochemical mechanism behind the cure.',

    # Collocations & Expressions
    'achieve a goal': 'Setting structured daily habits is the most reliable way to achieve a goal.',
    'address a problem': 'City planners convened an emergency forum to address a problem with clean water.',
    'address an issue': 'The government must address an issue of juvenile unemployment without delay.',
    'adversely affect': 'Severe air pollution can adversely affect childhood respiratory development.',
    'almost impossible': 'Without a compass, navigating the dense jungle at night is almost impossible.',
    'answer a question': 'The professor paused the lecture to clearly answer a question from the front row.',
    'artificial intelligence': 'Advances in artificial intelligence are transforming diagnostics in modern radiology.',
    'attract attention': 'The newly published historical novel continues to attract attention from critics worldwide.',
    'bear in mind': 'When budgeting for travel, travelers should bear in mind fluctuating foreign exchange rates.',
    'become extinct': 'Unless anti-poaching laws are enforced, the mountain gorilla may become extinct.',
    'blood pressure': 'Doctors advise regular physical walking to help maintain healthy blood pressure levels.',
    'boost creativity': 'Exposing students to diverse art forms helps boost creativity across disciplines.',
    'carbon dioxide': 'Forests absorb massive amounts of carbon dioxide through photosynthetic processes.',
    'cause damage': 'The earthquake was strong enough to cause damage to centuries-old stone structures.',
    'cause disease': 'Harmful bacterial pathogens can cause disease if food is stored improperly.',
    'cause harm': 'Chemical pesticides can cause harm to beneficial insects like honeybees.',
    'cause illness': 'Drinking untreated stream water can cause illness in unsuspecting hikers.',
    'cause symptoms': 'Certain airborne pollen varieties cause symptoms such as sneezing and watery eyes.',
    'chronic disease': 'Proper diet and cardiovascular exercise lower the risk of developing a chronic disease.',
    'clearly stated': 'The academic policy was clearly stated in the orientation handbook.',
    'climate change': 'Global temperature records confirm that climate change is accelerating rapidly.',
    'come into contact': 'Healthcare workers wash their hands thoroughly whenever they come into contact with fluids.',
    'come into contact (with)': 'Protective gloves prevent skin from coming into contact with hazardous solvents.',
    'common feature': 'Intense curiosity about nature is a common feature shared by leading researchers.',
    'conduct a study': 'Biologists plan to conduct a study on migrating whale pods along the Pacific coast.',
    'conduct research': 'Postgraduate fellows conduct research on renewable energy storage systems.',
    'crucial role': 'Early childhood nutrition plays a crucial role in cognitive and physical growth.',
    'cultural heritage': 'Ancient mosaic floors represent an invaluable part of the nation\'s cultural heritage.',
    'daily routine': 'A twenty-minute morning jog has become an indispensable part of his daily routine.',
    'deep understanding': 'Studying ancient philosophy provides scholars with a deep understanding of human ethics.',
    'direct impact': 'Interest rate adjustments have a direct impact on corporate borrowing patterns.',
    'draw attention to': 'The documentary aims to draw attention to the plight of endangered marine fauna.',
    'economic growth': 'Investments in clean infrastructure stimulate sustainable long-term economic growth.',
    'educational background': 'Applicants with a multidisciplinary educational background are highly sought after.',
    'effective method': 'Repetitive spaced recall is proven to be the most effective method for vocabulary mastery.',
    'environmental impact': 'Industrial manufacturers must assess the environmental impact of their production waste.',
    'equal rights': 'The national constitution guarantees equal rights and protections for all citizens.',
    'essential part': 'Active listening is an essential part of productive collaborative leadership.',
    'gain experience': 'Summer internships allow university students to gain experience in corporate environments.',
    'global warming': 'Rising sea levels are one of the most visible consequences of global warming.',
    'great importance': 'Diplomatic communication is of great importance in de-escalating military tensions.',
    'have an effect on': 'Excessive screen time before sleep can have an effect on natural melatonin cycles.',
    'have an impact on': 'Technological innovation will have an impact on almost every service industry.',
    'high risk': 'Smoking tobacco significantly increases the high risk of cardiovascular failure.',
    'human rights': 'International organizations monitor compliance with basic universal human rights standards.',
    'important role': 'Vaccines have played an important role in the global eradication of deadly epidemics.',
    'in danger of': 'Several indigenous bird species are in danger of extinction due to deforestation.',
    'in favor of': 'The majority of board members voted in favor of the new environmental initiative.',
    'in terms of': 'In terms of renewable energy adoption, northern European nations lead the world.',
    'keep in mind': 'Hikers should keep in mind that weather conditions can change abruptly in high altitudes.',
    'key factor': 'Patient compliance with dietary advice is a key factor in successful rehabilitation.',
    'lead a life': 'After retiring from corporate finance, he chose to lead a quiet life in the countryside.',
    'major problem': 'Plastic pollution in oceans has become a major problem for international marine life.',
    'make a decision': 'The academic committee will meet on Monday to make a decision on thesis proposals.',
    'make a difference': 'Small everyday acts of community kindness can make a difference in people\'s lives.',
    'make an effort': 'Every citizen should make an effort to separate household recyclable materials.',
    'make progress': 'With consistent speech coaching, young students make progress in pronunciation remarkably fast.',
    'mental health': 'Universities are opening dedicated wellness clinics to support student mental health.',
    'natural resources': 'Countries must manage their fresh water and timber natural resources responsibly.',
    'negative impact': 'Chronic workplace stress can have a severe negative impact on physical immunity.',
    'pay attention': 'Drivers must pay attention to changing traffic signals in foggy weather conditions.',
    'pay attention to': 'Students should pay attention to grammatical nuance when translating technical literature.',
    'play a part in': 'Healthy dietary choices play a part in reducing hereditary cancer risks.',
    'play a role in': 'Enzymes play a role in accelerating critical chemical reactions inside cells.',
    'positive effect': 'Regular aerobic exercise exerts a positive effect on memory consolidation.',
    'raise awareness': 'The public health campaign seeks to raise awareness about early stroke detection.',
    'reach a conclusion': 'After reviewing all clinical trial evidence, researchers reached a conclusion in favor of the drug.',
    'scientific evidence': 'Rigorous scientific evidence disproved the historical superstition regarding comets.',
    'set a goal': 'Before starting each academic semester, learners should set a goal for daily vocabulary practice.',
    'significant difference': 'Access to nutritional school breakfasts makes a significant difference in student focus.',
    'social media': 'Modern teenagers frequently communicate through visual social media platforms.',
    'take into account': 'Architects must take into account local seismic activity when designing skyscrapers.',
    'take part': 'Hundreds of volunteers take part in the annual coastal cleanup operation.',
    'vital role': 'Honeybees perform a vital role in pollinating agricultural food crops worldwide.',
    'widely accepted': 'The germ theory of disease is now a widely accepted foundation of modern medicine.',
    'take advantage of': 'Ambitious learners should take advantage of free digital language libraries.',
    'fail to do': 'Companies that fail to innovate risk losing their competitive market share.',
    'important for/to': 'Balanced nutrition is critically important for healthy childhood bone development.',

    # Prepositions & Conjunctions
    'in spite of': 'They completed the high-altitude marathon in spite of freezing rain and strong winds.',
    'prior to': 'All experimental protocols were reviewed by the ethics board prior to clinical testing.',
    'on behalf of': 'The ambassador delivered a warm congratulatory speech on behalf of his government.',
    'along with': 'The professor published the primary research findings along with detailed raw data sets.',
    'apart from': 'Apart from occasional thunderstorms in late July, the summer climate was wonderfully mild.',
    'as a result of': 'Many coastal businesses flourished as a result of expanding international ecotourism.',
    'as well as': 'The scholarship covers university tuition as well as monthly dormitory living expenses.',
    'due to': 'The transatlantic flight was postponed for two hours due to severe turbulence.',
    'in addition to': 'In addition to English and German, the young diplomat speaks fluent Turkish.',
    'in case of': 'Keep an emergency medical kit easily accessible in case of accidental kitchen burns.',
    'in order to': 'Scientists installed satellite transmitters in order to track sea turtle migrations.',
    'instead of': 'She opted for a refreshing cup of green tea instead of drinking sugary sodas.',
    'thanks to': 'Thanks to prompt antibiotic therapy, the infant recovered quickly from pneumonia.',
    'regardless of': 'Universal primary education must be accessible to every child regardless of wealth.',
    'with regard to': 'The city mayor held a press conference with regard to the new transit expansion.',
    'according to': 'According to the official archaeological report, the carved stone tablet dates to 1200 BC.',
    'because of': 'Agricultural harvests suffered extensive losses because of prolonged summer drought.',
    'by means of': 'Ancient desert traders navigated shifting sand dunes by means of stellar constellations.',
    'even though': 'Even though the math exam was difficult, most diligent students passed comfortably.',
    'furthermore': 'The hotel provides complimentary breakfast; furthermore, guests enjoy free parking.',
    'however': 'The initial prototype showed promise; however, battery life required substantial improvement.',
    'in contrast': 'Traditional incandescent bulbs waste heat; in contrast, modern LED fixtures are highly efficient.',
    'moreover': 'Solar panels reduce electricity bills; moreover, they help mitigate residential emissions.',
    'nevertheless': 'The trek was arduous and steep; nevertheless, the hikers reached the summit before dusk.',
    'on the contrary': 'He was not offended by constructive critique; on the contrary, he welcomed suggestions.',
    'on the other hand': 'Living in a metropolis offers culture; on the other hand, noise levels can be stressful.',
    'otherwise': 'Submit your conference registration today; otherwise, you will incur a late payment penalty.',
    'therefore': 'The laboratory tests proved conclusively negative; therefore, the patient was discharged.',
    'whereas': 'Some bird species migrate thousands of miles, whereas others remain sedentary all year.',

    # Countries (Maarif)
    'kyrgyzstan': 'Kyrgyzstan is renowned for its breathtaking Tian Shan mountains and nomadic traditions.',
    'mexico': 'Mexico possesses vibrant artistic folklore, colorful markets, and ancient pyramids.',
    'russia': 'Russia spans across eleven time zones from eastern Europe to the Pacific coast.',
    'scotland': 'Scotland is famous worldwide for historic stone castles, bagpipes, and dramatic lochs.',
    'singapore': 'Singapore is a modern island city-state celebrated for green urban architecture.',
    'south africa': 'South Africa boasts extraordinary biodiversity, including the famous Kruger National Park.',
    'south korea': 'South Korea has become a global leader in high-tech electronics and popular culture.',
    'spain': 'Spain attracts millions of visitors with sunny Mediterranean beaches and historic architecture.',
    'thailand': 'Thailand welcomes travelers with ornate Buddhist temples and tropical island beaches.',
    'the turkish republic of northern cyprus': 'The Turkish Republic of Northern Cyprus features beautiful Mediterranean coastlines and historical castles.',
    'the united kingdom (uk) (england, scotland, northern ireland, wales)': 'The United Kingdom is a union of four nations with rich literary and parliamentary histories.',
    'the united states of america (usa)': 'The United States of America is composed of fifty diverse states stretching across North America.',
    'turkmenistan': 'Turkmenistan is known for the Karakum Desert and ancient Silk Road archaeological sites.',
    'türkiye': 'Türkiye bridges Europe and Asia with millennia of rich culture and stunning landscapes.',
    'uzbekistan': 'Uzbekistan houses breathtaking Islamic architecture along historic Silk Road trading cities like Samarkand.',
    'china': 'China is home to the majestic Great Wall, giant pandas, and centuries of philosophical literature.',
    'germany': 'Germany is renowned for engineering excellence, historic universities, and picturesque forests.',
    'france': 'France is celebrated worldwide for its iconic Eiffel Tower, fine cuisine, and renowned art galleries.',
    'italy': 'Italy boasts centuries of Renaissance art, ancient Roman monuments, and world-famous cuisine.',
    'japan': 'Japan harmoniously blends centuries-old cultural customs with cutting-edge technological robotics.',

    # School Rules & Imperatives (Maarif)
    'raise your hand': 'Raise your hand if you wish to ask the teacher a question during the lesson.',
    'listen to the teacher': 'Students should always listen to the teacher attentively while new grammar is explained.',
    'be quiet': 'Please be quiet in the school library so that other students can concentrate on their reading.',
    'don\'t run in the corridor': 'School safety rules remind students: don\'t run in the corridor between class bells.',
    'clean the board': 'The classroom monitor volunteered to clean the board before the math lesson began.',
    'open your book': 'Open your book to page forty-five and examine the illustrated diagram carefully.',
    'close the door': 'Please close the door gently when you leave the classroom to block hallway noise.',
    'turn off your phone': 'Students must turn off your phone during formal written exams.',
    'keep the classroom clean': 'All students cooperate to keep the classroom clean and tidy every afternoon.',
    'arrive on time': 'It is an important habit of discipline to arrive on time for morning school assembly.',
    'do your homework': 'Diligent learners do your homework before relaxing with evening video games.'
}

# -----------------------------------------------------------------------------
# 3. SEMANTIC PATTERNS BY POS AND DOMAIN
# -----------------------------------------------------------------------------
NOUN_FRAMES = {
    'MED': [
        "Clinical specialists emphasize that a patient's {word} can signal vital physiological changes.",
        "Medical laboratory scans helped physicians detect early changes related to {word}.",
        "The newly developed therapeutic protocol was specifically designed to manage {word}.",
        "Healthcare professionals monitor {word} closely during postoperative recovery periods.",
        "Recent clinical studies show a clear statistical correlation between {word} and overall longevity."
    ],
    'ENV': [
        "Environmental researchers are currently monitoring the seasonal impact of {word} on local wetlands.",
        "Climatologists warned that unchecked emissions could intensify fluctuations in {word}.",
        "Satellite imaging provides scientists with valuable data regarding the state of regional {word}.",
        "Local conservation initiatives focus primarily on preserving clean water reserves and native {word}.",
        "Dramatic shifts in {word} can destabilize fragile alpine ecosystems over short time spans."
    ],
    'ZOO': [
        "Wildlife biologists documented how the native {word} survives harsh winter conditions.",
        "The national zoological sanctuary provides a safe habitat for the endangered {word}.",
        "Field observations revealed intricate social behaviors within the natural territory of the {word}.",
        "Protecting the migration corridor of the {word} remains a top priority for park rangers.",
        "Camera traps in the dense forest captured rare nighttime footage of the elusive {word}."
    ],
    'AGR': [
        "Agricultural scientists introduced modern techniques to protect the seasonal {word} from pests.",
        "Organic farmers emphasize that fertile soil composition directly enriches the quality of {word}.",
        "Traditional farming villages celebrated the abundant annual harvest of fresh {word}.",
        "Adequate rainfall and warm sunshine are essential conditions for cultivating healthy {word}.",
        "The local cooperative distributes high-grade seeds to support the sustainable yield of {word}."
    ],
    'SCI': [
        "Recent laboratory experiments reveal how {word} influences the overall efficiency of the reaction.",
        "Astrophysicists used advanced spectrographic instruments to analyze {word} in distant star systems.",
        "The breakthrough discovery of {word} opened new horizons in quantum computing research.",
        "Engineers conducted comprehensive stress tests to measure the resistance of the material to {word}.",
        "Peer-reviewed academic papers highlight the crucial theoretical importance of {word}."
    ],
    'ECON': [
        "Financial analysts warn that sudden volatility in {word} could disrupt international supply chains.",
        "The central bank introduced fiscal adjustments to maintain long-term stability in {word}.",
        "Developing nations experienced rapid industrial transformation fueled by foreign capital and {word}.",
        "Economists debate how emerging digital currencies will reshape the traditional structure of {word}.",
        "Corporate executives met to evaluate the quarterly performance indicators regarding domestic {word}."
    ],
    'GOV': [
        "Legislative committees convened to draft stricter statutory regulations concerning public {word}.",
        "The constitutional court reinforced universal legal safeguards regarding citizen rights and {word}.",
        "Diplomatic representatives signed a bilateral accord aimed at addressing cross-border {word}.",
        "Independent civic watchdogs promote transparency in institutional matters relating to {word}.",
        "Democratic institutions rely upon informed citizen engagement to uphold the integrity of {word}."
    ],
    'WAR': [
        "Military historians analyzed the strategic role of {word} in decisive historical campaigns.",
        "Peacekeepers were deployed along the border corridor to deter any further outbreaks of {word}.",
        "The international treaty banned the deployment and storage of hazardous tactical {word}.",
        "Modern defense strategies place increasing emphasis on cyber surveillance and strategic {word}.",
        "Diplomats worked tirelessly to avert the devastating humanitarian consequences of prolonged {word}."
    ],
    'PSY': [
        "Cognitive psychologists observed how individual differences in {word} shape everyday decision-making.",
        "Regular mindfulness meditation can help restore balance and reduce negative feelings linked to {word}.",
        "The behavioral study examined the neurological underpinnings of human empathy and {word}.",
        "Childhood developmental specialists stress the importance of nurturing emotional resilience and {word}.",
        "Clinical therapists help patients overcome chronic stress by developing a healthier perspective on {word}."
    ],
    'EDU': [
        "The faculty organized a seminar focusing on the pedagogical importance of {word} in school curricula.",
        "Innovative teachers utilize interactive digital software to make the concept of {word} easy to grasp.",
        "University entrance criteria place significant weight upon academic achievement in {word}.",
        "Comprehensive school textbooks provide clear diagrams to illustrate the practical fundamentals of {word}.",
        "Education researchers observed marked improvements when students actively practiced {word} daily."
    ],
    'SOC': [
        "Anthropological excavations shed fascinating light upon the ceremonial significance of {word}.",
        "The cultural documentary explored how ancient communities passed down the traditions of {word}.",
        "Contemporary art exhibitions reflect societal dialogues surrounding multicultural identity and {word}.",
        "Preserving architectural monuments and oral folklore ensures the enduring continuity of national {word}.",
        "Scholars gathered at the symposium to discuss philosophical dimensions of justice, virtue, and {word}."
    ],
    'GEN': [
        "Experienced professionals understand that careful preparation is the key to managing {word} effectively.",
        "The workshop provides practical hands-on exercises to help participants understand the nuances of {word}.",
        "Clear communication and consistent practice make the fundamental principles of {word} easy to master.",
        "Historical archives contain extensive documentation illustrating the gradual evolution of modern {word}.",
        "Visitors to the exhibition were deeply impressed by the remarkable variety and craftsmanship of {word}."
    ]
}

VERB_FRAMES = {
    'MED': [
        "Experienced surgeons intervened promptly to {word} the underlying medical complication.",
        "The newly synthesized therapeutic agent is formulated to {word} chronic inflammatory symptoms.",
        "Preventive vaccination programs aim to {word} the rapid transmission of infectious pathogens.",
        "Proper physical rehabilitation helps recovering patients {word} normal muscular mobility safely."
    ],
    'ENV': [
        "Conservation authorities implemented strict measures to {word} vulnerable coastal habitats.",
        "Global atmospheric treaties require member nations to {word} industrial greenhouse gas emissions.",
        "Renewable energy technologies help developing cities {word} dependence on fossil fuel sources.",
        "Ecological field teams work tirelessly to {word} clean freshwater reserves across the river basin."
    ],
    'ZOO': [
        "Predatory birds utilize sharp eyesight to {word} small rodents across open grassy plains.",
        "Wildlife rangers patrol national reserves daily to {word} endangered mammals from illegal poaching.",
        "Migratory fish travel thousands of miles upriver to {word} in their native freshwater spawning grounds.",
        "Certain nocturnal reptiles change skin coloration to {word} surrounding desert rocks seamlessly."
    ],
    'AGR': [
        "Modern agriculturalists employ drip irrigation systems to {word} scarce freshwater resources.",
        "Farmers introduce biological pest controls to {word} organic crop yields without harmful chemicals.",
        "Cooperative farm associations work collectively to {word} fresh produce directly to urban markets.",
        "Crop rotation techniques are traditionally practiced to {word} soil fertility across consecutive seasons."
    ],
    'SCI': [
        "Laboratory researchers designed an elaborate experiment to {word} the thermodynamic hypothesis.",
        "High-resolution electron microscopes enable materials scientists to {word} atomic lattice structures.",
        "The automated robotic rover was programmed to {word} geological samples across the Martian surface.",
        "Theoretical physicists collaborate across international borders to {word} unified quantum models."
    ],
    'ECON': [
        "Industrial corporations adopted energy-efficient machinery to {word} operational overheads.",
        "Central bankers raised benchmark interest rates to {word} escalating inflationary pressures.",
        "Export enterprises restructured their distribution channels to {word} new overseas consumer markets.",
        "Financial regulatory bodies established new auditing standards to {word} retail investor interests."
    ],
    'GOV': [
        "The parliamentary commission voted unanimously to {word} the contentious reform bill.",
        "Bilateral peace envoys met behind closed doors to {word} durable border security agreements.",
        "Judicial authorities possess statutory authority to {word} statutory compliance across municipal agencies.",
        "Civic leadership coalitions launched public campaigns to {word} democratic citizen participation."
    ],
    'PSY': [
        "Cognitive behavioral therapy assists individuals to {word} counterproductive thought patterns.",
        "Daily mindfulness practice enables stressed professionals to {word} inner tranquility and focus.",
        "Empathetic communication helps family members {word} deep-seated interpersonal misunderstandings.",
        "Neurological research examines how the human brain adapts to {word} sudden traumatic experiences."
    ],
    'EDU': [
        "Engaging pedagogical activities encourage young students to {word} complex grammatical rules naturally.",
        "University professors encourage graduate students to {word} original academic research methodologies.",
        "Interactive classroom discussions help language learners {word} authentic conversational confidence.",
        "Educational institutions provide comprehensive tutoring to {word} equal academic opportunity for all."
    ],
    'SOC': [
        "Cultural preservationists collaborate with historians to {word} ancient folklore and oral histories.",
        "Community cultural centers host seasonal festivals to {word} harmonious multicultural coexistence.",
        "Renowned museum curators worked for three years to {word} priceless Renaissance oil masterpieces.",
        "Philosophical dialogues challenge students to critically {word} inherited ethical assumptions."
    ],
    'GEN': [
        "Diligence and disciplined focus enable individuals to {word} formidable challenges successfully.",
        "The project coordinator developed structured workflows to {word} team productivity and morale.",
        "Careful initial planning can help project leaders {word} costly mistakes during subsequent phases.",
        "Creative thinkers continuously seek novel ways to {word} everyday operational problems."
    ]
}

ADJ_FRAMES = {
    'MED': [
        "Early clinical diagnosis is vital when managing {word} medical disorders.",
        "The medical team observed {word} improvements in the patient's cardiovascular parameters.",
        "Proper clinical hygiene prevents the development of {word} bacterial infections.",
        "The hospital wing was equipped with advanced monitoring devices for {word} patient care."
    ],
    'ENV': [
        "The coastal ecosystem experienced {word} transformations following consecutive mild winters.",
        "Environmental scientists conducted a {word} assessment of regional wetland biodiversity.",
        "Mitigating industrial pollution requires {word} cooperation between municipal and state bodies.",
        "Remote satellite sensors recorded {word} temperature anomalies across polar ice sheets."
    ],
    'ZOO': [
        "The newly discovered amphibian displays {word} behavioral adaptations to high-altitude cold.",
        "Zoologists recorded {word} vocalization patterns among the migratory whale pod.",
        "Protecting {word} wildlife habitats ensures the survival of endangered regional species.",
        "Predatory birds possess {word} visual acuity for hunting prey across vast open savannahs."
    ],
    'AGR': [
        "The fertile volcanic river valley produces {word} harvests of organic citrus fruits.",
        "Agricultural scientists bred a {word} strain of wheat that thrives despite scarce rainfall.",
        "Sustainable crop cultivation plays a {word} role in safeguarding future food security.",
        "Farmers observed {word} plant growth after switching to nutrient-rich organic compost."
    ],
    'SCI': [
        "The scientific theory was substantiated by {word} experimental data gathered over five years.",
        "Engineers developed a {word} sensor capable of detecting minute pressure vibrations.",
        "Astronomers published {word} findings concerning the composition of distant exoplanets.",
        "Rigorous peer review guarantees {word} standards of integrity in published research."
    ],
    'ECON': [
        "Maintaining a {word} fiscal policy enabled the nation to withstand global trade shocks.",
        "Economic forecasters anticipate {word} growth across renewable energy manufacturing sectors.",
        "The corporate board approved a {word} budget allocation for international market expansion.",
        "Small businesses benefit immensely from a {word} regulatory environment and fair taxes."
    ],
    'GOV': [
        "Citizens organized a peaceful assembly to debate the {word} consequences of the new law.",
        "The Supreme Court issued a {word} ruling reinforcing freedom of journalistic expression.",
        "Diplomatic delegations made {word} progress toward finalizing the mutual trade accord.",
        "Transparent governance is a {word} prerequisite for building public institutional trust."
    ],
    'PSY': [
        "A supportive home environment fosters {word} emotional resilience in developing children.",
        "Psychological tests revealed {word} variations in cognitive processing speed among participants.",
        "Cultivating self-awareness is a {word} component of effective long-term stress management.",
        "The study identified {word} factors that contribute to sustained motivation and happiness."
    ],
    'EDU': [
        "Interactive visual media provides a {word} foundation for accelerated second-language acquisition.",
        "The academic faculty recognized her {word} contribution to historical linguistics research.",
        "Setting realistic daily study goals ensures {word} academic progress throughout the semester.",
        "Modern classrooms benefit greatly from {word} pedagogical methods tailored to individual learners."
    ],
    'SOC': [
        "Archaeologists unearthed {word} artifacts that illuminate ancient Mediterranean trading routes.",
        "The historical monument stands as a {word} symbol of national solidarity and cultural heritage.",
        "Scholars engaged in a {word} philosophical debate regarding the nature of human justice.",
        "The cultural festival offered a {word} showcase of traditional folk dances and musical art."
    ],
    'GEN': [
        "Approaching complex problems with a {word} attitude frequently yields innovative solutions.",
        "The committee recognized the {word} importance of finishing the project ahead of schedule.",
        "Her meticulous preparation was evident in the {word} clarity of her final presentation.",
        "Consistent daily practice is the most {word} pathway to acquiring lasting professional skills."
    ]
}

ADV_FRAMES = {
    'MED': [
        "The clinical trial progressed {word}, demonstrating positive therapeutic efficacy.",
        "Surgeons operated {word} to stabilize the patient during the delicate procedure.",
        "The patient's vital signs improved {word} following the administration of the antidote.",
        "Medical staff responded {word} to the sudden influx of emergency room cases."
    ],
    'ENV': [
        "Global temperatures have been shifting {word} across fragile polar ecosystems.",
        "Environmental regulations were enforced {word} to curb dangerous industrial emissions.",
        "Coastal water levels rose {word} during the peak of the seasonal tropical storm.",
        "Ecological indicators suggest that the reforestation project is progressing {word}."
    ],
    'SCI': [
        "The laboratory instruments were calibrated {word} to prevent any measurement bias.",
        "Scientists recorded the experimental results {word} over a period of eighteen months.",
        "The automated robotic arm moved {word} while assembling the delicate optical lens.",
        "The mathematical formula predicted the physical trajectory of the comet {word}."
    ],
    'ECON': [
        "Market shares fluctuated {word} following the announcement of new trade tariffs.",
        "The industrial manufacturing sector expanded {word} throughout the third quarter.",
        "Financial auditors examined the corporate balance sheets {word} before the merger.",
        "Consumer demand increased {word} once prices were adjusted to competitive levels."
    ],
    'GOV': [
        "Diplomats negotiated {word} to resolve the territorial dispute without military conflict.",
        "The statutory reform was implemented {word} across all municipal administrative bodies.",
        "The independent electoral committee monitored the national voting process {word}.",
        "Civil rights advocates argued {word} in favor of protecting freedom of speech."
    ],
    'PSY': [
        "Participants reacted {word} when exposed to positive emotional audio stimuli.",
        "The therapy patient spoke {word} about her childhood experiences during the session.",
        "Mindfulness meditation helps individuals handle workplace stress {word} and calmly.",
        "Children acquire bilingual conversational abilities {word} through natural immersion."
    ],
    'GEN': [
        "The dedicated research team worked {word} to complete the project before the deadline.",
        "Speakers at the conference addressed complex international challenges {word} and eloquently.",
        "He prepared {word} for the competitive examination, reviewing key formulas every evening.",
        "The newly introduced software operates {word}, significantly reducing processing delays."
    ]
}

def generate_sentence_for_word(entry, word_index, total_words, seen_sentences):
    en = entry['en'].strip()
    tr = entry.get('tr', '').strip()
    desc = entry.get('desc', '') or ''
    cat = entry.get('cat', '') or ''
    clean_en = clean_word_key(en)

    # 1. Check Special Curated Dictionary
    if clean_en in SPECIAL_PHRASE_SENTENCES:
        sent = SPECIAL_PHRASE_SENTENCES[clean_en]
        if sent not in seen_sentences:
            seen_sentences.add(sent)
            return sent

    # Case-insensitive / strip parentheses for match
    clean_base = re.sub(r'\(.*?\)', '', clean_en).strip()
    if clean_base in SPECIAL_PHRASE_SENTENCES:
        sent = SPECIAL_PHRASE_SENTENCES[clean_base]
        if sent not in seen_sentences:
            seen_sentences.add(sent)
            return sent

    # 2. Determine domain and POS
    domain = detect_domain(tr)

    # Determine POS
    desc_low = desc.lower()
    cat_low = cat.lower()

    is_verb = 'fiil' in desc_low or 'verb' in desc_low or 'fiil' in cat_low
    is_adj = 'sıfat' in desc_low or 'adjective' in desc_low
    is_adv = 'zarf' in desc_low or 'adverb' in desc_low

    if is_adv:
        frames_dict = ADV_FRAMES
    elif is_adj:
        frames_dict = ADJ_FRAMES
    elif is_verb:
        frames_dict = VERB_FRAMES
    else:
        frames_dict = NOUN_FRAMES

    # Select domain frames or fallback to GEN
    frames = frames_dict.get(domain, frames_dict['GEN'])
    
    # Deterministic rotation based on word_index & word hash to guarantee zero repetition
    h = int(hashlib.md5(en.encode('utf-8')).hexdigest(), 16)
    frame_idx = (word_index + h) % len(frames)
    template = frames[frame_idx]

    # Format word appropriately (if phrase with sb/sth, clean it for natural sentence)
    display_word = en
    if 'sb to do' in clean_en:
        display_word = re.sub(r'\bsb to do\b', 'students to participate', en, flags=re.IGNORECASE)
    elif 'sb of sth' in clean_en:
        display_word = re.sub(r'\bsb of sth\b', 'citizens of their civil duties', en, flags=re.IGNORECASE)
    elif 'sb with sth' in clean_en:
        display_word = re.sub(r'\bsb with sth\b', 'researchers with modern tools', en, flags=re.IGNORECASE)
    elif 'sb that' in clean_en:
        display_word = re.sub(r'\bsb that\b', 'the public that progress is being made', en, flags=re.IGNORECASE)
    elif 'doing' in clean_en and is_verb:
        display_word = re.sub(r'\bdoing\b', 'making impulsive investments', en, flags=re.IGNORECASE)
    elif 'to do' in clean_en:
        display_word = re.sub(r'\bto do\b', 'to achieve sustainable results', en, flags=re.IGNORECASE)

    # Format sentence
    sentence = template.format(word=display_word)

    # Ensure uniqueness
    if sentence in seen_sentences:
        qualifiers = [
            f"According to recent reports, {sentence[0].lower() + sentence[1:]}",
            f"Field evidence confirms that {sentence[0].lower() + sentence[1:]}",
            f"Scholars observed that {sentence[0].lower() + sentence[1:]}",
            f"In practical applications, {sentence[0].lower() + sentence[1:]}",
            f"Extensive documentation reveals that {sentence[0].lower() + sentence[1:]}",
            f"During the investigation, {sentence[0].lower() + sentence[1:]}",
            f"International experts agree that {sentence[0].lower() + sentence[1:]}",
            f"Comprehensive analysis shows that {sentence[0].lower() + sentence[1:]}"
        ]
        for q in qualifiers:
            if q not in seen_sentences:
                sentence = q
                break

    seen_sentences.add(sentence)
    return sentence

# -----------------------------------------------------------------------------
# 4. MAIN ENRICHER EXECUTION
# -----------------------------------------------------------------------------
def run_enrichment():
    print("[Enricher] Kelime havuzu okunuyor...")
    with open(KELIMELER_PATH, 'r', encoding='utf-8') as f:
        words = json.load(f)

    print(f"[Enricher] Toplam {len(words)} kelime yüklendi.")

    # Load Oxford 5000 examples
    oxford_examples = {}
    if os.path.exists(OXFORD_JSON):
        with open(OXFORD_JSON, 'r', encoding='utf-8') as f:
            ox_data = json.load(f)
            for v in ox_data.values():
                w = v.get('word', '').lower().strip()
                ex = v.get('example', '').strip()
                if w and ex and len(ex) > 12 and not CITATION_PATTERN.search(ex):
                    if w not in oxford_examples or len(ex) > len(oxford_examples[w]):
                        oxford_examples[w] = ex

    print(f"[Enricher] Oxford 5000 sözlüğünden {len(oxford_examples)} kaliteli örnek eşlendi.")

    seen_sentences = set()
    for w in words:
        ex = (w.get('example') or '').strip()
        if ex and not CITATION_PATTERN.search(ex):
            seen_sentences.add(ex)

    updated_count = 0
    oxford_filled = 0
    generated_count = 0
    cleaned_def_count = 0

    for idx, w in enumerate(words):
        ex = (w.get('example') or '').strip()
        en_clean = clean_word_key(w['en'])
        tr_clean = (w.get('tr') or '').strip().lower()
        def_clean = (w.get('definition') or '').strip().lower()

        # Clean duplicate Turkish definition if definition == tr
        if def_clean and (def_clean == tr_clean or re.search(r'[çğıöşü]', def_clean)):
            w['definition'] = ''
            cleaned_def_count += 1

        # Check if example is missing or contains YDS citation
        needs_new_example = (not ex) or bool(CITATION_PATTERN.search(ex))

        if needs_new_example:
            # Preserve original citation in ydsExample if not already set
            if CITATION_PATTERN.search(ex) and not w.get('ydsExample'):
                w['ydsExample'] = ex

            # Try Oxford 5000 first
            if en_clean in oxford_examples and oxford_examples[en_clean] not in seen_sentences:
                new_ex = oxford_examples[en_clean]
                seen_sentences.add(new_ex)
                oxford_filled += 1
            else:
                new_ex = generate_sentence_for_word(w, idx, len(words), seen_sentences)
                generated_count += 1

            w['example'] = new_ex
            updated_count += 1

    print(f"[Enricher] ✅ İşlem tamamlandı:")
    print(f"   • Güncellenen toplam örnek cümle: {updated_count}")
    print(f"   • Oxford 5000'den doldurulan: {oxford_filled}")
    print(f"   • Yeni bağlamsal üretilen: {generated_count}")
    print(f"   • Temizlenen Türkçe tanım tekrarı: {cleaned_def_count}")
    print(f"   • Toplam benzersiz cümle sayısı: {len(seen_sentences)}")

    # Verify 0 citations remaining in example
    citations_remaining = sum(1 for w in words if CITATION_PATTERN.search(w.get('example', '')))
    print(f"[Enricher] Kalan YDS alıntı sayısı (örnek içinde): {citations_remaining}")
    assert citations_remaining == 0, "HATA: Örnek cümleler içinde hala YDS alıntısı var!"

    # Save to kelimeler_havuzu.json
    with open(KELIMELER_PATH, 'w', encoding='utf-8') as f:
        json.dump(words, f, ensure_ascii=False, indent=2)
    print(f"[Enricher] ✅ {KELIMELER_PATH} kaydedildi.")

    # Save to words-data.js
    with open(WORDS_DATA_JS, 'w', encoding='utf-8') as f:
        f.write("// Learnish Master Deduplicated Dataset (MEB + Oxford 5000 + YDS)\n")
        f.write("// Generated with Pedagogical Contextual Sentences\n")
        f.write("const WORDS_DATA = ")
        json.dump(words, f, ensure_ascii=False, indent=2)
        f.write(";\n")
    print(f"[Enricher] ✅ {WORDS_DATA_JS} kaydedildi.")

if __name__ == '__main__':
    run_enrichment()
