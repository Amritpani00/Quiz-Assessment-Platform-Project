package com.quiz.backend.dto;

import com.quiz.backend.model.QuestionType;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class QuizParticipantResponse {
    private Long id;
    private String title;
    private String description;
    private Integer timeLimitMins;
    private List<QuestionParticipantResponse> questions;

    @Data
    @Builder
    public static class QuestionParticipantResponse {
        private Long id;
        private String text;
        private QuestionType type;
        private Integer points;
        private Integer position;
        private List<OptionParticipantResponse> options;
    }

    @Data
    @Builder
    public static class OptionParticipantResponse {
        private Long id;
        private String text;
    }
}
