package com.stockmate.stockmate_backend.infrastructure.persistance.repository;

import com.stockmate.stockmate_backend.infrastructure.persistance.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface JwtRepository extends JpaRepository<RefreshToken, Long> {

    @Query("SELECT t FROM RefreshToken t WHERE t.user.id = :userId AND t.revoked = false ORDER BY t.createdAt DESC LIMIT 1")
    Optional<RefreshToken> getLastToken(@Param("userId") UUID userId);

}
