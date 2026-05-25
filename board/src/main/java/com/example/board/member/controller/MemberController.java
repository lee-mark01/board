package com.example.board.member.controller;
import com.example.board.member.dto.MemberLoginResponse;
import com.example.board.member.dto.MemberSignInRequest;
import com.example.board.member.dto.MemberSignUpRequest;
import com.example.board.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;

    @PostMapping("/signup")
    public ResponseEntity<Void> createUser(
            @RequestBody MemberSignUpRequest request) {
        memberService.signUp(request);
        return ResponseEntity.status(201).build();
    }

    @PostMapping("/login")
    public ResponseEntity<MemberLoginResponse> login(
            @RequestBody MemberSignInRequest request) {
        return ResponseEntity.ok(memberService.login(request));
    }

    @PostMapping("/reissue")
    public ResponseEntity<MemberLoginResponse> reissue(
            @RequestHeader("RefreshToken") String refreshToken) {
        return ResponseEntity.ok(memberService.reissue(refreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader("RefreshToken") String refreshToken){
        memberService.logout(refreshToken);
        return ResponseEntity.noContent().build();
    }
}
