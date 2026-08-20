package com.resumebuilder.common.exception;

public class PersonalInfoAlreadyExistsException extends RuntimeException {
    public PersonalInfoAlreadyExistsException(String message) {
        super(message);
    }
}