package com.quiz.backend.repository;

import com.quiz.backend.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findByAttemptId(Long attemptId);
    List<Answer> findByQuestionId(Long questionId);
}
