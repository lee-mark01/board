package com.example.board.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter // getter 메서드 만들어줌. 필드 접근해서 조회 가능.
@NoArgsConstructor // jackson이 기본 생성자로 빈 객체를 만들고, 리플렉션으로 필드에 값을 넣음.
@AllArgsConstructor // 생성자 만들어줌
public class PostDeleteRequest {
    private long id;
    private String password;
}