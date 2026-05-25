package com.example.board.member.service;
import com.example.board.config.JwtTokenProvider;
import com.example.board.member.dto.MemberLoginResponse;
import com.example.board.member.dto.MemberSignInRequest;
import com.example.board.member.dto.MemberSignUpRequest;
import com.example.board.member.entity.Member;
import com.example.board.member.entity.Role;
import com.example.board.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/*
1. DTO에서 email, password, userName 꺼내기
2. password BCrypt로 암호화
3. Member 객체 생성
4. memberRepository에 저장
*/

@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    public void signUp(MemberSignUpRequest memberSignUpRequest) {
        if (memberRepository.findByEmail(memberSignUpRequest.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 존재하는 이메일입니다.");
        }
        Member member = new Member(
                memberSignUpRequest.getEmail(),
                passwordEncoder.encode(memberSignUpRequest.getPassword()),
                memberSignUpRequest.getUserName(),
                Role.ROLE_USER
        );
        memberRepository.save(member);
    }

    public long getMemberIdByEmail(String email) {
        return memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 사용자"))
                .getId();
    }

    public MemberLoginResponse login(MemberSignInRequest request) {
        // email로 member 조회
        Member member = memberRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 사용자"));

        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "비밀번호가 틀렸습니다.");
        }
        // access Token 생성
        String accessToken = jwtTokenProvider.createAccessToken(member.getEmail());
        // refresh Token 생성
        String refreshToken = jwtTokenProvider.createRefreshToken(member.getEmail());
        // redis 에 RT 저장
        refreshTokenService.save(member.getEmail(), refreshToken);
        // 반환
        return new MemberLoginResponse(accessToken, refreshToken);
    }

    public MemberLoginResponse reissue(String refreshToken) {
        /*
        rt 유효성 검증
        rt email 꺼내기
        redis 에서 rt 조회해서 일치 확인
        새 at rt 발급
        redis 업데이트
        MemberLoginResponse 반환
         */
        if (!jwtTokenProvider.validateToken(refreshToken)){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다.");
        };

        String email = jwtTokenProvider.getEmail(refreshToken);

        String savedToken = refreshTokenService.get(email);
        if (!refreshToken.equals(savedToken)){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "토큰이 일치하지 않습니다.");
        }

        // 만약 refreshToken이 같으면 다시 발행. 다르면 에러
        // 다시 발행시에 삭제 필요
        refreshTokenService.delete(email);
        String accessToken = jwtTokenProvider.createAccessToken(email);
        refreshToken = jwtTokenProvider.createRefreshToken(email);

        refreshTokenService.save(email, refreshToken);

        // 반환
        return new MemberLoginResponse(accessToken, refreshToken);
    }

    public void logout (String refreshToken) {
        /*
        유효성 검증 후에 엑세스랑 refresh 삭제해야겠네.
         */
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다.");
        }
        String email = jwtTokenProvider.getEmail(refreshToken);
        refreshTokenService.delete(email);
    }
}
