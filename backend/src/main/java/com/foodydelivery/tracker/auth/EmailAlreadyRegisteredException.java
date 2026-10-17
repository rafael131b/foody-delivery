package com.foodydelivery.tracker.auth;

public class EmailAlreadyRegisteredException extends RuntimeException {
    public EmailAlreadyRegisteredException() {
        super("E-mail já cadastrado");
    }
}
