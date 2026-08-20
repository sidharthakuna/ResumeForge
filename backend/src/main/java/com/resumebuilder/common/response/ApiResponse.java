package com.resumebuilder.common.response;

import lombok.Getter;

@Getter
public class ApiResponse<T> {

    private boolean success;
    private T data;
    private String message;

    private ApiResponse() {
    }

    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = true;
        response.data = data;
        return response;
    }

    public static <T> ApiResponse<T> error(String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = false;
        response.message = message;
        return response;
    }
}