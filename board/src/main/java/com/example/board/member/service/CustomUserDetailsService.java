package com.example.board.member.service;

import com.example.board.member.entity.Member;
import com.example.board.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
@Service
@RequiredArgsConstructor

public class CustomUserDetailsService implements UserDetailsService {
    // 1. MemberRepository 주입
    private final MemberRepository memberRepository;

    // 2. loadUserByUsername 메서드 구현
    public UserDetails loadUserByUsername(String email) {
        //    - email로 Member 조회 (못 찾으면 UsernameNotFoundException)
        Member member = memberRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("해당하는 사용자가 없습니다."));
        return User.builder()
                .username(member.getEmail())
                .password(member.getPassword())
                .roles(member.getRole().name().replace("ROLE_", ""))
                .build();
    }
}
