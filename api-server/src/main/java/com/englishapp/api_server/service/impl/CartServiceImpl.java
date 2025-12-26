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
import org.springframework.security.access.AccessDeniedException;
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
    @Transactional
    public void addToCart(User user, CartRequest.Add request) {

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("상품없음" + request.getProductId()));

        Cart existingCart = cartRepository.findByUserIdAndProductId(user.getId(), request.getProductId())
                .orElse(null);

        if (request.getAmount() <= 0 ) {
            throw new IllegalArgumentException("최소 1개 이상 담아야 합니다.");
        } else if (existingCart != null) {
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
    @Override
    @Transactional(readOnly = true)
    public List<CartResponse> getMyCart(User user) {

        List<Cart> carts = cartRepository.findByUserId(user.getId());

        return carts.stream().map(cart -> {
            Image thumbnail = imageRepository
                    .findFirstByTypeAndRelatedIdOrderBySortOrderAsc(ImageType.PRODUCT, cart.getProduct().getId())
                    .orElse(null);

            return CartResponse.from(cart, thumbnail);
        }).collect(Collectors.toList());
    }

    // 수량 변경
    @Override
    @Transactional
    public void updateCartItemAmount(User user, Long cartId, int amount) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new EntityNotFoundException("장바구니 아이템을 못 찼았습니다. " + cartId));

        if (!cart.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("수정 권한이 없습니다.");
        }
        if (amount <= 0) {
            cartRepository.delete(cart);
            return;
        }

        cart.updateAmount(amount);
    }

    // 카트의 상품 삭제
    @Override
    @Transactional
    public void deleteCartItem(User user, Long cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new EntityNotFoundException("장바구니 아이템을 찾을 수 없음: " + cartId));

        if (!cart.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("삭제 권한이 없습니다.");
        }

        cartRepository.delete(cart);
    }
}
