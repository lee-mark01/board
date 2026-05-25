package com.example.board.post.service;

import com.example.board.member.entity.Member;
import com.example.board.member.entity.Role;
import com.example.board.member.repository.MemberRepository;
import com.example.board.post.dto.PostCreateRequest;
import com.example.board.post.dto.PostResponse;
import com.example.board.post.entity.Post;
import com.example.board.post.repository.PostRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class PostServiceTests {
    @Mock
    private PostRepository postRepository;

    @Mock
    private MemberRepository memberRepository;

    @InjectMocks
    private PostService postService;

    @Test
    void createPost_정상() {
        // given (준비)
        // → 가짜 Member, PostCreateRequest 만들기
        Member fakeMember = new Member("test@test.com", "password", "테스트유저", Role.ROLE_USER);

        // → memberRepository.findById() 가 가짜 Member 반환하도록 설정
        when(memberRepository.findById(1L)).thenReturn(Optional.of(fakeMember));

        // → postRepository.save() 가 가짜 Post 반환하도록 설정
        Post fakePost = new Post("제목", "내용", fakeMember);
        when(postRepository.save(any())).thenReturn(fakePost);

        PostCreateRequest request = new PostCreateRequest("제목", "내용");

        // when (실행)
        // → postService.createPost() 호출
        PostResponse response = postService.createPost(request, 1L);

        // then (검증)
        // → 반환된 PostResponse의 title, content가 맞는지 확인
        assertThat(response.getTitle()).isEqualTo("제목");
        assertThat(response.getContent()).isEqualTo("내용");
    }
}
