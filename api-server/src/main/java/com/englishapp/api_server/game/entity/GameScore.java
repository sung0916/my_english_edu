package com.englishapp.api_server.game.entity;

import com.englishapp.api_server.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@Table(name = "game_scores", uniqueConstraints = {@UniqueConstraint(name = "uk_user_game", columnNames = {"user_id", "game_id"})})
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GameScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "score_id")
    private Long id;

    @Column(name = "high_score", nullable = false)
    private int highScore;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @LastModifiedDate  // 최고 기록 달성일
    @Column(name = "played_at")
    private LocalDateTime playedAt;

    @Builder
    public GameScore(User user, Game game, int highScore) {
        this.user = user;
        this.game = game;
        this.highScore = highScore;
    }

    // 하이 스코어 갱신 로직
    public boolean updateHighScore(int newScore) {
        if (newScore > this.highScore) {
            this.highScore = newScore;
            return true;
        }
        return false;
    }
}
