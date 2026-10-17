package com.foodydelivery.tracker.auth;
import jakarta.validation.constraints.*;
public final class AuthDtos { private AuthDtos(){} public record RegisterRequest(@NotBlank String name,@NotBlank @Email String email,@NotBlank @Size(min=6) String password){} public record LoginRequest(@NotBlank @Email String email,@NotBlank String password){} public record AuthResponse(String token,String name,String email){} }
