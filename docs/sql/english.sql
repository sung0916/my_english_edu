create database monster;
show databases;
use monster;
show tables; 

desc users;
select * from users;

desc announcements;
select * from announcements;

desc images;
select * from images;

desc product;
select * from product;

desc places;
select * from places;

desc sentences;
select * from sentences;

desc games;
select * from games;

desc words;
select * from words;

desc word_details;
select * from word_details;

desc game_scores;
select * from game_scores;

alter table user change column user_id user_id bigint;

-- ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 수정 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

drop database monster;

-- ALTER TABLE user MODIFY COLUMN status ENUM('ACTIVE', 'DELETED', 'PENDING');
-- ALTER TABLE images 
--     MODIFY COLUMN related_id BIGINT NULL, -- related_id 컬럼을 NULL 허용으로 변경
--     MODIFY COLUMN related_type VARCHAR(20) NULL; -- related_type 컬럼도 NULL 허용으로 변경
-- ALTER TABLE ANNOUNCEMENTS MODIFY COLUMN status ENUM('ACTIVE', 'INACTIVE') NULL;
-- alter table ANNOUNCEMENTS rename announcements;
-- truncate table images;
-- truncate table product;

-- ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 확인 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
-- 1. 중복 데이터 확인 (count가 1보다 크면 중복임)
SELECT word_id, COUNT(*) 
FROM word_details 
GROUP BY word_id 
HAVING COUNT(*) > 1

-- 2. (만약 중복이 있다면) 중복 데이터 삭제 쿼리
-- 안전 모드 해제
SET SQL_SAFE_UPDATES = 0;

-- word_id가 같은데 detail_id가 더 큰(나중에 들어간) 데이터 삭제
DELETE t1 FROM word_details t1
INNER JOIN word_details t2 
WHERE t1.detail_id > t2.detail_id AND t1.word_id = t2.word_id;

-- 안전 모드 복구
SET SQL_SAFE_UPDATES = 1;

