package com.Scolab.ScolabBackend.Repository;

import com.Scolab.ScolabBackend.Entity.TokenType;
import com.Scolab.ScolabBackend.Entity.Utilisateur;
import com.Scolab.ScolabBackend.Entity.VerificationToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends MongoRepository<VerificationToken, String> {

    VerificationToken findByToken(String token);
    List<VerificationToken> findByUser(Utilisateur user);
    void deleteByUser(Utilisateur user);
    void deleteByExpiryDateBefore(LocalDateTime date);

    Optional<VerificationToken> findByTokenAndTokenType(String token, TokenType tokenType);

    List<VerificationToken> findByUserAndTokenType(Utilisateur user, TokenType tokenType);

    void deleteByUserAndTokenType(Utilisateur user, TokenType tokenType);

    void deleteByTokenAndTokenType(String token, TokenType tokenType);

    @Query("{ 'user.email': ?0, 'tokenType': ?1 }")
    Optional<VerificationToken> findByUserEmailAndTokenType(String email, TokenType tokenType);

    @Query("{ 'user.email': ?0, 'tokenType': ?1 }")
    List<VerificationToken> findAllByUserEmailAndTokenType(String email, TokenType tokenType);

    @Query("{ 'user.email': ?0, 'tokenType': ?1 }")
    void deleteByUserEmailAndTokenType(String email, TokenType tokenType);

    List<VerificationToken> findByTokenType(TokenType tokenType);

    @Query("{ 'token': ?0, 'tokenType': ?1, 'expiryDate': { $gt: ?2 } }")
    Optional<VerificationToken> findValidTokenByTokenAndTokenType(String token, TokenType tokenType, LocalDateTime now);
}