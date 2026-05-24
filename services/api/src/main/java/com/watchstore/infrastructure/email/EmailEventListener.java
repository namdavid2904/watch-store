package com.watchstore.infrastructure.email;

import com.watchstore.config.EmailProperties;
import com.watchstore.domain.entity.Enquiry;
import com.watchstore.domain.entity.Order;
import com.watchstore.domain.entity.OrderItem;
import com.watchstore.domain.entity.User;
import com.watchstore.domain.event.EnquirySubmittedEvent;
import com.watchstore.domain.event.OrderPaidEvent;
import com.watchstore.domain.event.UserRegisteredEvent;
import com.watchstore.exception.ResourceNotFoundException;
import com.watchstore.repository.EnquiryRepository;
import com.watchstore.repository.OrderRepository;
import com.watchstore.repository.UserRepository;
import com.watchstore.service.ThymeleafEmailTemplateService;
import com.watchstore.service.ThymeleafEmailTemplateService.AdminEnquiryAlertContext;
import com.watchstore.service.ThymeleafEmailTemplateService.OrderConfirmationContext;
import com.watchstore.service.ThymeleafEmailTemplateService.OrderLineItemContext;
import com.watchstore.service.ThymeleafEmailTemplateService.RenderedEmail;
import com.watchstore.service.ThymeleafEmailTemplateService.WelcomeContext;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailEventListener {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final EnquiryRepository enquiryRepository;
    private final ThymeleafEmailTemplateService templateService;
    private final EmailGateway emailGateway;
    private final EmailProperties emailProperties;

    @Async
    @EventListener
    @Transactional(readOnly = true)
    public void onOrderPaid(OrderPaidEvent event) {
        Order order = orderRepository.findByIdWithDetails(event.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        User user = order.getUser();
        List<OrderLineItemContext> lineItems = order.getOrderItems().stream()
                .map(this::toLineItemContext)
                .toList();

        OrderConfirmationContext context = new OrderConfirmationContext(
                displayName(user),
                order.getId(),
                order.getPaymentIntentId(),
                lineItems,
                order.getTotalAmount(),
                order.getShippingAddress());

        sendRendered(templateService.renderOrderConfirmation(context), user.getEmail());
    }

    @Async
    @EventListener
    @Transactional(readOnly = true)
    public void onUserRegistered(UserRegisteredEvent event) {
        User user = userRepository.findById(event.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        sendRendered(templateService.renderWelcome(new WelcomeContext(user.getEmail())), user.getEmail());
    }

    @Async
    @EventListener
    @Transactional(readOnly = true)
    public void onEnquirySubmitted(EnquirySubmittedEvent event) {
        Enquiry enquiry = enquiryRepository.findByIdWithProduct(event.enquiryId())
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found"));

        String adminAddress = emailProperties.getAdminAlertAddress();
        if (!StringUtils.hasText(adminAddress)) {
            log.warn("Skipping admin enquiry alert — app.mail.admin-alert-address is not configured");
            return;
        }

        String productName = enquiry.getProduct() != null ? enquiry.getProduct().getName() : null;
        AdminEnquiryAlertContext context = new AdminEnquiryAlertContext(
                enquiry.getId(),
                enquiry.getName(),
                enquiry.getEmail(),
                enquiry.getMobile(),
                enquiry.getCategory(),
                enquiry.getSubject(),
                productName,
                enquiry.getMessage());

        sendRendered(templateService.renderAdminEnquiryAlert(context), adminAddress);
    }

    private void sendRendered(RenderedEmail rendered, String recipient) {
        emailGateway.send(new EmailMessage(recipient, rendered.subject(), rendered.htmlBody()));
    }

    private OrderLineItemContext toLineItemContext(OrderItem item) {
        BigDecimal lineTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return new OrderLineItemContext(
                item.getProduct().getName(),
                item.getQuantity(),
                formatMoney(item.getUnitPrice()),
                formatMoney(lineTotal));
    }

    private static String displayName(User user) {
        if (StringUtils.hasText(user.getFirstName())) {
            if (StringUtils.hasText(user.getLastName())) {
                return user.getFirstName() + " " + user.getLastName();
            }
            return user.getFirstName();
        }
        return user.getEmail();
    }

    private static String formatMoney(BigDecimal amount) {
        return amount == null ? "$0.00" : String.format("$%,.2f", amount);
    }
}
