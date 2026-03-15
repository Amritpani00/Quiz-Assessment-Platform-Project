package com.quiz.backend.service;

import com.quiz.backend.dto.OptionCreateRequest;
import com.quiz.backend.dto.QuestionCreateRequest;
import com.quiz.backend.dto.QuizCreateRequest;
import com.quiz.backend.model.*;
import com.quiz.backend.repository.OptionRepository;
import com.quiz.backend.repository.QuestionRepository;
import com.quiz.backend.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;

    public Quiz createQuiz(QuizCreateRequest request, Long creatorId) {
        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .timeLimitMins(request.getTimeLimitMins())
                .creatorId(creatorId)
                .status(QuizStatus.DRAFT)
                .build();
        return quizRepository.save(quiz);
    }

    @Transactional
    public Question addQuestion(Long quizId, QuestionCreateRequest request) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        Question question = Question.builder()
                .quiz(quiz)
                .text(request.getText())
                .type(request.getType())
                .points(request.getPoints())
                .position(request.getPosition())
                .build();

        Question savedQuestion = questionRepository.save(question);

        if (request.getOptions() != null && !request.getOptions().isEmpty()) {
            List<Option> options = request.getOptions().stream().map(optReq ->
                    Option.builder()
                            .question(savedQuestion)
                            .text(optReq.getText())
                            .isCorrect(optReq.getIsCorrect())
                            .build()
            ).collect(Collectors.toList());
            optionRepository.saveAll(options);
            savedQuestion.setOptions(options);
        }

        return savedQuestion;
    }

    public List<Quiz> getInstructorQuizzes(Long creatorId) {
        return quizRepository.findByCreatorId(creatorId);
    }

    public Quiz getQuizById(Long quizId) {
        return quizRepository.findById(quizId).orElseThrow(() -> new RuntimeException("Quiz not found"));
    }

    public com.quiz.backend.dto.QuizParticipantResponse getQuizForParticipant(Long quizId) {
        Quiz quiz = getQuizById(quizId);
        List<com.quiz.backend.dto.QuizParticipantResponse.QuestionParticipantResponse> questions = quiz.getQuestions().stream()
                .map(q -> {
                    List<com.quiz.backend.dto.QuizParticipantResponse.OptionParticipantResponse> options = q.getOptions().stream()
                            .map(o -> com.quiz.backend.dto.QuizParticipantResponse.OptionParticipantResponse.builder()
                                    .id(o.getId())
                                    .text(o.getText())
                                    .build())
                            .collect(Collectors.toList());
                    return com.quiz.backend.dto.QuizParticipantResponse.QuestionParticipantResponse.builder()
                            .id(q.getId())
                            .text(q.getText())
                            .type(q.getType())
                            .points(q.getPoints())
                            .position(q.getPosition())
                            .options(options)
                            .build();
                })
                .collect(Collectors.toList());

        return com.quiz.backend.dto.QuizParticipantResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .timeLimitMins(quiz.getTimeLimitMins())
                .questions(questions)
                .build();
    }
}
