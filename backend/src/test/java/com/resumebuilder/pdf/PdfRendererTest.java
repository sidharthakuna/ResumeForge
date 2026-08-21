package com.resumebuilder.pdf;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class PdfRendererTest {

    @Autowired
    private PdfRenderer pdfRenderer;

    @Test
    void testBasicHtmlRendering() {
        String html = """
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"/></head>
            <body>
                <h1>Hello World</h1>
                <p>Testing PDF generation</p>
            </body>
            </html>
            """;
        byte[] pdf = pdfRenderer.render(html);
        assertThat(pdf).isNotEmpty();
        assertThat(pdf.length).isGreaterThan(100);
    }

    @Test
    void testHtmlWithEmojisAndSpecialChars() {
        String html = """
            <!DOCTYPE html>
            <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: 'Liberation Sans', sans-serif; }
            </style>
            </head>
            <body>
              <h1>Alex Rivera</h1>
              <div>
                <span>San Francisco, CA</span>
                <span>alex.rivera@example.com</span>
                <span>+1 555 234 5678</span>
              </div>
            </body>
            </html>
            """;
        byte[] pdf = pdfRenderer.render(html);
        assertThat(pdf).isNotEmpty();
    }

    @Test
    void testHtmlFromOuterHtmlWithInjectedStyles() {
        String html = """
            <!DOCTYPE html>
            <html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8">
            <style>
              @page { size: A4; margin: 0; }
              * { box-sizing: border-box; }
              body { margin: 0; font-family: 'Inter', -apple-system, sans-serif; color: #1c2c4f; }
              .page { width: 210mm; min-height: 297mm; padding: 18mm 20mm; margin: 0 auto; background: #fff; }
              a { color: inherit; }
              @media print {
                body { background: #fff; }
                .page { box-shadow: none; margin: 0; }
              }
              .page {
                font-family: 'Liberation Sans', 'Inter', -apple-system, sans-serif;
                color: #111;
                line-height: 1.4;
                padding: 24px 32px;
              }
              .header { text-align: center; margin-bottom: 12px; }
            </style>
            <style>
              * {
                transition: background-color 0.12s ease, outline 0.12s ease;
              }
              *:focus {
                outline: 1.5px dashed #4f46e5 !important;
                outline-offset: 2px !important;
                background-color: rgba(79, 70, 229, 0.04) !important;
              }
              body {
                cursor: text !important;
              }
            </style></head>
            <body><div class="page">
              <div class="header">
                <h1>ALEX RIVERA</h1>
                <div class="tagline">Senior Software Engineer</div>
                <div class="contact-line">
                  <span>San Francisco, CA</span>
                  <span>alex.rivera@example.com</span>
                  <span>+1 555 234 5678</span>
                </div>
              </div>
            </div></body></html>

            """;
        byte[] pdf = pdfRenderer.render(html);
        assertThat(pdf).isNotEmpty();
    }
}
