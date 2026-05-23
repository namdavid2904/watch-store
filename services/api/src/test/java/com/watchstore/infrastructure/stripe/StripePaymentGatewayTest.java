package com.watchstore.infrastructure.stripe;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.watchstore.config.StripeProperties;
import com.watchstore.exception.ApiException;
import com.watchstore.service.StripeWebhookEventService;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class StripePaymentGatewayTest {

    @Mock
    private PaymentWebhookHandler paymentWebhookHandler;

    @Mock
    private StripeWebhookEventService stripeWebhookEventService;

    private StripeProperties stripeProperties;
    private StripePaymentGateway gateway;

    @BeforeEach
    void setUp() {
        stripeProperties = new StripeProperties();
        stripeProperties.setWebhookSecret("whsec_test");
        gateway = new StripePaymentGateway(paymentWebhookHandler, stripeProperties, stripeWebhookEventService);
    }

    @Test
    void createPaymentIntentConvertsAmountToCentsAndReturnsSecrets() throws StripeException {
        UUID orderId = UUID.randomUUID();
        PaymentIntent paymentIntent = mock(PaymentIntent.class);
        when(paymentIntent.getId()).thenReturn("pi_test_123");
        when(paymentIntent.getClientSecret()).thenReturn("cs_test_secret");

        try (MockedStatic<PaymentIntent> paymentIntentStatic = mockStatic(PaymentIntent.class)) {
            paymentIntentStatic.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class)))
                    .thenReturn(paymentIntent);

            PaymentIntentResult result = gateway.createPaymentIntent(
                    orderId,
                    new BigDecimal("99.99"),
                    "USD",
                    Map.of("checkoutId", "checkout-1"));

            assertEquals("pi_test_123", result.paymentIntentId());
            assertEquals("cs_test_secret", result.clientSecret());

            ArgumentCaptor<PaymentIntentCreateParams> captor = ArgumentCaptor.forClass(PaymentIntentCreateParams.class);
            paymentIntentStatic.verify(() -> PaymentIntent.create(captor.capture()));
            assertEquals(9999L, captor.getValue().getAmount());
            assertEquals("usd", captor.getValue().getCurrency());
        }
    }

    @Test
    void createPaymentIntentRejectsNonPositiveAmount() {
        UUID orderId = UUID.randomUUID();

        ApiException exception = assertThrows(ApiException.class, () ->
                gateway.createPaymentIntent(orderId, BigDecimal.ZERO, "usd", Map.of()));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void createPaymentIntentMapsStripeExceptionToBadGateway() {
        UUID orderId = UUID.randomUUID();

        try (MockedStatic<PaymentIntent> paymentIntentStatic = mockStatic(PaymentIntent.class)) {
            paymentIntentStatic.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class)))
                    .thenThrow(new StripeException("Stripe error", "stripe_error", "req_123", 502, null) { });

            ApiException exception = assertThrows(ApiException.class, () ->
                    gateway.createPaymentIntent(orderId, new BigDecimal("10.00"), "usd", Map.of()));

            assertEquals(HttpStatus.BAD_GATEWAY, exception.getStatus());
        }
    }

    @Test
    void createPaymentIntentRequiresClientSecret() throws StripeException {
        UUID orderId = UUID.randomUUID();
        PaymentIntent paymentIntent = mock(PaymentIntent.class);
        when(paymentIntent.getClientSecret()).thenReturn("");

        try (MockedStatic<PaymentIntent> paymentIntentStatic = mockStatic(PaymentIntent.class)) {
            paymentIntentStatic.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class)))
                    .thenReturn(paymentIntent);

            ApiException exception = assertThrows(ApiException.class, () ->
                    gateway.createPaymentIntent(orderId, new BigDecimal("10.00"), "usd", Map.of()));

            assertEquals(HttpStatus.BAD_GATEWAY, exception.getStatus());
        }
    }

    @Test
    void processWebhookRejectsMissingSignature() {
        ApiException exception = assertThrows(ApiException.class, () -> gateway.processWebhook("{}", null));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void processWebhookRejectsInvalidSignature() {
        try (MockedStatic<Webhook> webhookStatic = mockStatic(Webhook.class)) {
            webhookStatic.when(() -> Webhook.constructEvent(anyString(), anyString(), anyString()))
                    .thenThrow(new SignatureVerificationException("Invalid signature", "sig"));

            ApiException exception = assertThrows(ApiException.class, () ->
                    gateway.processWebhook("{}", "sig"));

            assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        }
    }
}
