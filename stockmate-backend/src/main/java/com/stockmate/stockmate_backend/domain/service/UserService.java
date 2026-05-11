package com.stockmate.stockmate_backend.domain.service;

import com.stockmate.stockmate_backend.application.dto.response.UserInfoDTO;
import com.stockmate.stockmate_backend.domain.model.Role;
import com.stockmate.stockmate_backend.domain.model.UserStatus;
import com.stockmate.stockmate_backend.domain.resposity.UserRepository;
import com.stockmate.stockmate_backend.infrastructure.persistance.mapper.UserInfoMapper;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.NotNull;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository repository;
    @Autowired
    private UserInfoMapper userInfoMapper;

    public List<UserInfoDTO> getUsers() {
        return repository.findAll().stream().map(userInfoMapper::userToUserInfoDTO).toList();
    }

    public UserInfoDTO updateRole(@NotNull UUID id, Role role) {
        var user = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Unable to update role for user with id: " + id.toString()));
        user.setRole(role);
        return userInfoMapper.userToUserInfoDTO(repository.save(user));
    }

    public UserInfoDTO updateStatus(@NotNull UUID id, UserStatus status) {
        var user = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Unable to update status for user with id: " + id.toString()));
        user.setStatus(status);
        return userInfoMapper.userToUserInfoDTO(repository.save(user));
    }

    @Override
    public UserDetails loadUserByUsername(@NonNull String username) throws UsernameNotFoundException {
        return repository.findByEmail(username).orElseThrow(() -> new EntityNotFoundException("Unable to load user with email: " + username));
    }
}
