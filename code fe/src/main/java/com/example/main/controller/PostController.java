package com.example.main.controller;

import com.example.main.dto.PostRequest;
import com.example.main.entity.Post;
import com.example.main.service.PostService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/posts")
public class PostController {

	@Autowired
	private PostService postService;

	private final ObjectMapper mapper = new ObjectMapper();

	// CREATE POST
	@PostMapping(value = "/create", consumes = { "multipart/form-data" })
	public ResponseEntity<?> createPost(@RequestPart("post") String postJson,
			@RequestPart(value = "files", required = false) List<MultipartFile> files) {
		try {
			PostRequest request = mapper.readValue(postJson, PostRequest.class);
			Post saved = postService.createPost(request, files);
			return ResponseEntity.ok(saved);

		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.badRequest().body("Invalid request: " + e.getMessage());
		}
	}

	// GET ALL POSTS
	@GetMapping
	public List<Post> getAllPosts() {
		return postService.getAllPosts();
	}

	// GET POST BY ID
	@GetMapping("/{id}")
	public ResponseEntity<Post> getById(@PathVariable Long id) {
		return postService.getPostById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
	}

	// UPDATE
	@PutMapping("/{id}")
	public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody Post updatedPost) {
		try {
			Post saved = postService.updatePost(id, updatedPost);
			return ResponseEntity.ok(saved);

		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.badRequest().body("Update failed: " + e.getMessage());
		}
	}

	// DELETE POST
	@DeleteMapping("/{id}")
	public ResponseEntity<?> deletePost(@PathVariable Long id) {
		try {
			postService.deletePost(id);
			return ResponseEntity.ok("Post deleted successfully");
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.badRequest().body("Delete failed: " + e.getMessage());
		}
	}
}
