package com.example.webapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/currency")
@CrossOrigin(origins = "http://localhost:5173")
public class CurrencyController {

    private final RestTemplate restTemplate;

    private static final List<String> COMMON_CURRENCIES =
            List.of("USD", "EUR", "GBP", "JPY", "AED", "SGD", "AUD", "CAD");

    public CurrencyController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping("/convert")
    public ResponseEntity<?> convert(@RequestParam(defaultValue = "INR") String from,
                                      @RequestParam String to,
                                      @RequestParam BigDecimal amount) {
        try {
            String url = String.format(
                    "https://api.frankfurter.app/latest?amount=%s&from=%s&to=%s",
                    amount.toPlainString(), from, to
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null || !response.containsKey("rates")) {
                return ResponseEntity.status(502).body("Exchange rate service returned no data.");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> rates = (Map<String, Object>) response.get("rates");
            Object convertedObj = rates.get(to);

            if (convertedObj == null) {
                return ResponseEntity.badRequest().body("Unsupported target currency: " + to);
            }

            BigDecimal converted = new BigDecimal(convertedObj.toString()).setScale(2, RoundingMode.HALF_UP);
            BigDecimal rate = converted.divide(amount, 6, RoundingMode.HALF_UP);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("from", from);
            result.put("to", to);
            result.put("amount", amount);
            result.put("convertedAmount", converted);
            result.put("rate", rate);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(502).body("Unable to reach exchange rate service. Try again later.");
        }
    }

    @GetMapping("/rates")
    public ResponseEntity<?> rates(@RequestParam(defaultValue = "INR") String base) {
        try {
            String to = String.join(",", COMMON_CURRENCIES);
            String url = String.format("https://api.frankfurter.app/latest?from=%s&to=%s", base, to);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null) {
                return ResponseEntity.status(502).body("Exchange rate service returned no data.");
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(502).body("Unable to reach exchange rate service. Try again later.");
        }
    }
}