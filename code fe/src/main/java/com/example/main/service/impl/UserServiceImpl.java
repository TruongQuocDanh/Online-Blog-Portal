package com.example.main.service.impl;

import com.example.main.dto.UserRequest;
import com.example.main.entity.User;
import com.example.main.repository.UserRepository;
import com.example.main.service.UserService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

	public UserServiceImpl(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public User createUser(UserRequest req) {

		if (userRepository.existsByUsername(req.getUsername()))
			throw new RuntimeException("Username already exists");

		if (userRepository.existsByEmail(req.getEmail()))
			throw new RuntimeException("Email already exists");

		User user = new User();
		user.setUsername(req.getUsername());
		user.setEmail(req.getEmail());
		user.setDisplayName(req.getDisplayName());
		user.setRole((short) 0);
		user.setPasswordHash(encoder.encode(req.getPasswordHash()));

		return userRepository.save(user);
	}

	@Override
	public Optional<User> findByEmail(String email) {
		return userRepository.findByEmail(email);
	}

	@Override
	public List<User> getAllUsers() {
		return userRepository.findAll();
	}

	@Override
	public Optional<User> getUserById(Long id) {
		return userRepository.findById(id);
	}

	@Override
	public User updateUser(Long id, UserRequest req) {
		return userRepository.findById(id).map(user -> {

			if (req.getUsername() != null)
				user.setUsername(req.getUsername());

			if (req.getEmail() != null)
				user.setEmail(req.getEmail());

			if (req.getDisplayName() != null)
				user.setDisplayName(req.getDisplayName());

			if (req.getRole() != null)
				user.setRole(req.getRole());

			if (req.getPasswordHash() != null && !req.getPasswordHash().isEmpty())
				user.setPasswordHash(encoder.encode(req.getPasswordHash()));

			return userRepository.save(user);

		}).orElseThrow(() -> new RuntimeException("User not found"));
	}

	@Override
	public void deleteUser(Long id) {
		userRepository.deleteById(id);
	}
}
