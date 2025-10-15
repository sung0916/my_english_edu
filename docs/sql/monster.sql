show databases;
create database monster;
use monster;
show tables;

CREATE TABLE users (
    user_id    INT          NOT NULL AUTO_INCREMENT COMMENT 'pk',
    email      VARCHAR(255) NOT NULL UNIQUE COMMENT '이메일',
    username   VARCHAR(100) NOT NULL COMMENT '이름',
    login_id   VARCHAR(100) NOT NULL UNIQUE COMMENT '아이디',
    password   VARCHAR(255) NOT NULL COMMENT '비밀번호',
    tel        VARCHAR(20)  NULL COMMENT '전화번호',
    role       VARCHAR(20)  NOT NULL COMMENT '역할 (STUDENT, TEACHER, ADMIN)',
    status     VARCHAR(20)  NOT NULL COMMENT '회원 상태 (ACTIVE, DORMANT, WITHDRAWN)',
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '가입일',
    PRIMARY KEY (user_id)
) COMMENT '사용자';

CREATE TABLE announcements (
    announcement_id INT          NOT NULL AUTO_INCREMENT COMMENT 'pk',
    user_id         INT          NOT NULL COMMENT 'fk, 작성자',
    title           VARCHAR(255) NOT NULL COMMENT '제목',
    content         TEXT         NOT NULL COMMENT '내용',
    view_count      INT          NOT NULL DEFAULT 0 COMMENT '조회수',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '작성일',
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    status          VARCHAR(20)  NOT NULL COMMENT '공지 상태 (PUBLISHED, DRAFT)',
    PRIMARY KEY (announcement_id)
) COMMENT '공지사항';

CREATE TABLE products (
    product_id   INT          NOT NULL AUTO_INCREMENT COMMENT 'pk',
    product_name VARCHAR(255) NOT NULL COMMENT '제품명',
    price        INT          NOT NULL COMMENT '가격',
    amount       INT          NOT NULL DEFAULT -1 COMMENT '제품수량(-1 = 무한)',
    type         VARCHAR(50)  NOT NULL COMMENT '상품 유형(SUBSCRIPTION, ITEM)',
    status       VARCHAR(20)  NOT NULL COMMENT '판매 상태 (FOR_SALE, SOLD_OUT)',
    PRIMARY KEY (product_id)
) COMMENT '제품';

CREATE TABLE subscription_plans (
    plan_id        INT          NOT NULL AUTO_INCREMENT COMMENT 'pk',
    product_id     INT          NOT NULL COMMENT 'fk',
    plan_name      VARCHAR(255) NOT NULL COMMENT '플랜명',
    track_access   VARCHAR(20)  NOT NULL COMMENT '접근 가능한 범위 (SINGLE, ALL)',
    duration_unit  VARCHAR(10)  NOT NULL COMMENT '기간 단위(MONTH, YEAR)',
    duration_value INT          NOT NULL COMMENT '기간(1, 3, 6, 12개월)',
    PRIMARY KEY (plan_id)
) COMMENT '구독 상품 정책';

CREATE TABLE orders (
    order_id    INT         NOT NULL AUTO_INCREMENT COMMENT 'pk',
    user_id     INT         NOT NULL COMMENT 'fk',
    total_price INT         NOT NULL COMMENT '총 결제 금액',
    status      VARCHAR(20) NOT NULL COMMENT '주문 상태(PENDING, COMPLETED, CANCELLED)',
    ordered_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '주문날짜',
    PRIMARY KEY (order_id)
) COMMENT '주문 정보';

CREATE TABLE order_items (
    order_item_id INT NOT NULL AUTO_INCREMENT COMMENT 'pk',
    order_id      INT NOT NULL COMMENT 'fk',
    product_id    INT NOT NULL COMMENT 'fk',
    amount        INT NOT NULL COMMENT '주문 수량',
    order_price   INT NOT NULL COMMENT '상품 가격(주문 당시)',
    PRIMARY KEY (order_item_id)
) COMMENT '주문 상세 내역';

CREATE TABLE payments (
    payment_id  INT          NOT NULL AUTO_INCREMENT COMMENT 'pk',
    order_id    INT          NOT NULL COMMENT 'fk',
    pg_provider VARCHAR(50)  NOT NULL COMMENT '결제사',
    pg_tid      VARCHAR(255) NOT NULL COMMENT '거래 ID',
    status      VARCHAR(20)  NOT NULL COMMENT '결제 상태(COMPLETED, FAILED, CANCELLED)',
    paid_at     DATETIME     NOT NULL COMMENT '결제 날짜',
    PRIMARY KEY (payment_id)
) COMMENT '결제';

