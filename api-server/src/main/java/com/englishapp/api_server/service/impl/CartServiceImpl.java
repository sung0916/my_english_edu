package com.englishapp.api_server.service.impl;

import com.englishapp.api_server.domain.ImageType;
import com.englishapp.api_server.dto.request.CartRequest;
import com.englishapp.api_server.dto.response.CartResponse;
import com.englishapp.api_server.entity.Cart;
import com.englishapp.api_server.entity.Image;
import com.englishapp.api_server.entity.Product;
import com.englishapp.api_server.entity.User;
import com.englishapp.api_server.repository.CartRepository;
import com.englishapp.api_server.repository.ImageRepository;
import com.englishapp.api_server.repository.ProductRepository;
import com.englishapp.api_server.service.CartService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final ImageRepository imageRepository;

    // 장바구니에 담기
    @Override
    public void addToCart(Long userId, CartRequest.Add request, User user) {

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("상품없음"));

        Cart existingCart = cartRepository.findByUserIdAndProductId(userId, request.getProductId())
                .orElse(null);

        if (existingCart != null) {
            existingCart.addAmount(request.getAmount());
        } else {
            Cart newCart = Cart.builder()
                    .user(user)
                    .product(product)
                    .amount(request.getAmount())
                    .build();
            cartRepository.save(newCart);
        }
    }

    // 장바구니 목록 조회
    @Transactional(readOnly = true)
    @Override
    public List<CartResponse> getMyCart(Long userId) {

        List<Cart> carts = cartRepository.findByUserId(userId);

        return carts.stream().map(cart -> {
            Image thumbnail = imageRepository
                    .findFirstByTypeAndRelatedIdOrderBySortOrderAsc(ImageType.PRODUCT, cart.getProduct().getId())
                    .orElse(null);
            CartResponse response = CartResponse.from(cart);
            return response;
        }).collect(Collectors.toList());
    }
}
