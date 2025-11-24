package com.example.main.service;

import com.example.main.dto.CommentRequest;
import com.example.main.dto.CommentResponse;

import java.util.List;
import java.util.Optional;

public interface CommentService {
	CommentResponse createComment(CommentRequest request);

	List<CommentResponse> getCommentsByPost(Long postId);

	Optional<CommentResponse> getCommentById(Long id);

	void deleteComment(Long id);
}
