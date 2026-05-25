package com.example.board.post.entity;

import com.example.board.member.entity.Member;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor // Jpa가 DB에서 데이터를 꺼내서 객체로 만들 때 기본생성자를 먼저 호출한다. 리플렉션으로 빈 객체 만들고 필드에 값을 채우는 방식이다. 그런데 Java는 매개변수 생성자를 만들면 기본 생성자를 자동으로 안만들어주기 때문에 @NoArgsConstructor로 만들어준다.
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    public Post(String title, String content, Member member) {
        this.title = title;
        this.content = content;
        this.member = member;
    }

    public void update(String title, String content) {
        this.title = title;
        this.content = content;
    }
    // soft delete. 날짜만 기록.
    public void delete() {
        this.deletedAt = LocalDateTime.now();
    }
}
