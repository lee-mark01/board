package com.example.board.config;

import com.example.board.member.entity.Member;
import com.example.board.member.entity.Role;
import com.example.board.member.repository.MemberRepository;
import com.example.board.member.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final MemberRepository memberRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${oauth2.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email;
        String name;

        // 네이버는 response 안에 있음
        if (oAuth2User.getAttribute("response") != null) {
            Map<String, Object> naverResponse = oAuth2User.getAttribute("response");
            email = (String) naverResponse.get("email");
            name = (String) naverResponse.get("name");
        } else {
            email = oAuth2User.getAttribute("email");
            name = oAuth2User.getAttribute("name");
        }

        // email로 조회, 없으면 자동 회원가입
        Member member = memberRepository.findByEmail(email)
                .orElseGet(() -> memberRepository.save(
                        new Member(email, passwordEncoder.encode("OAUTH2_USER"), name, Role.ROLE_USER)
                ));

        // AT + RT 발급
        String accessToken = jwtTokenProvider.createAccessToken(member.getEmail());
        String refreshToken = jwtTokenProvider.createRefreshToken(member.getEmail());
        refreshTokenService.save(member.getEmail(), refreshToken);

        // 프론트로 redirect
        String redirectUrl = frontendUrl + "/oauth2/callback"
                + "?accessToken=" + accessToken
                + "&refreshToken=" + refreshToken;

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}