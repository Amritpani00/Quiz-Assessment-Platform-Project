package com.quiz.backend.repository;

import com.quiz.backend.model.QuizSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface QuizSessionRepository extends JpaRepository<QuizSession, Long> {
    Optional<QuizSession> findByJoinCode(String joinCode);
    List<QuizSession> findByQuizId(Long quizId);
}
