package com.example.main.dto;

public class PostRequest {
    private Long authorId;
    private String title;
    private String content;
    private Short status;     // 0 = draft, 1 = published
    private String category;
    private Boolean featured;

    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Short getStatus() { return status; }
    public void setStatus(Short status) { this.status = status; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }
}
