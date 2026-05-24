package com.watchstore.service;

import static org.junit.jupiter.api.Assertions.assertTrue;

import com.watchstore.service.ThymeleafEmailTemplateService.AdminEnquiryAlertContext;
import com.watchstore.service.ThymeleafEmailTemplateService.OrderConfirmationContext;
import com.watchstore.service.ThymeleafEmailTemplateService.OrderLineItemContext;
import com.watchstore.service.ThymeleafEmailTemplateService.RenderedEmail;
import com.watchstore.service.ThymeleafEmailTemplateService.WelcomeContext;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

class ThymeleafEmailTemplateServiceTest {

    private ThymeleafEmailTemplateService templateService;

    @BeforeEach
    void setUp() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");

        SpringTemplateEngine engine = new SpringTemplateEngine();
        engine.setTemplateResolver(resolver);
        templateService = new ThymeleafEmailTemplateService(engine, "https://shop.example.com");
    }

    @Test
    void renderOrderConfirmationIncludesOrderDetails() {
        UUID orderId = UUID.randomUUID();
        OrderConfirmationContext context = new OrderConfirmationContext(
                "Jane Doe",
                orderId,
                "pi_test_123",
                List.of(new OrderLineItemContext("Submariner", 1, "$8,500.00", "$8,500.00")),
                new BigDecimal("8500.00"),
                Map.of("line1", "1 Main St", "city", "New York", "postalCode", "10001", "country", "US"));

        RenderedEmail rendered = templateService.renderOrderConfirmation(context);

        assertTrue(rendered.subject().contains("Order confirmed"));
        assertTrue(rendered.htmlBody().contains("Jane Doe"));
        assertTrue(rendered.htmlBody().contains("Submariner"));
        assertTrue(rendered.htmlBody().contains("pi_test_123"));
        assertTrue(rendered.htmlBody().contains("1 Main St"));
    }

    @Test
    void renderWelcomeIncludesAccountEmail() {
        RenderedEmail rendered = templateService.renderWelcome(new WelcomeContext("guest@example.com"));

        assertTrue(rendered.subject().contains("Welcome"));
        assertTrue(rendered.htmlBody().contains("guest@example.com"));
        assertTrue(rendered.htmlBody().contains("https://shop.example.com"));
    }

    @Test
    void renderAdminEnquiryAlertIncludesCustomerMessage() {
        UUID enquiryId = UUID.randomUUID();
        AdminEnquiryAlertContext context = new AdminEnquiryAlertContext(
                enquiryId,
                "Alex Customer",
                "alex@example.com",
                "+1 555 0100",
                "Sizing",
                "Case diameter",
                "Explorer",
                "Is this suitable for a 17cm wrist?");

        RenderedEmail rendered = templateService.renderAdminEnquiryAlert(context);

        assertTrue(rendered.subject().contains("Alex Customer"));
        assertTrue(rendered.htmlBody().contains("alex@example.com"));
        assertTrue(rendered.htmlBody().contains("Is this suitable for a 17cm wrist?"));
        assertTrue(rendered.htmlBody().contains("Explorer"));
    }
}
