create database monster;
show databases;
use monster;
show tables;

desc user;
select * from user;

alter table user change column user_id user_id bigint;
-- ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 수정 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

-- drop database monster;

-- ALTER TABLE user MODIFY COLUMN status ENUM('ACTIVE', 'DELETED', 'PENDING');