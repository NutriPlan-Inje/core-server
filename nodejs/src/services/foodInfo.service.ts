import { Inject, Service } from "typedi";
import FoodInfoDTO, { DeleteFoodInfoResponseDTO, FoodInfoResponseDTO } from "../dto/response/foodInfo";
import FoodInfoRepository from "../repositoryes/foodInfo.repository";
import Redis from "ioredis";

@Service()
export class FoodInfoService {
    constructor(
        @Inject(() => FoodInfoRepository) private readonly foodInfoRepository: FoodInfoRepository,
        @Inject('redis') private readonly redis : Redis
    ) {}

    async findFoodInfoById({ f_id }: { f_id: number }): Promise<FoodInfoResponseDTO> {
        try {
            const redisKey = `foodInfo:${f_id}`;
            const cachedFoodInfo = await this.redis.get(redisKey);

            if (cachedFoodInfo) {
                console.log(`✅ Redis에서 조회된 foodInfo: ${redisKey}`);
                const foodInfo: FoodInfoDTO = JSON.parse(cachedFoodInfo);
                return {
                    statusCode: 200,
                    message: "성공적으로 조회했습니다 (Redis 캐시)",
                    data: foodInfo
                };
            }

            console.log(`❌ Redis에서 발견되지 않음. DB에서 조회: ${f_id}`);
            const foodInfo: FoodInfoDTO = await this.foodInfoRepository.findFoodInfoById({ f_id });

            if (foodInfo === undefined) {
                throw new Error();
            }
            
            await this.redis.set(redisKey, JSON.stringify(foodInfo), "EX", 3600); // TTL 1시간
            console.log(`✅ Redis에 캐싱 완료: ${redisKey}`);

            return {
                statusCode: 200,
                message: "성공적으로 조회했습니다",
                data: foodInfo
            };
        } catch (error) {
            console.error(error);
            return {
                statusCode: 404,
                message: "조회에 실패했습니다",
                data: null
            } as FoodInfoResponseDTO;
        }
    }

    async deleteFoodInfoById({ f_id }: { f_id: number }): Promise<DeleteFoodInfoResponseDTO> {
        const redisKey = `foodInfo:${f_id}`;
        await this.redis.del(redisKey);
        console.log(`🗑️ Redis 캐시에서 삭제됨: ${redisKey}`);

        await this.foodInfoRepository.deleteFoodInfoById({ f_id });

        return {
            message: "삭제가 완료되었습니다",
            statusCode: 200,
        };
    }
}
