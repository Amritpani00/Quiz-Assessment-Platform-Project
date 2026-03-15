package com.quiz.backend.dto;

import lombok.Data;

@Data
public class AnswerRequest {
    private Long questionId;
    private Long selectedOptionId;
    private String textAnswer;
}
