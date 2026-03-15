package com.quiz.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "answers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long attemptId;

    @Column(nullable = false)
    private Long questionId;

    private Long selectedOptionId;

    @Column(columnDefinition = "TEXT")
    private String textAnswer;

    private Boolean isCorrect;

    private Integer pointsAwarded;
}
