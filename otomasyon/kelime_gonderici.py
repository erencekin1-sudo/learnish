#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
5. Sınıf İngilizce - Maarif Modeli Günlük Kelime Gönderim Otomasyonu
Erenlearn (Gönderici) -> Erencekin1 (Alıcı)
"""

import sys
import os
import json
import smtplib
import argparse
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

try:
    import openpyxl
except ImportError:
    print("HATA: 'openpyxl' kütüphanesi bulunamadı. Lütfen 'pip install openpyxl' komutunu çalıştırın.")
    sys.exit(1)

# Dosya yolları
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(BASE_DIR, ".env")
PROGRESS_FILE = os.path.join(BASE_DIR, "ilerleme.json")
LOG_FILE = os.path.join(BASE_DIR, "otomasyon.log")


def log(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"[{timestamp}] {message}"
    print(entry)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(entry + "\n")
    except Exception as e:
        print(f"Log yazma hatası: {e}")


def load_env(env_path):
    config = {}
    if not os.path.exists(env_path):
        log(f"HATA: .env dosyası bulunamadı: {env_path}")
        return config
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k, v = line.split("=", 1)
                config[k.strip()] = v.strip()
    return config


def load_progress():
    default_progress = {
        "current_unit": 1,
        "last_index": 0,
        "total_words": 506,
        "words_per_day": 10,
        "last_sent_date": None,
        "cycle": 1,
        "history": []
    }
    if not os.path.exists(PROGRESS_FILE):
        return default_progress
    try:
        with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            # Eksik alanlar varsa varsayılanla tamamla
            for k, v in default_progress.items():
                if k not in data:
                    data[k] = v
            return data
    except Exception as e:
        log(f"İlerleme dosyası okuma hatası: {e}. Varsayılan değerler kullanılıyor.")
        return default_progress


def save_progress(progress):
    try:
        with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
            json.dump(progress, f, ensure_ascii=False, indent=2)
    except Exception as e:
        log(f"İlerleme dosyası kaydetme hatası: {e}")


def load_words_from_excel(excel_path):
    # Öncelikli olarak 506 kelimelik JSON havuzunu kontrol et
    json_path = os.path.join(BASE_DIR, "kelimeler_havuzu.json")
    if os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as jf:
                jwords = json.load(jf)
                words = []
                for item in jwords:
                    words.append({
                        "no": item["no"],
                        "category": item["cat"],
                        "english": item["en"],
                        "turkish": item["tr"],
                        "desc": item.get("desc", ""),
                        "cefr": item.get("cefr", "A1")
                    })
                return words
        except Exception as e:
            log(f"JSON havuz okuma hatası: {e}")

    if not os.path.exists(excel_path):
        log(f"HATA: Excel dosyası bulunamadı: {excel_path}")
        return []
    
    wb = openpyxl.load_workbook(excel_path, data_only=True)
    sheet = wb.worksheets[0]
    
    words = []
    # Satır 5'ten itibaren (1-based row 5, 0-based row 4)
    for r in sheet.iter_rows(min_row=5, values_only=True):
        if not r or r[0] is None:
            continue
        try:
            seq_no = int(r[0])
        except (ValueError, TypeError):
            continue
        
        category = str(r[1] or "").strip()
        english = str(r[2] or "").strip()
        turkish = str(r[3] or "").strip()
        desc = str(r[4] or "").strip()
        
        if english and turkish:
            words.append({
                "no": seq_no,
                "category": category,
                "english": english,
                "turkish": turkish,
                "desc": desc
            })
    return words



def get_cefr_style(level):
    styles = {
        "A1": {"bg": "#DCFCE7", "text": "#166534", "border": "#BBF7D0", "borderLeft": "#16a34a"},
        "A2": {"bg": "#CCFBF1", "text": "#115E59", "border": "#99F6E4", "borderLeft": "#0d9488"},
        "B1": {"bg": "#DBEAFE", "text": "#1E40AF", "border": "#BFDBFE", "borderLeft": "#2563eb"},
        "B2": {"bg": "#EDE9FE", "text": "#5B21B6", "border": "#DDD6FE", "borderLeft": "#7c3aed"},
        "C1": {"bg": "#FEF3C7", "text": "#92400E", "border": "#FDE68A", "borderLeft": "#d97706"},
        "C2": {"bg": "#FFE4E6", "text": "#9F1239", "border": "#FECDD3", "borderLeft": "#e11d48"},
    }
    return styles.get(level, {"bg": "#F1F5F9", "text": "#475569", "border": "#CBD5E1", "borderLeft": "#4f46e5"})

def build_email_html(words, day_no, total_days, progress_percent, cycle=1):
    now_str = datetime.now().strftime("%d.%m.%Y")
    days_tr = {
        0: "Pazartesi", 1: "Salı", 2: "Çarşamba", 3: "Perşembe",
        4: "Cuma", 5: "Cumartesi", 6: "Pazar"
    }
    weekday_str = days_tr.get(datetime.now().weekday(), "")

    word_cards_html = ""
    for w in words:
        cefr = w.get("cefr", "A1")
        c_style = get_cefr_style(cefr)
        card = f'''
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; border-left: 4px solid {c_style['borderLeft']}; box-shadow: 0 2px 4px rgba(0,0,0,0.02); margin-bottom: 10px;">
          <tr>
            <td style="padding: 14px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size: 11px; font-weight: 700; color: {c_style['borderLeft']}; letter-spacing: 0.3px;">
                    #{w['no']} &nbsp;&bull;&nbsp; 
                    <span style="background-color: {c_style['bg']}; color: {c_style['text']}; border: 1px solid {c_style['border']}; padding: 2px 7px; border-radius: 8px; font-weight: 800; font-size: 10px;">{cefr}</span>
                    &nbsp;&bull;&nbsp;
                    <span style="background-color: #F1F5F9; color: #475569; padding: 2px 7px; border-radius: 5px; font-size: 10px;">{w['category']}</span>
                  </td>
                  <td align="right" style="font-size: 11px; color: #64748B; font-weight: 600;">
                    {w['desc']}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 8px;">
                    <span style="display: inline-block; background-color: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 3px; margin-right: 6px; vertical-align: middle;">EN</span>
                    <span style="font-size: 18px; font-weight: 800; color: #0F172A; vertical-align: middle;">{w['english']}</span>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 6px;">
                    <span style="display: inline-block; background-color: #F0FDF4; color: #15803D; border: 1px solid #BBF7D0; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 3px; margin-right: 6px; vertical-align: middle;">TR</span>
                    <span style="font-size: 14px; font-weight: 600; color: #0D9488; vertical-align: middle;">{w['turkish']}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        '''
        word_cards_html += card

    html = f'''<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>5. Sınıf İngilizce Günlük Kelimeler</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif; color: #334155;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 25px 12px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
          
          <!-- Banner Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%); padding: 26px 22px; text-align: center; color: #FFFFFF;">
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #a5b4fc; margin-bottom: 6px;">
                &#128218; TÜRKİYE YÜZYILI MAARİF MODELİ
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; line-height: 1.3;">
                5. Sınıf İngilizce Kelime Günlüğü
              </h1>
              <div style="margin-top: 5px; font-size: 13px; color: #e0e7ff;">
                506 Kelimelik Maarif &amp; CEFR Seviyeli Kelime Bankası
              </div>
              <div style="margin-top: 14px; display: inline-block; background: rgba(255,255,255,0.14); padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #f8fafc;">
                &#128197; {now_str}, {weekday_str} &nbsp;&bull;&nbsp; &#9729;&#65039; Günlük Kelime Gönderimi
              </div>
            </td>
          </tr>

          <!-- Progress Bar -->
          <tr>
            <td style="padding: 18px 22px 10px 22px; background-color: #F1F5F9;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size: 12px; font-weight: 700; color: #1E293B;">
                    &#128202; Havuz İlerlemesi: <span style="color: #4F46E5;">Gün {day_no} / {total_days}</span>
                    {f" (Döngü {cycle})" if cycle > 1 else ""}
                  </td>
                  <td align="right" style="font-size: 12px; font-weight: 700; color: #4F46E5;">
                    %{progress_percent} Tamamlandı
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 7px;">
                    <div style="width: 100%; height: 7px; background-color: #CBD5E1; border-radius: 4px; overflow: hidden;">
                      <div style="width: {progress_percent}%; height: 100%; background-color: #4F46E5; border-radius: 4px;"></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 7px; font-size: 11px; color: #64748B;">
                    Bugün çalışılacak: <strong>{len(words)} Kelime</strong> (Sıra: {words[0]['no']} &ndash; {words[-1]['no']} / {words[-1]['no'] if total_days == 1 else '506'})
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cards List -->
          <tr>
            <td style="padding: 14px 18px 18px 18px;">
              {word_cards_html}
            </td>
          </tr>

          <!-- Advice Box -->
          <tr>
            <td style="padding: 0 18px 20px 18px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FEF3C7; border: 1px dashed #F59E0B; border-radius: 9px; padding: 12px 15px;">
                <tr>
                  <td style="font-size: 12px; color: #92400E; line-height: 1.5;">
                    &#128161; <strong>Öğrenme Tavsiyesi:</strong> Bu kelimeleri gün içinde en az 2 kez sesli olarak tekrar edin, CEFR düzeyine dikkat edin ve her biriyle kısa birer örnek cümle kurmayı deneyin.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 16px; text-align: center; font-size: 11px; color: #94A3B8;">
              <p style="margin: 0 0 4px 0;">Bu e-posta, <strong>5. Sınıf Maarif Modeli Kelime Otomasyonu</strong> tarafından otomatik iletilmektedir.</p>
              <p style="margin: 0; font-size: 10px;">İdeal Öğretmenin Maarif Seti &bull; 5. Sınıf İngilizce (506 Kelime)</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>'''
    return html


def build_plain_text(words, day_no, total_days):
    lines = [
        "5. SINIF İNGİLİZCE KELİME GÜNLÜĞÜ (506 KELİMELİK HAVUZ)",
        "5. Sınıf İngilizce Kelime & Kavram Bankası",
        f"Gün {day_no} / {total_days}",
        "=" * 40,
        ""
    ]
    for w in words:
        cefr = f" [{w.get('cefr', 'A1')}]"
        lines.append(f"#{w['no']}{cefr} [{w['category']}] - {w['desc']}")
        lines.append(f"[EN] {w['english']}")
        lines.append(f"[TR] {w['turkish']}")
        lines.append("-" * 30)
    lines.append("\nHer sabah saat 06:30'da otomatik gönderilir.")
    return "\n".join(lines)


def send_email(config, subject, html_content, plain_content):
    from email.header import Header
    from email.utils import formataddr

    sender = config.get("SENDER_EMAIL")
    password = config.get("SENDER_PASSWORD")
    receiver = config.get("RECEIVER_EMAIL")
    host = config.get("SMTP_HOST", "smtp.gmail.com")
    port_ssl = int(config.get("SMTP_PORT", "465"))
    port_fallback = int(config.get("SMTP_PORT_FALLBACK", "587"))

    if not sender or not password or not receiver:
        log("HATA: Gönderici, alıcı veya şifre eksik (.env kontrol ediniz).")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = Header(subject, "utf-8")
    msg["From"] = formataddr(("Kelime Botu (Maarif Modeli)", sender))
    msg["To"] = receiver

    part1 = MIMEText(plain_content, "plain", "utf-8")
    part2 = MIMEText(html_content, "html", "utf-8")
    msg.attach(part1)
    msg.attach(part2)

    # 1. SSL (Port 465) Denemesi
    try:
        log(f"E-posta gönderiliyor: {sender} -> {receiver} (SSL:{port_ssl})...")
        server = smtplib.SMTP_SSL(host, port_ssl, timeout=15)
        server.login(sender, password)
        server.sendmail(sender, [receiver], msg.as_string())
        server.quit()
        log("BAŞARILI: E-posta SSL (465) üzerinden iletildi!")
        return True
    except Exception as e_ssl:
        log(f"UYARI: SSL (465) başarısız oldu ({e_ssl}). STARTTLS ({port_fallback}) deneniyor...")

    # 2. STARTTLS (Port 587) Yedek Denemesi
    try:
        server = smtplib.SMTP(host, port_fallback, timeout=15)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(sender, password)
        server.sendmail(sender, [receiver], msg.as_string())
        server.quit()
        log("BAŞARILI: E-posta STARTTLS (587) üzerinden iletildi!")
        return True
    except Exception as e_tls:
        log(f"HATA: Her iki port da başarısız oldu. Hata: {e_tls}")
        return False


def run_process(is_preview=False, force_today=False):
    config = load_env(ENV_FILE)
    progress = load_progress()
    
    excel_path = config.get("EXCEL_PATH")
    words_per_day = int(config.get("WORDS_PER_DAY", "10"))
    
    words = load_words_from_excel(excel_path)
    if not words:
        log("HATA: Excel'den hiç kelime okunamadı!")
        return False
    
    total_words = len(words)
    progress["total_words"] = total_words
    total_days = (total_words + words_per_day - 1) // words_per_day
    
    today_str = datetime.now().strftime("%Y-%m-%d")
    if not is_preview and not force_today:
        if progress.get("last_sent_date") == today_str:
            log(f"BİLGİ: Bugün ({today_str}) için zaten gönderim yapıldı. Tekrar göndermek için --now veya --preview kullanabilirsiniz.")
            return True

    last_index = progress.get("last_index", 0)
    cycle = progress.get("cycle", 1)

    # Ünite sonuna gelindiyse başa sar
    if last_index >= total_words:
        log("BİLGİ: 1. Ünitenin tüm kelimeleri tamamlandı. Döngü 1 başa alınıyor...")
        last_index = 0
        cycle += 1
        progress["cycle"] = cycle

    end_index = min(last_index + words_per_day, total_words)
    selected_words = words[last_index:end_index]
    
    day_no = (last_index // words_per_day) + 1
    progress_percent = min(100, round((end_index / total_words) * 100))

    subject = f"🇬🇧 Günün İngilizce Kelimeleri | Ünite 1: School Life (Gün {day_no}/{total_days})"
    if is_preview:
        subject = f"[ÖNİZLEME/TEST] {subject}"

    html_content = build_email_html(selected_words, day_no, total_days, progress_percent, cycle)
    plain_content = build_email_plain(selected_words, day_no, total_days)

    success = send_email(config, subject, html_content, plain_content)

    if success and not is_preview:
        progress["last_index"] = end_index
        progress["last_sent_date"] = today_str
        history_entry = {
            "date": today_str,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "day_no": day_no,
            "range": f"{selected_words[0]['no']}-{selected_words[-1]['no']}",
            "words_count": len(selected_words)
        }
        progress["history"].append(history_entry)
        save_progress(progress)
        log(f"İlerleme kaydedildi: Sonraki indeks: {end_index} / {total_words} (Gün {day_no} tamamlandı)")

    return success


def print_status():
    config = load_env(ENV_FILE)
    progress = load_progress()
    excel_path = config.get("EXCEL_PATH")
    words = load_words_from_excel(excel_path)
    total_words = len(words)
    words_per_day = int(config.get("WORDS_PER_DAY", "10"))
    total_days = (total_words + words_per_day - 1) // words_per_day if total_words else 0
    last_index = progress.get("last_index", 0)
    day_no = (last_index // words_per_day) + 1
    progress_percent = min(100, round((last_index / total_words) * 100)) if total_words else 0

    print("=" * 50)
    print(" 5. SINIF İNGİLİZCE KELİME OTOMASYONU DURUMU")
    print("=" * 50)
    print(f"Gönderici       : {config.get('SENDER_EMAIL')}")
    print(f"Alıcı           : {config.get('RECEIVER_EMAIL')}")
    print(f"Planlanan Saat  : {config.get('SCHEDULE_TIME')}")
    print(f"Mevcut Ünite    : {config.get('CURRENT_UNIT')} (School Life)")
    print(f"Toplam Kelime   : {total_words}")
    print(f"Gönderilen      : {last_index} / {total_words} (%{progress_percent})")
    print(f"Sıradaki Gün    : Gün {day_no} / {total_days}")
    print(f"Son Gönderim    : {progress.get('last_sent_date', 'Henüz yapılmadı')}")
    print(f"Döngü Sayısı    : {progress.get('cycle', 1)}")
    
    if last_index < total_words:
        next_words = words[last_index : min(last_index + words_per_day, total_words)]
        print("\nSıradaki Kelimeler:")
        for w in next_words:
            print(f"  #{w['no']} {w['english']} -> {w['turkish']} ({w['desc']})")
    print("=" * 50)


def main():
    parser = argparse.ArgumentParser(description="Günlük İngilizce Kelime Gönderici")
    parser.add_argument("--now", action="store_true", help="Bugünün kelimelerini hemen gönder ve ilerlemeyi kaydet.")
    parser.add_argument("--preview", action="store_true", help="Test önizleme e-postası gönder (ilerlemeyi kaydetmez).")
    parser.add_argument("--status", action="store_true", help="Mevcut durum ve sıradaki kelimeleri listele.")
    parser.add_argument("--reset", action="store_true", help="İlerlemeyi sıfırla (1. kelimeden başlatır).")
    args = parser.parse_args()

    if args.status:
        print_status()
    elif args.reset:
        p = load_progress()
        p["last_index"] = 0
        p["last_sent_date"] = None
        save_progress(p)
        print("İlerleme başarıyla sıfırlandı. 1. kelimeden başlanacak.")
    elif args.preview:
        run_process(is_preview=True)
    elif args.now:
        run_process(is_preview=False, force_today=True)
    else:
        # Zamanlayıcı (launchd) tarafından çağrılan standart günlük mod
        run_process(is_preview=False, force_today=False)


if __name__ == "__main__":
    main()
