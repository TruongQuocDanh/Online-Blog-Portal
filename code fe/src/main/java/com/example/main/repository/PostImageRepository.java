package com.example.main.repository;

import com.example.main.entity.PostImage;
import com.example.main.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostImageRepository extends JpaRepository<PostImage, Long> {
	List<PostImage> findByPost(Post post);
}
