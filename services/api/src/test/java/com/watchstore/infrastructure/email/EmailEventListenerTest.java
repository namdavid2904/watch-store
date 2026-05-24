package com.watchstore.infrastructure.email;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.watchstore.config.EmailProperties;
import com.watchstore.domain.entity.User;
import com.watchstore.domain.event.UserRegisteredEvent;
import com.watchstore.repository.EnquiryRepository;
import com.watchstore.repository.OrderRepository;
import com.watchstore.repository.UserRepository;
import com.watchstore.service.ThymeleafEmailTemplateService;
import com.watchstore.service.ThymeleafEmailTemplateService.RenderedEmail;
import com.watchstore.service.ThymeleafEmailTemplateService.WelcomeContext;
import io.micrometer.core.instrument.Counter;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EmailEventListenerTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EnquiryRepository enquiryRepository;

    @Mock
    private ThymeleafEmailTemplateService templateService;

    @Mock
    private EmailGateway emailGateway;

    @Mock
    private EmailProperties emailProperties;

    @Mock
    private Counter emailsSentTotal;

    @Mock
    private Counter emailsFailedTotal;

    private EmailEventListener listener;

    @BeforeEach
    void setUp() {
        listener = new EmailEventListener(
                orderRepository,
                userRepository,
                enquiryRepository,
                templateService,
                emailGateway,
                emailProperties,
                emailsSentTotal,
                emailsFailedTotal);
    }

    @Test
    void onUserRegisteredSendsWelcomeEmail() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);
        user.setEmail("guest@example.com");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(templateService.renderWelcome(any(WelcomeContext.class)))
                .thenReturn(new RenderedEmail("Welcome to Watch Store", "<html>welcome</html>"));

        listener.onUserRegistered(new UserRegisteredEvent(userId));

        verify(emailGateway).send(argThat(message ->
                "guest@example.com".equals(message.to())
                        && message.subject().contains("Welcome")));
        verify(emailsSentTotal).increment();
    }
}
