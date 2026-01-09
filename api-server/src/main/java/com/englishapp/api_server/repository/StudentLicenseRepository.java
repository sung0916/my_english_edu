package com.englishapp.api_server.repository;

import com.englishapp.api_server.entity.StudentLicense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentLicenseRepository extends JpaRepository<StudentLicense, Long> {

    List<StudentLicense> findByStudentIdOrderByIdDesc(Long id);
}
