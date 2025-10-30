import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';

// 이 컴포넌트가 부모로부터 받아야 할 정보(Props)의 타입을 정의합니다.
interface PaginationProps {
  currentPage: number; // 현재 활성화된 페이지 번호
  totalItems: number;  // 전체 아이템 개수 (예: 총 학생 수)
  itemsPerPage: number; // 한 페이지에 보여줄 아이템 개수
  onPageChange: (page: number) => void; // 페이지 번호를 클릭했을 때 실행될 함수
}

export const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }: PaginationProps) => {
  // 1. 전체 페이지 수 계산 (소수점은 올림 처리)
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages < 1) {
    return null;
  }

  // 2. 페이지 번호 배열 생성 (예: [1, 2, 3, 4, 5])
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {/* 이전 페이지 버튼 */}
      <Pressable
        onPress={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1} // 첫 페이지일 때 비활성화
        style={[styles.arrowButton, currentPage === 1 && styles.disabledButton]}
      >
        <Text style={styles.buttonText}>&lt;</Text>
      </Pressable>

      {/* 페이지 번호 버튼들 */}
      {pageNumbers.map((pageNumber) => (
        <Pressable
          key={pageNumber}
          onPress={() => onPageChange(pageNumber)}
          style={[
            styles.pageButton,
            currentPage === pageNumber && styles.activePageButton, // 현재 페이지일 때 다른 스타일 적용
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              currentPage === pageNumber && styles.activeButtonText,
            ]}
          >
            {pageNumber}
          </Text>
        </Pressable>
      ))}

      {/* 다음 페이지 버튼 */}
      <Pressable
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages} // 마지막 페이지일 때 비활성화
        style={[styles.arrowButton, currentPage === totalPages && styles.disabledButton]}
      >
        <Text style={styles.buttonText}>&gt;</Text>
      </Pressable>
    </View>
  );
};

// 스타일 (프로젝트 디자인에 맞게 자유롭게 수정하세요)
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  arrowButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activePageButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007bff',
  },
  activeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});