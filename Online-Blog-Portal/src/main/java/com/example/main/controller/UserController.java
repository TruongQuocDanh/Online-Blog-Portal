package com.example.main.controller;

import com.example.main.config.JwtUtil;
import com.example.main.dto.LoginRequest;
import com.example.main.dto.UserRequest;
import com.example.main.entity.User;
import com.example.main.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

	private final UserService userService;
	private final JwtUtil jwtUtil;
	private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

	public UserController(UserService userService, JwtUtil jwtUtil) {
		this.userService = userService;
		this.jwtUtil = jwtUtil;
	}

	@PostMapping("/create")
	public ResponseEntity<?> register(@RequestBody UserRequest req) {
		User saved = userService.createUser(req);
		return ResponseEntity.ok(saved);
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginRequest request) {

		Optional<User> u = userService.findByEmail(request.getEmail());
		if (u.isEmpty())
			return ResponseEntity.status(400).body("Invalid email or password");

		User user = u.get();
		if (!encoder.matches(request.getPassword(), user.getPasswordHash()))
			return ResponseEntity.status(400).body("Invalid email or password");

		String token = jwtUtil.generateToken(user.getUserId(), user.getEmail(), user.getRole());

		Map<String, Object> res = new HashMap<>();
		res.put("token", token);
		res.put("userId", user.getUserId());
		res.put("email", user.getEmail());
		res.put("displayName", user.getDisplayName());
		res.put("username", user.getUsername());
		res.put("role", user.getRole());
		res.put("createdAt", user.getCreatedAt());

		return ResponseEntity.ok(res);
	}

	@GetMapping
	public List<User> all() {
		return userService.getAllUsers();
	}

	@GetMapping("/{id}")
	public ResponseEntity<User> get(@PathVariable Long id) {
		return userService.getUserById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
	}

	@PutMapping("/update/{id}")
	public ResponseEntity<?> update(@PathVariable Long id, @RequestBody UserRequest req) {
		User updated = userService.updateUser(id, req);
		return ResponseEntity.ok(updated);
	}

	@DeleteMapping("/delete/{id}")
	public ResponseEntity<?> delete(@PathVariable Long id) {
		userService.deleteUser(id);
		return ResponseEntity.ok("User deleted");
	}
}
