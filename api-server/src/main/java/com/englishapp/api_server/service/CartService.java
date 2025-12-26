package com.englishapp.api_server.service;

import com.englishapp.api_server.dto.request.CartRequest;
import com.englishapp.api_server.dto.response.CartResponse;
import com.englishapp.api_server.entity.User;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface CartService {

    void addToCart(User user, CartRequest.Add request);

    List<CartResponse> getMyCart(User user);

    void updateCartItemAmount(User user, Long cartId, int amount);

    void deleteCartItem(User user, Long cartId);
}
