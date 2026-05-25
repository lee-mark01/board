package com.example.board.post.controller;

import com.example.board.member.service.MemberService;
import com.example.board.post.dto.*;
import com.example.board.post.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController // controller + responseBody 합친 거(json 반환)
@RequestMapping("/api/posts") // 기본 URL 경로. 모든 메서드가 /api/posts로 시작하는 url을 가짐
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;
    private final MemberService memberService;

    @PostMapping // HTTP 메서드는 POST
    public ResponseEntity<PostResponse> createPost(
            @RequestBody PostCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails){
        long memberId = memberService.getMemberIdByEmail(userDetails.getUsername());
        return ResponseEntity.status(201).body(postService.createPost(request, memberId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable long id,
            @RequestBody PostUpdateRequest postUpdateRequest,
            @AuthenticationPrincipal UserDetails userDetails){
        long memberId = memberService.getMemberIdByEmail(userDetails.getUsername());
        return ResponseEntity.ok(postService.updatePost(id, postUpdateRequest, memberId));
    }

    @DeleteMapping({"/{id}"})
    public ResponseEntity<Void> deletePost(
            @PathVariable long id,
            @AuthenticationPrincipal UserDetails userDetails){
        long memberId = memberService.getMemberIdByEmail(userDetails.getUsername());
        postService.deletePost(id, memberId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPost(@PathVariable long id){
        return ResponseEntity.ok(postService.getPost(id));
    }

    @GetMapping
    public ResponseEntity<List<PostListResponse>> getPosts(
            @RequestParam int page,
            @RequestParam int size,
            @RequestParam(required = false) String keyword){
        return ResponseEntity.ok(postService.getPosts(page,size,keyword));
    }

}
