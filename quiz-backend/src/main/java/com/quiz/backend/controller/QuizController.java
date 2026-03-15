package com.quiz.backend.controller;

import com.quiz.backend.dto.QuestionCreateRequest;
import com.quiz.backend.dto.QuizCreateRequest;
import com.quiz.backend.model.Question;
import com.quiz.backend.model.Quiz;
import com.quiz.backend.model.User;
import com.quiz.backend.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Quiz> createQuiz(@RequestBody QuizCreateRequest request, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(quizService.createQuiz(request, user.getId()));
    }

    @GetMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<Quiz>> getMyQuizzes(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(quizService.getInstructorQuizzes(user.getId()));
    }

    @PostMapping("/{id}/questions")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Question> addQuestion(@PathVariable Long id, @RequestBody QuestionCreateRequest request) {
        return ResponseEntity.ok(quizService.addQuestion(id, request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Quiz> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    @GetMapping("/{id}/participant")
    @PreAuthorize("hasRole('PARTICIPANT') or hasRole('INSTRUCTOR')")
    public ResponseEntity<com.quiz.backend.dto.QuizParticipantResponse> getQuizForParticipant(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizForParticipant(id));
    }
}
