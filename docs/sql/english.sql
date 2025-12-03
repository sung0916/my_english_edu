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
select * from words;

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