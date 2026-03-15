package com.quiz.backend.controller;

import com.quiz.backend.dto.ScoreReport;
import com.quiz.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/attempts")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/{id}/report")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('PARTICIPANT')")
    public ResponseEntity<ScoreReport> getReport(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.generateScoreReport(id));
    }

    @GetMapping("/{id}/report/pdf")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('PARTICIPANT')")
    public ResponseEntity<byte[]> downloadPdfReport(@PathVariable Long id) {
        byte[] pdfBytes = reportService.generatePdfReport(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "score_report_" + id + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
