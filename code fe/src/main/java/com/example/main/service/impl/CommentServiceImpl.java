package com.example.main.service.impl;

import com.example.main.dto.CommentRequest;
import com.example.main.dto.CommentResponse;
import com.example.main.entity.Comment;
import com.example.main.entity.Post;
import com.example.main.entity.User;
import com.example.main.repository.CommentRepository;
import com.example.main.repository.PostRepository;
import com.example.main.repository.UserRepository;
import com.example.main.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CommentServiceImpl implements CommentService {

    @Autowired private CommentRepository commentRepository;
    @Autowired private PostRepository postRepository;
    @Autowired private UserRepository userRepository;

    @Override
    public CommentResponse createComment(CommentRequest req) {

        Post post = postRepository.findById(req.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthor(user);
        comment.setContent(req.getContent());

        if (req.getParentId() != null) {
            Comment parent = commentRepository.findById(req.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParent(parent);
        }

        Comment saved = commentRepository.save(comment);

        return new CommentResponse(
                saved.getCommentId(),
                saved.getPost().getPostId(),
                saved.getAuthor().getUserId(),
                saved.getParent() != null ? saved.getParent().getCommentId() : null,
                saved.getContent(),
                saved.getCreatedAt()
        );
    }

    @Override
    public List<CommentResponse> getCommentsByPost(Long postId) {
        return commentRepository.findByPost_PostId(postId)
                .stream()
                .map(c -> new CommentResponse(
                        c.getCommentId(),
                        c.getPost().getPostId(),
                        c.getAuthor().getUserId(),
                        c.getParent() != null ? c.getParent().getCommentId() : null,
                        c.getContent(),
                        c.getCreatedAt()
                )).toList();
    }

    @Override
    public Optional<CommentResponse> getCommentById(Long id) {
        return commentRepository.findById(id)
                .map(c -> new CommentResponse(
                        c.getCommentId(),
                        c.getPost().getPostId(),
                        c.getAuthor().getUserId(),
                        c.getParent() != null ? c.getParent().getCommentId() : null,
                        c.getContent(),
                        c.getCreatedAt()
                ));
    }

    @Override
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }
}