CREATE TABLE subscriptions (
    subscription_id INT      NOT NULL AUTO_INCREMENT COMMENT 'pk',
    user_id         INT      NOT NULL COMMENT 'fk, 구매자/생성자 ID',
    plan_id         INT      NOT NULL COMMENT 'fk',
    order_id        INT      NULL COMMENT 'fk, 관리자 지급 시 NULL',
    seat_count      INT      NOT NULL DEFAULT 1 COMMENT '이용권 묶음 내 좌석 수 (개인 구매 시 1)',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    PRIMARY KEY (subscription_id)
) COMMENT '구독 구매/생성 기록';

CREATE TABLE student_licenses (
    license_id      INT         NOT NULL AUTO_INCREMENT COMMENT 'pk',
    student_user_id INT         NOT NULL COMMENT 'fk, 이용권 소유 학생',
    subscription_id INT         NOT NULL COMMENT 'fk, 이용권 출처',
    selected_track  VARCHAR(20) NULL COMMENT '수강 과정(ELEMENTARY, MIDDLE, HIGH), 번들은 NULL',
    start_date      DATETIME    NOT NULL COMMENT '시작일',
    end_date        DATETIME    NOT NULL COMMENT '종료일',
    status          VARCHAR(20) NOT NULL COMMENT '활성화 상태 (ACTIVE, EXPIRED, REVOKED)',
    PRIMARY KEY (license_id)
) COMMENT '학생 최종 이용권';

CREATE TABLE places (
    place_id   INT          NOT NULL AUTO_INCREMENT COMMENT 'pk',
    place_name VARCHAR(255) NOT NULL COMMENT '장소명',
    PRIMARY KEY (place_id)
) COMMENT '장소 (학습 카테고리)';

CREATE TABLE words (
    word_id   INT          NOT NULL AUTO_INCREMENT COMMENT 'pk',
    place_id  INT          NOT NULL COMMENT 'fk',
    content   VARCHAR(255) NOT NULL COMMENT '스펠링',
    meaning   VARCHAR(255) NOT NULL COMMENT '단어 뜻',
    audio_url VARCHAR(255) NULL COMMENT '음성 파일 URL',
    PRIMARY KEY (word_id)
) COMMENT '단어';

CREATE TABLE sentences (
    sentence_id INT          NOT NULL AUTO_INCREMENT COMMENT 'pk',
    place_id    INT          NOT NULL COMMENT 'fk',
    content     VARCHAR(255) NOT NULL COMMENT '영어 문장',
    meaning     VARCHAR(255) NOT NULL COMMENT '문장 뜻',
    audio_url   VARCHAR(255) NULL COMMENT '음성 파일 URL',
    PRIMARY KEY (sentence_id)
) COMMENT '문장';

CREATE TABLE tests (
    test_id   INT          NOT NULL AUTO_INCREMENT COMMENT 'pk',
    test_name VARCHAR(255) NOT NULL COMMENT '테스트명',
    srs       INT          NOT NULL COMMENT '시험주기',
    PRIMARY KEY (test_id)
) COMMENT '테스트 정보';

CREATE TABLE test_results (
    result_id    INT      NOT NULL AUTO_INCREMENT COMMENT 'pk',
    user_id      INT      NOT NULL COMMENT 'fk',
    test_id      INT      NOT NULL COMMENT 'fk',
    score        INT      NOT NULL COMMENT '점수',
    completed_at DATETIME NOT NULL COMMENT '시험 날짜',
    PRIMARY KEY (result_id)
) COMMENT '테스트 결과';

CREATE TABLE games (
    game_id   INT          NOT NULL AUTO_INCREMENT COMMENT 'pk',
    game_name VARCHAR(255) NOT NULL COMMENT '게임이름',
    PRIMARY KEY (game_id)
) COMMENT '게임 정보';

CREATE TABLE game_results (
    result_id INT      NOT NULL AUTO_INCREMENT COMMENT 'pk',
    user_id   INT      NOT NULL COMMENT 'fk',
    game_id   INT      NOT NULL COMMENT 'fk',
    score     INT      NOT NULL COMMENT '점수',
    played_at DATETIME NOT NULL COMMENT '플레이 날짜',
    PRIMARY KEY (result_id)
) COMMENT '게임 결과';

