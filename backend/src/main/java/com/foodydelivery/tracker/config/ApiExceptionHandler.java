package com.foodydelivery.tracker.config;

import com.foodydelivery.tracker.auth.EmailAlreadyRegisteredException;
import com.foodydelivery.tracker.auth.InvalidCredentialsException;
import com.foodydelivery.tracker.order.InvalidOrderStatusTransitionException;
import java.util.Map;
import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
  @ExceptionHandler(NoSuchElementException.class)
  ResponseEntity<Map<String, String>> notFound(NoSuchElementException exception) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(Map.of("error", exception.getMessage()));
  }

  @ExceptionHandler({
    InvalidOrderStatusTransitionException.class,
    EmailAlreadyRegisteredException.class
  })
  ResponseEntity<Map<String, String>> conflict(RuntimeException exception) {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", exception.getMessage()));
  }

  @ExceptionHandler(InvalidCredentialsException.class)
  ResponseEntity<Map<String, String>> unauthorized(InvalidCredentialsException exception) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(Map.of("error", exception.getMessage()));
  }

  @ExceptionHandler(IllegalArgumentException.class)
  ResponseEntity<Map<String, String>> badRequest(IllegalArgumentException exception) {
    return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<Map<String, String>> validation(MethodArgumentNotValidException exception) {
    return ResponseEntity.badRequest().body(Map.of("error", "Dados inválidos"));
  }
}
