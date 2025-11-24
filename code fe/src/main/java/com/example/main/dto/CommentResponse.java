package com.example.main.dto;

import java.time.OffsetDateTime;

public class CommentResponse {
    private Long id;
    private Long postId;
    private Long userId;
    private Long parentId;
    private String content;
    private OffsetDateTime createdAt;

    public CommentResponse(Long id, Long postId, Long userId, Long parentId, String content, OffsetDateTime createdAt) {
        this.id = id;
        this.postId = postId;
        this.userId = userId;
        this.parentId = parentId;
        this.content = content;
        this.createdAt = createdAt;
    }

    // Getters
    public Long getId() { return id; }
    public Long getPostId() { return postId; }
    public Long getUserId() { return userId; }
    public Long getParentId() { return parentId; }
    public String getContent() { return content; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