CREATE TABLE cart (
    cart_id    INT NOT NULL AUTO_INCREMENT COMMENT 'pk',
    product_id INT NOT NULL COMMENT 'fk',
    user_id    INT NOT NULL COMMENT 'fk',
    amount     INT NOT NULL COMMENT '제품 수량',
    PRIMARY KEY (cart_id)
) COMMENT '장바구니';

CREATE TABLE images (
    image_id     BIGINT       NOT NULL AUTO_INCREMENT COMMENT 'pk',
    related_type VARCHAR(50)  NOT NULL COMMENT '관련된 데이터의 종류 (USER, PRODUCT 등)',
    related_id   BIGINT       NOT NULL COMMENT '관련된 데이터의 ID',
    image_url    VARCHAR(255) NOT NULL COMMENT '이미지가 저장된 전체 URL',
    file_name    VARCHAR(255) NULL COMMENT '원본 파일 이름',
    file_size    INT          NULL COMMENT '파일 크기(KB 단위)',
    sort_order   INT          NOT NULL DEFAULT 0 COMMENT '여러 이미지일 경우 순서',
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '업로드 날짜',
    PRIMARY KEY (image_id)
) COMMENT '통합 이미지';


-- 외래 키(FK) 제약조건 설정 (오류가 있었던 라인 삭제됨)
ALTER TABLE announcements ADD CONSTRAINT FK_users_TO_announcements FOREIGN KEY (user_id) REFERENCES users (user_id);
ALTER TABLE subscription_plans ADD CONSTRAINT FK_products_TO_subscription_plans FOREIGN KEY (product_id) REFERENCES products (product_id);
ALTER TABLE orders ADD CONSTRAINT FK_users_TO_orders FOREIGN KEY (user_id) REFERENCES users (user_id);
ALTER TABLE order_items ADD CONSTRAINT FK_orders_TO_order_items FOREIGN KEY (order_id) REFERENCES orders (order_id);
ALTER TABLE order_items ADD CONSTRAINT FK_products_TO_order_items FOREIGN KEY (product_id) REFERENCES products (product_id);
ALTER TABLE payments ADD CONSTRAINT FK_orders_TO_payments FOREIGN KEY (order_id) REFERENCES orders (order_id);
ALTER TABLE subscriptions ADD CONSTRAINT FK_users_TO_subscriptions FOREIGN KEY (user_id) REFERENCES users (user_id);
ALTER TABLE subscriptions ADD CONSTRAINT FK_subscription_plans_TO_subscriptions FOREIGN KEY (plan_id) REFERENCES subscription_plans (plan_id);
ALTER TABLE subscriptions ADD CONSTRAINT FK_orders_TO_subscriptions FOREIGN KEY (order_id) REFERENCES orders (order_id);
ALTER TABLE student_licenses ADD CONSTRAINT FK_users_TO_student_licenses FOREIGN KEY (student_user_id) REFERENCES users (user_id);
ALTER TABLE student_licenses ADD CONSTRAINT FK_subscriptions_TO_student_licenses FOREIGN KEY (subscription_id) REFERENCES subscriptions (subscription_id);
ALTER TABLE words ADD CONSTRAINT FK_places_TO_words FOREIGN KEY (place_id) REFERENCES places (place_id);
ALTER TABLE sentences ADD CONSTRAINT FK_places_TO_sentences FOREIGN KEY (place_id) REFERENCES places (place_id);
ALTER TABLE test_results ADD CONSTRAINT FK_users_TO_test_results FOREIGN KEY (user_id) REFERENCES users (user_id);
ALTER TABLE test_results ADD CONSTRAINT FK_tests_TO_test_results FOREIGN KEY (test_id) REFERENCES tests (test_id);
ALTER TABLE game_results ADD CONSTRAINT FK_users_TO_game_results FOREIGN KEY (user_id) REFERENCES users (user_id);
ALTER TABLE game_results ADD CONSTRAINT FK_games_TO_game_results FOREIGN KEY (game_id) REFERENCES games (game_id);
ALTER TABLE cart ADD CONSTRAINT FK_users_TO_cart FOREIGN KEY (user_id) REFERENCES users (user_id);
ALTER TABLE cart ADD CONSTRAINT FK_products_TO_cart FOREIGN KEY (product_id) REFERENCES products (product_id);