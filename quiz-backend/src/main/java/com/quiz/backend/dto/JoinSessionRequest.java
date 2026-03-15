package com.quiz.backend.dto;

import lombok.Data;

@Data
public class JoinSessionRequest {
    private String joinCode;
    private String displayName;
}
