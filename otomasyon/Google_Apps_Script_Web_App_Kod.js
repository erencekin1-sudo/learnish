/**
 * ============================================================================
 * LEARNISH - GOOGLE APPS SCRIPT WEB APP (7/24 BULUT YAYINI)
 * ============================================================================
 * Bu kod sayesinde bilgisayarınız kapalıyken bile iPhone'unuzdan hücresel veriyle
 * uygulamayı açabilir ve ana ekranınıza bir mobil uygulama gibi ekleyebilirsiniz.
 * ============================================================================
 */

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('5. Sınıf Maarif İngilizce • Learnish')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
}
