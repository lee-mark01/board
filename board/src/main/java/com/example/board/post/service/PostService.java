package com.example.board.post.service;

import com.example.board.member.entity.Member;
import com.example.board.member.repository.MemberRepository;
import com.example.board.post.entity.Post;
import com.example.board.post.dto.*;
import com.example.board.post.repository.PostRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    /*
    PostService는 DB 접근하려면 PostRepository가 필요하다. 근데 PostRepository 객체를 PostService가 만들면 안된다.
    왜냐하면 spring이 postRepository를 관리하고 있기 때문이다. Spring이 postRepository를 관리해야 JPA연결이나 트렌젝션 같은 기능이 동작한다.
    @RequiredArgsConstructor는 final 필드를 파라미터로 받는 생성자를 자동 생성해준다.
    그래서 spring은 PostService 객체를 만들 때 이 어노테이션을 보고 자신이 관리하고 있는 PostRepository 객체를 자동으로 넣어준다.
     */

    public PostResponse createPost(PostCreateRequest request, long memberId){
        // Dto에서 데이터 꺼내서 Post Entity 만들고, Repository로 DB에 저장하고, DB가 자동생성한 post 에서 id를 반환받아야함
        Member member = memberRepository.findById(memberId)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 사용자"));

        Post post = new Post(
                request.getTitle(),
                request.getContent(),
                member
        );

        Post savePost = postRepository.save(post);

        return new PostResponse(
                savePost.getId(),
                savePost.getTitle(),
                savePost.getContent(),
                savePost.getMember().getUserName(),
                savePost.getCreatedAt(),
                savePost.getUpdatedAt()
        );
    }

    @Transactional // post 객체를 감시. 메서드 종료될 때 JPA가 post 엔티티 값이 바뀐 걸 보고 자동으로 DB에 업데이트(더티체킹)
    public PostResponse updatePost(long id, PostUpdateRequest postUpdateRequest, long memberId) {
        Optional<Post> postOptional = postRepository.findById(id);
        Post post = postOptional.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "해당하는 글이 없습니다."));

        String fixedTitle = postUpdateRequest.getTitle();
        String fixedContent = postUpdateRequest.getContent();
        if(post.getMember().getId() != memberId){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "수정 권한이 없습니다.");
        }

        post.update(fixedTitle, fixedContent);
        postRepository.save(post); // 더티체킹으로 저장안된 값을 내보내는 문제를, 저장 후 내보내게 만들도록 하기.
        Post updatePost = postRepository.findById(id).get(); // 위에서 글 존재 여부 확인했으니깐 null 처리 안함.

        return new PostResponse(
                updatePost.getId(),
                updatePost.getTitle(),
                updatePost.getContent(),
                updatePost.getMember().getUserName(),
                updatePost.getCreatedAt(),
                updatePost.getUpdatedAt()
        );
    }

    @Transactional
    public void deletePost(long id, long memberId){
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "해당하는 글이 없습니다."));
        if (post.getMember().getId() != memberId){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        post.delete();
    }

    public PostResponse getPost(long id) {
        // id 받아서 PostResponse 객체로 응답
        Optional<Post> postOptional = postRepository.findById(id);
        Post post = postOptional.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "해당하는 글이 없습니다."));

        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getMember().getUserName(),
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
                        post.getMember().getUserName(),
                        post.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
}
