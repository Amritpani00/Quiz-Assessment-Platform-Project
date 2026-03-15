package com.quiz.backend.controller;

import com.quiz.backend.dto.AnswerRequest;
import com.quiz.backend.dto.AuthenticationResponse;
import com.quiz.backend.dto.JoinSessionRequest;
import com.quiz.backend.model.Answer;
import com.quiz.backend.model.Attempt;
import com.quiz.backend.model.QuizSession;
import com.quiz.backend.model.User;
import com.quiz.backend.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping("/quizzes/{id}/session/start")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<QuizSession> startSession(@PathVariable Long id) {
        return ResponseEntity.ok(sessionService.startSession(id));
    }

    @PostMapping("/sessions/join")
    public ResponseEntity<AuthenticationResponse> joinSession(@RequestBody JoinSessionRequest request) {
        return ResponseEntity.ok(sessionService.joinSession(request));
    }

    @PostMapping("/attempts/{id}/answers")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public ResponseEntity<Answer> submitAnswer(@PathVariable Long id, @RequestBody AnswerRequest request, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(sessionService.submitAnswer(id, request, user.getId()));
    }

    @PostMapping("/attempts/{id}/submit")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public ResponseEntity<Attempt> submitAttempt(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(sessionService.submitAttempt(id, user.getId()));
    }

    @GetMapping("/sessions/{id}/leaderboard")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('PARTICIPANT')")
    public ResponseEntity<java.util.List<com.quiz.backend.dto.LeaderboardEntry>> getLeaderboard(@PathVariable Long id) {
        return ResponseEntity.ok(sessionService.getLeaderboard(id));
    }
}
