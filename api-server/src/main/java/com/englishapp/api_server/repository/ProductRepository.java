package com.englishapp.api_server.repository;

import com.englishapp.api_server.domain.ImageType;
import com.englishapp.api_server.entity.Image;
import com.englishapp.api_server.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

}
