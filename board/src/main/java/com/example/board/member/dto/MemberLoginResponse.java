package com.example.board.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor

public class MemberLoginResponse {
    private String accessToken;
    private String refreshToken;
}
