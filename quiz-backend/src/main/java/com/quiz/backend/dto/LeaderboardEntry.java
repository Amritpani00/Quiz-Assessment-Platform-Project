package com.quiz.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LeaderboardEntry {
    private String participantName;
    private Integer score;
}
