package com.stockmate.stockmate_backend.infrastructure.web.controller;

import com.stockmate.stockmate_backend.application.dto.request.AuthLoginDTO;
import com.stockmate.stockmate_backend.application.dto.response.UserAccessDTO;
import com.stockmate.stockmate_backend.domain.model.User;
import com.stockmate.stockmate_backend.domain.resposity.UserRepository;
import com.stockmate.stockmate_backend.infrastructure.persistance.service.JwtService;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger LOGGER = LoggerFactory.getLogger(AuthController.class);
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AuthenticationManager authManager;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<UserAccessDTO> login(@RequestBody AuthLoginDTO dto) {
        Authentication auth = authManager.authenticate(new UsernamePasswordAuthenticationToken(dto.username(), dto.password()));

        try {
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            if (userDetails == null) {
                return ResponseEntity.status(404).build();
            }

            final String token = jwtService.generateToken(userDetails);
            final User user = userRepository.findByEmail(userDetails.getUsername()/* actualmente es el mail esto se deberá cambiar*/).orElseThrow();
            var body = new UserAccessDTO(user.getId(), user.getUsername(), user.getRole(), token);

            return ResponseEntity.ok(body);
        } catch (EntityNotFoundException exception) {
            throw exception;
        } catch (Exception e) {
            LOGGER.error(e.getLocalizedMessage());
            return ResponseEntity.status(500).build();
        }
    }

}
