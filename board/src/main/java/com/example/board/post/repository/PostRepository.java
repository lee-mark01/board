package com.example.board.post.repository;

import com.example.board.post.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByDeletedAtIsNull(Pageable pageable);
    Page<Post> findByTitleContainingAndDeletedAtIsNull(String title, Pageable pageable);
}

