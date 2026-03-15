package com.quiz.backend.repository;

import com.quiz.backend.model.Attempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface AttemptRepository extends JpaRepository<Attempt, Long> {
    Optional<Attempt> findBySessionIdAndUserId(Long sessionId, Long userId);
    List<Attempt> findBySessionId(Long sessionId);
    List<Attempt> findBySessionIdOrderByTotalScoreDesc(Long sessionId);
}
