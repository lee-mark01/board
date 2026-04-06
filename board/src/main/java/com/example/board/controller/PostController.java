package com.example.board.controller;

import com.example.board.dto.*;
import com.example.board.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // controller + responseBody 합친 거(json 반환)
@RequestMapping("/api/posts") // 기본 URL 경로. 모든 메서드가 /api/posts로 시작하는 url을 가짐
@RequiredArgsConstructor // 생성자 자동으로 생성해줌
public class PostController {
    private final PostService postService;

    @PostMapping // HTTP 메서드는 POST
    public ResponseEntity<PostResponse> createPost(@RequestBody PostCreateRequest postCreateRequest){ // @RequestBody는 입력받은 json을 객체로 변환시켜줌
        return ResponseEntity.status(201).body(postService.createPost(postCreateRequest));
    }

    @PutMapping
    public ResponseEntity<PostResponse> updatePost(@RequestBody PostUpdateRequest postUpdateRequest){
        return ResponseEntity.ok(postService.updatePost(postUpdateRequest));
    }

    @DeleteMapping
    public ResponseEntity<Void> deletePost(@RequestBody PostDeleteRequest postDeleteRequest){
        postService.deletePost(postDeleteRequest);
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
