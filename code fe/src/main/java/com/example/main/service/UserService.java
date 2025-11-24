package com.example.main.service;

import com.example.main.dto.UserRequest;
import com.example.main.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserService {

	User createUser(UserRequest request);

	Optional<User> findByEmail(String email);

	List<User> getAllUsers();

	Optional<User> getUserById(Long id);

	User updateUser(Long id, UserRequest request);

	void deleteUser(Long id);
}
