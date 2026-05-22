package com.watchstore.service;

import com.watchstore.domain.entity.User;
import com.watchstore.domain.enums.Role;
import com.watchstore.exception.ApiException;
import com.watchstore.exception.ResourceNotFoundException;
import com.watchstore.repository.UserRepository;
import com.watchstore.web.dto.AdminUserResponse;
import com.watchstore.web.dto.UpdateUserRoleRequest;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AdminUserResponse> listUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminUserResponse updateRole(UUID userId, UpdateUserRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.ADMIN && request.role() != Role.ADMIN) {
            long adminCount = userRepository.findAll().stream()
                    .filter(existing -> existing.getRole() == Role.ADMIN)
                    .count();
            if (adminCount <= 1) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot remove the last admin user");
            }
        }

        user.setRole(request.role());
        return toResponse(user);
    }

    private AdminUserResponse toResponse(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
