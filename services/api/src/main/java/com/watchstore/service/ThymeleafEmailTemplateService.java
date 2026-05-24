package com.watchstore.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
public class ThymeleafEmailTemplateService {

    private final SpringTemplateEngine templateEngine;
    private final String webUrl;

    public ThymeleafEmailTemplateService(
            SpringTemplateEngine templateEngine,
            @Value("${app.frontend.web-url:}") String webUrl) {
        this.templateEngine = templateEngine;
        this.webUrl = webUrl;
    }

    public RenderedEmail renderOrderConfirmation(OrderConfirmationContext context) {
        Context templateContext = new Context();
        templateContext.setVariable("customerName", context.customerName());
        templateContext.setVariable("orderId", context.orderId());
        templateContext.setVariable("paymentIntentId", context.paymentIntentId());
        templateContext.setVariable("lineItems", context.lineItems());
        templateContext.setVariable("totalAmount", formatMoney(context.totalAmount()));
        templateContext.setVariable("shippingAddress", context.shippingAddress());
        templateContext.setVariable("shopUrl", resolveShopUrl());

        String html = templateEngine.process("email/order-confirmation", templateContext);
        String subject = "Order confirmed — #" + shortId(context.orderId());
        return new RenderedEmail(subject, html);
    }

    public RenderedEmail renderWelcome(WelcomeContext context) {
        Context templateContext = new Context();
        templateContext.setVariable("accountEmail", context.accountEmail());
        templateContext.setVariable("shopUrl", resolveShopUrl());

        String html = templateEngine.process("email/welcome", templateContext);
        return new RenderedEmail("Welcome to Watch Store", html);
    }

    public RenderedEmail renderAdminEnquiryAlert(AdminEnquiryAlertContext context) {
        Context templateContext = new Context();
        templateContext.setVariable("enquiryId", context.enquiryId());
        templateContext.setVariable("customerName", context.customerName());
        templateContext.setVariable("customerEmail", context.customerEmail());
        templateContext.setVariable("customerMobile", context.customerMobile());
        templateContext.setVariable("category", context.category());
        templateContext.setVariable("subject", context.subject());
        templateContext.setVariable("productName", context.productName());
        templateContext.setVariable("message", context.message());

        String html = templateEngine.process("email/admin-enquiry-alert", templateContext);
        return new RenderedEmail("New enquiry from " + context.customerName(), html);
    }

    private String resolveShopUrl() {
        if (webUrl == null || webUrl.isBlank()) {
            return null;
        }
        return webUrl.endsWith("/") ? webUrl.substring(0, webUrl.length() - 1) : webUrl;
    }

    private static String shortId(UUID id) {
        return id.toString().substring(0, 8).toUpperCase();
    }

    private static String formatMoney(BigDecimal amount) {
        return amount == null ? "$0.00" : String.format("$%,.2f", amount);
    }

    public record RenderedEmail(String subject, String htmlBody) {
    }

    public record OrderLineItemContext(
            String productName,
            int quantity,
            String unitPrice,
            String lineTotal) {
    }

    public record OrderConfirmationContext(
            String customerName,
            UUID orderId,
            String paymentIntentId,
            List<OrderLineItemContext> lineItems,
            BigDecimal totalAmount,
            Map<String, Object> shippingAddress) {
    }

    public record WelcomeContext(String accountEmail) {
    }

    public record AdminEnquiryAlertContext(
            UUID enquiryId,
            String customerName,
            String customerEmail,
            String customerMobile,
            String category,
            String subject,
            String productName,
            String message) {
    }
}
