package com.example.main.service;

import com.example.main.dto.PostRequest;
import com.example.main.entity.Post;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface PostService {

    Post createPost(PostRequest request, List<MultipartFile> files) throws IOException;

    List<Post> getAllPosts();

    Optional<Post> getPostById(Long id);

    Post updatePost(Long id, Post updatedPost);

    void deletePost(Long id);
}
