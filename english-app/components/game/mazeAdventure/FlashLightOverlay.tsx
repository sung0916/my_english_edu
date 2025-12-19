import { StyleSheet, useWindowDimensions, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

interface Props {
    radius?: number;  // 밝은 영역
}

export default function FlashlightOverlay({ radius = 150 }: Props) {
    const {width, height} = useWindowDimensions();

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg height="100%" width="100%">
                <Defs>
                    {/* 
                      cx, cy: 그라데이션 중심 (50% = 화면 중앙)
                      rx, ry: 그라데이션 반경
                    */}
                    <RadialGradient
                        id="grad"
                        cx="50%"
                        cy="50%"
                        rx={radius}
                        ry={radius}
                        gradientUnits="userSpaceOnUse"
                    >
                        {/* 중심부: 완전 투명 (보임) */}
                        <Stop offset="0" stopColor="black" stopOpacity="0" />
                        {/* 중간: 서서히 어두워짐 (부드러운 경계) */}
                        <Stop offset="0.6" stopColor="black" stopOpacity="0.4" />
                        <Stop offset="0.8" stopColor="black" stopOpacity="0.8" />
                        {/* 바깥쪽: 완전 검정 (안 보임) */}
                        <Stop offset="1" stopColor="black" stopOpacity="1" />
                    </RadialGradient>
                </Defs>

                {/* 화면 전체를 덮는 사각형을 그리되, 위에서 정의한 그라데이션(url#grad)으로 채움 */}
                <Rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="url(#grad)"
                />
            </Svg>
        </View>
    );
}
