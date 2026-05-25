package com.example.board.post.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter // getter 메서드 만들어줌. 필드 접근해서 조회 가능.
@NoArgsConstructor // jackson이 기본 생성자로 빈 객체를 만들고, 리플렉션으로 필드에 값을 넣음.
@AllArgsConstructor // 모든 파라미터를 초기화하는 생성자를 자동으로 만들어줌
public class PostCreateRequest {
    private String title;
    private String content;
}
