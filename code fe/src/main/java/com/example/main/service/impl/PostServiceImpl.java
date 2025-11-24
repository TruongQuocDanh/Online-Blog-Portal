package com.example.main.service.impl;

import com.example.main.config.CustomUserDetails;
import com.example.main.dto.PostRequest;
import com.example.main.entity.Post;
import com.example.main.entity.PostImage;
import com.example.main.repository.PostImageRepository;
import com.example.main.repository.PostRepository;
import com.example.main.service.FileStorageService;
import com.example.main.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PostServiceImpl implements PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private PostImageRepository postImageRepository;

    @Autowired
    private FileStorageService fileStorageService;

    private static final short ROLE_ADMIN = 1;

    @Override
    public Post createPost(PostRequest req, List<MultipartFile> files) throws IOException {
        Post post = new Post();
        post.setAuthorId(req.getAuthorId());
        post.setTitle(req.getTitle());
        post.setContent(req.getContent());
        post.setCategory(req.getCategory());
        post.setStatus(req.getStatus());
        post.setFeatured(req.getFeatured());

        if (req.getStatus() != null && req.getStatus() == 1 && post.getPublishedAt() == null) {
            post.setPublishedAt(OffsetDateTime.now());
        }

        Post savedPost = postRepository.save(post);

        if (files != null && !files.isEmpty()) {
            boolean thumbnailSet = (savedPost.getThumbnailUrl() != null);

            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) continue;

                String fileUrl = fileStorageService.saveFile(file);

                PostImage img = new PostImage(savedPost, fileUrl);
                postImageRepository.save(img);

                if (!thumbnailSet) {
                    savedPost.setThumbnailUrl(fileUrl);
                    thumbnailSet = true;
                }
            }

            savedPost = postRepository.save(savedPost);
        }

        return savedPost;
    }

    @Override
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    @Override
    public Optional<Post> getPostById(Long id) {
        return postRepository.findById(id);
    }

    @Override
    public Post updatePost(Long id, Post updatedPost) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails principal = (CustomUserDetails) auth.getPrincipal();

        Long currentUserId = principal.getId();
        Short role = principal.getRoleValue();
        boolean isAdmin = (role == ROLE_ADMIN);

        if (!isAdmin && !post.getAuthorId().equals(currentUserId)) {
            throw new AccessDeniedException("You cannot edit this post");
        }

        post.setTitle(updatedPost.getTitle());
        post.setContent(updatedPost.getContent());
        post.setCategory(updatedPost.getCategory());
        post.setStatus(updatedPost.getStatus());
        post.setFeatured(updatedPost.getFeatured());
        post.setPublishedAt(updatedPost.getPublishedAt());

        return postRepository.save(post);
    }

    @Override
    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails principal = (CustomUserDetails) auth.getPrincipal();

        Long currentUserId = principal.getId();
        Short role = principal.getRoleValue();
        boolean isAdmin = (role == ROLE_ADMIN);

        if (!isAdmin && !post.getAuthorId().equals(currentUserId)) {
            throw new AccessDeniedException("You cannot delete this post");
        }

        postRepository.delete(post);
    }
}
