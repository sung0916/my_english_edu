package com.englishapp.api_server.controller;

import com.englishapp.api_server.dto.request.CartRequest;
import com.englishapp.api_server.dto.response.CartResponse;
import com.englishapp.api_server.service.CartService;
import com.englishapp.api_server.service.impl.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // 장바구니 담기
    @PostMapping("/add")
    public ResponseEntity<String> addToCart(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody CartRequest.Add request) {

        cartService.addToCart(userDetails.getUser(), request);
        return ResponseEntity.ok("장바구니에 추가됨");
    }

    // 장바구니 목록 조회
    @GetMapping
    public ResponseEntity<List<CartResponse>> getMyCart(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        List<CartResponse> responses = cartService.getMyCart(userDetails.getUser());
        return ResponseEntity.ok(responses);
    }

    // 수량 변경
    @PatchMapping("/{cartId}")
    public ResponseEntity<String> updateCartAmount(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long cartId,
            @RequestBody CartRequest.Update request) {

        cartService.updateCartItemAmount(userDetails.getUser(), cartId, request.getAmount());
        return ResponseEntity.ok("수량이 변경되었음");
    }

    // 장바구니 삭제
    @DeleteMapping("/{cartId}")
    public ResponseEntity<String> deleteCartItem(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long cartId) {

        cartService.deleteCartItem(userDetails.getUser(), cartId);
        return ResponseEntity.ok("삭제되었습니다.");
    }
}
