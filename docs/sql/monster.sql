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
    tel        VARCHAR(20)  NOT NULL COMMENT '전화번호',
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
    product_type         VARCHAR(50)  NOT NULL COMMENT '상품 유형(SUBSCRIPTION, ITEM)',
    product_status       VARCHAR(20)  NOT NULL COMMENT '판매 상태 (FOR_SALE, SOLD_OUT)',
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
    game_id   bigint          NOT NULL AUTO_INCREMENT COMMENT 'pk',
    game_name VARCHAR(255) NOT NULL COMMENT '게임이름',
    PRIMARY KEY (game_id)
) COMMENT '게임 정보';

CREATE TABLE game_scores (
    score_id bigint      NOT NULL AUTO_INCREMENT COMMENT 'pk',
    user_id   INT      NOT NULL COMMENT 'fk',
    game_id   INT      NOT NULL COMMENT 'fk',
    high_score     INT      NOT NULL COMMENT '점수',
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

-- ======================================================================
-- 장소 / 단어 데이터 
-- ======================================================================
INSERT INTO places (place_id, place_name) VALUES 
(1, 'CLASSROOM'),
(2, 'SCHOOL'),
(3, 'HOME'),
(4, 'BEDROOM'),
(5, 'KITCHEN'),
(6, 'BATHROOM'),
(7, 'LIVING ROOM'),
(8, 'SUPERMARKET'),
(9, 'RESTAURANT'),
(10, 'CAFÉ'),
(11, 'PARK'),
(12, 'PLAYGROUND'),
(13, 'STREET'),
(14, 'HOSPITAL'),
(15, 'AIRPORT'),
(16, 'TRAIN STATION'),
(17, 'BUS STATION'),
(18, 'MUSEUM'),
(19, 'LIBRARY'),
(20, 'CINEMA'),
(21, 'ZOO'),
(22, 'FARM'),
(23, 'BEACH'),
(24, 'MOUNTAIN'),
(25, 'FOREST'),
(26, 'RIVER'),
(27, 'LAKE'),
(28, 'DESERT'),
(29, 'SPACE'),
(30, 'WEATHER'),
(31, 'CITY'),
(32, 'VILLAGE'),
(33, 'OFFICE'),
(34, 'FACTORY'),
(35, 'MARKET'),
(36, 'BANK'),
(37, 'POLICE STATION'),
(38, 'FIRE STATION'),
(39, 'POST OFFICE'),
(40, 'HOTEL'),
(41, 'SHOPPING MALL'),
(42, 'AMUSEMENT PARK'),
(43, 'SPORTS FIELD'),
(44, 'GYM'),
(45, 'SWIMMING POOL'),
(46, 'THEATER'),
(47, 'MUSIC ROOM'),
(48, 'ART ROOM'),
(49, 'SCIENCE LAB'),
(50, 'COMPUTER ROOM'),
(51, 'GARDEN'),
(52, 'BAKERY'),
(53, 'PHARMACY'),
(54, 'PET STORE'),
(55, 'STADIUM'),
(56, 'THEME CAFÉ'),
(57, 'CONVENIENCE STORE'),
(58, 'SCIENCE CENTER'),
(59, 'AQUARIUM'),
(60, 'CAMPING SITE');

-- ============================================================

INSERT INTO words (word_id, audio_url, content, meaning, type, place_id) VALUES
(NULL, NULL, 'DESK', '책상', 'WORD', 1), (NULL, NULL, 'CHAIR', '의자', 'WORD', 1), (NULL, NULL, 'TEACHER', '선생님', 'WORD', 1), (NULL, NULL, 'STUDENT', '학생', 'WORD', 1), (NULL, NULL, 'PENCIL', '연필', 'WORD', 1), (NULL, NULL, 'ERASER', '지우개', 'WORD', 1), (NULL, NULL, 'RULER', '자', 'WORD', 1), (NULL, NULL, 'NOTEBOOK', '공책', 'WORD', 1), (NULL, NULL, 'TEXTBOOK', '교과서', 'WORD', 1), (NULL, NULL, 'BLACKBOARD', '칠판', 'WORD', 1), (NULL, NULL, 'MARKER', '마커/매직', 'WORD', 1), (NULL, NULL, 'CRAYON', '크레용', 'WORD', 1), (NULL, NULL, 'GLUE', '풀', 'WORD', 1), (NULL, NULL, 'SCISSORS', '가위', 'WORD', 1), (NULL, NULL, 'BACKPACK', '책가방', 'WORD', 1), (NULL, NULL, 'CLOCK', '시계', 'WORD', 1), (NULL, NULL, 'MAP', '지도', 'WORD', 1), (NULL, NULL, 'POSTER', '포스터', 'WORD', 1), (NULL, NULL, 'COMPUTER', '컴퓨터', 'WORD', 1), (NULL, NULL, 'TABLET', '태블릿', 'WORD', 1), (NULL, NULL, 'SCREEN', '스크린', 'WORD', 1), (NULL, NULL, 'PROJECTOR', '프로젝터', 'WORD', 1), (NULL, NULL, 'WORKSHEET', '학습지', 'WORD', 1), (NULL, NULL, 'PEN', '펜', 'WORD', 1), (NULL, NULL, 'PAPER', '종이', 'WORD', 1),
(NULL, NULL, 'PRINCIPAL', '교장 선생님', 'WORD', 2), (NULL, NULL, 'HALLWAY', '복도', 'WORD', 2), (NULL, NULL, 'CLASSROOM', '교실', 'WORD', 2), (NULL, NULL, 'LIBRARY', '도서관', 'WORD', 2), (NULL, NULL, 'GYM', '체육관', 'WORD', 2), (NULL, NULL, 'CAFETERIA', '급식실', 'WORD', 2), (NULL, NULL, 'PLAYGROUND', '운동장', 'WORD', 2), (NULL, NULL, 'STAIRS', '계단', 'WORD', 2), (NULL, NULL, 'LOCKER', '사물함', 'WORD', 2), (NULL, NULL, 'NURSE', '보건 선생님', 'WORD', 2), (NULL, NULL, 'OFFICE', '교무실', 'WORD', 2), (NULL, NULL, 'BELL', '종', 'WORD', 2), (NULL, NULL, 'ASSEMBLY', '조회/모임', 'WORD', 2), (NULL, NULL, 'SUBJECT', '과목', 'WORD', 2), (NULL, NULL, 'SCHEDULE', '시간표', 'WORD', 2), (NULL, NULL, 'UNIFORM', '교복', 'WORD', 2), (NULL, NULL, 'RECESS', '쉬는 시간', 'WORD', 2), (NULL, NULL, 'HOMEWORK', '숙제', 'WORD', 2), (NULL, NULL, 'EXAM', '시험', 'WORD', 2), (NULL, NULL, 'GRADE', '성적/학년', 'WORD', 2), (NULL, NULL, 'CLUB', '동아리', 'WORD', 2), (NULL, NULL, 'SCIENCE LAB', '과학실', 'WORD', 2), (NULL, NULL, 'MUSIC ROOM', '음악실', 'WORD', 2), (NULL, NULL, 'ART ROOM', '미술실', 'WORD', 2), (NULL, NULL, 'AUDITORIUM', '강당', 'WORD', 2),
(NULL, NULL, 'SOFA', '소파', 'WORD', 3), (NULL, NULL, 'TABLE', '탁자', 'WORD', 3), (NULL, NULL, 'LAMP', '램프/전등', 'WORD', 3), (NULL, NULL, 'CURTAIN', '커튼', 'WORD', 3), (NULL, NULL, 'PILLOW', '베개', 'WORD', 3), (NULL, NULL, 'BLANKET', '담요', 'WORD', 3), (NULL, NULL, 'SHELF', '선반', 'WORD', 3), (NULL, NULL, 'MIRROR', '거울', 'WORD', 3), (NULL, NULL, 'CARPET', '카펫', 'WORD', 3), (NULL, NULL, 'STAIRS', '계단', 'WORD', 3), (NULL, NULL, 'DOOR', '문', 'WORD', 3), (NULL, NULL, 'WINDOW', '창문', 'WORD', 3), (NULL, NULL, 'REMOTE', '리모컨', 'WORD', 3), (NULL, NULL, 'CHARGER', '충전기', 'WORD', 3), (NULL, NULL, 'BATTERY', '건전지', 'WORD', 3), (NULL, NULL, 'BASKET', '바구니', 'WORD', 3), (NULL, NULL, 'SWITCH', '스위치', 'WORD', 3), (NULL, NULL, 'CLOSET', '벽장/옷장', 'WORD', 3), (NULL, NULL, 'HANGER', '옷걸이', 'WORD', 3), (NULL, NULL, 'CLOCK', '시계', 'WORD', 3), (NULL, NULL, 'FRAME', '액자', 'WORD', 3), (NULL, NULL, 'CUSHION', '쿠션', 'WORD', 3), (NULL, NULL, 'PLANT', '화분', 'WORD', 3), (NULL, NULL, 'DRAWER', '서랍', 'WORD', 3), (NULL, NULL, 'FAN', '선풍기', 'WORD', 3),
(NULL, NULL, 'BED', '침대', 'WORD', 4), (NULL, NULL, 'PILLOWCASE', '베개 커버', 'WORD', 4), (NULL, NULL, 'BLANKET', '이불', 'WORD', 4), (NULL, NULL, 'MATTRESS', '매트리스', 'WORD', 4), (NULL, NULL, 'NIGHTSTAND', '침대 협탁', 'WORD', 4), (NULL, NULL, 'ALARM CLOCK', '알람 시계', 'WORD', 4), (NULL, NULL, 'LAMP', '스탠드', 'WORD', 4), (NULL, NULL, 'DRAWER', '서랍장', 'WORD', 4), (NULL, NULL, 'CLOSET', '옷장', 'WORD', 4), (NULL, NULL, 'HANGER', '옷걸이', 'WORD', 4), (NULL, NULL, 'MIRROR', '거울', 'WORD', 4), (NULL, NULL, 'CURTAIN', '커튼', 'WORD', 4), (NULL, NULL, 'CARPET', '러그/카펫', 'WORD', 4), (NULL, NULL, 'SLIPPERS', '실내화', 'WORD', 4), (NULL, NULL, 'PAJAMAS', '잠옷', 'WORD', 4), (NULL, NULL, 'SHELF', '선반', 'WORD', 4), (NULL, NULL, 'PILLOW', '베개', 'WORD', 4), (NULL, NULL, 'LAUNDRY BASKET', '빨래 바구니', 'WORD', 4), (NULL, NULL, 'PLUG', '플러그/콘센트', 'WORD', 4), (NULL, NULL, 'CHARGER', '충전기', 'WORD', 4), (NULL, NULL, 'TOY', '장난감', 'WORD', 4), (NULL, NULL, 'DOLL', '인형', 'WORD', 4), (NULL, NULL, 'STUDY DESK', '공부 책상', 'WORD', 4), (NULL, NULL, 'NOTEBOOK', '공책', 'WORD', 4), (NULL, NULL, 'LAMP SWITCH', '전등 스위치', 'WORD', 4),
(NULL, NULL, 'SPOON', '숟가락', 'WORD', 5), (NULL, NULL, 'FORK', '포크', 'WORD', 5), (NULL, NULL, 'KNIFE', '칼/나이프', 'WORD', 5), (NULL, NULL, 'PLATE', '접시', 'WORD', 5), (NULL, NULL, 'BOWL', '그릇/사발', 'WORD', 5), (NULL, NULL, 'CUP', '컵', 'WORD', 5), (NULL, NULL, 'MUG', '머그잔', 'WORD', 5), (NULL, NULL, 'STOVE', '가스레인지', 'WORD', 5), (NULL, NULL, 'OVEN', '오븐', 'WORD', 5), (NULL, NULL, 'MICROWAVE', '전자레인지', 'WORD', 5), (NULL, NULL, 'FRIDGE', '냉장고', 'WORD', 5), (NULL, NULL, 'FREEZER', '냉동고', 'WORD', 5), (NULL, NULL, 'SINK', '싱크대', 'WORD', 5), (NULL, NULL, 'FAUCET', '수도꼭지', 'WORD', 5), (NULL, NULL, 'CUTTING BOARD', '도마', 'WORD', 5), (NULL, NULL, 'PAN', '프라이팬', 'WORD', 5), (NULL, NULL, 'POT', '냄비', 'WORD', 5), (NULL, NULL, 'KETTLE', '주전자', 'WORD', 5), (NULL, NULL, 'TOASTER', '토스터', 'WORD', 5), (NULL, NULL, 'DISH SOAP', '주방 세제', 'WORD', 5), (NULL, NULL, 'SPONGE', '수세미', 'WORD', 5), (NULL, NULL, 'NAPKIN', '냅킨', 'WORD', 5), (NULL, NULL, 'TOWEL', '행주', 'WORD', 5), (NULL, NULL, 'TRASH CAN', '쓰레기통', 'WORD', 5), (NULL, NULL, 'RECIPE', '요리법', 'WORD', 5);

-- 6. BATHROOM ~ 10. CAFÉ
INSERT INTO words (word_id, audio_url, content, meaning, type, place_id) VALUES
(NULL, NULL, 'TOOTHBRUSH', '칫솔', 'WORD', 6), (NULL, NULL, 'TOOTHPASTE', '치약', 'WORD', 6), (NULL, NULL, 'SHAMPOO', '샴푸', 'WORD', 6), (NULL, NULL, 'SOAP', '비누', 'WORD', 6), (NULL, NULL, 'TOWEL', '수건', 'WORD', 6), (NULL, NULL, 'HAIRDRYER', '헤어 드라이어', 'WORD', 6), (NULL, NULL, 'MIRROR', '거울', 'WORD', 6), (NULL, NULL, 'SINK', '세면대', 'WORD', 6), (NULL, NULL, 'FAUCET', '수도꼭지', 'WORD', 6), (NULL, NULL, 'TOILET', '변기', 'WORD', 6), (NULL, NULL, 'SHOWER', '샤워기', 'WORD', 6), (NULL, NULL, 'BATHTUB', '욕조', 'WORD', 6), (NULL, NULL, 'TISSUE', '휴지', 'WORD', 6), (NULL, NULL, 'BRUSH', '솔', 'WORD', 6), (NULL, NULL, 'COMB', '빗', 'WORD', 6), (NULL, NULL, 'LOTION', '로션', 'WORD', 6), (NULL, NULL, 'DRAIN', '배수구', 'WORD', 6), (NULL, NULL, 'HANGER', '수건걸이', 'WORD', 6), (NULL, NULL, 'BASKET', '바구니', 'WORD', 6), (NULL, NULL, 'CLEANING SPRAY', '청소 스프레이', 'WORD', 6), (NULL, NULL, 'TOOTHPASTE CAP', '치약 뚜껑', 'WORD', 6), (NULL, NULL, 'RAZOR', '면도기', 'WORD', 6), (NULL, NULL, 'CUP', '양치 컵', 'WORD', 6), (NULL, NULL, 'SHELF', '선반', 'WORD', 6), (NULL, NULL, 'MAT', '발매트', 'WORD', 6),
(NULL, NULL, 'TV', 'TV', 'WORD', 7), (NULL, NULL, 'REMOTE', '리모컨', 'WORD', 7), (NULL, NULL, 'SOFA', '소파', 'WORD', 7), (NULL, NULL, 'CUSHION', '쿠션', 'WORD', 7), (NULL, NULL, 'LAMP', '조명', 'WORD', 7), (NULL, NULL, 'CURTAIN', '커튼', 'WORD', 7), (NULL, NULL, 'PLANT', '화분', 'WORD', 7), (NULL, NULL, 'CARPET', '카펫', 'WORD', 7), (NULL, NULL, 'FRAME', '액자', 'WORD', 7), (NULL, NULL, 'SPEAKER', '스피커', 'WORD', 7), (NULL, NULL, 'SHELF', '선반', 'WORD', 7), (NULL, NULL, 'WINDOW', '창문', 'WORD', 7), (NULL, NULL, 'DOOR', '문', 'WORD', 7), (NULL, NULL, 'COFFEE TABLE', '거실 탁자', 'WORD', 7), (NULL, NULL, 'RUG', '러그', 'WORD', 7), (NULL, NULL, 'MAGAZINE', '잡지', 'WORD', 7), (NULL, NULL, 'CHARGER', '충전기', 'WORD', 7), (NULL, NULL, 'PLUG', '플러그', 'WORD', 7), (NULL, NULL, 'LIGHT SWITCH', '전등 스위치', 'WORD', 7), (NULL, NULL, 'CLOCK', '시계', 'WORD', 7), (NULL, NULL, 'CANDLE', '양초', 'WORD', 7), (NULL, NULL, 'PICTURE', '그림/사진', 'WORD', 7), (NULL, NULL, 'AIR PURIFIER', '공기청정기', 'WORD', 7), (NULL, NULL, 'FAN', '선풍기', 'WORD', 7), (NULL, NULL, 'CALENDAR', '달력', 'WORD', 7),
(NULL, NULL, 'CART', '카트', 'WORD', 8), (NULL, NULL, 'BASKET', '장바구니', 'WORD', 8), (NULL, NULL, 'CASHIER', '계산원', 'WORD', 8), (NULL, NULL, 'RECEIPT', '영수증', 'WORD', 8), (NULL, NULL, 'DISCOUNT', '할인', 'WORD', 8), (NULL, NULL, 'SHELF', '진열대', 'WORD', 8), (NULL, NULL, 'AISLE', '통로', 'WORD', 8), (NULL, NULL, 'CHECKOUT', '계산대', 'WORD', 8), (NULL, NULL, 'PRICE TAG', '가격표', 'WORD', 8), (NULL, NULL, 'BARCODE', '바코드', 'WORD', 8), (NULL, NULL, 'DAIRY', '유제품', 'WORD', 8), (NULL, NULL, 'SNACKS', '과자류', 'WORD', 8), (NULL, NULL, 'PRODUCE', '농산물', 'WORD', 8), (NULL, NULL, 'FRUIT', '과일', 'WORD', 8), (NULL, NULL, 'VEGETABLES', '채소', 'WORD', 8), (NULL, NULL, 'MEAT', '고기', 'WORD', 8), (NULL, NULL, 'SEAFOOD', '해산물', 'WORD', 8), (NULL, NULL, 'CEREAL', '시리얼', 'WORD', 8), (NULL, NULL, 'JUICE', '주스', 'WORD', 8), (NULL, NULL, 'BOTTLE', '병', 'WORD', 8), (NULL, NULL, 'CAN', '캔', 'WORD', 8), (NULL, NULL, 'BAG', '봉투', 'WORD', 8), (NULL, NULL, 'FREEZER', '냉동고', 'WORD', 8), (NULL, NULL, 'CUSTOMER', '손님', 'WORD', 8), (NULL, NULL, 'LINE', '줄', 'WORD', 8),
(NULL, NULL, 'MENU', '메뉴', 'WORD', 9), (NULL, NULL, 'WAITER', '웨이터', 'WORD', 9), (NULL, NULL, 'WAITRESS', '웨이트리스', 'WORD', 9), (NULL, NULL, 'ORDER', '주문', 'WORD', 9), (NULL, NULL, 'BILL', '계산서', 'WORD', 9), (NULL, NULL, 'PLATE', '접시', 'WORD', 9), (NULL, NULL, 'NAPKIN', '냅킨', 'WORD', 9), (NULL, NULL, 'FORK', '포크', 'WORD', 9), (NULL, NULL, 'KNIFE', '나이프', 'WORD', 9), (NULL, NULL, 'SPOON', '숟가락', 'WORD', 9), (NULL, NULL, 'STRAW', '빨대', 'WORD', 9), (NULL, NULL, 'CUP', '컵', 'WORD', 9), (NULL, NULL, 'DISH', '요리', 'WORD', 9), (NULL, NULL, 'SOUP', '수프/국', 'WORD', 9), (NULL, NULL, 'SALAD', '샐러드', 'WORD', 9), (NULL, NULL, 'DESSERT', '디저트', 'WORD', 9), (NULL, NULL, 'MAIN DISH', '메인 요리', 'WORD', 9), (NULL, NULL, 'SIDE DISH', '반찬', 'WORD', 9), (NULL, NULL, 'TIP', '팁', 'WORD', 9), (NULL, NULL, 'RESERVATION', '예약', 'WORD', 9), (NULL, NULL, 'TABLE', '테이블', 'WORD', 9), (NULL, NULL, 'CHAIR', '의자', 'WORD', 9), (NULL, NULL, 'SEASONING', '양념', 'WORD', 9), (NULL, NULL, 'SAUCE', '소스', 'WORD', 9), (NULL, NULL, 'RECIPE', '조리법', 'WORD', 9),
(NULL, NULL, 'BARISTA', '바리스타', 'WORD', 10), (NULL, NULL, 'LATTE', '라떼', 'WORD', 10), (NULL, NULL, 'ESPRESSO', '에스프레소', 'WORD', 10), (NULL, NULL, 'CAPPUCCINO', '카푸치노', 'WORD', 10), (NULL, NULL, 'MILK FOAM', '우유 거품', 'WORD', 10), (NULL, NULL, 'CUP', '컵', 'WORD', 10), (NULL, NULL, 'MUG', '머그잔', 'WORD', 10), (NULL, NULL, 'STRAW', '빨대', 'WORD', 10), (NULL, NULL, 'ICE', '얼음', 'WORD', 10), (NULL, NULL, 'SYRUP', '시럽', 'WORD', 10), (NULL, NULL, 'PASTRY', '페이스트리/빵', 'WORD', 10), (NULL, NULL, 'COOKIE', '쿠키', 'WORD', 10), (NULL, NULL, 'CAKE', '케이크', 'WORD', 10), (NULL, NULL, 'SANDWICH', '샌드위치', 'WORD', 10), (NULL, NULL, 'COUNTER', '카운터', 'WORD', 10), (NULL, NULL, 'MENU BOARD', '메뉴판', 'WORD', 10), (NULL, NULL, 'ORDER NUMBER', '주문 번호', 'WORD', 10), (NULL, NULL, 'NAPKIN', '냅킨', 'WORD', 10), (NULL, NULL, 'TRAY', '쟁반', 'WORD', 10), (NULL, NULL, 'BLENDER', '블렌더/믹서', 'WORD', 10), (NULL, NULL, 'WHIPPED CREAM', '휘핑 크림', 'WORD', 10), (NULL, NULL, 'TEA', '차', 'WORD', 10), (NULL, NULL, 'CHOCOLATE', '초콜릿', 'WORD', 10), (NULL, NULL, 'RECEIPT', '영수증', 'WORD', 10), (NULL, NULL, 'CUSTOMER', '손님', 'WORD', 10);

-- 11. PARK ~ 15. AIRPORT
INSERT INTO words (word_id, audio_url, content, meaning, type, place_id) VALUES
(NULL, NULL, 'BENCH', '벤치', 'WORD', 11), (NULL, NULL, 'SWING', '그네', 'WORD', 11), (NULL, NULL, 'SLIDE', '미끄럼틀', 'WORD', 11), (NULL, NULL, 'SANDBOX', '모래사장', 'WORD', 11), (NULL, NULL, 'GRASS', '잔디', 'WORD', 11), (NULL, NULL, 'TREE', '나무', 'WORD', 11), (NULL, NULL, 'FLOWER', '꽃', 'WORD', 11), (NULL, NULL, 'LEAF', '나뭇잎', 'WORD', 11), (NULL, NULL, 'BIRD', '새', 'WORD', 11), (NULL, NULL, 'SQUIRREL', '다람쥐', 'WORD', 11), (NULL, NULL, 'POND', '연못', 'WORD', 11), (NULL, NULL, 'DUCK', '오리', 'WORD', 11), (NULL, NULL, 'PATH', '산책로/길', 'WORD', 11), (NULL, NULL, 'FOUNTAIN', '분수', 'WORD', 11), (NULL, NULL, 'BICYCLE', '자전거', 'WORD', 11), (NULL, NULL, 'SCOOTER', '킥보드/스쿠터', 'WORD', 11), (NULL, NULL, 'JOGGER', '조깅하는 사람', 'WORD', 11), (NULL, NULL, 'STROLLER', '유모차', 'WORD', 11), (NULL, NULL, 'PICNIC', '소풍', 'WORD', 11), (NULL, NULL, 'TRASH CAN', '쓰레기통', 'WORD', 11), (NULL, NULL, 'SHADE', '그늘', 'WORD', 11), (NULL, NULL, 'CLOUD', '구름', 'WORD', 11), (NULL, NULL, 'WIND', '바람', 'WORD', 11), (NULL, NULL, 'KITE', '연', 'WORD', 11), (NULL, NULL, 'PLAYGROUND', '놀이터', 'WORD', 11),
(NULL, NULL, 'MONKEY BARS', '구름사다리', 'WORD', 12), (NULL, NULL, 'SLIDE', '미끄럼틀', 'WORD', 12), (NULL, NULL, 'SWING', '그네', 'WORD', 12), (NULL, NULL, 'LADDER', '사다리', 'WORD', 12), (NULL, NULL, 'ROPE', '밧줄', 'WORD', 12), (NULL, NULL, 'SAND', '모래', 'WORD', 12), (NULL, NULL, 'SEESAW', '시소', 'WORD', 12), (NULL, NULL, 'WHISTLE', '호루라기', 'WORD', 12), (NULL, NULL, 'BALL', '공', 'WORD', 12), (NULL, NULL, 'TAG', '술래잡기', 'WORD', 12), (NULL, NULL, 'HOPSCOTCH', '사방치기', 'WORD', 12), (NULL, NULL, 'RUNNING', '달리기', 'WORD', 12), (NULL, NULL, 'CLIMBING', '오르기', 'WORD', 12), (NULL, NULL, 'SAFETY PAD', '안전 매트', 'WORD', 12), (NULL, NULL, 'BENCH', '벤치', 'WORD', 12), (NULL, NULL, 'FENCE', '울타리', 'WORD', 12), (NULL, NULL, 'SHADE', '그늘', 'WORD', 12), (NULL, NULL, 'WATER FOUNTAIN', '식수대', 'WORD', 12), (NULL, NULL, 'SNEAKERS', '운동화', 'WORD', 12), (NULL, NULL, 'BACKPACK', '가방', 'WORD', 12), (NULL, NULL, 'JUMP ROPE', '줄넘기', 'WORD', 12), (NULL, NULL, 'HELMET', '헬멧', 'WORD', 12), (NULL, NULL, 'SKATING', '스케이트 타기', 'WORD', 12), (NULL, NULL, 'RAMP', '경사로', 'WORD', 12), (NULL, NULL, 'BALANCE BAR', '평균대', 'WORD', 12),
(NULL, NULL, 'CROSSWALK', '횡단보도', 'WORD', 13), (NULL, NULL, 'TRAFFIC LIGHT', '신호등', 'WORD', 13), (NULL, NULL, 'SIDEWALK', '인도', 'WORD', 13), (NULL, NULL, 'SIGN', '표지판', 'WORD', 13), (NULL, NULL, 'BUILDING', '건물', 'WORD', 13), (NULL, NULL, 'BUS STOP', '버스 정류장', 'WORD', 13), (NULL, NULL, 'TAXI', '택시', 'WORD', 13), (NULL, NULL, 'CAR', '자동차', 'WORD', 13), (NULL, NULL, 'TRUCK', '트럭', 'WORD', 13), (NULL, NULL, 'SCOOTER', '스쿠터', 'WORD', 13), (NULL, NULL, 'BICYCLE', '자전거', 'WORD', 13), (NULL, NULL, 'ROAD', '도로', 'WORD', 13), (NULL, NULL, 'LANE', '차선', 'WORD', 13), (NULL, NULL, 'BRIDGE', '다리', 'WORD', 13), (NULL, NULL, 'TUNNEL', '터널', 'WORD', 13), (NULL, NULL, 'ENTRANCE', '입구', 'WORD', 13), (NULL, NULL, 'EXIT', '출구', 'WORD', 13), (NULL, NULL, 'MAP', '지도', 'WORD', 13), (NULL, NULL, 'CORNER', '모퉁이', 'WORD', 13), (NULL, NULL, 'TRASH CAN', '쓰레기통', 'WORD', 13), (NULL, NULL, 'STREETLIGHT', '가로등', 'WORD', 13), (NULL, NULL, 'MAILBOX', '우체통', 'WORD', 13), (NULL, NULL, 'SHOP', '가게', 'WORD', 13), (NULL, NULL, 'KIOSK', '매점/키오스크', 'WORD', 13), (NULL, NULL, 'DRIVER', '운전자', 'WORD', 13),
(NULL, NULL, 'DOCTOR', '의사', 'WORD', 14), (NULL, NULL, 'NURSE', '간호사', 'WORD', 14), (NULL, NULL, 'PATIENT', '환자', 'WORD', 14), (NULL, NULL, 'WAITING ROOM', '대기실', 'WORD', 14), (NULL, NULL, 'CLINIC', '진료소', 'WORD', 14), (NULL, NULL, 'EMERGENCY', '응급실', 'WORD', 14), (NULL, NULL, 'AMBULANCE', '구급차', 'WORD', 14), (NULL, NULL, 'THERMOMETER', '체온계', 'WORD', 14), (NULL, NULL, 'MEDICINE', '약', 'WORD', 14), (NULL, NULL, 'PILL', '알약', 'WORD', 14), (NULL, NULL, 'INJECTION', '주사', 'WORD', 14), (NULL, NULL, 'BANDAGE', '붕대/반창고', 'WORD', 14), (NULL, NULL, 'CAST', '깁스', 'WORD', 14), (NULL, NULL, 'X-RAY', '엑스레이', 'WORD', 14), (NULL, NULL, 'CHECKUP', '건강검진', 'WORD', 14), (NULL, NULL, 'STETHOSCOPE', '청진기', 'WORD', 14), (NULL, NULL, 'BLOOD PRESSURE', '혈압', 'WORD', 14), (NULL, NULL, 'MASK', '마스크', 'WORD', 14), (NULL, NULL, 'GLOVES', '장갑', 'WORD', 14), (NULL, NULL, 'OPERATION', '수술', 'WORD', 14), (NULL, NULL, 'HEALTH', '건강', 'WORD', 14), (NULL, NULL, 'APPOINTMENT', '예약', 'WORD', 14), (NULL, NULL, 'SYMPTOMS', '증상', 'WORD', 14), (NULL, NULL, 'TREATMENT', '치료', 'WORD', 14), (NULL, NULL, 'PHARMACY', '약국', 'WORD', 14),
(NULL, NULL, 'PASSPORT', '여권', 'WORD', 15), (NULL, NULL, 'TICKET', '티켓', 'WORD', 15), (NULL, NULL, 'BOARDING PASS', '탑승권', 'WORD', 15), (NULL, NULL, 'GATE', '탑승구', 'WORD', 15), (NULL, NULL, 'TERMINAL', '터미널', 'WORD', 15), (NULL, NULL, 'AIRPLANE', '비행기', 'WORD', 15), (NULL, NULL, 'PILOT', '조종사', 'WORD', 15), (NULL, NULL, 'FLIGHT ATTENDANT', '승무원', 'WORD', 15), (NULL, NULL, 'SEATBELT', '안전벨트', 'WORD', 15), (NULL, NULL, 'LUGGAGE', '짐/수하물', 'WORD', 15), (NULL, NULL, 'CARRY-ON', '기내 수하물', 'WORD', 15), (NULL, NULL, 'CHECK-IN', '체크인', 'WORD', 15), (NULL, NULL, 'SECURITY', '보안 검색', 'WORD', 15), (NULL, NULL, 'CUSTOMS', '세관', 'WORD', 15), (NULL, NULL, 'ANNOUNCEMENT', '안내 방송', 'WORD', 15), (NULL, NULL, 'BOARDING', '탑승', 'WORD', 15), (NULL, NULL, 'DELAY', '지연', 'WORD', 15), (NULL, NULL, 'ARRIVAL', '도착', 'WORD', 15), (NULL, NULL, 'DEPARTURE', '출발', 'WORD', 15), (NULL, NULL, 'RUNWAY', '활주로', 'WORD', 15), (NULL, NULL, 'BAGGAGE CLAIM', '수하물 찾는 곳', 'WORD', 15), (NULL, NULL, 'LINE', '줄', 'WORD', 15), (NULL, NULL, 'VISA', '비자', 'WORD', 15), (NULL, NULL, 'TRAVEL', '여행', 'WORD', 15), (NULL, NULL, 'DUTY-FREE', '면세점', 'WORD', 15);

-- 16. TRAIN STATION ~ 20. CINEMA
INSERT INTO words (word_id, audio_url, content, meaning, type, place_id) VALUES
(NULL, NULL, 'PLATFORM', '승강장', 'WORD', 16), (NULL, NULL, 'SCHEDULE', '시간표', 'WORD', 16), (NULL, NULL, 'TICKET', '표', 'WORD', 16), (NULL, NULL, 'MACHINE', '발권기', 'WORD', 16), (NULL, NULL, 'GATE', '개찰구', 'WORD', 16), (NULL, NULL, 'TRACK', '선로', 'WORD', 16), (NULL, NULL, 'CONDUCTOR', '차장', 'WORD', 16), (NULL, NULL, 'PASSENGER', '승객', 'WORD', 16), (NULL, NULL, 'SEAT', '좌석', 'WORD', 16), (NULL, NULL, 'LUGGAGE', '짐', 'WORD', 16), (NULL, NULL, 'MAP', '노선도', 'WORD', 16), (NULL, NULL, 'LINE', '호선', 'WORD', 16), (NULL, NULL, 'TRANSFER', '환승', 'WORD', 16), (NULL, NULL, 'EXPRESS', '급행열차', 'WORD', 16), (NULL, NULL, 'LOCAL TRAIN', '완행열차', 'WORD', 16), (NULL, NULL, 'TIMETABLE', '시간표', 'WORD', 16), (NULL, NULL, 'WAITING ROOM', '대합실', 'WORD', 16), (NULL, NULL, 'KIOSK', '매점', 'WORD', 16), (NULL, NULL, 'ESCALATOR', '에스컬레이터', 'WORD', 16), (NULL, NULL, 'STAIRS', '계단', 'WORD', 16), (NULL, NULL, 'TUNNEL', '터널', 'WORD', 16), (NULL, NULL, 'SPEAKER', '스피커', 'WORD', 16), (NULL, NULL, 'ANNOUNCEMENT', '안내 방송', 'WORD', 16), (NULL, NULL, 'FARE', '요금', 'WORD', 16), (NULL, NULL, 'CARD', '교통카드', 'WORD', 16),
(NULL, NULL, 'BUS STOP', '버스 정류장', 'WORD', 17), (NULL, NULL, 'ROUTE', '노선', 'WORD', 17), (NULL, NULL, 'DRIVER', '운전기사', 'WORD', 17), (NULL, NULL, 'PASSENGER', '승객', 'WORD', 17), (NULL, NULL, 'FARE', '요금', 'WORD', 17), (NULL, NULL, 'CARD', '교통카드', 'WORD', 17), (NULL, NULL, 'LINE', '줄', 'WORD', 17), (NULL, NULL, 'SCHEDULE', '배차 시간표', 'WORD', 17), (NULL, NULL, 'BENCH', '벤치', 'WORD', 17), (NULL, NULL, 'ROOF', '지붕', 'WORD', 17), (NULL, NULL, 'SHELTER', '승차대', 'WORD', 17), (NULL, NULL, 'SIGN', '표지판', 'WORD', 17), (NULL, NULL, 'ROAD', '도로', 'WORD', 17), (NULL, NULL, 'TRAFFIC', '교통', 'WORD', 17), (NULL, NULL, 'SEAT', '좌석', 'WORD', 17), (NULL, NULL, 'STANDING AREA', '입석 구역', 'WORD', 17), (NULL, NULL, 'BACKPACK', '배낭', 'WORD', 17), (NULL, NULL, 'MAP', '지도', 'WORD', 17), (NULL, NULL, 'TRANSFER', '환승', 'WORD', 17), (NULL, NULL, 'ARRIVAL', '도착', 'WORD', 17), (NULL, NULL, 'DEPARTURE', '출발', 'WORD', 17), (NULL, NULL, 'BELL', '하차 벨', 'WORD', 17), (NULL, NULL, 'HANDRAIL', '손잡이', 'WORD', 17), (NULL, NULL, 'WINDOW', '창문', 'WORD', 17), (NULL, NULL, 'MIRROR', '거울', 'WORD', 17),
(NULL, NULL, 'GALLERY', '전시실', 'WORD', 18), (NULL, NULL, 'EXHIBIT', '전시품', 'WORD', 18), (NULL, NULL, 'PAINTING', '회화/그림', 'WORD', 18), (NULL, NULL, 'SCULPTURE', '조각', 'WORD', 18), (NULL, NULL, 'ARTIFACT', '유물', 'WORD', 18), (NULL, NULL, 'STATUE', '동상', 'WORD', 18), (NULL, NULL, 'GUIDE', '가이드', 'WORD', 18), (NULL, NULL, 'TICKET', '입장권', 'WORD', 18), (NULL, NULL, 'BROCHURE', '안내 책자', 'WORD', 18), (NULL, NULL, 'AUDIO GUIDE', '오디오 가이드', 'WORD', 18), (NULL, NULL, 'HISTORY', '역사', 'WORD', 18), (NULL, NULL, 'CULTURE', '문화', 'WORD', 18), (NULL, NULL, 'ANCIENT', '고대의', 'WORD', 18), (NULL, NULL, 'MODERN ART', '현대 미술', 'WORD', 18), (NULL, NULL, 'FRAME', '액자', 'WORD', 18), (NULL, NULL, 'DISPLAY', '진열', 'WORD', 18), (NULL, NULL, 'INFORMATION BOARD', '안내판', 'WORD', 18), (NULL, NULL, 'CURATOR', '큐레이터', 'WORD', 18), (NULL, NULL, 'SOUVENIR', '기념품', 'WORD', 18), (NULL, NULL, 'SHOP', '가게', 'WORD', 18), (NULL, NULL, 'ENTRANCE', '입구', 'WORD', 18), (NULL, NULL, 'EXIT', '출구', 'WORD', 18), (NULL, NULL, 'COLLECTION', '소장품', 'WORD', 18), (NULL, NULL, 'SPOTLIGHT', '조명', 'WORD', 18), (NULL, NULL, 'BENCH', '벤치', 'WORD', 18),
(NULL, NULL, 'BOOKSHELF', '책장', 'WORD', 19), (NULL, NULL, 'NOVEL', '소설', 'WORD', 19), (NULL, NULL, 'COMIC', '만화책', 'WORD', 19), (NULL, NULL, 'MAGAZINE', '잡지', 'WORD', 19), (NULL, NULL, 'DICTIONARY', '사전', 'WORD', 19), (NULL, NULL, 'LIBRARIAN', '사서', 'WORD', 19), (NULL, NULL, 'QUIET SIGN', '정숙 표지판', 'WORD', 19), (NULL, NULL, 'STUDY ROOM', '열람실', 'WORD', 19), (NULL, NULL, 'DESK', '책상', 'WORD', 19), (NULL, NULL, 'CHAIR', '의자', 'WORD', 19), (NULL, NULL, 'COMPUTER', '컴퓨터', 'WORD', 19), (NULL, NULL, 'CATALOG', '목록', 'WORD', 19), (NULL, NULL, 'BOOKMARK', '책갈피', 'WORD', 19), (NULL, NULL, 'RETURN BOX', '반납함', 'WORD', 19), (NULL, NULL, 'LOAN PERIOD', '대출 기간', 'WORD', 19), (NULL, NULL, 'OVERDUE', '연체', 'WORD', 19), (NULL, NULL, 'LIBRARY CARD', '도서관 회원증', 'WORD', 19), (NULL, NULL, 'PRINTER', '프린터', 'WORD', 19), (NULL, NULL, 'COPY MACHINE', '복사기', 'WORD', 19), (NULL, NULL, 'LAMP', '스탠드', 'WORD', 19), (NULL, NULL, 'AISLE', '통로', 'WORD', 19), (NULL, NULL, 'CHAPTER', '장/챕터', 'WORD', 19), (NULL, NULL, 'COVER', '표지', 'WORD', 19), (NULL, NULL, 'INDEX', '색인', 'WORD', 19), (NULL, NULL, 'PAGE', '페이지', 'WORD', 19),
(NULL, NULL, 'SCREEN', '스크린', 'WORD', 20), (NULL, NULL, 'POPCORN', '팝콘', 'WORD', 20), (NULL, NULL, 'TICKET', '티켓', 'WORD', 20), (NULL, NULL, 'SEAT', '좌석', 'WORD', 20), (NULL, NULL, 'PROJECTOR', '영사기', 'WORD', 20), (NULL, NULL, 'SOUND SYSTEM', '음향 시스템', 'WORD', 20), (NULL, NULL, 'AISLE', '복도', 'WORD', 20), (NULL, NULL, 'ROW', '열/줄', 'WORD', 20), (NULL, NULL, 'TRAILER', '예고편', 'WORD', 20), (NULL, NULL, 'POSTER', '포스터', 'WORD', 20), (NULL, NULL, '3D GLASSES', '3D 안경', 'WORD', 20), (NULL, NULL, 'SNACK BAR', '매점', 'WORD', 20), (NULL, NULL, 'DRINK', '음료', 'WORD', 20), (NULL, NULL, 'STRAW', '빨대', 'WORD', 20), (NULL, NULL, 'CLERK', '직원', 'WORD', 20), (NULL, NULL, 'SHOWTIME', '상영 시간', 'WORD', 20), (NULL, NULL, 'RESERVATION', '예매', 'WORD', 20), (NULL, NULL, 'BLOCKBUSTER', '대작 영화', 'WORD', 20), (NULL, NULL, 'ACTOR', '남자 배우', 'WORD', 20), (NULL, NULL, 'ACTRESS', '여자 배우', 'WORD', 20), (NULL, NULL, 'DIRECTOR', '감독', 'WORD', 20), (NULL, NULL, 'ENDING', '결말', 'WORD', 20), (NULL, NULL, 'SCENE', '장면', 'WORD', 20), (NULL, NULL, 'CREDITS', '자막/크레딧', 'WORD', 20), (NULL, NULL, 'RATING', '관람 등급', 'WORD', 20);

-- 21. ZOO ~ 25. FOREST
INSERT INTO words (word_id, audio_url, content, meaning, type, place_id) VALUES
(NULL, NULL, 'LION', '사자', 'WORD', 21), (NULL, NULL, 'TIGER', '호랑이', 'WORD', 21), (NULL, NULL, 'BEAR', '곰', 'WORD', 21), (NULL, NULL, 'MONKEY', '원숭이', 'WORD', 21), (NULL, NULL, 'GIRAFFE', '기린', 'WORD', 21), (NULL, NULL, 'ZEBRA', '얼룩말', 'WORD', 21), (NULL, NULL, 'ELEPHANT', '코끼리', 'WORD', 21), (NULL, NULL, 'HIPPO', '하마', 'WORD', 21), (NULL, NULL, 'RHINO', '코뿔소', 'WORD', 21), (NULL, NULL, 'PENGUIN', '펭귄', 'WORD', 21), (NULL, NULL, 'SEAL', '물개', 'WORD', 21), (NULL, NULL, 'DOLPHIN', '돌고래', 'WORD', 21), (NULL, NULL, 'CAGE', '우리', 'WORD', 21), (NULL, NULL, 'HABITAT', '서식지', 'WORD', 21), (NULL, NULL, 'TRAINER', '조련사', 'WORD', 21), (NULL, NULL, 'VISITOR', '관람객', 'WORD', 21), (NULL, NULL, 'MAP', '지도', 'WORD', 21), (NULL, NULL, 'TICKET', '입장권', 'WORD', 21), (NULL, NULL, 'FEEDING TIME', '먹이 주는 시간', 'WORD', 21), (NULL, NULL, 'FOREST ZONE', '산림 구역', 'WORD', 21), (NULL, NULL, 'SAVANNA', '사바나', 'WORD', 21), (NULL, NULL, 'REPTILE HOUSE', '파충류관', 'WORD', 21), (NULL, NULL, 'BIRDHOUSE', '조류관', 'WORD', 21), (NULL, NULL, 'ENTRANCE', '입구', 'WORD', 21), (NULL, NULL, 'SOUVENIR', '기념품', 'WORD', 21),
(NULL, NULL, 'COW', '소', 'WORD', 22), (NULL, NULL, 'PIG', '돼지', 'WORD', 22), (NULL, NULL, 'CHICKEN', '닭', 'WORD', 22), (NULL, NULL, 'GOAT', '염소', 'WORD', 22), (NULL, NULL, 'SHEEP', '양', 'WORD', 22), (NULL, NULL, 'HORSE', '말', 'WORD', 22), (NULL, NULL, 'DUCK', '오리', 'WORD', 22), (NULL, NULL, 'GOOSE', '거위', 'WORD', 22), (NULL, NULL, 'ROOSTER', '수탉', 'WORD', 22), (NULL, NULL, 'BARN', '헛간', 'WORD', 22), (NULL, NULL, 'TRACTOR', '트랙터', 'WORD', 22), (NULL, NULL, 'FIELD', '들판/밭', 'WORD', 22), (NULL, NULL, 'HAY', '건초', 'WORD', 22), (NULL, NULL, 'FARMER', '농부', 'WORD', 22), (NULL, NULL, 'FENCE', '울타리', 'WORD', 22), (NULL, NULL, 'EGG', '달걀', 'WORD', 22), (NULL, NULL, 'WHEAT', '밀', 'WORD', 22), (NULL, NULL, 'CORN', '옥수수', 'WORD', 22), (NULL, NULL, 'SOIL', '흙', 'WORD', 22), (NULL, NULL, 'GRASS', '풀', 'WORD', 22), (NULL, NULL, 'STABLE', '마구간', 'WORD', 22), (NULL, NULL, 'POND', '연못', 'WORD', 22), (NULL, NULL, 'SCARECROW', '허수아비', 'WORD', 22), (NULL, NULL, 'SEEDS', '씨앗', 'WORD', 22), (NULL, NULL, 'WHEELBARROW', '손수레', 'WORD', 22),
(NULL, NULL, 'SAND', '모래', 'WORD', 23), (NULL, NULL, 'WAVE', '파도', 'WORD', 23), (NULL, NULL, 'SHELL', '조개껍데기', 'WORD', 23), (NULL, NULL, 'CRAB', '게', 'WORD', 23), (NULL, NULL, 'STARFISH', '불가사리', 'WORD', 23), (NULL, NULL, 'SEAGULL', '갈매기', 'WORD', 23), (NULL, NULL, 'SUNSCREEN', '선크림', 'WORD', 23), (NULL, NULL, 'UMBRELLA', '파라솔', 'WORD', 23), (NULL, NULL, 'TOWEL', '수건', 'WORD', 23), (NULL, NULL, 'SWIMSUIT', '수영복', 'WORD', 23), (NULL, NULL, 'SURFBOARD', '서핑보드', 'WORD', 23), (NULL, NULL, 'LIFEGUARD', '안전 요원', 'WORD', 23), (NULL, NULL, 'FLOAT', '튜브', 'WORD', 23), (NULL, NULL, 'JELLYFISH', '해파리', 'WORD', 23), (NULL, NULL, 'ROCK', '바위', 'WORD', 23), (NULL, NULL, 'BUCKET', '양동이', 'WORD', 23), (NULL, NULL, 'SHOVEL', '삽', 'WORD', 23), (NULL, NULL, 'BEACH CHAIR', '비치 의자', 'WORD', 23), (NULL, NULL, 'SUNGLASSES', '선글라스', 'WORD', 23), (NULL, NULL, 'ICE CREAM', '아이스크림', 'WORD', 23), (NULL, NULL, 'COOLER', '아이스박스', 'WORD', 23), (NULL, NULL, 'FOOTPRINTS', '발자국', 'WORD', 23), (NULL, NULL, 'KITE', '연', 'WORD', 23), (NULL, NULL, 'BREEZE', '산들바람', 'WORD', 23), (NULL, NULL, 'LIGHTHOUSE', '등대', 'WORD', 23),
(NULL, NULL, 'ROCK', '바위', 'WORD', 24), (NULL, NULL, 'TREE', '나무', 'WORD', 24), (NULL, NULL, 'PINE', '소나무', 'WORD', 24), (NULL, NULL, 'TRAIL', '등산로', 'WORD', 24), (NULL, NULL, 'HIKING', '등산', 'WORD', 24), (NULL, NULL, 'MAP', '지도', 'WORD', 24), (NULL, NULL, 'COMPASS', '나침반', 'WORD', 24), (NULL, NULL, 'BACKPACK', '배낭', 'WORD', 24), (NULL, NULL, 'TENT', '텐트', 'WORD', 24), (NULL, NULL, 'ROPE', '밧줄', 'WORD', 24), (NULL, NULL, 'WATERFALL', '폭포', 'WORD', 24), (NULL, NULL, 'CLIFF', '절벽', 'WORD', 24), (NULL, NULL, 'CAVE', '동굴', 'WORD', 24), (NULL, NULL, 'FOREST', '숲', 'WORD', 24), (NULL, NULL, 'VALLEY', '계곡', 'WORD', 24), (NULL, NULL, 'PEAK', '정상', 'WORD', 24), (NULL, NULL, 'RIDGE', '산등성이', 'WORD', 24), (NULL, NULL, 'BOOTS', '등산화', 'WORD', 24), (NULL, NULL, 'GLOVES', '장갑', 'WORD', 24), (NULL, NULL, 'STICKS', '등산 스틱', 'WORD', 24), (NULL, NULL, 'FLASHLIGHT', '손전등', 'WORD', 24), (NULL, NULL, 'FOG', '안개', 'WORD', 24), (NULL, NULL, 'CLOUD', '구름', 'WORD', 24), (NULL, NULL, 'STREAM', '개울', 'WORD', 24), (NULL, NULL, 'FIRE', '모닥불', 'WORD', 24),
(NULL, NULL, 'TREE', '나무', 'WORD', 25), (NULL, NULL, 'LEAF', '나뭇잎', 'WORD', 25), (NULL, NULL, 'BRANCH', '나뭇가지', 'WORD', 25), (NULL, NULL, 'ROOT', '뿌리', 'WORD', 25), (NULL, NULL, 'MOSS', '이끼', 'WORD', 25), (NULL, NULL, 'MUSHROOM', '버섯', 'WORD', 25), (NULL, NULL, 'OWL', '부엉이', 'WORD', 25), (NULL, NULL, 'FOX', '여우', 'WORD', 25), (NULL, NULL, 'DEER', '사슴', 'WORD', 25), (NULL, NULL, 'SQUIRREL', '다람쥐', 'WORD', 25), (NULL, NULL, 'BIRD', '새', 'WORD', 25), (NULL, NULL, 'NEST', '둥지', 'WORD', 25), (NULL, NULL, 'PINECONE', '솔방울', 'WORD', 25), (NULL, NULL, 'LOG', '통나무', 'WORD', 25), (NULL, NULL, 'SOIL', '흙', 'WORD', 25), (NULL, NULL, 'CREEK', '시내', 'WORD', 25), (NULL, NULL, 'BUSH', '덤불', 'WORD', 25), (NULL, NULL, 'BERRIES', '열매', 'WORD', 25), (NULL, NULL, 'SPIDER', '거미', 'WORD', 25), (NULL, NULL, 'WEB', '거미줄', 'WORD', 25), (NULL, NULL, 'SUNLIGHT', '햇빛', 'WORD', 25), (NULL, NULL, 'SHADOW', '그림자', 'WORD', 25), (NULL, NULL, 'WIND', '바람', 'WORD', 25), (NULL, NULL, 'INSECTS', '곤충', 'WORD', 25), (NULL, NULL, 'GRASS', '풀', 'WORD', 25);

-- 26. RIVER ~ 30. WEATHER
INSERT INTO words (word_id, audio_url, content, meaning, type, place_id) VALUES
(NULL, NULL, 'FISH', '물고기', 'WORD', 26), (NULL, NULL, 'WATER', '물', 'WORD', 26), (NULL, NULL, 'BOAT', '배', 'WORD', 26), (NULL, NULL, 'BRIDGE', '다리', 'WORD', 26), (NULL, NULL, 'RIVERBANK', '강둑', 'WORD', 26), (NULL, NULL, 'REEDS', '갈대', 'WORD', 26), (NULL, NULL, 'TURTLE', '거북이', 'WORD', 26), (NULL, NULL, 'FROG', '개구리', 'WORD', 26), (NULL, NULL, 'OTTER', '수달', 'WORD', 26), (NULL, NULL, 'DUCK', '오리', 'WORD', 26), (NULL, NULL, 'CURRENT', '물살', 'WORD', 26), (NULL, NULL, 'WAVE', '물결', 'WORD', 26), (NULL, NULL, 'STONE', '돌', 'WORD', 26), (NULL, NULL, 'PEBBLE', '자갈', 'WORD', 26), (NULL, NULL, 'SAND', '모래', 'WORD', 26), (NULL, NULL, 'FISHING ROD', '낚싯대', 'WORD', 26), (NULL, NULL, 'NET', '그물', 'WORD', 26), (NULL, NULL, 'PADDLE', '노', 'WORD', 26), (NULL, NULL, 'CANOE', '카누', 'WORD', 26), (NULL, NULL, 'LIFE JACKET', '구명조끼', 'WORD', 26), (NULL, NULL, 'SPLASH', '첨벙거림', 'WORD', 26), (NULL, NULL, 'STREAM', '개울', 'WORD', 26), (NULL, NULL, 'ALGAE', '이끼/조류', 'WORD', 26), (NULL, NULL, 'SHORE', '강가', 'WORD', 26), (NULL, NULL, 'DOCK', '선착장', 'WORD', 26),
(NULL, NULL, 'BOAT', '배', 'WORD', 27), (NULL, NULL, 'PADDLE', '노', 'WORD', 27), (NULL, NULL, 'DUCK', '오리', 'WORD', 27), (NULL, NULL, 'SWAN', '백조', 'WORD', 27), (NULL, NULL, 'GOOSE', '거위', 'WORD', 27), (NULL, NULL, 'FISH', '물고기', 'WORD', 27), (NULL, NULL, 'FISHING ROD', '낚싯대', 'WORD', 27), (NULL, NULL, 'KAYAK', '카약', 'WORD', 27), (NULL, NULL, 'CANOE', '카누', 'WORD', 27), (NULL, NULL, 'LIFE JACKET', '구명조끼', 'WORD', 27), (NULL, NULL, 'PIER', '부두', 'WORD', 27), (NULL, NULL, 'WATER LILY', '수련', 'WORD', 27), (NULL, NULL, 'REEDS', '갈대', 'WORD', 27), (NULL, NULL, 'FROG', '개구리', 'WORD', 27), (NULL, NULL, 'TURTLE', '거북이', 'WORD', 27), (NULL, NULL, 'SPLASH', '물튀김', 'WORD', 27), (NULL, NULL, 'RIPPLES', '잔물결', 'WORD', 27), (NULL, NULL, 'PICNIC', '소풍', 'WORD', 27), (NULL, NULL, 'FOREST', '숲', 'WORD', 27), (NULL, NULL, 'CLOUD', '구름', 'WORD', 27), (NULL, NULL, 'SUNSET', '일몰', 'WORD', 27), (NULL, NULL, 'BREEZE', '바람', 'WORD', 27), (NULL, NULL, 'PATH', '길', 'WORD', 27), (NULL, NULL, 'STONE', '돌', 'WORD', 27), (NULL, NULL, 'BENCH', '벤치', 'WORD', 27),
(NULL, NULL, 'SAND', '모래', 'WORD', 28), (NULL, NULL, 'DUNE', '모래언덕', 'WORD', 28), (NULL, NULL, 'CACTUS', '선인장', 'WORD', 28), (NULL, NULL, 'CAMEL', '낙타', 'WORD', 28), (NULL, NULL, 'HEAT', '열기', 'WORD', 28), (NULL, NULL, 'SUN', '태양', 'WORD', 28), (NULL, NULL, 'LIZARD', '도마뱀', 'WORD', 28), (NULL, NULL, 'SNAKE', '뱀', 'WORD', 28), (NULL, NULL, 'SCORPION', '전갈', 'WORD', 28), (NULL, NULL, 'WIND', '바람', 'WORD', 28), (NULL, NULL, 'FOOTPRINT', '발자국', 'WORD', 28), (NULL, NULL, 'OASIS', '오아시스', 'WORD', 28), (NULL, NULL, 'PALM TREE', '야자수', 'WORD', 28), (NULL, NULL, 'ROCKS', '바위', 'WORD', 28), (NULL, NULL, 'DRY', '건조한', 'WORD', 28), (NULL, NULL, 'SHADE', '그늘', 'WORD', 28), (NULL, NULL, 'SKY', '하늘', 'WORD', 28), (NULL, NULL, 'MIRAGE', '신기루', 'WORD', 28), (NULL, NULL, 'STORM', '폭풍', 'WORD', 28), (NULL, NULL, 'DUST', '먼지', 'WORD', 28), (NULL, NULL, 'TRACKS', '자국', 'WORD', 28), (NULL, NULL, 'BOTTLE', '물병', 'WORD', 28), (NULL, NULL, 'TRAVEL', '여행', 'WORD', 28), (NULL, NULL, 'BACKPACK', '배낭', 'WORD', 28), (NULL, NULL, 'HAT', '모자', 'WORD', 28),
(NULL, NULL, 'PLANET', '행성', 'WORD', 29), (NULL, NULL, 'MOON', '달', 'WORD', 29), (NULL, NULL, 'STAR', '별', 'WORD', 29), (NULL, NULL, 'ROCKET', '로켓', 'WORD', 29), (NULL, NULL, 'ASTRONAUT', '우주비행사', 'WORD', 29), (NULL, NULL, 'SPACE SUIT', '우주복', 'WORD', 29), (NULL, NULL, 'SPACESHIP', '우주선', 'WORD', 29), (NULL, NULL, 'GALAXY', '은하', 'WORD', 29), (NULL, NULL, 'COMET', '혜성', 'WORD', 29), (NULL, NULL, 'METEOR', '유성', 'WORD', 29), (NULL, NULL, 'TELESCOPE', '망원경', 'WORD', 29), (NULL, NULL, 'SATELLITE', '인공위성', 'WORD', 29), (NULL, NULL, 'SPACE STATION', '우주 정거장', 'WORD', 29), (NULL, NULL, 'GRAVITY', '중력', 'WORD', 29), (NULL, NULL, 'SOLAR SYSTEM', '태양계', 'WORD', 29), (NULL, NULL, 'ORBIT', '궤도', 'WORD', 29), (NULL, NULL, 'LAUNCH', '발사', 'WORD', 29), (NULL, NULL, 'NEBULA', '성운', 'WORD', 29), (NULL, NULL, 'ASTEROID', '소행성', 'WORD', 29), (NULL, NULL, 'CRATER', '분화구', 'WORD', 29), (NULL, NULL, 'DARK MATTER', '암흑 물질', 'WORD', 29), (NULL, NULL, 'LIGHT SPEED', '광속', 'WORD', 29), (NULL, NULL, 'UNIVERSE', '우주', 'WORD', 29), (NULL, NULL, 'VACUUM', '진공', 'WORD', 29), (NULL, NULL, 'MISSION', '임무', 'WORD', 29),
(NULL, NULL, 'SUNNY', '맑은', 'WORD', 30), (NULL, NULL, 'CLOUDY', '흐린', 'WORD', 30), (NULL, NULL, 'RAINY', '비 오는', 'WORD', 30), (NULL, NULL, 'SNOWY', '눈 오는', 'WORD', 30), (NULL, NULL, 'STORM', '폭풍', 'WORD', 30), (NULL, NULL, 'THUNDER', '천둥', 'WORD', 30), (NULL, NULL, 'LIGHTNING', '번개', 'WORD', 30), (NULL, NULL, 'WIND', '바람', 'WORD', 30), (NULL, NULL, 'BREEZE', '산들바람', 'WORD', 30), (NULL, NULL, 'FOG', '안개', 'WORD', 30), (NULL, NULL, 'RAINBOW', '무지개', 'WORD', 30), (NULL, NULL, 'TEMPERATURE', '기온', 'WORD', 30), (NULL, NULL, 'FORECAST', '일기 예보', 'WORD', 30), (NULL, NULL, 'HUMID', '습한', 'WORD', 30), (NULL, NULL, 'DRY', '건조한', 'WORD', 30), (NULL, NULL, 'HOT', '더운', 'WORD', 30), (NULL, NULL, 'COLD', '추운', 'WORD', 30), (NULL, NULL, 'WARM', '따뜻한', 'WORD', 30), (NULL, NULL, 'FREEZE', '얼다', 'WORD', 30), (NULL, NULL, 'HEATWAVE', '폭염', 'WORD', 30), (NULL, NULL, 'UMBRELLA', '우산', 'WORD', 30), (NULL, NULL, 'BOOTS', '장화', 'WORD', 30), (NULL, NULL, 'COAT', '코트', 'WORD', 30), (NULL, NULL, 'SKY', '하늘', 'WORD', 30), (NULL, NULL, 'SEASON', '계절', 'WORD', 30);

-- 31. CITY ~ 35. MARKET
INSERT INTO words (word_id, audio_url, content, meaning, type, place_id) VALUES
(NULL, NULL, 'BUILDING', '건물', 'WORD', 31), (NULL, NULL, 'SKYSCRAPER', '마천루/고층빌딩', 'WORD', 31), (NULL, NULL, 'TAXI', '택시', 'WORD', 31), (NULL, NULL, 'BUS', '버스', 'WORD', 31), (NULL, NULL, 'TRAIN', '기차', 'WORD', 31), (NULL, NULL, 'STREET', '거리', 'WORD', 31), (NULL, NULL, 'CROWD', '군중', 'WORD', 31), (NULL, NULL, 'TRAFFIC', '교통', 'WORD', 31), (NULL, NULL, 'SIGNAL', '신호', 'WORD', 31), (NULL, NULL, 'SIDEWALK', '인도', 'WORD', 31), (NULL, NULL, 'CROSSWALK', '횡단보도', 'WORD', 31), (NULL, NULL, 'MAP', '지도', 'WORD', 31), (NULL, NULL, 'STATION', '역', 'WORD', 31), (NULL, NULL, 'SHOP', '가게', 'WORD', 31), (NULL, NULL, 'OFFICE', '사무실', 'WORD', 31), (NULL, NULL, 'APARTMENT', '아파트', 'WORD', 31), (NULL, NULL, 'BRIDGE', '다리', 'WORD', 31), (NULL, NULL, 'RIVER', '강', 'WORD', 31), (NULL, NULL, 'TOWER', '탑/타워', 'WORD', 31), (NULL, NULL, 'PLAZA', '광장', 'WORD', 31), (NULL, NULL, 'MARKET', '시장', 'WORD', 31), (NULL, NULL, 'BICYCLE', '자전거', 'WORD', 31), (NULL, NULL, 'PARK', '공원', 'WORD', 31), (NULL, NULL, 'SQUARE', '광장', 'WORD', 31), (NULL, NULL, 'ALLEY', '골목', 'WORD', 31),
(NULL, NULL, 'HOUSE', '집', 'WORD', 32), (NULL, NULL, 'GARDEN', '정원', 'WORD', 32), (NULL, NULL, 'FIELD', '밭', 'WORD', 32), (NULL, NULL, 'BARN', '헛간', 'WORD', 32), (NULL, NULL, 'PATH', '길', 'WORD', 32), (NULL, NULL, 'HILL', '언덕', 'WORD', 32), (NULL, NULL, 'STREAM', '개울', 'WORD', 32), (NULL, NULL, 'COW', '소', 'WORD', 32), (NULL, NULL, 'SHEEP', '양', 'WORD', 32), (NULL, NULL, 'TRUCK', '트럭', 'WORD', 32), (NULL, NULL, 'TRACTOR', '트랙터', 'WORD', 32), (NULL, NULL, 'FENCE', '울타리', 'WORD', 32), (NULL, NULL, 'NEIGHBOR', '이웃', 'WORD', 32), (NULL, NULL, 'MAIL', '우편물', 'WORD', 32), (NULL, NULL, 'BAKERY', '빵집', 'WORD', 32), (NULL, NULL, 'MARKET', '시장', 'WORD', 32), (NULL, NULL, 'CHURCH', '교회', 'WORD', 32), (NULL, NULL, 'WELL', '우물', 'WORD', 32), (NULL, NULL, 'TREE', '나무', 'WORD', 32), (NULL, NULL, 'FLOWERS', '꽃', 'WORD', 32), (NULL, NULL, 'SIGN', '표지판', 'WORD', 32), (NULL, NULL, 'ROAD', '도로', 'WORD', 32), (NULL, NULL, 'DOG', '개', 'WORD', 32), (NULL, NULL, 'ROOSTER', '수탉', 'WORD', 32), (NULL, NULL, 'BENCH', '벤치', 'WORD', 32),
(NULL, NULL, 'DESK', '책상', 'WORD', 33), (NULL, NULL, 'CHAIR', '의자', 'WORD', 33), (NULL, NULL, 'COMPUTER', '컴퓨터', 'WORD', 33), (NULL, NULL, 'KEYBOARD', '키보드', 'WORD', 33), (NULL, NULL, 'MOUSE', '마우스', 'WORD', 33), (NULL, NULL, 'PRINTER', '프린터', 'WORD', 33), (NULL, NULL, 'PAPER', '종이', 'WORD', 33), (NULL, NULL, 'FOLDER', '폴더', 'WORD', 33), (NULL, NULL, 'BINDER', '바인더', 'WORD', 33), (NULL, NULL, 'MEETING', '회의', 'WORD', 33), (NULL, NULL, 'BOSS', '상사', 'WORD', 33), (NULL, NULL, 'COWORKER', '동료', 'WORD', 33), (NULL, NULL, 'SCHEDULE', '일정', 'WORD', 33), (NULL, NULL, 'PHONE', '전화기', 'WORD', 33), (NULL, NULL, 'HEADSET', '헤드셋', 'WORD', 33), (NULL, NULL, 'EMAIL', '이메일', 'WORD', 33), (NULL, NULL, 'WHITEBOARD', '화이트보드', 'WORD', 33), (NULL, NULL, 'MARKER', '보드마카', 'WORD', 33), (NULL, NULL, 'STAPLER', '스테이플러', 'WORD', 33), (NULL, NULL, 'SCISSORS', '가위', 'WORD', 33), (NULL, NULL, 'FILE', '파일', 'WORD', 33), (NULL, NULL, 'DOCUMENT', '문서', 'WORD', 33), (NULL, NULL, 'CABINET', '캐비비넷', 'WORD', 33), (NULL, NULL, 'NOTEBOOK', '수첩', 'WORD', 33), (NULL, NULL, 'CHARGER', '충전기', 'WORD', 33),
(NULL, NULL, 'MACHINE', '기계', 'WORD', 34), (NULL, NULL, 'WORKER', '노동자', 'WORD', 34), (NULL, NULL, 'HELMET', '헬멧', 'WORD', 34), (NULL, NULL, 'GLOVES', '장갑', 'WORD', 34), (NULL, NULL, 'CONVEYOR BELT', '컨베이어 벨트', 'WORD', 34), (NULL, NULL, 'ROBOT ARM', '로봇 팔', 'WORD', 34), (NULL, NULL, 'PARTS', '부품', 'WORD', 34), (NULL, NULL, 'TOOLS', '도구', 'WORD', 34), (NULL, NULL, 'METAL', '금속', 'WORD', 34), (NULL, NULL, 'PRODUCT', '제품', 'WORD', 34), (NULL, NULL, 'BOX', '상자', 'WORD', 34), (NULL, NULL, 'STORAGE', '창고', 'WORD', 34), (NULL, NULL, 'FORKLIFT', '지게차', 'WORD', 34), (NULL, NULL, 'SAFETY SIGN', '안전 표지판', 'WORD', 34), (NULL, NULL, 'MASK', '마스크', 'WORD', 34), (NULL, NULL, 'UNIFORM', '유니폼', 'WORD', 34), (NULL, NULL, 'MANAGER', '관리자', 'WORD', 34), (NULL, NULL, 'SCHEDULE', '일정', 'WORD', 34), (NULL, NULL, 'ENGINE', '엔진', 'WORD', 34), (NULL, NULL, 'NOISE', '소음', 'WORD', 34), (NULL, NULL, 'SMOKE', '연기', 'WORD', 34), (NULL, NULL, 'FACTORY FLOOR', '공장 바닥', 'WORD', 34), (NULL, NULL, 'SWITCH', '스위치', 'WORD', 34), (NULL, NULL, 'WIRE', '전선', 'WORD', 34), (NULL, NULL, 'PIPE', '파이프', 'WORD', 34),
(NULL, NULL, 'STALL', '가판대', 'WORD', 35), (NULL, NULL, 'VENDOR', '상인', 'WORD', 35), (NULL, NULL, 'FRUIT', '과일', 'WORD', 35), (NULL, NULL, 'VEGETABLE', '채소', 'WORD', 35), (NULL, NULL, 'MEAT', '고기', 'WORD', 35), (NULL, NULL, 'FISH', '생선', 'WORD', 35), (NULL, NULL, 'SPICE', '향신료', 'WORD', 35), (NULL, NULL, 'GRAIN', '곡물', 'WORD', 35), (NULL, NULL, 'RICE', '쌀', 'WORD', 35), (NULL, NULL, 'TEA', '차', 'WORD', 35), (NULL, NULL, 'BASKET', '바구니', 'WORD', 35), (NULL, NULL, 'SCALE', '저울', 'WORD', 35), (NULL, NULL, 'PRICE', '가격', 'WORD', 35), (NULL, NULL, 'BARGAIN', '흥정', 'WORD', 35), (NULL, NULL, 'SHOPPER', '구매자', 'WORD', 35), (NULL, NULL, 'CART', '카트', 'WORD', 35), (NULL, NULL, 'BAG', '가방', 'WORD', 35), (NULL, NULL, 'SAMPLE', '시식/샘플', 'WORD', 35), (NULL, NULL, 'LOCAL FOOD', '현지 음식', 'WORD', 35), (NULL, NULL, 'HANDMADE', '수제', 'WORD', 35), (NULL, NULL, 'CRAFTS', '공예품', 'WORD', 35), (NULL, NULL, 'DRIED FOOD', '건어물/건조식품', 'WORD', 35), (NULL, NULL, 'HERBS', '허브', 'WORD', 35), (NULL, NULL, 'SNACKS', '간식', 'WORD', 35), (NULL, NULL, 'SWEETS', '사탕류', 'WORD', 35);

-- 36. BANK ~ 40. HOTEL
INSERT INTO words (word_id, audio_url, content, meaning, type, place_id) VALUES
(NULL, NULL, 'MONEY', '돈', 'WORD', 36), (NULL, NULL, 'CARD', '카드', 'WORD', 36), (NULL, NULL, 'ACCOUNT', '계좌', 'WORD', 36), (NULL, NULL, 'CHECK', '수표', 'WORD', 36), (NULL, NULL, 'CASH', '현금', 'WORD', 36), (NULL, NULL, 'COIN', '동전', 'WORD', 36), (NULL, NULL, 'ATM', '현금인출기', 'WORD', 36), (NULL, NULL, 'CLERK', '직원', 'WORD', 36), (NULL, NULL, 'COUNTER', '창구', 'WORD', 36), (NULL, NULL, 'LINE', '줄', 'WORD', 36), (NULL, NULL, 'RECEIPT', '영수증', 'WORD', 36), (NULL, NULL, 'DEPOSIT', '입금', 'WORD', 36), (NULL, NULL, 'WITHDRAW', '출금', 'WORD', 36), (NULL, NULL, 'LOAN', '대출', 'WORD', 36), (NULL, NULL, 'INTEREST', '이자', 'WORD', 36), (NULL, NULL, 'SAFE', '금고', 'WORD', 36), (NULL, NULL, 'VAULT', '대형 금고', 'WORD', 36), (NULL, NULL, 'PIN NUMBER', '비밀번호', 'WORD', 36), (NULL, NULL, 'SIGNATURE', '서명', 'WORD', 36), (NULL, NULL, 'ID', '신분증', 'WORD', 36), (NULL, NULL, 'PASSWORD', '비밀번호', 'WORD', 36), (NULL, NULL, 'BALANCE', '잔고', 'WORD', 36), (NULL, NULL, 'BILL', '지폐/고지서', 'WORD', 36), (NULL, NULL, 'WALLET', '지갑', 'WORD', 36), (NULL, NULL, 'TRANSFER', '이체', 'WORD', 36),
(NULL, NULL, 'POLICE OFFICER', '경찰관', 'WORD', 37), (NULL, NULL, 'PATROL CAR', '순찰차', 'WORD', 37), (NULL, NULL, 'BADGE', '뱃지', 'WORD', 37), (NULL, NULL, 'REPORT', '신고/보고서', 'WORD', 37), (NULL, NULL, 'CASE', '사건', 'WORD', 37), (NULL, NULL, 'DETECTIVE', '형사', 'WORD', 37), (NULL, NULL, 'UNIFORM', '제복', 'WORD', 37), (NULL, NULL, 'RADIO', '무전기', 'WORD', 37), (NULL, NULL, 'HANDCUFFS', '수갑', 'WORD', 37), (NULL, NULL, 'EVIDENCE', '증거', 'WORD', 37), (NULL, NULL, 'WITNESS', '목격자', 'WORD', 37), (NULL, NULL, 'CRIME', '범죄', 'WORD', 37), (NULL, NULL, 'SAFETY', '안전', 'WORD', 37), (NULL, NULL, 'EMERGENCY', '비상 사태', 'WORD', 37), (NULL, NULL, 'CCTV', 'CCTV', 'WORD', 37), (NULL, NULL, 'DESK', '책상', 'WORD', 37), (NULL, NULL, 'OFFICE', '사무실', 'WORD', 37), (NULL, NULL, 'SUSPECT', '용의자', 'WORD', 37), (NULL, NULL, 'ARREST', '체포', 'WORD', 37), (NULL, NULL, 'DOCUMENT', '문서', 'WORD', 37), (NULL, NULL, 'PHONE', '전화', 'WORD', 37), (NULL, NULL, 'KEYS', '열쇠', 'WORD', 37), (NULL, NULL, 'MAP', '지도', 'WORD', 37), (NULL, NULL, 'BOOTS', '부츠', 'WORD', 37), (NULL, NULL, 'WHISTLE', '호루라기', 'WORD', 37),
(NULL, NULL, 'FIREFIGHTER', '소방관', 'WORD', 38), (NULL, NULL, 'HOSE', '호스', 'WORD', 38), (NULL, NULL, 'LADDER', '사다리', 'WORD', 38), (NULL, NULL, 'HELMET', '헬멧', 'WORD', 38), (NULL, NULL, 'BOOTS', '장화', 'WORD', 38), (NULL, NULL, 'UNIFORM', '제복', 'WORD', 38), (NULL, NULL, 'FIRE TRUCK', '소방차', 'WORD', 38), (NULL, NULL, 'SIREN', '사이렌', 'WORD', 38), (NULL, NULL, 'SMOKE', '연기', 'WORD', 38), (NULL, NULL, 'FIRE', '불', 'WORD', 38), (NULL, NULL, 'RESCUE', '구조', 'WORD', 38), (NULL, NULL, 'EXTINGUISHER', '소화기', 'WORD', 38), (NULL, NULL, 'GLOVES', '장갑', 'WORD', 38), (NULL, NULL, 'MASK', '마스크', 'WORD', 38), (NULL, NULL, 'OXYGEN TANK', '산소통', 'WORD', 38), (NULL, NULL, 'EMERGENCY', '응급 상황', 'WORD', 38), (NULL, NULL, 'STATION', '서/국', 'WORD', 38), (NULL, NULL, 'BELL', '벨', 'WORD', 38), (NULL, NULL, 'SAFETY', '안전', 'WORD', 38), (NULL, NULL, 'WATER', '물', 'WORD', 38), (NULL, NULL, 'HYDRANT', '소화전', 'WORD', 38), (NULL, NULL, 'AXE', '도끼', 'WORD', 38), (NULL, NULL, 'LIGHT', '조명', 'WORD', 38), (NULL, NULL, 'HELMET STRAP', '헬멧 끈', 'WORD', 38), (NULL, NULL, 'ROPE', '밧줄', 'WORD', 38),
(NULL, NULL, 'MAIL', '우편', 'WORD', 39), (NULL, NULL, 'LETTER', '편지', 'WORD', 39), (NULL, NULL, 'ENVELOPE', '봉투', 'WORD', 39), (NULL, NULL, 'STAMP', '우표', 'WORD', 39), (NULL, NULL, 'PACKAGE', '소포', 'WORD', 39), (NULL, NULL, 'BOX', '상자', 'WORD', 39), (NULL, NULL, 'TAPE', '테이프', 'WORD', 39), (NULL, NULL, 'ADDRESS', '주소', 'WORD', 39), (NULL, NULL, 'SENDER', '보내는 사람', 'WORD', 39), (NULL, NULL, 'RECEIVER', '받는 사람', 'WORD', 39), (NULL, NULL, 'MAILBOX', '우체통', 'WORD', 39), (NULL, NULL, 'DELIVERY', '배달', 'WORD', 39), (NULL, NULL, 'TRUCK', '트럭', 'WORD', 39), (NULL, NULL, 'ROUTE', '경로', 'WORD', 39), (NULL, NULL, 'CLERK', '직원', 'WORD', 39), (NULL, NULL, 'COUNTER', '창구', 'WORD', 39), (NULL, NULL, 'LINE', '줄', 'WORD', 39), (NULL, NULL, 'RECEIPT', '영수증', 'WORD', 39), (NULL, NULL, 'EXPRESS', '빠른 배송', 'WORD', 39), (NULL, NULL, 'PARCEL', '택배', 'WORD', 39), (NULL, NULL, 'LABEL', '라벨', 'WORD', 39), (NULL, NULL, 'SCHEDULE', '일정', 'WORD', 39), (NULL, NULL, 'WEIGHT', '무게', 'WORD', 39), (NULL, NULL, 'SCALE', '저울', 'WORD', 39), (NULL, NULL, 'STICKER', '스티커', 'WORD', 39),
(NULL, NULL, 'LOBBY', '로비', 'WORD', 40), (NULL, NULL, 'ROOM', '방/객실', 'WORD', 40), (NULL, NULL, 'KEY CARD', '키 카드', 'WORD', 40), (NULL, NULL, 'RESERVATION', '예약', 'WORD', 40), (NULL, NULL, 'RECEPTION', '프런트', 'WORD', 40), (NULL, NULL, 'LUGGAGE', '짐', 'WORD', 40), (NULL, NULL, 'ELEVATOR', '엘리베이터', 'WORD', 40), (NULL, NULL, 'STAIRS', '계단', 'WORD', 40), (NULL, NULL, 'BED', '침대', 'WORD', 40), (NULL, NULL, 'BLANKET', '담요', 'WORD', 40), (NULL, NULL, 'TOWEL', '수건', 'WORD', 40), (NULL, NULL, 'BATHROOM', '욕실', 'WORD', 40), (NULL, NULL, 'RESTAURANT', '식당', 'WORD', 40), (NULL, NULL, 'BELLBOY', '벨보이', 'WORD', 40), (NULL, NULL, 'SERVICE', '서비스', 'WORD', 40), (NULL, NULL, 'BREAKFAST', '조식', 'WORD', 40), (NULL, NULL, 'CHECKOUT', '체크아웃', 'WORD', 40), (NULL, NULL, 'MANAGER', '지배인', 'WORD', 40), (NULL, NULL, 'PILLOW', '베개', 'WORD', 40), (NULL, NULL, 'TV', 'TV', 'WORD', 40), (NULL, NULL, 'MINIBAR', '미니바', 'WORD', 40), (NULL, NULL, 'VIEW', '전망', 'WORD', 40), (NULL, NULL, 'DESK', '책상', 'WORD', 40), (NULL, NULL, 'SOFA', '소파', 'WORD', 40), (NULL, NULL, 'CURTAIN', '커튼', 'WORD', 40);

-- 41. SHOPPING MALL ~ 45. SWIMMING POOL
INSERT INTO words (word_id, audio_url, content, meaning, type, place_id) VALUES
(NULL, NULL, 'STORE', '가게', 'WORD', 41), (NULL, NULL, 'ESCALATOR', '에스컬레이터', 'WORD', 41), (NULL, NULL, 'ELEVATOR', '엘리베이터', 'WORD', 41), (NULL, NULL, 'SALE', '세일', 'WORD', 41), (NULL, NULL, 'DISCOUNT', '할인', 'WORD', 41), (NULL, NULL, 'FASHION', '패션', 'WORD', 41), (NULL, NULL, 'CLOTHES', '옷', 'WORD', 41), (NULL, NULL, 'SHOES', '신발', 'WORD', 41), (NULL, NULL, 'BAG', '가방', 'WORD', 41), (NULL, NULL, 'CASHIER', '계산대', 'WORD', 41), (NULL, NULL, 'FITTING ROOM', '탈의실', 'WORD', 41), (NULL, NULL, 'MIRROR', '거울', 'WORD', 41), (NULL, NULL, 'FOOD COURT', '푸드코트', 'WORD', 41), (NULL, NULL, 'BRAND', '브랜드', 'WORD', 41), (NULL, NULL, 'POSTER', '포스터', 'WORD', 41), (NULL, NULL, 'PERFUME', '향수', 'WORD', 41), (NULL, NULL, 'JEWELRY', '보석', 'WORD', 41), (NULL, NULL, 'LINE', '줄', 'WORD', 41), (NULL, NULL, 'HANGER', '옷걸이', 'WORD', 41), (NULL, NULL, 'CHECKOUT', '계산', 'WORD', 41), (NULL, NULL, 'SNACK BAR', '스낵바', 'WORD', 41), (NULL, NULL, 'KIDS ZONE', '키즈존', 'WORD', 41), (NULL, NULL, 'PARKING LOT', '주차장', 'WORD', 41), (NULL, NULL, 'DIRECTORY', '안내도', 'WORD', 41), (NULL, NULL, 'BENCH', '벤치', 'WORD', 41),
(NULL, NULL, 'ROLLER COASTER', '롤러코스터', 'WORD', 42), (NULL, NULL, 'RIDE', '놀이기구', 'WORD', 42), (NULL, NULL, 'TICKET', '티켓', 'WORD', 42), (NULL, NULL, 'BOOTH', '부스', 'WORD', 42), (NULL, NULL, 'LINE', '줄', 'WORD', 42), (NULL, NULL, 'MAP', '지도', 'WORD', 42), (NULL, NULL, 'SNACK', '간식', 'WORD', 42), (NULL, NULL, 'MASCOT', '마스코트', 'WORD', 42), (NULL, NULL, 'PARADE', '퍼레이드', 'WORD', 42), (NULL, NULL, 'FIREWORKS', '불꽃놀이', 'WORD', 42), (NULL, NULL, 'COTTON CANDY', '솜사탕', 'WORD', 42), (NULL, NULL, 'POPCORN', '팝콘', 'WORD', 42), (NULL, NULL, 'GAME', '게임', 'WORD', 42), (NULL, NULL, 'TOY', '장난감', 'WORD', 42), (NULL, NULL, 'BALLOON', '풍선', 'WORD', 42), (NULL, NULL, 'HAUNTED HOUSE', '유령의 집', 'WORD', 42), (NULL, NULL, 'MERRY-GO-ROUND', '회전목마', 'WORD', 42), (NULL, NULL, 'SWING RIDE', '회전 그네', 'WORD', 42), (NULL, NULL, 'BUMPER CAR', '범퍼카', 'WORD', 42), (NULL, NULL, 'WATER RIDE', '워터 라이드', 'WORD', 42), (NULL, NULL, 'SAFETY BAR', '안전바', 'WORD', 42), (NULL, NULL, 'CAMERA', '카메라', 'WORD', 42), (NULL, NULL, 'SHOW', '공연', 'WORD', 42), (NULL, NULL, 'STAGE', '무대', 'WORD', 42), (NULL, NULL, 'PRIZE', '상품', 'WORD', 42),
(NULL, NULL, 'SOCCER', '축구', 'WORD', 43), (NULL, NULL, 'BASEBALL', '야구', 'WORD', 43), (NULL, NULL, 'TENNIS', '테니스', 'WORD', 43), (NULL, NULL, 'BASKETBALL', '농구', 'WORD', 43), (NULL, NULL, 'GOAL', '골대', 'WORD', 43), (NULL, NULL, 'SCOREBOARD', '점수판', 'WORD', 43), (NULL, NULL, 'NET', '네트', 'WORD', 43), (NULL, NULL, 'RACKET', '라켓', 'WORD', 43), (NULL, NULL, 'BAT', '배트', 'WORD', 43), (NULL, NULL, 'GLOVE', '글러브', 'WORD', 43), (NULL, NULL, 'UNIFORM', '유니폼', 'WORD', 43), (NULL, NULL, 'WHISTLE', '호루라기', 'WORD', 43), (NULL, NULL, 'REFEREE', '심판', 'WORD', 43), (NULL, NULL, 'COACH', '코치', 'WORD', 43), (NULL, NULL, 'PLAYER', '선수', 'WORD', 43), (NULL, NULL, 'BENCH', '벤치', 'WORD', 43), (NULL, NULL, 'WATER BOTTLE', '물병', 'WORD', 43), (NULL, NULL, 'SNEAKERS', '운동화', 'WORD', 43), (NULL, NULL, 'CAPTAIN', '주장', 'WORD', 43), (NULL, NULL, 'TEAM', '팀', 'WORD', 43), (NULL, NULL, 'PASS', '패스', 'WORD', 43), (NULL, NULL, 'SHOOT', '슛', 'WORD', 43), (NULL, NULL, 'RUN', '달리기', 'WORD', 43), (NULL, NULL, 'FIELD', '경기장', 'WORD', 43), (NULL, NULL, 'PRACTICE', '연습', 'WORD', 43),
(NULL, NULL, 'TREADMILL', '러닝머신', 'WORD', 44), (NULL, NULL, 'DUMBBELL', '덤벨', 'WORD', 44), (NULL, NULL, 'BARBELL', '바벨', 'WORD', 44), (NULL, NULL, 'YOGA MAT', '요가 매트', 'WORD', 44), (NULL, NULL, 'STRETCHING', '스트레칭', 'WORD', 44), (NULL, NULL, 'TRAINER', '트레이너', 'WORD', 44), (NULL, NULL, 'MUSCLE', '근육', 'WORD', 44), (NULL, NULL, 'WEIGHT', '무게/운동기구', 'WORD', 44), (NULL, NULL, 'SQUAT', '스쿼트', 'WORD', 44), (NULL, NULL, 'PUSH-UP', '팔굽혀펴기', 'WORD', 44), (NULL, NULL, 'SIT-UP', '윗몸일으키기', 'WORD', 44), (NULL, NULL, 'LOCKER', '사물함', 'WORD', 44), (NULL, NULL, 'SHOWER', '샤워', 'WORD', 44), (NULL, NULL, 'TOWEL', '수건', 'WORD', 44), (NULL, NULL, 'SHOES', '신발', 'WORD', 44), (NULL, NULL, 'JUMP ROPE', '줄넘기', 'WORD', 44), (NULL, NULL, 'WATER BOTTLE', '물병', 'WORD', 44), (NULL, NULL, 'GLOVES', '장갑', 'WORD', 44), (NULL, NULL, 'BENCH', '벤치', 'WORD', 44), (NULL, NULL, 'TREADMILL BELT', '러닝머신 벨트', 'WORD', 44), (NULL, NULL, 'TIMER', '타이머', 'WORD', 44), (NULL, NULL, 'MIRROR', '거울', 'WORD', 44), (NULL, NULL, 'SPEAKER', '스피커', 'WORD', 44), (NULL, NULL, 'ROUTINE', '운동 루틴', 'WORD', 44),
(NULL, NULL, 'GOGGLES', '물안경', 'WORD', 45), (NULL, NULL, 'SWIMSUIT', '수영복', 'WORD', 45), (NULL, NULL, 'CAP', '수영모', 'WORD', 45), (NULL, NULL, 'LANE', '레인', 'WORD', 45), (NULL, NULL, 'FLOAT', '부표/킥판', 'WORD', 45), (NULL, NULL, 'KICKBOARD', '킥판', 'WORD', 45), (NULL, NULL, 'LIFEGUARD', '안전 요원', 'WORD', 45), (NULL, NULL, 'WHISTLE', '호루라기', 'WORD', 45), (NULL, NULL, 'DIVING BOARD', '다이빙대', 'WORD', 45), (NULL, NULL, 'WATER', '물', 'WORD', 45), (NULL, NULL, 'SPLASH', '물튀김', 'WORD', 45), (NULL, NULL, 'TOWEL', '수건', 'WORD', 45), (NULL, NULL, 'LOCKER', '사물함', 'WORD', 45), (NULL, NULL, 'SHOWER', '샤워', 'WORD', 45), (NULL, NULL, 'SUNSCREEN', '선크림', 'WORD', 45), (NULL, NULL, 'SWIM CLASS', '수영 수업', 'WORD', 45), (NULL, NULL, 'COACH', '코치', 'WORD', 45), (NULL, NULL, 'JUMPING', '점프', 'WORD', 45), (NULL, NULL, 'DEEP END', '깊은 곳', 'WORD', 45), (NULL, NULL, 'SHALLOW END', '얕은 곳', 'WORD', 45), (NULL, NULL, 'LADDER', '사다리', 'WORD', 45), (NULL, NULL, 'ROPE', '밧줄/레인 줄', 'WORD', 45), (NULL, NULL, 'FLIP TURN', '턴', 'WORD', 45), (NULL, NULL, 'POOLSIDE', '수영장 가장자리', 'WORD', 45), (NULL, NULL, 'TILES', '타일', 'WORD', 45);

-- 46. THEATER ~ 50. COMPUTER ROOM
INSERT INTO words (word_id, audio_url, content, meaning, type, place_id) VALUES
(NULL, NULL, 'STAGE', '무대', 'WORD', 46), (NULL, NULL, 'ACTOR', '남자 배우', 'WORD', 46), (NULL, NULL, 'ACTRESS', '여자 배우', 'WORD', 46), (NULL, NULL, 'SCRIPT', '대본', 'WORD', 46), (NULL, NULL, 'COSTUME', '의상', 'WORD', 46), (NULL, NULL, 'SPOTLIGHT', '조명', 'WORD', 46), (NULL, NULL, 'CURTAIN', '커튼', 'WORD', 46), (NULL, NULL, 'AUDIENCE', '관객', 'WORD', 46), (NULL, NULL, 'TICKET', '티켓', 'WORD', 46), (NULL, NULL, 'SEAT', '좌석', 'WORD', 46), (NULL, NULL, 'DIRECTOR', '연출가', 'WORD', 46), (NULL, NULL, 'REHEARSAL', '리허설', 'WORD', 46), (NULL, NULL, 'PROP', '소품', 'WORD', 46), (NULL, NULL, 'SCENE', '장면', 'WORD', 46), (NULL, NULL, 'BACKSTAGE', '무대 뒤', 'WORD', 46), (NULL, NULL, 'DRESSING ROOM', '대기실/분장실', 'WORD', 46), (NULL, NULL, 'MAKEUP', '분장', 'WORD', 46), (NULL, NULL, 'MICROPHONE', '마이크', 'WORD', 46), (NULL, NULL, 'SPEAKER', '스피커', 'WORD', 46), (NULL, NULL, 'ORCHESTRA', '오케스트라', 'WORD', 46), (NULL, NULL, 'SHOW', '공연', 'WORD', 46), (NULL, NULL, 'APPLAUSE', '박수', 'WORD', 46), (NULL, NULL, 'PROGRAM', '프로그램 북', 'WORD', 46), (NULL, NULL, 'PERFORMANCE', '공연', 'WORD', 46), (NULL, NULL, 'USHER', '안내원', 'WORD', 46),
(NULL, NULL, 'PIANO', '피아노', 'WORD', 47), (NULL, NULL, 'GUITAR', '기타', 'WORD', 47), (NULL, NULL, 'DRUM', '드럼', 'WORD', 47), (NULL, NULL, 'VIOLIN', '바이올린', 'WORD', 47), (NULL, NULL, 'FLUTE', '플루트', 'WORD', 47), (NULL, NULL, 'TRUMPET', '트럼펫', 'WORD', 47), (NULL, NULL, 'MICROPHONE', '마이크', 'WORD', 47), (NULL, NULL, 'SPEAKER', '스피커', 'WORD', 47), (NULL, NULL, 'SHEET MUSIC', '악보', 'WORD', 47), (NULL, NULL, 'NOTES', '음표', 'WORD', 47), (NULL, NULL, 'RHYTHM', '리듬', 'WORD', 47), (NULL, NULL, 'MELODY', '멜로디', 'WORD', 47), (NULL, NULL, 'PRACTICE', '연습', 'WORD', 47), (NULL, NULL, 'BAND', '밴드', 'WORD', 47), (NULL, NULL, 'CHOIR', '합창단', 'WORD', 47), (NULL, NULL, 'CONDUCTOR', '지휘자', 'WORD', 47), (NULL, NULL, 'STAND', '보면대', 'WORD', 47), (NULL, NULL, 'CASE', '악기 케이스', 'WORD', 47), (NULL, NULL, 'TUNING', '조율', 'WORD', 47), (NULL, NULL, 'HEADPHONES', '헤드폰', 'WORD', 47), (NULL, NULL, 'CABLE', '케이블', 'WORD', 47), (NULL, NULL, 'AMPLIFIER', '엠프', 'WORD', 47), (NULL, NULL, 'SONG', '노래', 'WORD', 47), (NULL, NULL, 'BEAT', '박자', 'WORD', 47), (NULL, NULL, 'HARMONY', '화음', 'WORD', 47),
(NULL, NULL, 'PAINT', '물감', 'WORD', 48), (NULL, NULL, 'BRUSH', '붓', 'WORD', 48), (NULL, NULL, 'PALETTE', '팔레트', 'WORD', 48), (NULL, NULL, 'CANVAS', '캔버스', 'WORD', 48), (NULL, NULL, 'PAPER', '종이', 'WORD', 48), (NULL, NULL, 'PENCIL', '연필', 'WORD', 48), (NULL, NULL, 'MARKER', '마카', 'WORD', 48), (NULL, NULL, 'CRAYON', '크레용', 'WORD', 48), (NULL, NULL, 'CHALK', '분필', 'WORD', 48), (NULL, NULL, 'EASEL', '이젤', 'WORD', 48), (NULL, NULL, 'APRON', '앞치마', 'WORD', 48), (NULL, NULL, 'CLAY', '점토', 'WORD', 48), (NULL, NULL, 'SCULPTURE', '조각', 'WORD', 48), (NULL, NULL, 'GLUE', '풀', 'WORD', 48), (NULL, NULL, 'SCISSORS', '가위', 'WORD', 48), (NULL, NULL, 'CRAFT', '공예', 'WORD', 48), (NULL, NULL, 'COLOR', '색깔', 'WORD', 48), (NULL, NULL, 'SHADE', '명암', 'WORD', 48), (NULL, NULL, 'PATTERN', '무늬', 'WORD', 48), (NULL, NULL, 'TEXTURE', '질감', 'WORD', 48), (NULL, NULL, 'SHAPE', '모양', 'WORD', 48), (NULL, NULL, 'DESIGN', '디자인', 'WORD', 48), (NULL, NULL, 'RULER', '자', 'WORD', 48), (NULL, NULL, 'ERASER', '지우개', 'WORD', 48), (NULL, NULL, 'SPONGE', '스펀지', 'WORD', 48),
(NULL, NULL, 'BEAKER', '비커', 'WORD', 49), (NULL, NULL, 'TEST TUBE', '시험관', 'WORD', 49), (NULL, NULL, 'FLASK', '플라스크', 'WORD', 49), (NULL, NULL, 'MICROSCOPE', '현미경', 'WORD', 49), (NULL, NULL, 'SLIDE', '슬라이드', 'WORD', 49), (NULL, NULL, 'EXPERIMENT', '실험', 'WORD', 49), (NULL, NULL, 'GOGGLES', '보안경', 'WORD', 49), (NULL, NULL, 'GLOVES', '장갑', 'WORD', 49), (NULL, NULL, 'LAB COAT', '가운', 'WORD', 49), (NULL, NULL, 'CHEMICALS', '화학 약품', 'WORD', 49), (NULL, NULL, 'REACTION', '반응', 'WORD', 49), (NULL, NULL, 'GAS', '기체', 'WORD', 49), (NULL, NULL, 'LIQUID', '액체', 'WORD', 49), (NULL, NULL, 'SOLID', '고체', 'WORD', 49), (NULL, NULL, 'MEASUREMENT', '측정', 'WORD', 49), (NULL, NULL, 'SCALE', '저울', 'WORD', 49), (NULL, NULL, 'THERMOMETER', '온도계', 'WORD', 49), (NULL, NULL, 'BURNER', '버너', 'WORD', 49), (NULL, NULL, 'SAFETY SIGN', '안전 표지', 'WORD', 49), (NULL, NULL, 'OBSERVATION', '관찰', 'WORD', 49), (NULL, NULL, 'DATA', '데이터', 'WORD', 49), (NULL, NULL, 'NOTES', '기록', 'WORD', 49), (NULL, NULL, 'SAMPLE', '표본', 'WORD', 49), (NULL, NULL, 'MAGNET', '자석', 'WORD', 49), (NULL, NULL, 'ELECTRICITY', '전기', 'WORD', 49),
(NULL, NULL, 'COMPUTER', '컴퓨터', 'WORD', 50), (NULL, NULL, 'MONITOR', '모니터', 'WORD', 50), (NULL, NULL, 'KEYBOARD', '키보드', 'WORD', 50), (NULL, NULL, 'MOUSE', '마우스', 'WORD', 50), (NULL, NULL, 'PRINTER', '프린터', 'WORD', 50), (NULL, NULL, 'USB', 'USB', 'WORD', 50), (NULL, NULL, 'CABLE', '케이블', 'WORD', 50), (NULL, NULL, 'SPEAKER', '스피커', 'WORD', 50), (NULL, NULL, 'HEADPHONE', '헤드폰', 'WORD', 50), (NULL, NULL, 'MICROPHONE', '마이크', 'WORD', 50), (NULL, NULL, 'FILE', '파일', 'WORD', 50), (NULL, NULL, 'FOLDER', '폴더', 'WORD', 50), (NULL, NULL, 'DESKTOP', '컴퓨터', 'WORD', 50), (NULL, NULL, 'PROGRAM', '프로그램', 'WORD', 50), (NULL, NULL, 'SOFTWARE', '소프트웨어', 'WORD', 50), (NULL, NULL, 'HARDWARE', '하드웨어', 'WORD', 50), (NULL, NULL, 'CLICK', '클릭', 'WORD', 50), (NULL, NULL, 'SCREEN', '화면', 'WORD', 50), (NULL, NULL, 'SEARCH', '검색', 'WORD', 50), (NULL, NULL, 'INTERNET', '인터넷', 'WORD', 50), (NULL, NULL, 'TYPING', '타자', 'WORD', 50), (NULL, NULL, 'CODING', '코딩', 'WORD', 50), (NULL, NULL, 'LOGIN', '로그인', 'WORD', 50), (NULL, NULL, 'PASSWORD', '비밀번호', 'WORD', 50), (NULL, NULL, 'SERVER', '서버', 'WORD', 50);

-- 51. GARDEN ~ 55. STADIUM
INSERT INTO words (word_id, audio_url, content, meaning, type, place_id) VALUES
(NULL, NULL, 'FLOWER', '꽃', 'WORD', 51), (NULL, NULL, 'SEED', '씨앗', 'WORD', 51), (NULL, NULL, 'SOIL', '흙', 'WORD', 51), (NULL, NULL, 'POT', '화분', 'WORD', 51), (NULL, NULL, 'WATERING CAN', '물뿌리개', 'WORD', 51), (NULL, NULL, 'HOSE', '호스', 'WORD', 51), (NULL, NULL, 'SHOVEL', '삽', 'WORD', 51), (NULL, NULL, 'RAKE', '갈퀴', 'WORD', 51), (NULL, NULL, 'WHEELBARROW', '손수레', 'WORD', 51), (NULL, NULL, 'PLANT', '식물', 'WORD', 51), (NULL, NULL, 'LEAF', '잎', 'WORD', 51), (NULL, NULL, 'STEM', '줄기', 'WORD', 51), (NULL, NULL, 'ROOT', '뿌리', 'WORD', 51), (NULL, NULL, 'SUNLIGHT', '햇빛', 'WORD', 51), (NULL, NULL, 'SHADOW', '그림자', 'WORD', 51), (NULL, NULL, 'GREENHOUSE', '온실', 'WORD', 51), (NULL, NULL, 'VEGETABLE', '채소', 'WORD', 51), (NULL, NULL, 'FRUIT', '과일', 'WORD', 51), (NULL, NULL, 'BEE', '벌', 'WORD', 51), (NULL, NULL, 'BUTTERFLY', '나비', 'WORD', 51), (NULL, NULL, 'WORM', '지렁이', 'WORD', 51), (NULL, NULL, 'COMPOST', '퇴비', 'WORD', 51), (NULL, NULL, 'FERTILIZER', '비료', 'WORD', 51), (NULL, NULL, 'SPROUT', '새싹', 'WORD', 51), (NULL, NULL, 'HEDGE', '울타리', 'WORD', 51),
(NULL, NULL, 'BREAD', '빵', 'WORD', 52), (NULL, NULL, 'CAKE', '케이크', 'WORD', 52), (NULL, NULL, 'COOKIE', '쿠키', 'WORD', 52), (NULL, NULL, 'PIE', '파이', 'WORD', 52), (NULL, NULL, 'DOUGHNUT', '도넛', 'WORD', 52), (NULL, NULL, 'MUFFIN', '머핀', 'WORD', 52), (NULL, NULL, 'SANDWICH', '샌드위치', 'WORD', 52), (NULL, NULL, 'FLOUR', '밀가루', 'WORD', 52), (NULL, NULL, 'SUGAR', '설탕', 'WORD', 52), (NULL, NULL, 'BUTTER', '버터', 'WORD', 52), (NULL, NULL, 'OVEN', '오븐', 'WORD', 52), (NULL, NULL, 'TRAY', '쟁반', 'WORD', 52), (NULL, NULL, 'ROLLING PIN', '밀대', 'WORD', 52), (NULL, NULL, 'MIXER', '반죽기', 'WORD', 52), (NULL, NULL, 'ICING', '아이싱', 'WORD', 52), (NULL, NULL, 'CREAM', '크림', 'WORD', 52), (NULL, NULL, 'CHOCOLATE', '초콜릿', 'WORD', 52), (NULL, NULL, 'JAM', '잼', 'WORD', 52), (NULL, NULL, 'YEAST', '효모', 'WORD', 52), (NULL, NULL, 'RECIPE', '레시피', 'WORD', 52), (NULL, NULL, 'TONGS', '집게', 'WORD', 52), (NULL, NULL, 'COUNTER', '진열대', 'WORD', 52), (NULL, NULL, 'SHELF', '선반', 'WORD', 52), (NULL, NULL, 'SMELL', '냄새', 'WORD', 52), (NULL, NULL, 'BAKER', '제빵사', 'WORD', 52),
(NULL, NULL, 'MEDICINE', '약', 'WORD', 53), (NULL, NULL, 'PILL', '알약', 'WORD', 53), (NULL, NULL, 'TABLET', '정제', 'WORD', 53), (NULL, NULL, 'SYRUP', '시럽', 'WORD', 53), (NULL, NULL, 'BANDAGE', '붕대', 'WORD', 53), (NULL, NULL, 'OINTMENT', '연고', 'WORD', 53), (NULL, NULL, 'VITAMINS', '비타민', 'WORD', 53), (NULL, NULL, 'PRESCRIPTION', '처방전', 'WORD', 53), (NULL, NULL, 'PHARMACIST', '약사', 'WORD', 53), (NULL, NULL, 'COUNTER', '약제대', 'WORD', 53), (NULL, NULL, 'RECEIPT', '영수증', 'WORD', 53), (NULL, NULL, 'TISSUE', '휴지', 'WORD', 53), (NULL, NULL, 'MASK', '마스크', 'WORD', 53), (NULL, NULL, 'SANITIZER', '소독제', 'WORD', 53), (NULL, NULL, 'THERMOMETER', '체온계', 'WORD', 53), (NULL, NULL, 'COTTON SWAB', '면봉', 'WORD', 53), (NULL, NULL, 'PAINKILLER', '진통제', 'WORD', 53), (NULL, NULL, 'COLD MEDICINE', '감기약', 'WORD', 53), (NULL, NULL, 'COUGH DROP', '목캔디', 'WORD', 53), (NULL, NULL, 'CREAM', '크림/연고', 'WORD', 53), (NULL, NULL, 'ALLERGY', '알레르기', 'WORD', 53), (NULL, NULL, 'BOTTLE', '약병', 'WORD', 53), (NULL, NULL, 'PACKAGE', '포장', 'WORD', 53), (NULL, NULL, 'LABEL', '라벨', 'WORD', 53), (NULL, NULL, 'SHELF', '선반', 'WORD', 53),
(NULL, NULL, 'CAT', '고양이', 'WORD', 54), (NULL, NULL, 'DOG', '개', 'WORD', 54), (NULL, NULL, 'HAMSTER', '햄스터', 'WORD', 54), (NULL, NULL, 'RABBIT', '토끼', 'WORD', 54), (NULL, NULL, 'TURTLE', '거북이', 'WORD', 54), (NULL, NULL, 'FISH', '물고기', 'WORD', 54), (NULL, NULL, 'BIRD', '새', 'WORD', 54), (NULL, NULL, 'CAGE', '우리', 'WORD', 54), (NULL, NULL, 'FOOD', '사료', 'WORD', 54), (NULL, NULL, 'TREAT', '간식', 'WORD', 54), (NULL, NULL, 'SNACK', '간식', 'WORD', 54), (NULL, NULL, 'LEASH', '목줄', 'WORD', 54), (NULL, NULL, 'COLLAR', '목걸이', 'WORD', 54), (NULL, NULL, 'TOY', '장난감', 'WORD', 54), (NULL, NULL, 'BRUSH', '빗', 'WORD', 54), (NULL, NULL, 'SHAMPOO', '샴푸', 'WORD', 54), (NULL, NULL, 'AQUARIUM', '수족관', 'WORD', 54), (NULL, NULL, 'BOWL', '밥그릇', 'WORD', 54), (NULL, NULL, 'BEDDING', '깔개', 'WORD', 54), (NULL, NULL, 'WHEEL', '쳇바퀴', 'WORD', 54), (NULL, NULL, 'PET HOUSE', '애완동물 집', 'WORD', 54), (NULL, NULL, 'TANK', '수조', 'WORD', 54), (NULL, NULL, 'SAND', '모래', 'WORD', 54), (NULL, NULL, 'ROCKS', '자갈', 'WORD', 54), (NULL, NULL, 'WATER BOTTLE', '급수기', 'WORD', 54),
(NULL, NULL, 'SEAT', '좌석', 'WORD', 55), (NULL, NULL, 'TICKET', '티켓', 'WORD', 55), (NULL, NULL, 'SCOREBOARD', '점수판', 'WORD', 55), (NULL, NULL, 'TEAM', '팀', 'WORD', 55), (NULL, NULL, 'FANS', '팬', 'WORD', 55), (NULL, NULL, 'CHEER', '응원', 'WORD', 55), (NULL, NULL, 'CHANT', '응원가', 'WORD', 55), (NULL, NULL, 'WAVE', '파도타기', 'WORD', 55), (NULL, NULL, 'GOAL', '골', 'WORD', 55), (NULL, NULL, 'MATCH', '경기', 'WORD', 55), (NULL, NULL, 'COACH', '감독', 'WORD', 55), (NULL, NULL, 'REFEREE', '심판', 'WORD', 55), (NULL, NULL, 'UNIFORM', '유니폼', 'WORD', 55), (NULL, NULL, 'FIELD', '경기장', 'WORD', 55), (NULL, NULL, 'TRACK', '트랙', 'WORD', 55), (NULL, NULL, 'BANNER', '현수막', 'WORD', 55), (NULL, NULL, 'GIANT SCREEN', '전광판', 'WORD', 55), (NULL, NULL, 'ANNOUNCER', '아나운서', 'WORD', 55), (NULL, NULL, 'SNACK BAR', '매점', 'WORD', 55), (NULL, NULL, 'DRINK', '음료', 'WORD', 55), (NULL, NULL, 'FLAG', '깃발', 'WORD', 55), (NULL, NULL, 'HAT', '모자', 'WORD', 55), (NULL, NULL, 'MERCHANDISE', '기념품', 'WORD', 55), (NULL, NULL, 'ENTRANCE', '입구', 'WORD', 55), (NULL, NULL, 'EXIT', '출구', 'WORD', 55);

-- 56. THEME CAFÉ ~ 60. CAMPING SITE
INSERT INTO words (word_id, audio_url, content, meaning, type, place_id) VALUES
(NULL, NULL, 'DECOR', '장식', 'WORD', 56), (NULL, NULL, 'THEME', '테마', 'WORD', 56), (NULL, NULL, 'DESSERT', '디저트', 'WORD', 56), (NULL, NULL, 'TEA', '차', 'WORD', 56), (NULL, NULL, 'PHOTO ZONE', '포토존', 'WORD', 56), (NULL, NULL, 'LIGHTS', '조명', 'WORD', 56), (NULL, NULL, 'SOFA', '소파', 'WORD', 56), (NULL, NULL, 'FRAME', '액자', 'WORD', 56), (NULL, NULL, 'MUG', '머그잔', 'WORD', 56), (NULL, NULL, 'CUP', '컵', 'WORD', 56), (NULL, NULL, 'STRAW', '빨대', 'WORD', 56), (NULL, NULL, 'COOKIE', '쿠키', 'WORD', 56), (NULL, NULL, 'WAFFLE', '와플', 'WORD', 56), (NULL, NULL, 'SLOGAN', '문구', 'WORD', 56), (NULL, NULL, 'MENU BOARD', '메뉴판', 'WORD', 56), (NULL, NULL, 'COUNTER', '카운터', 'WORD', 56), (NULL, NULL, 'STAFF', '직원', 'WORD', 56), (NULL, NULL, 'CUSTOMER', '손님', 'WORD', 56), (NULL, NULL, 'DISPLAY', '진열', 'WORD', 56), (NULL, NULL, 'SHELF', '선반', 'WORD', 56), (NULL, NULL, 'PLANT', '식물', 'WORD', 56), (NULL, NULL, 'POSTER', '포스터', 'WORD', 56), (NULL, NULL, 'DESIGN', '디자인', 'WORD', 56), (NULL, NULL, 'STICKER', '스티커', 'WORD', 56), (NULL, NULL, 'ATMOSPHERE', '분위기', 'WORD', 56),
(NULL, NULL, 'SNACK', '과자', 'WORD', 57), (NULL, NULL, 'DRINK', '음료수', 'WORD', 57), (NULL, NULL, 'ICE CREAM', '아이스크림', 'WORD', 57), (NULL, NULL, 'RAMEN', '라면', 'WORD', 57), (NULL, NULL, 'MICROWAVE', '전자레인지', 'WORD', 57), (NULL, NULL, 'RECEIPT', '영수증', 'WORD', 57), (NULL, NULL, 'COUNTER', '계산대', 'WORD', 57), (NULL, NULL, 'CLERK', '점원', 'WORD', 57), (NULL, NULL, 'CUP NOODLES', '컵라면', 'WORD', 57), (NULL, NULL, 'WATER', '물', 'WORD', 57), (NULL, NULL, 'JUICE', '주스', 'WORD', 57), (NULL, NULL, 'SANDWICH', '샌드위치', 'WORD', 57), (NULL, NULL, 'TRIANGLE KIMBAP', '삼각김밥', 'WORD', 57), (NULL, NULL, 'CANDY', '사탕', 'WORD', 57), (NULL, NULL, 'GUM', '껌', 'WORD', 57), (NULL, NULL, 'CHIPS', '감자칩', 'WORD', 57), (NULL, NULL, 'FREEZER', '냉동고', 'WORD', 57), (NULL, NULL, 'SHELF', '진열대', 'WORD', 57), (NULL, NULL, 'BARCODE', '바코드', 'WORD', 57), (NULL, NULL, 'PRICE TAG', '가격표', 'WORD', 57), (NULL, NULL, 'SALE', '할인', 'WORD', 57), (NULL, NULL, 'TRASH CAN', '쓰레기통', 'WORD', 57), (NULL, NULL, 'COFFEE MACHINE', '커피 머신', 'WORD', 57), (NULL, NULL, 'PLASTIC BAG', '비닐봉지', 'WORD', 57), (NULL, NULL, 'BILL', '지폐', 'WORD', 57),
(NULL, NULL, 'ROBOT', '로봇', 'WORD', 58), (NULL, NULL, 'EXHIBIT', '전시물', 'WORD', 58), (NULL, NULL, 'MODEL', '모형', 'WORD', 58), (NULL, NULL, 'PLANET', '행성', 'WORD', 58), (NULL, NULL, 'TELESCOPE', '망원경', 'WORD', 58), (NULL, NULL, 'SPACE', '우주', 'WORD', 58), (NULL, NULL, 'ELECTRICITY', '전기', 'WORD', 58), (NULL, NULL, 'MAGNET', '자석', 'WORD', 58), (NULL, NULL, 'EXPERIMENT', '실험', 'WORD', 58), (NULL, NULL, 'CIRCUIT', '회로', 'WORD', 58), (NULL, NULL, 'BATTERY', '건전지', 'WORD', 58), (NULL, NULL, 'SWITCH', '스위치', 'WORD', 58), (NULL, NULL, 'GEAR', '기어/톱니바퀴', 'WORD', 58), (NULL, NULL, 'INVENTION', '발명', 'WORD', 58), (NULL, NULL, 'TECHNOLOGY', '기술', 'WORD', 58), (NULL, NULL, 'QUIZ', '퀴즈', 'WORD', 58), (NULL, NULL, 'HANDS-ON', '체험', 'WORD', 58), (NULL, NULL, 'PUZZLE', '퍼즐', 'WORD', 58), (NULL, NULL, 'DISPLAY', '화면', 'WORD', 58), (NULL, NULL, '3D', '3D', 'WORD', 58), (NULL, NULL, 'VR', '가상현실', 'WORD', 58), (NULL, NULL, 'SENSOR', '센서', 'WORD', 58), (NULL, NULL, 'SCREEN', '스크린', 'WORD', 58), (NULL, NULL, 'CODING', '코딩', 'WORD', 58), (NULL, NULL, 'HOLOGRAM', '홀로그램', 'WORD', 58),
(NULL, NULL, 'FISH', '물고기', 'WORD', 59), (NULL, NULL, 'SHARK', '상어', 'WORD', 59), (NULL, NULL, 'WHALE', '고래', 'WORD', 59), (NULL, NULL, 'DOLPHIN', '돌고래', 'WORD', 59), (NULL, NULL, 'TURTLE', '거북이', 'WORD', 59), (NULL, NULL, 'CORAL', '산호', 'WORD', 59), (NULL, NULL, 'SEAWEED', '해초', 'WORD', 59), (NULL, NULL, 'JELLYFISH', '해파리', 'WORD', 59), (NULL, NULL, 'STINGRAY', '가오리', 'WORD', 59), (NULL, NULL, 'CRAB', '게', 'WORD', 59), (NULL, NULL, 'SHRIMP', '새우', 'WORD', 59), (NULL, NULL, 'SEAHORSE', '해마', 'WORD', 59), (NULL, NULL, 'TANK', '수조', 'WORD', 59), (NULL, NULL, 'GLASS', '유리', 'WORD', 59), (NULL, NULL, 'DIVER', '잠수부', 'WORD', 59), (NULL, NULL, 'FEEDING SHOW', '먹이 주기 쇼', 'WORD', 59), (NULL, NULL, 'BUBBLES', '거품', 'WORD', 59), (NULL, NULL, 'WATER', '물', 'WORD', 59), (NULL, NULL, 'SHELL', '조개', 'WORD', 59), (NULL, NULL, 'ROCK', '바위', 'WORD', 59), (NULL, NULL, 'SAND', '모래', 'WORD', 59), (NULL, NULL, 'STARFISH', '불가사리', 'WORD', 59), (NULL, NULL, 'LIGHT', '조명', 'WORD', 59), (NULL, NULL, 'PATH', '관람로', 'WORD', 59), (NULL, NULL, 'MAP', '지도', 'WORD', 59),
(NULL, NULL, 'TENT', '텐트', 'WORD', 60), (NULL, NULL, 'SLEEPING BAG', '침낭', 'WORD', 60), (NULL, NULL, 'CAMPFIRE', '캠프파이어', 'WORD', 60), (NULL, NULL, 'LANTERN', '랜턴', 'WORD', 60), (NULL, NULL, 'FLASHLIGHT', '손전등', 'WORD', 60), (NULL, NULL, 'BACKPACK', '배낭', 'WORD', 60), (NULL, NULL, 'STOVE', '스토브', 'WORD', 60), (NULL, NULL, 'POT', '냄비', 'WORD', 60), (NULL, NULL, 'PAN', '프라이팬', 'WORD', 60), (NULL, NULL, 'MARSHMALLOW', '마시멜로', 'WORD', 60), (NULL, NULL, 'STICK', '나뭇가지', 'WORD', 60), (NULL, NULL, 'ROPE', '밧줄', 'WORD', 60), (NULL, NULL, 'BOOTS', '부츠', 'WORD', 60), (NULL, NULL, 'TRAIL', '오솔길', 'WORD', 60), (NULL, NULL, 'MAP', '지도', 'WORD', 60), (NULL, NULL, 'COMPASS', '나침반', 'WORD', 60), (NULL, NULL, 'INSECT REPELLENT', '해충 기피제', 'WORD', 60), (NULL, NULL, 'BOTTLE', '물병', 'WORD', 60), (NULL, NULL, 'COOLER', '아이스박스', 'WORD', 60), (NULL, NULL, 'WOOD', '장작', 'WORD', 60), (NULL, NULL, 'CHAIR', '의자', 'WORD', 60), (NULL, NULL, 'TABLE', '테이블', 'WORD', 60), (NULL, NULL, 'STARS', '별', 'WORD', 60), (NULL, NULL, 'SKY', '하늘', 'WORD', 60), (NULL, NULL, 'RAINCOAT', '우비', 'WORD', 60);

-- ======================================================================
-- games에 게임 정보 넣기
-- ======================================================================

ALTER TABLE games MODIFY game_name ENUM('FALLINGWORDS', 'MYSTERYCARDS', 'MAZEADVENTURE');
INSERT INTO games (game_id, game_name) VALUES (1, 'FALLINGWORDS');
INSERT INTO games (game_id, game_name) VALUES (2, 'MYSTERYCARDS');
INSERT INTO games (game_id, game_name) VALUES (3, 'MAZEADVENTURE');

-- ======================================================================
-- words와 관련된 설명 테이블 생성
-- ======================================================================

CREATE TABLE word_details (
    detail_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    word_id BIGINT NOT NULL,
    description_en VARCHAR(500),
    image_url VARCHAR(500),
    CONSTRAINT fk_word_detail_word FOREIGN KEY (word_id) REFERENCES words(word_id)
);

-- ======================================================================
-- maze_map 더미데이터 정보 넣기
-- ======================================================================

-- LEVEL 1: 5x5, 단순 경로, 열쇠 1개
INSERT INTO maze_maps (level, width, height, start_row, start_col, grid_data, item_data)
VALUES (
  'FIRST', 
  5, 5, 0, 0,
  -- Grid: ㄹ자 형태로 꼬아놓음
  '[[2,0,0,1,1], [1,1,0,1,1], [1,0,0,0,1], [1,0,1,0,1], [1,0,0,0,3]]',
  -- Items: 중간 지점(2,2)에 열쇠 배치
  '[{"row":2, "col":2, "type":"KEY"}]'
);

-- LEVEL 2: 7x7, 조금 멂, 유령 함정(Ghost) 등장
INSERT INTO maze_maps (level, width, height, start_row, start_col, grid_data, item_data)
VALUES (
  'SECOND', 
  7, 7, 0, 0,
  -- Grid: 7x7 미로
  '[
    [2,0,1,0,0,0,1],
    [1,0,1,0,1,0,1],
    [1,0,0,0,1,0,1],
    [1,1,1,1,1,0,1],
    [0,0,0,0,0,0,1],
    [0,1,1,1,1,1,1],
    [0,0,0,0,0,0,3]
   ]',
  -- Items: 열쇠(4,2), 유령 함정(2,2) - 지나가면 RUN 쳐야 함
  '[
    {"row":4, "col":2, "type":"KEY"},
    {"row":2, "col":2, "type":"TRAP_GHOST"}
   ]'
);

-- LEVEL 3: 10x10, 복잡함, 구멍 함정(Hole) + 유령
INSERT INTO maze_maps (level, width, height, start_row, start_col, grid_data, item_data)
VALUES (
  'THIRD', 
  10, 10, 0, 0,
  -- Grid: 10x10 미로 (복잡)
  '[
    [2,0,0,0,1,1,1,1,1,1],
    [1,1,1,0,1,0,0,0,0,1],
    [1,0,0,0,0,0,1,1,0,1],
    [1,0,1,1,1,1,1,0,0,1],
    [1,0,0,0,0,0,1,0,1,1],
    [1,1,1,1,1,0,1,0,0,1],
    [1,0,0,0,1,0,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,0,3],
    [1,0,0,0,0,0,0,0,0,1]
   ]',
  -- Items: 열쇠 1개, 함정 2개 (Ghost, Hole)
  '[
    {"row":2, "col":4, "type":"TRAP_HOLE"},
    {"row":6, "col":8, "type":"TRAP_GHOST"},
    {"row":7, "col":2, "type":"KEY"}
   ]'
);
