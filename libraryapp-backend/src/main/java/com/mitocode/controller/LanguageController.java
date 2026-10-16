package com.mitocode.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.LocaleResolver;

import java.util.Locale;

@RestController
@RequestMapping("/v1/languages")
@RequiredArgsConstructor
public class LanguageController {
    private final LocaleResolver localeResolver;
    private final HttpServletRequest request;
    private final HttpServletResponse response;

    @GetMapping("/change/{language}")
    public ResponseEntity<Void> changeLanguage(@PathVariable String language) {
        Locale userLocale = switch (language) {
            case "en","us" -> Locale.ENGLISH;
            default -> Locale.ROOT;
        };
        localeResolver.setLocale(request, response, userLocale);
        return ResponseEntity.ok().build();
    }
}
