package com.englishapp.api_server.service;

import com.englishapp.api_server.dto.request.CartRequest;
import com.englishapp.api_server.dto.response.CartResponse;
import com.englishapp.api_server.entity.User;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface CartService {

    void addToCart(Long userId, CartRequest.Add request, User user);

    List<CartResponse> getMyCart(Long userId);
}
