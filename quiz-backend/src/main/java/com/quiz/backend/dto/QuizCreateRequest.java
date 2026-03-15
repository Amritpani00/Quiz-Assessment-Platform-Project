package com.quiz.backend.dto;

import com.quiz.backend.model.QuizStatus;
import lombok.Data;

@Data
public class QuizCreateRequest {
    private String title;
    private String description;
    private Integer timeLimitMins;
}
