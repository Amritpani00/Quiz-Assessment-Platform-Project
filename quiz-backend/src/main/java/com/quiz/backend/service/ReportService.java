package com.quiz.backend.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.quiz.backend.dto.ScoreReport;
import com.quiz.backend.model.*;
import com.quiz.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final AttemptRepository attemptRepository;
    private final QuizSessionRepository sessionRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final OptionRepository optionRepository;
    private final UserRepository userRepository;

    public ScoreReport generateScoreReport(Long attemptId) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        QuizSession session = sessionRepository.findById(attempt.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        Quiz quiz = quizRepository.findById(session.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        User participant = userRepository.findById(attempt.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Answer> answers = answerRepository.findByAttemptId(attemptId);
        List<Question> questions = questionRepository.findByQuizIdOrderByPositionAsc(quiz.getId());

        List<ScoreReport.QuestionReport> questionReports = new ArrayList<>();

        for (Question q : questions) {
            Answer ans = answers.stream()
                    .filter(a -> a.getQuestionId().equals(q.getId()))
                    .findFirst()
                    .orElse(null);

            String participantAnswer = "No answer";
            if (ans != null) {
                if (q.getType() == QuestionType.MCQ && ans.getSelectedOptionId() != null) {
                    participantAnswer = optionRepository.findById(ans.getSelectedOptionId())
                            .map(Option::getText)
                            .orElse("Unknown option");
                } else if (ans.getTextAnswer() != null) {
                    participantAnswer = ans.getTextAnswer();
                }
            }

            String correctAnswer = "";
            if (q.getType() == QuestionType.MCQ) {
                correctAnswer = optionRepository.findByQuestionId(q.getId()).stream()
                        .filter(Option::getIsCorrect)
                        .map(Option::getText)
                        .collect(Collectors.joining(", "));
            } else {
                correctAnswer = "Manual grading"; // For short answer
            }

            questionReports.add(ScoreReport.QuestionReport.builder()
                    .text(q.getText())
                    .participantAnswer(participantAnswer)
                    .correctAnswer(correctAnswer)
                    .pointsAwarded(ans != null ? (ans.getPointsAwarded() != null ? ans.getPointsAwarded() : 0) : 0)
                    .build());
        }

        return ScoreReport.builder()
                .participantName(participant.getName())
                .quizTitle(quiz.getTitle())
                .totalScore(attempt.getTotalScore())
                .questions(questionReports)
                .build();
    }

    public byte[] generatePdfReport(Long attemptId) {
        ScoreReport report = generateScoreReport(attemptId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.BLACK);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.BLACK);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.BLACK);

            document.add(new Paragraph("Score Report: " + report.getQuizTitle(), titleFont));
            document.add(new Paragraph("Participant: " + report.getParticipantName(), headerFont));
            document.add(new Paragraph("Total Score: " + report.getTotalScore(), headerFont));
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3f, 2f, 2f, 1f});

            table.addCell(new PdfPCell(new Phrase("Question", headerFont)));
            table.addCell(new PdfPCell(new Phrase("Your Answer", headerFont)));
            table.addCell(new PdfPCell(new Phrase("Correct Answer", headerFont)));
            table.addCell(new PdfPCell(new Phrase("Points", headerFont)));

            for (ScoreReport.QuestionReport qr : report.getQuestions()) {
                table.addCell(new PdfPCell(new Phrase(qr.getText(), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(qr.getParticipantAnswer(), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(qr.getCorrectAnswer(), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(qr.getPointsAwarded()), bodyFont)));
            }

            document.add(table);
            document.close();

            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }
}
