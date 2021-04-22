import { EntityRepository, Repository } from 'typeorm';
import { Question } from './question.entity';

@EntityRepository(Question)
export class QuestionRepository extends Repository<Question> {
  findOneByIdx(idx: number, isTemp: boolean): Promise<Question> {
    return this.createQueryBuilder()
      .where('idx = :idx', { idx })
      .andWhere('isTemp = :isTemp', { isTemp })
      .getOne();
  }

  findOneWithUserByIdx(idx: number, isTemp: boolean): Promise<Question> {
    return this.createQueryBuilder('question')
      .leftJoinAndSelect('question.user', 'user')
      .where('question.idx = :idx', { idx })
      .andWhere('question.isTemp = :isTemp', { isTemp })
      .getOne();
  }

  findAllAndCountCreatedAtDESC(isTemp: boolean): Promise<number> {
    return this.createQueryBuilder()
      .where('isTemp = :isTemp', { isTemp })
      .orderBy('createdAt', 'DESC')
      .getCount();
  }

  findAllWithUserOrderByAnswerCountDESC(
    page: number,
    limit: number,
    isTemp: boolean,
  ): Promise<Question[]> {
    return this.createQueryBuilder('question')
      .leftJoinAndSelect('question.user', 'user')
      .leftJoin('question.answers', 'answer')
      .addSelect('COUNT(answer.idx) as answerCount')
      .groupBy('question.idx')
      .where('question.isTemp = :isTemp', { isTemp })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('answerCount', 'DESC')
      .getMany();
  }

  findAllWithUserByUserIdxOrderByCreatedAtASC(
    page: number,
    limit: number,
    userIdx: number,
    isTemp: boolean,
  ): Promise<Question[]> {
    return this.createQueryBuilder('question')
      .leftJoinAndSelect('question.user', 'user')
      .where('isTemp = :isTemp', { isTemp })
      .andWhere('user.idx = :userIdx', { userIdx })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('question.createdAt', 'ASC')
      .getMany();
  }

  findAllWithUserOrderByCreatedAtASC(
    page: number,
    limit: number,
    isTemp: boolean,
  ): Promise<Question[]> {
    return this.createQueryBuilder('question')
      .leftJoinAndSelect('question.user', 'user')
      .where('isTemp = :isTemp', { isTemp })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('question.createdAt', 'DESC')
      .getMany();
  }
}
