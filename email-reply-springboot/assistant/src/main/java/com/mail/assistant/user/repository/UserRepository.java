package com.mail.assistant.user.repository;

import com.mail.assistant.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}