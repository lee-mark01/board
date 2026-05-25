package com.example.board.member.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;


@Getter
@NoArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
// Member(id, email, password, username, role, createdAt)
public class Member {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String email;
    private String password;
    private String userName;

    @Enumerated // 0,1로 저장되지 않게.
    private Role role;

    @CreatedDate
    private LocalDateTime createdAt;

    public Member(String email, String password, String userName, Role role){
        this.email = email;
        this.password = password;
        this.userName = userName;
        this.role = role;
    }
}
