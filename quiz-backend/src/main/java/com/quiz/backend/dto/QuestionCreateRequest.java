package com.quiz.backend.dto;

import com.quiz.backend.model.QuestionType;
import lombok.Data;
import java.util.List;

@Data
public class QuestionCreateRequest {
    private String text;
    private QuestionType type;
    private Integer points;
    private Integer position;
    private List<OptionCreateRequest> options;
}
