package com.quiz.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ScoreReport {
    private String participantName;
    private String quizTitle;
    private Integer totalScore;
    private List<QuestionReport> questions;

    @Data
    @Builder
    public static class QuestionReport {
        private String text;
        private String participantAnswer;
        private String correctAnswer;
        private Integer pointsAwarded;
    }
}
