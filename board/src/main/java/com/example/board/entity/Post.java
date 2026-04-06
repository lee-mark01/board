package com.example.board.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class) // @CreatedDate나 @LastModifiedDate 동작하려면 클래스에 @EntityListeners 붙여야하고, Main 클래스에 @EnableJpaAuditing붙여야한다.
@Entity
public class Post {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) // DB가 자동으로 id를 하나씩 증가시켜준다. 전략 명시
    private long id;

    @CreatedDate // 생성 날짜 자동으로 넣어줌
    private LocalDateTime createdAt; // 날짜타입은 long이 아니라 localDateTime 써야한다.

    @LastModifiedDate // 수정 날짜 자동으로 넣어줌
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

    private String title;
    private String content;
    private String userName;
    private String password;

    public Post(String title, String content, String userName, String password) {
        this.title = title;
        this.content = content;
        this.userName = userName;
        this.password = password;
    }

    public void update(String title, String content) {
        this.title = title;
        this.content = content;
    }

    public void delete() {
        this.deletedAt = LocalDateTime.now();
    }
}
