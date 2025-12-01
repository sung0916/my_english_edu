import { StyleSheet, View } from "react-native";

// 단어 속도 정의 (ms단위)
const LEVEL_CONFIG = {
    FIRST: { dropSpeed: 5000, spawnInterval: 2000 },
    SECOND: { dropSpeed: 4000, spawnInterval: 1500 },
    THIRD: { dropSpeed: 4000, spawnInterval: 1500 },
    FOURTH: { dropSpeed: 3000, spawnInterval: 1200 },
    FIFTH: { dropSpeed: 2000, spawnInterval: 1000 },
};

const FallingWordsGame = () => {
    // const [currentLevel, setCurrentLevel] = useState<GameLevel>('FIRST');
    // const [words, setWords] = useState([]);

    // // 레벨 바뀌면 백엔드에서 데이터 가져오기
    // useEffect(() => {
    //     fetchWordsFromApi(currentLevel).then(data => setWords(data));
    // }, [currentLevel]);

    // // 게임 루프 (단어 떨어뜨리기)
    // useEffect(() => {
    //     if (words.length === 0) return;
    //     const config = LEVEL_CONFIG[currentLevel];

    //     // config.dropspeed 사용하여 애니메이션 실행
    //     // config,spawninterval 마다 새로운 단어 등장

    //     const interval = setInterval(() => {
    //         spawnNewWord(config.dropSpeed);
    //     }, config.spawnInterval);

    //     return () => clearInterval(interval);

    // }, [words, currentLevel]);

    return (
        <View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E8F6F3' },
    gameArea: { flex: 1, position: 'relative', overflow: 'hidden' },
    hud: {
        position: 'absolute',
        top: 70, // 헤더 아래
        right: 20,
        alignItems: 'flex-end',
    },
    hudText: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#2C3E50', 
        marginBottom: 4 
    },
    inputContainer: {
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    input: {
        height: 50,
        borderColor: '#3498DB',
        borderWidth: 2,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 18,
        backgroundColor: '#fff',
    },
});

export default FallingWordsGame;
