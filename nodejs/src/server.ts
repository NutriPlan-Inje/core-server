import createApp from './app';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT || 3000;

(async function serverStart() {
    try {
        const { server } = await createApp();  // 서버 및 앱 생성

        server.listen(PORT, () => {
            console.log(`${PORT} 포트에서 서버가 시작되었습니다`);
        });
    } catch (error) {
        console.error('Error starting the server:', error);
        process.exit(1);  // 서버 시작 중 오류 발생 시 종료
    }
})();
