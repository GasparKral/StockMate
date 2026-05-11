package com.stockmate.stockmate_backend.infrastructure.persistance.service;

import com.stockmate.stockmate_backend.domain.resposity.UserRepository;
import com.stockmate.stockmate_backend.infrastructure.persistance.entity.RefreshToken;
import com.stockmate.stockmate_backend.infrastructure.persistance.repository.JwtRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String KEY;

    @Value("${app.jwt.access-expiration}")
    private Long ACCESS_EXPIRATION;

    @Value("${app.jwt.refresh-expiration}")
    private Long REFRESH_EXPIRATION;

    @Autowired
    private JwtRepository repository;

    @Autowired
    private UserRepository userRepository;

    public SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(UserDetails userDetails) {

        Long expirationTime;
        var user = userRepository.findByEmail(userDetails.getUsername()).get();
        var jwt = repository.getLastToken(user.getId());

        if (jwt.isEmpty()) {
            expirationTime = ACCESS_EXPIRATION;
        } else {
            expirationTime = REFRESH_EXPIRATION;
        }
        var token = new RefreshToken();
        token.setUser(user);
        var expirationDate = new Date(System.currentTimeMillis() + expirationTime);
        String tokenValue = Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(expirationDate)
                .signWith(getSigningKey())
                .compact();

        token.setToken(tokenValue);
        token.setExpiresAt(expirationDate.toInstant());
        repository.save(token);

        return tokenValue;
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload().getSubject();
    }


    private boolean isTokenExpired(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload().getExpiration().before(new Date());
    }

}
