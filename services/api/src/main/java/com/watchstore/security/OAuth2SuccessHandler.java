package com.watchstore.security;

import com.watchstore.domain.entity.User;
import com.watchstore.domain.enums.Role;
import com.watchstore.domain.event.UserRegisteredEvent;
import com.watchstore.exception.ApiException;
import com.watchstore.repository.UserRepository;
import com.watchstore.service.AuthService;
import com.watchstore.web.dto.AuthResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final AuthCookieService authCookieService;
    private final JwtTokenProvider jwtTokenProvider;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Value("${app.frontend.web-url:}")
    private String frontendWebUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");
        String oauthId = oauth2User.getAttribute("sub");
        String firstName = oauth2User.getAttribute("given_name");
        String lastName = oauth2User.getAttribute("family_name");

        if (!StringUtils.hasText(email) || !StringUtils.hasText(oauthId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Google account must provide email and subject");
        }

        User user = userRepository.findByOauthProviderAndOauthId("google", oauthId)
                .or(() -> userRepository.findByEmail(email))
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setFirstName(firstName);
                    newUser.setLastName(lastName);
                    newUser.setOauthProvider("google");
                    newUser.setOauthId(oauthId);
                    newUser.setRole(Role.CUSTOMER);
                    User saved = userRepository.save(newUser);
                    eventPublisher.publishEvent(new UserRegisteredEvent(saved.getId()));
                    return saved;
                });

        if (user.getOauthProvider() == null) {
            user.setOauthProvider("google");
            user.setOauthId(oauthId);
            userRepository.save(user);
        }

        AuthResponse tokens = authService.issueTokensForUser(user);
        authCookieService.setRefreshTokenCookie(
                response,
                tokens.refreshToken(),
                jwtTokenProvider.getRefreshTokenExpirationMs());

        String frontendUrl = StringUtils.hasText(frontendWebUrl)
                ? frontendWebUrl.trim()
                : allowedOrigins.split(",")[0].trim();
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/auth/callback")
                .queryParam("accessToken", URLEncoder.encode(tokens.accessToken(), StandardCharsets.UTF_8))
                .build(true)
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
