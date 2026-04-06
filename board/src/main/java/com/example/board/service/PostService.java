package com.example.board.service;

import com.example.board.dto.*;
import com.example.board.entity.Post;
import com.example.board.repository.PostRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;

    public PostResponse createPost(PostCreateRequest postCreateRequest){
        // Dto에서 데이터 꺼내서 Post Entity 만들고, Repository로 DB에 저장하고, DB가 자동생성한 post 에서 id를 반환받아야함
        Post post = new Post(
                postCreateRequest.getTitle(),
                postCreateRequest.getContent(),
                postCreateRequest.getUserName(),
                postCreateRequest.getPassword()
        );

        Post savePost = postRepository.save(post);
        return new PostResponse(
                savePost.getId(),
                savePost.getTitle(),
                savePost.getContent(),
                savePost.getUserName(),
                savePost.getCreatedAt(),
                savePost.getUpdatedAt()
        );
    }

    @Transactional
    public PostResponse updatePost(PostUpdateRequest postUpdateRequest) {
        long id = postUpdateRequest.getId();
        Optional<Post> postOptional = postRepository.findById(id);
        Post post = postOptional.orElseThrow(()-> new RuntimeException("해당하는 글이 없습니다."));

        String password = postUpdateRequest.getPassword();
        String fixedTitle = postUpdateRequest.getTitle();
        String fixedContent = postUpdateRequest.getContent();

        if (!password.equals(post.getPassword())) {
            throw new RuntimeException("수정 권한이 없습니다.");
        } else {
            post.update(fixedTitle, fixedContent);
            return new PostResponse(
                    post.getId(),
                    post.getTitle(),
                    post.getContent(),
                    post.getUserName(),
                    post.getCreatedAt(),
                    post.getUpdatedAt()
            );
        }
    }

    @Transactional
    public void deletePost(PostDeleteRequest postDeleteRequest){
        long id = postDeleteRequest.getId();
        Optional<Post> postOptional = postRepository.findById(id);
        Post post = postOptional.orElseThrow(()-> new RuntimeException("해당하는 글이 없습니다."));
        String password = postDeleteRequest.getPassword();

        if(!password.equals(post.getPassword())){
            throw new RuntimeException("삭제 권한이 없습니다");
        }
        else{
            post.delete();
        }
    }

    public PostResponse getPost(long id) {
        // id 받아서 PostResponse 객체로 응답
        Optional<Post> postOptional = postRepository.findById(id);
        Post post = postOptional.orElseThrow(() -> new RuntimeException("해당하는 글이 없습니다."));

        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getUserName(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }

    /*
     페이징을 통해 게시물 목록을 보여주기 위해서는 page와 size를 받아야하고,
     스프링 데이터 기능 중에 이 페이징 기능을 지원해주는 Pageable 객체가 있다.
     Pageable pageabe = PageRequeset.of(page, size) 이런 식으로 객체를 만들고,
     다음은 그 객체를 레파지토리의 findAll 에 넣으면 페이지의 리스트가 나온다.
     그런데 우리가 필요한 데이터는 PostListResponse라는 객체의 id,title,name,created_at이라는 정보이다.
     그래서 이 정보들을 객체 타입을 변환하면서 필요한 정보만 받기 위해,
     getContent().steam().map 을 통해 PostListResponse로 객체를 이사 시킨 후에 Collectors.toList로 리스트 변환을 시킨다.
     */
    public List<PostListResponse> getPosts(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> posts;
        if (keyword == null || keyword.isEmpty()) {
            posts = postRepository.findByDeletedAtIsNull(pageable);
        } else{
            posts = postRepository.findByTitleContainingAndDeletedAtIsNull(keyword, pageable);
        }
        return posts.getContent().stream()
                .map(post -> new PostListResponse(
                        post.getId(),
                        post.getTitle(),
                        post.getUserName(),
                        post.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
}
