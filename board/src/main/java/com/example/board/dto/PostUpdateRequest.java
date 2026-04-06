package com.example.board.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor

// PostCreatRequest랑 지금은 똑같지만 나중에 달라질 수 있으므로 분리
public class PostUpdateRequest {
    private long id;
    private String password;
    private String title;
    private String content;
}
