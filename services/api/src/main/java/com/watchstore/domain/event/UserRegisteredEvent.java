package com.watchstore.domain.event;

import java.util.UUID;

public record UserRegisteredEvent(UUID userId) {
}
