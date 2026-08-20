package com.resumebuilder.pdf;

import com.openhtmltopdf.extend.FSSupplier;
import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder.FontStyle;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.UncheckedIOException;

@Component
public class PdfRenderer {

    // Registered fresh on every render() call via classpath resource
    // loading, NOT a baseUri-relative path. generate-from-html receives
    // HTML as a plain string with no meaningful baseUri to resolve
    // caller-supplied relative paths against, so classpath loading is the
    // only reliable option here regardless of caller.
    //
    // These fonts are registered server-side under a FIXED family name
    // ("Liberation Sans") that this app controls. This deliberately avoids
    // relying on any @font-face rule the caller's HTML might itself
    // contain: openhtmltopdf's own issue tracker (danfickle/openhtmltopdf
    // #683, #589, #341) documents that when an HTML-supplied @font-face
    // font fails to load, the library silently falls back to default serif
    // rather than reliably using a useFont()-registered alternative under
    // the same family name -- the two mechanisms do not fail over into
    // each other safely. The frontend should reference "Liberation Sans"
    // directly in its own CSS font-family declarations rather than trying
    // to define its own @font-face rule for text to render correctly.
    //
    // License: Liberation Sans is SIL Open Font License 1.1 -- confirmed
    // free to bundle, embed, and redistribute in commercial software.
    private static final String FONT_FAMILY_NAME = "Liberation Sans";

    public byte[] render(String html) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();

            registerFont(builder, "/fonts/LiberationSans-Regular.ttf", 400, FontStyle.NORMAL);
            registerFont(builder, "/fonts/LiberationSans-Bold.ttf", 700, FontStyle.NORMAL);
            registerFont(builder, "/fonts/LiberationSans-Italic.ttf", 400, FontStyle.ITALIC);
            registerFont(builder, "/fonts/LiberationSans-BoldItalic.ttf", 700, FontStyle.ITALIC);

            builder.withHtmlContent(html, "/");
            builder.toStream(outputStream);
            builder.run();
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new UncheckedIOException(
                    "Failed to render PDF from HTML",
                    new java.io.IOException(e)
            );
        }
    }

    private void registerFont(PdfRendererBuilder builder, String classpathResource,
                              int weight, FontStyle style) {
        FSSupplier<InputStream> supplier = () -> {
            InputStream is = getClass().getResourceAsStream(classpathResource);
            if (is == null) {
                throw new IllegalStateException(
                        "Font resource not found on classpath: " + classpathResource
                                + " — confirm the .ttf file exists at src/main/resources"
                                + classpathResource);
            }
            return is;
        };

        // subset=true: per the javadoc, subsetting means the font is only
        // downloaded/embedded if actually used by the rendered document --
        // the correct default for most cases, and explicitly recommended
        // by openhtmltopdf's own docs ("Fonts should generally be subset,
        // except when used in form controls").
        builder.useFont(supplier, FONT_FAMILY_NAME, weight, style, true);
    }
}