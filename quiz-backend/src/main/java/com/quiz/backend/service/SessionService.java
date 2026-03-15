package com.quiz.backend.service;

import com.quiz.backend.dto.AnswerRequest;
import com.quiz.backend.dto.AuthenticationResponse;
import com.quiz.backend.dto.JoinSessionRequest;
import com.quiz.backend.model.*;
import com.quiz.backend.repository.*;
import com.quiz.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final QuizSessionRepository sessionRepository;
    private final QuizRepository quizRepository;
    private final AttemptRepository attemptRepository;
    private final AnswerRepository answerRepository;
    private final OptionRepository optionRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final SimpMessagingTemplate messagingTemplate;

    public QuizSession startSession(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> new RuntimeException("Quiz not found"));
        quiz.setStatus(QuizStatus.ACTIVE);
        quizRepository.save(quiz);

        QuizSession session = QuizSession.builder()
                .quizId(quizId)
                .joinCode(UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .startedAt(LocalDateTime.now())
                .build();
        return sessionRepository.save(session);
    }

    @Transactional
    public AuthenticationResponse joinSession(JoinSessionRequest request) {
        QuizSession session = sessionRepository.findByJoinCode(request.getJoinCode())
                .orElseThrow(() -> new RuntimeException("Invalid join code"));

        // Create temporary user for the participant
        User participant = User.builder()
                .email("participant_" + UUID.randomUUID().toString() + "@temp.com")
                .name(request.getDisplayName())
                .role(Role.PARTICIPANT)
                .build();
        participant = userRepository.save(participant);

        Attempt attempt = Attempt.builder()
                .sessionId(session.getId())
                .userId(participant.getId())
                .startedAt(LocalDateTime.now())
                .totalScore(0)
                .build();
        attemptRepository.save(attempt);

        String token = jwtService.generateTokenForParticipant(participant);

        return AuthenticationResponse.builder()
                .token(token)
                .name(participant.getName())
                .role(Role.PARTICIPANT.name())
                .attemptId(attempt.getId())
                .quizId(session.getQuizId())
                .build();
    }

    public Answer submitAnswer(Long attemptId, AnswerRequest request, Long userId) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (!attempt.getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized for this attempt");
        }

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        Answer answer = Answer.builder()
                .attemptId(attemptId)
                .questionId(request.getQuestionId())
                .selectedOptionId(request.getSelectedOptionId())
                .textAnswer(request.getTextAnswer())
                .build();

        if (question.getType() == QuestionType.MCQ) {
            Optional<Option> selectedOpt = optionRepository.findById(request.getSelectedOptionId());
            if (selectedOpt.isPresent() && selectedOpt.get().getIsCorrect()) {
                answer.setIsCorrect(true);
                answer.setPointsAwarded(question.getPoints());
            } else {
                answer.setIsCorrect(false);
                answer.setPointsAwarded(0);
            }
        } else {
            // Short answer - to be manually graded later
            answer.setIsCorrect(null);
            answer.setPointsAwarded(0);
        }

        return answerRepository.save(answer);
    }

    @Transactional
    public Attempt submitAttempt(Long attemptId, Long userId) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (!attempt.getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized for this attempt");
        }

        if (attempt.getSubmittedAt() != null) {
            throw new RuntimeException("Attempt already submitted");
        }

        QuizSession session = sessionRepository.findById(attempt.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found"));
        Quiz quiz = quizRepository.findById(session.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        LocalDateTime now = LocalDateTime.now();
        long minutesElapsed = ChronoUnit.MINUTES.between(attempt.getStartedAt(), now);
        long secondsElapsed = ChronoUnit.SECONDS.between(attempt.getStartedAt(), now) % 60;

        // Validation: (submittedAt - startedAt) <= timeLimitMins + 30 seconds grace period
        long allowedSeconds = (quiz.getTimeLimitMins() * 60) + 30;
        long actualSeconds = ChronoUnit.SECONDS.between(attempt.getStartedAt(), now);

        if (actualSeconds > allowedSeconds) {
            throw new RuntimeException("Time limit exceeded");
        }

        attempt.setSubmittedAt(now);

        // Calculate total score
        List<Answer> answers = answerRepository.findByAttemptId(attemptId);
        int totalScore = answers.stream()
                .filter(a -> a.getPointsAwarded() != null)
                .mapToInt(Answer::getPointsAwarded)
                .sum();
        attempt.setTotalScore(totalScore);

        Attempt savedAttempt = attemptRepository.save(attempt);
        broadcastLeaderboardUpdate(session.getId());
        return savedAttempt;
    }

    private void broadcastLeaderboardUpdate(Long sessionId) {
        List<Attempt> attempts = attemptRepository.findBySessionIdOrderByTotalScoreDesc(sessionId);
        List<com.quiz.backend.dto.LeaderboardEntry> leaderboard = attempts.stream()
                .map(att -> {
                    User user = userRepository.findById(att.getUserId()).orElse(null);
                    return com.quiz.backend.dto.LeaderboardEntry.builder()
                            .participantName(user != null ? user.getName() : "Unknown")
                            .score(att.getTotalScore())
                            .build();
                })
                .collect(java.util.stream.Collectors.toList());

        messagingTemplate.convertAndSend("/topic/session." + sessionId + ".leaderboard", leaderboard);
    }

    public List<com.quiz.backend.dto.LeaderboardEntry> getLeaderboard(Long sessionId) {
        List<Attempt> attempts = attemptRepository.findBySessionIdOrderByTotalScoreDesc(sessionId);
        return attempts.stream()
                .map(att -> {
                    User user = userRepository.findById(att.getUserId()).orElse(null);
                    return com.quiz.backend.dto.LeaderboardEntry.builder()
                            .participantName(user != null ? user.getName() : "Unknown")
                            .score(att.getTotalScore())
                            .build();
                })
                .collect(java.util.stream.Collectors.toList());
    }
}
